'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
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
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { X, GripVertical, Download, FileText, Loader2, Merge } from 'lucide-react';
import { DropZone } from '@/components/ui/DropZone';
import { SectionLabel } from '@/components/ui/SectionLabel';
import { ProcessingBadge } from '@/components/ui/StatusBadge';
import { renderPageToDataUrl } from '@/lib/pdf-thumbnails';
import { mergePdfs, downloadPdf } from '@/lib/pdf-merge';
import { addRecentFile, formatFileSize } from '@/lib/recent-files';
import { generateId } from '@/lib/utils';
import type { PdfFileItem, ProcessingStatus } from '@/types';
import { useSettings } from '@/components/providers/SettingsProvider';

interface SortableFileRowProps {
  item: PdfFileItem;
  onRemove: (id: string) => void;
}

function SortableFileRow({ item, onRemove }: SortableFileRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });
  const { reducedMotion } = useSettings();
  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition: reducedMotion ? undefined : transition,
        opacity: isDragging ? 0.4 : 1,
      }}
      className="flex items-center gap-3 p-3.5 rounded-xl border border-white/40 dark:border-white/10 bg-white/50 dark:bg-white/10 backdrop-blur-sm shadow-sm hover:bg-white/70 dark:hover:bg-white/20 transition-all"
    >
      {/* Thumbnail */}
      {item.thumbnailUrl ? (
        <img src={item.thumbnailUrl} alt={item.name} className="w-9 h-11 object-cover rounded shadow-sm border border-white/40" />
      ) : (
        <div className="w-9 h-11 bg-sky-500/10 dark:bg-white/10 rounded flex items-center justify-center border border-white/30">
          <FileText className="w-5 h-5 text-sky-600 dark:text-sky-300" />
        </div>
      )}

      <div className="flex-1 min-w-0">
        <p className="text-sm text-slate-900 dark:text-white font-bold truncate">{item.name}</p>
        <p className="text-xs text-slate-600 dark:text-slate-300 font-mono mt-0.5">
          {formatFileSize(item.sizeBytes)}
          {item.pageCount != null && ` · ${item.pageCount} pages`}
        </p>
      </div>

      <button
        {...attributes}
        {...listeners}
        className="p-2 rounded-lg cursor-grab text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-white/40 transition-colors"
        aria-label="Drag to reorder"
      >
        <GripVertical className="w-4 h-4" />
      </button>
      <button
        onClick={() => onRemove(item.id)}
        className="p-2 rounded-lg text-slate-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-white/40 transition-colors"
        aria-label="Remove file"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

export function MergeTool() {
  const [files, setFiles] = useState<PdfFileItem[]>([]);
  const [status, setStatus] = useState<ProcessingStatus>('idle');
  const { reducedMotion } = useSettings();
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  const handleFiles = useCallback(async (incoming: File[]) => {
    const newItems: PdfFileItem[] = await Promise.all(
      incoming.map(async (f) => {
        const id = generateId();
        const buffer = await f.arrayBuffer();
        let thumbnailUrl: string | undefined;
        let pageCount: number | undefined;
        try {
          const { getPdfPageCount, renderPageToDataUrl } = await import('@/lib/pdf-thumbnails');
          pageCount = await getPdfPageCount(buffer.slice(0));
          thumbnailUrl = await renderPageToDataUrl(buffer.slice(0), 0, 0.8);
        } catch { /* thumbnail optional */ }
        return { id, file: f, name: f.name, sizeBytes: f.size, thumbnailUrl, pageCount };
      })
    );
    setFiles((prev) => [...prev, ...newItems]);
  }, []);

  const handleDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (over && active.id !== over.id) {
      setFiles((prev) => {
        const oi = prev.findIndex((f) => f.id === active.id);
        const ni = prev.findIndex((f) => f.id === over.id);
        return arrayMove(prev, oi, ni);
      });
    }
  };

  const remove = (id: string) => setFiles((prev) => prev.filter((f) => f.id !== id));

  const handleMerge = async () => {
    setStatus('processing');
    try {
      const bytes = await mergePdfs(files.map((f) => f.file));
      downloadPdf(bytes, `glasspdf-merged-${Date.now()}.pdf`);
      addRecentFile({
        name: `${files.length} files merged`,
        tool: 'Merge PDF',
        timestamp: Date.now(),
        sizeBytes: bytes.length,
      });
      setStatus('done');
    } catch {
      setStatus('error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <SectionLabel number="01" label="MERGE PDF" />
        <ProcessingBadge active={status === 'processing'} />
      </div>

      <DropZone
        onFiles={handleFiles}
        multiple
        label="Drop PDF files to merge"
        sublabel="Add multiple files, then drag to reorder"
        className="h-40"
      />

      {files.length > 0 && (
        <div className="space-y-4">
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={files.map((f) => f.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-2">
                {files.map((item) => (
                  <SortableFileRow key={item.id} item={item} onRemove={remove} />
                ))}
              </div>
            </SortableContext>
          </DndContext>

          <div className="flex items-center gap-3 pt-2">
            <span className="text-xs text-slate-700 dark:text-slate-300 font-mono font-semibold">{files.length} file{files.length !== 1 ? 's' : ''} selected</span>
            <button
              onClick={handleMerge}
              disabled={files.length < 2 || status === 'processing'}
              className="ml-auto flex items-center gap-2 px-6 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-sm font-bold shadow-md shadow-sky-600/30 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {status === 'processing' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Merge className="w-4 h-4" />}
              Merge & Download
            </button>
            {status === 'done' && <span className="text-xs text-emerald-600 dark:text-emerald-400 font-mono font-bold">✓ Downloaded</span>}
            {status === 'error' && <span className="text-xs text-red-600 dark:text-red-400 font-mono font-bold">✗ Error</span>}
          </div>
        </div>
      )}
    </div>
  );
}
