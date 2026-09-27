import { cn } from '@/lib/utils';

interface SectionLabelProps {
  number: string; // e.g. "01"
  label: string;  // e.g. "MERGE"
  className?: string;
}

export function SectionLabel({ number, label, className }: SectionLabelProps) {
  return (
    <span
      className={cn(
        'font-mono text-xs font-bold tracking-widest uppercase select-none',
        'text-sky-700 dark:text-sky-300 drop-shadow-sm',
        className
      )}
    >
      {number} — {label}
    </span>
  );
}
