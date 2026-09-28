'use client';

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

      <header className="picker-header">
        <button className="back-link" type="button" onClick={() => window.history.back()}>
          ← back
        </button>
        <span className="picker-brand">rila</span>
        <span className="step">1&nbsp; / &nbsp;∞</span>
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
        overflow: hidden;
        isolation: isolate;
        color: #090909;
        background: #fff;
        font-family: Georgia, 'Times New Roman', serif;
      }

      .reference-clouds {
        position: fixed;
        inset: 0;
        z-index: -1;
        pointer-events: none;
        background: #fff url('/stuko-clouds.jpg') center center / cover no-repeat;
        opacity: 0.30;
      }

      .picker-header {
        position: relative;
        z-index: 2;
        width: 100%;
        height: 78px;
        padding: 0 57px;
        display: grid;
        grid-template-columns: 1fr auto 1fr;
        align-items: center;
        box-sizing: border-box;
      }

      .back-link,
      .step,
      .picker-brand {
        color: #090909;
      }

      .back-link {
        justify-self: start;
        padding: 0;
        border: 0;
        background: transparent;
        cursor: pointer;
        font-size: 19px;
        line-height: 1;
        letter-spacing: -0.02em;
      }

      .back-link:hover {
        opacity: 0.55;
      }

      .picker-brand {
        justify-self: center;
        font-size: 42px;
        line-height: 1;
        letter-spacing: -0.075em;
      }

      .step {
        justify-self: end;
        font-size: 13px;
        line-height: 1;
        letter-spacing: 0.04em;
      }

      .options-panel {
        position: relative;
        z-index: 1;
        width: min(100% - 40px, 1060px);
        min-height: calc(100svh - 78px);
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
        .picker-header {
          height: 68px;
          padding: 0 22px;
        }

        .back-link {
          font-size: 16px;
        }

        .picker-brand {
          font-size: 34px;
        }

        .step {
          font-size: 11px;
        }

        .options-panel {
          width: min(100% - 28px, 680px);
          min-height: calc(100svh - 68px);
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
      }

      @media (max-width: 480px) {
        .picker-header {
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
