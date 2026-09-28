'use client';

import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { ChevronDown, Settings, UserRound } from 'lucide-react';
import { firebaseConfigured, getFirebase } from '@/lib/firebase';

type Profile = {
  displayName?: string;
  username?: string;
  photoURL?: string;
};

type Tool = {
  title: string;
  href: string;
};

const tools: Tool[] = [
  { title: 'Pomodoro timer', href: '/pomodoro' },
  { title: 'Enter study room', href: '/study-room' },
  { title: 'Flashcards maker', href: '/flashcards' },
  { title: 'Quiz maker', href: '/quiz' },
  { title: 'Summarizer', href: '/summarizer' },
  { title: 'Your library', href: '/library' },
];

export default function HomePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!firebaseConfigured()) {
      setLoading(false);
      return;
    }

    const { auth, db } = getFirebase();

    return onAuthStateChanged(auth, async (user) => {
      if (!user) {
        window.location.href = '/auth';
        return;
      }

      const snap = await getDoc(doc(db, 'users', user.uid));

      if (!snap.exists() || !snap.data().username) {
        window.location.href = '/onboarding';
        return;
      }

      setProfile(snap.data() as Profile);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <main className="stuko-loader">
        <div className="stuko-cloud-layer" aria-hidden="true" />
        <div className="loader-glass">
          <span className="loader-logo-mark" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
          <span>STUKO</span>
        </div>
      </main>
    );
  }

  const displayName = profile?.displayName || profile?.username || 'student';
  const initials = displayName.trim().slice(0, 1).toUpperCase() || 'S';

  return (
    <main className="stuko-home">
      <style jsx global>{`
        :root {
          --stuko-black: #111111;
          --stuko-muted: rgba(17, 17, 17, 0.54);
          --stuko-white-85: rgba(255, 255, 255, 0.85);
          --stuko-white-78: rgba(255, 255, 255, 0.78);
          --stuko-border: rgba(255, 255, 255, 0.95);
          --stuko-ease: cubic-bezier(0.19, 1, 0.22, 1);
        }

        * { box-sizing: border-box; }
        html { min-height: 100%; scroll-behavior: smooth; }
        body {
          margin: 0;
          min-height: 100%;
          background: #fff;
          color: var(--stuko-black);
        }

        button, a { -webkit-tap-highlight-color: transparent; }

        .stuko-home {
          min-height: 100svh;
          position: relative;
          isolation: isolate;
          display: flex;
          flex-direction: column;
          overflow-x: hidden;
          font-family: Roobert, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        }

        /* The supplied cloud image is the actual page canvas, softened to exactly 30%. */
        .stuko-cloud-layer {
          position: fixed;
          inset: 0;
          z-index: -1;
          pointer-events: none;
          background: #fff url('/stuko-clouds.jpg') center / cover no-repeat;
          opacity: 0.30;
        }

        /* Full-width chrome: the white 85% layer is never clipped by rounded page cards. */
        .stuko-header,
        .stuko-footer {
          width: 100%;
          flex: 0 0 auto;
          background: var(--stuko-white-85);
          border: 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);
        }

        .stuko-header-inner,
        .stuko-footer-inner {
          width: min(calc(100% - 40px), 1180px);
          margin-inline: auto;
        }

        .stuko-header {
          position: sticky;
          top: 0;
          z-index: 50;
        }

        .stuko-header-inner {
          min-height: 76px;
          padding: 12px 0;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .stuko-brand {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          color: var(--stuko-black);
          text-decoration: none;
          font: 400 18px/1 Roobert, ui-sans-serif, sans-serif;
          letter-spacing: -0.045em;
        }

        .stuko-brand-mark {
          width: 34px;
          height: 34px;
          display: grid;
          place-items: center;
          border: 1px solid rgba(17, 17, 17, 0.72);
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.62);
        }

        .stuko-brand-mark svg {
          width: 23px;
          height: 23px;
          fill: none;
          stroke: currentColor;
          stroke-width: 1.3;
          stroke-linecap: round;
        }

        .stuko-account { position: relative; }

        .stuko-profile-trigger {
          border: 0;
          background: transparent;
          color: var(--stuko-black);
          display: inline-flex;
          align-items: center;
          gap: 9px;
          cursor: pointer;
          padding: 3px 0 3px 7px;
          font: 400 13px/1 Roobert, ui-sans-serif, sans-serif;
        }

        .stuko-profile-trigger svg {
          transition: transform 0.55s var(--stuko-ease);
        }

        .stuko-profile-trigger svg.rotate { transform: rotate(180deg); }

        .stuko-avatar {
          width: 36px;
          height: 36px;
          display: grid;
          place-items: center;
          overflow: hidden;
          border-radius: 50%;
          background: var(--stuko-black);
          color: #fff;
          font-size: 12px;
        }

        .stuko-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .stuko-account-menu {
          position: absolute;
          right: 0;
          top: calc(100% + 10px);
          width: 190px;
          padding: 7px;
          background: rgba(255, 255, 255, 0.94);
          border: 1px solid rgba(255, 255, 255, 0.98);
          border-radius: 18px;
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          box-shadow: 0 18px 45px rgba(30, 90, 115, 0.14);
          animation: stuko-menu-in 0.45s var(--stuko-ease) both;
        }

        @keyframes stuko-menu-in {
          from { opacity: 0; transform: translateY(-7px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        .stuko-account-menu button {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 11px;
          border: 0;
          border-radius: 12px;
          background: transparent;
          color: var(--stuko-black);
          cursor: pointer;
          text-align: left;
          font: 400 13px Roobert, ui-sans-serif, sans-serif;
        }

        .stuko-account-menu button:hover { background: rgba(0, 0, 0, 0.055); }

        /* Reference-inspired picker composition: quiet intro + small rounded choices. */
        .stuko-main {
          width: min(calc(100% - 40px), 980px);
          margin: 0 auto;
          flex: 1 0 auto;
          padding: clamp(76px, 11vh, 126px) 0 110px;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .stuko-intro {
          width: min(100%, 760px);
          text-align: center;
        }

        .stuko-eyebrow {
          margin: 0 0 18px;
          color: rgba(17, 17, 17, 0.48);
          font: 600 11px/1.2 Roobert, ui-sans-serif, sans-serif;
          letter-spacing: 0.16em;
          text-transform: uppercase;
        }

        .stuko-intro h1 {
          margin: 0;
          font: 400 clamp(58px, 8vw, 100px)/0.9 Roobert, ui-sans-serif, sans-serif;
          letter-spacing: -0.075em;
        }

        .stuko-intro h1 em {
          font-style: normal;
          font-weight: 300;
        }

        .stuko-subtitle {
          width: min(100%, 520px);
          margin: 23px auto 0;
          color: var(--stuko-muted);
          font: 400 16px/1.45 Roobert, ui-sans-serif, sans-serif;
        }

        /* These are chips, not cards. No icons, descriptions, shadows or giant rows. */
        .stuko-tool-grid {
          width: min(100%, 840px);
          margin-top: 52px;
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          align-items: center;
          gap: 12px;
        }

        .stuko-tool {
          min-height: 48px;
          padding: 13px 22px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          color: var(--stuko-black);
          text-decoration: none;
          white-space: nowrap;
          background: var(--stuko-white-78);
          border: 1px solid rgba(255, 255, 255, 0.98);
          border-radius: 75px;
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
          box-shadow: 0 7px 22px rgba(38, 112, 140, 0.075);
          font: 400 15px/1.1 Roobert, ui-sans-serif, sans-serif;
          letter-spacing: -0.01em;
          transition:
            transform 0.55s var(--stuko-ease),
            background 0.4s ease,
            border-color 0.4s ease;
        }

        .stuko-tool:hover {
          transform: translateY(-3px);
          background: rgba(255, 255, 255, 0.92);
          border-color: #fff;
        }

        .stuko-tool:active { transform: translateY(-1px) scale(0.985); }

        .stuko-footer {
          border-top: 1px solid rgba(255, 255, 255, 0.95);
          border-bottom: 0;
        }

        .stuko-footer-inner {
          min-height: 78px;
          padding: 16px 0;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 24px;
        }

        .stuko-footer-brand {
          color: var(--stuko-black);
          font: 400 12px/1 Roobert, ui-sans-serif, sans-serif;
          letter-spacing: 0.08em;
        }

        .stuko-footer nav {
          display: flex;
          flex-wrap: wrap;
          justify-content: flex-end;
          gap: 9px 25px;
        }

        .stuko-footer a {
          color: rgba(17, 17, 17, 0.58);
          text-decoration: none;
          font: 400 12px/1.35 Roobert, ui-sans-serif, sans-serif;
          transition: color 0.35s ease;
        }

        .stuko-footer a:hover { color: var(--stuko-black); }

        .stuko-loader {
          min-height: 100svh;
          position: relative;
          isolation: isolate;
          display: grid;
          place-items: center;
          overflow: hidden;
          background: #fff;
          font-family: Roobert, ui-sans-serif, sans-serif;
        }

        .stuko-cloud-layer {
          position: absolute;
          inset: 0;
          background: #fff url('/stuko-clouds.jpg') center / cover no-repeat;
          opacity: 0.30;
        }

        .loader-glass {
          position: relative;
          z-index: 1;
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 13px 18px;
          border: 1px solid rgba(255, 255, 255, 0.96);
          border-radius: 18px;
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          font: 400 16px/1 Roobert, ui-sans-serif, sans-serif;
          letter-spacing: 0.08em;
        }

        .loader-logo-mark {
          width: 24px;
          height: 24px;
          position: relative;
          display: block;
        }

        .loader-logo-mark i {
          position: absolute;
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background: var(--stuko-black);
          animation: loader-dot 1.2s ease-in-out infinite;
        }

        .loader-logo-mark i:nth-child(1) { left: 2px; top: 10px; }
        .loader-logo-mark i:nth-child(2) { left: 10px; top: 4px; animation-delay: 0.12s; }
        .loader-logo-mark i:nth-child(3) { left: 18px; top: 12px; animation-delay: 0.24s; }

        @keyframes loader-dot {
          0%, 100% { transform: translateY(0); opacity: 0.35; }
          50% { transform: translateY(-5px); opacity: 1; }
        }

        @media (max-width: 600px) {
          .stuko-header-inner,
          .stuko-footer-inner,
          .stuko-main { width: min(calc(100% - 24px), 980px); }

          .stuko-header-inner { min-height: 68px; }
          .stuko-profile-name { display: none; }
          .stuko-main { padding: 70px 0 82px; }
          .stuko-intro h1 { font-size: clamp(52px, 16vw, 82px); }
          .stuko-subtitle { font-size: 14px; }
          .stuko-tool-grid { margin-top: 42px; gap: 10px; }
          .stuko-tool { min-height: 45px; padding: 12px 18px; font-size: 14px; }
          .stuko-footer-inner { min-height: 92px; flex-direction: column; align-items: flex-start; justify-content: center; }
          .stuko-footer nav { justify-content: flex-start; gap: 9px 18px; }
        }

        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after {
            scroll-behavior: auto !important;
            animation-duration: 0.01ms !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>

      <header className="stuko-header">
        <div className="stuko-header-inner">
          <a className="stuko-brand" href="/" aria-label="STUKO home">
            <span className="stuko-brand-mark" aria-hidden="true">
              <svg viewBox="0 0 28 28" role="img">
                <path d="M5 14c2.4-5.7 5.1-8.5 8-8.5 2.5 0 3.9 2.2 5.4 4.3C19.7 12.1 21.3 14 23 14" />
                <path d="M5 14c2.4 5.7 5.1 8.5 8 8.5 2.5 0 3.9-2.2 5.4-4.3C19.7 15.9 21.3 14 23 14" />
                <circle cx="5" cy="14" r="1.7" />
                <circle cx="23" cy="14" r="1.7" />
              </svg>
            </span>
            <span>STUKO</span>
          </a>

          <div className="stuko-account">
            <button
              className="stuko-profile-trigger"
              onClick={() => setMenuOpen((open) => !open)}
              aria-expanded={menuOpen}
              aria-haspopup="menu"
              type="button"
            >
              <span className="stuko-avatar">
                {profile?.photoURL ? <img src={profile.photoURL} alt="" /> : initials}
              </span>
              <span className="stuko-profile-name">{displayName}</span>
              <ChevronDown className={menuOpen ? 'rotate' : ''} size={15} strokeWidth={1.7} />
            </button>

            {menuOpen && (
              <div className="stuko-account-menu" role="menu">
                <button
                  role="menuitem"
                  type="button"
                  onClick={() => {
                    window.location.href = `/u/${profile?.username || ''}`;
                  }}
                >
                  <UserRound size={16} strokeWidth={1.6} />
                  <span>Public profile</span>
                </button>
                <button
                  role="menuitem"
                  type="button"
                  onClick={() => {
                    window.location.href = '/settings';
                  }}
                >
                  <Settings size={16} strokeWidth={1.6} />
                  <span>Settings</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <section className="stuko-main" aria-label="STUKO study tools">
        <div className="stuko-intro">
          <p className="stuko-eyebrow">welcome to stuko</p>
          <h1>study,<br /><em>your way.</em></h1>
          <p className="stuko-subtitle">
            choose a little corner and get to work.
          </p>
        </div>

        <div className="stuko-tool-grid">
          {tools.map(({ title, href }) => (
            <a className="stuko-tool" href={href} key={title}>
              {title}
            </a>
          ))}
        </div>
      </section>

      <footer className="stuko-footer">
        <div className="stuko-footer-inner">
          <span className="stuko-footer-brand">STUKO</span>
          <nav aria-label="Legal">
            <a href="/privacy-policy">Privacy Policy</a>
            <a href="/terms-and-conditions">Terms and Conditions</a>
            <a href="/cookie-policy">Cookie Policy</a>
          </nav>
        </div>
      </footer>
    </main>
  );
}
