'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { addDoc, collection } from 'firebase/firestore';
import { firebaseConfigured, getFirebase } from '@/lib/firebase';
import SiteChrome from '@/app/components/SiteChrome';

const fonts = ['Times New Roman', 'Century Gothic', 'Lucida Calligraphy', 'Arial', 'Georgia'];
const sizes = ['12', '14', '16', '18', '20', '24', '28', '32', '40'];

type SavedNote = { id: string; title: string; body: string; public: boolean; updatedAt: string };

export default function NotesPage() {
  const editorRef = useRef<HTMLDivElement>(null);
  const [title, setTitle] = useState('');
  const [saved, setSaved] = useState(false);
  const [publicNote, setPublicNote] = useState(false);
  const [status, setStatus] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const editId = params.get('edit');

    if (editId) {
      try {
        const notes = JSON.parse(localStorage.getItem('stuko-saved-notes') || '[]');
        const note = Array.isArray(notes) ? notes.find((n: SavedNote) => String(n.id) === editId) : null;
        if (note) {
          setEditingId(String(note.id));
          setTitle(note.title || '');
          setPublicNote(Boolean(note.public));
          if (editorRef.current) editorRef.current.innerHTML = note.body || '';
          setStatus('editing saved note');
          return;
        }
      } catch {}
    }

    try {
      const raw = localStorage.getItem('stuko-notes-draft');
      if (!raw) return;
      const n = JSON.parse(raw);
      setTitle(n.title || '');
      setPublicNote(Boolean(n.public));
      if (editorRef.current) editorRef.current.innerHTML = n.body || '';
    } catch {}
  }, []);

  useEffect(() => {
    if (editingId) return;
    const saveDraft = () => {
      const body = editorRef.current?.innerHTML || '';
      if (title || body) localStorage.setItem('stuko-notes-draft', JSON.stringify({ title, body, public: publicNote }));
    };
    const timer = window.setTimeout(saveDraft, 250);
    return () => window.clearTimeout(timer);
  }, [title, publicNote, editingId]);

  const command = (cmd: string, value?: string) => { editorRef.current?.focus(); document.execCommand(cmd, false, value); };
  const insertLink = () => { const url = window.prompt('Enter the link URL'); if (url) command('createLink', url); };
  const insertTable = () => {
    const rows = Math.max(1, Number(window.prompt('Number of rows', '3')) || 3);
    const cols = Math.max(1, Number(window.prompt('Number of columns', '3')) || 3);
    let html = '<table><tbody>';
    for (let r = 0; r < rows; r++) { html += '<tr>'; for (let c = 0; c < cols; c++) html += '<td>&nbsp;</td>'; html += '</tr>'; }
    html += '</tbody></table><p><br></p>';
    command('insertHTML', html);
  };

  const resetEditor = () => {
    setTitle(''); setPublicNote(false); setEditingId(null);
    if (editorRef.current) editorRef.current.innerHTML = '';
    localStorage.removeItem('stuko-notes-draft');
  };

  const save = async () => {
    const body = editorRef.current?.innerHTML || '';
    const trimmedTitle = title.trim();
    if (!trimmedTitle) { setStatus('give your note a title first'); return; }
    if (!body.replace(/<[^>]*>/g, '').trim() && !body.includes('<img')) { setStatus('write something before saving'); return; }

    const updatedAt = new Date().toISOString();
    const raw = localStorage.getItem('stuko-saved-notes');
    let notes: SavedNote[] = [];
    try { const parsed = raw ? JSON.parse(raw) : []; notes = Array.isArray(parsed) ? parsed : []; } catch {}

    if (editingId) {
      const next = notes.map(note => note.id === editingId ? { ...note, title: trimmedTitle, body, public: publicNote, updatedAt } : note);
      localStorage.setItem('stuko-saved-notes', JSON.stringify(next));
      window.dispatchEvent(new Event('stuko-library-updated'));
      resetEditor();
      setSaved(true);
      setStatus('updated · new note ready');
      window.setTimeout(() => { setSaved(false); setStatus(''); }, 2200);
      return;
    }

    const note: SavedNote = { id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, title: trimmedTitle, body, public: publicNote, updatedAt };
    localStorage.setItem('stuko-saved-notes', JSON.stringify([note, ...notes]));
    localStorage.removeItem('stuko-notes-draft');

    if (publicNote && firebaseConfigured()) {
      try {
        const { auth, db } = getFirebase();
        if (auth.currentUser) await addDoc(collection(db, 'notes'), { title: trimmedTitle, body, authorId: auth.currentUser.uid, authorName: auth.currentUser.displayName || 'Stuko student', createdAt: new Date(), public: true });
      } catch { setStatus('saved locally · public sharing could not be synced'); }
    }

    window.dispatchEvent(new Event('stuko-library-updated'));
    resetEditor();
    setSaved(true);
    if (!status) setStatus('saved · new note ready');
    window.setTimeout(() => { setSaved(false); setStatus(''); }, 2200);
  };

  return <SiteChrome>
    <main className="notes-page">
      <section className="notes-card">
        <div className="notes-heading">
          <div><p className="kicker">your study desk</p><h1>{editingId ? 'edit note' : 'make notes'}</h1></div>
          <label className="privacy-toggle"><span>{publicNote ? 'public notes' : 'private notes'}</span><input type="checkbox" checked={publicNote} onChange={e => setPublicNote(e.target.checked)} /><i /></label>
        </div>

        <input className="title" value={title} onChange={e => setTitle(e.target.value)} placeholder="note title" />

        <div className="toolbar" aria-label="note formatting toolbar">
          <select aria-label="font" defaultValue="Arial" onChange={e => command('fontName', e.target.value)}>{fonts.map(f => <option key={f}>{f}</option>)}</select>
          <select aria-label="font size" defaultValue="16" onChange={e => command('fontSize', e.target.value === '16' ? '3' : e.target.value === '12' ? '2' : e.target.value === '14' ? '3' : e.target.value === '18' ? '4' : e.target.value === '20' ? '4' : e.target.value === '24' ? '5' : e.target.value === '28' ? '5' : e.target.value === '32' ? '6' : '7')}>{sizes.map(s => <option key={s}>{s}</option>)}</select>
          <button onClick={() => command('bold')} title="Bold"><b>B</b></button><button onClick={() => command('italic')} title="Italic"><i>I</i></button><button onClick={() => command('underline')} title="Underline"><u>U</u></button><button onClick={() => command('strikeThrough')} title="Cross out"><s>S</s></button><button onClick={() => command('subscript')} title="Subscript">X₂</button>
          <span className="divider" /><label title="Font color">A<input type="color" defaultValue="#111111" onChange={e => command('foreColor', e.target.value)} /></label><label title="Highlight">▰<input type="color" defaultValue="#fff59d" onChange={e => command('hiliteColor', e.target.value)} /></label>
          <button onClick={() => command('justifyLeft')} title="Align left">≡</button><button onClick={() => command('justifyCenter')} title="Center">≡</button><button onClick={() => command('insertUnorderedList')} title="Bullets">•≡</button><button onClick={() => command('insertOrderedList')} title="Numbered list">1≡</button>
          <button onClick={insertLink} title="Insert link">🔗</button><button onClick={insertTable} title="Insert table">▦</button><button onClick={() => command('removeFormat')} title="Clear formatting">Tx</button>
        </div>

        <div ref={editorRef} className="editor" contentEditable suppressContentEditableWarning data-placeholder="start writing your notes..." />
        <div className="notes-bottom"><span className="hint">copy/paste text, images, and links directly into your notes</span><button onClick={save}>{saved ? 'saved ✓' : editingId ? 'update note' : 'save note'}</button></div>
        {status && <p className="status">{status}</p>}
        <Link className="library-link" href="/library">→ open your notes in library</Link>
      </section>
    </main>
    <style jsx>{`
      .notes-page{min-height:calc(100svh - 150px);padding:130px 20px 100px;display:flex;justify-content:center;align-items:flex-start;color:var(--page-text)}.notes-card{width:min(1180px,100%);min-height:calc(100svh - 230px);box-sizing:border-box;padding:34px;background:#fff;color:#111;border:1px solid #ddd;border-radius:20px;box-shadow:0 12px 40px rgba(0,0,0,.12)}.notes-heading{display:flex;justify-content:space-between;align-items:flex-start;gap:20px}.kicker{font:11px monospace;letter-spacing:.15em;text-transform:uppercase;margin:0 0 5px}.notes-card h1{font-size:28px;font-weight:500;letter-spacing:-.04em;margin:0}.title{width:100%;box-sizing:border-box;border:0;border-bottom:1px solid #ddd;padding:17px 4px 13px;margin:18px 0 12px;font:22px Arial;color:#111;outline:none}.title::placeholder{color:#aaa}.privacy-toggle{display:flex;align-items:center;gap:9px;font:12px Arial;color:#555;white-space:nowrap}.privacy-toggle input{display:none}.privacy-toggle i{width:38px;height:21px;background:#ddd;border-radius:20px;position:relative;cursor:pointer}.privacy-toggle i:after{content:'';position:absolute;width:17px;height:17px;left:2px;top:2px;background:white;border-radius:50%;transition:.2s;box-shadow:0 1px 3px #999}.privacy-toggle input:checked+i{background:#111}.privacy-toggle input:checked+i:after{left:19px}.toolbar{display:flex;align-items:center;gap:4px;flex-wrap:wrap;border:1px solid #ddd;background:#f7f7f7;padding:6px;border-radius:10px 10px 0 0}.toolbar button,.toolbar select,.toolbar label{height:31px;min-width:31px;border:1px solid transparent;background:transparent;color:#222;border-radius:5px;padding:4px 7px;cursor:pointer;font:13px Arial}.toolbar button:hover,.toolbar select:hover,.toolbar label:hover{background:#e8e8e8}.toolbar select{min-width:auto;border-color:#ddd;background:white}.toolbar label{position:relative;display:inline-flex;align-items:center;justify-content:center;font-weight:bold}.toolbar label input{position:absolute;opacity:0;width:1px;height:1px}.divider{height:22px;width:1px;background:#ddd;margin:0 4px}.editor{min-height:520px;border:1px solid #ddd;border-top:0;padding:32px 42px;outline:none;font:16px Arial;line-height:1.7;color:#111;background:white}.editor:empty:before{content:attr(data-placeholder);color:#aaa;pointer-events:none}.editor :global(table){border-collapse:collapse;width:100%;margin:15px 0}.editor :global(td){border:1px solid #777;padding:9px;min-width:60px;height:28px}.editor :global(a){color:#2563eb;text-decoration:underline}.notes-bottom{display:flex;justify-content:space-between;align-items:center;gap:15px;margin-top:12px}.hint{font:12px Arial;color:#888}.notes-bottom button{border:0;border-radius:8px;padding:10px 20px;background:#111;color:#fff;cursor:pointer}.status{font:12px Arial;color:#666}.library-link{display:block;width:max-content;margin:34px auto 0;color:#111;font:14px Arial;text-decoration:none;border-bottom:1px solid #999;padding-bottom:3px}.library-link:hover{border-color:#111}@media(max-width:700px){.notes-page{padding:100px 8px 70px}.notes-card{padding:18px;border-radius:12px}.notes-heading{align-items:center}.notes-card h1{font-size:24px}.privacy-toggle span{display:none}.editor{padding:22px 18px;min-height:500px}.hint{display:none}.toolbar{gap:2px}.toolbar button,.toolbar select,.toolbar label{height:29px;min-width:28px;padding:3px 5px;font-size:12px}}
    `}</style>
  </SiteChrome>;
}
