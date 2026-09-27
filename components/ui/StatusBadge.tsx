'use client';

import { Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSettings } from '@/components/providers/SettingsProvider';

interface StatusBadgeProps {
  visible?: boolean;
  text?: string;
  className?: string;
}

export function StatusBadge({
  visible = true,
  text = 'Processing locally · Your files never leave this device',
  className,
}: StatusBadgeProps) {
  const { reducedMotion } = useSettings();
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={reducedMotion ? {} : { opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reducedMotion ? {} : { opacity: 0, y: -6 }}
          transition={{ duration: 0.25 }}
          className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full select-none
            bg-white/65 dark:bg-white/10 backdrop-blur-md
            border border-white/50 dark:border-white/20
            text-slate-800 dark:text-emerald-300 shadow-sm
            text-xs font-semibold tracking-wide ${className ?? ''}`}
        >
          <Shield className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" strokeWidth={2.2} />
          <span>{text}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function ProcessingBadge({ active }: { active: boolean }) {
  const { reducedMotion } = useSettings();
  return (
    <AnimatePresence>
      {active && (
        <motion.div
          initial={reducedMotion ? {} : { opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full
            bg-sky-500/20 dark:bg-white/15 backdrop-blur-md
            border border-sky-400/50 dark:border-white/30
            text-sky-900 dark:text-sky-200 text-xs font-mono font-bold shadow-sm"
        >
          <span className="relative flex h-2 w-2">
            {!reducedMotion && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75" />
            )}
            <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-500" />
          </span>
          Processing locally…
        </motion.div>
      )}
    </AnimatePresence>
  );
}
