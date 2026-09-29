'use client';

import { useEffect, useRef, useState } from 'react';
import SiteChrome from '@/app/components/SiteChrome';

type ReaderFile = { file: File; url: string };

export default function DocumentReaderPage() {
  const [selected, setSelected] = useState<ReaderFile | null>(null);
  const [text, setText] = useState('');
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const editor = useRef<HTMLDivElement>(null);

  useEffect(() => () => {
    if (selected?.url) URL.revokeObjectURL(selected.url);
    window.speechSynthesis?.cancel();
  }, [selected?.url]);

  const loadFile = async (file: File) => {
    if (selected?.url) URL.revokeObjectURL(selected.url);
    const next = { file, url: URL.createObjectURL(file) };
    setSelected(next);
    setText('');
    setStatus('reading your file…');
    setBusy(true);

    try {
      const ext = file.name.split('.').pop()?.toLowerCase();
      if (ext === 'txt') {
        setText(await file.text());
      } else if (ext === 'docx') {
        const mammoth = await import('mammoth');
        const result = await mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() });
        setText(result.value);
      } else if (ext === 'pdf') {
        const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
        const pdf = await pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()), disableWorker: true }).promise;
        const pages: string[] = [];
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          pages.push(content.items.map((item: any) => 'str' in item ? item.str : '').join(' '));
        }
        setText(pages.join('\n\n'));
      } else if (ext === 'pptx') {
        const JSZip = (await import('jszip')).default;
        const zip = await JSZip.loadAsync(await file.arrayBuffer());
        const slideNames = Object.keys(zip.files)
          .filter(name => /^ppt\/slides\/slide\d+\.xml$/.test(name))
          .sort((a, b) => Number(a.match(/slide(\d+)/)?.[1]) - Number(b.match(/slide(\d+)/)?.[1]));
        const slides: string[] = [];
        for (const name of slideNames) {
          const xml = await zip.files[name].async('text');
          const doc = new DOMParser().parseFromString(xml, 'application/xml');
          slides.push(Array.from(doc.getElementsByTagName('a:t')).map(node => node.textContent || '').join(' '));
        }
        setText(slides.join('\n\n'));
      } else {
        throw new Error('unsupported');
      }
      setStatus('ready — edit, highlight, underline, or listen.');
    } catch {
      setStatus('could not extract readable text from this file. You can still use the PDF preview or paste text below.');
    } finally {
      setBusy(false);
    }
  };

  const format = (command: string, value?: string) => {
    editor.current?.focus();
    document.execCommand(command, false, value);
  };

  const speak = () => {
    const source = editor.current?.innerText || text;
    if (!source.trim() || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(source);
    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    window.speechSynthesis?.cancel();
    setSpeaking(false);
  };

  return (
    <SiteChrome>
      <main className="reader-page">
        <section className="reader-card">
          <p className="kicker">study reader</p>
          <h1>upload & annotate</h1>
          <p className="sub">PDFs, Word documents and PowerPoints — read them, listen to them, and mark them up.</p>

          <label className="drop">
            <input type="file" accept=".pdf,.docx,.pptx,.txt" onChange={e => e.target.files?.[0] && loadFile(e.target.files[0])} />
            <strong>{busy ? 'reading…' : 'choose a document'}</strong>
            <span>PDF · DOCX · PPTX · TXT</span>
          </label>

          {selected && <div className="file-name">{selected.file.name}</div>}
          {status && <p className="status">{status}</p>}

          <div className="toolbar" aria-label="annotation tools">
            <button onClick={() => format('bold')}>bold</button>
            <button onClick={() => format('underline')}>underline</button>
            <button onClick={() => format('hiliteColor', '#fff29a')}>highlight</button>
            <button onClick={speak}>{speaking ? 'speaking…' : 'text to speech'}</button>
            <button className="ghost" onClick={stopSpeaking}>stop</button>
          </div>

          <div
            ref={editor}
            className="editor"
            contentEditable
            suppressContentEditableWarning
            onInput={e => setText(e.currentTarget.innerText)}
            dangerouslySetInnerHTML={{ __html: text ? text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br/>') : '' }}
          />

          {selected?.file.name.toLowerCase().endsWith('.pdf') && (
            <iframe className="preview" src={selected.url} title="PDF preview" />
          )}

          <p className="hint">Annotations are kept in the editable study area while you work. PDF preview remains available underneath for visual reference.</p>
        </section>
      </main>
      <style jsx>{`
        .reader-page{min-height:calc(100svh - 150px);padding:150px 20px 100px;display:grid;place-items:center}
        .reader-card{width:min(1000px,100%);padding:42px;border:1px solid var(--glass-border);border-radius:30px;background:var(--glass-bg);backdrop-filter:blur(12px);color:var(--page-text)}
        .kicker{font:12px monospace;letter-spacing:.15em;text-transform:uppercase}.reader-card h1{font-size:clamp(48px,7vw,80px);font-weight:400;letter-spacing:-.07em;margin:10px 0}.sub{opacity:.65;line-height:1.6}
        .drop{margin-top:28px;border:1px dashed var(--glass-border);border-radius:22px;min-height:130px;display:grid;place-items:center;text-align:center;cursor:pointer;padding:20px}.drop input{display:none}.drop strong{font-size:18px}.drop span{font-size:12px;opacity:.5}
        .file-name,.status{margin-top:12px;opacity:.65;font-size:13px}.status{opacity:.75}
        .toolbar{display:flex;gap:8px;flex-wrap:wrap;margin:16px 0}.toolbar button{border:1px solid var(--glass-border);border-radius:999px;padding:9px 14px;background:transparent;color:inherit;cursor:pointer}.toolbar button:hover{background:rgba(255,255,255,.12)}.toolbar .ghost{opacity:.7}
        .editor{min-height:420px;border:1px solid var(--glass-border);border-radius:18px;padding:20px;line-height:1.75;outline:none;background:rgba(255,255,255,.03);white-space:pre-wrap}.editor:empty:before{content:'your extracted text appears here — select text and annotate it…';opacity:.35}
        .preview{width:100%;height:560px;border:1px solid var(--glass-border);border-radius:18px;margin-top:16px}.hint{font-size:13px;opacity:.55;margin-top:14px;line-height:1.6}
        @media(max-width:600px){.reader-page{padding:130px 12px 80px}.reader-card{padding:24px;border-radius:24px}.preview{height:430px}}
      `}</style>
    </SiteChrome>
  );
}
