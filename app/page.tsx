'use client';

import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { firebaseConfigured, getFirebase } from '@/lib/firebase';
import { BookOpen, Brain, Clock3, FileText, Layers3, Play, Sparkles, Trophy, Users, ArrowUpRight } from 'lucide-react';

type Profile = { displayName?: string; username?: string; photoURL?: string };

const features = [
  { title: 'Pomodoro timer', desc: 'Focus. Break. Repeat.', icon: Clock3, href: '/pomodoro', key: '01' },
  { title: 'Study room', desc: 'Study together, quietly.', icon: Users, href: '/study-room', key: '02' },
  { title: 'Flashcards', desc: 'Turn notes into memory.', icon: Layers3, href: '/flashcards', key: '03' },
  { title: 'Quiz', desc: 'See what actually stuck.', icon: Trophy, href: '/quiz', key: '04' },
  { title: 'Summarizer', desc: 'Less reading. More knowing.', icon: FileText, href: '/summarizer', key: '05' },
  { title: 'Study library', desc: 'Keep everything together.', icon: BookOpen, href: '/library', key: '06' },
];

export default function HomePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

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

  if (loading) return <main className="landing-loading">STUKO<span>.</span></main>;

  const name = profile?.displayName || 'there';
  const firstName = name.split(' ')[0];

  return (
    <main className="landing">
      <style jsx global>{`
        .landing, .landing * { box-sizing: border-box; }
        .landing { min-height:100vh; background:#0b0b0b; color:#f5f2e9; font-family:Arial, Helvetica, sans-serif; overflow:hidden; position:relative; }
        .landing:before { content:''; position:absolute; width:650px; height:650px; border-radius:50%; background:#f5c518; opacity:.055; filter:blur(100px); top:-260px; right:-160px; pointer-events:none; }
        .landing:after { content:''; position:absolute; width:430px; height:430px; border-radius:50%; background:#f5c518; opacity:.035; filter:blur(100px); bottom:-220px; left:-130px; pointer-events:none; }
        .landing-nav { height:78px; padding:0 5.5vw; display:flex; align-items:center; justify-content:space-between; position:relative; z-index:2; }
        .landing-logo { display:flex; align-items:center; gap:10px; font-size:17px; font-weight:900; letter-spacing:.18em; }
        .logo-box { width:29px; height:29px; border:2px solid #f5c518; color:#f5c518; border-radius:8px; display:grid; place-items:center; font-size:13px; letter-spacing:0; }
        .landing-profile { display:flex; align-items:center; gap:10px; color:#a9a69d; font-size:11px; }
        .landing-avatar { width:34px; height:34px; border-radius:50%; overflow:hidden; border:1px solid #3b3932; background:#f5c518; color:#111; display:grid; place-items:center; font-weight:900; }
        .landing-avatar img { width:100%; height:100%; object-fit:cover; }
        .hero { min-height:calc(100vh - 78px); padding:7vh 7vw 34px; display:flex; flex-direction:column; justify-content:space-between; position:relative; z-index:1; }
        .hero-copy { max-width:850px; padding-top:2vh; }
        .kicker { color:#f5c518; font-size:10px; font-weight:800; letter-spacing:.2em; text-transform:uppercase; margin:0 0 25px; }
        .hero h1 { font-family:Inter, Arial, Helvetica, sans-serif; font-size:clamp(54px, 8.2vw, 118px); line-height:.91; letter-spacing:-.075em; margin:0; font-weight:650; max-width:900px; }
        .hero h1 em { color:#f5c518; font-style:normal; }
        .hero-sub { margin:28px 0 0; color:#9d9a91; font-size:15px; line-height:1.7; max-width:510px; }
        .hero-sub b { color:#e9e5d9; font-weight:600; }
        .start-btn { margin-top:28px; display:inline-flex; align-items:center; gap:9px; background:#f5c518; color:#111; border:0; border-radius:8px; padding:12px 17px; font-size:12px; font-weight:900; cursor:pointer; transition:transform .2s, box-shadow .2s; }
        .start-btn:hover { transform:translateY(-2px); box-shadow:0 10px 35px #f5c51822; }
        .feature-zone { margin-top:7vh; }
        .feature-label { display:flex; align-items:center; gap:13px; margin-bottom:13px; color:#77746d; font-size:9px; font-weight:800; letter-spacing:.18em; text-transform:uppercase; }
        .feature-label:after { content:''; height:1px; background:#282722; flex:1; }
        .features { display:grid; grid-template-columns:repeat(6,1fr); border-top:1px solid #292823; border-left:1px solid #292823; }
        .feature { min-height:150px; border-right:1px solid #292823; border-bottom:1px solid #292823; padding:19px 16px 15px; display:flex; flex-direction:column; justify-content:space-between; text-align:left; background:#0b0b0b; color:#f4f1e8; cursor:pointer; position:relative; transition:background .22s, transform .22s; }
        .feature:hover { background:#13130f; transform:translateY(-3px); z-index:2; }
        .feature:hover .feature-arrow { color:#f5c518; transform:translate(2px,-2px); }
        .feature-top { display:flex; justify-content:space-between; color:#6f6c65; }
        .feature-num { font-size:9px; font-weight:800; letter-spacing:.1em; }
        .feature-icon { width:27px; height:27px; border:1px solid #39372f; border-radius:7px; display:grid; place-items:center; }
        .feature:hover .feature-icon { border-color:#f5c518; color:#f5c518; }
        .feature h2 { font-size:13px; margin:0 0 5px; font-weight:800; letter-spacing:-.01em; }
        .feature p { margin:0; color:#77746d; font-size:9px; line-height:1.45; }
        .feature-arrow { transition:transform .2s, color .2s; position:absolute; right:14px; bottom:14px; }
        .landing-footer { display:flex; justify-content:space-between; align-items:center; margin-top:17px; color:#5f5c56; font-size:9px; }
        .landing-footer span:first-child { color:#f5c518; font-weight:800; letter-spacing:.12em; }
        .landing-loading { min-height:100vh; display:grid; place-items:center; background:#0b0b0b; color:#f5f2e9; font:900 22px Arial; letter-spacing:.18em; }
        .landing-loading span { color:#f5c518; }
        @media(max-width:900px){ .features{grid-template-columns:repeat(3,1fr)} .hero{padding:5vh 5vw 25px} .hero h1{font-size:clamp(52px,11vw,90px)} }
        @media(max-width:600px){ .landing-profile span{display:none} .hero{min-height:auto;padding:6vh 6vw 24px} .hero-sub{font-size:13px} .features{grid-template-columns:repeat(2,1fr)} .feature{min-height:135px} .landing-footer{gap:12px;align-items:flex-start;flex-direction:column} }
      `}</style>

      <nav className="landing-nav">
        <div className="landing-logo"><span className="logo-box">S</span>STUKO</div>
        <div className="landing-profile">
          <span>{name}</span>
          <div className="landing-avatar">{profile?.photoURL ? <img src={profile.photoURL} alt="" /> : firstName[0]?.toUpperCase()}</div>
        </div>
      </nav>

      <section className="hero">
        <div className="hero-copy">
          <p className="kicker">Your study universe</p>
          <h1>Hey, {firstName}.<br /><em>Let's start.</em></h1>
          <p className="hero-sub">No templates. No boring dashboards. Just a place built around <b>how you actually like to learn.</b></p>
          <button className="start-btn" onClick={() => document.getElementById('features')?.scrollIntoView({ behavior:'smooth' })}>Start studying <Play size={13} fill="currentColor" /></button>
        </div>

        <div className="feature-zone" id="features">
          <div className="feature-label"><Sparkles size={11} /> Start with a tool</div>
          <div className="features">
            {features.map(({ title, desc, icon: Icon, href, key }) => (
              <button className="feature" key={title} onClick={() => { window.location.href = href; }}>
                <div className="feature-top"><span className="feature-num">{key}</span><span className="feature-icon"><Icon size={14} /></span></div>
                <div><h2>{title}</h2><p>{desc}</p></div>
                <ArrowUpRight className="feature-arrow" size={14} />
              </button>
            ))}
          </div>
          <div className="landing-footer"><span>STUKO</span><span>Study around what you love.</span></div>
        </div>
      </section>
    </main>
  );
}
