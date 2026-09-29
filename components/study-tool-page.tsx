'use client';

import SiteChrome from '@/app/components/SiteChrome';

export default function StudyToolPage({ title, description }: { title: string; description: string }) {
  return (
    <SiteChrome>
      <section className="tool-content">
        <p className="tool-kicker">STUKO</p>
        <h1>{title}</h1>
        <p>{description}</p>
      </section>
      <style jsx global>{`
        .tool-content {
          min-height: calc(100svh - 140px);
          box-sizing: border-box;
          padding: 150px 24px 90px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
        }
        .tool-kicker { margin: 0 0 22px; font-family: 'Courier New', monospace; font-size: 13px; letter-spacing: .18em; }
        .tool-content h1 { margin: 0; max-width: 900px; font-size: clamp(52px, 8vw, 94px); font-weight: 400; line-height: .98; letter-spacing: -.06em; }
        .tool-content > p:last-child { max-width: 650px; margin: 28px 0 0; font-size: 20px; line-height: 1.35; }
        @media (max-width: 600px) {
          .tool-content { min-height: calc(100svh - 120px); padding: 130px 20px 80px; }
          .tool-content h1 { font-size: clamp(46px, 13vw, 70px); }
          .tool-content > p:last-child { font-size: 17px; }
        }
      `}</style>
    </SiteChrome>
  );
}
