# Research: Connect Auth UI

**Feature**: 002-connect-auth-ui  
**Date**: 2026-04-10  
**Status**: Complete

## R1: Firebase Web SDK Initialization in Vite + React + TypeScript

**Decision**: Use Firebase v11 modular SDK (`firebase/auth`, `firebase/functions`) with tree-shakeable imports.

**Rationale**: The project already uses Vite 6 + React 19 + TypeScript 5.8. Firebase v9+ modular SDK is the recommended approach for modern bundlers — it produces smaller bundles via tree-shaking. The v11 SDK is backward-compatible with v9 modular API patterns. The existing `functions/package.json` uses `firebase-functions` v7 and `firebase-admin` v13, confirming the project is on the latest Firebase generation.

**Alternatives considered**:
- Firebase compat SDK (v8-style namespaced): Rejected — larger bundle, no tree-shaking, deprecated pattern
- Direct REST API calls: Rejected — loses auth state management, token refresh, and real-time listeners that the SDK provides for free

**Key patterns**:
```typescript
// src/config/firebase.ts
import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getFunctions, httpsCallable } from 'firebase/functions';

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const functions = getFunctions(app);
```

## R2: Email/Password Authentication API Surface

**Decision**: Use `signInWithEmailAndPassword`, `createUserWithEmailAndPassword`, `sendPasswordResetEmail`, `signOut`, and `onAuthStateChanged` from `firebase/auth`.

**Rationale**: These are the standard Firebase Auth v9+ modular functions for email/password auth. They handle token management, session persistence, and auth state broadcasting automatically. The `onAuthStateChanged` listener provides the real-time responsiveness required by FR-006 and SC-005.

**Alternatives considered**:
- Custom token auth via REST: Rejected — reimplements what the SDK already does, loses automatic token refresh
- Firebase Auth UI library (FirebaseUI): Rejected — gives less control over the custom glassmorphic UI design already built

**Key API surface used**:
| Function | Purpose | Spec Requirement |
|---|---|---|
| `signInWithEmailAndPassword` | Sign in existing users | FR-001, US-1 |
| `createUserWithEmailAndPassword` | Register new users | FR-002, US-2 |
| `sendPasswordResetEmail` | Password reset flow | FR-017 |
| `onAuthStateChanged` | Real-time auth state | FR-006, FR-019, US-3 |
| `signOut` | User-initiated sign-out | FR-010 |

**Error codes to handle**:
- `auth/user-not-found` → "No account found with this email"
- `auth/wrong-password` → "Incorrect password"
- `auth/email-already-in-use` → "An account already exists with this email"
- `auth/weak-password` → "Password must be at least 6 characters"
- `auth/invalid-email` → "Please enter a valid email address"
- `auth/too-many-requests` → Maps to client-side cooldown (FR-016)
- `auth/network-request-failed` → "Unable to connect. Check your connection and try again." (FR-018)

## R3: Calling Backend Callable Functions from Web Client

**Decision**: Use `httpsCallable` from `firebase/functions` to call existing backend callables (`setupTOTP`, `verifyTOTP`, `deleteAccountAction`, `syncHabitLogs`).

**Rationale**: The backend already exposes these as `onCall` Cloud Functions. The `httpsCallable` wrapper automatically attaches the Firebase Auth ID token, handles serialization, and returns typed responses. This is the standard client-side pattern for calling Firebase callable functions.

**Alternatives considered**:
- Direct HTTP POST to function URLs: Rejected — requires manual token attachment, error parsing, and URL management
- Firebase Admin SDK from client: Not possible — Admin SDK is server-side only

**Key pattern**:
```typescript
import { getFunctions, httpsCallable } from 'firebase/functions';

const functions = getFunctions();
const setupTOTP = httpsCallable(functions, 'setupTOTP');
const result = await setupTOTP({});
// result.data.secret, result.data.qrUri
```

## R4: Client-Side Rate Limiting Strategy

**Decision**: Implement a simple in-memory counter with timestamp tracking on the auth service. After 5 failed sign-in attempts within 15 minutes, disable the submit button and show a cooldown message for 15 minutes.

**Rationale**: FR-016 specifies "client-session" scope, meaning the cooldown is per browser tab/session, not persisted across reloads. This is intentionally lightweight — the server-side `auth/too-many-requests` provides the real security layer. The client-side cooldown is a UX improvement to prevent frustrated rapid retries.

**Alternatives considered**:
- localStorage-based persistence: Rejected — spec says "client session" scope, and persisting across reloads adds complexity without security benefit (server already rate-limits)
- Server-side custom rate limiting: Rejected — Firebase Auth already has built-in rate limiting; the client cooldown is purely a UX feature per spec

**Implementation**:
```typescript
interface RateLimitState {
  attempts: number;
  windowStart: number;
  cooldownUntil: number | null;
}
```

## R5: Auth State Machine Design

**Decision**: Model auth state as a discriminated union with four states: `unauthenticated`, `authenticated_pending` (signed in but missing verification/TOTP), `authenticated_ready` (fully verified), and `loading` (initial state before first auth check).

**Rationale**: The spec distinguishes between being signed in (FR-014) and being fully verified for protected operations (FR-007, FR-008, FR-015). This state machine cleanly maps to the UI behaviors: `loading` shows a spinner, `unauthenticated` shows sign-in/sign-up, `authenticated_pending` shows guided next steps, and `authenticated_ready` shows the full app. Firebase Auth `onAuthStateChanged` fires on sign-in, then we check custom claims (`totpVerified`) and `emailVerified` to determine the sub-state.

**Alternatives considered**:
- Boolean flags (`isLoggedIn`, `isVerified`): Rejected — leads to impossible state combinations and fragile conditional logic
- Redux/Zustand state management: Rejected — overkill for a single auth state concern; React Context + useReducer is sufficient

## R6: Profile Loading with Retry

**Decision**: After auth succeeds, fetch user profile from Firestore. If the fetch fails, show authenticated shell with "Profile loading…" placeholder and retry up to 3 times with exponential backoff (1s, 2s, 4s).

**Rationale**: FR-020 explicitly requires this behavior. The authenticated UI shell should never be blocked by a transient Firestore hiccup. The profile data is needed for timezone and display, but the auth session itself is valid regardless.

**Alternatives considered**:
- Block entire app until profile loads: Rejected — explicitly contradicted by FR-020
- Infinite retries: Rejected — 3 attempts with backoff is sufficient; persistent failure likely indicates a real issue worth surfacing

## R7: Firebase Configuration Management

**Decision**: Store Firebase config in an environment-variable-backed config file (`src/config/firebase.ts`). For development, use `.env` file with Vite's `import.meta.env.VITE_*` pattern. For production, values are baked into the build.

**Rationale**: Firebase config values are not secret (they're embedded in web clients by design), but keeping them in environment variables makes it easy to switch between projects/environments. Vite natively supports `.env` files with the `VITE_` prefix.

**Alternatives considered**:
- Hardcoded config object: Viable for single-project, but less flexible
- Runtime config fetch: Rejected — adds a network request before the app can initialize Firebase
