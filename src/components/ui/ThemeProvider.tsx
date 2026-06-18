'use client';

import { createContext, useContext, useEffect, useRef, useState } from 'react';

type Theme = 'light' | 'dark' | 'system';
type ResolvedTheme = 'light' | 'dark';

interface ThemeContextValue {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: ResolvedTheme;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

function getResolvedTheme(t: Theme): ResolvedTheme {
  if (t === 'dark') return 'dark';
  if (t === 'light') return 'light';
  if (typeof window !== 'undefined') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return 'light';
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('system');
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>('light');
  // Keep a ref so the media query listener always sees the latest theme value
  const themeRef = useRef<Theme>('system');

  useEffect(() => {
    const stored = localStorage.getItem('theme');
    const initial: Theme =
      stored === 'dark' || stored === 'light' || stored === 'system' ? stored : 'system';
    const resolved = getResolvedTheme(initial);
    themeRef.current = initial;
    setThemeState(initial);
    setResolvedTheme(resolved);
    document.documentElement.classList.toggle('dark', resolved === 'dark');

    // Keep theme in sync with OS preference changes (only when theme is 'system')
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      if (themeRef.current === 'system') {
        const newResolved: ResolvedTheme = e.matches ? 'dark' : 'light';
        setResolvedTheme(newResolved);
        document.documentElement.classList.toggle('dark', e.matches);
      }
    };
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  function setTheme(t: Theme) {
    const resolved = getResolvedTheme(t);
    themeRef.current = t;
    setThemeState(t);
    setResolvedTheme(resolved);
    if (t === 'system') {
      localStorage.removeItem('theme');
    } else {
      localStorage.setItem('theme', t);
    }
    document.documentElement.classList.toggle('dark', resolved === 'dark');
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
