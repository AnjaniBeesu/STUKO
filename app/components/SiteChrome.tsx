'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

const THEME_KEY = 'stuko-theme';

export default function SiteChrome({ children }: { children: React.ReactNode }) {
  const [profileOpen, setProfileOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.localStorage.getItem(THEME_KEY) === 'dark';
  });
  const pathname = usePathname();
  const isLegalPage = pathname === '/privacy' || pathname === '/terms' || pathname === '/cookies';

  useEffect(() => {
    document.documentElement.dataset.theme = darkMode ? 'dark' : 'light';
    window.localStorage.setItem(THEME_KEY, darkMode ? 'dark' : 'light');
  }, [darkMode]);

  return (
    <main className={`stuko-site${darkMode ? ' stuko-dark' : ''}`}>
      <div className="stuko-clouds" aria-hidden="true" />

      <header className="stuko-header">
        <Link href="/" className="stuko-brand" aria-label="STUKO home">
          <span className="stuko-logo" aria-hidden="true">✦</span>
          <span>STUKO</span>
        </Link>

        <div className="stuko-header-actions">
          <label className="theme-switch" title={darkMode ? 'switch to light mode' : 'switch to dark mode'}>
            <input
              type="checkbox"
              className="theme-switch__checkbox"
              checked={darkMode}
              onChange={(event) => setDarkMode(event.target.checked)}
              aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            />
            <div className="theme-switch__container">
              <div className="theme-switch__clouds" />
              <div className="theme-switch__stars-container">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 144 55" fill="none" aria-hidden="true">
                  <path fillRule="evenodd" clipRule="evenodd" d="M135.831 3.00688C135.055 3.85027 134.111 4.29946 133 4.35447C134.111 4.40947 135.055 4.85867 135.831 5.71123C136.607 6.55462 136.996 7.56303 136.996 8.72727C136.996 7.95722 137.172 7.25134 137.525 6.59129C137.886 5.93124 138.372 5.39954 138.98 5.00535C139.598 4.60199 140.268 4.39114 141 4.35447C139.88 4.2903 138.936 3.85027 138.16 3.00688C137.384 2.16348 136.996 1.16425 136.996 0C136.996 1.16425 136.607 2.16348 135.831 3.00688ZM31 23.3545C32.1114 23.2995 33.0551 22.8503 33.8313 22.0069C34.6075 21.1635 34.9956 20.1642 34.9956 19C34.9956 20.1642 35.3837 21.1635 36.1599 22.0069C36.9361 22.8503 37.8798 23.2903 39 23.3545C38.2679 23.3911 37.5976 23.602 36.9802 24.0053C36.3716 24.3995 35.8864 24.9312 35.5248 25.5913C35.172 26.2513 34.9956 26.9572 34.9956 27.7273C34.9956 26.563 34.6075 25.5546 33.8313 24.7112C33.0551 23.8587 32.1114 23.4095 31 23.3545ZM0 36.3545C1.11136 36.2995 2.05513 35.8503 2.83131 35.0069C3.6075 34.1635 3.99559 33.1642 3.99559 32C3.99559 33.1642 4.38368 34.1635 5.15987 35.0069C5.93605 35.8503 6.87982 36.2903 8 36.3545C7.26792 36.3911 6.59757 36.602 5.98015 37.0053C5.37155 37.3995 4.88644 37.9312 4.52481 38.5913C4.172 39.2513 3.99559 39.9572 3.99559 40.7273C3.99559 39.563 3.6075 38.5546 2.83131 37.7112C2.05513 36.8587 1.11136 36.4095 0 36.3545ZM56.8313 24.0069C56.0551 24.8503 55.1114 25.2995 54 25.3545C55.1114 25.4095 56.0551 25.8587 56.8313 26.7112C57.6075 27.5546 57.9956 28.563 57.9956 29.7273C57.9956 28.9572 58.172 28.2513 58.5248 27.5913C58.8864 26.9312 59.3716 26.3995 59.9802 26.0053C60.5976 25.602 61.2679 25.3911 62 25.3545C60.8798 25.2903 59.9361 24.8503 59.1599 24.0069C58.3837 23.1635 57.9956 22.1642 57.9956 21C57.9956 22.1642 57.6075 23.1635 56.8313 24.0069ZM81 25.3545C82.1114 25.2995 83.0551 24.8503 83.8313 24.0069C84.6075 23.1635 84.9956 22.1642 84.9956 21C84.9956 22.1642 85.3837 23.1635 86.1599 24.0069C86.9361 24.8503 87.8798 25.2903 89 25.3545C88.2679 25.3911 87.5976 25.602 86.9802 26.0053C86.3716 26.3995 85.8864 26.9312 85.5248 27.5913C85.172 28.2513 84.9956 28.9572 84.9956 29.7273C84.9956 28.563 84.6075 27.5546 83.8313 26.7112C83.0551 25.8587 82.1114 25.4095 81 25.3545ZM136 36.3545C137.111 36.2995 138.055 35.8503 138.831 35.0069C139.607 34.1635 139.996 33.1642 139.996 32C139.996 33.1642 140.384 34.1635 141.16 35.0069C141.936 35.8503 142.88 36.2903 144 36.3545C143.268 36.3911 142.598 36.602 141.98 37.0053C141.372 37.3995 140.886 37.9312 140.525 38.5913C140.172 39.2513 139.996 39.9572 139.996 40.7273C139.996 39.563 139.607 38.5546 138.831 37.7112C138.055 36.8587 137.111 36.4095 136 36.3545ZM101.831 49.0069C101.055 49.8503 100.111 50.2995 99 50.3545C100.111 50.4095 101.055 50.8587 101.831 51.7112C102.607 52.5546 102.996 53.563 102.996 54.7273C102.996 53.9572 102.996 53.2513 103.525 52.5913C103.886 51.9312 104.372 51.3995 104.98 51.0053C105.598 50.602 106.268 50.3911 107 50.3545C105.88 50.2903 104.936 49.8503 104.16 49.0069C103.384 48.1635 102.996 47.1642 102.996 46C102.996 47.1642 102.607 48.1635 101.831 49.0069Z" fill="currentColor" />
                </svg>
              </div>
              <div className="theme-switch__circle-container">
                <div className="theme-switch__sun-moon-container">
                  <div className="theme-switch__moon">
                    <div className="theme-switch__spot" />
                    <div className="theme-switch__spot" />
                    <div className="theme-switch__spot" />
                  </div>
                </div>
              </div>
            </div>
          </label>

          <div className="profile-menu-wrap">
            <button className="profile-button" type="button" aria-expanded={profileOpen} aria-haspopup="menu" onClick={() => setProfileOpen((open) => !open)}>
              profile <span className={`profile-chevron${profileOpen ? ' open' : ''}`}>⌄</span>
            </button>
            {profileOpen && (
              <div className="profile-dropdown" role="menu">
                <Link href="/profile" role="menuitem" onClick={() => setProfileOpen(false)}>public profile</Link>
                <Link href="/settings" role="menuitem" onClick={() => setProfileOpen(false)}>settings</Link>
              </div>
            )}
          </div>
        </div>
      </header>

      <section className={`stuko-content${isLegalPage ? ' legal-page-content' : ''}`}>
        {isLegalPage && <button className="legal-back" type="button" onClick={() => window.history.back()}>← back</button>}
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
          --page-bg: #fff;
          --page-text: #090909;
          --glass: rgba(255, 255, 255, 0.85);
          --glass-soft: rgba(255, 255, 255, 0.70);
          --line: rgba(0, 0, 0, 0.08);
          --dropdown: rgba(255, 255, 255, 0.93);
          position: relative;
          min-height: 100svh;
          width: 100%;
          margin: 0;
          padding: 0;
          overflow-x: hidden;
          isolation: isolate;
          color: var(--page-text);
          background: transparent;
          font-family: Georgia, 'Times New Roman', serif;
          transition: color 300ms ease;
        }
        .stuko-site::before { content: ''; position: fixed; inset: 0; z-index: -2; background: var(--page-bg); transition: background-color 300ms ease; }
        .stuko-site.stuko-dark {
          --page-bg: #111;
          --page-text: #f5f5f5;
          --glass: rgba(24, 24, 24, 0.88);
          --glass-soft: rgba(35, 35, 35, 0.78);
          --line: rgba(255, 255, 255, 0.10);
          --dropdown: rgba(30, 30, 30, 0.96);
        }
        .stuko-clouds {
          position: fixed;
          inset: 0;
          z-index: -1;
          pointer-events: none;
          background-image: url('/clouds.png');
          background-position: center center;
          background-size: cover;
          background-repeat: no-repeat;
          opacity: 0.30;
          transition: opacity 300ms ease, filter 300ms ease;
        }
        .stuko-site.stuko-dark .stuko-clouds { opacity: 0.18; filter: grayscale(1) brightness(0.32) contrast(1.15); }

        .stuko-header, .stuko-footer {
          display: flex;
          width: 100vw !important;
          max-width: none !important;
          margin: 0 !important;
          box-sizing: border-box;
          border-radius: 0 !important;
          background: var(--glass);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          transition: background-color 300ms ease, border-color 300ms ease;
        }
        .stuko-header {
          position: fixed;
          z-index: 50;
          top: 0 !important;
          left: 0 !important;
          right: 0 !important;
          min-height: 78px;
          padding: 0 42px;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid var(--line);
        }
        .stuko-brand { display: inline-flex; align-items: center; gap: 10px; color: var(--page-text); text-decoration: none; font-size: 24px; line-height: 1; letter-spacing: -0.045em; }
        .stuko-logo { display: inline-grid; width: 27px; height: 27px; place-items: center; font-size: 23px; line-height: 1; }
        .stuko-header-actions { display: flex; align-items: center; gap: 22px; }
        .profile-menu-wrap { position: relative; }
        .profile-button { appearance: none; border: 0; background: transparent; color: var(--page-text); padding: 10px 2px; cursor: pointer; font: inherit; font-size: 16px; line-height: 1; letter-spacing: -0.02em; }
        .profile-chevron { display: inline-block; margin-left: 5px; transition: transform 180ms ease; }
        .profile-chevron.open { transform: rotate(180deg); }
        .profile-dropdown { position: absolute; top: calc(100% + 8px); right: 0; min-width: 185px; padding: 7px; background: var(--dropdown); color: var(--page-text); border: 1px solid var(--line); backdrop-filter: blur(14px); -webkit-backdrop-filter: blur(14px); z-index: 60; }
        .profile-dropdown a { display: block; padding: 12px 13px; color: var(--page-text); text-decoration: none; font-size: 15px; line-height: 1; }
        .profile-dropdown a:hover { background: rgba(127, 127, 127, 0.13); }

        .stuko-content { position: relative; z-index: 1; min-height: 100svh; box-sizing: border-box; padding: 118px 24px 70px; transition: color 300ms ease; }
        .stuko-content .legal-article { width: min(900px, 100%); margin: 0 auto; padding: 38px 48px; box-sizing: border-box; border-radius: 24px; background: var(--glass-soft); color: var(--page-text); line-height: 1.7; transition: background-color 300ms ease, color 300ms ease; }
        .stuko-content .legal-article h1 { margin-top: 0; line-height: 1.1; }
        .stuko-content .legal-article h2 { margin-top: 2.1em; line-height: 1.2; }
        .stuko-content .legal-article h3 { margin-top: 1.6em; line-height: 1.25; }
        .stuko-content .legal-article p, .stuko-content .legal-article ul { margin-top: 0.8em; }
        .stuko-content .legal-article li { margin: 0.35em 0; }
        .legal-page-content { padding-top: 104px; }
        .legal-back { display: block; width: min(900px, 100%); margin: 0 auto 14px; padding: 0; border: 0; background: transparent; color: var(--page-text); font: inherit; font-size: 15px; line-height: 1.2; text-align: left; cursor: pointer; }
        .legal-back:hover { text-decoration: underline; text-underline-offset: 4px; }
        .stuko-footer { position: relative; z-index: 1; min-height: 64px; padding: 0 42px; align-items: center; justify-content: center; gap: 30px; border-top: 1px solid var(--line); }
        .stuko-footer a { color: var(--page-text); text-decoration: none; font-size: 13px; line-height: 1; }
        .stuko-footer a:hover { text-decoration: underline; text-underline-offset: 3px; }

        .theme-switch {
          --toggle-size: 10px;
          --container-width: 5.625em;
          --container-height: 2.5em;
          --container-radius: 6.25em;
          --container-light-bg: #3D7EAE;
          --container-night-bg: #1D1F2C;
          --circle-container-diameter: 3.375em;
          --sun-moon-diameter: 2.125em;
          --sun-bg: #ECCA2F;
          --moon-bg: #C4C9D1;
          --spot-color: #959DB1;
          --circle-container-offset: calc((var(--circle-container-diameter) - var(--container-height)) / 2 * -1);
          --stars-color: #fff;
          --clouds-color: #F3FDFF;
          --back-clouds-color: #AACADF;
          --transition: .5s cubic-bezier(0, -0.02, 0.4, 1.25);
          --circle-transition: .3s cubic-bezier(0, -0.02, 0.35, 1.17);
          display: inline-block;
          width: auto;
          height: auto;
          font-size: var(--toggle-size);
          cursor: pointer;
        }
        .theme-switch, .theme-switch *, .theme-switch *::before, .theme-switch *::after { box-sizing: border-box; margin: 0; padding: 0; }
        .theme-switch__container { width: var(--container-width); height: var(--container-height); background-color: var(--container-light-bg); border-radius: var(--container-radius); overflow: hidden; cursor: pointer; box-shadow: 0em -0.062em 0.062em rgba(0,0,0,.25),0em .062em .125em rgba(255,255,255,.94); transition: var(--transition); position: relative; }
        .theme-switch__container::before { content: ''; position: absolute; z-index: 1; inset: 0; box-shadow: 0em .05em .187em rgba(0,0,0,.25) inset; border-radius: var(--container-radius); }
        .theme-switch__checkbox { display: none; }
        .theme-switch__circle-container { width: var(--circle-container-diameter); height: var(--circle-container-diameter); background-color: rgba(255,255,255,.1); position: absolute; left: var(--circle-container-offset); top: var(--circle-container-offset); border-radius: var(--container-radius); box-shadow: inset 0 0 0 3.375em rgba(255,255,255,.1),0 0 0 .625em rgba(255,255,255,.1),0 0 0 1.25em rgba(255,255,255,.1); display: flex; transition: var(--circle-transition); pointer-events: none; }
        .theme-switch__sun-moon-container { pointer-events: auto; position: relative; z-index: 2; width: var(--sun-moon-diameter); height: var(--sun-moon-diameter); margin: auto; border-radius: var(--container-radius); background-color: var(--sun-bg); box-shadow: .062em .062em .062em 0 rgba(254,255,239,.61) inset,0 -.062em .062em 0 #a1872a inset; filter: drop-shadow(.062em .125em .125em rgba(0,0,0,.25)) drop-shadow(0 .062em .125em rgba(0,0,0,.25)); overflow: hidden; transition: var(--transition); }
        .theme-switch__moon { transform: translateX(100%); width: 100%; height: 100%; background-color: var(--moon-bg); border-radius: inherit; box-shadow: .062em .062em .062em 0 rgba(254,255,239,.61) inset,0 -.062em .062em 0 #969696 inset; transition: var(--transition); position: relative; }
        .theme-switch__spot { position: absolute; top: .75em; left: .312em; width: .75em; height: .75em; border-radius: var(--container-radius); background-color: var(--spot-color); box-shadow: 0 .0312em .062em rgba(0,0,0,.25) inset; }
        .theme-switch__spot:nth-of-type(2) { width: .375em; height: .375em; top: .937em; left: 1.375em; }
        .theme-switch__spot:nth-last-of-type(3) { width: .25em; height: .25em; top: .312em; left: .812em; }
        .theme-switch__clouds { width: 1.25em; height: 1.25em; background-color: var(--clouds-color); border-radius: var(--container-radius); position: absolute; bottom: -.625em; left: .312em; box-shadow: .937em .312em var(--clouds-color),-.312em -.312em var(--back-clouds-color),1.437em .375em var(--clouds-color),.5em -.125em var(--back-clouds-color),2.187em 0 var(--clouds-color),1.25em -.062em var(--back-clouds-color),2.937em .312em var(--clouds-color),2em -.312em var(--back-clouds-color),3.625em -.062em var(--clouds-color),2.625em 0 var(--back-clouds-color),4.5em -.312em var(--clouds-color),3.375em -.437em var(--back-clouds-color),4.625em -1.75em 0 .437em var(--clouds-color),4em -.625em var(--back-clouds-color),4.125em -2.125em 0 .437em var(--back-clouds-color); transition: var(--transition); }
        .theme-switch__stars-container { position: absolute; color: var(--stars-color); top: -100%; left: .312em; width: 2.75em; height: auto; transition: var(--transition); }
        .theme-switch__checkbox:checked + .theme-switch__container { background-color: var(--container-night-bg); }
        .theme-switch__checkbox:checked + .theme-switch__container .theme-switch__circle-container { left: calc(100% - var(--circle-container-offset) - var(--circle-container-diameter)); }
        .theme-switch__checkbox:checked + .theme-switch__container .theme-switch__circle-container:hover { left: calc(100% - var(--circle-container-offset) - var(--circle-container-diameter) - .187em); }
        .theme-switch__circle-container:hover { left: calc(var(--circle-container-offset) + .187em); }
        .theme-switch__checkbox:checked + .theme-switch__container .theme-switch__moon { transform: translateX(0); }
        .theme-switch__checkbox:checked + .theme-switch__container .theme-switch__clouds { bottom: -4.062em; }
        .theme-switch__checkbox:checked + .theme-switch__container .theme-switch__stars-container { top: 50%; transform: translateY(-50%); }

        @media (max-width: 600px) {
          .stuko-header { min-height: 68px; padding: 0 20px; }
          .stuko-brand { font-size: 20px; }
          .stuko-logo { width: 23px; height: 23px; font-size: 20px; }
          .stuko-header-actions { gap: 14px; }
          .theme-switch { --toggle-size: 8px; }
          .stuko-content { padding: 98px 18px 56px; }
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
