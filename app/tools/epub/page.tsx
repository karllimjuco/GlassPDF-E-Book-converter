'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { EpubTool } from '@/components/tools/EpubTool';

export default function EpubPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-12 space-y-6">
      <Link href="/" className="inline-flex items-center gap-2 text-xs text-muted hover:text-foreground transition-colors font-mono">
        <ArrowLeft className="w-3.5 h-3.5" /> Back to dashboard
      </Link>
      <GlassCard>
        <EpubTool />
      </GlassCard>
    </div>
  );
}
