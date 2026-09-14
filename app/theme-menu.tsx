'use client';

import { useEffect, useState } from 'react';
import { useTheme, ThemeName } from './theme-provider';

const themes: { id: ThemeName; name: string; description: string }[] = [
  { id: 'light', name: 'Basic light', description: 'White background · black text' },
  { id: 'dark', name: 'Basic dark', description: 'Black background · white text' },
  { id: 'system', name: 'Default', description: 'Use your system setting' },
  { id: 'pink', name: 'Baby pink light', description: 'Soft pastel pink · whimsical' },
  { id: 'purple', name: 'Purple dark', description: 'Deep purple · light text' },
];

export default function ThemeMenu() {
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      const settings = target?.closest('[aria-label="Settings"]');
      if (settings) {
        event.preventDefault();
        event.stopPropagation();
        setOpen(true);
      }
    };
    document.addEventListener('click', onClick, true);
    return () => document.removeEventListener('click', onClick, true);
  }, []);

  if (!open) return null;

  return (
    <div style={styles.backdrop} onMouseDown={() => setOpen(false)}>
      <section style={styles.panel} onMouseDown={e => e.stopPropagation()}>
        <div style={styles.head}>
          <div>
            <div style={styles.kicker}>STUKO</div>
            <h2 style={styles.title}>Themes</h2>
            <p style={styles.sub}>Make your study universe feel like yours.</p>
          </div>
          <button style={styles.close} onClick={() => setOpen(false)} aria-label="Close themes">×</button>
        </div>
        <div style={styles.list}>
          {themes.map(item => (
            <button key={item.id} onClick={() => { setTheme(item.id); setOpen(false); }} style={{ ...styles.item, ...(theme === item.id ? styles.selected : {}) }}>
              <span style={{ ...styles.swatch, ...swatches[item.id] }} />
              <span style={styles.copy}><b>{item.name}</b><small>{item.description}</small></span>
              {theme === item.id && <span style={styles.check}>✓</span>}
            </button>
          ))}
        </div>
        <div style={styles.more}>EXPLORE MORE THEMES <span>✦</span></div>
      </section>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  backdrop: { position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,.58)', display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-end', padding: '78px 34px 34px', fontFamily: 'inherit' },
  panel: { width: 360, maxWidth: 'calc(100vw - 28px)', background: 'var(--theme-panel, #202326)', color: 'var(--theme-text, #f3f4f6)', border: '1px solid rgba(255,255,255,.09)', borderRadius: 12, boxShadow: '0 24px 70px rgba(0,0,0,.45)', padding: 20 },
  head: { display: 'flex', justifyContent: 'space-between', gap: 12, marginBottom: 16 },
  kicker: { fontSize: 10, letterSpacing: '2px', opacity: .55, marginBottom: 5 },
  title: { margin: 0, fontSize: 24, letterSpacing: '-.4px' },
  sub: { margin: '5px 0 0', fontSize: 12, opacity: .55 },
  close: { border: 0, background: 'transparent', color: 'inherit', fontSize: 27, lineHeight: 1, cursor: 'pointer', opacity: .65 },
  list: { display: 'grid', gap: 7 },
  item: { width: '100%', display: 'flex', alignItems: 'center', gap: 12, textAlign: 'left', padding: '12px 11px', borderRadius: 9, border: '1px solid transparent', background: 'transparent', color: 'inherit', cursor: 'pointer' },
  selected: { background: 'rgba(149,104,255,.12)', borderColor: 'rgba(149,104,255,.45)' },
  swatch: { width: 28, height: 28, borderRadius: 7, flex: '0 0 auto', border: '1px solid rgba(255,255,255,.14)' },
  copy: { display: 'grid', gap: 3, flex: 1 },
  check: { color: '#a875ff', fontWeight: 800, fontSize: 17 },
  more: { marginTop: 17, paddingTop: 14, borderTop: '1px solid rgba(255,255,255,.08)', fontSize: 10, letterSpacing: '1.4px', opacity: .65 },
};

const swatches: Record<ThemeName, React.CSSProperties> = {
  light: { background: '#fff' },
  dark: { background: '#090a0b' },
  system: { background: 'linear-gradient(135deg,#fff 50%,#111 50%)' },
  pink: { background: '#f8d9e5' },
  purple: { background: '#241535' },
};
