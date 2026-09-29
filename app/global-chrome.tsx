'use client';

import { usePathname } from 'next/navigation';
import SiteChrome from '@/app/components/SiteChrome';

const EXISTING_CHROME_ROUTES = new Set([
  '/',
  '/pomodoro',
  '/privacy',
  '/terms',
  '/cookies',
  '/flashcards',
  '/quiz',
  '/summarizer',
  '/library',
  '/study-room',
]);

export default function GlobalChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Auth/onboarding have their own focused flows and should not get the app chrome.
  if (pathname === '/auth' || pathname === '/onboarding') return <>{children}</>;

  // These routes already render SiteChrome themselves (or their own tool chrome).
  if (EXISTING_CHROME_ROUTES.has(pathname)) return <>{children}</>;

  return <SiteChrome>{children}</SiteChrome>;
}
