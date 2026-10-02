'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import SiteChrome from '@/app/components/SiteChrome';

type Subject = { id: number; name: string; credits: string; grade: string };
type Semester = { id: number; name: string; sgpa: string; credits: string };
type Scale = '10' | '5' | '4';
type GradeMode = 'points' | 'type1' | 'type2' | 'type3';

const TYPE1: Record<string, number> = { O: 1, 'A+': .9, A: .8, 'B+': .7, B: .6, C: .5, P: .4, F: 0 };
const TYPE2: Record<string, number> = { S: 1, 'A+': .9, A: .8, 'B+': .7, B: .6, C: .5, D: .4, E: .3, F: 0 };
const TYPE3: Record<string, number> = { 'A+': 1, A: .9, 'B+': .8, B: .7, C: .6, D: .5, E: .4, F: 0 };

const gradesFor = (mode: GradeMode) => mode === 'type1' ? Object.keys(TYPE1) : mode === 'type2' ? Object.keys(TYPE2) : Object.keys(TYPE3);
const emptySubject = (id: number): Subject => ({ id, name: '', credits: '3', grade: 'A' });
const emptySemester = (id: number): Semester => ({ id, name: `Semester ${id}`, sgpa: '', credits: '20' });

export default function SgpaCgpaPage() {
  const [mode, setMode] = useState<'sgpa' | 'cgpa' | 'percentage' | 'predictor'>('sgpa');
  const [scale, setScale] = useState<Scale>('10');
  const [grading, setGrading] = useState<GradeMode>('type1');
  const [subjects, setSubjects] = useState<Subject[]>([1, 2, 3, 4, 5].map(emptySubject));
  const [semesters, setSemesters] = useState<Semester[]>([1, 2].map(emptySemester));
  const [currentCgpa, setCurrentCgpa] = useState('8.8');
  const [completedCredits, setCompletedCredits] = useState('40');
  const [nextCredits, setNextCredits] = useState('20');
  const [targetCgpa, setTargetCgpa] = useState('9.0');

  const gradePoint = (grade: string) => {
    if (grading === 'points') return Math.max(0, Math.min(Number(scale), Number(grade) || 0));
    const map = grading === 'type1' ? TYPE1 : grading === 'type2' ? TYPE2 : TYPE3;
    return (map[grade] ?? 0) * Number(scale);
  };

  const sgpa = useMemo(() => {
    const rows = subjects.filter(s => Number(s.credits) > 0);
    const credits = rows.reduce((sum, s) => sum + Number(s.credits), 0);
    const points = rows.reduce((sum, s) => sum + Number(s.credits) * gradePoint(s.grade), 0);
    return credits ? points / credits : 0;
  }, [subjects, grading, scale]);

  const cgpa = useMemo(() => {
    const rows = semesters.filter(s => Number(s.credits) > 0 && Number(s.sgpa) >= 0);
    const credits = rows.reduce((sum, s) => sum + Number(s.credits), 0);
    const points = rows.reduce((sum, s) => sum + Number(s.credits) * Number(s.sgpa), 0);
    return credits ? points / credits : 0;
  }, [semesters]);

  const predictor = useMemo(() => {
    const current = Number(currentCgpa) || 0;
    const done = Number(completedCredits) || 0;
    const next = Number(nextCredits) || 0;
    const target = Number(targetCgpa) || 0;
    if (!next) return null;
    const required = (target * (done + next) - current * done) / next;
    return { required, possible: required <= Number(scale), target };
  }, [currentCgpa, completedCredits, nextCredits, targetCgpa, scale]);

  const percentage = (value: number) => Math.max(0, Math.min(100, value * (100 / Number(scale))));
  const updateSubject = (id: number, key: keyof Subject, value: string) => setSubjects(rows => rows.map(row => row.id === id ? { ...row, [key]: value } : row));
  const updateSemester = (id: number, key: keyof Semester, value: string) => setSemesters(rows => rows.map(row => row.id === id ? { ...row, [key]: value } : row));
  const addSubject = () => setSubjects(rows => [...rows, emptySubject((rows.at(-1)?.id ?? 0) + 1)]);
  const removeSubject = (id: number) => setSubjects(rows => rows.length > 1 ? rows.filter(row => row.id !== id) : rows);
  const addSemester = () => setSemesters(rows => [...rows, emptySemester((rows.at(-1)?.id ?? 0) + 1)]);
  const removeSemester = (id: number) => setSemesters(rows => rows.length > 1 ? rows.filter(row => row.id !== id) : rows);

  return (
    <SiteChrome>
      <main className="academic-page">
        <Link href="/" className="back-link">← back</Link>
        <section className="academic-shell">
          <header className="academic-head">
            <div><p className="tool-kicker">STUKO / ACADEMICS</p><h1>SGPA / CGPA calculator</h1><p className="lead">Calculate your SGPA, total CGPA, percentage equivalent, or find the SGPA you need to reach your target.</p></div>
            <div className="scale-card"><span>GRADING SCALE</span><strong>{scale}-point</strong></div>
          </header>

          <nav className="mode-tabs" aria-label="calculator mode">
            {([['sgpa','SGPA'],['cgpa','CGPA'],['percentage','CGPA → percentage'],['predictor','CGPA predictor']] as const).map(([key,label]) => <button key={key} className={mode === key ? 'active' : ''} onClick={() => setMode(key)}>{label}</button>)}
          </nav>

          <section className="settings">
            <label><span>Grading scale</span><select value={scale} onChange={e => setScale(e.target.value as Scale)}><option value="10">10-point</option><option value="5">5-point</option><option value="4">4-point</option></select></label>
            <label><span>Grade input</span><select value={grading} onChange={e => setGrading(e.target.value as GradeMode)}><option value="points">Grade points</option><option value="type1">Letter grades — Type 1 (JNTUH-style)</option><option value="type2">Letter grades — Type 2 (S highest)</option><option value="type3">Letter grades — Type 3 (A+ highest)</option></select></label>
          </section>

          {mode === 'sgpa' && <section className="calculator-section">
            <div className="section-title"><div><h2>Semester subjects</h2><p>Enter every subject, its credits and its grade or grade point.</p></div><button className="small-button" onClick={addSubject}>＋ add subject</button></div>
            <div className="subject-table"><div className="table-head"><span>SUBJECT</span><span>CREDITS</span><span>GRADE / POINT</span><span /></div>
              {subjects.map(subject => <div className="table-row" key={subject.id}><input placeholder="Subject name" value={subject.name} onChange={e => updateSubject(subject.id,'name',e.target.value)} /><input type="number" min="0" step="0.5" value={subject.credits} onChange={e => updateSubject(subject.id,'credits',e.target.value)} />{grading === 'points' ? <input type="number" min="0" max={scale} step="0.1" value={subject.grade} onChange={e => updateSubject(subject.id,'grade',e.target.value)} /> : <select value={gradesFor(grading).includes(subject.grade) ? subject.grade : gradesFor(grading)[0]} onChange={e => updateSubject(subject.id,'grade',e.target.value)}>{gradesFor(grading).map(g => <option key={g}>{g}</option>)}</select>}<button className="remove" onClick={() => removeSubject(subject.id)} aria-label="remove subject">×</button></div>)}
            </div>
            <ResultCard label="YOUR SGPA" value={sgpa} scale={scale} credits={subjects.reduce((sum,s)=>sum+(Number(s.credits)||0),0)} percentage={percentage(sgpa)} />
          </section>}

          {mode === 'cgpa' && <section className="calculator-section">
            <div className="section-title"><div><h2>Semester history</h2><p>CGPA is a credit-weighted average of your semester SGPAs.</p></div><button className="small-button" onClick={addSemester}>＋ add semester</button></div>
            <div className="subject-table"><div className="table-head"><span>SEMESTER</span><span>SGPA</span><span>CREDITS</span><span /></div>{semesters.map(sem => <div className="table-row" key={sem.id}><input value={sem.name} onChange={e=>updateSemester(sem.id,'name',e.target.value)} /><input type="number" min="0" max={scale} step="0.01" value={sem.sgpa} placeholder="e.g. 8.80" onChange={e=>updateSemester(sem.id,'sgpa',e.target.value)} /><input type="number" min="0" step="0.5" value={sem.credits} onChange={e=>updateSemester(sem.id,'credits',e.target.value)} /><button className="remove" onClick={()=>removeSemester(sem.id)}>×</button></div>)}</div>
            <ResultCard label="TOTAL CGPA" value={cgpa} scale={scale} credits={semesters.reduce((sum,s)=>sum+(Number(s.credits)||0),0)} percentage={percentage(cgpa)} />
          </section>}

          {mode === 'percentage' && <section className="calculator-section simple-section"><h2>Convert CGPA to percentage</h2><p className="section-copy">Enter your CGPA and the scale used by your university. This is a simple scale-based equivalent; check your university's official conversion rule when required.</p><div className="big-input-grid"><label><span>CGPA</span><input type="number" min="0" max={scale} step="0.01" value={currentCgpa} onChange={e=>setCurrentCgpa(e.target.value)} /></label><label><span>Scale</span><select value={scale} onChange={e=>setScale(e.target.value as Scale)}><option value="10">10</option><option value="5">5</option><option value="4">4</option></select></label></div><div className="conversion-result"><span>EQUIVALENT</span><strong>{percentage(Number(currentCgpa)||0).toFixed(2)}%</strong></div></section>}

          {mode === 'predictor' && <section className="calculator-section simple-section"><h2>What SGPA do I need next semester?</h2><p className="section-copy">Use your current credit-weighted CGPA to find the SGPA required next semester.</p><div className="big-input-grid"><label><span>Current CGPA</span><input type="number" min="0" max={scale} step="0.01" value={currentCgpa} onChange={e=>setCurrentCgpa(e.target.value)} /></label><label><span>Credits completed</span><input type="number" min="0" step="0.5" value={completedCredits} onChange={e=>setCompletedCredits(e.target.value)} /></label><label><span>Next semester credits</span><input type="number" min="0" step="0.5" value={nextCredits} onChange={e=>setNextCredits(e.target.value)} /></label><label><span>Target CGPA</span><input type="number" min="0" max={scale} step="0.01" value={targetCgpa} onChange={e=>setTargetCgpa(e.target.value)} /></label></div>{predictor && <div className={`prediction ${predictor.possible?'possible':'impossible'}`}><span>REQUIRED NEXT-SEMESTER SGPA</span><strong>{predictor.required.toFixed(2)}</strong><p>{predictor.required<=0?'You have already reached this target.':predictor.possible?`You can reach ${predictor.target.toFixed(2)} CGPA if you score at least ${predictor.required.toFixed(2)} SGPA next semester.`:`That target is not reachable in one semester on a ${scale}-point scale. Try a longer-term target.`}</p></div>}</section>}

          <section className="formula"><strong>How STUKO calculates it</strong><span>SGPA = Σ(Credit × Grade Point) ÷ Σ(Credits)</span><span>CGPA = Σ(SGPA × Semester Credits) ÷ Σ(Semester Credits)</span><p>Letter grades are converted to numerical grade points using the selected letter-grade system. Different universities use different letter-grade conventions, so always select the system that matches your university.</p></section>
        </section>
      </main>
      <style jsx global>{`
        .academic-page{min-height:100svh;padding:145px 20px 110px;box-sizing:border-box;color:var(--page-text,#151515)}.academic-shell{width:min(1080px,100%);margin:45px auto 0}.back-link{color:var(--page-text);text-decoration:none;font-size:13px}.academic-head{display:flex;justify-content:space-between;gap:30px;align-items:flex-start}.tool-kicker{font:11px 'Courier New',monospace;letter-spacing:.16em;color:#888;margin:0 0 14px}.academic-head h1{font-size:clamp(45px,6vw,82px);line-height:.95;letter-spacing:-.06em;font-weight:450;margin:0;max-width:780px}.lead{font-size:15px;line-height:1.6;color:#777;max-width:720px;margin:20px 0 0}.scale-card{min-width:120px;border:1px solid #ddd;border-radius:15px;padding:13px;text-align:center}.scale-card span{display:block;font-size:8px;letter-spacing:.12em;color:#888}.scale-card strong{display:block;font-size:19px;margin-top:5px}.mode-tabs{display:flex;flex-wrap:wrap;gap:7px;margin-top:48px;border-bottom:1px solid #ddd;padding-bottom:9px}.mode-tabs button,.small-button{border:1px solid #d8d8d3;background:#fafaf8;color:#222;border-radius:999px;padding:10px 15px;font-size:11px;font-weight:750;cursor:pointer}.mode-tabs button.active{background:#151515;color:#fff;border-color:#151515}.settings{display:flex;gap:12px;margin-top:20px}.settings label,.big-input-grid label{display:flex;flex-direction:column;gap:7px;font-size:10px;font-weight:800}.settings select,.big-input-grid input,.big-input-grid select,.table-row input,.table-row select{height:42px;border:1px solid #d8d8d3;border-radius:9px;background:#fafaf8;color:#151515;padding:0 11px;outline:none}.calculator-section{margin-top:25px;background:rgba(255,255,255,.98);border:1px solid #e1e1dc;border-radius:20px;padding:25px}.section-title{display:flex;justify-content:space-between;align-items:center;gap:15px}.section-title h2,.simple-section h2{font-size:23px;letter-spacing:-.03em;margin:0}.section-title p,.section-copy{font-size:11px;color:#888;margin:6px 0 0}.subject-table{margin-top:20px}.table-head,.table-row{display:grid;grid-template-columns:minmax(0,1fr) 100px 150px 35px;gap:8px;align-items:center}.table-head{padding:0 10px 8px;color:#999;font:8px 'Courier New',monospace;letter-spacing:.1em}.table-row{padding:6px 0}.remove{border:0;background:transparent;color:#999;font-size:20px;cursor:pointer}.result-card{margin-top:22px;background:#151515;color:#fff;border-radius:15px;padding:21px}.result-card .result-kicker{font:8px 'Courier New',monospace;letter-spacing:.12em;opacity:.65}.result-card strong{display:block;font-size:48px;letter-spacing:-.05em;margin:5px 0}.result-meta{display:flex;gap:18px;font-size:10px;opacity:.7}.big-input-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px;margin-top:20px}.conversion-result,.prediction{margin-top:20px;border-radius:15px;padding:22px;background:#151515;color:#fff}.conversion-result span,.prediction>span{font:8px 'Courier New',monospace;letter-spacing:.12em;opacity:.65}.conversion-result strong,.prediction strong{display:block;font-size:42px;margin-top:5px}.prediction p{font-size:11px;line-height:1.5;opacity:.75;max-width:650px}.prediction.impossible{background:#3d2020}.formula{display:flex;flex-wrap:wrap;gap:10px 20px;margin:24px 0 0;padding:18px;border-top:1px solid #ddd;color:#777;font-size:10px}.formula strong{color:var(--page-text,#151515)}.formula p{width:100%;margin:3px 0 0;line-height:1.6}.settings select{min-width:170px}.simple-section{padding-bottom:30px}@media(max-width:700px){.academic-page{padding-top:115px}.academic-head{display:block}.scale-card{display:none}.table-head,.table-row{grid-template-columns:minmax(0,1fr) 75px 115px 28px}.calculator-section{padding:17px}.big-input-grid{grid-template-columns:1fr}.settings{flex-direction:column}.settings select{width:100%}}
      `}</style>
    </SiteChrome>
  );
}

function ResultCard({label,value,scale,credits,percentage}:{label:string;value:number;scale:Scale;credits:number;percentage:number}){
  return <div className="result-card"><span className="result-kicker">{label}</span><strong>{value.toFixed(2)} / {scale}</strong><div className="result-meta"><span>{credits.toFixed(1)} credits</span><span>{percentage.toFixed(2)}% scale equivalent</span></div></div>;
}
