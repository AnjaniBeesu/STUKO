'use client';

import { useEffect, useRef, useState } from 'react';
import SiteChrome from '@/app/components/SiteChrome';

type ReaderFile = { file: File; url: string };
type Tool = 'select' | 'highlight' | 'underline' | 'bold' | 'annotate' | 'speech';
type Mark = { id: number; type: 'highlight' | 'underline' | 'note'; x: number; y: number; w: number; h: number; text?: string };

export default function DocumentReaderPage() {
  const [selected, setSelected] = useState<ReaderFile | null>(null);
  const [text, setText] = useState('');
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [tool, setTool] = useState<Tool>('select');
  const [annotation, setAnnotation] = useState('');
  const [pdfPages, setPdfPages] = useState<number[]>([]);
  const [pdfReady, setPdfReady] = useState(false);
  const [marks, setMarks] = useState<Record<number, Mark[]>>({});
  const editor = useRef<HTMLDivElement>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const pdfRoot = useRef<HTMLDivElement>(null);
  const pdfDoc = useRef<any>(null);
  const markId = useRef(0);
  const drag = useRef<{ page: number; x: number; y: number } | null>(null);

  useEffect(() => () => {
    if (selected?.url) URL.revokeObjectURL(selected.url);
    window.speechSynthesis?.cancel();
  }, [selected?.url]);

  const renderPdf = async (file: File) => {
    const pdfjs: any = await import('pdfjs-dist/legacy/build/pdf.mjs');
    const pdf = await pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()) }).promise;
    pdfDoc.current = pdf;
    setPdfPages(Array.from({ length: pdf.numPages }, (_, i) => i + 1));
    setPdfReady(true);
    setStatus(`PDF ready — ${pdf.numPages} page${pdf.numPages === 1 ? '' : 's'}. Use the sidebar to mark the document directly.`);

    const pages: string[] = [];
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      pages.push(content.items.map((item: any) => 'str' in item ? item.str : '').join(' '));
    }
    setText(pages.join('\n\n'));
  };

  const loadFile = async (file: File) => {
    if (selected?.url) URL.revokeObjectURL(selected.url);
    const next = { file, url: URL.createObjectURL(file) };
    setSelected(next);
    setText('');
    setPdfPages([]);
    setPdfReady(false);
    setMarks({});
    setStatus('reading your file…');
    setBusy(true);

    try {
      const ext = file.name.split('.').pop()?.toLowerCase();
      if (ext === 'txt') {
        setText(await file.text());
        setStatus('ready — choose a tool from the side bar.');
      } else if (ext === 'docx') {
        const mammoth = await import('mammoth');
        const result = await mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() });
        setText(result.value);
        setStatus('Word document loaded.');
      } else if (ext === 'pdf') {
        await renderPdf(file);
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
        setStatus('PowerPoint loaded.');
      } else {
        throw new Error('unsupported');
      }
    } catch {
      setStatus('could not extract readable text from this file. You can still use the file preview or paste text below.');
    } finally {
      setBusy(false);
    }
  };

  const renderPdfPage = async (pageNumber: number, canvas: HTMLCanvasElement) => {
    if (!pdfDoc.current) return;
    const page = await pdfDoc.current.getPage(pageNumber);
    const containerWidth = Math.max(760, Math.min(1050, pdfRoot.current?.clientWidth || 900));
    const base = page.getViewport({ scale: 1 });
    const scale = containerWidth / base.width;
    const viewport = page.getViewport({ scale });
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.floor(viewport.width * dpr);
    canvas.height = Math.floor(viewport.height * dpr);
    canvas.style.width = `${viewport.width}px`;
    canvas.style.height = `${viewport.height}px`;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    await page.render({ canvasContext: ctx, viewport }).promise;
  };

  useEffect(() => {
    if (!pdfReady) return;
    const canvases = Array.from(document.querySelectorAll<HTMLCanvasElement>('[data-pdf-page]'));
    canvases.forEach((canvas) => void renderPdfPage(Number(canvas.dataset.pdfPage), canvas));
  }, [pdfReady, pdfPages]);

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

  const pageMarks = (page: number) => marks[page] || [];

  const beginMark = (page: number, event: React.PointerEvent<HTMLDivElement>) => {
    if (!pdfReady || tool === 'select' || tool === 'speech') return;
    const rect = event.currentTarget.getBoundingClientRect();
    drag.current = { page, x: ((event.clientX - rect.left) / rect.width) * 100, y: ((event.clientY - rect.top) / rect.height) * 100 };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const finishMark = (page: number, event: React.PointerEvent<HTMLDivElement>) => {
    const start = drag.current;
    if (!start || start.page !== page) return;
    drag.current = null;
    const rect = event.currentTarget.getBoundingClientRect();
    const endX = ((event.clientX - rect.left) / rect.width) * 100;
    const endY = ((event.clientY - rect.top) / rect.height) * 100;
    const x = Math.max(0, Math.min(start.x, endX));
    const y = Math.max(0, Math.min(start.y, endY));
    const w = Math.max(1.5, Math.min(100 - x, Math.abs(endX - start.x)));
    const h = Math.max(1.5, Math.min(100 - y, Math.abs(endY - start.y)));
    if (tool === 'annotate') {
      const note = window.prompt('Write your annotation:');
      if (!note?.trim()) return;
      setMarks(prev => ({ ...prev, [page]: [...(prev[page] || []), { id: ++markId.current, type: 'note', x, y, w: 4, h: 4, text: note.trim() }] }));
      return;
    }
    setMarks(prev => ({ ...prev, [page]: [...(prev[page] || []), { id: ++markId.current, type: tool === 'underline' ? 'underline' : 'highlight', x, y, w, h }] }));
  };

  return (
    <SiteChrome>
      <main className="reader-page">
        <button className="reader-back" type="button" onClick={() => window.history.back()}>← back</button>

        <section className="reader-shell">
          <aside className="reader-sidebar" aria-label="Document tools">
            <p className="reader-side-label">TOOLS</p>
            <button type="button" className="reader-side-upload" onClick={() => fileInput.current?.click()}><span>＋</span> upload file</button>
            <button type="button" className={tool === 'select' ? 'reader-tool active' : 'reader-tool'} onClick={() => setTool('select')}>↖ <span>select</span></button>
            <button type="button" className={tool === 'highlight' ? 'reader-tool active' : 'reader-tool'} onClick={() => setTool('highlight')}>▰ <span>highlight</span></button>
            <button type="button" className={tool === 'underline' ? 'reader-tool active' : 'reader-tool'} onClick={() => setTool('underline')}>U̲ <span>underline</span></button>
            <button type="button" className={tool === 'annotate' ? 'reader-tool active' : 'reader-tool'} onClick={() => setTool('annotate')}>✎ <span>annotate</span></button>
            <button type="button" className={tool === 'bold' ? 'reader-tool active' : 'reader-tool'} onClick={() => activateTool('bold')}>B <span>bold text</span></button>
            <button type="button" className={tool === 'speech' ? 'reader-tool active' : 'reader-tool'} onClick={() => activateTool('speech')}>{speaking ? '■' : '▶'} <span>{speaking ? 'stop speech' : 'text to speech'}</span></button>
          </aside>

          <div className="reader-main">
            <div className="reader-card">
              <div className="reader-heading-row">
                <div><p className="kicker">study reader</p><h1>upload & annotate</h1><p className="sub">Open your document, make it big, and mark it directly on the page.</p></div>
                {selected && <span className="reader-type">{selected.file.name.split('.').pop()?.toUpperCase()}</span>}
              </div>

              <input ref={fileInput} className="reader-hidden-input" type="file" accept=".pdf,.docx,.pptx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.openxmlformats-officedocument.presentationml.presentation,text/plain" onChange={(event) => { const file = event.target.files?.[0]; if (file) void loadFile(file); event.currentTarget.value = ''; }} />

              {!selected ? (
                <button type="button" className="reader-file-box" onClick={() => fileInput.current?.click()}><span className="reader-upload-icon">↑</span><strong>{busy ? 'reading…' : 'choose your file'}</strong><small>Drop a PDF, Word document, PowerPoint, or text file here</small><em>browse files</em></button>
              ) : (
                <div className="reader-file-selected"><div><strong>{selected.file.name}</strong><span>{Math.max(1, Math.round(selected.file.size / 1024))} KB</span></div><button type="button" onClick={() => fileInput.current?.click()}>choose another</button></div>
              )}

              {status && <p className="reader-status">{status}</p>}

              {selected?.file.type === 'application/pdf' && pdfReady ? (
                <div className="pdf-viewer" ref={pdfRoot}>
                  <div className="pdf-help">{tool === 'select' ? 'Select mode — choose a tool to mark the page.' : `${tool} mode — drag directly over the PDF.`}</div>
                  {pdfPages.map(page => (
                    <div key={page} className="pdf-page-wrap">
                      <div className="pdf-page-number">page {page}</div>
                      <div
                        className={`pdf-page ${tool !== 'select' && tool !== 'speech' ? 'markable' : ''}`}
                        onPointerDown={(event) => beginMark(page, event)}
                        onPointerUp={(event) => finishMark(page, event)}
                      >
                        <canvas data-pdf-page={page} />
                        <div className="pdf-mark-layer">
                          {pageMarks(page).map(mark => (
                            <div key={mark.id} className={`pdf-mark pdf-${mark.type}`} style={{ left: `${mark.x}%`, top: `${mark.y}%`, width: `${mark.w}%`, height: `${mark.h}%` }} title={mark.text || mark.type}>
                              {mark.type === 'note' && <span>📝</span>}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  {tool === 'annotate' && <div className="annotation-box"><input value={annotation} onChange={(event) => setAnnotation(event.target.value)} placeholder="write an annotation…" onKeyDown={(event) => { if (event.key === 'Enter') addAnnotation(); }} /><button type="button" onClick={addAnnotation}>add note</button></div>}
                  <div className="reader-editor-wrap"><div ref={editor} className="reader-editor" contentEditable suppressContentEditableWarning data-placeholder="Your extracted text will appear here…" onInput={(event) => setText(event.currentTarget.innerText)} dangerouslySetInnerHTML={{ __html: text.replace(/\n/g, '<br />') }} /></div>
                </>
              )}
            </div>
          </div>
        </section>
      </main>
      <style jsx>{`
        .reader-page{width:min(1280px,100%);margin:0 auto;padding:8px 12px 40px;box-sizing:border-box}.reader-back{border:1px solid var(--line,#ddd);background:var(--glass,rgba(255,255,255,.8));color:var(--page-text,#111);border-radius:999px;padding:8px 13px;font:inherit;font-size:12px;cursor:pointer;margin-bottom:14px}.reader-shell{display:grid;grid-template-columns:170px minmax(0,1fr);gap:14px;align-items:start}.reader-sidebar{position:sticky;top:104px;background:var(--glass,rgba(255,255,255,.85));border:1px solid var(--line,#ddd);border-radius:14px;padding:12px 9px;backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px)}.reader-side-label{font-size:8px;letter-spacing:.16em;font-weight:900;color:#999;margin:5px 8px 9px}.reader-side-upload{width:100%;border:0;border-radius:9px;background:var(--page-text,#111);color:var(--page-bg,#fff);padding:10px 9px;font:inherit;font-size:11px;font-weight:800;cursor:pointer;margin-bottom:9px;text-align:left}.reader-side-upload span{font-size:15px;margin-right:6px}.reader-tool{width:100%;display:flex;align-items:center;gap:9px;border:0;background:transparent;color:var(--page-text,#111);border-radius:8px;padding:9px;font:inherit;font-size:11px;cursor:pointer;text-align:left}.reader-tool span{opacity:.75}.reader-tool:hover,.reader-tool.active{background:rgba(127,127,127,.13)}.reader-main{min-width:0}.reader-card{background:var(--glass,rgba(255,255,255,.85));border:1px solid var(--line,#ddd);border-radius:16px;padding:22px;backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px)}.reader-heading-row{display:flex;justify-content:space-between;gap:16px;align-items:flex-start}.reader-heading-row h1{margin:0;font-size:28px;letter-spacing:-.04em}.reader-type{font-size:9px;font-weight:900;border:1px solid var(--line,#ddd);border-radius:999px;padding:6px 9px}.reader-hidden-input{display:none}.reader-file-box{width:100%;min-height:145px;border:1.5px dashed rgba(127,127,127,.45);border-radius:13px;background:rgba(127,127,127,.06);color:var(--page-text,#111);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:5px;cursor:pointer;font:inherit;margin-top:18px}.reader-file-box strong{font-size:14px}.reader-file-box small{font-size:10px;color:#888}.reader-file-box em{font-style:normal;font-size:10px;font-weight:800;margin-top:5px}.reader-upload-icon{width:32px;height:32px;border:1px solid var(--line,#ddd);border-radius:50%;display:grid;place-items:center;font-size:18px;margin-bottom:3px}.reader-file-selected{margin-top:18px;border:1px solid var(--line,#ddd);border-radius:11px;padding:12px 14px;display:flex;align-items:center;justify-content:space-between;gap:12px}.reader-file-selected div{display:flex;flex-direction:column;gap:3px;min-width:0}.reader-file-selected strong{font-size:11px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.reader-file-selected span{font-size:9px;color:#999}.reader-file-selected button,.annotation-box button{border:1px solid var(--line,#ddd);background:transparent;color:var(--page-text,#111);border-radius:8px;padding:7px 9px;font:inherit;font-size:9px;font-weight:800;cursor:pointer}.reader-status{font-size:10px;color:#888;margin:10px 2px}.annotation-box{display:flex;gap:7px;margin:12px 0}.annotation-box input{flex:1;min-width:0;border:1px solid var(--line,#ddd);background:transparent;color:var(--page-text,#111);border-radius:8px;padding:9px 10px;outline:none;font:inherit;font-size:11px}.annotation-box button{background:var(--page-text,#111);color:var(--page-bg,#fff)}
        .pdf-viewer{margin-top:16px;padding:14px 10px 24px;background:rgba(0,0,0,.055);border:1px solid var(--line,#ddd);border-radius:13px;overflow:auto;max-height:calc(100vh - 180px);scroll-behavior:smooth}.pdf-help{position:sticky;top:0;z-index:5;width:max-content;max-width:100%;margin:0 auto 12px;padding:7px 11px;border:1px solid var(--line,#ddd);border-radius:999px;background:var(--glass,rgba(255,255,255,.9));font-size:9px;color:#777;backdrop-filter:blur(10px)}.pdf-page-wrap{width:max-content;max-width:100%;margin:0 auto 28px}.pdf-page-number{text-align:center;font-size:9px;color:#888;margin-bottom:6px}.pdf-page{position:relative;width:max-content;max-width:100%;background:#fff;box-shadow:0 10px 30px rgba(0,0,0,.15);line-height:0;touch-action:none}.pdf-page canvas{display:block;max-width:100%;height:auto}.pdf-page.markable{cursor:crosshair}.pdf-mark-layer{position:absolute;inset:0;pointer-events:none}.pdf-mark{position:absolute;box-sizing:border-box}.pdf-highlight{background:rgba(255,230,65,.42);border-radius:2px}.pdf-underline{border-bottom:3px solid rgba(235,80,65,.82);min-height:3px}.pdf-note{width:28px!important;height:28px!important;border-radius:50%;background:#ffe77a;border:2px solid #d4aa00;display:grid;place-items:center;box-shadow:0 3px 10px rgba(0,0,0,.2)}.pdf-note span{font-size:15px;line-height:1}
        .reader-editor-wrap{margin-top:14px}.reader-editor{min-height:320px;max-height:650px;overflow:auto;border:1px solid var(--line,#ddd);border-radius:11px;padding:18px;background:rgba(127,127,127,.035);color:var(--page-text,#111);font-family:Georgia,'Times New Roman',serif;font-size:14px;line-height:1.75;outline:none}.reader-editor:empty:before{content:attr(data-placeholder);color:#999}
        @media(max-width:720px){.reader-shell{grid-template-columns:1fr}.reader-sidebar{position:static;display:flex;overflow-x:auto;gap:4px;padding:8px}.reader-side-label{display:none}.reader-side-upload,.reader-tool{width:auto;flex:0 0 auto}.reader-tool span{display:none}.reader-card{padding:16px}.reader-heading-row h1{font-size:23px}.reader-file-selected{align-items:flex-start;flex-direction:column}.reader-file-selected button{width:100%}.pdf-viewer{max-height:none;padding:8px 4px}.pdf-page{width:100%}.pdf-page canvas{width:100%!important;height:auto!important}}
      `}</style>
    </SiteChrome>
  );
}
