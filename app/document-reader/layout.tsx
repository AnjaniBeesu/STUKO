import type { ReactNode } from 'react';

export default function DocumentReaderLayout({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <style>{`
        /* Study Reader: keep only Upload, Highlight, Annotate and Text to Speech. */
        .reader-sidebar > button:nth-of-type(2),
        .reader-sidebar > button:nth-of-type(4),
        .reader-sidebar > button:nth-of-type(6) {
          display: none !important;
        }
      `}</style>
    </>
  );
}
