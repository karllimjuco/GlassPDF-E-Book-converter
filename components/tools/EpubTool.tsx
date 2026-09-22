'use client';

import { useState, useCallback } from 'react';
import { DropZone } from '@/components/ui/DropZone';
import { SectionLabel } from '@/components/ui/SectionLabel';
import { ProcessingBadge } from '@/components/ui/StatusBadge';
import { extractTextByPage } from '@/lib/pdf-thumbnails';
import { buildEpub, downloadBlob } from '@/lib/epub-builder';
import { addRecentFile } from '@/lib/recent-files';
import { Download, FileText, Loader2, AlertTriangle } from 'lucide-react';
import type { ProcessingStatus } from '@/types';

export function EpubTool() {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [status, setStatus] = useState<ProcessingStatus>('idle');
  const [pageCount, setPageCount] = useState(0);

  const handleFile = useCallback(async (files: File[]) => {
    const f = files[0];
    if (!f) return;
    setFile(f);
    setTitle(f.name.replace(/\.pdf$/i, ''));
    // Quick page count
    try {
      const { getPdfPageCount } = await import('@/lib/pdf-thumbnails');
      const buf = await f.arrayBuffer();
      setPageCount(await getPdfPageCount(buf));
    } catch { /* ok */ }
  }, []);

  const handleConvert = async () => {
    if (!file) return;
    setStatus('processing');
    try {
      const buf = await file.arrayBuffer();
      const pages = await extractTextByPage(buf);
      const blob = await buildEpub(pages, title || file.name, author || 'GlassPDF');
      downloadBlob(blob, `${title || 'glasspdf'}.epub`);
      addRecentFile({ name: file.name, tool: 'PDF to EPUB', timestamp: Date.now(), sizeBytes: file.size });
      setStatus('done');
    } catch {
      setStatus('error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <SectionLabel number="03" label="PDF TO EPUB" />
        <ProcessingBadge active={status === 'processing'} />
      </div>

      {/* Disclaimer */}
      <div className="flex items-start gap-2.5 p-3 rounded-xl border border-amber-500/30 bg-amber-500/8">
        <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
        <p className="text-xs text-amber-300/80 leading-relaxed">
          <span className="font-semibold">Beta feature.</span> Best results on simple single-column text PDFs.
          Multi-column layouts, scanned documents, and image-heavy PDFs may produce poor EPUB output.
        </p>
      </div>

      {!file ? (
        <DropZone
          onFiles={handleFile}
          multiple={false}
          label="Drop a PDF to convert to EPUB"
          sublabel="Text-based PDFs only for best results"
          className="h-40"
        />
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <FileText className="w-4 h-4 text-[var(--accent)]" />
            <span className="text-sm text-foreground font-medium">{file.name}</span>
            {pageCount > 0 && <span className="text-xs text-muted font-mono">{pageCount} pages</span>}
            <button
              onClick={() => { setFile(null); setStatus('idle'); setPageCount(0); }}
              className="ml-auto text-xs text-muted hover:text-foreground transition-colors"
            >
              Change file
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-mono uppercase tracking-widest text-muted">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Book title"
                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-foreground
                  placeholder:text-muted focus:outline-none focus:border-[var(--accent)]/60 transition-colors"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-mono uppercase tracking-widest text-muted">Author</label>
              <input
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="Author name"
                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-foreground
                  placeholder:text-muted focus:outline-none focus:border-[var(--accent)]/60 transition-colors"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleConvert}
              disabled={status === 'processing'}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--accent)] text-white text-sm font-medium
                hover:opacity-90 transition-opacity disabled:opacity-40"
            >
              {status === 'processing' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              Convert to EPUB
            </button>
            {status === 'done' && <span className="text-xs text-emerald-400 font-mono">✓ Downloaded</span>}
            {status === 'error' && <span className="text-xs text-red-400 font-mono">✗ Conversion failed</span>}
          </div>
        </div>
      )}
    </div>
  );
}
