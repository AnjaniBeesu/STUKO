import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'STUKO — Study, but make it yours.',
  description: 'An interest-first all-in-one study workspace.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}