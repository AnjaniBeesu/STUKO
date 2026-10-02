import SiteChrome from '@/app/components/SiteChrome';
import styles from './study-room.module.css';

export default function StudyRoomPage() {
  return (
    <SiteChrome>
      <main className={styles.comingSoon}>
        <p className={styles.kicker}>STUKO / STUDY ROOM</p>
        <h1 className={styles.title}>coming soon.</h1>
        <p className={styles.description}>
          We&apos;re building the room. Bring your notes, your timer, and questionable amounts of caffeine.
        </p>
        <span className={styles.note}>the study room will be here soon.</span>
      </main>
    </SiteChrome>
  );
}
