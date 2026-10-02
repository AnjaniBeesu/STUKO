'use client';

import { useEffect, useRef, useState, type MouseEvent } from 'react';
import SiteChrome from '@/app/components/SiteChrome';

type ReaderFile = { file: File; url: string };
type Tool = 'highlight' | 'annotate' | 'speech';
type Mark = { id: number; type: 'highlight' | 'note'; x: number; y: number; w: number; h: number; text?: string };
type Slide = { id: number; html: string };
type PdfText = { str: string; left: number; top: number; width: number; height: number; rotate: number };

const DOCX = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
const PPTX = 'application/vnd.openxmlformats-officedocument.presentationml.presentation';

export default function DocumentReaderPage() {
  const [selected, setSelected] = useState<ReaderFile | null>(null);
  const [text, setText] = useState('');
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [tool, setTool] = useState<Tool | null>(null);
  const [pdfPages, setPdfPages] = useState<number[]>([]);
  const [pdfReady, setPdfReady] = useState(false);
  const [pdfText, setPdfText] = useState<Record<number, PdfText[]>>({});
  const [marks, setMarks] = useState<Record<string, Mark[]>>({});
  const [slides, setSlides] = useState<Slide[]>([]);
  const [docxHtml, setDocxHtml] = useState('');

  const fileInput = useRef<HTMLInputElement>(null);
  const pdfRoot = useRef<HTMLDivElement>(null);
  const pdfDoc = useRef<any>(null);
  const markId = useRef(0);
  const speechQueue = useRef<string[]>([]);
  const speechIndex = useRef(0);

  useEffect(() => () => {
    if (selected?.url) URL.revokeObjectURL(selected.url);
    window.speechSynthesis?.cancel();
  }, [selected?.url]);

  const clearReader = () => {
    if (selected?.url) URL.revokeObjectURL(selected.url);
    stopSpeaking();
    setSelected(null);
    setText('');
    setDocxHtml('');
    setSlides([]);
    setPdfPages([]);
    setPdfText({});
    setPdfReady(false);
    setMarks({});
    setStatus('');
    setTool(null);
    pdfDoc.current = null;
  };

  const renderPdf = async (file: File) => {
    const pdfjs: any = await import('pdfjs-dist/legacy/build/pdf.mjs');
    const pdf = await pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()) }).promise;
    pdfDoc.current = pdf;
    setPdfPages(Array.from({ length: pdf.numPages }, (_, i) => i + 1));
    setPdfReady(true);

    const extracted: string[] = [];
    const textPages: Record<number, PdfText[]> = {};
    for (let i = 1; i <= pdf.numPages; i += 1) {
      const page = await pdf.getPage(i);
      const viewport = page.getViewport({ scale: 1 });
      const content = await page.getTextContent();
      const items: PdfText[] = [];
      const pageText: string[] = [];

      for (const item of content.items as any[]) {
        if (!('str' in item) || !item.str) continue;
        const tx = pdfjs.Util.transform(viewport.transform, item.transform);
        const fontSize = Math.max(6, Math.hypot(tx[2], tx[3]));
        items.push({
          str: item.str,
          left: (tx[4] / viewport.width) * 100,
          top: ((tx[5] - fontSize) / viewport.height) * 100,
          width: Math.max(0.2, (item.width / viewport.width) * 100),
          height: Math.max(0.4, (fontSize * 1.25 / viewport.height) * 100),
          rotate: Math.atan2(tx[1], tx[0]) * 180 / Math.PI,
        });
        pageText.push(item.str);
      }
      textPages[i] = items;
      extracted.push(pageText.join(' '));
    }

    setPdfText(textPages);
    setText(extracted.join('\n\n').replace(/\s+/g, ' ').trim());
    setStatus(`PDF ready — ${pdf.numPages} page${pdf.numPages === 1 ? '' : 's'}. Select text, then press highlight.`);
  };

  const loadDocx = async (file: File) => {
    const mammoth = await import('mammoth');
    const result = await mammoth.convertToHtml({ arrayBuffer: await file.arrayBuffer() });
    const html = result.value || '<p>No readable document content.</p>';
    setDocxHtml(html);
    setText(html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim());
    setStatus('Word document opened. Select text and press highlight, or choose annotate and click the page.');
  };

  const loadPptx = async (file: File) => {
    const JSZip = (await import('jszip')).default;
    const zip = await JSZip.loadAsync(await file.arrayBuffer());
    const slideNames = Object.keys(zip.files)
      .filter(name => /^ppt\/slides\/slide\d+\.xml$/.test(name))
      .sort((a, b) => Number(a.match(/slide(\d+)/)?.[1] || 0) - Number(b.match(/slide(\d+)/)?.[1] || 0));
    const nextSlides: Slide[] = [];

    for (let index = 0; index < slideNames.length; index += 1) {
      const xml = await zip.files[slideNames[index]].async('text');
      const doc = new DOMParser().parseFromString(xml, 'application/xml');
      const paragraphs = Array.from(doc.getElementsByTagName('a:p'))
        .map(p => Array.from(p.getElementsByTagName('a:t')).map(t => t.textContent || '').join(''))
        .filter(Boolean);
      const body = paragraphs.length
        ? paragraphs.map(p => `<p>${escapeHtml(p)}</p>`).join('')
        : '<p class="empty-slide">This slide contains visual elements that are not extractable in the browser preview.</p>';
      nextSlides.push({ id: index + 1, html: body });
    }

    setSlides(nextSlides);
    setText(nextSlides.map(s => s.html.replace(/<[^>]+>/g, ' ')).join('\n').replace(/\s+/g, ' ').trim());
    setStatus(`${nextSlides.length} slide${nextSlides.length === 1 ? '' : 's'} opened. Select text and press highlight, or use annotate on a slide.`);
  };

  const loadFile = async (file: File) => {
    if (selected?.url) URL.revokeObjectURL(selected.url);
    setSelected({ file, url: URL.createObjectURL(file) });
    setText('');
    setDocxHtml('');
    setSlides([]);
    setPdfPages([]);
    setPdfText({});
    setPdfReady(false);
    setMarks({});
    setStatus('opening your document…');
    setBusy(true);
    setTool(null);

    try {
      const ext = file.name.split('.').pop()?.toLowerCase();
      if (ext === 'pdf') await renderPdf(file);
      else if (ext === 'docx') await loadDocx(file);
      else if (ext === 'pptx') await loadPptx(file);
      else if (ext === 'txt') {
        const value = await file.text();
        setText(value);
        setStatus('Text file loaded.');
      } else throw new Error('unsupported');
    } catch (error) {
      console.error(error);
      setStatus('This file could not be rendered in the browser. Try PDF, DOCX, or PPTX.');
    } finally {
      setBusy(false);
    }
  };

  const renderPdfPage = async (pageNumber: number, canvas: HTMLCanvasElement) => {
    if (!pdfDoc.current) return;
    const page = await pdfDoc.current.getPage(pageNumber);
    const rootWidth = pdfRoot.current?.clientWidth || 980;
    const targetWidth = Math.min(1060, Math.max(720, rootWidth - 30));
    const base = page.getViewport({ scale: 1 });
    const viewport = page.getViewport({ scale: targetWidth / base.width });
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
    const render = () => document.querySelectorAll<HTMLCanvasElement>('[data-pdf-page]').forEach(canvas => void renderPdfPage(Number(canvas.dataset.pdfPage), canvas));
    render();
    window.addEventListener('resize', render);
    return () => window.removeEventListener('resize', render);
  }, [pdfReady, pdfPages]);

  const addHighlightFromSelection = () => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
      setStatus('Select some text in the document first, then press highlight.');
      return;
    }

    const range = selection.getRangeAt(0);
    const rects = Array.from(range.getClientRects()).filter(rect => rect.width > 1 && rect.height > 1);
    if (!rects.length) return;

    const additions: Record<string, Mark[]> = {};
    for (const rect of rects) {
      const point = document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2) as HTMLElement | null;
      const page = point?.closest<HTMLElement>('[data-reader-page]');
      if (!page) continue;
      const pageRect = page.getBoundingClientRect();
      const key = page.dataset.readerPage || 'document';
      const mark: Mark = {
        id: ++markId.current,
        type: 'highlight',
        x: ((rect.left - pageRect.left) / pageRect.width) * 100,
        y: ((rect.top - pageRect.top) / pageRect.height) * 100,
        w: (rect.width / pageRect.width) * 100,
        h: (rect.height / pageRect.height) * 100,
      };
      additions[key] = [...(additions[key] || []), mark];
    }

    if (Object.keys(additions).length) {
      setMarks(previous => {
        const merged = { ...previous };
        for (const [key, values] of Object.entries(additions)) merged[key] = [...(merged[key] || []), ...values];
        return merged;
      });
      setStatus('Highlighted selected text.');
    }
    selection.removeAllRanges();
  };

  const addAnnotationAt = (key: string, event: MouseEvent<HTMLElement>) => {
    if (tool !== 'annotate') return;
    const page = event.currentTarget;
    const rect = page.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    const note = window.prompt('Write your annotation:');
    if (!note?.trim()) return;
    setMarks(previous => ({
      ...previous,
      [key]: [...(previous[key] || []), { id: ++markId.current, type: 'note', x, y, w: 5, h: 5, text: note.trim() }],
    }));
  };

  const speakNext = () => {
    const chunk = speechQueue.current[speechIndex.current];
    if (!chunk) {
      setSpeaking(false);
      return;
    }
    const utterance = new SpeechSynthesisUtterance(chunk);
    utterance.onend = () => {
      speechIndex.current += 1;
      speakNext();
    };
    utterance.onerror = () => setSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  const speak = () => {
    const value = text.trim();
    if (!value || !window.speechSynthesis) {
      setStatus('There is no readable text to speak in this document.');
      return;
    }
    window.speechSynthesis.cancel();
    speechQueue.current = value.match(/.{1,2600}(?:\s+|$)/g) || [value];
    speechIndex.current = 0;
    setSpeaking(true);
    speakNext();
  };

  const stopSpeaking = () => {
    window.speechSynthesis?.cancel();
    speechQueue.current = [];
    speechIndex.current = 0;
    setSpeaking(false);
  };

  const activateTool = (next: Tool) => {
    setTool(next);
    if (next === 'highlight') addHighlightFromSelection();
    if (next === 'speech') speaking ? stopSpeaking() : speak();
  };

  const marksFor = (key: string) => marks[key] || [];

  return (
    <SiteChrome>
      <main className="reader-page">
        <button className="reader-back" type="button" onClick={() => window.history.back()}>← back</button>
        <section className="reader-shell">
          <aside className="reader-sidebar" aria-label="Document tools">
            <p className="reader-side-label">TOOLS</p>
            <button type="button" className="reader-side-upload" onClick={() => fileInput.current?.click()}><span>＋</span> upload file</button>
            <button type="button" className={tool === 'highlight' ? 'reader-tool active' : 'reader-tool'} onClick={() => activateTool('highlight')}>▰ <span>highlight</span></button>
            <button type="button" className={tool === 'annotate' ? 'reader-tool active' : 'reader-tool'} onClick={() => setTool('annotate')}>✎ <span>annotate</span></button>
            <button type="button" className={tool === 'speech' ? 'reader-tool active' : 'reader-tool'} onClick={() => activateTool('speech')}>{speaking ? '■' : '▶'} <span>{speaking ? 'stop speech' : 'text to speech'}</span></button>
          </aside>

          <div className="reader-main">
            <div className="reader-card">
              <div className="reader-heading-row"><div><p className="kicker">study reader</p><h1>upload & annotate</h1><p className="sub">Open the actual document, make it large, and use the tools directly on it.</p></div>{selected && <button className="reader-close" type="button" onClick={clearReader}>clear</button>}</div>
              <input ref={fileInput} className="reader-hidden-input" type="file" accept={`.pdf,.docx,.pptx,.txt,application/pdf,${DOCX},${PPTX},text/plain`} onChange={event => { const file = event.target.files?.[0]; if (file) void loadFile(file); event.currentTarget.value = ''; }} />
              {!selected ? <button type="button" className="reader-file-box" onClick={() => fileInput.current?.click()}><span className="reader-upload-icon">↑</span><strong>{busy ? 'opening…' : 'choose your file'}</strong><small>PDF · Word · PowerPoint · text</small><em>browse files</em></button> : <div className="reader-file-selected"><div><strong>{selected.file.name}</strong><span>{Math.max(1, Math.round(selected.file.size / 1024))} KB</span></div><button type="button" onClick={() => fileInput.current?.click()}>choose another</button></div>}
              {status && <p className="reader-status">{status}</p>}

              {selected?.file.name.toLowerCase().endsWith('.pdf') && pdfReady && <div className="pdf-viewer" ref={pdfRoot}><div className="viewer-tip">Select text normally, then press highlight. Choose annotate and click anywhere on the document to attach a note. Text-to-speech reads the whole document.</div>{pdfPages.map(page => <div key={page} className="document-page-wrap"><div className="page-label">page {page}</div><div className="document-page pdf-page" data-reader-page={`pdf-${page}`} onClick={e => addAnnotationAt(`pdf-${page}`, e)}><canvas data-pdf-page={page} /><div className="pdf-text-layer" aria-label={`page ${page} text`}>{pdfText[page]?.map((item, index) => <span key={`${page}-${index}`} style={{ left: `${item.left}%`, top: `${item.top}%`, width: `${item.width}%`, height: `${item.height}%`, transform: `rotate(${item.rotate}deg)` }}>{item.str}</span>)}</div><MarkLayer marks={marksFor(`pdf-${page}`)} /></div></div>)}</div>}

              {selected?.file.name.toLowerCase().endsWith('.docx') && docxHtml && <div className="docx-viewer"><div className="viewer-tip">Select text, then press highlight. Choose annotate and click the page. Text-to-speech reads the entire document.</div><div className="document-page docx-page" data-reader-page="docx" onClick={e => addAnnotationAt('docx', e)}><article className="docx-content"><div dangerouslySetInnerHTML={{ __html: docxHtml }} /></article><MarkLayer marks={marksFor('docx')} /></div></div>}

              {selected?.file.name.toLowerCase().endsWith('.pptx') && slides.length > 0 && <div className="pptx-viewer"><div className="viewer-tip">Select text, then press highlight. Choose annotate and click a slide. Text-to-speech reads all slide text.</div>{slides.map(slide => <div key={slide.id} className="slide-wrap"><div className="page-label">slide {slide.id}</div><div className="ppt-slide" data-reader-page={`slide-${slide.id}`} onClick={e => addAnnotationAt(`slide-${slide.id}`, e)}><article className="slide-content" dangerouslySetInnerHTML={{ __html: slide.html }} /><MarkLayer marks={marksFor(`slide-${slide.id}`)} /></div></div>)}</div>}

              {selected?.file.name.toLowerCase().endsWith('.txt') && <div className="document-page text-page" data-reader-page="text" onClick={e => addAnnotationAt('text', e)}><article className="text-content">{text}</article><MarkLayer marks={marksFor('text')} /></div>}
            </div>
          </div>
        </section>
      </main>
      <style jsx>{`
        .reader-page{width:min(1420px,100%);margin:0 auto;padding:8px 12px 48px;box-sizing:border-box}.reader-back,.reader-close{border:1px solid var(--line,#ddd);background:var(--glass,rgba(255,255,255,.8));color:var(--page-text,#111);border-radius:999px;padding:8px 13px;font:inherit;font-size:12px;cursor:pointer}.reader-back{margin-bottom:14px}.reader-shell{display:grid;grid-template-columns:170px minmax(0,1fr);gap:18px;align-items:start}.reader-sidebar{position:sticky;top:90px;border:1px solid rgba(0,0,0,.1);border-radius:20px;padding:12px;background:rgba(255,255,255,.8);backdrop-filter:blur(14px);display:flex;flex-direction:column;gap:7px}.stuko-dark .reader-sidebar{background:rgba(0,0,0,.78);border-color:rgba(255,255,255,.14);color:#fff}.reader-side-label{font:10px/1.2 'Courier New',monospace;letter-spacing:.16em;opacity:.5;margin:3px 7px 7px}.reader-side-upload,.reader-tool{border:0;background:transparent;color:inherit;border-radius:12px;padding:10px 9px;text-align:left;cursor:pointer;font:inherit;font-size:12px;display:flex;gap:8px;align-items:center}.reader-side-upload{background:rgba(0,0,0,.06)}.stuko-dark .reader-side-upload{background:rgba(255,255,255,.08)}.reader-tool.active{background:rgba(0,0,0,.1);font-weight:600}.stuko-dark .reader-tool.active{background:rgba(255,255,255,.12)}.reader-main{min-width:0}.reader-card{border-radius:26px;padding:25px;background:rgba(255,255,255,.96);border:1px solid rgba(0,0,0,.1);box-shadow:0 18px 70px rgba(0,0,0,.08)}.stuko-dark .reader-card{background:rgba(0,0,0,.86);border-color:rgba(255,255,255,.13);color:#fff}.reader-heading-row{display:flex;justify-content:space-between;gap:20px;align-items:flex-start}.kicker{font:11px/1.2 'Courier New',monospace;letter-spacing:.14em;text-transform:uppercase;opacity:.55;margin:0 0 8px}.reader-heading-row h1{font-size:clamp(36px,5vw,64px);font-weight:400;letter-spacing:-.055em;line-height:.98;margin:0}.sub{margin:12px 0 25px;opacity:.65}.reader-hidden-input{display:none}.reader-file-box{width:100%;min-height:180px;border:1px dashed rgba(0,0,0,.25);border-radius:20px;background:rgba(0,0,0,.025);color:inherit;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;cursor:pointer}.stuko-dark .reader-file-box{border-color:rgba(255,255,255,.24);background:rgba(255,255,255,.035)}.reader-upload-icon{font-size:30px}.reader-file-box strong{font-size:18px}.reader-file-box small{opacity:.55}.reader-file-box em{font-style:normal;font-size:12px;opacity:.5}.reader-file-selected{display:flex;justify-content:space-between;gap:15px;align-items:center;padding:12px 15px;border:1px solid rgba(0,0,0,.1);border-radius:14px}.stuko-dark .reader-file-selected{border-color:rgba(255,255,255,.14)}.reader-file-selected div{display:flex;flex-direction:column;min-width:0}.reader-file-selected strong{overflow-wrap:anywhere}.reader-file-selected span{font-size:11px;opacity:.5}.reader-file-selected button{border:0;background:transparent;color:inherit;text-decoration:underline;cursor:pointer}.reader-status{font-size:12px;opacity:.65;margin:12px 2px}.viewer-tip{padding:10px 12px;border-radius:12px;background:rgba(0,0,0,.045);font-size:12px;opacity:.7;margin:10px 0 16px}.stuko-dark .viewer-tip{background:rgba(255,255,255,.07)}.document-page-wrap,.slide-wrap{margin:0 auto 28px;width:max-content;max-width:100%}.page-label{font:10px/1.2 'Courier New',monospace;text-transform:uppercase;letter-spacing:.12em;opacity:.45;margin:0 0 7px}.document-page,.ppt-slide{position:relative;background:#fff;color:#111;box-shadow:0 12px 35px rgba(0,0,0,.14);overflow:hidden}.pdf-page{display:inline-block;line-height:0}.pdf-page canvas{display:block;max-width:100%}.pdf-text-layer{position:absolute;inset:0;overflow:hidden;color:transparent;user-select:text;cursor:text}.pdf-text-layer span{position:absolute;display:block;white-space:pre;color:transparent;transform-origin:0 0;line-height:1;user-select:text}.pdf-text-layer span::selection,.docx-content ::selection,.slide-content ::selection,.text-content ::selection{background:rgba(40,110,255,.28);color:inherit}.docx-page{width:min(920px,100%);min-height:1100px;padding:70px;box-sizing:border-box}.docx-content{font-family:Arial,sans-serif;font-size:16px;line-height:1.6;user-select:text}.ppt-slide{width:min(1050px,100%);min-height:590px;padding:70px;box-sizing:border-box;border-radius:5px}.slide-content{font-size:22px;line-height:1.55;user-select:text}.slide-content p{margin:0 0 20px}.empty-slide{opacity:.5}.text-page{width:min(920px,100%);min-height:600px;padding:50px;box-sizing:border-box}.text-content{white-space:pre-wrap;font-size:17px;line-height:1.7;user-select:text}.mark-layer{position:absolute;inset:0;pointer-events:none}.reader-mark{position:absolute;pointer-events:none}.reader-highlight{background:rgba(255,229,65,.52);border-radius:2px}.stuko-dark .reader-highlight{background:rgba(255,215,0,.4)}.reader-note{width:26px!important;height:26px!important;border-radius:50%;background:#ffd84d;color:#111;box-shadow:0 2px 8px rgba(0,0,0,.22);pointer-events:auto;cursor:help}.reader-note::after{content:'✎';display:grid;place-items:center;width:100%;height:100%;font-size:13px}.reader-note span{display:none}.reader-note:hover span{display:block;position:absolute;left:30px;top:0;width:220px;padding:9px;border-radius:10px;background:#111;color:#fff;font-size:12px;line-height:1.4;z-index:20}.stuko-dark .reader-note:hover span{background:#fff;color:#111}@media(max-width:800px){.reader-shell{grid-template-columns:1fr}.reader-sidebar{position:sticky;top:70px;z-index:5;display:grid;grid-template-columns:repeat(4,1fr)}.reader-side-label{grid-column:1/-1}.reader-side-upload{justify-content:center}.reader-tool{justify-content:center}.reader-tool span,.reader-side-upload:not(:has(span)){font-size:0}.docx-page{padding:35px}.ppt-slide{padding:35px;min-height:450px}.reader-card{padding:17px}}
      `}</style>
    </SiteChrome>
  );
}

function MarkLayer({ marks }: { marks: Mark[] }) {
  return <div className="mark-layer">{marks.map(mark => mark.type === 'note' ? <div key={mark.id} className="reader-mark reader-note" style={{ left: `${mark.x}%`, top: `${mark.y}%` }}><span>{mark.text}</span></div> : <div key={mark.id} className="reader-mark reader-highlight" style={{ left: `${mark.x}%`, top: `${mark.y}%`, width: `${mark.w}%`, height: `${mark.h}%` }} />)}</div>;
}

function escapeHtml(value: string) {
  return value.replace(/[&<>'\"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char] || char));
}
