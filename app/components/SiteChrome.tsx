'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

export default function SiteChrome({ children }: { children: React.ReactNode }) {
  const [profileOpen, setProfileOpen] = useState(false);
  const pathname = usePathname();
  const isLegalPage = pathname === '/privacy' || pathname === '/terms' || pathname === '/cookies';

  return (
    <main className="stuko-site">
      <div className="stuko-clouds" aria-hidden="true" />

      <header className="stuko-header">
        <Link href="/" className="stuko-brand" aria-label="STUKO home">
          <span className="stuko-logo" aria-hidden="true">✦</span>
          <span>STUKO</span>
        </Link>

        <div className="profile-menu-wrap">
          <button
            className="profile-button"
            type="button"
            aria-expanded={profileOpen}
            aria-haspopup="menu"
            onClick={() => setProfileOpen((open) => !open)}
          >
            profile <span className={`profile-chevron${profileOpen ? ' open' : ''}`}>⌄</span>
          </button>
          {profileOpen && (
            <div className="profile-dropdown" role="menu">
              <Link href="/profile" role="menuitem" onClick={() => setProfileOpen(false)}>public profile</Link>
              <Link href="/settings" role="menuitem" onClick={() => setProfileOpen(false)}>settings</Link>
            </div>
          )}
        </div>
      </header>

      <section className={`stuko-content${isLegalPage ? ' legal-page-content' : ''}`}>
        {isLegalPage && (
          <button className="legal-back" type="button" onClick={() => window.history.back()}>
            ← back
          </button>
        )}
        {children}
      </section>

      <footer className="stuko-footer">
        <Link href="/privacy">privacy policy</Link>
        <Link href="/terms">terms and conditions</Link>
        <Link href="/cookies">cookie policy</Link>
      </footer>

      <style jsx global>{`
        html, body { margin: 0; padding: 0; min-height: 100%; width: 100%; }
        body { overflow-x: hidden; }
        .stuko-site {
          position: relative;
          min-height: 100svh;
          width: 100%;
          margin: 0;
          padding: 0;
          overflow-x: hidden;
          isolation: isolate;
          color: #090909;
          background: #fff;
          font-family: Georgia, 'Times New Roman', serif;
        }
        .stuko-clouds {
          position: fixed;
          inset: 0;
          z-index: 0;
          pointer-events: none;
          background-image: url('/clouds.png');
          background-position: center center;
          background-size: cover;
          background-repeat: no-repeat;
          opacity: 0.30;
        }
        .stuko-header, .stuko-footer {
          position: fixed;
          z-index: 50;
          display: flex;
          width: 100vw !important;
          max-width: none !important;
          margin: 0 !important;
          box-sizing: border-box;
          border-radius: 0 !important;
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
        }
        .stuko-header {
          top: 0 !important;
          left: 0 !important;
          right: 0 !important;
          min-height: 78px;
          padding: 0 42px;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid rgba(0, 0, 0, 0.08);
        }
        .stuko-brand {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          color: #090909;
          text-decoration: none;
          font-size: 24px;
          line-height: 1;
          letter-spacing: -0.045em;
        }
        .stuko-logo {
          display: inline-grid;
          width: 27px;
          height: 27px;
          place-items: center;
          font-size: 23px;
          line-height: 1;
        }
        .profile-menu-wrap { position: relative; }
        .profile-button {
          appearance: none;
          border: 0;
          background: transparent;
          color: #090909;
          padding: 10px 2px;
          cursor: pointer;
          font: inherit;
          font-size: 16px;
          line-height: 1;
          letter-spacing: -0.02em;
        }
        .profile-chevron { display: inline-block; margin-left: 5px; transition: transform 180ms ease; }
        .profile-chevron.open { transform: rotate(180deg); }
        .profile-dropdown {
          position: absolute;
          top: calc(100% + 8px);
          right: 0;
          min-width: 185px;
          padding: 7px;
          background: rgba(255, 255, 255, 0.93);
          border: 1px solid rgba(0, 0, 0, 0.10);
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
          z-index: 60;
        }
        .profile-dropdown a {
          display: block;
          padding: 12px 13px;
          color: #090909;
          text-decoration: none;
          font-size: 15px;
          line-height: 1;
        }
        .profile-dropdown a:hover { background: rgba(0, 0, 0, 0.06); }
        .stuko-content {
          position: relative;
          z-index: 1;
          min-height: 100svh;
          box-sizing: border-box;
          padding: 118px 24px 112px;
        }
        .stuko-content .legal-article {
          width: min(900px, 100%);
          margin: 0 auto;
          padding: 38px 48px;
          box-sizing: border-box;
          border-radius: 24px;
          background: rgba(255, 255, 255, 0.70);
          line-height: 1.7;
        }
        .stuko-content .legal-article h1 { margin-top: 0; line-height: 1.1; }
        .stuko-content .legal-article h2 { margin-top: 2.1em; line-height: 1.2; }
        .stuko-content .legal-article h3 { margin-top: 1.6em; line-height: 1.25; }
        .stuko-content .legal-article p,
        .stuko-content .legal-article ul { margin-top: 0.8em; }
        .stuko-content .legal-article li { margin: 0.35em 0; }
        .legal-page-content { padding-top: 104px; }
        .legal-back {
          display: block;
          width: min(900px, 100%);
          margin: 0 auto 14px;
          padding: 0;
          border: 0;
          background: transparent;
          color: #090909;
          font: inherit;
          font-size: 15px;
          line-height: 1.2;
          text-align: left;
          cursor: pointer;
        }
        .legal-back:hover { text-decoration: underline; text-underline-offset: 4px; }
        .stuko-footer {
          left: 0 !important;
          right: 0 !important;
          bottom: 0 !important;
          min-height: 64px;
          padding: 0 42px;
          align-items: center;
          justify-content: center;
          gap: 30px;
          border-top: 1px solid rgba(0, 0, 0, 0.08);
        }
        .stuko-footer a {
          color: #090909;
          text-decoration: none;
          font-size: 13px;
          line-height: 1;
        }
        .stuko-footer a:hover { text-decoration: underline; text-underline-offset: 3px; }
        @media (max-width: 600px) {
          .stuko-header { min-height: 68px; padding: 0 20px; }
          .stuko-brand { font-size: 20px; }
          .stuko-logo { width: 23px; height: 23px; font-size: 20px; }
          .stuko-content { padding: 98px 18px 96px; }
          .legal-page-content { padding-top: 86px; }
          .stuko-content .legal-article { padding: 28px 22px; border-radius: 18px; }
          .legal-back { margin-bottom: 10px; }
          .stuko-footer { min-height: 58px; padding: 0 16px; gap: 16px; flex-wrap: wrap; }
          .stuko-footer a { font-size: 11px; }
        }
      `}</style>
    </main>
  );
}
