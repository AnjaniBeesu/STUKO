'use client';

import { useMemo, useState } from 'react';
import SiteChrome from '@/app/components/SiteChrome';

type ToolKind = 'flashcards' | 'quiz' | 'summary';
type Card = { question: string; answer: string };
type QuizQuestion = { question: string; options: string[]; answer: string };

export default function StudyToolPage({ title, description }: { title: string; description: string }) {
  const kind: ToolKind = title.toLowerCase().includes('flashcard') ? 'flashcards' : title.toLowerCase().includes('quiz') ? 'quiz' : 'summary';
  const [fileName, setFileName] = useState('');
  const [sourceText, setSourceText] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [cards, setCards] = useState<Card[]>([]);
  const [quiz, setQuiz] = useState<QuizQuestion[]>([]);
  const [summary, setSummary] = useState('');
  const [showAnswer, setShowAnswer] = useState<Record<number, boolean>>({});

  const sourceStats = useMemo(() => sourceText ? {
    words: sourceText.trim().split(/\s+/).filter(Boolean).length,
    sentences: splitSentences(sourceText).length,
  } : null, [sourceText]);

  const reset = () => { setFileName(''); setSourceText(''); setError(''); setCards([]); setQuiz([]); setSummary(''); setShowAnswer({}); };

  const generate = (text: string) => {
    if (kind === 'flashcards') setCards(makeCards(text));
    if (kind === 'quiz') setQuiz(makeQuiz(text));
    if (kind === 'summary') setSummary(makeSummary(text));
  };

  const handlePdf = async (file: File) => {
    setBusy(true); setError(''); setCards([]); setQuiz([]); setSummary('');
    try {
      if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) throw new Error('Please upload a PDF file.');
      const pdfjs: typeof import('pdfjs-dist/legacy/build/pdf.mjs') = await import('pdfjs-dist/legacy/build/pdf.mjs');
      // Keep the browser worker exactly aligned with the pinned pdfjs-dist package version.
      pdfjs.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/5.7.284/pdf.worker.min.mjs';
      const pdf = await pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()) }).promise;
      const pages: string[] = [];
      for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
        const page = await pdf.getPage(pageNumber);
        const content = await page.getTextContent();
        const pageText = content.items.map((item: any) => 'str' in item ? item.str : '').join(' ');
        if (pageText.trim()) pages.push(pageText.trim());
      }
      const text = pages.join(' ').replace(/\s+/g, ' ').trim();
      if (!text) throw new Error('This PDF has no readable text. Image-only/scanned PDFs need OCR first.');
      setFileName(file.name); setSourceText(text); generate(text);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not read this PDF.');
    } finally { setBusy(false); }
  };

  return (
    <SiteChrome>
      <section className="tool-page">
        <div className="tool-hero">
          <p className="tool-kicker">STUKO · {kind === 'summary' ? 'PDF SUMMARIZER' : kind.toUpperCase()}</p>
          <h1>{title}</h1>
          <p className="tool-description">{description}</p>
        </div>
        <div className="tool-workspace">
          <label className="dropzone">
            <input type="file" accept=".pdf,application/pdf" onChange={e => { const file = e.target.files?.[0]; if (file) void handlePdf(file); e.currentTarget.value = ''; }} />
            <span className="drop-icon">＋</span>
            <strong>{busy ? 'reading your PDF…' : 'drop a PDF here or choose a file'}</strong>
            <small>PDF → {kind === 'flashcards' ? 'study cards' : kind === 'quiz' ? 'practice questions' : 'revision summary'}</small>
          </label>
          {fileName && <div className="source-bar"><span><b>{fileName}</b>{sourceStats && <> · {sourceStats.words.toLocaleString()} words · {sourceStats.sentences} sentences</>}</span><button type="button" onClick={reset}>clear</button></div>}
          {error && <div className="tool-error">{error}</div>}

          {kind === 'flashcards' && cards.length > 0 && <div className="result-panel"><div className="result-heading"><div><span>generated from your PDF</span><h2>{cards.length} flashcards</h2></div><button onClick={() => generate(sourceText)}>regenerate</button></div><div className="cards-grid">{cards.map((card, i) => <button key={`${card.question}-${i}`} type="button" className="study-card" onClick={() => setShowAnswer(v => ({ ...v, [i]: !v[i] }))}><span className="card-number">{String(i + 1).padStart(2, '0')}</span><strong>{showAnswer[i] ? card.answer : card.question}</strong><small>{showAnswer[i] ? 'click to see question' : 'click to reveal answer'}</small></button>)}</div></div>}
          {kind === 'quiz' && quiz.length > 0 && <div className="result-panel"><div className="result-heading"><div><span>generated from your PDF</span><h2>{quiz.length} practice questions</h2></div><button onClick={() => generate(sourceText)}>regenerate</button></div><div className="quiz-list">{quiz.map((q, i) => <article className="quiz-item" key={`${q.question}-${i}`}><span className="card-number">Q{i + 1}</span><h3>{q.question}</h3><div className="quiz-options">{q.options.map(option => <button key={option} type="button" onClick={e => { e.currentTarget.dataset.correct = String(option === q.answer); }}>{option}</button>)}</div><small className="quiz-answer">Answer: {q.answer}</small></article>)}</div></div>}
          {kind === 'summary' && summary && <div className="result-panel"><div className="result-heading"><div><span>generated from your PDF</span><h2>revision summary</h2></div><button onClick={() => generate(sourceText)}>regenerate</button></div><div className="summary-text">{summary.split(/(?<=[.!?])\s+/).map((sentence, i) => <p key={i}>{sentence}</p>)}</div></div>}
        </div>
      </section>
      <style jsx global>{`
        .tool-page{width:min(1180px,100% - 32px);margin:0 auto;padding:130px 0 100px;box-sizing:border-box}.tool-hero{text-align:center;max-width:900px;margin:0 auto 48px}.tool-kicker{margin:0 0 18px;font:12px/1.2 'Courier New',monospace;letter-spacing:.16em}.tool-hero h1{margin:0;font-size:clamp(54px,8vw,96px);font-weight:400;line-height:.96;letter-spacing:-.065em}.tool-description{margin:22px auto 0;max-width:680px;font-size:19px;line-height:1.4}.dropzone{min-height:230px;border:1px dashed rgba(20,20,20,.28);border-radius:24px;background:rgba(255,255,255,.78);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;text-align:center;cursor:pointer;transition:.2s ease;box-shadow:0 14px 40px rgba(0,0,0,.05)}.stuko-dark .dropzone{background:rgba(0,0,0,.68);border-color:rgba(255,255,255,.24);color:#fff}.dropzone:hover{transform:translateY(-2px);border-color:rgba(20,20,20,.55)}.dropzone input{display:none}.drop-icon{font-size:34px;line-height:1}.dropzone strong{font-size:20px;font-weight:500}.dropzone small{font-size:13px;opacity:.62}.source-bar{margin:14px 0;display:flex;justify-content:space-between;gap:14px;align-items:center;padding:13px 16px;border:1px solid var(--line,#ddd);border-radius:14px;background:rgba(255,255,255,.72)}.stuko-dark .source-bar{background:rgba(0,0,0,.62);color:#fff}.source-bar button,.result-heading button{border:1px solid var(--line,#ddd);background:transparent;color:inherit;border-radius:999px;padding:7px 12px;cursor:pointer}.tool-error{padding:15px 17px;border-radius:14px;background:rgba(160,30,30,.08);margin:14px 0}.result-panel{margin-top:22px;padding:24px;border-radius:24px;background:rgba(255,255,255,.86);border:1px solid rgba(0,0,0,.1);box-shadow:0 18px 55px rgba(0,0,0,.07)}.stuko-dark .result-panel{background:rgba(0,0,0,.72);border-color:rgba(255,255,255,.14);color:#fff}.result-heading{display:flex;align-items:flex-end;justify-content:space-between;gap:20px;margin-bottom:22px}.result-heading span{font:11px/1.2 'Courier New',monospace;letter-spacing:.12em;text-transform:uppercase;opacity:.58}.result-heading h2{margin:6px 0 0;font-size:32px;font-weight:450;letter-spacing:-.04em}.cards-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px}.study-card{min-height:180px;text-align:left;border:1px solid rgba(0,0,0,.12);border-radius:18px;background:rgba(255,255,255,.62);padding:20px;display:flex;flex-direction:column;justify-content:space-between;color:inherit;cursor:pointer}.stuko-dark .study-card{background:rgba(255,255,255,.06);border-color:rgba(255,255,255,.16)}.study-card:hover{transform:translateY(-2px)}.card-number{font:12px/1 'Courier New',monospace;opacity:.5}.study-card strong{font-size:18px;line-height:1.3;font-weight:500}.study-card small,.quiz-answer{opacity:.55}.quiz-list{display:grid;gap:16px}.quiz-item{padding:20px;border:1px solid rgba(0,0,0,.1);border-radius:18px}.stuko-dark .quiz-item{border-color:rgba(255,255,255,.14)}.quiz-item h3{margin:12px 0 15px;font-size:20px;font-weight:500}.quiz-options{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.quiz-options button{padding:11px 13px;border-radius:12px;border:1px solid rgba(0,0,0,.14);background:transparent;color:inherit;text-align:left;cursor:pointer}.quiz-options button[data-correct="true"]{border-color:#347a45;background:rgba(52,122,69,.12)}.summary-text{font-size:19px;line-height:1.7;max-width:850px}.summary-text p{margin:0 0 15px}.quiz-answer{display:block;margin-top:12px;font-size:12px}@media(max-width:760px){.tool-page{padding:110px 0 70px}.cards-grid{grid-template-columns:1fr}.quiz-options{grid-template-columns:1fr}.result-heading{align-items:flex-start}.source-bar{align-items:flex-start}.source-bar span{min-width:0;overflow-wrap:anywhere}}
      `}</style>
    </SiteChrome>
  );
}

function splitSentences(text: string) { return text.split(/(?<=[.!?])\s+/).map(s => s.trim()).filter(s => s.length > 25); }
function cleanSentence(sentence: string) { return sentence.replace(/\s+/g, ' ').trim(); }
function makeCards(text: string): Card[] {
  const sentences = splitSentences(text).map(cleanSentence).filter(s => s.length > 45);
  const unique: string[] = [];
  for (const sentence of sentences) if (!unique.some(x => x.slice(0, 45) === sentence.slice(0, 45))) unique.push(sentence);
  return unique.slice(0, 12).map((sentence, i) => ({ question: `What is the key idea in section ${i + 1}?`, answer: sentence }));
}
function makeQuiz(text: string): QuizQuestion[] {
  const sentences = splitSentences(text).map(cleanSentence).filter(s => s.length > 45).slice(0, 8);
  return sentences.map((sentence, i) => {
    const words = sentence.split(/\s+/);
    const answer = words[Math.min(4 + (i % 4), words.length - 1)].replace(/[^A-Za-z0-9-]/g, '') || 'key idea';
    const options = Array.from(new Set([answer, 'definition', 'example', 'process'])).slice(0, 4);
    return { question: `According to the material, which term appears in this key statement: “${sentence.slice(0, 115)}${sentence.length > 115 ? '…' : ''}”`, options, answer };
  });
}
function makeSummary(text: string) {
  const sentences = splitSentences(text).map(cleanSentence);
  if (!sentences.length) return text.slice(0, 1200);
  const scored = sentences.map((sentence, index) => ({ sentence, score: keywordScore(sentence) + (index < 4 ? 2 : 0), index }));
  return scored.sort((a, b) => b.score - a.score).slice(0, 8).sort((a, b) => a.index - b.index).map(x => x.sentence).join(' ');
}
function keywordScore(sentence: string) { const matches = sentence.match(/\b(definition|important|therefore|because|method|process|result|advantage|disadvantage|principle|theory|example|types?|steps?|key|called|means)\b/gi); return (matches?.length || 0) + Math.min(3, sentence.split(/\s+/).length / 35); }
