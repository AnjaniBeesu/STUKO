import { BookOpen, Check, Heart, MessageCircle, UserPlus } from 'lucide-react';

const interests = [['Computer Science',31],['Cybersecurity',22],['History',16],['Mythology',12],['Art & Design',9]];
const statuses = [['Reading',8],['Completed',24],['On hold',3],['Plan to study',7]];

export default async function PublicProfile({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const display = username.replace(/[-_]/g, ' ').toUpperCase();
  return <main className="public-shell"><div className="public-wrap">
    <header className="public-top"><a href="/" className="public-brand">STUKO</a><div className="public-actions"><button><UserPlus size={14}/> Follow</button><button className="plain"><MessageCircle size={14}/> Wall</button></div></header>
    <section className="public-hero"><div className="avatar public-avatar">A</div><div className="public-copy"><div className="public-name"><h1>{display}</h1><span>✦</span></div><p>@{username} · Joined Aug 2025</p><p className="public-bio">building things, collecting knowledge & romanticising the syllabus.</p><div className="public-stats"><b>4 <small>followers</small></b><b>12 <small>following</small></b><b>7 <small>collections</small></b><b>36 <small>sessions</small></b><b>1,284 <small>chapters studied</small></b></div></div></section>
    <nav className="public-tabs"><span className="active">Profile</span><span>Wall</span><span>Collections</span><span>Recent study</span><span>Stats</span></nav>
    <div className="public-grid"><section className="public-panel"><div className="public-heading"><div><h2>Reading activity</h2><p>Study activity over time</p></div><BookOpen size={18}/></div><div className="public-number"><strong>36</strong><span>sessions this month</span></div><div className="heatmap public-heat">{Array.from({length:84}).map((_,i)=><i key={i} className={`cell level-${(i*7+i%5)%5}`}/>)}</div></section>
    <section className="public-panel"><div className="public-heading"><div><h2>Current streak</h2><p>Consistency looks good on you.</p></div><Heart size={18}/></div><div className="public-streak"><strong>7</strong><span>days</span></div><p className="public-note">Best streak · <b>12 days</b></p></section>
    <section className="public-panel"><div className="public-heading"><div><h2>Top interests followed</h2><p>The subjects they keep coming back to.</p></div></div>{interests.map(([name,n])=><div className="public-bar" key={name}><span>{name}</span><div><i style={{width:`${Number(n)*2.7}%`}}/></div><b>{n}%</b></div>)}</section>
    <section className="public-panel"><div className="public-heading"><div><h2>Library status</h2><p>Followed study titles by status.</p></div></div><div className="public-library">{statuses.map(([name,n])=><div key={name}><strong>{n}</strong><span>{name}</span></div>)}</div></section>
    <section className="public-panel public-wide"><div className="public-heading"><div><h2>Wall</h2><p>Leave a little note for @{username}.</p></div><MessageCircle size={18}/></div><div className="wall-empty"><span>♡</span><b>No notes yet.</b><p>Be the first person to leave something nice.</p><button>Write on wall</button></div></section></div>
    <footer className="public-footer">STUKO · public profile · study, but make it yours.</footer>
  </div></main>;
}
