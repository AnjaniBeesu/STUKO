'use client';

import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { ChevronDown, Settings, UserRound, ArrowUpRight, Clock3, DoorOpen, Layers3, Brain, FileText, LibraryBig } from 'lucide-react';
import { firebaseConfigured, getFirebase } from '@/lib/firebase';

type Profile = { displayName?: string; username?: string; photoURL?: string };

type Tool = {
  number: string;
  title: string;
  description: string;
  href: string;
  icon: typeof Clock3;
};

const tools: Tool[] = [
  { number: '01', title: 'Pomodoro timer', description: 'Focus in clean, intentional intervals.', href: '/pomodoro', icon: Clock3 },
  { number: '02', title: 'Enter study room', description: 'Drop into a room and study alongside others.', href: '/study-room', icon: DoorOpen },
  { number: '03', title: 'Flashcards maker', description: 'Build a deck from whatever you are learning.', href: '/flashcards', icon: Layers3 },
  { number: '04', title: 'Quiz maker', description: 'Turn your notes into something you can test.', href: '/quiz', icon: Brain },
  { number: '05', title: 'Summarizer', description: 'Make long material easier to hold in your head.', href: '/summarizer', icon: FileText },
  { number: '06', title: 'Your library', description: 'Keep your study material in one quiet place.', href: '/library', icon: LibraryBig },
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
        <div className="loader-glass">
          <span className="loader-logo-mark" aria-hidden="true"><i /><i /><i /></span>
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
          --stuko-white: rgba(255,255,255,.85);
          --stuko-glass: rgba(255,255,255,.46);
          --stuko-border: rgba(255,255,255,.74);
          --stuko-text: #111111;
          --stuko-muted: rgba(17,17,17,.62);
          --stuko-shadow: 0 18px 50px rgba(32,83,111,.10);
        }
        * { box-sizing: border-box; }
        html { scroll-behavior: smooth; }
        body { margin: 0; background: #dff4ff; }
        button, a { -webkit-tap-highlight-color: transparent; }
        .stuko-home { min-height: 100svh; position: relative; color: var(--stuko-text); font-family: Roobert, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; overflow-x: hidden; }
        .stuko-background { position: fixed; z-index: -2; inset: 0; background: #bfe9fb url('/stuko-clouds.jpg') center / cover no-repeat; }
        .stuko-background::after { content: ''; position: absolute; inset: 0; background: rgba(255,255,255,.70); }
        .stuko-header, .stuko-footer { width: min(100% - 36px, 1220px); margin-inline: auto; background: var(--stuko-white); backdrop-filter: blur(18px); -webkit-backdrop-filter: blur(18px); border: 1px solid rgba(255,255,255,.92); box-shadow: var(--stuko-shadow); }
        .stuko-header { position: sticky; top: 18px; z-index: 30; min-height: 68px; border-radius: 0; padding: 12px 18px 12px 20px; display: flex; align-items: center; justify-content: space-between; }
        .stuko-brand { display: inline-flex; align-items: center; gap: 10px; color: #111; text-decoration: none; font-size: 17px; letter-spacing: -.03em; }
        .stuko-brand-mark { width: 31px; height: 31px; display: grid; place-items: center; border: 1px solid rgba(0,0,0,.78); border-radius: 50%; background: rgba(255,255,255,.72); }
        .stuko-brand-mark svg { width: 22px; height: 22px; fill: none; stroke: #111; stroke-width: 1.2; stroke-linecap: round; }
        .stuko-account { position: relative; }
        .stuko-profile-trigger { border: 0; background: transparent; color: #111; display: inline-flex; align-items: center; gap: 9px; cursor: pointer; padding: 4px 2px 4px 7px; font: 400 13px/1 Roobert, ui-sans-serif, sans-serif; }
        .stuko-profile-trigger svg { transition: transform .5s cubic-bezier(.19,1,.22,1); }
        .stuko-profile-trigger svg.rotate { transform: rotate(180deg); }
        .stuko-avatar { width: 34px; height: 34px; display: grid; place-items: center; overflow: hidden; border-radius: 50%; background: #111; color: white; font-size: 12px; }
        .stuko-avatar img { width: 100%; height: 100%; object-fit: cover; }
        .stuko-account-menu { position: absolute; right: 0; top: calc(100% + 10px); width: 190px; padding: 6px; background: rgba(255,255,255,.92); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,.95); box-shadow: 0 18px 45px rgba(20,70,95,.16); animation: stukoMenuIn .45s cubic-bezier(.19,1,.22,1) both; }
        @keyframes stukoMenuIn { from { opacity: 0; transform: translateY(-7px); } to { opacity: 1; transform: translateY(0); } }
        .stuko-account-menu button { width: 100%; display: flex; align-items: center; gap: 10px; padding: 12px 10px; border: 0; background: transparent; color: #111; cursor: pointer; text-align: left; font: 400 13px Roobert, ui-sans-serif, sans-serif; }
        .stuko-account-menu button:hover { background: rgba(0,0,0,.055); }
        .stuko-main { width: min(100% - 36px, 1220px); margin: 0 auto; padding: 92px 0 88px; }
        .stuko-intro { max-width: 760px; margin: 0 auto 70px; text-align: center; }
        .stuko-eyebrow { margin: 0 0 19px; font: 600 11px/1 Roobert, ui-sans-serif, sans-serif; letter-spacing: .16em; color: rgba(17,17,17,.54); }
        .stuko-intro h1 { margin: 0; font: 400 clamp(66px, 9vw, 126px)/.82 Roobert, ui-sans-serif, sans-serif; letter-spacing: -.07em; }
        .stuko-intro h1 em { font-style: normal; font-weight: 300; }
        .stuko-subtitle { max-width: 500px; margin: 27px auto 0; color: var(--stuko-muted); font: 400 16px/1.5 Roobert, ui-sans-serif, sans-serif; }
        .stuko-tool-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; }
        .stuko-tool { position: relative; min-height: 218px; padding: 22px 24px 24px; display: flex; flex-direction: column; justify-content: space-between; text-decoration: none; color: #111; background: var(--stuko-glass); border: 1px solid var(--stuko-border); backdrop-filter: blur(17px); -webkit-backdrop-filter: blur(17px); box-shadow: 0 8px 35px rgba(50,120,150,.07); transition: transform .8s cubic-bezier(.19,1,.22,1), background .5s ease, box-shadow .8s ease; }
        .stuko-tool:hover { transform: translateY(-6px); background: rgba(255,255,255,.62); box-shadow: 0 18px 48px rgba(50,120,150,.13); }
        .stuko-tool-top { display: flex; align-items: center; justify-content: space-between; color: rgba(17,17,17,.65); }
        .stuko-tool-number { font: 400 11px system-ui, sans-serif; letter-spacing: .05em; }
        .stuko-tool-copy { max-width: 430px; padding-top: 24px; }
        .stuko-tool h2 { margin: 0 0 9px; font: 400 clamp(24px, 3vw, 38px)/1 Roobert, ui-sans-serif, sans-serif; letter-spacing: -.045em; }
        .stuko-tool p { margin: 0; color: rgba(17,17,17,.58); font: 400 13px/1.45 Roobert, ui-sans-serif, sans-serif; }
        .stuko-tool-arrow { align-self: flex-end; margin-top: 16px; transition: transform .8s cubic-bezier(.19,1,.22,1); }
        .stuko-tool:hover .stuko-tool-arrow { transform: translate(4px,-4px); }
        .stuko-footer { position: relative; bottom: 18px; min-height: 62px; padding: 14px 20px; display: flex; align-items: center; justify-content: space-between; gap: 20px; border-radius: 0; }
        .stuko-footer-brand { font: 400 12px Roobert, ui-sans-serif, sans-serif; letter-spacing: .08em; }
        .stuko-footer nav { display: flex; flex-wrap: wrap; justify-content: flex-end; gap: 24px; }
        .stuko-footer a { color: rgba(17,17,17,.62); text-decoration: none; font: 400 11px Roobert, ui-sans-serif, sans-serif; transition: color .4s ease; }
        .stuko-footer a:hover { color: #111; }
        .stuko-loader { min-height: 100svh; display: grid; place-items: center; background: #bfe9fb url('/stuko-clouds.jpg') center / cover no-repeat; font-family: Roobert, ui-sans-serif, sans-serif; }
        .stuko-loader::before { content: ''; position: fixed; inset: 0; background: rgba(255,255,255,.42); }
        .loader-glass { position: relative; z-index: 1; display: flex; align-items: center; gap: 10px; padding: 13px 18px; background: rgba(255,255,255,.72); border: 1px solid rgba(255,255,255,.9); backdrop-filter: blur(16px); font-size: 16px; letter-spacing: .08em; }
        .loader-logo-mark { width: 24px; height: 24px; position: relative; display: block; }
        .loader-logo-mark i { position: absolute; width: 4px; height: 4px; border-radius: 50%; background: #111; animation: loaderDot 1.2s ease-in-out infinite; }
        .loader-logo-mark i:nth-child(1) { left: 2px; top: 10px; }
        .loader-logo-mark i:nth-child(2) { left: 10px; top: 4px; animation-delay: .12s; }
        .loader-logo-mark i:nth-child(3) { left: 18px; top: 12px; animation-delay: .24s; }
        @keyframes loaderDot { 0%,100% { transform: translateY(0); opacity: .35; } 50% { transform: translateY(-5px); opacity: 1; } }
        @media (max-width: 760px) { .stuko-header, .stuko-footer, .stuko-main { width: min(100% - 24px, 1220px); } .stuko-header { top: 12px; } .stuko-main { padding: 72px 0 70px; } .stuko-intro { margin-bottom: 45px; } .stuko-tool-grid { grid-template-columns: 1fr; } .stuko-tool { min-height: 190px; } .stuko-profile-name { display: none; } .stuko-footer { bottom: 12px; flex-direction: column; align-items: flex-start; } .stuko-footer nav { justify-content: flex-start; gap: 10px 18px; } }
        @media (prefers-reduced-motion: reduce) { *, *::before, *::after { scroll-behavior: auto !important; animation-duration: .01ms !important; transition-duration: .01ms !important; } }
      `}</style>

      <div className="stuko-background" aria-hidden="true" />

      <header className="stuko-header">
        <a className="stuko-brand" href="/" aria-label="STUKO home">
          <span className="stuko-brand-mark" aria-hidden="true">
            <svg viewBox="0 0 28 28" role="img">
              <path d="M4 8.5c3.8-5 7.7-5 11.5 0s7.7 5 8.5 0" />
              <path d="M4 19.5c3.8 5 7.7 5 11.5 0s7.7-5 8.5 0" />
              <circle cx="4" cy="8.5" r="1.7" />
              <circle cx="24" cy="19.5" r="1.7" />
            </svg>
          </span>
          <span>STUKO</span>
        </a>

        <div className="stuko-account">
          <button className="stuko-profile-trigger" onClick={() => setMenuOpen((open) => !open)} aria-expanded={menuOpen} aria-haspopup="menu">
            <span className="stuko-avatar">{profile?.photoURL ? <img src={profile.photoURL} alt="" /> : initials}</span>
            <span className="stuko-profile-name">{displayName}</span>
            <ChevronDown className={menuOpen ? 'rotate' : ''} size={15} strokeWidth={1.7} />
          </button>
          {menuOpen && (
            <div className="stuko-account-menu" role="menu">
              <button role="menuitem" onClick={() => { window.location.href = `/u/${profile?.username || ''}`; }}><UserRound size={16} strokeWidth={1.6} /><span>Public profile</span></button>
              <button role="menuitem" onClick={() => { window.location.href = '/settings'; }}><Settings size={16} strokeWidth={1.6} /><span>Settings</span></button>
            </div>
          )}
        </div>
      </header>

      <section className="stuko-main" aria-label="STUKO tools">
        <div className="stuko-intro">
          <p className="stuko-eyebrow">YOUR STUDY SPACE</p>
          <h1>Study,<br /><em>your way.</em></h1>
          <p className="stuko-subtitle">A quiet little place for getting things done — without making studying feel like another job.</p>
        </div>

        <div className="stuko-tool-grid">
          {tools.map(({ number, title, description, href, icon: Icon }) => (
            <a className="stuko-tool" href={href} key={title}>
              <div className="stuko-tool-top"><span className="stuko-tool-number">{number}</span><Icon size={20} strokeWidth={1.45} /></div>
              <div className="stuko-tool-copy"><h2>{title}</h2><p>{description}</p></div>
              <ArrowUpRight className="stuko-tool-arrow" size={18} strokeWidth={1.5} />
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
