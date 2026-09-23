'use client';

import { useEffect, useState } from 'react';
import styles from './InitialLoader.module.css';

export default function InitialLoader() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const started = performance.now();
    const minimum = 1100;
    const remaining = Math.max(0, minimum - (performance.now() - started));

    const timer = window.setTimeout(() => setVisible(false), remaining);
    return () => window.clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div className={styles.screen} role="status" aria-label="Loading STUKO">
      <div className={styles.loaders} aria-hidden="true">
        <div className={styles.loader}>
          <svg viewBox="0 0 80 80"><circle r="32" cy="40" cx="40" /></svg>
        </div>

        <div className={`${styles.loader} ${styles.triangle}`}>
          <svg viewBox="0 0 86 80"><polygon points="43 8 79 72 7 72" /></svg>
        </div>

        <div className={styles.loader}>
          <svg viewBox="0 0 80 80"><rect height="64" width="64" y="8" x="8" /></svg>
        </div>
      </div>
      <span className={styles.srOnly}>Loading...</span>
    </div>
  );
}
