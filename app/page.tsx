'use client';

import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { firebaseConfigured, getFirebase } from '@/lib/firebase';
import { BookOpen, Clock3, FileText, Layers3, Play, Sparkles, Trophy, Users, ArrowUpRight, ChevronDown, UserRound, Settings } from 'lucide-react';

type Profile = { displayName?: string; username?: string; photoURL?: string };

const features = [
  { title: 'Pomodoro', desc: 'focus gently', icon: Clock3, href: '/pomodoro' },
  { title: 'Study room', desc: 'study together', icon: Users, href: '/study-room' },
  { title: 'Flashcards', desc: 'remember more', icon: Layers3, href: '/flashcards' },
  { title: 'Quiz', desc: 'test yourself', icon: Trophy, href: '/quiz' },
  { title: 'Summarizer', desc: 'make it simple', icon: FileText, href: '/summarizer' },
  { title: 'Library', desc: 'your study space', icon: BookOpen, href: '/library' },
];

const DEFAULT_COLOR = '#e9eef2';

export default function HomePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [themeColor, setThemeColor] = useState(DEFAULT_COLOR);

  useEffect(() => {
    const saved = window.localStorage.getItem('stuko-theme-color');
    if (saved) setThemeColor(saved);
  }, []);

  useEffect(() => {
    if (!firebaseConfigured()) { setLoading(false); return; }
    const { auth, db } = getFirebase();
    return onAuthStateChanged(auth, async (user) => {
      if (!user) { window.location.href = '/auth'; return; }
      const snap = await getDoc(doc(db, 'users', user.uid));
      if (!snap.exists() || !snap.data().username) { window.location.href = '/onboarding'; return; }
      setProfile(snap.data() as Profile);
      setLoading(false);
    });
  }, []);

  const changeThemeColor = (value: string) => {
    setThemeColor(value);
    window.localStorage.setItem('stuko-theme-color', value);
    document.documentElement.style.setProperty('--stuko-theme-color', value);
  };

  useEffect(() => {
    document.documentElement.style.setProperty('--stuko-theme-color', themeColor);
  }, [themeColor]);

  if (loading) return <main className="landing-loading" style={{ backgroundColor: themeColor }}>STUKO<span>✦</span></main>;

  const name = profile?.displayName || 'there';
  const firstName = name.split(' ')[0];

  return (
    <main className="landing" style={{ ['--theme-color' as string]: themeColor }}>
      <style jsx global>{`
        .landing, .landing * { box-sizing: border-box; }
        .landing { --grid-hue:220; --grid-gap:12px; --grid-opacity:.35; --grid-border:16px; --grid-bg:var(--theme-color); --grid-minor:rgba(16,25,28,.08); --grid-major:rgba(16,25,28,.18); --grid-cross:rgba(16,25,28,.28); --paper-lines-y:linear-gradient(var(--grid-minor) 0 1px,transparent 1px var(--grid-gap)); --paper-lines-x:linear-gradient(to right,var(--grid-minor) 0 1px,transparent 1px var(--grid-gap)); --paper-lines-y-major:linear-gradient(var(--grid-major) 0 1px,transparent 1px calc(var(--grid-gap) * 5)); --paper-lines-x-major:linear-gradient(to right,var(--grid-major) 0 1px,transparent 1px calc(var(--grid-gap) * 5)); --paper-cross-y:linear-gradient(var(--grid-cross) 0 1px,transparent 1px calc(var(--grid-gap) * 5)); --paper-cross-x:linear-gradient(to right,var(--grid-cross) 0 1px,transparent 1px calc(var(--grid-gap) * 5)); --paper-cross-mask:radial-gradient(circle at center,transparent calc(var(--grid-gap) / 2),var(--grid-bg) calc(var(--grid-gap) / 2) 100%); --paper-gradient:var(--paper-lines-y),var(--paper-lines-x),var(--paper-lines-y-major),var(--paper-lines-x-major),var(--paper-cross-mask),var(--paper-cross-y),var(--paper-cross-x); min-height:100vh;position:relative;overflow:hidden;color:#10191c;font-family:'Styrene A','Styrene','Arial',sans-serif;background-color:var(--grid-bg);background-image:var(--paper-gradient);background-size:var(--grid-gap) var(--grid-gap),var(--grid-gap) var(--grid-gap),calc(var(--grid-gap) * 5) calc(var(--grid-gap) * 5),calc(var(--grid-gap) * 5) calc(var(--grid-gap) * 5),calc(var(--grid-gap) * 5) calc(var(--grid-gap) * 5),calc(var(--grid-gap) * 5) calc(var(--grid-gap) * 5),calc(var(--grid-gap) * 5) calc(var(--grid-gap) * 5);background-repeat:repeat;box-shadow:inset 0 0 0 var(--grid-border) var(--grid-bg),inset 0 0 0 calc(var(--grid-border) + 1px) var(--grid-cross); }
        .landing::before{content:'';position:absolute;inset:0;pointer-events:none;background:rgba(255,255,255,.12);z-index:0}
        .landing-nav{height:74px;padding:0 5.5vw;display:flex;align-items:center;justify-content:space-between;position:relative;z-index:10;border-bottom:1px solid rgba(16,25,28,.12);background:color-mix(in srgb,var(--theme-color) 78%,white 22%);backdrop-filter:blur(5px)}
        .landing-logo{display:flex;align-items:center;gap:10px;font-size:17px;font-weight:900;letter-spacing:.16em}.logo-box{width:31px;height:31px;border:2px solid #10191c;border-radius:50%;display:grid;place-items:center;font-size:13px;font-weight:900;letter-spacing:0;background:rgba(255,255,255,.28)}
        .landing-actions{position:relative;display:flex;align-items:center;gap:8px}.landing-profile{position:relative;display:flex;align-items:center;gap:9px;font-size:11px;font-weight:700}.profile-trigger{display:flex;align-items:center;gap:8px;border:0;background:transparent;color:#10191c;padding:3px;border-radius:12px;cursor:pointer}.profile-trigger:hover{background:rgba(255,255,255,.35)}.profile-chevron{transition:transform .2s}.profile-chevron.open{transform:rotate(180deg)}
        .landing-avatar{width:37px;height:37px;border-radius:50%;overflow:hidden;border:2px solid rgba(16,25,28,.7);background:#f4eadf;display:grid;place-items:center}.landing-avatar img{width:100%;height:100%;object-fit:cover}
        .color-picker-wrap{width:37px;height:37px;position:relative;display:grid;place-items:center;border:1px solid rgba(16,25,28,.18);border-radius:50%;background:rgba(255,255,255,.3);box-shadow:0 5px 14px rgba(8,51,62,.08);cursor:pointer}.color-picker-ball{width:24px;height:24px;border-radius:50%;background:var(--theme-color);border:2px solid #10191c;box-shadow:inset 0 0 0 2px rgba(255,255,255,.45)}.color-picker-input{position:absolute;inset:0;width:100%;height:100%;opacity:0;cursor:pointer}
        .profile-menu{position:absolute;right:0;top:calc(100% + 11px);width:205px;padding:7px;background:color-mix(in srgb,var(--theme-color) 90%,white 10%);border:1px solid rgba(16,25,28,.14);border-radius:15px;box-shadow:0 18px 45px rgba(5,37,49,.18);backdrop-filter:blur(16px);animation:profileMenuIn .16s ease-out}.profile-menu-label{padding:8px 10px 6px;color:rgba(16,25,28,.45);font-size:8px;font-weight:800;letter-spacing:.14em;text-transform:uppercase}.profile-menu-item{width:100%;display:flex;align-items:center;gap:10px;border:0;border-radius:10px;background:transparent;color:#10191c;padding:10px;font:700 10px 'Styrene A','Styrene','Arial',sans-serif;text-align:left;cursor:pointer}.profile-menu-item:hover{background:rgba(16,25,28,.07)}.profile-menu-item svg{opacity:.65}@keyframes profileMenuIn{from{opacity:0;transform:translateY(-5px) scale(.98)}to{opacity:1;transform:translateY(0) scale(1)}}
        .hero{min-height:calc(100vh - 74px);padding:5vh 7vw 28px;display:flex;flex-direction:column;justify-content:space-between;position:relative;z-index:2}.hero-copy{max-width:820px;padding-top:3vh}.kicker{display:inline-flex;align-items:center;gap:7px;margin:0 0 20px;padding:7px 11px;border:1px solid rgba(16,25,28,.18);border-radius:999px;background:rgba(255,255,255,.3);backdrop-filter:blur(8px);font-size:9px;font-weight:800;letter-spacing:.15em;text-transform:uppercase}.kicker::before{content:'✦';font-size:10px}.hero h1{margin:0;max-width:800px;font-family:'Styrene A','Styrene','Arial',sans-serif;font-size:clamp(56px,8vw,112px);line-height:.91;letter-spacing:-.075em;font-weight:700}.hero h1 em{font-style:normal;font-weight:400}.hero-sub{max-width:500px;margin:24px 0 0;font-size:14px;line-height:1.65;font-weight:500;color:rgba(16,25,28,.7)}.start-btn{margin-top:24px;display:inline-flex;align-items:center;gap:8px;border:1.5px solid #10191c;border-radius:999px;padding:11px 16px;background:#10191c;color:#effffb;font:800 11px 'Styrene A','Styrene','Arial',sans-serif;cursor:pointer;box-shadow:0 8px 24px rgba(5,37,49,.16);transition:transform .2s,background .2s,color .2s}.start-btn:hover{transform:translateY(-2px);background:#fff;color:#10191c}.feature-zone{margin-top:6vh}.feature-label{display:flex;align-items:center;gap:8px;margin:0 0 12px;font-size:9px;font-weight:800;letter-spacing:.15em;text-transform:uppercase;color:rgba(16,25,28,.64)}.feature-label::after{content:'';height:1px;background:rgba(16,25,28,.18);flex:1}.features{display:grid;grid-template-columns:repeat(6,1fr);gap:9px}.feature{min-height:132px;border:1px solid rgba(16,25,28,.17);border-radius:18px;padding:13px;display:flex;flex-direction:column;justify-content:space-between;text-align:left;background:rgba(255,255,255,.48);backdrop-filter:blur(12px);color:#10191c;cursor:pointer;box-shadow:0 8px 25px rgba(8,51,62,.07);transition:transform .22s,background .22s,box-shadow .22s}.feature:hover{transform:translateY(-5px) rotate(-.4deg);background:rgba(255,255,255,.72);box-shadow:0 16px 35px rgba(8,51,62,.14)}.feature:nth-child(even):hover{transform:translateY(-5px) rotate(.4deg)}.feature-top{display:flex;align-items:center;justify-content:space-between}.feature-icon{width:32px;height:32px;display:grid;place-items:center;border-radius:11px;border:1px solid rgba(16,25,28,.15);background:rgba(255,255,255,.34)}.feature:hover .feature-icon{background:#10191c;color:#fff}.feature h2{margin:0 0 4px;font-size:12px;font-weight:850;letter-spacing:-.02em}.feature p{margin:0;color:rgba(16,25,28,.58);font-size:9px;font-weight:500}.feature-arrow{opacity:.5;transition:transform .2s,opacity .2s}.feature:hover .feature-arrow{transform:translate(2px,-2px);opacity:1}.landing-footer{display:flex;justify-content:space-between;margin-top:13px;color:rgba(16,25,28,.52);font-size:8px;font-weight:700;letter-spacing:.05em}.landing-loading{min-height:100vh;display:grid;place-items:center;color:#10191c;font:900 22px Arial;letter-spacing:.18em}@media(max-width:950px){.features{grid-template-columns:repeat(3,1fr)}.hero{padding:4vh 5vw 24px}}@media(max-width:600px){.landing-profile>span{display:none}.hero{padding:5vh 6vw 20px}.hero h1{font-size:clamp(48px,14vw,78px)}.features{grid-template-columns:repeat(2,1fr)}.feature{min-height:125px}.landing-footer{flex-direction:column;gap:5px}.profile-menu{right:-5px}}
      `}</style>

      <nav className="landing-nav">
        <div className="landing-logo"><span className="logo-box">S</span>STUKO</div>
        <div className="landing-actions">
          <div className="landing-profile">
            <button className="profile-trigger" aria-label="Open profile menu" aria-expanded={profileMenuOpen} onClick={() => setProfileMenuOpen(v => !v)}>
              <span>{name}</span>
              <div className="landing-avatar">{profile?.photoURL ? <img src={profile.photoURL} alt="" /> : firstName[0]?.toUpperCase()}</div>
              <ChevronDown className={`profile-chevron ${profileMenuOpen ? 'open' : ''}`} size={13} />
            </button>
            {profileMenuOpen && (
              <div className="profile-menu">
                <div className="profile-menu-label">Account</div>
                <button className="profile-menu-item" onClick={() => window.location.href=`/u/${profile?.username || ''}`}><UserRound size={14} /> Public profile</button>
                <button className="profile-menu-item" onClick={() => window.location.href='/settings'}><Settings size={14} /> Settings</button>
              </div>
            )}
          </div>
          <label className="color-picker-wrap" title="Choose your STUKO color">
            <span className="color-picker-ball" aria-hidden="true" />
            <input className="color-picker-input" type="color" value={themeColor} aria-label="Choose background color" onChange={e => changeThemeColor(e.target.value)} />
          </label>
        </div>
      </nav>

      <section className="hero">
        <div className="hero-copy"><p className="kicker">your little study universe</p><h1>Hey, {firstName}.<br /><em>Let's start.</em></h1><p className="hero-sub">A softer place to study, built around <strong>you</strong> — pick something, settle in, and take it one little step at a time.</p><button className="start-btn" onClick={() => document.getElementById('features')?.scrollIntoView({behavior:'smooth'})}>Start studying <Play size={12} fill="currentColor" /></button></div>
        <div className="feature-zone" id="features"><div className="feature-label"><Sparkles size={10} /> what are we doing today?</div><div className="features">{features.map(({title,desc,icon:Icon,href}) => <button className="feature" key={title} onClick={() => {window.location.href=href;}}><div className="feature-top"><span className="feature-icon"><Icon size={15} strokeWidth={1.8} /></span><ArrowUpRight className="feature-arrow" size={13} /></div><div><h2>{title}</h2><p>{desc}</p></div></button>)}</div><div className="landing-footer"><span>STUKO ✦</span><span>study around what you love.</span></div></div>
      </section>
    </main>
  );
}
