import SiteChrome from '@/app/components/SiteChrome';

export default function StudyRoomPage() {
  return (
    <SiteChrome>
      <main className="study-room-coming-soon">
        <p className="study-room-kicker">STUKO / STUDY ROOM</p>
        <h1>coming soon.</h1>
        <p>We&apos;re building the room. Bring your notes, your timer, and questionable amounts of caffeine.</p>
        <span>the study room will be here soon.</span>
      </main>
      <style jsx>{`
        .study-room-coming-soon { min-height:calc(100svh - 150px); display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; padding:120px 24px 100px; box-sizing:border-box; }
        .study-room-kicker { margin:0 0 22px; font-family:'Courier New',monospace; font-size:12px; letter-spacing:.18em; opacity:.6; }
        h1 { margin:0; font-size:clamp(64px,9vw,128px); font-weight:400; letter-spacing:-.075em; line-height:.9; }
        p:not(.study-room-kicker) { max-width:540px; margin:28px 0 0; font-size:18px; line-height:1.5; opacity:.72; }
        span { margin-top:26px; font-family:'Courier New',monospace; font-size:11px; letter-spacing:.08em; opacity:.5; }
      `}</style>
    </SiteChrome>
  );
}
