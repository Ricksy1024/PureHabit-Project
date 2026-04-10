# Quickstart: Connect Auth UI

**Feature**: 002-connect-auth-ui  
**Date**: 2026-04-10

## Prerequisites

1. **Firebase Project**: A Firebase project with Authentication enabled (Email/Password provider)
2. **Node.js**: v18+ (already present in devcontainer)
3. **Firebase CLI**: Installed globally or via `npx`
4. **Environment**: Vite `.env` file with Firebase config values

## Setup Steps

### 1. Install Firebase Web SDK

```bash
cd /workspaces/PureHabit-Project
npm install firebase
```

### 2. Create Environment Configuration

Create `.env` in the project root:

```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

> **Note**: Get these values from the Firebase Console → Project Settings → General → Your apps → Web app config.

### 3. Create Firebase Config Module

Create `src/config/firebase.ts`:

```typescript
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFunctions } from 'firebase/functions';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const functions = getFunctions(app);
export default app;
```

### 4. Run Development Server

```bash
npm run dev
```

App available at `http://localhost:3000`.

### 5. (Optional) Run Backend Locally with Emulators

```bash
cd functions && npm install && cd ..
npx firebase emulators:start --only auth,functions,firestore
```

Then in `src/config/firebase.ts`, add emulator connection:

```typescript
import { connectAuthEmulator } from 'firebase/auth';
import { connectFunctionsEmulator } from 'firebase/functions';

if (import.meta.env.DEV) {
  connectAuthEmulator(auth, 'http://localhost:9099');
  connectFunctionsEmulator(functions, 'localhost', 5001);
}
```

## Verification

1. Open `http://localhost:3000`
2. Click "Sign In" button in sidebar
3. Auth modal opens
4. Register a new account → should create Firebase Auth user + Firestore profile
5. Sign out → UI reverts to unauthenticated state
6. Sign in with created credentials → should authenticate and show dashboard

## Key Files to Touch

| File | Action | Purpose |
|---|---|---|
| `src/config/firebase.ts` | CREATE | Firebase SDK initialization |
| `src/services/authService.ts` | CREATE | Auth logic (sign in/up/out, listeners, rate limiting) |
| `src/hooks/useAuth.ts` | CREATE | React hook wrapping auth state |
| `src/types/auth.ts` | CREATE | TypeScript interfaces |
| `src/components/AuthModal.tsx` | MODIFY | Wire form to authService |
| `src/App.tsx` | MODIFY | Wrap with auth context, conditional rendering |
| `package.json` | MODIFY | Add `firebase` dependency |
| `.env` | CREATE | Firebase project configuration |
| `.gitignore` | MODIFY | Ensure `.env` is ignored |
