import type { Metadata } from 'next';
import './globals.css';
import './comix.css';
import './stuko-home-fix.css';
import './stuko-dark-cloud-fix.css';
import ThemeProvider from './theme-provider';
import ThemeMenu from './theme-menu';
import InitialLoader from '../components/InitialLoader';
import GlobalBackButton from './components/GlobalBackButton';

export const metadata: Metadata = {
  title: 'STUKO',
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
          <GlobalBackButton />
          {children}
          <ThemeMenu />
        </ThemeProvider>
      </body>
    </html>
  );
}
