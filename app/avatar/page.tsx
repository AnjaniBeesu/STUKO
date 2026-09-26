'use client';

import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Check, ChevronRight, Sparkles } from 'lucide-react';

const skins = ['#f8d6bf','#e9b692','#c9825a','#8f5439','#623a2b'];
const hairs = [
  { name: 'Cloud', color: '#191919', shape: 'cloud' },
  { name: 'Mocha', color: '#6b3f2a', shape: 'bob' },
  { name: 'Cherry', color: '#7b2636', shape: 'bob' },
  { name: 'Silver', color: '#c6c6c6', shape: 'cloud' },
  { name: 'Honey', color: '#d59b43', shape: 'bob' },
];
const outfits = [
  { name: 'Study Club', top: '#f4f0e8', bottom: '#1a1a1a' },
  { name: 'Sage', top: '#a0e0ab', bottom: '#314b38' },
  { name: 'Amber', top: '#ffac2e', bottom: '#5d3c16' },
  { name: 'Oxblood', top: '#a52d25', bottom: '#251313' },
  { name: 'Night', top: '#272727', bottom: '#050505' },
];
const accessories = ['None','Round glasses','Headphones','Beanie','Tiny bow'];

type Avatar = { skin: number; hair: number; outfit: number; accessory: number };

function AvatarFigure({ avatar, size = 'large' }: { avatar: Avatar; size?: 'large' | 'small' }) {
  const skin = skins[avatar.skin];
  const hair = hairs[avatar.hair];
  const outfit = outfits[avatar.outfit];
  const accessory = accessories[avatar.accessory];
  return (
    <div className={`figure ${size}`} aria-label="Your STUKO avatar">
      <div className="shadow" />
      <div className="legs"><i style={{ background: outfit.bottom }} /><i style={{ background: outfit.bottom }} /></div>
      <div className="body" style={{ background: outfit.top }}><span className="neck" style={{ background: skin }} /></div>
      <div className="head" style={{ background: skin }}>
        <div className={`hair ${hair.shape}`} style={{ background: hair.color }} />
        <span className="eye left" /><span className="eye right" /><span className="mouth" />
        {accessory === 'Round glasses' && <div className="glasses"><i /><i /></div>}
        {accessory === 'Headphones' && <div className="phones"><i /><i /><b /></div>}
        {accessory === 'Beanie' && <div className="beanie"><b>ST</b></div>}
        {accessory === 'Tiny bow' && <div className="bow"><i /><i /></div>}
      </div>
    </div>
  );
}

export default function AvatarStudio() {
  const [avatar, setAvatar] = useState<Avatar>({ skin: 1, hair: 0, outfit: 0, accessory: 0 });
  const [category, setCategory] = useState<'skin'|'hair'|'outfit'|'accessory'>('skin');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem('stuko-avatar');
    if (raw) try { setAvatar(JSON.parse(raw)); } catch {}
  }, []);

  const options = useMemo(() => {
    if (category === 'skin') return skins.map((color, i) => ({ label: `Skin ${i + 1}`, value: i, color }));
    if (category === 'hair') return hairs.map((item, i) => ({ label: item.name, value: i, color: item.color }));
    if (category === 'outfit') return outfits.map((item, i) => ({ label: item.name, value: i, color: item.top }));
    return accessories.map((name, i) => ({ label: name, value: i, color: i === 0 ? '#f2f2f2' : '#181818' }));
  }, [category]);

  const key = category;
  const save = () => { localStorage.setItem('stuko-avatar', JSON.stringify(avatar)); setSaved(true); setTimeout(() => setSaved(false), 1800); };

  return (
    <main className="studio">
      <style jsx global>{`
        *{box-sizing:border-box}.studio{min-height:100vh;background:#f5f2ec;color:#111;font-family:Roobert,Arial,sans-serif;padding:22px}.top{height:58px;display:flex;align-items:center;justify-content:space-between;max-width:1280px;margin:auto}.back{border:0;background:none;display:flex;align-items:center;gap:10px;font:400 12px Roobert;cursor:pointer}.brand{font-size:18px;letter-spacing:-.04em}.top button:last-child{border:1px solid #111;border-radius:75px;background:#111;color:#fff;padding:11px 22px;font:400 12px Roobert;cursor:pointer}.shell{max-width:1280px;margin:18px auto 0;display:grid;grid-template-columns:minmax(420px,1fr) 440px;gap:18px;min-height:calc(100vh - 120px)}.preview{position:relative;overflow:hidden;background:linear-gradient(145deg,#dfe9df,#f2d7af 55%,#c88980);min-height:720px;display:flex;align-items:flex-end;justify-content:center}.preview:before{content:'';position:absolute;inset:0;background:radial-gradient(circle at 50% 22%,rgba(255,255,255,.75),transparent 35%),linear-gradient(transparent 68%,rgba(0,0,0,.16));}.preview-copy{position:absolute;z-index:2;left:32px;top:28px}.eyebrow{font:400 10px system-ui;letter-spacing:.16em;text-transform:uppercase;color:#5c5c5c}.preview h1{margin:8px 0 0;font:300 clamp(45px,7vw,82px)/.88 Roobert;letter-spacing:-.06em}.avatar-stage{position:relative;z-index:3;transform:translateY(-18px)}.controls{background:#fff;border:1px solid #111;padding:28px 26px;display:flex;flex-direction:column}.control-head{display:flex;justify-content:space-between;align-items:flex-end;padding-bottom:24px;border-bottom:1px solid #ddd}.control-head h2{font:400 39px/.95 Roobert;margin:0;letter-spacing:-.055em}.control-head p{margin:0;color:#777;font-size:11px}.tabs{display:grid;grid-template-columns:repeat(4,1fr);border-bottom:1px solid #ddd;margin-bottom:22px}.tab{border:0;background:none;padding:15px 5px 13px;color:#777;font:400 11px Roobert;cursor:pointer;position:relative}.tab.active{color:#111}.tab.active:after{content:'';position:absolute;height:2px;bottom:-1px;left:18%;right:18%;background:#111}.choices{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;overflow:auto;padding-right:2px}.choice{border:1px solid #ddd;background:#fafafa;min-height:88px;padding:10px;cursor:pointer;text-align:left;transition:transform .7s cubic-bezier(.19,1,.22,1),border-color .4s,background .4s}.choice:hover{transform:translateY(-3px);border-color:#111}.choice.selected{border-color:#111;background:#f1eee8}.swatch{width:42px;height:42px;border-radius:50%;margin-bottom:8px;border:1px solid rgba(0,0,0,.12)}.choice-name{font-size:11px}.tip{margin-top:auto;border-top:1px solid #ddd;padding-top:18px;color:#777;font:400 11px/1.5 system-ui}.saved{display:inline-flex;align-items:center;gap:6px;color:#245d38}.figure{position:relative;width:180px;height:420px}.figure.small{transform:scale(.42);transform-origin:bottom center}.head{position:absolute;width:142px;height:157px;border-radius:48% 48% 45% 45%;left:19px;top:36px;box-shadow:inset -11px -12px 0 rgba(0,0,0,.05)}.hair{position:absolute;left:-4px;top:-15px;width:150px;height:105px;border-radius:50% 50% 35% 30%;z-index:3}.hair.cloud:after{content:'';position:absolute;width:55px;height:55px;border-radius:50%;right:-7px;bottom:10px;background:inherit}.hair.bob{height:120px;border-radius:48% 48% 38% 38%;}.eye{position:absolute;z-index:4;top:77px;width:8px;height:12px;border-radius:50%;background:#161616}.eye.left{left:44px}.eye.right{right:44px}.mouth{position:absolute;z-index:4;left:64px;top:108px;width:14px;height:7px;border-bottom:2px solid #8a4e45;border-radius:0 0 50% 50%}.body{position:absolute;top:175px;left:25px;width:130px;height:150px;border-radius:35px 35px 12px 12px;box-shadow:inset -12px -12px rgba(0,0,0,.08)}.neck{position:absolute;width:30px;height:28px;left:50px;top:-16px;border-radius:8px}.legs{position:absolute;top:310px;left:42px;display:flex;gap:10px}.legs i{display:block;width:45px;height:82px;border-radius:9px}.shadow{position:absolute;bottom:13px;left:8px;width:164px;height:26px;background:rgba(0,0,0,.2);filter:blur(10px);border-radius:50%}.glasses{position:absolute;z-index:5;top:70px;left:31px;display:flex;gap:4px}.glasses i{width:39px;height:29px;border:3px solid #181818;border-radius:50%}.glasses:after{content:'';position:absolute;left:38px;top:12px;width:15px;height:3px;background:#181818}.phones i{position:absolute;z-index:5;top:24px;width:20px;height:92px;border:7px solid #181818;border-radius:20px}.phones i:first-child{left:-11px}.phones i:nth-child(2){right:-11px}.phones b{position:absolute;z-index:6;left:16px;top:-12px;width:110px;height:50px;border:8px solid #181818;border-bottom:0;border-radius:60px 60px 0 0}.beanie{position:absolute;z-index:6;left:4px;top:-18px;width:134px;height:57px;border-radius:70px 70px 18px 18px;background:#252525;color:#fff;text-align:center;padding-top:19px;font:600 11px system-ui}.bow{position:absolute;z-index:6;top:-4px;right:5px}.bow i{display:block;position:absolute;width:27px;height:22px;background:#a52d25;border-radius:12px 12px 2px 12px}.bow i:first-child{transform:rotate(30deg)}.bow i:nth-child(2){transform:translate(18px,-1px) scaleX(-1) rotate(30deg)}@media(max-width:900px){.shell{grid-template-columns:1fr}.preview{min-height:560px}.controls{min-height:540px}}@media(max-width:520px){.studio{padding:10px}.preview{min-height:500px}.choices{grid-template-columns:repeat(2,1fr)}.control-head h2{font-size:32px}}
      `}</style>
      <header className="top"><button className="back" onClick={() => window.location.href='/'}><ArrowLeft size={15}/> STUKO</button><div className="brand">AVATAR STUDIO</div><button onClick={save}>{saved ? 'Saved ✓' : 'Save avatar'}</button></header>
      <section className="shell">
        <div className="preview"><div className="preview-copy"><div className="eyebrow">STUKO / IDENTITY</div><h1>Make<br/>yourself.</h1></div><div className="avatar-stage"><AvatarFigure avatar={avatar}/></div></div>
        <aside className="controls"><div className="control-head"><div><div className="eyebrow">01 / customize</div><h2>Your avatar</h2></div>{saved ? <span className="saved"><Check size={14}/> saved</span> : <Sparkles size={18}/>}</div><div className="tabs">{(['skin','hair','outfit','accessory'] as const).map(item => <button key={item} className={`tab ${category===item?'active':''}`} onClick={() => setCategory(item)}>{item}</button>)}</div><div className="choices">{options.map(option => <button key={option.label} className={`choice ${avatar[key]===option.value?'selected':''}`} onClick={() => setAvatar(v => ({...v,[key]:option.value}))}><div className="swatch" style={{background:option.color}}/><div className="choice-name">{option.label}</div></button>)}</div><div className="tip">Your avatar is saved locally for this prototype. Later, this becomes a persistent STUKO identity synced to your account — and the same avatar will appear when you enter the World.</div><button className="top-enter" onClick={() => { save(); window.location.href='/world'; }}>Enter STUKO World <ChevronRight size={15}/></button></aside>
      </section>
    </main>
  );
}
