'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { firebaseConfigured, getFirebase } from '@/lib/firebase';
import SiteChrome from '@/app/components/SiteChrome';

type Profile = { username?: string };

const options = [
  { label: 'pomodoro timer', href: '/pomodoro' },
  { label: 'study room', href: '/study-room' },
  { label: 'flashcards', href: '/flashcards' },
  { label: 'quiz', href: '/quiz' },
  { label: 'summarizer', href: '/summarizer' },
  { label: 'library', href: '/library' },
];

const extraOptions = [
  { label: 'exam mode', href: '/exam-mode' },
  { label: 'notes', href: '/notes' },
  { label: 'search', href: '/note-search' },
  { label: 'upload', href: '/document-reader' },
];

const academicOptions = [
  { label: 'attendance calc', href: '/attendance' },
  { label: 'cgpa calc', href: '/sgpa-cgpa' },
];

export default function HomePage() {
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState('');

  useEffect(() => {
    if (!firebaseConfigured()) { setLoading(false); return; }
    const { auth, db } = getFirebase();
    return onAuthStateChanged(auth, async (user) => {
      if (!user) { window.location.href = '/auth'; return; }
      const snap = await getDoc(doc(db, 'users', user.uid));
      if (!snap.exists() || !(snap.data() as Profile).username) { window.location.href = '/onboarding'; return; }
      setUsername((snap.data() as Profile).username ?? '');
      setLoading(false);
    });
  }, []);

  if (loading) return <SiteChrome><div className="stuko-home-loader">STUKO</div><HomeStyles /></SiteChrome>;

  return (
    <SiteChrome>
      <section className="stuko-home-options">
        <p className="options-kicker">welcome, {username}</p>
        <h1 className="picker-title">lets start grademaxxing</h1>
        <p className="picker-subtitle">start studying</p>
        <div className="options-grid" aria-label="study options">
          <div className="options-row options-row-main">
            {options.map((option) => <Link key={option.href} href={option.href} className="option-chip">{option.label}</Link>)}
          </div>
          <div className="options-row options-row-extra">
            {extraOptions.map((option) => <Link key={option.href} href={option.href} className="option-chip">{option.label}</Link>)}
          </div>
          <div className="options-row options-row-academic">
            {academicOptions.map((option) => <Link key={option.href} href={option.href} className="option-chip">{option.label}</Link>)}
          </div>
        </div>
      </section>
      <HomeStyles />
    </SiteChrome>
  );
}

function HomeStyles() {
  return <style jsx global>{`
    .stuko-home-options { position: relative; z-index: 2; width: min(100% - 40px, 1060px); min-height: calc(100svh - 190px); margin: 0 auto; padding: clamp(168px, 17vh, 205px) 0 150px; box-sizing: border-box; display: flex; flex-direction: column; align-items: center; text-align: center; }
    .options-kicker { margin: 0 0 26px; font-family: 'Courier New', Courier, monospace; font-size: 14px; line-height: 1.2; letter-spacing: .17em; }
    .picker-title { margin: 0; max-width: 1060px; font-size: clamp(58px, 5.9vw, 94px); font-weight: 400; line-height: .98; letter-spacing: -.065em; }
    .picker-subtitle { margin: 28px 0 0; font-size: 20px; line-height: 1.2; letter-spacing: -.025em; }

    /* Every row gets the same visual footprint, so the landing page stays balanced. */
    .options-grid { width: 100%; margin-top: 55px; display: grid; gap: 12px; }
    .options-row { width: 100%; min-height: 52px; display: grid; grid-auto-flow: column; grid-auto-columns: minmax(0, 1fr); gap: 12px; align-items: stretch; }
    .options-row-extra { grid-template-columns: repeat(4, minmax(0, 1fr)); }
    .options-row-academic { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .option-chip { appearance: none; min-width: 0; display: flex; align-items: center; justify-content: center; padding: 12px 14px 13px; border: 1px solid rgba(40,40,40,.20); border-radius: 999px; background: rgba(255,255,255,.14); color: #111; cursor: pointer; font-size: 18px; line-height: 1; letter-spacing: -.025em; text-decoration: none; backdrop-filter: blur(4px); -webkit-backdrop-filter: blur(4px); transition: border-color 180ms ease, background 180ms ease, color 180ms ease, transform 180ms ease; }
    .option-chip:hover { background: rgba(255,255,255,.34); border-color: rgba(20,20,20,.35); transform: translateY(-1px); }
    .stuko-dark .option-chip { border-color: rgba(255,255,255,.22); background: rgba(255,255,255,.08); color: #f5f5f5; }
    .stuko-dark .option-chip:hover { background: rgba(255,255,255,.16); border-color: rgba(255,255,255,.38); }
    .stuko-home-loader { position: relative; z-index: 2; min-height: calc(100svh - 142px); display: grid; place-items: center; color: var(--page-text); font-size: 32px; }

    @media (max-width: 760px) {
      .stuko-home-options { width: min(100% - 24px, 1060px); min-height: calc(100svh - 160px); padding-top: 138px; padding-bottom: 120px; }
      .picker-title { font-size: clamp(45px, 13vw, 70px); }
      .options-grid { gap: 10px; }
      .options-row { grid-auto-flow: row; grid-template-columns: repeat(2, minmax(0, 1fr)) !important; min-height: 0; gap: 10px; }
      .option-chip { min-height: 48px; font-size: 16px; }
      .options-row-main { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
      .options-row-academic { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
    }
  `}</style>;
}
