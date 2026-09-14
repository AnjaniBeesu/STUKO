import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Firebase Web config is client-side configuration, so it is safe for the browser
// to receive these values. Keeping them here means STUKO works immediately on
// Vercel without requiring a separate environment-variable setup.
const firebaseConfig = {
  apiKey: 'AIzaSyDDooLrTxOCEwmjay6IhY67fK9a9GI5S0Y',
  authDomain: 'stukoo.firebaseapp.com',
  projectId: 'stukoo',
  storageBucket: 'stukoo.firebasestorage.app',
  messagingSenderId: '179986988899',
  appId: '1:179986988899:web:e7e960e474567089f35d56',
};

export function firebaseConfigured() {
  return Boolean(firebaseConfig.apiKey && firebaseConfig.authDomain && firebaseConfig.projectId && firebaseConfig.appId);
}

export function getFirebase() {
  const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  return { app, auth: getAuth(app), db: getFirestore(app), storage: getStorage(app) };
}

export function googleProvider() {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  return provider;
}
