'use client';

import { createContext, useContext, useEffect, useState } from 'react';

export type ThemeName = 'system' | 'light' | 'dark' | 'pink' | 'purple';

const VALID_THEMES: ThemeName[] = ['system', 'light', 'dark', 'pink', 'purple'];

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<ThemeName>('light');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('stuko-theme') as ThemeName | null;
    if (saved && VALID_THEMES.includes(saved)) setTheme(saved);
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('stuko-theme', theme);
  }, [theme, ready]);

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key === 'stuko-theme' && event.newValue && VALID_THEMES.includes(event.newValue as ThemeName)) {
        setTheme(event.newValue as ThemeName);
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>;
}

const ThemeContext = createContext<{ theme: ThemeName; setTheme: (theme: ThemeName) => void }>({
  theme: 'light',
  setTheme: () => {},
});

export function useTheme() {
  return useContext(ThemeContext);
}
