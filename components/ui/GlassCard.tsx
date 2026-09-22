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
        'glass rounded-2xl border',
        noPadding ? '' : 'p-6',
        hoverable && 'cursor-pointer',
        className
      )}
      whileHover={hoverable && !reducedMotion ? { y: -4, scale: 1.015 } : undefined}
      transition={{ type: 'spring', stiffness: 300, damping: 24 }}
      {...props}
    >
      {children}
    </motion.div>
  );
}
