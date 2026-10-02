'use client';

import Link from 'next/link';
import SiteChrome from '@/app/components/SiteChrome';

export default function AttendancePage() {
  return (
    <SiteChrome>
      <main className="blank-tool-page">
        <Link href="/" className="back-link">← back</Link>
        <section className="blank-tool-card">
          <p className="tool-kicker">STUKO / attendance</p>
          <h1>attendance calculator + tracker</h1>
          <p>How many classes can I skip and stay above 75%?</p>
          <div className="blank-tool-placeholder">calculator coming soon</div>
        </section>
      </main>
      <style jsx global>{` .blank-tool-page{min-height:100svh;padding:150px 24px 120px;box-sizing:border-box}.back-link{color:var(--page-text);text-decoration:none}.blank-tool-card{max-width:850px;margin:80px auto;padding:48px;border-radius:24px;background:rgba(255,255,255,.92);color:#111}.tool-kicker{font:14px 'Courier New',monospace;letter-spacing:.14em}.blank-tool-card h1{font-size:clamp(42px,6vw,76px);font-weight:400;line-height:1}.blank-tool-card p{font-size:20px}.blank-tool-placeholder{margin-top:35px;padding:60px 20px;border:1px dashed #999;text-align:center;color:#666}.stuko-dark .blank-tool-card{background:rgba(20,20,20,.94);color:#fff}.stuko-dark .blank-tool-placeholder{color:#bbb;border-color:#777}`}</style>
    </SiteChrome>
  );
}
