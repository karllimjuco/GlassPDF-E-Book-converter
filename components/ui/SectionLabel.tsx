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
        'font-mono text-xs tracking-widest uppercase select-none',
        'text-[var(--accent)] opacity-80',
        className
      )}
    >
      {number} — {label}
    </span>
  );
}
