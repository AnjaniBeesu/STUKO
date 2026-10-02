'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import SiteChrome from '@/app/components/SiteChrome';

type Note = { id: string; title: string; body: string; public?: boolean; updatedAt?: string };

export default function ViewNotePage({ params }: { params: Promise<{ id: string }> }) {
  const [note, setNote] = useState<Note | null>(null);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    params.then(({ id }) => {
      try {
        const notes = JSON.parse(localStorage.getItem('stuko-saved-notes') || '[]');
        const found = Array.isArray(notes) ? notes.find((n: Note) => String(n.id) === id) : null;
        if (found) setNote(found);
        else setMissing(true);
      } catch {
        setMissing(true);
      }
    });
  }, [params]);

  return <SiteChrome>
    <main className="view-page">
      <section className="view-card">
        <Link className="back" href="/library">← back to library</Link>
        {note ? <>
          <p className="kicker">saved note{note.public ? ' · public' : ' · private'}</p>
          <h1>{note.title}</h1>
          <p className="date">{note.updatedAt ? new Date(note.updatedAt).toLocaleString() : ''}</p>
          <article className="note-body" dangerouslySetInnerHTML={{ __html: note.body }} />
        </> : missing ? <div className="empty"><h1>note not found</h1><p>This note is no longer stored on this browser.</p></div> : <p>opening note…</p>}
      </section>
    </main>
    <style jsx>{`
      .view-page{min-height:calc(100svh - 150px);padding:125px 20px 100px;color:var(--page-text)}
      .view-card{width:min(1000px,100%);margin:auto;padding:38px;background:var(--glass);border:1px solid var(--line);backdrop-filter:blur(12px);border-radius:22px}
      .back{display:inline-block;color:inherit;text-decoration:none;font:13px Arial;margin-bottom:34px;opacity:.7}.back:hover{opacity:1}
      .kicker{font:11px monospace;letter-spacing:.15em;text-transform:uppercase;opacity:.55}.view-card h1{font:clamp(34px,6vw,58px) Georgia,serif;font-weight:400;letter-spacing:-.04em;margin:8px 0}.date{font:11px Arial;opacity:.45;margin-bottom:30px}
      .note-body{background:#fff;color:#111;border-radius:14px;padding:35px;min-height:400px;line-height:1.75;font:16px Arial;overflow-wrap:anywhere}.note-body :global(table){border-collapse:collapse;width:100%;margin:16px 0}.note-body :global(td){border:1px solid #888;padding:8px}.note-body :global(img){max-width:100%;height:auto}.note-body :global(a){color:#2563eb;text-decoration:underline}.empty{padding:70px 10px;text-align:center}.empty h1{font-size:34px}
      @media(max-width:650px){.view-page{padding:100px 8px 70px}.view-card{padding:20px}.note-body{padding:20px}}
    `}</style>
  </SiteChrome>;
}
