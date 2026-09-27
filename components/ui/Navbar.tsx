'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Moon, Sun, Monitor, Settings, X, Palette, Sliders, Zap } from 'lucide-react';
import { useTheme } from '@/components/providers/ThemeProvider';
import { useSettings, ACCENT_VARS } from '@/components/providers/SettingsProvider';
import type { AccentColor, ThemeMode } from '@/types';
import { StatusBadge } from '@/components/ui/StatusBadge';

const ACCENTS: { key: AccentColor; label: string }[] = [
  { key: 'violet',    label: 'Violet'   },
  { key: 'teal',      label: 'Teal'     },
  { key: 'amber',     label: 'Amber'    },
  { key: 'rose',      label: 'Rose'     },
  { key: 'slateblue', label: 'Indigo'   },
];

export function Navbar() {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const { accent, glassBlur, reducedMotion, setAccent, setGlassBlur, setReducedMotion } = useSettings();
  const [settingsOpen, setSettingsOpen] = useState(false);

  const cycleTheme = () => {
    const modes: ThemeMode[] = ['light', 'dark', 'system'];
    const next = modes[(modes.indexOf(theme) + 1) % modes.length];
    setTheme(next);
  };

  const ThemeIcon = theme === 'dark' ? Moon : theme === 'light' ? Sun : Monitor;

  return (
    <>
      <header className="specular-highlight fixed top-0 inset-x-0 z-40 bg-white/45 dark:bg-white/10 backdrop-blur-md border-b border-white/35 dark:border-white/10 shadow-md shadow-sky-950/5 dark:shadow-black/25 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo with bubble asset */}
          <Link href="/" className="flex items-center group py-1" aria-label="GlassPDF home">
            <Image
              src="/assets/logo.png"
              alt="GlassPDF"
              width={200}
              height={60}
              priority
              className="h-10 w-auto object-contain transition-transform group-hover:scale-105 duration-200 drop-shadow-[0_2px_4px_rgba(255,255,255,0.6)] dark:drop-shadow-[0_2px_6px_rgba(0,0,0,0.5)]"
            />
          </Link>

          {/* Right Controls */}
          <div className="flex items-center gap-3">
            <StatusBadge visible text="100% Client-Side" />
            <button
              onClick={cycleTheme}
              className="p-2.5 rounded-xl bg-white/40 dark:bg-white/10 hover:bg-white/70 dark:hover:bg-white/20 border border-white/40 dark:border-white/15 text-slate-800 dark:text-white shadow-sm transition-all"
              aria-label="Toggle theme"
              title={`Theme: ${theme}`}
            >
              <ThemeIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => setSettingsOpen(true)}
              className="p-2.5 rounded-xl bg-white/40 dark:bg-white/10 hover:bg-white/70 dark:hover:bg-white/20 border border-white/40 dark:border-white/15 text-slate-800 dark:text-white shadow-sm transition-all"
              aria-label="Settings"
              title="Open Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Settings Panel */}
      <AnimatePresence>
        {settingsOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSettingsOpen(false)}
            />
            <motion.aside
              className="fixed right-0 top-0 h-full w-84 z-50 bg-white/80 dark:bg-slate-900/90 backdrop-blur-xl border-l border-white/40 dark:border-white/10 p-6 overflow-y-auto text-slate-900 dark:text-white shadow-2xl"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              <div className="flex items-center justify-between mb-8 pb-4 border-b border-black/10 dark:border-white/10">
                <h2 className="font-heading font-bold text-lg tracking-wide text-slate-900 dark:text-white">SETTINGS</h2>
                <button
                  onClick={() => setSettingsOpen(false)}
                  className="p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-slate-600 dark:text-slate-300"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Accent Color */}
              <section className="mb-8">
                <label className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-slate-600 dark:text-slate-300 mb-3">
                  <Palette className="w-3.5 h-3.5" /> Accent Color
                </label>
                <div className="flex gap-2.5 flex-wrap">
                  {ACCENTS.map(({ key, label }) => {
                    const color = ACCENT_VARS[key];
                    return (
                      <button
                        key={key}
                        onClick={() => setAccent(key)}
                        className={`w-8 h-8 rounded-full border-2 transition-all shadow-md ${
                          accent === key ? 'border-sky-500 scale-115 ring-2 ring-sky-400/40' : 'border-white/40 opacity-80 hover:opacity-100'
                        }`}
                        style={{ background: color.light }}
                        aria-label={label}
                        title={label}
                      />
                    );
                  })}
                </div>
              </section>

              {/* Glass Blur */}
              <section className="mb-8">
                <label className="flex items-center justify-between text-xs font-mono uppercase tracking-widest text-slate-600 dark:text-slate-300 mb-3">
                  <span className="flex items-center gap-2">
                    <Sliders className="w-3.5 h-3.5" /> Glass Blur
                  </span>
                  <span className="font-bold text-slate-900 dark:text-white">{glassBlur}px</span>
                </label>
                <input
                  type="range"
                  min={8}
                  max={32}
                  step={2}
                  value={glassBlur}
                  onChange={(e) => setGlassBlur(Number(e.target.value))}
                  className="w-full"
                />
              </section>

              {/* Reduced Motion */}
              <section className="mb-8">
                <label className="flex items-center justify-between gap-2 text-xs font-mono uppercase tracking-widest text-slate-600 dark:text-slate-300">
                  <span className="flex items-center gap-2">
                    <Zap className="w-3.5 h-3.5" /> Reduce Motion
                  </span>
                  <button
                    onClick={() => setReducedMotion(!reducedMotion)}
                    className={`w-11 h-6 rounded-full transition-colors relative shadow-inner ${
                      reducedMotion ? 'bg-sky-500' : 'bg-slate-300 dark:bg-white/20'
                    }`}
                    aria-pressed={reducedMotion}
                  >
                    <span
                      className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-md transition-transform ${
                        reducedMotion ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </label>
              </section>

              {/* Theme Mode */}
              <section>
                <label className="text-xs font-mono uppercase tracking-widest text-slate-600 dark:text-slate-300 mb-3 block">
                  Theme
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['light', 'dark', 'system'] as ThemeMode[]).map((m) => (
                    <button
                      key={m}
                      onClick={() => setTheme(m)}
                      className={`py-2.5 rounded-xl text-xs font-bold capitalize transition-all border ${
                        theme === m
                          ? 'border-sky-500 text-sky-600 dark:text-sky-300 bg-sky-500/10 shadow-sm'
                          : 'border-black/10 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:border-black/20 dark:hover:border-white/20'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </section>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
