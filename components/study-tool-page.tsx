'use client';

import Link from 'next/link';

export default function StudyToolPage({ title, description }: { title: string; description: string }) {
  return (
    <main className="tool-page">
      <div className="tool-clouds" aria-hidden="true" />
      <header className="tool-header">
        <Link href="/" className="tool-brand"><span aria-hidden="true">✦</span> STUKO</Link>
        <Link href="/" className="tool-back">← home</Link>
      </header>

      <section className="tool-content">
        <p className="tool-kicker">STUKO</p>
        <h1>{title}</h1>
        <p>{description}</p>
      </section>

      <footer className="tool-footer">
        <Link href="/privacy">privacy policy</Link>
        <Link href="/terms">terms and conditions</Link>
        <Link href="/cookies">cookie policy</Link>
      </footer>

      <style jsx global>{`
        html, body { margin: 0; padding: 0; min-height: 100%; width: 100%; }
        body { overflow-x: hidden; }
        .tool-page { position: relative; min-height: 100svh; width: 100%; overflow: hidden; isolation: isolate; color: #090909; background: #fff; font-family: Georgia, 'Times New Roman', serif; }
        .tool-clouds { position: fixed; inset: 0; z-index: 0; pointer-events: none; background: url('/clouds.png') center / cover no-repeat; opacity: .30; }
        .tool-header, .tool-footer { position: fixed; z-index: 5; left: 0; right: 0; width: 100%; box-sizing: border-box; background: rgba(255,255,255,.85); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); }
        .tool-header { top: 0; min-height: 78px; padding: 0 42px; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid rgba(0,0,0,.08); }
        .tool-brand, .tool-back { color: #090909; text-decoration: none; }
        .tool-brand { display: inline-flex; align-items: center; gap: 9px; font-size: 24px; letter-spacing: -.045em; }
        .tool-brand span { font-size: 23px; }
        .tool-back { font-size: 15px; }
        .tool-content { position: relative; z-index: 1; min-height: 100svh; box-sizing: border-box; padding: 180px 24px 130px; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; }
        .tool-kicker { margin: 0 0 22px; font-family: 'Courier New', monospace; font-size: 13px; letter-spacing: .18em; }
        .tool-content h1 { margin: 0; max-width: 900px; font-size: clamp(52px, 8vw, 94px); font-weight: 400; line-height: .98; letter-spacing: -.06em; }
        .tool-content > p:last-child { max-width: 650px; margin: 28px 0 0; font-size: 20px; line-height: 1.35; }
        .tool-footer { bottom: 0; min-height: 64px; padding: 0 42px; display: flex; align-items: center; justify-content: center; gap: 30px; border-top: 1px solid rgba(0,0,0,.08); }
        .tool-footer a { color: #090909; text-decoration: none; font-size: 13px; }
        .tool-footer a:hover { text-decoration: underline; text-underline-offset: 3px; }
        @media (max-width: 600px) {
          .tool-header { min-height: 68px; padding: 0 20px; }
          .tool-brand { font-size: 20px; }
          .tool-brand span { font-size: 20px; }
          .tool-content { padding: 140px 20px 120px; }
          .tool-content h1 { font-size: clamp(46px, 13vw, 70px); }
          .tool-content > p:last-child { font-size: 17px; }
          .tool-footer { min-height: 58px; padding: 0 16px; gap: 16px; flex-wrap: wrap; }
          .tool-footer a { font-size: 11px; }
        }
      `}</style>
    </main>
  );
}
