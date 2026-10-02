'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import SiteChrome from '@/app/components/SiteChrome';

type Holiday = { date: string; name: string; nationalHoliday?: boolean; subdivisionCodes?: string[] | null; holidayTypes?: string[] };

const STATES: Record<string, string> = {
  'Andhra Pradesh': 'IN-AP',
  Telangana: 'IN-TG',
  Karnataka: 'IN-KA',
  Tamil Nadu: 'IN-TN',
  Kerala: 'IN-KL',
  Maharashtra: 'IN-MH',
  Gujarat: 'IN-GJ',
  'West Bengal': 'IN-WB',
  Delhi: 'IN-DL',
  'Uttar Pradesh': 'IN-UP',
  Rajasthan: 'IN-RJ',
  Punjab: 'IN-PB',
  Haryana: 'IN-HR',
  Odisha: 'IN-OD',
  Bihar: 'IN-BR',
  'Madhya Pradesh': 'IN-MP',
};

const COUNTRIES = [
  ['IN', 'India'], ['US', 'United States'], ['GB', 'United Kingdom'], ['DE', 'Germany'],
  ['AU', 'Australia'], ['CA', 'Canada'], ['SG', 'Singapore'], ['AE', 'United Arab Emirates'],
];

const WEEKDAYS = [
  ['Mon', 1], ['Tue', 2], ['Wed', 3], ['Thu', 4], ['Fri', 5], ['Sat', 6], ['Sun', 0],
] as const;

function dateOnly(value: Date) {
  return new Date(value.getFullYear(), value.getMonth(), value.getDate());
}

function isoDate(value: Date) {
  const d = dateOnly(value);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function countWorkingDays(start: Date, end: Date, workingDays: number[], holidays: Set<string>) {
  let count = 0;
  const cursor = dateOnly(start);
  const finish = dateOnly(end);
  while (cursor <= finish) {
    if (workingDays.includes(cursor.getDay()) && !holidays.has(isoDate(cursor))) count++;
    cursor.setDate(cursor.getDate() + 1);
  }
  return count;
}

export default function AttendancePage() {
  const today = dateOnly(new Date());
  const [target, setTarget] = useState('75');
  const [country, setCountry] = useState('IN');
  const [state, setState] = useState('Andhra Pradesh');
  const [start, setStart] = useState(`${today.getFullYear()}-06-01`);
  const [end, setEnd] = useState(`${today.getFullYear() + 1}-04-30`);
  const [attended, setAttended] = useState('');
  const [workingDays, setWorkingDays] = useState<number[]>([1, 2, 3, 4, 5]);
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [holidayLoading, setHolidayLoading] = useState(false);
  const [holidayError, setHolidayError] = useState('');

  const years = useMemo(() => {
    const a = new Date(start).getFullYear();
    const b = new Date(end).getFullYear();
    return Array.from({ length: Math.max(1, b - a + 1) }, (_, i) => a + i);
  }, [start, end]);

  useEffect(() => {
    let cancelled = false;
    async function loadHolidays() {
      setHolidayLoading(true);
      setHolidayError('');
      try {
        const responses = await Promise.all(years.map((year) => fetch(`https://date.nager.at/api/v4/Holidays/${country}/${year}`)));
        const data = (await Promise.all(responses.map((r) => r.ok ? r.json() : []))).flat() as Holiday[];
        if (!cancelled) setHolidays(data);
      } catch {
        if (!cancelled) setHolidayError('Could not load public holidays. Working days are still calculated without them.');
      } finally {
        if (!cancelled) setHolidayLoading(false);
      }
    }
    loadHolidays();
    return () => { cancelled = true; };
  }, [country, years.join(',')]);

  const holidaySet = useMemo(() => {
    const subdivision = country === 'IN' ? STATES[state] : undefined;
    return new Set(
      holidays
        .filter((h) => h.holidayTypes?.includes('Public') || h.nationalHoliday)
        .filter((h) => !subdivision || !h.subdivisionCodes?.length || h.subdivisionCodes.includes(subdivision))
        .map((h) => h.date)
    );
  }, [holidays, country, state]);

  const metrics = useMemo(() => {
    const semesterStart = new Date(`${start}T00:00:00`);
    const semesterEnd = new Date(`${end}T00:00:00`);
    if (Number.isNaN(semesterStart.getTime()) || Number.isNaN(semesterEnd.getTime()) || semesterEnd < semesterStart || workingDays.length === 0) {
      return null;
    }
    const total = countWorkingDays(semesterStart, semesterEnd, workingDays, holidaySet);
    const through = new Date(Math.min(today.getTime(), semesterEnd.getTime()));
    const completed = through >= semesterStart ? countWorkingDays(semesterStart, through, workingDays, holidaySet) : 0;
    const attendedNum = Math.max(0, Math.min(completed, Number(attended) || 0));
    const current = completed ? (attendedNum / completed) * 100 : 0;
    const goal = Math.max(1, Math.min(100, Number(target) || 75));
    let required = 0;
    if (current < goal && goal < 100) {
      required = Math.ceil((goal * completed - attendedNum * 100) / (100 - goal));
      required = Math.max(0, required);
    }
    const remaining = Math.max(0, total - completed);
    const possible = Math.min(required, remaining);
    const projected = total ? ((attendedNum + remaining) / total) * 100 : 0;
    return { total, completed, remaining, attended: attendedNum, current, goal, required, possible, projected };
  }, [start, end, workingDays, holidaySet, attended, target, today.getTime()]);

  const relevantHolidays = holidays
    .filter((h) => h.date >= start && h.date <= end)
    .filter((h) => h.holidayTypes?.includes('Public') || h.nationalHoliday)
    .filter((h) => country !== 'IN' || !h.subdivisionCodes?.length || h.subdivisionCodes.includes(STATES[state]));

  function toggleDay(day: number) {
    setWorkingDays((current) => current.includes(day) ? current.filter((d) => d !== day) : [...current, day]);
  }

  return (
    <SiteChrome>
      <main className="attendance-page">
        <Link href="/" className="back-link">← back</Link>
        <section className="attendance-card">
          <div className="attendance-head">
            <div>
              <p className="tool-kicker">STUKO / attendance</p>
              <h1>attendance calculator + tracker</h1>
              <p className="intro">Tell us your target and semester calendar. STUKO counts weekends and public holidays so you know how many college days you actually need.</p>
            </div>
            <div className="target-badge">TARGET <strong>{Math.round(metrics?.goal ?? Number(target) || 75)}%</strong></div>
          </div>

          <div className="form-grid">
            <label className="field wide-field">
              <span>How much attendance do you need?</span>
              <div className="number-wrap"><input type="number" min="1" max="100" value={target} onChange={(e) => setTarget(e.target.value)} /><b>%</b></div>
            </label>

            <label className="field">
              <span>Semester / term starts</span>
              <input type="date" value={start} onChange={(e) => setStart(e.target.value)} />
            </label>
            <label className="field">
              <span>Semester / term ends</span>
              <input type="date" value={end} onChange={(e) => setEnd(e.target.value)} />
            </label>

            <label className="field">
              <span>Country</span>
              <select value={country} onChange={(e) => setCountry(e.target.value)}>{COUNTRIES.map(([code, name]) => <option key={code} value={code}>{name}</option>)}</select>
            </label>
            {country === 'IN' ? (
              <label className="field">
                <span>State</span>
                <select value={state} onChange={(e) => setState(e.target.value)}>{Object.keys(STATES).map((name) => <option key={name}>{name}</option>)}</select>
              </label>
            ) : <div />}

            <div className="field wide-field">
              <span>Which days does your university work?</span>
              <div className="weekday-row">{WEEKDAYS.map(([label, value]) => <button type="button" key={label} className={workingDays.includes(value) ? 'day selected' : 'day'} onClick={() => toggleDay(value)}>{label}</button>)}</div>
            </div>

            <label className="field wide-field">
              <span>How many working days have you attended so far?</span>
              <input type="number" min="0" max={metrics?.completed ?? undefined} placeholder={metrics ? `0–${metrics.completed}` : 'Enter attended days'} value={attended} onChange={(e) => setAttended(e.target.value)} />
              <small>STUKO calculates the number of working days completed from your semester dates, weekends and public holidays.</small>
            </label>
          </div>

          <section className="result">
            <div className="result-label">YOUR ATTENDANCE</div>
            <div className="result-main">
              <strong>{metrics ? `${metrics.current.toFixed(1)}%` : '—'}</strong>
              <span>{metrics ? `${metrics.attended} / ${metrics.completed} working days attended` : 'Enter your attended days to calculate'}</span>
            </div>
            {metrics && (
              <div className="result-grid">
                <div><b>{metrics.total}</b><span>working days in term</span></div>
                <div><b>{metrics.remaining}</b><span>working days remaining</span></div>
                <div><b>{metrics.required}</b><span>days you need to attend</span></div>
              </div>
            )}
            {metrics && (metrics.current >= metrics.goal ? (
              <div className="success">✓ You are already above your {metrics.goal}% target. You can afford some absence, depending on your university rules.</div>
            ) : metrics.required <= metrics.remaining ? (
              <div className="answer">You need to go to college for <strong>{metrics.required} more working days</strong> to reach {metrics.goal}%.</div>
            ) : (
              <div className="danger">⚠ You cannot reach {metrics.goal}% by the end of this term by attending every remaining working day. You need {metrics.required} days, but only {metrics.remaining} remain.</div>
            ))}
          </section>

          <section className="holiday-section">
            <div><h2>Holiday-aware calendar</h2><p>{holidayLoading ? 'Loading public holidays…' : `${relevantHolidays.length} public holiday${relevantHolidays.length === 1 ? '' : 's'} found for your term.`}</p></div>
            <div className="holiday-list">{relevantHolidays.slice(0, 8).map((h) => <span key={`${h.date}-${h.name}`}>{new Date(`${h.date}T00:00:00`).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} · {h.name}</span>)}</div>
            {holidayError && <small className="holiday-error">{holidayError}</small>}
          </section>

          <p className="disclaimer">Holiday data is fetched from Nager.Date and should be treated as an estimate. Universities can have their own working-day calendars, declared holidays and make-up classes, so check your official academic calendar before relying on the result.</p>
        </section>
      </main>
      <style jsx global>{`html,body{background:#f7f7f5}.attendance-page{min-height:100svh;padding:120px 24px 100px;color:var(--page-text,#151515)}.attendance-card{width:min(1050px,100%);margin:35px auto 0;background:rgba(255,255,255,.98);border:1px solid #e2e2de;border-radius:24px;padding:clamp(25px,5vw,55px);box-shadow:0 18px 70px #0000000b}.attendance-head{display:flex;justify-content:space-between;gap:30px;align-items:flex-start}.tool-kicker{font:11px 'Courier New',monospace;letter-spacing:.15em;color:#888;margin:0 0 12px}.attendance-head h1{font-size:clamp(34px,5vw,64px);line-height:.98;letter-spacing:-.055em;font-weight:850;margin:0;max-width:720px}.intro{font-size:14px;line-height:1.65;color:#777;max-width:700px;margin:16px 0 0}.target-badge{min-width:105px;text-align:center;border:1px solid #ddd;border-radius:14px;padding:12px 10px;font-size:8px;letter-spacing:.12em;color:#888}.target-badge strong{display:block;color:#111;font-size:22px;letter-spacing:-.04em;margin-top:4px}.form-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:38px}.field{display:flex;flex-direction:column;gap:7px;font-size:11px;font-weight:800}.field>span{color:#333}.field input,.field select{width:100%;height:43px;border:1px solid #dcdcd7;border-radius:10px;background:#fafaf8;padding:0 12px;color:#161616;outline:none}.field input:focus,.field select:focus{border-color:#777;box-shadow:0 0 0 3px #0000000a}.field small{font-size:9px;color:#999;font-weight:400;line-height:1.45}.wide-field{grid-column:1/-1}.number-wrap{position:relative}.number-wrap input{padding-right:35px}.number-wrap b{position:absolute;right:13px;top:13px;color:#999;font-size:12px}.weekday-row{display:flex;gap:7px;flex-wrap:wrap}.day{border:1px solid #ddd;background:#fafaf8;color:#888;border-radius:9px;height:38px;min-width:54px;font-size:10px;font-weight:800;cursor:pointer}.day.selected{background:#151515;color:#fff;border-color:#151515}.result{margin-top:32px;background:#151515;color:#fff;border-radius:18px;padding:25px}.result-label{font-size:8px;letter-spacing:.16em;color:#999}.result-main{display:flex;align-items:baseline;gap:14px;margin-top:10px;flex-wrap:wrap}.result-main strong{font-size:52px;letter-spacing:-.06em}.result-main span{font-size:11px;color:#aaa}.result-grid{display:grid;grid-template-columns:repeat(3,1fr);border-top:1px solid #ffffff20;margin-top:22px;padding-top:20px;gap:15px}.result-grid div{display:flex;flex-direction:column}.result-grid b{font-size:25px}.result-grid span{font-size:9px;color:#999;margin-top:3px}.answer,.success,.danger{margin-top:22px;border-radius:10px;padding:13px 15px;font-size:12px;line-height:1.5}.answer{background:#fff;color:#111}.success{background:#e9f7ec;color:#164d25}.danger{background:#fff0f0;color:#721b1b}.holiday-section{margin-top:24px;border:1px solid #e3e3df;border-radius:15px;padding:20px;display:grid;grid-template-columns:220px 1fr;gap:20px}.holiday-section h2{font-size:13px;margin:0}.holiday-section p{font-size:10px;color:#999;margin:5px 0}.holiday-list{display:flex;flex-wrap:wrap;gap:7px;align-content:flex-start}.holiday-list span{font-size:9px;background:#f3f3f0;border:1px solid #e5e5e1;border-radius:20px;padding:7px 9px;color:#555}.holiday-error{grid-column:1/-1;color:#9a3333}.disclaimer{font-size:9px;line-height:1.55;color:#999;max-width:850px;margin:18px auto 0;text-align:center}@media(max-width:700px){.attendance-page{padding:95px 14px 70px}.attendance-head{flex-direction:column}.target-badge{align-self:flex-start}.form-grid{grid-template-columns:1fr}.wide-field{grid-column:auto}.result-grid{grid-template-columns:1fr}.holiday-section{grid-template-columns:1fr}.attendance-head h1{font-size:38px}}html[data-theme="dark"] body{background:#101113}html[data-theme="dark"] .attendance-card{background:rgba(22,24,27,.98);border-color:#30343a;color:#eee}html[data-theme="dark"] .field>span{color:#eee}html[data-theme="dark"] .field input,html[data-theme="dark"] .field select,html[data-theme="dark"] .day{background:#1c1f23;border-color:#34383e;color:#eee}html[data-theme="dark"] .day.selected{background:#eee;color:#111;border-color:#eee}html[data-theme="dark"] .target-badge{border-color:#3a3e44}html[data-theme="dark"] .target-badge strong{color:#fff}html[data-theme="dark"] .holiday-section{border-color:#30343a}html[data-theme="dark"] .holiday-list span{background:#202327;border-color:#34383e;color:#ddd}`}</style>
    </SiteChrome>
  );
}
