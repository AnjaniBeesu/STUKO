'use client';

import styles from './ShapeLoader.module.css';

type ShapeLoaderProps = {
  showAll?: boolean;
};

export default function ShapeLoader({ showAll = true }: ShapeLoaderProps) {
  const loaders = (
    <>
      <div className={styles.loader} aria-label="Loading">
        <svg viewBox="0 0 80 80" aria-hidden="true">
          <circle r="32" cy="40" cx="40" />
        </svg>
      </div>

      <div className={`${styles.loader} ${styles.triangle}`} aria-label="Loading">
        <svg viewBox="0 0 86 80" aria-hidden="true">
          <polygon points="43 8 79 72 7 72" />
        </svg>
      </div>

      <div className={styles.loader} aria-label="Loading">
        <svg viewBox="0 0 80 80" aria-hidden="true">
          <rect height="64" width="64" y="8" x="8" />
        </svg>
      </div>
    </>
  );

  return (
    <div className={styles.loaderGroup} role="status" aria-live="polite">
      {showAll ? loaders : (
        <div className={styles.loader} aria-label="Loading">
          <svg viewBox="0 0 80 80" aria-hidden="true">
            <circle r="32" cy="40" cx="40" />
          </svg>
        </div>
      )}
      <span className={styles.srOnly}>Loading…</span>
    </div>
  );
}
