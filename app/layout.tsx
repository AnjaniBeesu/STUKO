import type { Metadata } from 'next';
import './globals.css';
import './comix.css';
import ThemeProvider from './theme-provider';
import ThemeMenu from './theme-menu';

export const metadata: Metadata = {
  title: 'STUKO — Study, but make it yours.',
  description: 'An interest-first all-in-one study workspace.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body><ThemeProvider>{children}<ThemeMenu /></ThemeProvider></body></html>;
}
