'use client';

import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useSettings } from '@/components/providers/SettingsProvider';

interface GlassCardProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
  children: React.ReactNode;
  hoverable?: boolean;
  className?: string;
  noPadding?: boolean;
}

export function GlassCard({
  children,
  hoverable = false,
  className,
  noPadding = false,
  ...props
}: GlassCardProps) {
  const { reducedMotion } = useSettings();

  return (
    <motion.div
      className={cn(
        'specular-highlight relative rounded-2xl overflow-hidden',
        // Light mode glass
        'bg-white/40 backdrop-blur-md border border-white/35 shadow-lg shadow-sky-950/5',
        // Dark mode glass
        'dark:bg-white/10 dark:backdrop-blur-md dark:border-white/12 dark:shadow-xl dark:shadow-black/25',
        hoverable && [
          'cursor-pointer transition-all duration-300',
          'hover:-translate-y-1 hover:bg-white/60 dark:hover:bg-white/20',
          'hover:shadow-xl hover:shadow-sky-900/10 dark:hover:shadow-black/40',
        ],
        noPadding ? '' : 'p-6',
        className
      )}
      whileHover={hoverable && !reducedMotion ? { scale: 1.015 } : undefined}
      transition={{ type: 'spring', stiffness: 350, damping: 25 }}
      {...props}
    >
      {children}
    </motion.div>
  );
}
