'use client';

import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { ArrowUpRight, ChevronDown, Settings, UserRound, Play } from 'lucide-react';
import { firebaseConfigured, getFirebase } from '@/lib/firebase';

type Profile = { displayName?: string; username?: string; photoURL?: string };

const tools = [
  ['01', 'Pomodoro', 'Focus without forcing it.', '/pomodoro'],
  ['02', 'Study room', 'Study alongside people.', '/study-room'],
  ['03', 'Flashcards', 'Keep what matters.', '/flashcards'],
  ['04', 'Quiz', 'See what you remember.', '/quiz'],
  ['05', 'Summarizer', 'Turn noise into notes.', '/summarizer'],
  ['06', 'Library', 'Your study archive.', '/library'],
];

export default function HomePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [menu, setMenu] = useState(false);
  const [themeColor, setThemeColor] = useState('#ffffff');

  useEffect(() => {
    const saved = localStorage.getItem('stuko-theme-color');
    if (saved) setThemeColor(saved);
  }, []);

  useEffect(() => {
    document.documentElement.style.setProperty('--stuko-theme-color', themeColor);
  }, [themeColor]);

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

  const setColor = (value: string) => {
    setThemeColor(value);
    localStorage.setItem('stuko-theme-color', value);
  };

  if (loading) return <main className="stuko-loader"><span>STUKO</span><i /></main>;

  const name = profile?.displayName || 'there';
  const first = name.split(' ')[0];

  return (
    <main className="stuko-editorial">
      <style jsx global>{`
        .stuko-editorial{min-height:100vh;background:#fff;color:#000;font-family:Roobert,Arial,sans-serif;overflow-x:hidden}
        .stuko-header{position:fixed;z-index:20;top:0;left:0;right:0;height:66px;padding:0 clamp(18px,4vw,56px);display:grid;grid-template-columns:1fr auto 1fr;align-items:center;background:rgba(255,255,255,.76);backdrop-filter:blur(14px);border-bottom:1px solid rgba(0,0,0,.08)}
        .stuko-logo{font-size:16px;font-weight:400;letter-spacing:-.02em;text-decoration:none;color:#000}.stuko-nav{display:flex;gap:24px;font-size:11px;color:#6d6d6d}.stuko-nav a{text-decoration:none;color:inherit;transition:opacity .4s}.stuko-nav a:hover{opacity:.45}
        .stuko-actions{justify-self:end;display:flex;align-items:center;gap:13px;position:relative}.stuko-profile{display:flex;align-items:center;gap:8px;border:0;background:none;color:#000;font:400 11px Roobert,Arial;cursor:pointer;padding:0}.stuko-avatar{width:31px;height:31px;border-radius:50%;overflow:hidden;background:#000;color:#fff;display:grid;place-items:center}.stuko-avatar img{width:100%;height:100%;object-fit:cover}.stuko-chevron{transition:transform .6s cubic-bezier(.19,1,.22,1)}.stuko-chevron.open{transform:rotate(180deg)}
        .stuko-color{width:24px;height:24px;border:1px solid #000;border-radius:50%;background:var(--stuko-theme-color,#fff);position:relative;overflow:hidden;cursor:pointer}.stuko-color input{position:absolute;inset:-8px;width:40px;height:40px;opacity:0;cursor:pointer}
        .stuko-menu{position:absolute;right:38px;top:43px;width:205px;padding:8px;background:rgba(255,255,255,.97);border:1px solid #000;border-radius:0;animation:menuIn .6s cubic-bezier(.19,1,.22,1)}@keyframes menuIn{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:none}}
        .stuko-menu-label{padding:7px 9px 8px;color:#6d6d6d;font:400 9px system-ui;letter-spacing:.12em;text-transform:uppercase}.stuko-menu button{width:100%;display:flex;align-items:center;gap:10px;border:0;background:transparent;padding:11px 9px;color:#000;text-align:left;cursor:pointer;font:400 12px Roobert,Arial}.stuko-menu button:hover{background:#f1f1f1}
        .stuko-hero{height:100vh;position:relative;display:flex;align-items:center;overflow:hidden;background:#000;color:#fff}.stuko-hero:before{content:'';position:absolute;inset:-20%;background:radial-gradient(42% 70% at 18% 48%,rgb(160,224,171),transparent 70%),radial-gradient(42% 65% at 52% 48%,rgb(255,172,46),transparent 72%),radial-gradient(45% 75% at 88% 52%,rgb(165,45,37),transparent 70%);filter:blur(38px);transform:scale(1.15);animation:liquid 16s ease-in-out infinite alternate}.stuko-hero:after{content:'';position:absolute;inset:0;background:linear-gradient(120deg,rgba(0,0,0,.18),transparent 45%,rgba(0,0,0,.25));mix-blend-mode:multiply}@keyframes liquid{from{transform:scale(1.1) translate(-2%,1%) rotate(-2deg)}to{transform:scale(1.2) translate(3%,-2%) rotate(2deg)}}
        .stuko-hero-inner{position:relative;z-index:2;width:min(1078px,calc(100% - 40px));height:100%;margin:auto;padding:105px 0 44px;display:flex;flex-direction:column;justify-content:space-between}.stuko-kicker{margin:0 0 22px;font:400 11px Roobert,Arial;letter-spacing:.08em;text-transform:uppercase}.stuko-kicker span{opacity:.5;margin-right:10px}.stuko-hero h1{margin:0;font:400 clamp(72px,13.5vw,180px)/.84 Roobert,Arial;letter-spacing:-.065em}.stuko-hero h1 em{font-style:normal;font-weight:300}.stuko-bottom{display:flex;justify-content:space-between;align-items:flex-end;gap:30px}.stuko-description{max-width:390px;margin:0;color:rgba(255,255,255,.88);font:400 14px/1.55 Roobert,Arial}.stuko-pill{display:inline-flex;align-items:center;gap:9px;padding:11px 33px;border:1px solid rgba(255,255,255,.72);border-radius:75px;background:transparent;color:#fff;font:400 16px Roobert,Arial;cursor:pointer;transition:all 1s cubic-bezier(.19,1,.22,1)}.stuko-pill:hover{background:#fff;color:#000;transform:translateY(-4px)}.stuko-scroll{position:absolute;bottom:0;left:0;width:65px;height:65px;border:1px solid rgba(255,255,255,.6);border-radius:50%;display:grid;place-items:center;font:400 8px system-ui;letter-spacing:.08em;text-align:center;animation:spin 14s linear infinite}@keyframes spin{to{transform:rotate(360deg)}}
        .stuko-intro{width:min(1078px,calc(100% - 40px));margin:auto;padding:125px 0 110px;display:grid;grid-template-columns:1fr 1fr;gap:80px}.stuko-label{font:400 11px Roobert,Arial;letter-spacing:.08em;color:#6d6d6d;text-transform:uppercase}.stuko-intro h2{margin:0;font:300 clamp(44px,6vw,78px)/1.05 Roobert,Arial;letter-spacing:-.055em}.stuko-intro p{align-self:end;max-width:430px;margin:0;font:400 18px/1.45 Roobert,Arial;color:#181818}
        .stuko-tools{background:#000;color:#fff;padding:105px 0 120px}.stuko-tools-inner{width:min(1078px,calc(100% - 40px));margin:auto}.stuko-tools-head{display:flex;justify-content:space-between;align-items:flex-end;gap:30px;margin-bottom:48px}.stuko-tools h2{margin:0;font:400 clamp(48px,7vw,94px)/.8 Roobert,Arial;letter-spacing:-.055em}.stuko-tools-note{max-width:290px;margin:0;color:#aaa;font-size:12px;line-height:1.5}.stuko-list{border-top:1px solid rgba(255,255,255,.3)}.stuko-row{width:100%;min-height:94px;border:0;border-bottom:1px solid rgba(255,255,255,.22);background:transparent;color:#fff;display:grid;grid-template-columns:70px 1fr auto 30px;align-items:center;gap:20px;text-align:left;cursor:pointer;transition:padding 1s cubic-bezier(.19,1,.22,1),background .4s}.stuko-row:hover{padding-left:22px;background:rgba(255,255,255,.06)}.stuko-num{color:#777;font:400 11px system-ui}.stuko-title{font:400 18px Roobert,Arial}.stuko-desc{color:#888;font:400 12px Roobert,Arial}.stuko-arrow{color:#aaa;transition:transform 1s cubic-bezier(.19,1,.22,1)}.stuko-row:hover .stuko-arrow{color:#fff;transform:translate(4px,-4px)}
        .stuko-footer{width:min(1078px,calc(100% - 40px));margin:auto;padding:65px 0 42px;display:flex;justify-content:space-between;gap:30px;color:#6d6d6d;font:400 11px/1.36 Roobert,Arial}.stuko-footer strong{color:#000;font-weight:400}
        .stuko-loader{min-height:100vh;background:#000;color:#fff;display:grid;place-content:center;justify-items:center;gap:14px;font-family:Roobert,Arial}.stuko-loader span{font-size:18px;letter-spacing:.18em}.stuko-loader i{display:block;width:70px;height:1px;background:#fff;animation:load 1.2s cubic-bezier(.19,1,.22,1) infinite;transform-origin:left}@keyframes load{0%,100%{transform:scaleX(.15);opacity:.3}50%{transform:scaleX(1);opacity:1}}
        @media(max-width:760px){.stuko-header{grid-template-columns:1fr auto}.stuko-nav{display:none}.stuko-bottom,.stuko-tools-head{flex-direction:column;align-items:flex-start}.stuko-intro{grid-template-columns:1fr;gap:35px;padding:80px 0}.stuko-row{grid-template-columns:45px 1fr 30px}.stuko-desc{display:none}.stuko-footer{flex-direction:column}.stuko-scroll{display:none}}@media(max-width:480px){.stuko-profile>span:first-child{display:none}.stuko-menu{right:0}.stuko-hero-inner,.stuko-intro,.stuko-tools-inner,.stuko-footer{width:calc(100% - 28px)}.stuko-hero h1{font-size:clamp(54px,18vw,82px)}}
      `}</style>

      <header className="stuko-header">
        <a className="stuko-logo" href="/">STUKO</a>
        <nav className="stuko-nav"><a href="#about">ABOUT</a><a href="#tools">TOOLS</a><a href="#footer">STUKO</a></nav>
        <div className="stuko-actions">
          <button className="stuko-profile" onClick={() => setMenu(v => !v)} aria-expanded={menu}>
            <span>{name}</span><span className="stuko-avatar">{profile?.photoURL ? <img src={profile.photoURL} alt="" /> : first[0]?.toUpperCase()}</span><ChevronDown className={`stuko-chevron ${menu ? 'open' : ''}`} size={13} />
          </button>
          <label className="stuko-color" title="Choose your STUKO color"><input type="color" value={themeColor} onChange={e => setColor(e.target.value)} aria-label="Choose background color" /></label>
          {menu && <div className="stuko-menu"><div className="stuko-menu-label">Account</div><button onClick={() => window.location.href=`/u/${profile?.username || ''}`}><UserRound size={14}/> Public profile</button><button onClick={() => window.location.href='/settings'}><Settings size={14}/> Settings</button></div>}
        </div>
      </header>

      <section className="stuko-hero"><div className="stuko-hero-inner"><div><p className="stuko-kicker"><span>01</span> your study universe</p><h1>Study<br/><em>your way.</em></h1></div><div className="stuko-bottom"><p className="stuko-description">STUKO is a quiet little place for the messy, curious process of learning — tools when you need them, space when you don't.</p><button className="stuko-pill" onClick={() => document.getElementById('tools')?.scrollIntoView({behavior:'smooth'})}>Start studying <Play size={13} fill="currentColor"/></button></div><div className="stuko-scroll">SCROLL<br/>↓</div></div></section>

      <section className="stuko-intro" id="about"><div><div className="stuko-label">02 / philosophy</div><h2>Less pressure.<br/>More progress.</h2></div><p>No dashboard shouting at you. No noisy productivity theatre. Just a collection of things that make studying easier — arranged around the way you actually work.</p></section>

      <section className="stuko-tools" id="tools"><div className="stuko-tools-inner"><div className="stuko-tools-head"><div><div className="stuko-label" style={{color:'#777'}}>03 / choose a room</div><h2>What are we<br/>doing today?</h2></div><p className="stuko-tools-note">Pick a tool. Stay for as long as it helps. Leave when the work is done.</p></div><div className="stuko-list">{tools.map(([number,title,desc,href]) => <button className="stuko-row" key={title} onClick={() => window.location.href=href}><span className="stuko-num">{number}</span><span className="stuko-title">{title}</span><span className="stuko-desc">{desc}</span><ArrowUpRight className="stuko-arrow" size={17}/></button>)}</div></div></section>

      <footer className="stuko-footer" id="footer"><span><strong>STUKO</strong> — study around what you love.</span><span>Built for curious people.</span></footer>
    </main>
  );
}
