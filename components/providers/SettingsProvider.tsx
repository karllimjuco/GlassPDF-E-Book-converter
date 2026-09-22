'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import type { AccentColor, AppSettings } from '@/types';

const ACCENT_VARS: Record<AccentColor, { light: string; dark: string }> = {
  violet:    { light: '#7C5CFC', dark: '#9D7EFD' },
  teal:      { light: '#0D9488', dark: '#2DD4BF' },
  amber:     { light: '#D97706', dark: '#FBBF24' },
  rose:      { light: '#E11D48', dark: '#FB7185' },
  slateblue: { light: '#4F46E5', dark: '#818CF8' },
};

interface SettingsContextValue extends AppSettings {
  setAccent: (a: AccentColor) => void;
  setGlassBlur: (v: number) => void;
  setReducedMotion: (v: boolean) => void;
}

const SettingsContext = createContext<SettingsContextValue>({
  theme: 'system',
  accent: 'violet',
  glassBlur: 20,
  reducedMotion: false,
  setAccent: () => {},
  setGlassBlur: () => {},
  setReducedMotion: () => {},
});

const DEFAULT: AppSettings = {
  theme: 'system',
  accent: 'violet',
  glassBlur: 20,
  reducedMotion: false,
};

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('glasspdf_settings');
      if (raw) setSettings({ ...DEFAULT, ...JSON.parse(raw) });
    } catch { /* ignore */ }

    // Respect OS reduced-motion
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mq.matches) setSettings((s) => ({ ...s, reducedMotion: true }));
  }, []);

  // Apply CSS vars whenever settings change
  useEffect(() => {
    const root = document.documentElement;
    const theme = root.getAttribute('data-theme') as 'light' | 'dark' ?? 'dark';
    const accentObj = ACCENT_VARS[settings.accent];
    const accent = theme === 'light' ? accentObj.light : accentObj.dark;
    root.style.setProperty('--accent', accent);
    root.style.setProperty('--glass-blur', `${settings.glassBlur}px`);
    if (settings.reducedMotion) {
      root.style.setProperty('--motion-duration', '0ms');
    } else {
      root.style.removeProperty('--motion-duration');
    }
  }, [settings]);

  const persist = (next: AppSettings) => {
    setSettings(next);
    try { localStorage.setItem('glasspdf_settings', JSON.stringify(next)); } catch { /* ignore */ }
  };

  return (
    <SettingsContext.Provider
      value={{
        ...settings,
        setAccent: (accent) => persist({ ...settings, accent }),
        setGlassBlur: (glassBlur) => persist({ ...settings, glassBlur }),
        setReducedMotion: (reducedMotion) => persist({ ...settings, reducedMotion }),
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export const useSettings = () => useContext(SettingsContext);
export { ACCENT_VARS };
