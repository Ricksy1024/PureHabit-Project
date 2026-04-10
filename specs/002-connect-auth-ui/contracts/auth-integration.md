# Contracts: Auth UI → Backend Integration

**Feature**: 002-connect-auth-ui  
**Date**: 2026-04-10

This feature does not define new backend APIs. It documents the **client-side interface contracts** — how the frontend auth layer invokes existing backend services.

## Firebase Auth SDK Operations (Client → Firebase Auth)

### `signInWithEmailAndPassword(auth, email, password)`

**Trigger**: User submits Sign In form  
**Precondition**: User is unauthenticated, cooldown not active  
**Success**: Returns `UserCredential` with `user.uid`, `user.email`, `user.emailVerified`  
**Errors**:

| Firebase Error Code | User-Facing Message |
|---|---|
| `auth/user-not-found` | "No account found with this email." |
| `auth/wrong-password` | "Incorrect password. Try again or reset your password." |
| `auth/invalid-email` | "Please enter a valid email address." |
| `auth/user-disabled` | "This account has been disabled." |
| `auth/too-many-requests` | "Too many attempts. Please wait and try again." |
| `auth/network-request-failed` | "Unable to connect. Check your connection and try again." |

### `createUserWithEmailAndPassword(auth, email, password)`

**Trigger**: User submits Sign Up form  
**Precondition**: User is unauthenticated  
**Success**: Returns `UserCredential`, triggers `onUserCreate` Cloud Function which creates `users` doc  
**Errors**:

| Firebase Error Code | User-Facing Message |
|---|---|
| `auth/email-already-in-use` | "An account already exists with this email." |
| `auth/weak-password` | "Password must be at least 6 characters." |
| `auth/invalid-email` | "Please enter a valid email address." |
| `auth/network-request-failed` | "Unable to connect. Check your connection and try again." |

### `sendPasswordResetEmail(auth, email)`

**Trigger**: User clicks "Forgot?" link on Sign In form  
**Precondition**: User is on Sign In tab  
**Success**: Shows confirmation toast regardless of whether email exists (prevents enumeration per edge case spec)  
**Errors**: Network failures only — all other errors silently show the same success message  

### `onAuthStateChanged(auth, callback)`

**Trigger**: App initialization, sign-in, sign-out, token refresh, external state changes  
**Callback payload**: `User | null`  
**Behavior**: 
- Called with `null` → set state to `unauthenticated`
- Called with `User` → check `emailVerified` and `getIdTokenResult().claims.totpVerified` to determine `authenticated_pending` vs `authenticated_ready`
- Real-time: detects external verification completion (FR-019), session invalidation (FR-012)

### `signOut(auth)`

**Trigger**: User clicks sign-out button  
**Postcondition**: `onAuthStateChanged` fires with `null`, UI transitions to unauthenticated  

## Firebase Callable Functions (Client → Cloud Functions)

All callable functions are invoked via `httpsCallable(functions, 'functionName')`. The Firebase SDK automatically attaches the auth token.

### `setupTOTP` (Post-Registration)

**When called**: After successful registration, during guided TOTP setup flow  
**Request**: `{}` (empty — user identified by auth token)  
**Response**: `{ success: true, secret: string, qrUri: string }`  
**UI behavior**: Display QR code from `qrUri` for user to scan with authenticator app  

### `verifyTOTP` (Post-Registration)

**When called**: After user enters 6-digit code from authenticator app  
**Request**: `{ token: string }` (6-digit TOTP code)  
**Response**: `{ success: true, valid: boolean }`  
**UI behavior**: If `valid === true`, force token refresh to pick up `totpVerified` custom claim, then transition to `authenticated_ready`

### `deleteAccountAction` (Protected Operation)

**When called**: User-initiated account deletion (future UI, not in this release scope)  
**Precondition**: `authenticated_ready` state required  
**Request**: `{}` (empty)  
**Response**: `{ success: true, message: string }`  

### `syncHabitLogs` (Protected Operation)

**When called**: Habit completion sync (existing feature, requires auth session)  
**Precondition**: `authenticated_ready` state required  
**Request**: `{ logs: Array<{ habitId, dateString, completed, timestamp }> }`  
**Response**: `{ success: true, processedCount: number }`  

## Firestore Direct Reads (Client → Firestore)

### User Profile Fetch

**When**: After `onAuthStateChanged` confirms authenticated user  
**Collection**: `users`  
**Document**: `users/{uid}`  
**Fields read**: `email`, `timezone`, `totp.enabled`  
**Retry policy**: Max 3 attempts, exponential backoff (1s, 2s, 4s) per FR-020  
**Failure behavior**: Show authenticated shell with "Profile loading…" placeholder  
