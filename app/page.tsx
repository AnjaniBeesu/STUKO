'use client';

import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import {
  ArrowUpRight,
  Brain,
  ChevronDown,
  Clock3,
  DoorOpen,
  FileText,
  Layers3,
  LibraryBig,
  Settings,
  UserRound,
} from 'lucide-react';
import { firebaseConfigured, getFirebase } from '@/lib/firebase';

type Profile = {
  displayName?: string;
  username?: string;
  photoURL?: string;
};

type Tool = {
  title: string;
  description: string;
  href: string;
  icon: typeof Clock3;
};

const tools: Tool[] = [
  {
    title: 'Pomodoro timer',
    description: 'Focus in simple, calm intervals.',
    href: '/pomodoro',
    icon: Clock3,
  },
  {
    title: 'Enter study room',
    description: 'Go into your room and study with others.',
    href: '/study-room',
    icon: DoorOpen,
  },
  {
    title: 'Flashcards maker',
    description: 'Turn your notes into a deck.',
    href: '/flashcards',
    icon: Layers3,
  },
  {
    title: 'Quiz maker',
    description: 'Make a quick quiz from what you know.',
    href: '/quiz',
    icon: Brain,
  },
  {
    title: 'Summarizer',
    description: 'Shrink long material into useful notes.',
    href: '/summarizer',
    icon: FileText,
  },
  {
    title: 'Your library',
    description: 'All your study things, kept together.',
    href: '/library',
    icon: LibraryBig,
  },
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
        <div className="stuko-loader-clouds" aria-hidden="true" />
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
          --stuko-muted: rgba(17, 17, 17, 0.58);
          --stuko-white-85: rgba(255, 255, 255, 0.85);
          --stuko-white-72: rgba(255, 255, 255, 0.72);
          --stuko-white-55: rgba(255, 255, 255, 0.55);
          --stuko-border: rgba(255, 255, 255, 0.9);
          --stuko-ease: cubic-bezier(0.19, 1, 0.22, 1);
        }

        * { box-sizing: border-box; }
        html { min-height: 100%; scroll-behavior: smooth; }
        body {
          margin: 0;
          min-height: 100%;
          background: #ffffff;
          color: var(--stuko-black);
        }
        button, a { -webkit-tap-highlight-color: transparent; }

        .stuko-home {
          min-height: 100svh;
          position: relative;
          isolation: isolate;
          overflow-x: hidden;
          font-family: Roobert, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        }

        /* The supplied cloud artwork is deliberately kept at 30% opacity over white. */
        .stuko-background {
          position: fixed;
          inset: 0;
          z-index: -2;
          background: #ffffff;
          pointer-events: none;
        }

        .stuko-background::before {
          content: '';
          position: absolute;
          inset: 0;
          background: url('/stuko-clouds.jpg') center center / cover no-repeat;
          opacity: 0.30;
        }

        .stuko-background::after {
          content: '';
          position: absolute;
          inset: 0;
          background: rgba(255, 255, 255, 0.05);
        }

        .stuko-header,
        .stuko-footer {
          width: min(calc(100% - 40px), 1180px);
          margin-inline: auto;
          background: var(--stuko-white-85);
          border: 1px solid var(--stuko-border);
          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);
          box-shadow: 0 14px 40px rgba(37, 99, 125, 0.09);
          border-radius: 22px;
        }

        .stuko-header {
          position: sticky;
          top: 20px;
          z-index: 30;
          min-height: 70px;
          padding: 12px 16px 12px 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .stuko-brand {
          display: inline-flex;
          align-items: center;
          gap: 11px;
          color: var(--stuko-black);
          text-decoration: none;
          font-size: 18px;
          line-height: 1;
          letter-spacing: -0.04em;
        }

        .stuko-brand-mark {
          width: 34px;
          height: 34px;
          display: grid;
          place-items: center;
          border: 1px solid rgba(17, 17, 17, 0.8);
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.7);
        }

        .stuko-brand-mark svg {
          width: 23px;
          height: 23px;
          fill: none;
          stroke: var(--stuko-black);
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
          padding: 3px 2px 3px 7px;
          font: 400 13px/1 Roobert, ui-sans-serif, sans-serif;
        }

        .stuko-profile-trigger svg {
          transition: transform 0.5s var(--stuko-ease);
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
          color: white;
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
          top: calc(100% + 12px);
          width: 190px;
          padding: 7px;
          background: rgba(255, 255, 255, 0.92);
          border: 1px solid rgba(255, 255, 255, 0.98);
          border-radius: 18px;
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          box-shadow: 0 18px 45px rgba(20, 70, 95, 0.15);
          animation: stukoMenuIn 0.45s var(--stuko-ease) both;
        }

        @keyframes stukoMenuIn {
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

        .stuko-main {
          width: min(calc(100% - 40px), 980px);
          margin: 0 auto;
          padding: 86px 0 76px;
        }

        .stuko-intro {
          max-width: 700px;
          margin: 0 auto 52px;
          text-align: center;
        }

        .stuko-eyebrow {
          margin: 0 0 15px;
          color: rgba(17, 17, 17, 0.5);
          font: 600 11px/1 Roobert, ui-sans-serif, sans-serif;
          letter-spacing: 0.16em;
        }

        .stuko-intro h1 {
          margin: 0;
          font: 400 clamp(58px, 8vw, 108px)/0.86 Roobert, ui-sans-serif, sans-serif;
          letter-spacing: -0.075em;
        }

        .stuko-intro h1 em {
          font-style: normal;
          font-weight: 300;
        }

        .stuko-subtitle {
          max-width: 520px;
          margin: 22px auto 0;
          color: var(--stuko-muted);
          font: 400 16px/1.45 Roobert, ui-sans-serif, sans-serif;
        }

        /* Cute, compact glass buttons — intentionally not cards/list rows. */
        .stuko-tool-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 16px;
        }

        .stuko-tool {
          min-height: 142px;
          padding: 20px 20px 18px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          text-decoration: none;
          color: var(--stuko-black);
          background: var(--stuko-white-72);
          border: 1px solid rgba(255, 255, 255, 0.96);
          border-radius: 24px;
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          box-shadow: 0 9px 28px rgba(45, 113, 140, 0.08);
          transition:
            transform 0.7s var(--stuko-ease),
            background 0.45s ease,
            box-shadow 0.7s ease;
        }

        .stuko-tool:hover {
          transform: translateY(-5px);
          background: rgba(255, 255, 255, 0.86);
          box-shadow: 0 16px 38px rgba(45, 113, 140, 0.13);
        }

        .stuko-tool:active { transform: translateY(-2px) scale(0.99); }

        .stuko-tool-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          color: rgba(17, 17, 17, 0.55);
        }

        .stuko-tool-icon {
          width: 32px;
          height: 32px;
          display: grid;
          place-items: center;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.58);
          border: 1px solid rgba(17, 17, 17, 0.08);
        }

        .stuko-tool-title-row {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 12px;
          margin-top: 20px;
        }

        .stuko-tool h2 {
          margin: 0;
          font: 400 clamp(18px, 2vw, 23px)/1.05 Roobert, ui-sans-serif, sans-serif;
          letter-spacing: -0.045em;
        }

        .stuko-tool p {
          margin: 7px 0 0;
          color: rgba(17, 17, 17, 0.52);
          font: 400 11px/1.35 Roobert, ui-sans-serif, sans-serif;
        }

        .stuko-tool-arrow {
          flex: 0 0 auto;
          transition: transform 0.7s var(--stuko-ease);
        }

        .stuko-tool:hover .stuko-tool-arrow { transform: translate(3px, -3px); }

        .stuko-footer {
          min-height: 68px;
          margin-bottom: 20px;
          padding: 14px 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
        }

        .stuko-footer-brand {
          font: 400 12px Roobert, ui-sans-serif, sans-serif;
          letter-spacing: 0.08em;
        }

        .stuko-footer nav {
          display: flex;
          flex-wrap: wrap;
          justify-content: flex-end;
          gap: 8px 24px;
        }

        .stuko-footer a {
          color: rgba(17, 17, 17, 0.58);
          text-decoration: none;
          font: 400 11px Roobert, ui-sans-serif, sans-serif;
          transition: color 0.35s ease;
        }

        .stuko-footer a:hover { color: var(--stuko-black); }

        .stuko-loader {
          min-height: 100svh;
          position: relative;
          isolation: isolate;
          display: grid;
          place-items: center;
          background: white;
          overflow: hidden;
          font-family: Roobert, ui-sans-serif, sans-serif;
        }

        .stuko-loader-clouds {
          position: absolute;
          inset: 0;
          background: url('/stuko-clouds.jpg') center / cover no-repeat;
          opacity: 0.30;
        }

        .loader-glass {
          position: relative;
          z-index: 1;
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 13px 18px;
          border: 1px solid rgba(255, 255, 255, 0.95);
          border-radius: 18px;
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          font-size: 16px;
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
          animation: loaderDot 1.2s ease-in-out infinite;
        }

        .loader-logo-mark i:nth-child(1) { left: 2px; top: 10px; }
        .loader-logo-mark i:nth-child(2) { left: 10px; top: 4px; animation-delay: 0.12s; }
        .loader-logo-mark i:nth-child(3) { left: 18px; top: 12px; animation-delay: 0.24s; }

        @keyframes loaderDot {
          0%, 100% { transform: translateY(0); opacity: 0.35; }
          50% { transform: translateY(-5px); opacity: 1; }
        }

        @media (max-width: 820px) {
          .stuko-tool-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        }

        @media (max-width: 600px) {
          .stuko-header,
          .stuko-footer,
          .stuko-main { width: min(calc(100% - 24px), 980px); }

          .stuko-header { top: 12px; }
          .stuko-main { padding: 68px 0 60px; }
          .stuko-intro { margin-bottom: 38px; }
          .stuko-intro h1 { font-size: clamp(52px, 16vw, 82px); }
          .stuko-subtitle { font-size: 14px; }
          .stuko-tool-grid { grid-template-columns: 1fr; gap: 12px; }
          .stuko-tool { min-height: 116px; border-radius: 20px; }
          .stuko-profile-name { display: none; }
          .stuko-footer { margin-bottom: 12px; flex-direction: column; align-items: flex-start; }
          .stuko-footer nav { justify-content: flex-start; gap: 9px 17px; }
        }

        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after {
            scroll-behavior: auto !important;
            animation-duration: 0.01ms !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>

      <div className="stuko-background" aria-hidden="true" />

      <header className="stuko-header">
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
                onClick={() => {
                  window.location.href = `/u/${profile?.username || ''}`;
                }}
              >
                <UserRound size={16} strokeWidth={1.6} />
                <span>Public profile</span>
              </button>
              <button
                role="menuitem"
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
      </header>

      <section className="stuko-main" aria-label="STUKO study tools">
        <div className="stuko-intro">
          <p className="stuko-eyebrow">WELCOME TO STUKO</p>
          <h1>Study,<br /><em>your way.</em></h1>
          <p className="stuko-subtitle">
            Pick a little corner and get to work. Everything you need is right here.
          </p>
        </div>

        <div className="stuko-tool-grid">
          {tools.map(({ title, description, href, icon: Icon }) => (
            <a className="stuko-tool" href={href} key={title}>
              <div className="stuko-tool-top">
                <span className="stuko-tool-icon" aria-hidden="true">
                  <Icon size={16} strokeWidth={1.6} />
                </span>
              </div>

              <div className="stuko-tool-title-row">
                <div>
                  <h2>{title}</h2>
                  <p>{description}</p>
                </div>
                <ArrowUpRight className="stuko-tool-arrow" size={17} strokeWidth={1.5} aria-hidden="true" />
              </div>
            </a>
          ))}
        </div>
      </section>

      <footer className="stuko-footer">
        <span className="stuko-footer-brand">STUKO</span>
        <nav aria-label="Legal">
          <a href="/privacy-policy">Privacy Policy</a>
          <a href="/terms-and-conditions">Terms and Conditions</a>
          <a href="/cookie-policy">Cookie Policy</a>
        </nav>
      </footer>
    </main>
  );
}
