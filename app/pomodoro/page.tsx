'use client';

import { useEffect, useMemo, useState } from 'react';
import SiteChrome from '@/app/components/SiteChrome';

const PRESETS = [
  { label: '25 / 5', work: 25 * 60, break: 5 * 60 },
  { label: '50 / 10', work: 50 * 60, break: 10 * 60 },
  { label: '100 / 20', work: 100 * 60, break: 20 * 60 },
];

type Todo = { id: number; text: string; done: boolean };

function formatTime(seconds: number) {
  const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
  const secs = (seconds % 60).toString().padStart(2, '0');
  return `${mins}:${secs}`;
}

export default function PomodoroPage() {
  const [preset, setPreset] = useState(PRESETS[0]);
  const [cycles, setCycles] = useState(1);
  const [cycleInput, setCycleInput] = useState('1');
  const [cycle, setCycle] = useState(1);
  const [mode, setMode] = useState<'work' | 'break'>('work');
  const [remaining, setRemaining] = useState(preset.work);
  const [running, setRunning] = useState(false);
  const [streak, setStreak] = useState(0);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [todoInput, setTodoInput] = useState('');

  useEffect(() => {
    const storedStreak = Number(window.localStorage.getItem('stuko-pomodoro-streak') || '0');
    const lastDate = window.localStorage.getItem('stuko-pomodoro-last-date');
    const today = new Date().toISOString().slice(0, 10);
    if (lastDate && lastDate !== today) {
      const previous = new Date(`${lastDate}T00:00:00`);
      const current = new Date(`${today}T00:00:00`);
      const days = Math.round((current.getTime() - previous.getTime()) / 86400000);
      setStreak(days > 1 ? 0 : storedStreak);
    } else {
      setStreak(storedStreak);
    }

    try {
      const storedTodos = JSON.parse(window.localStorage.getItem('stuko-pomodoro-todos') || '[]');
      if (Array.isArray(storedTodos)) setTodos(storedTodos);
    } catch {
      setTodos([]);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem('stuko-pomodoro-todos', JSON.stringify(todos));
  }, [todos]);

  useEffect(() => {
    if (!running) return;
    const interval = window.setInterval(() => setRemaining((value) => Math.max(value - 1, 0)), 1000);
    return () => window.clearInterval(interval);
  }, [running]);

  useEffect(() => {
    if (!running || remaining > 0) return;
    if (mode === 'work') {
      setMode('break');
      setRemaining(preset.break);
      return;
    }
    if (cycle < cycles) {
      setCycle((value) => value + 1);
      setMode('work');
      setRemaining(preset.work);
      return;
    }

    setRunning(false);
    setMode('work');
    setCycle(1);
    setRemaining(preset.work);

    const today = new Date().toISOString().slice(0, 10);
    const lastDate = window.localStorage.getItem('stuko-pomodoro-last-date');
    const previousStreak = Number(window.localStorage.getItem('stuko-pomodoro-streak') || '0');
    const nextStreak = lastDate === today ? previousStreak : previousStreak + 1;
    window.localStorage.setItem('stuko-pomodoro-streak', String(nextStreak));
    window.localStorage.setItem('stuko-pomodoro-last-date', today);
    setStreak(nextStreak);
  }, [remaining, running, mode, cycle, cycles, preset]);

  const total = mode === 'work' ? preset.work : preset.break;
  const progress = total > 0 ? 1 - remaining / total : 0;
  const circumference = 2 * Math.PI * 116;
  const dashOffset = circumference * (1 - progress);
  const completedTodos = useMemo(() => todos.filter((todo) => todo.done).length, [todos]);

  function choosePreset(next: (typeof PRESETS)[number]) {
    setPreset(next);
    setRunning(false);
    setMode('work');
    setCycle(1);
    setRemaining(next.work);
  }

  function reset() {
    setRunning(false);
    setMode('work');
    setCycle(1);
    setRemaining(preset.work);
  }

  function applyCycles() {
    const value = Math.max(1, Math.floor(Number(cycleInput) || 1));
    setCycles(value);
    setCycleInput(String(value));
    reset();
  }

  function addTodo(event: React.FormEvent) {
    event.preventDefault();
    const text = todoInput.trim();
    if (!text) return;
    setTodos((items) => [...items, { id: Date.now(), text, done: false }]);
    setTodoInput('');
  }

  function clearAllTodos() {
    if (todos.length === 0) return;
    const confirmed = window.confirm('Clear all tasks from your to-do list?');
    if (confirmed) setTodos([]);
  }

  return (
    <SiteChrome>
      <section className="pomodoro-page">
        <div className="pomodoro-heading">
          <p className="pomodoro-kicker">focus mode</p>
          <h1>pomodoro timer</h1>
          <p className="pomodoro-subtitle">study in focused little bursts. get the work done.</p>
        </div>

        <div className="pomodoro-grid">
          <section className="timer-card">
            <div className="timer-topline">
              <span>focus period ({cycle} of {cycles})</span>
              <span className="streak">🔥 {streak} day streak</span>
            </div>

            <div className="timer-ring-wrap">
              <svg className="timer-ring" viewBox="0 0 260 260" aria-hidden="true">
                <circle className="timer-ring-track" cx="130" cy="130" r="116" />
                <circle className="timer-ring-progress" cx="130" cy="130" r="116" strokeDasharray={circumference} strokeDashoffset={dashOffset} />
              </svg>
              <div className="timer-center">
                <span className="timer-mode">{mode === 'work' ? 'work time' : 'break time'}</span>
                <strong>{formatTime(remaining)}</strong>
                <span className="timer-next">{mode === 'work' ? 'up next: break' : 'up next: work'}</span>
              </div>
            </div>

            <div className="timer-controls">
              <button type="button" className="primary-action" onClick={() => setRunning((value) => !value)}>{running ? 'pause' : 'start'}</button>
              <button type="button" className="secondary-action" onClick={reset}>reset</button>
            </div>

            <div className="preset-row" aria-label="timer presets">
              {PRESETS.map((item) => (
                <button key={item.label} type="button" className={preset.label === item.label ? 'preset active' : 'preset'} onClick={() => choosePreset(item)}>{item.label}</button>
              ))}
            </div>

            <div className="cycles-control">
              <label htmlFor="cycles">cycles</label>
              <input id="cycles" type="number" min="1" value={cycleInput} onChange={(event) => setCycleInput(event.target.value)} onKeyDown={(event) => event.key === 'Enter' && applyCycles()} />
              <button type="button" className="secondary-action small" onClick={applyCycles}>apply</button>
            </div>
          </section>

          <section className="todo-card">
            <div className="todo-heading">
              <div>
                <p className="todo-kicker">while you focus</p>
                <h2>to-do list</h2>
              </div>
              <div className="todo-heading-actions">
                <span>{completedTodos}/{todos.length}</span>
                <button type="button" className="todo-clear" onClick={clearAllTodos} disabled={todos.length === 0}>clear all</button>
              </div>
            </div>

            <form className="todo-form" onSubmit={addTodo}>
              <input value={todoInput} onChange={(event) => setTodoInput(event.target.value)} placeholder="what needs doing?" aria-label="New task" />
              <button type="submit">add</button>
            </form>

            <div className="todo-list">
              {todos.length === 0 ? (
                <div className="todo-empty">nothing here yet.<br />add a task and let&apos;s get to work.</div>
              ) : (
                todos.map((todo) => (
                  <div className={`todo-item${todo.done ? ' done' : ''}`} key={todo.id}>
                    <button type="button" className="todo-check" aria-label={todo.done ? 'Mark task incomplete' : 'Mark task complete'} onClick={() => setTodos((items) => items.map((item) => item.id === todo.id ? { ...item, done: !item.done } : item))}>{todo.done ? '✓' : ''}</button>
                    <span>{todo.text}</span>
                    <button type="button" className="todo-delete" aria-label="Delete task" onClick={() => setTodos((items) => items.filter((item) => item.id !== todo.id))}>×</button>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      </section>

      <style jsx global>{`
        .pomodoro-page { width: min(1120px, 100%); margin: 0 auto; padding: 44px 0 100px; }
        .pomodoro-heading { text-align: center; margin-bottom: 36px; }
        .pomodoro-kicker, .todo-kicker { margin: 0 0 10px; font-family: 'Courier New', monospace; font-size: 12px; letter-spacing: .16em; opacity: .68; }
        .pomodoro-heading h1 { margin: 0; font-size: clamp(44px, 7vw, 72px); font-weight: 400; letter-spacing: -.065em; line-height: .98; }
        .pomodoro-subtitle { margin: 16px 0 0; font-size: 17px; opacity: .7; }
        .pomodoro-grid { display: grid; grid-template-columns: minmax(0, 1.25fr) minmax(320px, .75fr); gap: 22px; align-items: stretch; }
        .timer-card, .todo-card { background: var(--glass-soft); border: 1px solid var(--line); border-radius: 28px; backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); box-sizing: border-box; }
        .timer-card { padding: 26px; min-height: 600px; display: flex; flex-direction: column; align-items: center; }
        .timer-topline { width: 100%; display: flex; justify-content: space-between; gap: 15px; font-family: 'Courier New', monospace; font-size: 12px; letter-spacing: .08em; opacity: .72; }
        .streak { white-space: nowrap; }
        .timer-ring-wrap { position: relative; width: min(360px, 72vw); aspect-ratio: 1; margin: 24px auto 12px; }
        .timer-ring { width: 100%; height: 100%; transform: rotate(-90deg); overflow: visible; }
        .timer-ring-track, .timer-ring-progress { fill: none; stroke-width: 5; }
        .timer-ring-track { stroke: rgba(127,127,127,.20); }
        .timer-ring-progress { stroke: currentColor; stroke-linecap: round; transition: stroke-dashoffset .3s linear; }
        .timer-center { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; }
        .timer-mode { font-family: 'Courier New', monospace; font-size: 12px; letter-spacing: .12em; opacity: .62; }
        .timer-center strong { margin: 10px 0 7px; font-size: clamp(48px, 8vw, 72px); font-weight: 400; letter-spacing: -.06em; font-variant-numeric: tabular-nums; }
        .timer-next { font-size: 14px; opacity: .6; }
        .timer-controls { display: flex; gap: 10px; margin: 8px 0 18px; }
        .primary-action, .secondary-action, .preset, .todo-form button { border: 1px solid var(--line); cursor: pointer; font: inherit; border-radius: 999px; transition: transform 160ms ease, background 160ms ease, border-color 160ms ease; }
        .primary-action { min-width: 110px; padding: 12px 25px; background: var(--page-text); color: var(--page-bg); border-color: var(--page-text); }
        .secondary-action { padding: 12px 22px; background: transparent; color: var(--page-text); }
        .primary-action:hover, .secondary-action:hover, .preset:hover, .todo-form button:hover { transform: translateY(-1px); }
        .preset-row { display: flex; flex-wrap: wrap; justify-content: center; gap: 8px; }
        .preset { padding: 9px 16px; background: transparent; color: var(--page-text); }
        .preset.active { background: var(--page-text); color: var(--page-bg); border-color: var(--page-text); }
        .cycles-control { display: flex; align-items: center; gap: 9px; margin-top: 18px; font-size: 14px; opacity: .8; }
        .cycles-control input { width: 54px; box-sizing: border-box; padding: 8px; border: 1px solid var(--line); border-radius: 10px; background: transparent; color: var(--page-text); font: inherit; text-align: center; }
        .secondary-action.small { padding: 8px 13px; font-size: 13px; }
        .todo-card { padding: 26px; display: flex; flex-direction: column; }
        .todo-heading { display: flex; align-items: flex-start; justify-content: space-between; gap: 15px; }
        .todo-heading h2 { margin: 0; font-size: 36px; font-weight: 400; letter-spacing: -.055em; }
        .todo-heading > span { padding: 7px 11px; border: 1px solid var(--line); border-radius: 999px; font-family: 'Courier New', monospace; font-size: 12px; opacity: .72; }
        .todo-heading-actions { display: flex; align-items: center; gap: 8px; }
        .todo-clear { border: 1px solid var(--line); border-radius: 999px; background: transparent; color: var(--page-text); padding: 7px 11px; font: inherit; font-size: 12px; cursor: pointer; opacity: .72; transition: transform 160ms ease, opacity 160ms ease, background 160ms ease; }
        .todo-clear:hover:not(:disabled) { transform: translateY(-1px); opacity: 1; background: rgba(127,127,127,.10); }
        .todo-clear:disabled { cursor: not-allowed; opacity: .30; }
        .todo-form { display: flex; gap: 8px; margin: 26px 0 17px; }
        .todo-form input { min-width: 0; flex: 1; border: 1px solid var(--line); border-radius: 14px; padding: 13px 14px; background: rgba(255,255,255,.10); color: var(--page-text); font: inherit; outline: none; }
        .todo-form input::placeholder { color: var(--page-text); opacity: .45; }
        .todo-form button { padding: 0 17px; background: var(--page-text); color: var(--page-bg); border-color: var(--page-text); }
        .todo-list { display: flex; flex-direction: column; gap: 8px; overflow: auto; max-height: 420px; }
        .todo-item { display: flex; align-items: center; gap: 11px; padding: 13px 12px; border: 1px solid var(--line); border-radius: 15px; background: rgba(255,255,255,.07); }
        .todo-item span { flex: 1; font-size: 15px; line-height: 1.3; }
        .todo-item.done span { text-decoration: line-through; opacity: .45; }
        .todo-check, .todo-delete { flex: 0 0 auto; border: 0; cursor: pointer; font: inherit; color: var(--page-text); background: transparent; }
        .todo-check { width: 21px; height: 21px; border: 1px solid currentColor; border-radius: 50%; font-size: 13px; display: grid; place-items: center; opacity: .75; }
        .todo-delete { width: 24px; height: 24px; opacity: .42; font-size: 20px; line-height: 1; }
        .todo-delete:hover { opacity: 1; }
        .todo-empty { padding: 40px 10px; text-align: center; line-height: 1.7; opacity: .52; font-size: 14px; }
        .stuko-dark .timer-ring-progress { color: #f5f5f5; }
        @media (max-width: 780px) { .pomodoro-page { padding-top: 24px; } .pomodoro-grid { grid-template-columns: 1fr; } .timer-card { min-height: auto; } .todo-heading-actions { flex-wrap: wrap; justify-content: flex-end; } }
      `}</style>
    </SiteChrome>
  );
}
