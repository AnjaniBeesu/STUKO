import type { Metadata } from 'next';
import './globals.css';
import './comix.css';
import ThemeProvider from './theme-provider';
import ThemeMenu from './theme-menu';
import SplashCursor from '@/components/SplashCursor';

export const metadata: Metadata = {
  title: 'STUKO — Study, but make it yours.',
  description: 'An interest-first all-in-one study workspace.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body><ThemeProvider><SplashCursor DENSITY_DISSIPATION={3.5} VELOCITY_DISSIPATION={2} PRESSURE={0.1} CURL={3} SPLAT_RADIUS={0.2} SPLAT_FORCE={6000} COLOR_UPDATE_SPEED={10} SHADING RAINBOW_MODE={false} COLOR="#89d8be" />{children}<ThemeMenu /></ThemeProvider></body></html>;
}
