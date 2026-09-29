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
        const pdf = await pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()) }).promise;
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
            <input
              type="file"
              accept=".pdf,.docx,.pptx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.openxmlformats-officedocument.presentationml.presentation,text/plain"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) void loadFile(file);
              }}
            />
            <span>{busy ? 'reading…' : 'choose a PDF, Word document, PowerPoint, or text file'}</span>
          </label>

          {selected && <p className="file-name">{selected.file.name}</p>}
          {status && <p className="reader-status">{status}</p>}

          <div className="reader-toolbar">
            <button type="button" onClick={() => format('bold')}>bold</button>
            <button type="button" onClick={() => format('underline')}>underline</button>
            <button type="button" onClick={() => format('hiliteColor', 'yellow')}>highlight</button>
            {!speaking ? (
              <button type="button" onClick={speak}>text to speech</button>
            ) : (
              <button type="button" onClick={stopSpeaking}>stop speaking</button>
            )}
          </div>

          <div
            ref={editor}
            className="reader-editor"
            contentEditable
            suppressContentEditableWarning
            onInput={(event) => setText(event.currentTarget.innerText)}
            dangerouslySetInnerHTML={{ __html: text.replace(/\n/g, '<br />') }}
          />

          {selected?.file.type === 'application/pdf' && (
            <iframe className="pdf-preview" title="PDF preview" src={selected.url} />
          )}
        </section>
      </main>
    </SiteChrome>
  );
}
