'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { ImageToPdfTool } from '@/components/tools/ImageToPdfTool';

export default function ImageToPdfPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-12 space-y-6">
      <Link
        href="/"
        className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/50 dark:bg-white/10 backdrop-blur-md border border-white/40 dark:border-white/15 text-xs font-mono font-bold text-slate-800 dark:text-white hover:bg-white/80 dark:hover:bg-white/20 transition-all shadow-sm"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Back to dashboard
      </Link>
      <GlassCard>
        <ImageToPdfTool />
      </GlassCard>
    </div>
  );
}
