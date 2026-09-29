'use client';

import { usePathname, useRouter } from 'next/navigation';

export default function GlobalBackButton() {
  const pathname = usePathname();
  const router = useRouter();

  // Legal pages already have their own back control inside SiteChrome.
  if (pathname === '/' || pathname === '/privacy' || pathname === '/terms' || pathname === '/cookies') {
    return null;
  }

  const goBack = () => {
    if (window.history.length > 1) router.back();
    else router.push('/');
  };

  return (
    <button className="global-stuko-back" type="button" onClick={goBack} aria-label="Go back">
      ← back
      <style jsx global>{`
        .global-stuko-back {
          position: fixed;
          top: 96px;
          left: 24px;
          z-index: 40;
          border: 0;
          background: transparent;
          color: var(--page-text, #090909);
          padding: 6px 0;
          font: inherit;
          font-size: 15px;
          line-height: 1.2;
          cursor: pointer;
        }
        .global-stuko-back:hover {
          text-decoration: underline;
          text-underline-offset: 4px;
        }
        .stuko-dark .global-stuko-back {
          color: #f5f5f5;
        }
        @media (max-width: 600px) {
          .global-stuko-back {
            top: 84px;
            left: 18px;
            font-size: 14px;
          }
        }
      `}</style>
    </button>
  );
}
