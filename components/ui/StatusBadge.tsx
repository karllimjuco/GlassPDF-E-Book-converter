'use client';

import { Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSettings } from '@/components/providers/SettingsProvider';

interface StatusBadgeProps {
  visible?: boolean;
  text?: string;
}

export function StatusBadge({
  visible = true,
  text = 'Processing locally · Your files never leave this device',
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
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full
            bg-emerald-500/10 border border-emerald-500/30 text-emerald-400
            text-xs font-mono tracking-wide select-none"
        >
          <Shield className="w-3.5 h-3.5" strokeWidth={2} />
          {text}
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
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full
            bg-[var(--accent)]/15 border border-[var(--accent)]/40
            text-[var(--accent)] text-xs font-mono"
        >
          <span className="relative flex h-2 w-2">
            {!reducedMotion && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--accent)] opacity-75" />
            )}
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--accent)]" />
          </span>
          Processing locally…
        </motion.div>
      )}
    </AnimatePresence>
  );
}
