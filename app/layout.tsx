import type { Metadata } from 'next';
import './globals.css';
import './comix.css';
import './stuko-home-fix.css';
import './stuko-dark-cloud-fix.css';
import ThemeProvider from './theme-provider';
import ThemeMenu from './theme-menu';
import InitialLoader from '../components/InitialLoader';
import GlobalBackButton from './components/GlobalBackButton';

const SITE_URL = 'https://stuko.vercel.app';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'STUKO',
    template: '%s | STUKO',
  },
  description: 'STUKO is an all-in-one study workspace for notes, flashcards, quizzes, summarization, exam preparation, attendance tracking, and SGPA/CGPA planning.',
  alternates: { canonical: '/' },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  verification: {
    google: 'google18dec03d571d5f7b',
  },
  openGraph: {
    type: 'website',
    url: SITE_URL,
    siteName: 'STUKO',
    title: 'STUKO — Your Study Workspace',
    description: 'An all-in-one study workspace for students.',
  },
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
