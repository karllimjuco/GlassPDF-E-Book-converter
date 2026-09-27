'use client';

import { useCallback, useState } from 'react';
import { motion } from 'framer-motion';
import { Upload } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSettings } from '@/components/providers/SettingsProvider';

interface DropZoneProps {
  onFiles: (files: File[]) => void;
  accept?: string;
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
        'min-h-[180px] p-8 transition-all duration-300 backdrop-blur-md shadow-sm',
        // Dynamic theme styling
        'bg-white/35 dark:bg-white/5 border-sky-400/40 dark:border-white/20',
        'hover:bg-white/60 dark:hover:bg-white/10 hover:border-sky-500 dark:hover:border-sky-400/60',
        dragging && 'border-sky-500 bg-sky-500/15 scale-[1.01] shadow-lg',
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
        className="text-sky-600 dark:text-sky-400 drop-shadow-sm"
      >
        {icon ?? <Upload className="w-10 h-10" strokeWidth={1.75} />}
      </motion.div>
      <div className="text-center">
        <p className="text-sm font-bold text-slate-900 dark:text-white drop-shadow-sm">{label}</p>
        <p className="text-xs text-slate-600 dark:text-slate-300 font-medium mt-0.5">{sublabel}</p>
      </div>
    </label>
  );
}
