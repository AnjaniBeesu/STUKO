'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { firebaseConfigured, getFirebase } from '@/lib/firebase';

type Profile = {
  username?: string;
};

const options = [
  'bouquet',
  'letter',
  'drawing',
  'tune',
  'avatars',
  'pictures',
  'little world',
];

export default function HomePage() {
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string[]>([]);
  const [profileOpen, setProfileOpen] = useState(false);
  const [username, setUsername] = useState('');

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

      if (!snap.exists() || !(snap.data() as Profile).username) {
        window.location.href = '/onboarding';
        return;
      }

      setUsername((snap.data() as Profile).username ?? '');
      setLoading(false);
    });
  }, []);

  const toggleOption = (option: string) => {
    setSelected((current) =>
      current.includes(option)
        ? current.filter((item) => item !== option)
        : [...current, option],
    );
  };

  if (loading) {
    return (
      <main className="reference-page">
        <div className="reference-clouds" aria-hidden="true" />
        <div className="reference-loader">rila</div>
        <ReferenceStyles />
      </main>
    );
  }

  return (
    <main className="reference-page">
      <div className="reference-clouds" aria-hidden="true" />

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
              <Link
                href={username ? `/u/${encodeURIComponent(username)}` : '/profile'}
                role="menuitem"
                onClick={() => setProfileOpen(false)}
              >
                public profile
              </Link>
              <Link href="/settings" role="menuitem" onClick={() => setProfileOpen(false)}>
                settings
              </Link>
            </div>
          )}
        </div>
      </header>

      <section className="options-panel">
        <p className="options-kicker">let's make something little</p>
        <h1 className="picker-title">
          select what you want
          <br />
          your beloved to see.
        </h1>
        <p className="picker-subtitle">choose as many as you like.</p>

        <div className="options-row" aria-label="options">
          {options.map((option) => {
            const isSelected = selected.includes(option);
            return (
              <button
                key={option}
                type="button"
                className={`option-chip${isSelected ? ' selected' : ''}`}
                aria-pressed={isSelected}
                onClick={() => toggleOption(option)}
              >
                {option}
              </button>
            );
          })}
        </div>

        <button className="continue-button" type="button" disabled={selected.length === 0}>
          {selected.length === 0 ? 'choose something first' : 'continue'}
        </button>
      </section>

      <footer className="stuko-footer">
        <Link href="/privacy">privacy policy</Link>
        <Link href="/terms">terms and conditions</Link>
        <Link href="/cookies">cookie policy</Link>
      </footer>

      <ReferenceStyles />
    </main>
  );
}

function ReferenceStyles() {
  return (
    <style jsx global>{`
      html,
      body {
        margin: 0;
        min-height: 100%;
        background: #fff;
      }

      body {
        overflow-x: hidden;
      }

      button {
        font: inherit;
      }

      .reference-page {
        position: relative;
        min-height: 100svh;
        width: 100%;
        overflow-x: hidden;
        isolation: isolate;
        color: #090909;
        background: #fff;
        font-family: Georgia, 'Times New Roman', serif;
        display: flex;
        flex-direction: column;
      }

      .reference-clouds {
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

      .stuko-header,
      .stuko-footer {
        position: relative;
        z-index: 5;
        width: 100%;
        box-sizing: border-box;
        background: rgba(255, 255, 255, 0.85);
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        flex-shrink: 0;
      }

      .stuko-header {
        min-height: 78px;
        padding: 0 42px;
        display: flex;
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

      .profile-menu-wrap {
        position: relative;
      }

      .profile-button {
        appearance: none;
        border: 0;
        background: transparent;
        color: #090909;
        padding: 10px 2px;
        cursor: pointer;
        font-size: 16px;
        line-height: 1;
        letter-spacing: -0.02em;
      }

      .profile-chevron {
        display: inline-block;
        margin-left: 5px;
        transition: transform 180ms ease;
      }

      .profile-chevron.open {
        transform: rotate(180deg);
      }

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
        z-index: 10;
      }

      .profile-dropdown a {
        display: block;
        padding: 12px 13px;
        color: #090909;
        text-decoration: none;
        font-size: 15px;
        line-height: 1;
      }

      .profile-dropdown a:hover {
        background: rgba(0, 0, 0, 0.06);
      }

      .options-panel {
        position: relative;
        z-index: 1;
        width: min(100% - 40px, 1060px);
        flex: 1;
        min-height: calc(100svh - 156px);
        margin: 0 auto;
        padding: clamp(90px, 13.8vh, 145px) 0 90px;
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
      }

      .options-kicker {
        margin: 0 0 26px;
        font-family: 'Courier New', Courier, monospace;
        font-size: 14px;
        line-height: 1.2;
        letter-spacing: 0.17em;
      }

      .picker-title {
        margin: 0;
        max-width: 1060px;
        font-size: clamp(58px, 5.9vw, 94px);
        font-weight: 400;
        line-height: 0.98;
        letter-spacing: -0.065em;
      }

      .picker-subtitle {
        margin: 28px 0 0;
        font-size: 20px;
        line-height: 1.2;
        letter-spacing: -0.025em;
      }

      .options-row {
        width: 100%;
        margin-top: 55px;
        display: flex;
        justify-content: center;
        align-items: center;
        flex-wrap: wrap;
        gap: 10px 14px;
      }

      .option-chip {
        appearance: none;
        padding: 12px 21px 13px;
        border: 1px solid rgba(40, 40, 40, 0.20);
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.14);
        color: #111;
        cursor: pointer;
        font-size: 18px;
        line-height: 1;
        letter-spacing: -0.025em;
        backdrop-filter: blur(2px);
        -webkit-backdrop-filter: blur(2px);
        transition: border-color 180ms ease, background 180ms ease, transform 180ms ease;
      }

      .option-chip:hover {
        background: rgba(255, 255, 255, 0.34);
        border-color: rgba(20, 20, 20, 0.35);
        transform: translateY(-1px);
      }

      .option-chip.selected {
        border-color: #111;
        background: rgba(255, 255, 255, 0.28);
      }

      .continue-button {
        margin-top: 45px;
        padding: 14px 29px 15px;
        border: 1px solid rgba(40, 40, 40, 0.20);
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.12);
        color: rgba(25, 25, 25, 0.30);
        cursor: pointer;
        font-size: 17px;
        line-height: 1;
        transition: 180ms ease;
      }

      .continue-button:not(:disabled) {
        color: #111;
        border-color: #111;
        background: rgba(255, 255, 255, 0.35);
      }

      .continue-button:disabled {
        cursor: default;
      }

      .stuko-footer {
        min-height: 72px;
        padding: 0 42px;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 34px;
        border-top: 1px solid rgba(0, 0, 0, 0.08);
      }

      .stuko-footer a {
        color: #090909;
        text-decoration: none;
        font-size: 14px;
        line-height: 1;
      }

      .stuko-footer a:hover {
        opacity: 0.55;
      }

      .reference-loader {
        position: relative;
        z-index: 1;
        min-height: 100svh;
        display: grid;
        place-items: center;
        font-size: 42px;
        letter-spacing: -0.075em;
      }

      @media (max-width: 800px) {
        .stuko-header {
          min-height: 68px;
          padding: 0 22px;
        }

        .stuko-brand {
          font-size: 21px;
        }

        .stuko-logo {
          width: 24px;
          height: 24px;
          font-size: 20px;
        }

        .profile-button {
          font-size: 15px;
        }

        .options-panel {
          width: min(100% - 28px, 680px);
          min-height: calc(100svh - 140px);
          padding-top: 12vh;
        }

        .options-kicker {
          margin-bottom: 20px;
          font-size: 11px;
        }

        .picker-title {
          font-size: clamp(43px, 10vw, 68px);
          line-height: 0.98;
        }

        .picker-subtitle {
          margin-top: 20px;
          font-size: 17px;
        }

        .options-row {
          margin-top: 38px;
          gap: 9px;
        }

        .option-chip {
          font-size: 16px;
          padding: 11px 17px 12px;
        }

        .stuko-footer {
          min-height: 68px;
          padding: 14px 18px;
          gap: 18px;
          flex-wrap: wrap;
        }

        .stuko-footer a {
          font-size: 12px;
        }
      }

      @media (max-width: 480px) {
        .stuko-header {
          padding: 0 15px;
        }

        .options-panel {
          padding-top: 10vh;
        }

        .picker-title {
          font-size: 42px;
        }

        .options-row {
          max-width: 360px;
        }
      }
    `}</style>
  );
}
