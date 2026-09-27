'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion, type Variants } from 'framer-motion';
import {
  ArrowRight,
  Clock,
  Trash2,
  ShieldCheck,
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
    description: 'Combine multiple PDFs into one seamless document. Drag to reorder.',
    iconPath: '/assets/icons/folder.png',
    href: '/tools/merge',
  },
  {
    number: '02',
    label: 'SPLIT',
    title: 'Split & Organize',
    description: 'Reorder, rotate 90°, and delete individual pages visually.',
    iconPath: '/assets/icons/pdf.png',
    href: '/tools/split',
  },
  {
    number: '03',
    label: 'EPUB',
    title: 'PDF to EPUB',
    description: 'Convert text-based PDFs to reflowable, readable e-book EPUBs.',
    iconPath: '/assets/icons/search.png',
    href: '/tools/epub',
  },
  {
    number: '04',
    label: 'IMAGE',
    title: 'Image to PDF',
    description: 'Turn PNG, JPG, or WebP images into a crisp formatted PDF document.',
    iconPath: '/assets/icons/printer.png',
    href: '/tools/image-to-pdf',
  },
  {
    number: '05',
    label: 'SECURITY',
    title: 'Watermark & Security',
    description: 'Add custom text watermarks and AES-256 client password protection.',
    // 5th icon flag: Karl noted he'll provide 2-3 more icons; we render a glossy iridescent bubble shield
    iconPath: null,
    href: '/tools/watermark',
  },
] as const;

const containerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.25, 0.1, 0.25, 1] } },
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
    <div className="max-w-7xl mx-auto px-6 py-12 md:py-16 space-y-16">
      {/* Hero Section */}
      <motion.div
        initial={reducedMotion ? {} : { opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center space-y-5 max-w-3xl mx-auto"
      >
        <div>
          <StatusBadge text="Pure Client-Side · $0 Cost · 100% Private" />
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold font-heading tracking-tight text-slate-900 dark:text-white drop-shadow-[0_2px_12px_rgba(255,255,255,0.9)] dark:drop-shadow-[0_4px_16px_rgba(0,0,0,0.85)] leading-[1.1]">
          PDF tools that respect{' '}
          <span className="text-sky-600 dark:text-sky-400 font-extrabold inline-block">
            your privacy.
          </span>
        </h1>

        <p className="text-base sm:text-lg text-slate-800 dark:text-slate-100 font-medium leading-relaxed max-w-xl mx-auto drop-shadow-[0_1px_4px_rgba(255,255,255,0.8)] dark:drop-shadow-[0_2px_8px_rgba(0,0,0,0.7)]">
          Every operation runs locally in your browser with zero server uploads. Fast, private, and effortless.
        </p>
      </motion.div>

      {/* 5 Cohesive Glass Tool Cards */}
      <motion.div
        variants={reducedMotion ? undefined : containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5"
      >
        {TOOLS.map((tool) => {
          return (
            <motion.div key={tool.number} variants={reducedMotion ? undefined : cardVariants}>
              <Link href={tool.href} className="block h-full group">
                <GlassCard hoverable className="h-full flex flex-col justify-between gap-5 min-h-[260px]">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <SectionLabel number={tool.number} label={tool.label} />
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-700 dark:text-sky-300 border border-sky-400/20">
                        LOCAL
                      </span>
                    </div>

                    {/* Glossy Iridescent Bubble Icon */}
                    <div className="h-16 flex items-center justify-start py-1">
                      {tool.iconPath ? (
                        <div className="relative w-14 h-14 transition-transform duration-300 group-hover:scale-110 drop-shadow-[0_8px_16px_rgba(56,189,248,0.25)]">
                          <Image
                            src={tool.iconPath}
                            alt={tool.title}
                            width={120}
                            height={160}
                            className="w-full h-full object-contain"
                          />
                        </div>
                      ) : (
                        <div className="relative w-14 h-14 rounded-2xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110 bg-gradient-to-tr from-sky-400/30 via-pink-400/30 to-purple-400/40 border border-white/60 shadow-[0_6px_16px_rgba(56,189,248,0.3),inset_0_2px_4px_rgba(255,255,255,0.7)] backdrop-blur-sm">
                          <ShieldCheck className="w-8 h-8 text-sky-600 dark:text-sky-200 drop-shadow-sm" />
                        </div>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <h2 className="text-base sm:text-lg font-bold font-heading text-slate-900 dark:text-white group-hover:text-sky-600 dark:group-hover:text-sky-300 transition-colors">
                        {tool.title}
                      </h2>
                      <p className="text-xs text-slate-700 dark:text-slate-200 font-medium leading-relaxed">
                        {tool.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs font-bold text-sky-700 dark:text-sky-300 pt-2 border-t border-black/5 dark:border-white/10 group-hover:translate-x-1 transition-transform">
                    <span>Open tool</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </GlassCard>
              </Link>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Recent Files Panel */}
      {recent.length > 0 && (
        <motion.div
          initial={reducedMotion ? {} : { opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-4 max-w-4xl mx-auto"
        >
          <div className="flex items-center justify-between px-1">
            <span className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-widest text-slate-800 dark:text-slate-200 drop-shadow-sm">
              <Clock className="w-4 h-4 text-sky-600 dark:text-sky-400" /> Recent Activity (Local Only)
            </span>
            <button
              onClick={() => { localStorage.removeItem('glasspdf_recent'); setRecent([]); }}
              className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300 hover:text-red-500 dark:hover:text-red-400 transition-colors px-3 py-1 rounded-lg bg-white/30 dark:bg-white/10 border border-white/30 dark:border-white/10"
            >
              Clear history
            </button>
          </div>

          <GlassCard noPadding className="p-4 space-y-2.5">
            {recent.map((f) => (
              <div
                key={f.id}
                className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl bg-white/50 dark:bg-white/10 backdrop-blur-sm border border-white/40 dark:border-white/10 hover:bg-white/70 dark:hover:bg-white/20 transition-all shadow-sm"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{f.name}</p>
                  <p className="text-xs font-mono text-slate-600 dark:text-slate-300 mt-0.5">
                    <span className="font-semibold text-sky-700 dark:text-sky-300">{f.tool}</span> · {formatFileSize(f.sizeBytes)} · {formatTimestamp(f.timestamp)}
                  </p>
                </div>
                <button
                  onClick={() => handleRemoveRecent(f.id)}
                  className="p-2 rounded-lg text-slate-500 hover:text-red-500 dark:text-slate-400 dark:hover:text-red-400 hover:bg-white/50 dark:hover:bg-white/10 transition-colors"
                  aria-label="Remove item"
                  title="Remove"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </GlassCard>
        </motion.div>
      )}

      {/* Footer */}
      <footer className="text-center text-xs font-medium text-slate-700 dark:text-slate-300 py-8 space-y-1 drop-shadow-sm">
        <p className="font-semibold">GlassPDF · 100% Client-Side Private PDF Utility Suite</p>
        <p className="text-[11px] opacity-80">Built with Next.js, pdf-lib, pdfjs-dist & jszip</p>
      </footer>
    </div>
  );
}
