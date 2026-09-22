'use client';

import { useCallback, useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSettings } from '@/components/providers/SettingsProvider';

interface DropZoneProps {
  onFiles: (files: File[]) => void;
  accept?: string;       // e.g. ".pdf,application/pdf"
  multiple?: boolean;
  label?: string;
  sublabel?: string;
  className?: string;
  icon?: React.ReactNode;
}

export function DropZone({
  onFiles,
  accept = '.pdf,application/pdf',
  multiple = true,
  label = 'Drop files here',
  sublabel = 'or click to browse',
  className,
  icon,
}: DropZoneProps) {
  const [dragging, setDragging] = useState(false);
  const { reducedMotion } = useSettings();

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) onFiles(files);
    },
    [onFiles]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files ?? []);
      if (files.length > 0) onFiles(files);
      e.target.value = '';
    },
    [onFiles]
  );

  return (
    <label
      className={cn(
        'relative flex flex-col items-center justify-center gap-3',
        'rounded-2xl border-2 border-dashed cursor-pointer select-none',
        'min-h-[180px] p-8 transition-colors duration-200',
        dragging
          ? 'border-[var(--accent)] bg-[var(--accent)]/10'
          : 'border-white/20 dark:border-white/10 hover:border-[var(--accent)]/60',
        className
      )}
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
    >
      <input
        type="file"
        className="sr-only"
        accept={accept}
        multiple={multiple}
        onChange={handleChange}
      />
      <motion.div
        animate={dragging && !reducedMotion ? { scale: 1.15 } : { scale: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className="text-[var(--accent)]"
      >
        {icon ?? <Upload className="w-10 h-10" strokeWidth={1.5} />}
      </motion.div>
      <div className="text-center">
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="text-xs text-muted mt-0.5">{sublabel}</p>
      </div>
    </label>
  );
}
