'use client';

import { useEffect, useRef, useState } from 'react';
import SiteChrome from '@/app/components/SiteChrome';

type ReaderFile = { file: File; url: string };
type Tool = 'select' | 'highlight' | 'underline' | 'bold' | 'annotate' | 'speech';

export default function DocumentReaderPage() {
  const [selected, setSelected] = useState<ReaderFile | null>(null);
  const [text, setText] = useState('');
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [tool, setTool] = useState<Tool>('select');
  const [annotation, setAnnotation] = useState('');
  const editor = useRef<HTMLDivElement>(null);
  const fileInput = useRef<HTMLInputElement>(null);

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
      setStatus('ready — choose a tool from the side bar.');
    } catch {
      setStatus('could not extract readable text from this file. You can still use the file preview or paste text below.');
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

  const addAnnotation = () => {
    if (!annotation.trim()) return;
    const note = document.createElement('div');
    note.textContent = `📝 ${annotation.trim()}`;
    note.style.cssText = 'padding:10px 12px;margin:8px 0;background:#fff4b8;border-left:3px solid #d2a900;border-radius:7px;font-size:12px;';
    editor.current?.appendChild(note);
    setAnnotation('');
    setStatus('annotation added.');
  };

  const activateTool = (next: Tool) => {
    setTool(next);
    if (next === 'highlight') format('hiliteColor', '#fff19a');
    if (next === 'underline') format('underline');
    if (next === 'bold') format('bold');
    if (next === 'speech') (speaking ? stopSpeaking() : speak());
  };

  return (
    <SiteChrome>
      <main className="reader-page">
        <button className="reader-back" type="button" onClick={() => window.history.back()}>← back</button>

        <section className="reader-shell">
          <aside className="reader-sidebar" aria-label="Document tools">
            <p className="reader-side-label">TOOLS</p>
            <button type="button" className="reader-side-upload" onClick={() => fileInput.current?.click()}>
              <span>＋</span> upload file
            </button>
            <button type="button" className={tool === 'select' ? 'reader-tool active' : 'reader-tool'} onClick={() => setTool('select')}>↖ <span>select</span></button>
            <button type="button" className={tool === 'highlight' ? 'reader-tool active' : 'reader-tool'} onClick={() => activateTool('highlight')}>▰ <span>highlight</span></button>
            <button type="button" className={tool === 'underline' ? 'reader-tool active' : 'reader-tool'} onClick={() => activateTool('underline')}>U̲ <span>underline</span></button>
            <button type="button" className={tool === 'bold' ? 'reader-tool active' : 'reader-tool'} onClick={() => activateTool('bold')}>B <span>bold</span></button>
            <button type="button" className={tool === 'annotate' ? 'reader-tool active' : 'reader-tool'} onClick={() => setTool('annotate')}>✎ <span>annotate</span></button>
            <button type="button" className={tool === 'speech' ? 'reader-tool active' : 'reader-tool'} onClick={() => activateTool('speech')}>{speaking ? '■' : '▶'} <span>{speaking ? 'stop speech' : 'text to speech'}</span></button>
          </aside>

          <div className="reader-main">
            <div className="reader-card">
              <div className="reader-heading-row">
                <div>
                  <p className="kicker">study reader</p>
                  <h1>upload & annotate</h1>
                  <p className="sub">Read PDFs, Word documents and PowerPoints, then mark them up your way.</p>
                </div>
                {selected && <span className="reader-type">{selected.file.name.split('.').pop()?.toUpperCase()}</span>}
              </div>

              <input
                ref={fileInput}
                className="reader-hidden-input"
                type="file"
                accept=".pdf,.docx,.pptx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.openxmlformats-officedocument.presentationml.presentation,text/plain"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) void loadFile(file);
                  event.currentTarget.value = '';
                }}
              />

              {!selected ? (
                <button type="button" className="reader-file-box" onClick={() => fileInput.current?.click()}>
                  <span className="reader-upload-icon">↑</span>
                  <strong>{busy ? 'reading…' : 'choose your file'}</strong>
                  <small>Drop a PDF, Word document, PowerPoint, or text file here</small>
                  <em>browse files</em>
                </button>
              ) : (
                <div className="reader-file-selected">
                  <div><strong>{selected.file.name}</strong><span>{Math.max(1, Math.round(selected.file.size / 1024))} KB</span></div>
                  <button type="button" onClick={() => fileInput.current?.click()}>choose another</button>
                </div>
              )}

              {status && <p className="reader-status">{status}</p>}

              {tool === 'annotate' && (
                <div className="annotation-box">
                  <input value={annotation} onChange={(event) => setAnnotation(event.target.value)} placeholder="write an annotation…" onKeyDown={(event) => { if (event.key === 'Enter') addAnnotation(); }} />
                  <button type="button" onClick={addAnnotation}>add note</button>
                </div>
              )}

              <div className="reader-editor-wrap">
                <div
                  ref={editor}
                  className="reader-editor"
                  contentEditable
                  suppressContentEditableWarning
                  data-placeholder="Your extracted text will appear here…"
                  onInput={(event) => setText(event.currentTarget.innerText)}
                  dangerouslySetInnerHTML={{ __html: text.replace(/\n/g, '<br />') }}
                />
              </div>

              {selected?.file.type === 'application/pdf' && <iframe className="pdf-preview" title="PDF preview" src={selected.url} />}
            </div>
          </div>
        </section>
      </main>
      <style jsx>{`
        .reader-page{width:min(1180px,100%);margin:0 auto;padding:8px 12px 28px;box-sizing:border-box}
        .reader-back{border:1px solid var(--line,#ddd);background:var(--glass,rgba(255,255,255,.8));color:var(--page-text,#111);border-radius:999px;padding:8px 13px;font:inherit;font-size:12px;cursor:pointer;margin-bottom:14px}
        .reader-shell{display:grid;grid-template-columns:170px minmax(0,1fr);gap:14px;align-items:start}
        .reader-sidebar{position:sticky;top:104px;background:var(--glass,rgba(255,255,255,.85));border:1px solid var(--line,#ddd);border-radius:14px;padding:12px 9px;backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px)}
        .reader-side-label{font-size:8px;letter-spacing:.16em;font-weight:900;color:#999;margin:5px 8px 9px}
        .reader-side-upload{width:100%;border:0;border-radius:9px;background:var(--page-text,#111);color:var(--page-bg,#fff);padding:10px 9px;font:inherit;font-size:11px;font-weight:800;cursor:pointer;margin-bottom:9px;text-align:left}
        .reader-side-upload span{font-size:15px;margin-right:6px}
        .reader-tool{width:100%;display:flex;align-items:center;gap:9px;border:0;background:transparent;color:var(--page-text,#111);border-radius:8px;padding:9px 9px;font:inherit;font-size:11px;cursor:pointer;text-align:left}
        .reader-tool span{opacity:.75}.reader-tool:hover,.reader-tool.active{background:rgba(127,127,127,.13);opacity:1}
        .reader-main{min-width:0}.reader-card{background:var(--glass,rgba(255,255,255,.85));border:1px solid var(--line,#ddd);border-radius:16px;padding:22px;backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px)}
        .reader-heading-row{display:flex;justify-content:space-between;gap:16px;align-items:flex-start}.reader-heading-row h1{margin:0;font-size:28px;letter-spacing:-.04em}.reader-type{font-size:9px;font-weight:900;border:1px solid var(--line,#ddd);border-radius:999px;padding:6px 9px}
        .reader-hidden-input{display:none}.reader-file-box{width:100%;min-height:145px;border:1.5px dashed rgba(127,127,127,.45);border-radius:13px;background:rgba(127,127,127,.06);color:var(--page-text,#111);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:5px;cursor:pointer;font:inherit;margin-top:18px}.reader-file-box:hover{background:rgba(127,127,127,.1);border-color:#888}.reader-file-box strong{font-size:14px}.reader-file-box small{font-size:10px;color:#888}.reader-file-box em{font-style:normal;font-size:10px;font-weight:800;margin-top:5px}.reader-upload-icon{width:32px;height:32px;border:1px solid var(--line,#ddd);border-radius:50%;display:grid;place-items:center;font-size:18px;margin-bottom:3px}
        .reader-file-selected{margin-top:18px;border:1px solid var(--line,#ddd);border-radius:11px;padding:12px 14px;display:flex;align-items:center;justify-content:space-between;gap:12px}.reader-file-selected div{display:flex;flex-direction:column;gap:3px;min-width:0}.reader-file-selected strong{font-size:11px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.reader-file-selected span{font-size:9px;color:#999}.reader-file-selected button,.annotation-box button{border:1px solid var(--line,#ddd);background:transparent;color:var(--page-text,#111);border-radius:8px;padding:7px 9px;font:inherit;font-size:9px;font-weight:800;cursor:pointer;white-space:nowrap}
        .reader-status{font-size:10px;color:#888;margin:10px 2px}.annotation-box{display:flex;gap:7px;margin:12px 0}.annotation-box input{flex:1;min-width:0;border:1px solid var(--line,#ddd);background:transparent;color:var(--page-text,#111);border-radius:8px;padding:9px 10px;outline:none;font:inherit;font-size:11px}.annotation-box button{background:var(--page-text,#111);color:var(--page-bg,#fff)}
        .reader-editor-wrap{margin-top:14px}.reader-editor{min-height:320px;max-height:650px;overflow:auto;border:1px solid var(--line,#ddd);border-radius:11px;padding:18px;background:rgba(127,127,127,.035);color:var(--page-text,#111);font-family:Georgia,'Times New Roman',serif;font-size:14px;line-height:1.75;outline:none}.reader-editor:empty:before{content:attr(data-placeholder);color:#999}.pdf-preview{width:100%;height:650px;border:1px solid var(--line,#ddd);border-radius:11px;margin-top:14px;background:#fff}
        @media(max-width:720px){.reader-shell{grid-template-columns:1fr}.reader-sidebar{position:static;display:flex;overflow-x:auto;gap:4px;padding:8px}.reader-side-label{display:none}.reader-side-upload,.reader-tool{width:auto;flex:0 0 auto}.reader-tool span{display:none}.reader-card{padding:16px}.reader-heading-row h1{font-size:23px}.reader-file-selected{align-items:flex-start;flex-direction:column}.reader-file-selected button{width:100%}}
      `}</style>
    </SiteChrome>
  );
}
