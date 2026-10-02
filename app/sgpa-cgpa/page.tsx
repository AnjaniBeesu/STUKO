'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import SiteChrome from '@/app/components/SiteChrome';

type Subject = { id: number; name: string; credits: string; grade: string };
type Semester = { id: number; name: string; sgpa: string; credits: string };

const JNTUH_GRADES: Record<string, number> = { O: 10, 'A+': 9, A: 8, 'B+': 7, B: 6, C: 5, P: 4, F: 0 };
const COMMON_GRADES = ['O', 'A+', 'A', 'B+', 'B', 'C', 'P', 'F'];

const emptySubject = (id: number): Subject => ({ id, name: '', credits: '3', grade: 'A' });
const emptySemester = (id: number): Semester => ({ id, name: `Semester ${id}`, sgpa: '', credits: '20' });

export default function SgpaCgpaPage() {
  const [mode, setMode] = useState<'sgpa' | 'cgpa' | 'percentage' | 'predictor'>('sgpa');
  const [scale, setScale] = useState<'10' | '5' | '4'>('10');
  const [grading, setGrading] = useState<'jntuh' | 'points'>('jntuh');
  const [subjects, setSubjects] = useState<Subject[]>([1, 2, 3, 4, 5].map(emptySubject));
  const [semesters, setSemesters] = useState<Semester[]>([1, 2].map(emptySemester));
  const [currentCgpa, setCurrentCgpa] = useState('8.8');
  const [completedCredits, setCompletedCredits] = useState('40');
  const [nextCredits, setNextCredits] = useState('20');
  const [targetCgpa, setTargetCgpa] = useState('9.0');

  const gradePoint = (grade: string) => {
    if (grading === 'points') return Math.max(0, Math.min(Number(scale), Number(grade) || 0));
    return JNTUH_GRADES[grade] ?? 0;
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
    return { required, possible: required <= Number(scale), current, target };
  }, [currentCgpa, completedCredits, nextCredits, targetCgpa, scale]);

  const percentage = (value: number) => Math.max(0, Math.min(100, value * (100 / Number(scale))));

  const updateSubject = (id: number, key: keyof Subject, value: string) =>
    setSubjects(rows => rows.map(row => row.id === id ? { ...row, [key]: value } : row));

  const updateSemester = (id: number, key: keyof Semester, value: string) =>
    setSemesters(rows => rows.map(row => row.id === id ? { ...row, [key]: value } : row));

  const addSubject = () => setSubjects(rows => [...rows, emptySubject((rows.at(-1)?.id ?? 0) + 1)]);
  const removeSubject = (id: number) => setSubjects(rows => rows.length > 1 ? rows.filter(row => row.id !== id) : rows);
  const addSemester = () => setSemesters(rows => [...rows, emptySemester((rows.at(-1)?.id ?? 0) + 1)]);
  const removeSemester = (id: number) => setSemesters(rows => rows.length > 1 ? rows.filter(row => row.id !== id) : rows);

  const result = mode === 'sgpa' ? sgpa : mode === 'cgpa' ? cgpa : 0;
  const resultLabel = mode === 'sgpa' ? 'YOUR SGPA' : 'YOUR CGPA';
  const resultCredits = mode === 'sgpa'
    ? subjects.reduce((sum, s) => sum + (Number(s.credits) || 0), 0)
    : semesters.reduce((sum, s) => sum + (Number(s.credits) || 0), 0);

  return (
    <SiteChrome>
      <main className="academic-page">
        <Link href="/" className="back-link">← back</Link>
        <section className="academic-shell">
          <header className="academic-head">
            <div>
              <p className="tool-kicker">STUKO / ACADEMICS</p>
              <h1>SGPA / CGPA calculator</h1>
              <p className="lead">Calculate your semester GPA, total CGPA, percentage equivalent, or find out what you need next semester to hit your target.</p>
            </div>
            <div className="scale-card"><span>GRADING SCALE</span><strong>{scale}-point</strong></div>
          </header>

          <nav className="mode-tabs" aria-label="calculator mode">
            <button className={mode === 'sgpa' ? 'active' : ''} onClick={() => setMode('sgpa')}>SGPA</button>
            <button className={mode === 'cgpa' ? 'active' : ''} onClick={() => setMode('cgpa')}>CGPA</button>
            <button className={mode === 'percentage' ? 'active' : ''} onClick={() => setMode('percentage')}>CGPA → percentage</button>
            <button className={mode === 'predictor' ? 'active' : ''} onClick={() => setMode('predictor')}>CGPA predictor</button>
          </nav>

          <section className="settings">
            <label><span>Grading system</span><select value={scale} onChange={e => setScale(e.target.value as '10' | '5' | '4')}><option value="10">10-point</option><option value="5">5-point</option><option value="4">4-point</option></select></label>
            <label><span>Grade input</span><select value={grading} onChange={e => setGrading(e.target.value as 'jntuh' | 'points')}><option value="jntuh">JNTUH-style grades</option><option value="points">Grade points</option></select></label>
          </section>

          {mode === 'sgpa' && (
            <section className="calculator-section">
              <div className="section-title"><div><h2>Semester subjects</h2><p>Enter every subject, its credits and your grade.</p></div><button className="small-button" onClick={addSubject}>＋ add subject</button></div>
              <div className="subject-table">
                <div className="table-head"><span>SUBJECT</span><span>CREDITS</span><span>GRADE / POINT</span><span /></div>
                {subjects.map(subject => <div className="table-row" key={subject.id}><input placeholder="Subject name" value={subject.name} onChange={e => updateSubject(subject.id, 'name', e.target.value)} /><input type="number" min="0" step="0.5" value={subject.credits} onChange={e => updateSubject(subject.id, 'credits', e.target.value)} />{grading === 'jntuh' ? <select value={subject.grade} onChange={e => updateSubject(subject.id, 'grade', e.target.value)}>{COMMON_GRADES.map(g => <option key={g}>{g}</option>)}</select> : <input type="number" min="0" max={scale} step="0.1" value={subject.grade} onChange={e => updateSubject(subject.id, 'grade', e.target.value)} /> }<button className="remove" onClick={() => removeSubject(subject.id)} aria-label="remove subject">×</button></div>)}
              </div>
              <ResultCard label={resultLabel} value={sgpa} scale={scale} credits={resultCredits} percentage={percentage(sgpa)} />
            </section>
          )}

          {mode === 'cgpa' && (
            <section className="calculator-section">
              <div className="section-title"><div><h2>Semester history</h2><p>CGPA is calculated as a credit-weighted average of your semester SGPAs.</p></div><button className="small-button" onClick={addSemester}>＋ add semester</button></div>
              <div className="subject-table semester-table"><div className="table-head"><span>SEMESTER</span><span>SGPA</span><span>CREDITS</span><span /></div>{semesters.map(sem => <div className="table-row" key={sem.id}><input value={sem.name} onChange={e => updateSemester(sem.id, 'name', e.target.value)} /><input type="number" min="0" max={scale} step="0.01" value={sem.sgpa} placeholder="e.g. 8.80" onChange={e => updateSemester(sem.id, 'sgpa', e.target.value)} /><input type="number" min="0" step="0.5" value={sem.credits} onChange={e => updateSemester(sem.id, 'credits', e.target.value)} /><button className="remove" onClick={() => removeSemester(sem.id)}>×</button></div>)}</div>
              <ResultCard label="TOTAL CGPA" value={cgpa} scale={scale} credits={resultCredits} percentage={percentage(cgpa)} />
            </section>
          )}

          {mode === 'percentage' && (
            <section className="calculator-section simple-section">
              <h2>Convert CGPA to percentage</h2><p className="section-copy">Enter your CGPA and the scale used by your university. The calculator gives a simple scale-based equivalent; always check your university's official conversion rule.</p>
              <div className="big-input-grid"><label><span>CGPA</span><input type="number" min="0" max={scale} step="0.01" value={currentCgpa} onChange={e => setCurrentCgpa(e.target.value)} /></label><label><span>Scale</span><select value={scale} onChange={e => setScale(e.target.value as '10' | '5' | '4')}><option value="10">10</option><option value="5">5</option><option value="4">4</option></select></label></div>
              <div className="conversion-result"><span>EQUIVALENT</span><strong>{percentage(Number(currentCgpa) || 0).toFixed(2)}%</strong></div>
            </section>
          )}

          {mode === 'predictor' && (
            <section className="calculator-section simple-section">
              <h2>What SGPA do I need next semester?</h2><p className="section-copy">Use your current credit-weighted CGPA to find the SGPA required in your next semester.</p>
              <div className="big-input-grid"><label><span>Current CGPA</span><input type="number" min="0" max={scale} step="0.01" value={currentCgpa} onChange={e => setCurrentCgpa(e.target.value)} /></label><label><span>Credits completed</span><input type="number" min="0" step="0.5" value={completedCredits} onChange={e => setCompletedCredits(e.target.value)} /></label><label><span>Next semester credits</span><input type="number" min="0" step="0.5" value={nextCredits} onChange={e => setNextCredits(e.target.value)} /></label><label><span>Target CGPA</span><input type="number" min="0" max={scale} step="0.01" value={targetCgpa} onChange={e => setTargetCgpa(e.target.value)} /></label></div>
              {predictor && <div className={`prediction ${predictor.possible ? 'possible' : 'impossible'}`}><span>REQUIRED NEXT-SEMESTER SGPA</span><strong>{predictor.required.toFixed(2)}</strong><p>{predictor.required <= 0 ? 'You have already reached this target.' : predictor.possible ? `You can reach ${predictor.target.toFixed(2)} CGPA if you score at least ${predictor.required.toFixed(2)} SGPA next semester.` : `That target is not reachable in one semester on a ${scale}-point scale. Try a longer-term target.`}</p></div>}
            </section>
          )}

          <section className="formula"><strong>How STUKO calculates it</strong><span>SGPA = Σ(Credit × Grade Point) ÷ Σ(Credits)</span><span>CGPA = Σ(SGPA × Semester Credits) ÷ Σ(Semester Credits)</span></section>
        </section>
      </main>
      <style jsx global>{`
        .academic-page{min-height:100svh;padding:145px 20px 110px;box-sizing:border-box;color:var(--page-text,#151515)}.academic-shell{width:min(1080px,100%);margin:45px auto 0}.back-link{color:var(--page-text);text-decoration:none;font-size:13px}.academic-head{display:flex;justify-content:space-between;gap:30px;align-items:flex-start}.tool-kicker{font:11px 'Courier New',monospace;letter-spacing:.16em;color:#888;margin:0 0 14px}.academic-head h1{font-size:clamp(45px,6vw,82px);line-height:.95;letter-spacing:-.06em;font-weight:450;margin:0;max-width:780px}.lead{font-size:15px;line-height:1.6;color:#777;max-width:720px;margin:20px 0 0}.scale-card{min-width:120px;border:1px solid #ddd;border-radius:15px;padding:13px;text-align:center}.scale-card span{display:block;font-size:8px;letter-spacing:.12em;color:#888}.scale-card strong{display:block;font-size:19px;margin-top:5px}.mode-tabs{display:flex;flex-wrap:wrap;gap:7px;margin-top:48px;border-bottom:1px solid #ddd;padding-bottom:9px}.mode-tabs button,.small-button{border:1px solid #d8d8d3;background:#fafaf8;color:#222;border-radius:999px;padding:10px 15px;font-size:11px;font-weight:750;cursor:pointer}.mode-tabs button.active{background:#151515;color:#fff;border-color:#151515}.settings{display:flex;gap:12px;margin-top:20px}.settings label,.big-input-grid label{display:flex;flex-direction:column;gap:7px;font-size:10px;font-weight:800}.settings select,.big-input-grid input,.big-input-grid select,.table-row input,.table-row select{height:42px;border:1px solid #d8d8d3;border-radius:9px;background:#fafaf8;color:#151515;padding:0 11px;outline:none}.calculator-section{margin-top:25px;background:rgba(255,255,255,.98);border:1px solid #e1e1dc;border-radius:20px;padding:25px}.section-title{display:flex;justify-content:space-between;align-items:center;gap:15px}.section-title h2,.simple-section h2{font-size:23px;letter-spacing:-.03em;margin:0}.section-title p,.section-copy{font-size:11px;color:#888;margin:6px 0 0}.subject-table{margin-top:20px}.table-head,.table-row{display:grid;grid-template-columns:minmax(0,1fr) 100px 150px 35px;gap:8px;align-items:center}.table-head{padding:0 10px 8px;color:#999;font:8px 'Courier New',monospace;letter-spacing:.1em}.table-row{padding:6px 0}.remove{border:0;background:transparent;color:#999;font-size:20px;cursor:pointer}.result-card{margin-top:22px;background:#151515;color:#fff;border-radius:15px;padding:21px}.result-card>span,.conversion-result span,.prediction>span{font:8px 'Courier New',monospace;letter-spacing:.15em;color:#aaa}.result-card strong{display:block;font-size:48px;letter-spacing:-.06em;margin-top:4px}.result-meta{display:flex;gap:25px;margin-top:12px;color:#aaa;font-size:9px}.result-meta b{color:#fff}.big-input-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:13px;margin-top:25px}.conversion-result{margin-top:25px;background:#151515;color:#fff;border-radius:15px;padding:25px}.conversion-result strong{display:block;font-size:52px;letter-spacing:-.06em;margin-top:5px}.prediction{margin-top:25px;border-radius:15px;padding:25px;background:#eef7ef;color:#153d1c}.prediction.impossible{background:#fff0f0;color:#641e1e}.prediction strong{display:block;font-size:50px;letter-spacing:-.06em;margin:5px 0}.prediction p{font-size:11px;line-height:1.5;margin:0}.formula{display:flex;flex-wrap:wrap;gap:8px 18px;margin:18px 5px;color:#888;font-size:9px}.formula strong{color:var(--page-text)}.formula span{font-family:'Courier New',monospace}.stuko-dark .calculator-section{background:rgba(20,22,25,.98);border-color:#30343a}.stuko-dark .settings select,.stuko-dark .big-input-grid input,.stuko-dark .big-input-grid select,.stuko-dark .table-row input,.stuko-dark .table-row select,.stuko-dark .small-button,.stuko-dark .mode-tabs button{background:#1b1e22;color:#eee;border-color:#363a40}.stuko-dark .mode-tabs button.active{background:#eee;color:#111}.stuko-dark .formula strong{color:#fff}.stuko-dark .scale-card{border-color:#363a40}.stuko-dark .lead,.stuko-dark .section-title p,.stuko-dark .section-copy{color:#aaa}@media(max-width:700px){.academic-page{padding:110px 12px 80px}.academic-head{flex-direction:column}.scale-card{align-self:flex-start}.table-head,.table-row{grid-template-columns:minmax(0,1fr) 70px 100px 28px}.calculator-section{padding:18px}.big-input-grid{grid-template-columns:1fr}.settings{flex-wrap:wrap}}
      `}</style>
    </SiteChrome>
  );
}

function ResultCard({ label, value, scale, credits, percentage }: { label: string; value: number; scale: string; credits: number; percentage: number }) {
  return <div className="result-card"><span>{label}</span><strong>{value.toFixed(2)} / {scale}</strong><div className="result-meta"><span>Total credits <b>{credits.toFixed(1)}</b></span><span>Scale equivalent <b>{percentage.toFixed(2)}%</b></span></div></div>;
}
