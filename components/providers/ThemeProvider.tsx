'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import type { ThemeMode } from '@/types';

interface ThemeContextValue {
  theme: ThemeMode;
  resolvedTheme: 'light' | 'dark';
  setTheme: (t: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'light',
  resolvedTheme: 'light',
  setTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>('light');
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('glasspdf_theme') as ThemeMode | null;
    if (stored) {
      setThemeState(stored);
    }
  }, []);

  // Resolve theme + apply to document
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');

    const resolve = () => {
      const resolved = theme === 'system' ? (mq.matches ? 'dark' : 'light') : theme;
      setResolvedTheme(resolved);
      document.documentElement.setAttribute('data-theme', resolved);
    };

    resolve();
    mq.addEventListener('change', resolve);
    return () => mq.removeEventListener('change', resolve);
  }, [theme]);

  const setTheme = (t: ThemeMode) => {
    setThemeState(t);
    localStorage.setItem('glasspdf_theme', t);
  };

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
