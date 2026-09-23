'use client';

import { useEffect, useState } from 'react';
import { deleteDoc, doc, getDoc, runTransaction, serverTimestamp } from 'firebase/firestore';
import { deleteUser, onAuthStateChanged, reauthenticateWithPopup, signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { firebaseConfigured, getFirebase, googleProvider } from '../../lib/firebase';
import styles from './settings.module.css';

type Profile = { username: string; displayName: string; usernameChangedAt?: { seconds?: number } | null };

const YEAR_MS = 365 * 24 * 60 * 60 * 1000;

export default function SettingsPage() {
  const router = useRouter();
  const [uid, setUid] = useState('');
  const [profile, setProfile] = useState<Profile>({ username: '', displayName: '' });
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [dangerOpen, setDangerOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!firebaseConfigured()) { setMessage('Firebase is not configured yet.'); setLoading(false); return; }
    const { auth, db } = getFirebase();
    return onAuthStateChanged(auth, async user => {
      if (!user) { router.replace('/auth'); return; }
      setUid(user.uid);
      const snap = await getDoc(doc(db, 'users', user.uid));
      if (!snap.exists() || !snap.data().username) { router.replace('/onboarding'); return; }
      const data = snap.data() as Profile;
      setProfile(data);
      setUsername(data.username || '');
      setDisplayName(data.displayName || '');
      setLoading(false);
    });
  }, [router]);

  const changedAt = profile.usernameChangedAt?.seconds ? profile.usernameChangedAt.seconds * 1000 : 0;
  const usernameLocked = Boolean(changedAt && Date.now() - changedAt < YEAR_MS);
  const nextChange = changedAt ? new Date(changedAt + YEAR_MS).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : '';

  async function save() {
    setSaving(true); setMessage('');
    try {
      const { db } = getFirebase();
      const cleanUsername = username.trim().toLowerCase().replace(/[^a-z_.]/g, '');
      const cleanDisplayName = displayName.trim();
      if (!cleanUsername || cleanUsername.length < 3 || !/^[a-z_.]+$/.test(cleanUsername)) throw new Error('Username must be at least 3 characters and use only lowercase letters, underscores (_) and periods (.).');
      if (!cleanDisplayName) throw new Error('Display name cannot be empty.');

      await runTransaction(db, async tx => {
        const userRef = doc(db, 'users', uid);
        const snap = await tx.get(userRef);
        const current = snap.data() || {};
        const oldUsername = current.username || '';
        const oldChanged = current.usernameChangedAt?.toMillis?.() || (current.usernameChangedAt?.seconds ? current.usernameChangedAt.seconds * 1000 : 0);
        const locked = Boolean(oldChanged && Date.now() - oldChanged < YEAR_MS);
        if (cleanUsername !== oldUsername) {
          if (locked) throw new Error(`You can change your username again after ${new Date(oldChanged + YEAR_MS).toLocaleDateString()}.`);
          const usernameRef = doc(db, 'usernames', cleanUsername);
          const taken = await tx.get(usernameRef);
          if (taken.exists() && taken.data().uid !== uid) throw new Error('That username is already taken.');
          tx.set(usernameRef, { uid, username: cleanUsername }, { merge: true });
          if (oldUsername) tx.delete(doc(db, 'usernames', oldUsername));
          tx.set(userRef, { username: cleanUsername, displayName: cleanDisplayName, usernameChangedAt: serverTimestamp(), updatedAt: serverTimestamp() }, { merge: true });
        } else {
          tx.set(userRef, { displayName: cleanDisplayName, updatedAt: serverTimestamp() }, { merge: true });
        }
      });
      setProfile(p => ({ ...p, username: cleanUsername, displayName: cleanDisplayName, usernameChangedAt: cleanUsername !== profile.username ? { seconds: Math.floor(Date.now() / 1000) } : p.usernameChangedAt }));
      setMessage('Settings saved ✦');
    } catch (e) { setMessage(e instanceof Error ? e.message : 'Could not save settings.'); }
    finally { setSaving(false); }
  }

  async function logout() {
    const { auth } = getFirebase();
    await signOut(auth);
    router.replace('/auth');
  }

  async function removeAccount() {
    setDeleting(true); setMessage('');
    try {
      const { auth, db } = getFirebase();
      const user = auth.currentUser;
      if (!user) { router.replace('/auth'); return; }
      await reauthenticateWithPopup(user, googleProvider());
      const snap = await getDoc(doc(db, 'users', user.uid));
      const oldUsername = snap.data()?.username;
      await deleteDoc(doc(db, 'users', user.uid));
      if (oldUsername) await deleteDoc(doc(db, 'usernames', oldUsername));
      await deleteUser(user);
      router.replace('/auth');
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Could not delete your account.');
    } finally { setDeleting(false); }
  }

  if (loading) return <main className={styles.page}><div className={styles.loading}>Loading settings…</div></main>;

  return (
    <main className={styles.page}>
      <div className={styles.wrap}>
        <header className={styles.header}><button className={styles.back} onClick={() => router.back()}>←</button><div><p className={styles.eyebrow}>STUKO / SETTINGS</p><h1>Settings</h1></div></header>
        <section className={styles.card}>
          <div className={styles.sectionHead}><div><h2>Account</h2><p>Keep your STUKO identity up to date.</p></div></div>
          <label className={styles.field}>Username <small>{usernameLocked ? `Locked until ${nextChange}` : 'You can change this once every 12 months.'}</small><input className={styles.input} value={username} onChange={e => setUsername(e.target.value)} disabled={usernameLocked} maxLength={30}/></label>
          <label className={styles.field}>Display name <small>You can change this anytime.</small><input className={styles.input} value={displayName} onChange={e => setDisplayName(e.target.value)} maxLength={60}/></label>
          <button className={styles.primary} onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save changes'}</button>
          {message && <p className={styles.message}>{message}</p>}
        </section>

        <section className={styles.card}>
          <div className={styles.sectionHead}><div><h2>Session</h2><p>Sign out of STUKO on this device.</p></div></div>
          <button className={styles.secondary} onClick={logout}>Log out</button>
        </section>

        <section className={`${styles.card} ${styles.danger}`}>
          <div className={styles.sectionHead}><div><h2>Delete account</h2><p>This permanently removes your STUKO account and profile data.</p></div></div>
          {!dangerOpen ? <button className={styles.deleteButton} onClick={() => setDangerOpen(true)}>Delete account</button> : <div className={styles.confirm}><strong>This cannot be undone.</strong><p>Your profile and account will be permanently deleted.</p><div className={styles.actions}><button className={styles.cancel} onClick={() => setDangerOpen(false)}>Keep account</button><button className={styles.deleteButton} onClick={removeAccount} disabled={deleting}>{deleting ? 'Deleting…' : 'Yes, delete my account'}</button></div></div>}
        </section>
      </div>
    </main>
  );
}
