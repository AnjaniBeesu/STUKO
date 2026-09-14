'use client';

import { useEffect, useState } from 'react';

export type ThemeName = 'system' | 'light' | 'dark' | 'pink' | 'purple';

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<ThemeName>('system');

  useEffect(() => {
    const saved = localStorage.getItem('stuko-theme') as ThemeName | null;
    if (saved && ['system','light','dark','pink','purple'].includes(saved)) setTheme(saved);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('stuko-theme', theme);
  }, [theme]);

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key === 'stuko-theme' && event.newValue) setTheme(event.newValue as ThemeName);
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>;
}

import { createContext, useContext } from 'react';

const ThemeContext = createContext<{ theme: ThemeName; setTheme: (theme: ThemeName) => void }>({
  theme: 'system',
  setTheme: () => {},
});

export function useTheme() {
  return useContext(ThemeContext);
}
