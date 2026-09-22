'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  useSortable,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { X, RotateCw, GripVertical, Download, FileText, Loader2 } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { DropZone } from '@/components/ui/DropZone';
import { SectionLabel } from '@/components/ui/SectionLabel';
import { StatusBadge, ProcessingBadge } from '@/components/ui/StatusBadge';
import { renderAllPages } from '@/lib/pdf-thumbnails';
import { reassemblePages, downloadPdf } from '@/lib/pdf-merge';
import { addRecentFile, formatFileSize } from '@/lib/recent-files';
import { generateId } from '@/lib/utils';
import type { PdfPageItem, ProcessingStatus } from '@/types';
import { useSettings } from '@/components/providers/SettingsProvider';

interface SortablePageProps {
  item: PdfPageItem;
  onRotate: (id: string) => void;
  onDelete: (id: string) => void;
}

function SortablePage({ item, onRotate, onDelete }: SortablePageProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });
  const { reducedMotion } = useSettings();

  return (
    <motion.div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition: reducedMotion ? undefined : transition,
        opacity: isDragging ? 0.4 : item.deleted ? 0.2 : 1,
        zIndex: isDragging ? 50 : undefined,
      }}
      className="relative group"
      layout={!reducedMotion}
    >
      {!item.deleted && (
        <div className="w-28 flex flex-col gap-1.5">
          {/* Thumbnail */}
          <div className="relative rounded-lg overflow-hidden border border-white/10 bg-white/5">
            {item.thumbnailUrl ? (
              <img
                src={item.thumbnailUrl}
                alt={`Page ${item.pageIndex + 1}`}
                className="w-full object-cover"
                style={{ transform: `rotate(${item.rotation}deg)`, transition: 'transform 0.3s' }}
                draggable={false}
              />
            ) : (
              <div className="w-full h-36 flex items-center justify-center">
                <Loader2 className="w-5 h-5 animate-spin text-muted" />
              </div>
            )}
            {/* Drag handle */}
            <button
              {...attributes}
              {...listeners}
              className="absolute top-1 left-1 p-1 rounded bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab"
            >
              <GripVertical className="w-3 h-3 text-white" />
            </button>
            {/* Action buttons */}
            <div className="absolute top-1 right-1 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => onRotate(item.id)}
                className="p-1 rounded bg-black/40 hover:bg-[var(--accent)]/80 transition-colors"
              >
                <RotateCw className="w-3 h-3 text-white" />
              </button>
              <button
                onClick={() => onDelete(item.id)}
                className="p-1 rounded bg-black/40 hover:bg-red-500/80 transition-colors"
              >
                <X className="w-3 h-3 text-white" />
              </button>
            </div>
          </div>
          <span className="text-xs text-center text-muted font-mono">
            p.{item.pageIndex + 1}
          </span>
        </div>
      )}
    </motion.div>
  );
}

export function SplitTool() {
  const [file, setFile] = useState<File | null>(null);
  const [pages, setPages] = useState<PdfPageItem[]>([]);
  const [status, setStatus] = useState<ProcessingStatus>('idle');
  const [progress, setProgress] = useState(0);
  const { reducedMotion } = useSettings();

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  const handleFile = useCallback(async (files: File[]) => {
    const f = files[0];
    if (!f) return;
    setFile(f);
    setStatus('loading');
    setProgress(0);

    try {
      const buffer = await f.arrayBuffer();
      const urls = await renderAllPages(buffer, 0.6, (done, total) => {
        setProgress(Math.round((done / total) * 100));
      });
      const items: PdfPageItem[] = urls.map((url, i) => ({
        id: generateId(),
        pageIndex: i,
        rotation: 0,
        deleted: false,
        thumbnailUrl: url,
      }));
      setPages(items);
      setStatus('idle');
    } catch {
      setStatus('error');
    }
  }, []);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setPages((prev) => {
        const oldIdx = prev.findIndex((p) => p.id === active.id);
        const newIdx = prev.findIndex((p) => p.id === over.id);
        return arrayMove(prev, oldIdx, newIdx);
      });
    }
  };

  const rotate = (id: string) => {
    setPages((prev) =>
      prev.map((p) => (p.id === id ? { ...p, rotation: (p.rotation + 90) % 360 } : p))
    );
  };

  const deleteP = (id: string) => {
    setPages((prev) => prev.map((p) => (p.id === id ? { ...p, deleted: true } : p)));
  };

  const handleDownload = async () => {
    if (!file) return;
    setStatus('processing');
    try {
      const bytes = await reassemblePages(file, pages);
      downloadPdf(bytes, `glasspdf-split-${Date.now()}.pdf`);
      addRecentFile({ name: file.name, tool: 'Split & Organize', timestamp: Date.now(), sizeBytes: file.size });
      setStatus('done');
    } catch {
      setStatus('error');
    }
  };

  const activePages = pages.filter((p) => !p.deleted);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <SectionLabel number="02" label="SPLIT & ORGANIZE" />
        <ProcessingBadge active={status === 'processing' || status === 'loading'} />
      </div>

      {!file ? (
        <DropZone
          onFiles={handleFile}
          multiple={false}
          label="Drop a PDF to split and reorder"
          sublabel="or click to browse"
          className="h-48"
        />
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <FileText className="w-4 h-4 text-[var(--accent)]" />
            <span className="text-sm text-foreground font-medium">{file.name}</span>
            <span className="text-xs text-muted font-mono">{activePages.length} pages active</span>
            <button
              onClick={() => { setFile(null); setPages([]); setStatus('idle'); }}
              className="ml-auto text-xs text-muted hover:text-foreground transition-colors"
            >
              Change file
            </button>
          </div>

          {status === 'loading' && (
            <div className="space-y-2">
              <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                <motion.div
                  className="h-full bg-[var(--accent)] rounded-full"
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.2 }}
                />
              </div>
              <p className="text-xs text-muted font-mono text-center">Rendering pages… {progress}%</p>
            </div>
          )}

          {pages.length > 0 && (
            <div className="overflow-x-auto pb-3">
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={pages.filter(p => !p.deleted).map(p => p.id)} strategy={horizontalListSortingStrategy}>
                  <div className="flex gap-3 min-w-max">
                    {pages.filter(p => !p.deleted).map((item) => (
                      <SortablePage key={item.id} item={item} onRotate={rotate} onDelete={deleteP} />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              onClick={handleDownload}
              disabled={status === 'processing' || activePages.length === 0}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--accent)] text-white text-sm font-medium
                hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {status === 'processing' ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              Download PDF
            </button>
            {status === 'done' && (
              <span className="text-xs text-emerald-400 font-mono self-center">✓ Downloaded</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
