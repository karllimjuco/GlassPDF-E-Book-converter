'use client';

import { useState, useCallback, useEffect } from 'react';
import { DropZone } from '@/components/ui/DropZone';
import { SectionLabel } from '@/components/ui/SectionLabel';
import { ProcessingBadge } from '@/components/ui/StatusBadge';
import { applyWatermark } from '@/lib/pdf-watermark';
import { downloadPdf } from '@/lib/pdf-merge';
import { renderPageToDataUrl } from '@/lib/pdf-thumbnails';
import { addRecentFile } from '@/lib/recent-files';
import { Download, FileText, Loader2, Eye, EyeOff, Lock } from 'lucide-react';
import type { ProcessingStatus, WatermarkOptions, PasswordOptions } from '@/types';

const SWATCH_COLORS = ['#ffffff', '#000000', '#FF3B3B', '#FFCC00', '#0066FF', '#00CC66'];

const DEFAULT_WATERMARK: WatermarkOptions = {
  text: 'CONFIDENTIAL',
  opacity: 0.3,
  angle: -45,
  fontSize: 48,
  color: '#ffffff',
  tileAll: true,
};

const DEFAULT_PASSWORD: PasswordOptions = {
  enabled: false,
  userPassword: '',
  ownerPassword: '',
};

export function WatermarkTool() {
  const [file, setFile] = useState<File | null>(null);
  const [wm, setWm] = useState<WatermarkOptions>(DEFAULT_WATERMARK);
  const [pw, setPw] = useState<PasswordOptions>(DEFAULT_PASSWORD);
  const [status, setStatus] = useState<ProcessingStatus>('idle');
  const [preview, setPreview] = useState<string | null>(null);
  const [showOwnerPw, setShowOwnerPw] = useState(false);

  const handleFile = useCallback(async (files: File[]) => {
    const f = files[0];
    if (!f) return;
    setFile(f);
    try {
      const buf = await f.arrayBuffer();
      const url = await renderPageToDataUrl(buf, 0, 1.0);
      setPreview(url);
    } catch { /* no preview */ }
  }, []);

  const handleConvert = async () => {
    if (!file) return;
    setStatus('processing');
    try {
      const bytes = await applyWatermark(file, wm, pw);
      downloadPdf(bytes, `glasspdf-watermarked-${Date.now()}.pdf`);
      addRecentFile({ name: file.name, tool: 'Watermark & Security', timestamp: Date.now(), sizeBytes: file.size });
      setStatus('done');
    } catch {
      setStatus('error');
    }
  };

  const setWmField = <K extends keyof WatermarkOptions>(k: K, v: WatermarkOptions[K]) =>
    setWm((prev) => ({ ...prev, [k]: v }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <SectionLabel number="05" label="WATERMARK & SECURITY" />
        <ProcessingBadge active={status === 'processing'} />
      </div>

      {!file ? (
        <DropZone onFiles={handleFile} multiple={false} label="Drop a PDF to watermark" className="h-40" />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Controls */}
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <FileText className="w-4 h-4 text-[var(--accent)]" />
              <span className="text-sm font-medium text-foreground truncate">{file.name}</span>
              <button onClick={() => { setFile(null); setPreview(null); setStatus('idle'); }}
                className="ml-auto text-xs text-muted hover:text-foreground">Change</button>
            </div>

            {/* Watermark text */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono uppercase tracking-widest text-muted">Watermark Text</label>
              <input type="text" value={wm.text} onChange={(e) => setWmField('text', e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-foreground
                  focus:outline-none focus:border-[var(--accent)]/60 transition-colors" />
            </div>

            {/* Color swatches */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono uppercase tracking-widest text-muted">Color</label>
              <div className="flex gap-2">
                {SWATCH_COLORS.map((c) => (
                  <button key={c} onClick={() => setWmField('color', c)}
                    className={`w-7 h-7 rounded-full border-2 transition-all ${wm.color === c ? 'border-[var(--accent)] scale-110' : 'border-white/20'}`}
                    style={{ background: c }} />
                ))}
              </div>
            </div>

            {/* Sliders */}
            {[
              { label: 'Opacity', key: 'opacity', min: 0, max: 1, step: 0.05, display: `${Math.round(wm.opacity * 100)}%` },
              { label: 'Angle', key: 'angle', min: -180, max: 180, step: 5, display: `${wm.angle}°` },
              { label: 'Font Size', key: 'fontSize', min: 12, max: 120, step: 4, display: `${wm.fontSize}pt` },
            ].map(({ label, key, min, max, step, display }) => (
              <div key={key} className="space-y-1.5">
                <label className="flex justify-between text-xs font-mono uppercase tracking-widest text-muted">
                  <span>{label}</span><span className="text-foreground">{display}</span>
                </label>
                <input type="range" min={min} max={max} step={step}
                  value={wm[key as keyof WatermarkOptions] as number}
                  onChange={(e) => setWmField(key as keyof WatermarkOptions, Number(e.target.value) as any)}
                  className="w-full accent-[var(--accent)]" />
              </div>
            ))}

            {/* Tile toggle */}
            <label className="flex items-center justify-between gap-2 text-xs font-mono uppercase tracking-widest text-muted">
              Tile across page
              <button onClick={() => setWmField('tileAll', !wm.tileAll)}
                className={`w-10 h-5 rounded-full relative transition-colors ${wm.tileAll ? 'bg-[var(--accent)]' : 'bg-white/20'}`}>
                <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${wm.tileAll ? 'translate-x-5' : 'translate-x-0.5'}`} />
              </button>
            </label>

            {/* Password section */}
            <div className="pt-2 space-y-3 border-t border-white/10">
              <label className="flex items-center justify-between text-xs font-mono uppercase tracking-widest text-muted">
                <span className="flex items-center gap-2"><Lock className="w-3.5 h-3.5" />Password Protection</span>
                <button onClick={() => setPw((p) => ({ ...p, enabled: !p.enabled }))}
                  className={`w-10 h-5 rounded-full relative transition-colors ${pw.enabled ? 'bg-[var(--accent)]' : 'bg-white/20'}`}>
                  <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${pw.enabled ? 'translate-x-5' : 'translate-x-0.5'}`} />
                </button>
              </label>
              {pw.enabled && (
                <div className="space-y-2">
                  <input type="password" placeholder="User password (open)"
                    value={pw.userPassword} onChange={(e) => setPw((p) => ({ ...p, userPassword: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-foreground
                      placeholder:text-muted focus:outline-none focus:border-[var(--accent)]/60" />
                  <div className="relative">
                    <input type={showOwnerPw ? 'text' : 'password'} placeholder="Owner password (edit restriction)"
                      value={pw.ownerPassword} onChange={(e) => setPw((p) => ({ ...p, ownerPassword: e.target.value }))}
                      className="w-full px-3 py-2 pr-9 rounded-lg bg-white/5 border border-white/10 text-sm text-foreground
                        placeholder:text-muted focus:outline-none focus:border-[var(--accent)]/60" />
                    <button onClick={() => setShowOwnerPw(!showOwnerPw)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted">
                      {showOwnerPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              )}
            </div>

            <button onClick={handleConvert} disabled={status === 'processing'}
              className="w-full flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--accent)] text-white text-sm font-medium
                hover:opacity-90 transition-opacity disabled:opacity-40">
              {status === 'processing' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              Apply & Download
            </button>
            {status === 'done' && <p className="text-xs text-emerald-400 font-mono text-center">✓ Downloaded</p>}
            {status === 'error' && <p className="text-xs text-red-400 font-mono text-center">✗ Error processing</p>}
          </div>

          {/* Live Preview */}
          {preview && (
            <div className="space-y-2">
              <span className="text-xs font-mono uppercase tracking-widest text-muted">Preview (Page 1)</span>
              <div className="relative rounded-xl overflow-hidden border border-white/10">
                <img src={preview} alt="PDF page preview" className="w-full object-cover" />
                {/* Watermark overlay */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
                  {wm.tileAll ? (
                    <div className="absolute inset-0 flex flex-wrap items-center justify-center gap-8"
                      style={{ transform: `rotate(${wm.angle}deg)` }}>
                      {Array.from({ length: 9 }).map((_, i) => (
                        <span key={i} className="select-none whitespace-nowrap font-bold text-nowrap"
                          style={{ color: wm.color, opacity: wm.opacity, fontSize: `${wm.fontSize * 0.3}px` }}>
                          {wm.text}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="select-none whitespace-nowrap font-bold"
                      style={{ color: wm.color, opacity: wm.opacity, fontSize: `${wm.fontSize * 0.3}px`, transform: `rotate(${wm.angle}deg)` }}>
                      {wm.text}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
