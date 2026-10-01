'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import SiteChrome from '@/app/components/SiteChrome';

type ExamPlan = { days: number; subject: string; syllabus: string; target: number };
type Task = { id: number; text: string; done: boolean; revised: boolean; confidence: 'weak' | 'okay' | 'strong' };

type PaperTopic = { topic: string; appearances: number };

const days = [1, 2];
const targets = Array.from({ length: 31 }, (_, i) => 70 + i);
const REALITY_CHECKS = [
  'Are you satisfied with an average life?',
  'Baby, nothing comes for free',
  'Driven by a greed to succeed',
  'Nobody can stop me',
  'Are you satisfied with an easy ride?',
  'All I ever wanted was the world',
  "I can't help that I need it all",
  'stop making pathetic excuses',
  "stop wasting the time you claim you don't have",
  'While you sit there staring at a screen doing absolutely nothing, other people are outworking you, outsmarting you, and taking the exact spots, grades, and opportunities you want for yourself',
  "Do you actually think your dream life is going to hand itself to you because you felt like being lazy today? Spoiler alert: it's not",
  'You are choosing mediocrity every single second you sit there paralyzed by your own useless procrastination.',
  "Quit whining about how hard it is or how much you don't feel like doing it. Nobody cares about your feelings; they care about your results",
  'Listen to me: you are actively sabotaging your own life every single time you let your eyes glaze over. You are sitting there staring at that screen like a complete zombie, letting your brain turn to mush while the clock ticks away',
  "You think you're 'trying'? You're not trying, you're just sitting there wasting electricity and pretending to work so you don't feel guilty. It's pathetic.",
  "Stop letting your mind drift off like a helpless child. You have total control over your focus, but you're choosing to be weak and lazy",
  'Every minute you spend zoning out is a minute you are throwing straight into the garbage. Do you want to fail?'
];

function formatTime(seconds: number) {
  return `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
}

function makeTasks(syllabus: string): Task[] {
  return syllabus
    .split(/[\n,;]+/)
    .map((x) => x.trim())
    .filter(Boolean)
    .map((text, i) => ({ id: Date.now() + i, text, done: false, revised: false, confidence: 'weak' }));
}

export default function ExamModePage() {
  const [plan, setPlan] = useState<ExamPlan | null>(null);
  const [form, setForm] = useState(true);
  const [examDays, setExamDays] = useState(1);
  const [subject, setSubject] = useState('');
  const [syllabus, setSyllabus] = useState('');
  const [target, setTarget] = useState(90);
  const [seconds, setSeconds] = useState(1500);
  const [running, setRunning] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [pomodoros, setPomodoros] = useState(0);
  const [distraction, setDistraction] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [realityCheck, setRealityCheck] = useState('');
  const [paperText, setPaperText] = useState('');
  const [paperTopics, setPaperTopics] = useState<PaperTopic[]>([]);
  const [paperName, setPaperName] = useState('');
  const [paperError, setPaperError] = useState('');

  useEffect(() => {
    try {
      const saved = localStorage.getItem('stuko-exam-plan');
      if (saved) {
        const p = JSON.parse(saved) as ExamPlan;
        if (p.subject && p.syllabus) {
          setPlan(p);
          setForm(false);
          setExamDays(Math.min(2, Math.max(1, p.days)));
          setSubject(p.subject);
          setSyllabus(p.syllabus);
          setTarget(p.target);
          setTasks(makeTasks(p.syllabus));
          setPomodoros(Number(localStorage.getItem('stuko-exam-pomodoros') || '0'));
        }
      }
    } catch {}
  }, []);

  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => {
      setSeconds((value) => Math.max(value - 1, 0));
    }, 1000);
    return () => window.clearInterval(id);
  }, [running]);

  useEffect(() => {
    if (!running || seconds > 0) return;
    setRunning(false);
    setPomodoros((value) => {
      const next = value + 1;
      localStorage.setItem('stuko-exam-pomodoros', String(next));
      return next;
    });
    setSeconds(1500);
  }, [seconds, running]);

  useEffect(() => {
    const onFullscreen = () => setFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', onFullscreen);
    return () => document.removeEventListener('fullscreenchange', onFullscreen);
  }, []);

  const completed = useMemo(() => tasks.filter((t) => t.done).length, [tasks]);
  const weak = useMemo(() => tasks.filter((t) => t.confidence === 'weak').length, [tasks]);
  const revised = useMemo(() => tasks.filter((t) => t.revised).length, [tasks]);
  const practice = useMemo(() => paperTopics.length, [paperTopics]);
  const syllabusCovered = tasks.length ? Math.round((completed / tasks.length) * 100) : 0;
  const revisionCompleted = tasks.length ? Math.round((revised / tasks.length) * 100) : 0;
  const practiceCompleted = tasks.length ? Math.min(100, Math.round((practice / tasks.length) * 100)) : 0;
  const readiness = Math.round(syllabusCovered * 0.45 + Math.max(0, 100 - weak * 8) * 0.2 + revisionCompleted * 0.15 + practiceCompleted * 0.1 + Math.min(100, pomodoros * 5) * 0.1);
  const estimatedReadiness = Math.min(100, Math.max(0, readiness + Math.max(0, examDays - 1) * 8));

  function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!subject.trim() || !syllabus.trim()) return;
    const p = { days: examDays, subject: subject.trim(), syllabus: syllabus.trim(), target };
    setPlan(p);
    setForm(false);
    setSeconds(1500);
    setPomodoros(0);
    setTasks(makeTasks(syllabus));
    setPaperTopics([]);
    localStorage.setItem('stuko-exam-plan', JSON.stringify(p));
    localStorage.setItem('stuko-exam-pomodoros', '0');
  }

  function toggleTask(id: number) {
    setTasks((items) => items.map((task) => task.id === id ? { ...task, done: !task.done, confidence: !task.done ? 'okay' : task.confidence } : task));
  }

  function cycleConfidence(id: number) {
    setTasks((items) => items.map((task) => {
      if (task.id !== id) return task;
      const next = task.confidence === 'weak' ? 'okay' : task.confidence === 'okay' ? 'strong' : 'weak';
      return { ...task, confidence: next };
    }));
  }

  function toggleRevision(id: number) {
    setTasks((items) => items.map((task) => task.id === id ? { ...task, revised: !task.revised } : task));
  }

  async function enterFullscreen() {
    try {
      await document.documentElement.requestFullscreen();
    } catch {}
  }

  function leaveFullscreen() {
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
  }

  function distracted() {
    setRunning(false);
    setDistraction(true);
  }

  async function readPaper(file: File) {
    setPaperError('');
    setPaperName(file.name);
    try {
      let text = '';
      if (file.type === 'text/plain' || file.name.toLowerCase().endsWith('.txt')) {
        text = await file.text();
      } else if (file.name.toLowerCase().endsWith('.docx')) {
        const mammoth = await import('mammoth');
        const result = await mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() });
        text = result.value;
      } else if (file.name.toLowerCase().endsWith('.pdf') || file.type === 'application/pdf') {
        const pdfjs = await import('pdfjs-dist/build/pdf.mjs');
        const pdf = await pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()) }).promise;
        const pages: string[] = [];
        for (let i = 1; i <= pdf.numPages; i += 1) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          pages.push(content.items.map((item: any) => ('str' in item ? item.str : '')).join(' '));
        }
        text = pages.join('\n');
      } else {
        throw new Error('unsupported');
      }
      setPaperText(text);
      analyzePaper(text);
    } catch {
      setPaperError('Could not read that file. Try PDF, DOCX, or TXT, or paste the paper text below.');
    }
  }

  function analyzePaper(text = paperText) {
    const lower = text.toLowerCase();
    const counts = tasks
      .map((task) => ({ topic: task.text, appearances: lower.split(task.text.toLowerCase()).length - 1 }))
      .filter((x) => x.appearances > 0)
      .sort((a, b) => b.appearances - a.appearances);
    setPaperTopics(counts);
  }

  return (
    <SiteChrome>
      <main className="exam-page">
        <div className="exam-back"><Link href="/">← back</Link></div>
        {form ? (
          <form className="exam-form" onSubmit={submit}>
            <p className="kicker">urgent mode · maximum 2 days</p>
            <h1>exam mode.</h1>
            <p className="intro">No skipping. Tell me what we&apos;re working with and we&apos;ll turn it into a two-day survival plan.</p>
            <label>when is your exam?</label>
            <div className="scroll-row">{days.map((d) => <button type="button" className={examDays === d ? 'choice active' : 'choice'} onClick={() => setExamDays(d)} key={d}>{d} {d === 1 ? 'day' : 'days'}</button>)}</div>
            <label>which subject?</label>
            <input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="e.g. Data Structures" required />
            <label>what&apos;s your syllabus?</label>
            <p className="hint">paste every topic here. don&apos;t miss even the minor ones.</p>
            <textarea value={syllabus} onChange={(e) => setSyllabus(e.target.value)} placeholder="Recommendation: directly copy-paste your college syllabus." required />
            <label>what&apos;s your target?</label>
            <div className="scroll-row">{targets.map((v) => <button type="button" className={target === v ? 'choice active' : 'choice'} onClick={() => setTarget(v)} key={v}>{v}%</button>)}</div>
            <button className="start" disabled={!subject.trim() || !syllabus.trim()}>start exam mode →</button>
          </form>
        ) : plan ? (
          <>
            <header className="dash-head">
              <div><p className="kicker">{plan.days} {plan.days === 1 ? 'day' : 'days'} left · {plan.subject} · target {plan.target}%</p><h1>grademaxxing mode.</h1></div>
              <button className="change" onClick={() => setForm(true)}>change plan</button>
            </header>

            <section className="readiness-card">
              <div className="readiness-main"><p className="kicker">estimated, not guaranteed</p><strong>{readiness}%</strong><span>EXAM READINESS</span></div>
              <div className="readiness-metrics">
                <div><b>Syllabus covered</b><span>{syllabusCovered}%</span></div>
                <div><b>Weak topics</b><span>{weak}</span></div>
                <div><b>Revision completed</b><span>{revisionCompleted}%</span></div>
                <div><b>Practice completed</b><span>{practiceCompleted}%</span></div>
                <div><b>Pomodoros</b><span>{pomodoros}</span></div>
              </div>
              <p className="pace">At your current pace: ~{estimatedReadiness}% readiness by exam day. <small>This is an estimate, not a guarantee.</small></p>
            </section>

            <div className="exam-grid">
              <section className="timer-card">
                <span className="timer-label">pomodoro · 25 / 5</span>
                <strong>{formatTime(seconds)}</strong>
                <p>{running ? 'focus. stay here.' : 'ready when you are.'}</p>
                <div className="timer-actions"><button className="start" onClick={() => setRunning((v) => !v)}>{running ? 'pause' : 'start'}</button><button className="change" onClick={() => { setRunning(false); setSeconds(1500); }}>reset</button></div>
                <button className="reality" onClick={() => setRealityCheck(REALITY_CHECKS[Math.floor(Math.random() * REALITY_CHECKS.length)])}>🧨 reality check</button>
                {realityCheck && <div className="reality-pop"><button onClick={() => setRealityCheck('')} aria-label="Close">×</button>{realityCheck}</div>}
                <button className="distracted" onClick={distracted}>I got distracted</button>
                <button className="focus-lock" onClick={enterFullscreen}>⛶ focus lock</button>
                <p className="esc-hint">focus lock uses browser fullscreen · press Esc to leave</p>
              </section>

              <section className="tasks-card">
                <div className="tasks-head"><div><p className="kicker">syllabus breakdown</p><h2>your tasks</h2></div><span>{completed}/{tasks.length}</span></div>
                <div className="task-list">{tasks.map((task) => <div key={task.id} className={task.done ? 'task done' : 'task'}><button className="task-check" onClick={() => toggleTask(task.id)}>{task.done ? '✓' : '○'}</button><button className="task-text" onClick={() => cycleConfidence(task.id)}>{task.text}<small>{task.confidence} · click to change</small></button><button className="revision" onClick={() => toggleRevision(task.id)}>{task.revised ? 'revised ✓' : 'revise'}</button></div>)}</div>
              </section>
            </div>

            <section className="past-paper-card">
              <div className="paper-head"><div><p className="kicker">past-paper mode</p><h2>find what keeps coming back.</h2></div><label className="upload-paper">＋ upload paper<input type="file" accept=".pdf,.docx,.txt,text/plain,application/pdf" onChange={(e) => { const f = e.target.files?.[0]; if (f) readPaper(f); }} /></label></div>
              <textarea value={paperText} onChange={(e) => setPaperText(e.target.value)} onBlur={() => analyzePaper()} placeholder="Or paste a previous question paper here..." />
              <div className="paper-actions"><span>{paperName || 'no paper selected'}</span><button className="change" onClick={() => analyzePaper()}>analyze paper</button></div>
              {paperError && <p className="paper-error">{paperError}</p>}
              {paperTopics.length > 0 && <div className="paper-results"><div><p className="kicker">frequently appearing topics</p><div className="paper-table">{paperTopics.map((item) => <div key={item.topic}><span>{item.topic}</span><b>{item.appearances}</b></div>)}</div></div><div className="priority"><p className="kicker">high priority</p><strong>{paperTopics.slice(0, 3).map((x) => x.topic).join(' · ')}</strong></div></div>}
            </section>
          </>
        ) : null}

        {distraction && <div className="distraction-overlay"><div className="distraction-card"><p className="kicker">welcome back.</p><h2>You lost some time.</h2><p>That time is already gone. No guilt spiral. No restarting your life. Just start the next 25.</p><button className="start" onClick={() => { setDistraction(false); setRunning(true); }}>start the next 25 →</button></div></div>}
        {fullscreen && <div className="fullscreen-hint">FOCUS SESSION ACTIVE · press <b>Esc</b> to leave fullscreen</div>}
      </main>
      <style jsx global>{`
        .exam-page{width:min(1120px,calc(100% - 32px));margin:auto;padding:28px 0 110px;min-height:calc(100svh - 150px);box-sizing:border-box}.exam-back{margin-bottom:18px}.exam-back a{display:inline-block;border:1px solid var(--line);border-radius:999px;padding:9px 15px;color:var(--page-text);text-decoration:none;background:var(--glass-soft)}.exam-form,.timer-card,.tasks-card,.readiness-card,.past-paper-card{border:1px solid var(--line);border-radius:30px;background:var(--glass-soft);backdrop-filter:blur(15px);-webkit-backdrop-filter:blur(15px)}.exam-form{width:min(720px,100%);margin:auto;padding:32px;box-sizing:border-box}.kicker{margin:0 0 9px;font:12px 'Courier New',monospace;letter-spacing:.15em;opacity:.62}.exam-form h1,.dash-head h1{margin:0;font-size:clamp(48px,7vw,78px);font-weight:400;letter-spacing:-.065em;line-height:.95}.intro{opacity:.68;line-height:1.5;margin:16px 0 28px}.exam-form label{display:block;margin:23px 0 9px;font-size:18px}.hint{font-size:12px;opacity:.58;margin:-3px 0 9px}.exam-form input,.exam-form textarea,.past-paper-card textarea{width:100%;box-sizing:border-box;border:1px solid var(--line);border-radius:15px;background:rgba(255,255,255,.08);color:var(--page-text);padding:13px 14px;font:inherit;outline:none}.exam-form textarea{min-height:145px;resize:vertical}.scroll-row{display:flex;gap:8px;overflow-x:auto;padding:3px 2px 8px}.choice{flex:0 0 auto;border:1px solid var(--line);border-radius:999px;background:transparent;color:var(--page-text);padding:10px 14px;font:inherit;font-size:13px;cursor:pointer}.choice.active{background:var(--page-text);color:var(--page-bg);border-color:var(--page-text)}.start{border:1px solid var(--page-text);background:var(--page-text);color:var(--page-bg);border-radius:999px;padding:12px 20px;font:inherit;cursor:pointer;margin-top:18px}.start:disabled{opacity:.3;cursor:not-allowed}.exam-form>.start{width:100%}.dash-head{display:flex;justify-content:space-between;align-items:flex-end;gap:20px;margin:25px 0 28px}.change{border:1px solid var(--line);border-radius:999px;background:transparent;color:var(--page-text);padding:10px 15px;font:inherit;cursor:pointer}.readiness-card{padding:25px;display:grid;grid-template-columns:.55fr 1.45fr;gap:24px;align-items:center;margin-bottom:20px}.readiness-main strong{display:block;font-size:70px;line-height:.9;letter-spacing:-.07em;font-weight:400}.readiness-main span{display:block;margin-top:10px;font:11px 'Courier New',monospace;letter-spacing:.13em;opacity:.6}.readiness-metrics{display:grid;grid-template-columns:repeat(5,1fr);gap:8px}.readiness-metrics div{border:1px solid var(--line);border-radius:16px;padding:13px}.readiness-metrics b{display:block;font-size:11px;opacity:.55;font-weight:400;line-height:1.3}.readiness-metrics span{display:block;font-size:25px;margin-top:8px}.pace{grid-column:1/-1;margin:0;padding-top:12px;border-top:1px solid var(--line);font-size:14px}.pace small{opacity:.5}.exam-grid{display:grid;grid-template-columns:.9fr 1.1fr;gap:20px}.timer-card,.tasks-card{padding:30px;min-height:540px;box-sizing:border-box}.timer-card{text-align:center;display:flex;flex-direction:column;align-items:center}.timer-label{font:12px 'Courier New',monospace;letter-spacing:.12em;opacity:.6}.timer-card>strong{font-size:clamp(72px,11vw,112px);letter-spacing:-.07em;font-variant-numeric:tabular-nums;margin:65px 0 5px}.timer-card>p{opacity:.58}.timer-actions{display:flex;gap:8px}.timer-actions .change{margin-left:0}.reality,.distracted,.focus-lock{border:1px solid var(--line);border-radius:999px;background:transparent;color:var(--page-text);padding:10px 15px;font:inherit;cursor:pointer;margin-top:16px}.reality{border-color:rgba(210,80,60,.5)}.reality-pop{position:relative;margin-top:12px;max-width:420px;border:1px solid var(--line);border-radius:18px;padding:17px 38px 17px 17px;text-align:left;font-size:14px;line-height:1.5;background:rgba(127,127,127,.10)}.reality-pop button{position:absolute;right:10px;top:8px;border:0;background:transparent;color:var(--page-text);font-size:20px;cursor:pointer}.esc-hint{font-size:10px!important;opacity:.45!important;margin:7px 0 0}.tasks-head{display:flex;justify-content:space-between;align-items:flex-start}.tasks-head h2,.past-paper-card h2{margin:0;font-size:42px;font-weight:400;letter-spacing:-.055em}.tasks-head>span{border:1px solid var(--line);border-radius:999px;padding:7px 10px;font:12px 'Courier New',monospace;opacity:.7}.task-list{display:flex;flex-direction:column;gap:8px;margin-top:25px;max-height:430px;overflow:auto}.task{display:grid;grid-template-columns:auto 1fr auto;gap:9px;align-items:start;width:100%;border:1px solid var(--line);border-radius:15px;background:rgba(255,255,255,.08);padding:11px}.task.done{opacity:.45}.task-check,.task-text,.revision{border:0;background:transparent;color:var(--page-text);font:inherit;cursor:pointer}.task-check{font-family:monospace;padding:2px}.task-text{text-align:left;line-height:1.4}.task-text small{display:block;margin-top:4px;font-size:9px;opacity:.45;text-transform:uppercase;letter-spacing:.08em}.task.done .task-text{text-decoration:line-through}.revision{font-size:10px;border:1px solid var(--line);border-radius:999px;padding:6px 8px;opacity:.7}.past-paper-card{margin-top:20px;padding:28px}.paper-head{display:flex;align-items:flex-start;justify-content:space-between;gap:20px}.upload-paper{border:1px solid var(--line);border-radius:999px;padding:10px 15px;cursor:pointer;font-size:13px}.upload-paper input{display:none}.past-paper-card textarea{min-height:150px;margin-top:20px;resize:vertical}.paper-actions{display:flex;justify-content:space-between;align-items:center;margin-top:10px;font-size:11px;opacity:.6}.paper-results{display:grid;grid-template-columns:1fr 1fr;gap:18px;margin-top:24px}.paper-table{border:1px solid var(--line);border-radius:16px;overflow:hidden}.paper-table div{display:flex;justify-content:space-between;padding:12px 14px;border-bottom:1px solid var(--line)}.paper-table div:last-child{border-bottom:0}.paper-table b{font-family:monospace}.priority{border:1px solid var(--line);border-radius:18px;padding:18px;background:rgba(127,127,127,.08)}.priority strong{display:block;line-height:1.5}.paper-error{font-size:12px;opacity:.7}.distraction-overlay{position:fixed;inset:0;z-index:1000;display:grid;place-items:center;background:rgba(0,0,0,.6);backdrop-filter:blur(8px);padding:20px}.distraction-card{width:min(500px,100%);border:1px solid rgba(255,255,255,.25);border-radius:28px;background:var(--page-bg);color:var(--page-text);padding:32px}.distraction-card h2{font-size:48px;font-weight:400;letter-spacing:-.06em;margin:0}.distraction-card p:not(.kicker){line-height:1.6;opacity:.7}.fullscreen-hint{position:fixed;top:18px;left:50%;transform:translateX(-50%);z-index:1100;border:1px solid rgba(255,255,255,.2);border-radius:999px;background:rgba(0,0,0,.75);color:#fff;padding:9px 14px;font:11px 'Courier New',monospace;letter-spacing:.08em}@media(max-width:820px){.readiness-card{grid-template-columns:1fr}.readiness-metrics{grid-template-columns:repeat(2,1fr)}.exam-grid{grid-template-columns:1fr}.paper-results{grid-template-columns:1fr}}@media(max-width:600px){.exam-form{padding:22px}.dash-head{align-items:flex-start;flex-direction:column}.readiness-metrics{grid-template-columns:1fr 1fr}.task{grid-template-columns:auto 1fr}.revision{grid-column:2;justify-self:start}.paper-head{flex-direction:column}.paper-actions{align-items:flex-start;gap:10px;flex-direction:column}}
      `}</style>
    </SiteChrome>
  );
}
