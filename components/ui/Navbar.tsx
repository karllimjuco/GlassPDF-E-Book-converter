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
    const modes: ThemeMode[] = ['system', 'light', 'dark'];
    const next = modes[(modes.indexOf(theme) + 1) % modes.length];
    setTheme(next);
  };

  const ThemeIcon = theme === 'dark' ? Moon : theme === 'light' ? Sun : Monitor;

  return (
    <>
      <header className="fixed top-0 inset-x-0 z-50 glass border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center group" aria-label="GlassPDF home">
            <Image src="/assets/logo.png" alt="GlassPDF" width={260} height={78} priority className="nav-logo" />
          </Link>

          {/* Right Controls */}
          <div className="flex items-center gap-2">
            <StatusBadge visible text="Private" />
            <button
              onClick={cycleTheme}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
              aria-label="Toggle theme"
            >
              <ThemeIcon className="w-4 h-4 text-muted" />
            </button>
            <button
              onClick={() => setSettingsOpen(true)}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
              aria-label="Settings"
            >
              <Settings className="w-4 h-4 text-muted" />
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
              className="fixed right-0 top-0 h-full w-80 z-50 glass border-l border-white/10 p-6 overflow-y-auto"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="font-mono text-sm font-semibold text-foreground tracking-wide">SETTINGS</h2>
                <button
                  onClick={() => setSettingsOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <X className="w-4 h-4 text-muted" />
                </button>
              </div>

              {/* Accent Color */}
              <section className="mb-8">
                <label className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-muted mb-3">
                  <Palette className="w-3.5 h-3.5" /> Accent Color
                </label>
                <div className="flex gap-2 flex-wrap">
                  {ACCENTS.map(({ key }) => {
                    const color = ACCENT_VARS[key];
                    return (
                      <button
                        key={key}
                        onClick={() => setAccent(key)}
                        className={`w-7 h-7 rounded-full border-2 transition-all ${
                          accent === key ? 'border-white scale-110' : 'border-transparent opacity-70'
                        }`}
                        style={{ background: color.dark }}
                        aria-label={key}
                      />
                    );
                  })}
                </div>
              </section>

              {/* Glass Blur */}
              <section className="mb-8">
                <label className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-muted mb-3">
                  <Sliders className="w-3.5 h-3.5" /> Glass Intensity
                  <span className="ml-auto text-foreground">{glassBlur}px</span>
                </label>
                <input
                  type="range"
                  min={8}
                  max={32}
                  step={2}
                  value={glassBlur}
                  onChange={(e) => setGlassBlur(Number(e.target.value))}
                  className="w-full accent-[var(--accent)]"
                />
              </section>

              {/* Reduced Motion */}
              <section className="mb-8">
                <label className="flex items-center justify-between gap-2 text-xs font-mono uppercase tracking-widest text-muted">
                  <span className="flex items-center gap-2">
                    <Zap className="w-3.5 h-3.5" /> Reduce Motion
                  </span>
                  <button
                    onClick={() => setReducedMotion(!reducedMotion)}
                    className={`w-10 h-5 rounded-full transition-colors relative ${
                      reducedMotion ? 'bg-[var(--accent)]' : 'bg-white/20'
                    }`}
                    aria-pressed={reducedMotion}
                  >
                    <span
                      className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                        reducedMotion ? 'translate-x-5' : 'translate-x-0.5'
                      }`}
                    />
                  </button>
                </label>
              </section>

              {/* Theme */}
              <section>
                <label className="text-xs font-mono uppercase tracking-widest text-muted mb-3 block">
                  Theme
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['system', 'light', 'dark'] as ThemeMode[]).map((m) => (
                    <button
                      key={m}
                      onClick={() => setTheme(m)}
                      className={`py-2 rounded-lg text-xs font-mono capitalize transition-colors border ${
                        theme === m
                          ? 'border-[var(--accent)] text-[var(--accent)] bg-[var(--accent)]/10'
                          : 'border-white/10 text-muted hover:border-white/20'
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
