import type { Metadata } from 'next';
import './globals.css';
import './comix.css';
import './stuko-home-fix.css';
import ThemeProvider from './theme-provider';
import ThemeMenu from './theme-menu';
import InitialLoader from '../components/InitialLoader';

export const metadata: Metadata = {
  title: 'STUKO — Study, but make it yours.',
  description: 'An interest-first all-in-one study workspace.',
};

const themeBootstrap = `(() => { try { const t = localStorage.getItem('stuko-theme'); document.documentElement.dataset.theme = t === 'dark' ? 'dark' : 'light'; } catch (_) { document.documentElement.dataset.theme = 'light'; } })()`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootstrap }} />
      </head>
      <body>
        <ThemeProvider>
          <InitialLoader />
          {children}
          <ThemeMenu />
        </ThemeProvider>
      </body>
    </html>
  );
}
