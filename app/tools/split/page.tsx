'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { SplitTool } from '@/components/tools/SplitTool';

export default function SplitPage() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-12 space-y-6">
      <Link href="/" className="inline-flex items-center gap-2 text-xs text-muted hover:text-foreground transition-colors font-mono">
        <ArrowLeft className="w-3.5 h-3.5" /> Back to dashboard
      </Link>
      <GlassCard>
        <SplitTool />
      </GlassCard>
    </div>
  );
}
