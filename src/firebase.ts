import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

// Initialize Firebase App
export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Firebase Authentication instance
export const auth = getAuth(app);

// Cloud Firestore Database instance (using dedicated databaseId)
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId || '(default)');

// Validate connection on boot
export async function testFirebaseConnection(): Promise<void> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error: any) {
    if (error?.message?.includes('the client is offline')) {
      console.warn('Firebase connection check: client appears offline.');
    }
  }
}

testFirebaseConnection().catch(() => {
  // Silent catch on initial boot probe
});
