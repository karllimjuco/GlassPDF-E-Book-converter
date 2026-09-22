'use client';

import Link from 'next/link';
import { motion, type Variants } from 'framer-motion';
import {
  Merge, Scissors, BookOpen, Image, Shield, ArrowRight,
  Clock, Trash2
} from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { SectionLabel } from '@/components/ui/SectionLabel';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useSettings } from '@/components/providers/SettingsProvider';
import { getRecentFiles, removeRecentFile, formatFileSize, formatTimestamp } from '@/lib/recent-files';
import { useState, useEffect } from 'react';
import type { RecentFile } from '@/types';

const TOOLS = [
  {
    number: '01',
    label: 'MERGE',
    title: 'Merge PDF',
    description: 'Combine multiple PDFs into one. Drag to reorder.',
    icon: Merge,
    href: '/tools/merge',
    accent: true,
  },
  {
    number: '02',
    label: 'SPLIT',
    title: 'Split & Organize',
    description: 'Reorder, rotate, and delete pages visually.',
    icon: Scissors,
    href: '/tools/split',
    accent: false,
  },
  {
    number: '03',
    label: 'EPUB',
    title: 'PDF to EPUB',
    description: 'Convert text PDFs to reflowable EPUB format.',
    icon: BookOpen,
    href: '/tools/epub',
    accent: false,
  },
  {
    number: '04',
    label: 'IMAGE',
    title: 'Image to PDF',
    description: 'Turn PNG, JPG, or WebP images into a PDF.',
    icon: Image,
    href: '/tools/image-to-pdf',
    accent: false,
  },
  {
    number: '05',
    label: 'SECURITY',
    title: 'Watermark & Security',
    description: 'Add text watermarks and password protection.',
    icon: Shield,
    href: '/tools/watermark',
    accent: false,
  },
] as const;

const containerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] } },
};

export default function HomePage() {
  const { reducedMotion } = useSettings();
  const [recent, setRecent] = useState<RecentFile[]>([]);

  useEffect(() => {
    setRecent(getRecentFiles());
  }, []);

  const handleRemoveRecent = (id: string) => {
    removeRecentFile(id);
    setRecent(getRecentFiles());
  };

  return (
    <div className="aero-home max-w-7xl mx-auto px-6 py-16 space-y-16">
      {/* Hero */}
      <motion.div
        initial={reducedMotion ? {} : { opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center space-y-4 max-w-2xl mx-auto"
      >
        <StatusBadge />
        <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-foreground mt-4">
          PDF tools that respect<br />
          <span className="text-[var(--accent)]">your privacy.</span>
        </h1>
        <p className="text-base text-muted leading-relaxed">
          Every operation runs entirely in your browser.
          Your files never leave your device.
        </p>
      </motion.div>

      {/* Tool Cards */}
      <motion.div
        variants={reducedMotion ? undefined : containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4"
      >
        {TOOLS.map((tool) => {
          const Icon = tool.icon;
          return (
            <motion.div key={tool.number} variants={reducedMotion ? undefined : cardVariants}>
              <Link href={tool.href} className="block h-full group">
                <GlassCard hoverable className="h-full flex flex-col gap-4 min-h-[200px]">
                  <SectionLabel number={tool.number} label={tool.label} />

                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center
                    ${tool.accent ? 'bg-[var(--accent)]' : 'bg-[var(--accent)]/15'}`}>
                    <Icon className={`w-5 h-5 ${tool.accent ? 'text-white' : 'text-[var(--accent)]'}`} strokeWidth={1.75} />
                  </div>

                  <div className="flex-1 space-y-1.5">
                    <h2 className="text-sm font-semibold text-foreground">{tool.title}</h2>
                    <p className="text-xs text-muted leading-relaxed">{tool.description}</p>
                  </div>

                  <div className="flex items-center gap-1 text-xs text-[var(--accent)] opacity-0 group-hover:opacity-100 transition-opacity">
                    Open tool <ArrowRight className="w-3 h-3" />
                  </div>
                </GlassCard>
              </Link>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Recent Files */}
      {recent.length > 0 && (
        <motion.div
          initial={reducedMotion ? {} : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-muted">
              <Clock className="w-3.5 h-3.5" /> Recent Activity
            </span>
            <button
              onClick={() => { localStorage.removeItem('glasspdf_recent'); setRecent([]); }}
              className="text-xs text-muted hover:text-foreground transition-colors font-mono"
            >
              Clear all
            </button>
          </div>
          <GlassCard noPadding className="divide-y divide-white/5">
            {recent.map((f) => (
              <div key={f.id} className="flex items-center gap-3 px-5 py-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground truncate font-medium">{f.name}</p>
                  <p className="text-xs text-muted font-mono">
                    {f.tool} · {formatFileSize(f.sizeBytes)} · {formatTimestamp(f.timestamp)}
                  </p>
                </div>
                <button
                  onClick={() => handleRemoveRecent(f.id)}
                  className="p-1.5 rounded text-muted hover:text-red-400 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </GlassCard>
        </motion.div>
      )}

      {/* Footer */}
      <footer className="text-center text-xs text-muted font-mono pb-8 space-y-1">
        <p>GlassPDF · All processing is 100% client-side</p>
        <p className="opacity-50">Built with Next.js · pdf-lib · pdfjs-dist · jszip</p>
      </footer>
    </div>
  );
}
