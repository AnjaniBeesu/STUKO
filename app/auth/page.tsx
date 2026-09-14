'use client';

import { useEffect, useState } from 'react';
import { onAuthStateChanged, signInWithPopup } from 'firebase/auth';
import { firebaseConfigured, getFirebase, googleProvider } from '../../lib/firebase';
import { useRouter } from 'next/navigation';
import styles from './auth.module.css';

export default function AuthPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!firebaseConfigured()) return;
    const { auth } = getFirebase();
    return onAuthStateChanged(auth, user => {
      if (user) router.replace('/onboarding');
    });
  }, [router]);

  async function continueWithGoogle() {
    setError(''); setLoading(true);
    try {
      const { auth } = getFirebase();
      await signInWithPopup(auth, googleProvider());
      router.replace('/onboarding');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Google sign-in failed.');
    } finally { setLoading(false); }
  }

  return <main className={styles.page}>
    <div className={styles.card}>
      <div className={styles.logo}><span>S</span> STUKO</div>
      <div className={styles.spark}>✦</div>
      <h1>Your study universe<br />starts here.</h1>
      <p className={styles.sub}>Study around what you love, not around a template.</p>
      <button className={styles.google} onClick={continueWithGoogle} disabled={loading || !firebaseConfigured()}>
        <span className={styles.g}>G</span>{loading ? 'Opening Google…' : 'Continue with Google'}
      </button>
      {!firebaseConfigured() && <p className={styles.setup}>Google sign-in is ready in the code. Add the Firebase environment variables in Vercel to activate it.</p>}
      {error && <p className={styles.error}>{error}</p>}
      <p className={styles.terms}>By continuing, you agree to make studying slightly less boring.</p>
    </div>
  </main>;
}
