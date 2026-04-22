import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getFunctions } from 'firebase/functions';

const env = (import.meta as { env?: Record<string, string | undefined> }).env || {};

const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY || '',
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: env.VITE_FIREBASE_APP_ID || '',
};

const fallbackConfig = {
  apiKey: 'missing-api-key',
  authDomain: 'missing-auth-domain',
  projectId: 'missing-project-id',
  storageBucket: 'missing-storage-bucket',
  messagingSenderId: 'missing-messaging-sender-id',
  appId: 'missing-app-id',
};

const requiredKeys = Object.keys(firebaseConfig) as Array<keyof typeof firebaseConfig>;

export const isFirebaseConfigured = requiredKeys.every(
  (key) => firebaseConfig[key].trim().length > 0,
);

if (!isFirebaseConfigured && env.DEV === 'true') {
  console.warn(
    'Firebase is not fully configured. Set VITE_FIREBASE_* values in your .env file.',
  );
}

const app = initializeApp(isFirebaseConfigured ? firebaseConfig : fallbackConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const functions = getFunctions(app);
export default app;
