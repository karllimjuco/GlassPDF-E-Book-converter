'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove, SortableContext, useSortable, rectSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { X, GripVertical, Download, Loader2, Image as ImageIcon } from 'lucide-react';
import { DropZone } from '@/components/ui/DropZone';
import { SectionLabel } from '@/components/ui/SectionLabel';
import { ProcessingBadge } from '@/components/ui/StatusBadge';
import { imagesToPdf } from '@/lib/image-to-pdf';
import { downloadPdf } from '@/lib/pdf-merge';
import { addRecentFile, formatFileSize } from '@/lib/recent-files';
import { generateId } from '@/lib/utils';
import type { ImageFileItem, ProcessingStatus, FitMode } from '@/types';
import { useSettings } from '@/components/providers/SettingsProvider';

function SortableImage({ item, onRemove }: { item: ImageFileItem; onRemove: (id: string) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });
  const { reducedMotion } = useSettings();
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition: reducedMotion ? undefined : transition, opacity: isDragging ? 0.4 : 1 }}
      className="relative group w-24"
    >
      <div className="relative rounded-lg overflow-hidden border border-white/10">
        <img src={item.previewUrl} alt={item.name} className="w-full h-28 object-cover" draggable={false} />
        <button
          {...attributes} {...listeners}
          className="absolute top-1 left-1 p-1 rounded bg-black/50 opacity-0 group-hover:opacity-100 cursor-grab"
        >
          <GripVertical className="w-3 h-3 text-white" />
        </button>
        <button
          onClick={() => onRemove(item.id)}
          className="absolute top-1 right-1 p-1 rounded bg-black/50 hover:bg-red-500/80 opacity-0 group-hover:opacity-100 transition-all"
        >
          <X className="w-3 h-3 text-white" />
        </button>
      </div>
      <p className="text-xs text-center text-muted mt-1 truncate font-mono">{formatFileSize(item.sizeBytes)}</p>
    </div>
  );
}

export function ImageToPdfTool() {
  const [images, setImages] = useState<ImageFileItem[]>([]);
  const [fitMode, setFitMode] = useState<FitMode>('fit');
  const [status, setStatus] = useState<ProcessingStatus>('idle');
  const { reducedMotion } = useSettings();
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  const handleFiles = useCallback((files: File[]) => {
    const newItems: ImageFileItem[] = files
      .filter((f) => f.type.startsWith('image/'))
      .map((f) => ({
        id: generateId(),
        file: f,
        name: f.name,
        sizeBytes: f.size,
        previewUrl: URL.createObjectURL(f),
      }));
    setImages((prev) => [...prev, ...newItems]);
  }, []);

  const handleDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (over && active.id !== over.id) {
      setImages((prev) => {
        const oi = prev.findIndex((f) => f.id === active.id);
        const ni = prev.findIndex((f) => f.id === over.id);
        return arrayMove(prev, oi, ni);
      });
    }
  };

  const remove = (id: string) => {
    setImages((prev) => {
      const item = prev.find((i) => i.id === id);
      if (item) URL.revokeObjectURL(item.previewUrl);
      return prev.filter((i) => i.id !== id);
    });
  };

  const handleConvert = async () => {
    setStatus('processing');
    try {
      const bytes = await imagesToPdf(images.map((i) => i.file), fitMode);
      downloadPdf(bytes, `glasspdf-images-${Date.now()}.pdf`);
      addRecentFile({ name: `${images.length} images`, tool: 'Image to PDF', timestamp: Date.now(), sizeBytes: bytes.length });
      setStatus('done');
    } catch {
      setStatus('error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <SectionLabel number="04" label="IMAGE TO PDF" />
        <ProcessingBadge active={status === 'processing'} />
      </div>

      <DropZone
        onFiles={handleFiles}
        accept="image/png,image/jpeg,image/webp,.png,.jpg,.jpeg,.webp"
        multiple
        label="Drop images to convert"
        sublabel="PNG, JPG, WebP — drag to reorder"
        icon={<ImageIcon className="w-10 h-10" strokeWidth={1.5} />}
        className="h-40"
      />

      {images.length > 0 && (
        <div className="space-y-4">
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={images.map((i) => i.id)} strategy={rectSortingStrategy}>
              <div className="flex flex-wrap gap-3">
                {images.map((item) => (
                  <SortableImage key={item.id} item={item} onRemove={remove} />
                ))}
              </div>
            </SortableContext>
          </DndContext>

          {/* Fit mode */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-muted">Fit:</span>
            {(['fit', 'actual', 'stretch'] as FitMode[]).map((m) => (
              <button
                key={m}
                onClick={() => setFitMode(m)}
                className={`px-3 py-1 rounded-lg text-xs font-mono capitalize border transition-colors ${
                  fitMode === m
                    ? 'border-[var(--accent)] text-[var(--accent)] bg-[var(--accent)]/10'
                    : 'border-white/10 text-muted hover:border-white/20'
                }`}
              >
                {m}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-muted font-mono">{images.length} image{images.length !== 1 ? 's' : ''}</span>
            <button
              onClick={handleConvert}
              disabled={status === 'processing'}
              className="ml-auto flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--accent)] text-white text-sm font-medium
                hover:opacity-90 transition-opacity disabled:opacity-40"
            >
              {status === 'processing' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              Convert & Download
            </button>
            {status === 'done' && <span className="text-xs text-emerald-400 font-mono">✓ Downloaded</span>}
            {status === 'error' && <span className="text-xs text-red-400 font-mono">✗ Error</span>}
          </div>
        </div>
      )}
    </div>
  );
}
