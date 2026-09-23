'use client';

import styles from './loading.module.css';

export default function Loading() {
  return (
    <main className={styles.screen} aria-label="Loading STUKO">
      <div className={styles.loaders} role="status" aria-live="polite">
        <div className={styles.loader}>
          <svg viewBox="0 0 80 80" aria-hidden="true">
            <circle r="32" cy="40" cx="40" />
          </svg>
        </div>

        <div className={`${styles.loader} ${styles.triangle}`}>
          <svg viewBox="0 0 86 80" aria-hidden="true">
            <polygon points="43 8 79 72 7 72" />
          </svg>
        </div>

        <div className={styles.loader}>
          <svg viewBox="0 0 80 80" aria-hidden="true">
            <rect height="64" width="64" y="8" x="8" />
          </svg>
        </div>
        <span className={styles.srOnly}>Loading...</span>
      </div>
    </main>
  );
}
