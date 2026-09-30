'use client';

import { useEffect, useRef, useState } from 'react';
import SiteChrome from '@/app/components/SiteChrome';

type ReaderFile = { file: File; url: string };
type Tool = 'select' | 'highlight' | 'underline' | 'bold' | 'annotate' | 'speech';
type Mark = { id: number; type: 'highlight' | 'underline' | 'note'; x: number; y: number; w: number; h: number; text?: string };
type Slide = { id: number; html: string };

const DOCX = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
const PPTX = 'application/vnd.openxmlformats-officedocument.presentationml.presentation';

export default function DocumentReaderPage() {
  const [selected, setSelected] = useState<ReaderFile | null>(null);
  const [text, setText] = useState('');
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [tool, setTool] = useState<Tool>('select');
  const [pdfPages, setPdfPages] = useState<number[]>([]);
  const [pdfReady, setPdfReady] = useState(false);
  const [marks, setMarks] = useState<Record<string, Mark[]>>({});
  const [slides, setSlides] = useState<Slide[]>([]);
  const [docxHtml, setDocxHtml] = useState('');

  const fileInput = useRef<HTMLInputElement>(null);
  const pdfRoot = useRef<HTMLDivElement>(null);
  const pdfDoc = useRef<any>(null);
  const markId = useRef(0);
  const drag = useRef<{ key: string; x: number; y: number } | null>(null);
  const editor = useRef<HTMLDivElement>(null);
  const speechSource = useRef<HTMLElement | null>(null);

  useEffect(() => () => {
    if (selected?.url) URL.revokeObjectURL(selected.url);
    window.speechSynthesis?.cancel();
  }, [selected?.url]);

  const clearReader = () => {
    if (selected?.url) URL.revokeObjectURL(selected.url);
    setSelected(null); setText(''); setDocxHtml(''); setSlides([]); setPdfPages([]); setPdfReady(false); setMarks({}); setStatus(''); pdfDoc.current = null;
  };

  const renderPdf = async (file: File) => {
    const pdfjs: any = await import('pdfjs-dist/legacy/build/pdf.mjs');
    const pdf = await pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()) }).promise;
    pdfDoc.current = pdf;
    setPdfPages(Array.from({ length: pdf.numPages }, (_, i) => i + 1));
    setPdfReady(true);
    const extracted: string[] = [];
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      extracted.push(content.items.map((item: any) => 'str' in item ? item.str : '').join(' '));
    }
    setText(extracted.join('\n\n'));
    setStatus(`PDF ready — ${pdf.numPages} page${pdf.numPages === 1 ? '' : 's'}.`);
  };

  const loadDocx = async (file: File) => {
    const mammoth = await import('mammoth');
    const result = await mammoth.convertToHtml({ arrayBuffer: await file.arrayBuffer() });
    setDocxHtml(result.value || '<p>No readable document content.</p>');
    setText(result.value.replace(/<[^>]+>/g, ' '));
    setStatus('Word document rendered as a document page. Select text and use the sidebar tools directly.');
  };

  const loadPptx = async (file: File) => {
    const JSZip = (await import('jszip')).default;
    const zip = await JSZip.loadAsync(await file.arrayBuffer());
    const slideNames = Object.keys(zip.files).filter(name => /^ppt\/slides\/slide\d+\.xml$/.test(name)).sort((a, b) => Number(a.match(/slide(\d+)/)?.[1] || 0) - Number(b.match(/slide(\d+)/)?.[1] || 0));
    const nextSlides: Slide[] = [];
    for (let index = 0; index < slideNames.length; index++) {
      const xml = await zip.files[slideNames[index]].async('text');
      const doc = new DOMParser().parseFromString(xml, 'application/xml');
      const paragraphs = Array.from(doc.getElementsByTagName('a:p')).map(p => Array.from(p.getElementsByTagName('a:t')).map(t => t.textContent || '').join('')).filter(Boolean);
      const body = paragraphs.length ? paragraphs.map(p => `<p>${escapeHtml(p)}</p>`).join('') : '<p class="empty-slide">This slide contains visual elements that are not extractable in the browser preview.</p>';
      nextSlides.push({ id: index + 1, html: body });
    }
    setSlides(nextSlides);
    setText(nextSlides.map(s => s.html.replace(/<[^>]+>/g, ' ')).join('\n'));
    setStatus(`${nextSlides.length} slide${nextSlides.length === 1 ? '' : 's'} rendered as individual slide pages.`);
  };

  const loadFile = async (file: File) => {
    if (selected?.url) URL.revokeObjectURL(selected.url);
    setSelected({ file, url: URL.createObjectURL(file) }); setText(''); setDocxHtml(''); setSlides([]); setPdfPages([]); setPdfReady(false); setMarks({}); setStatus('opening your document…'); setBusy(true);
    try {
      const ext = file.name.split('.').pop()?.toLowerCase();
      if (ext === 'pdf') await renderPdf(file); else if (ext === 'docx') await loadDocx(file); else if (ext === 'pptx') await loadPptx(file); else if (ext === 'txt') { setText(await file.text()); setStatus('Text file loaded.'); } else throw new Error('unsupported');
    } catch (error) { console.error(error); setStatus('This file could not be rendered in the browser. Try PDF, DOCX, or PPTX.'); } finally { setBusy(false); }
  };

  const renderPdfPage = async (pageNumber: number, canvas: HTMLCanvasElement) => {
    if (!pdfDoc.current) return;
    const page = await pdfDoc.current.getPage(pageNumber);
    const rootWidth = pdfRoot.current?.clientWidth || 980;
    const targetWidth = Math.min(980, Math.max(720, rootWidth - 30));
    const base = page.getViewport({ scale: 1 });
    const viewport = page.getViewport({ scale: targetWidth / base.width });
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.floor(viewport.width * dpr); canvas.height = Math.floor(viewport.height * dpr); canvas.style.width = `${viewport.width}px`; canvas.style.height = `${viewport.height}px`;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); await page.render({ canvasContext: ctx, viewport }).promise;
  };

  useEffect(() => {
    if (!pdfReady) return;
    const render = () => document.querySelectorAll<HTMLCanvasElement>('[data-pdf-page]').forEach(canvas => void renderPdfPage(Number(canvas.dataset.pdfPage), canvas));
    render(); window.addEventListener('resize', render); return () => window.removeEventListener('resize', render);
  }, [pdfReady, pdfPages]);

  const formatSelection = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    if (editor.current) setText(editor.current.innerText);
  };

  const speak = () => {
    const source = speechSource.current || editor.current || document.querySelector<HTMLElement>('.pptx-viewer, .pdf-viewer, .text-content');
    const value = source?.innerText || text;
    if (!value.trim() || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(value);
    utterance.onstart = () => setSpeaking(true); utterance.onend = () => setSpeaking(false); utterance.onerror = () => setSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => { window.speechSynthesis?.cancel(); setSpeaking(false); };

  const activateTool = (next: Tool) => {
    setTool(next);
    if (next === 'highlight') formatSelection('hiliteColor', '#fff19a');
    if (next === 'underline') formatSelection('underline');
    if (next === 'bold') formatSelection('bold');
    if (next === 'speech') speaking ? stopSpeaking() : speak();
  };

  const marksFor = (key: string) => marks[key] || [];

  const beginMark = (key: string, event: React.PointerEvent<HTMLDivElement>) => {
    if (tool === 'select' || tool === 'bold' || tool === 'speech') return;
    const rect = event.currentTarget.getBoundingClientRect();
    drag.current = { key, x: ((event.clientX - rect.left) / rect.width) * 100, y: ((event.clientY - rect.top) / rect.height) * 100 };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const finishMark = (key: string, event: React.PointerEvent<HTMLDivElement>) => {
    const start = drag.current; if (!start || start.key !== key) return; drag.current = null;
    const rect = event.currentTarget.getBoundingClientRect();
    const endX = ((event.clientX - rect.left) / rect.width) * 100; const endY = ((event.clientY - rect.top) / rect.height) * 100;
    const x = Math.max(0, Math.min(start.x, endX)); const y = Math.max(0, Math.min(start.y, endY));
    const w = Math.max(1.5, Math.min(100 - x, Math.abs(endX - start.x))); const h = Math.max(1.5, Math.min(100 - y, Math.abs(endY - start.y)));
    if (tool === 'annotate') {
      const note = window.prompt('Write your annotation:'); if (!note?.trim()) return;
      setMarks(prev => ({ ...prev, [key]: [...(prev[key] || []), { id: ++markId.current, type: 'note', x, y, w: 5, h: 5, text: note.trim() }] })); return;
    }
    setMarks(prev => ({ ...prev, [key]: [...(prev[key] || []), { id: ++markId.current, type: tool === 'underline' ? 'underline' : 'highlight', x, y, w, h }] }));
  };

  const readerTools = [['select', '↖', 'select'], ['highlight', '▰', 'highlight'], ['underline', 'U̲', 'underline'], ['annotate', '✎', 'annotate'], ['bold', 'B', 'bold text']] as const;

  return (
    <SiteChrome>
      <main className="reader-page">
        <button className="reader-back" type="button" onClick={() => window.history.back()}>← back</button>
        <section className="reader-shell">
          <aside className="reader-sidebar" aria-label="Document tools">
            <p className="reader-side-label">TOOLS</p>
            <button type="button" className="reader-side-upload" onClick={() => fileInput.current?.click()}><span>＋</span> upload file</button>
            {readerTools.map(([id, icon, label]) => <button key={id} type="button" className={tool === id ? 'reader-tool active' : 'reader-tool'} onClick={() => activateTool(id)}>{icon} <span>{label}</span></button>)}
            <button type="button" className={tool === 'speech' ? 'reader-tool active' : 'reader-tool'} onClick={() => activateTool('speech')}>{speaking ? '■' : '▶'} <span>{speaking ? 'stop speech' : 'text to speech'}</span></button>
          </aside>

          <div className="reader-main">
            <div className="reader-card">
              <div className="reader-heading-row"><div><p className="kicker">study reader</p><h1>upload & annotate</h1><p className="sub">Open the actual document, make it large, and use the tools directly on it.</p></div>{selected && <button className="reader-close" type="button" onClick={clearReader}>clear</button>}</div>
              <input ref={fileInput} className="reader-hidden-input" type="file" accept={`.pdf,.docx,.pptx,.txt,application/pdf,${DOCX},${PPTX},text/plain`} onChange={event => { const file = event.target.files?.[0]; if (file) void loadFile(file); event.currentTarget.value = ''; }} />
              {!selected ? <button type="button" className="reader-file-box" onClick={() => fileInput.current?.click()}><span className="reader-upload-icon">↑</span><strong>{busy ? 'opening…' : 'choose your file'}</strong><small>PDF · Word · PowerPoint · text</small><em>browse files</em></button> : <div className="reader-file-selected"><div><strong>{selected.file.name}</strong><span>{Math.max(1, Math.round(selected.file.size / 1024))} KB</span></div><button type="button" onClick={() => fileInput.current?.click()}>choose another</button></div>}
              {status && <p className="reader-status">{status}</p>}

              {selected?.file.type === 'application/pdf' && pdfReady && <div className="pdf-viewer" ref={pdfRoot}><div className="viewer-tip">{tool === 'select' ? 'Select mode — select text normally.' : `${tool} mode — drag directly over the document.`}</div>{pdfPages.map(page => <div key={page} className="document-page-wrap"><div className="page-label">page {page}</div><div className="document-page pdf-page" onPointerDown={e => beginMark(`pdf-${page}`, e)} onPointerUp={e => finishMark(`pdf-${page}`, e)}><canvas data-pdf-page={page} /><MarkLayer marks={marksFor(`pdf-${page}`)} /></div></div>)}</div>}

              {selected?.file.type === DOCX && docxHtml && <div className="docx-viewer"><div className="viewer-tip">Word document view — select text for highlight, underline, or bold. Use annotate to place a note on the page.</div><div className="document-page docx-page" onPointerDown={e => beginMark('docx', e)} onPointerUp={e => finishMark('docx', e)}><article ref={editor} className="docx-content" contentEditable suppressContentEditableWarning onInput={e => setText(e.currentTarget.innerText)} dangerouslySetInnerHTML={{ __html: docxHtml }} /><MarkLayer marks={marksFor('docx')} /></div></div>}

              {selected?.file.type === PPTX && slides.length > 0 && <div className="pptx-viewer"><div className="viewer-tip">PowerPoint view — each slide is separated like a presentation. Select text for formatting or annotate the slide itself.</div>{slides.map(slide => <div key={slide.id} className="slide-wrap"><div className="page-label">slide {slide.id}</div><div className="ppt-slide" onPointerDown={e => beginMark(`slide-${slide.id}`, e)} onPointerUp={e => finishMark(`slide-${slide.id}`, e)}><article ref={slide.id === 1 ? speechSource : undefined} className="slide-content" contentEditable suppressContentEditableWarning dangerouslySetInnerHTML={{ __html: slide.html }} /><MarkLayer marks={marksFor(`slide-${slide.id}`)} /></div></div>)}</div>}

              {selected?.file.type === 'text/plain' && <div className="document-page text-page" onPointerDown={e => beginMark('text', e)} onPointerUp={e => finishMark('text', e)}><article ref={editor} className="text-content" contentEditable suppressContentEditableWarning onInput={e => setText(e.currentTarget.innerText)}>{text}</article><MarkLayer marks={marksFor('text')} /></div>}
            </div>
          </div>
        </section>
      </main>
      <style jsx>{`
        .reader-page{width:min(1380px,100%);margin:0 auto;padding:8px 12px 48px;box-sizing:border-box}.reader-back,.reader-close{border:1px solid var(--line,#ddd);background:var(--glass,rgba(255,255,255,.8));color:var(--page-text,#111);border-radius:999px;padding:8px 13px;font:inherit;font-size:12px;cursor:pointer}.reader-back{margin-bottom:14px}.reader-shell{display:grid;grid-template-columns:170px minmax(0,1fr);gap:16px;align-items:start}.reader-sidebar{position:sticky;top:104px;background:var(--glass,rgba(255,255,255,.85));border:1px solid var(--line,#ddd);border-radius:14px;padding:12px 9px;backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);z-index:5}.reader-side-label{font-size:8px;letter-spacing:.16em;font-weight:900;color:#999;margin:5px 8px 9px}.reader-side-upload,.reader-tool{width:100%;border:0;border-radius:9px;padding:10px 9px;font:inherit;font-size:11px;font-weight:800;cursor:pointer;margin-bottom:6px;text-align:left}.reader-side-upload{background:var(--page-text,#111);color:var(--page-bg,#fff);margin-bottom:9px}.reader-tool{background:transparent;color:var(--page-text,#111)}.reader-tool:hover,.reader-tool.active{background:rgba(127,127,127,.15)}.reader-tool span{margin-left:6px}.reader-main{min-width:0}.reader-card{background:var(--glass,rgba(255,255,255,.7));border:1px solid var(--line,#ddd);border-radius:20px;padding:22px;backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px)}.reader-heading-row{display:flex;justify-content:space-between;align-items:flex-start;gap:20px}.kicker{font-size:9px;text-transform:uppercase;letter-spacing:.16em;font-weight:900;opacity:.55;margin:0 0 5px}.reader-card h1{font-size:clamp(28px,4vw,44px);line-height:1;margin:0;color:var(--page-text,#111)}.sub{font-size:13px;opacity:.62;margin:9px 0 0}.reader-hidden-input{display:none}.reader-file-box{width:100%;min-height:145px;border:1.5px dashed rgba(100,100,100,.35);background:rgba(255,255,255,.45);color:var(--page-text,#111);border-radius:16px;margin-top:20px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:7px;cursor:pointer}.reader-upload-icon{font-size:28px}.reader-file-box strong{font-size:14px}.reader-file-box small{font-size:11px;opacity:.6}.reader-file-box em{font-style:normal;font-size:11px;font-weight:800;text-decoration:underline}.reader-file-selected{margin-top:20px;border:1px solid var(--line,#ddd);border-radius:12px;padding:10px 12px;display:flex;justify-content:space-between;align-items:center;gap:12px;background:rgba(255,255,255,.45)}.reader-file-selected div{display:flex;flex-direction:column;gap:3px}.reader-file-selected strong{font-size:12px}.reader-file-selected span{font-size:10px;opacity:.55}.reader-file-selected button{border:0;background:transparent;text-decoration:underline;font:inherit;font-size:11px;cursor:pointer;color:var(--page-text,#111)}.reader-status{font-size:11px;opacity:.65;margin:12px 2px}.viewer-tip{background:rgba(127,127,127,.09);border:1px solid var(--line,#ddd);border-radius:10px;padding:9px 11px;font-size:10px;margin-bottom:13px}.pdf-viewer,.docx-viewer,.pptx-viewer{margin-top:18px}.document-page-wrap,.slide-wrap{margin-bottom:22px}.page-label{font-size:9px;text-transform:uppercase;letter-spacing:.12em;opacity:.5;font-weight:900;margin:0 0 7px 5px}.document-page{position:relative;width:max-content;max-width:100%;margin:0 auto;background:#fff;color:#111;box-shadow:0 10px 35px rgba(0,0,0,.12);overflow:hidden}.pdf-page{line-height:0}.pdf-page canvas{display:block;max-width:100%;height:auto}.docx-page{width:min(900px,100%);min-height:1100px;padding:60px 70px;box-sizing:border-box;overflow:visible}.docx-content{position:relative;z-index:1;outline:0;min-height:900px;font-family:Georgia,'Times New Roman',serif;font-size:15px;line-height:1.65;color:#1b1b1b}.docx-content :global(img){max-width:100%;height:auto}.docx-content :global(table){max-width:100%;border-collapse:collapse}.docx-content :global(td),.docx-content :global(th){border:1px solid #ccc;padding:5px}.text-page{width:min(900px,100%);min-height:900px;padding:55px;box-sizing:border-box;overflow:visible}.text-content{position:relative;z-index:1;outline:0;white-space:pre-wrap;font-size:15px;line-height:1.65}.ppt-slide{position:relative;width:min(100%,980px);aspect-ratio:16/9;background:#fff;color:#111;box-shadow:0 10px 35px rgba(0,0,0,.12);overflow:hidden;margin:auto}.slide-content{position:absolute;inset:8%;outline:0;font-size:clamp(13px,1.5vw,22px);line-height:1.35;z-index:1}.slide-content :global(p){margin:0 0 .45em}.slide-content :global(.empty-slide){opacity:.45;font-size:12px}.reader-close{font-size:11px}:global(.pdf-mark-layer){position:absolute;inset:0;pointer-events:none;z-index:3}.pdf-mark{position:absolute;box-sizing:border-box}.pdf-highlight{background:rgba(255,224,61,.42);border-radius:3px}.pdf-underline{border-bottom:3px solid #e4b800}.pdf-note{width:32px!important;height:32px!important;background:#fff2a8;border:1px solid #d4b63a;border-radius:7px;display:flex;align-items:center;justify-content:center;box-shadow:0 3px 10px rgba(0,0,0,.15);font-size:17px}.pdf-note span{display:block}@media(max-width:800px){.reader-shell{grid-template-columns:1fr}.reader-sidebar{position:sticky;top:78px;display:flex;gap:5px;overflow-x:auto;padding:8px}.reader-side-label{display:none}.reader-side-upload,.reader-tool{width:auto;white-space:nowrap;margin:0;padding:9px}.reader-card{padding:14px}.docx-page{padding:30px 22px;min-height:700px}.text-page{padding:30px 22px}.reader-heading-row{align-items:center}.reader-close{padding:7px 10px}}
      `}</style>
    </SiteChrome>
  );
}

function MarkLayer({ marks }: { marks: Mark[] }) {
  return <div className="pdf-mark-layer">{marks.map(mark => <div key={mark.id} className={`pdf-mark pdf-${mark.type}`} style={{ left: `${mark.x}%`, top: `${mark.y}%`, width: `${mark.w}%`, height: `${mark.h}%` }} title={mark.text || mark.type}>{mark.type === 'note' && <span>📝</span>}</div>)}</div>;
}

function escapeHtml(value: string) {
  return value.replace(/[&<>'"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char] || char));
}
