'use client';

import { useEffect, useState } from 'react';
import { Moon, Monitor } from 'lucide-react';

type Theme = 'dark' | 'system';

const STORAGE_KEY = 'theme';

const options: { value: Theme; label: string; icon: typeof Moon }[] = [
  { value: 'system', label: 'System', icon: Monitor },
  { value: 'dark', label: 'Dark', icon: Moon },
];

function applyTheme(theme: Theme) {
  const isDark =
    theme === 'dark' || window.matchMedia('(prefers-color-scheme: dark)').matches;
  document.documentElement.classList.toggle('dark', isDark);
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>('system');

  useEffect(() => {
    let stored: string | null = null;
    try {
      stored = localStorage.getItem(STORAGE_KEY);
    } catch {}
    setTheme(stored === 'dark' ? 'dark' : 'system');
  }, []);

  useEffect(() => {
    if (theme !== 'system') return;
    const mql = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => applyTheme('system');
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, [theme]);

  const select = (value: Theme) => {
    setTheme(value);
    try {
      localStorage.setItem(STORAGE_KEY, value);
    } catch {}
    applyTheme(value);
  };

  return (
    <div role="group" aria-label="Theme" className="flex items-center rounded-lg border border-slate-300 dark:border-slate-600 p-0.5">
      {options.map(({ value, label, icon: Icon }) => (
        <button
          key={value}
          type="button"
          aria-pressed={theme === value}
          aria-label={label}
          title={label}
          onClick={() => select(value)}
          className={`rounded-md p-1.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 ${
            theme === value
              ? 'bg-blue-600 text-white'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
          }`}
        >
          <Icon className="h-4 w-4" aria-hidden="true" />
        </button>
      ))}
    </div>
  );
}
