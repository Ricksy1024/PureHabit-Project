# Data Model: Connect Auth UI

**Feature**: 002-connect-auth-ui  
**Date**: 2026-04-10

This feature does not create new Firestore collections. It consumes existing backend data models defined in [001-habit-tracker-backend/data-model.md](../001-habit-tracker-backend/data-model.md). The entities below describe the **client-side state models** used by the frontend auth layer.

## Client-Side State Entities

### Entity: `AuthState` (Discriminated Union)

Represents the current authentication and verification state visible to the UI.

| Variant | Fields | Description |
|---|---|---|
| `loading` | — | Initial state before Firebase Auth SDK resolves |
| `unauthenticated` | — | No active session. Show sign-in/sign-up UI |
| `authenticated_pending` | `user: FirebaseUser`, `emailVerified: boolean`, `totpVerified: boolean` | Signed in but missing email verification and/or TOTP. Show guided next steps |
| `authenticated_ready` | `user: FirebaseUser`, `profile: UserProfile \| null` | Fully verified. Show authenticated app. Profile may be `null` during loading |

**State transitions**:
```
loading ──onAuthStateChanged──▶ unauthenticated (no user)
loading ──onAuthStateChanged──▶ authenticated_pending (user, missing gates)
loading ──onAuthStateChanged──▶ authenticated_ready (user, all gates passed)
unauthenticated ──signIn/signUp──▶ authenticated_pending | authenticated_ready
authenticated_pending ──verification complete──▶ authenticated_ready
authenticated_ready ──signOut──▶ unauthenticated
authenticated_ready ──session invalidated──▶ unauthenticated (FR-012)
```

### Entity: `RateLimitState`

Tracks client-session sign-in attempt rate limiting per FR-016.

| Field | Type | Description |
|---|---|---|
| `attempts` | `number` | Failed sign-in attempts in current window |
| `windowStart` | `number` | Timestamp (ms) when the current 15-minute window started |
| `cooldownUntil` | `number \| null` | Timestamp (ms) when cooldown expires, or null if not in cooldown |

**Validation rules**:
- `attempts` resets to 0 when `Date.now() - windowStart > 15 * 60 * 1000`
- `cooldownUntil` is set to `Date.now() + 15 * 60 * 1000` when `attempts >= 5`
- State is in-memory only (lost on page reload per spec "client-session" scope)

### Entity: `UserProfile` (Read from Firestore)

Maps to the existing `users` collection document. Read-only on the client side.

| Field | Type | Source |
|---|---|---|
| `id` | `string` | Firebase Auth UID |
| `email` | `string` | Verified email |
| `timezone` | `string` | IANA timezone |
| `totp.enabled` | `boolean` | Whether TOTP is fully set up |
| `createdAt` | `Timestamp` | Account creation time |
| `updatedAt` | `Timestamp` | Last profile update |

### Entity: `AuthFormState`

Describes the local form state preserved through errors per FR-011/FR-018.

| Field | Type | Description |
|---|---|---|
| `email` | `string` | User-entered email (preserved through errors) |
| `password` | `string` | User-entered password (preserved through errors) |
| `displayName` | `string \| undefined` | Only for sign-up tab |
| `error` | `string \| null` | Current error message to display inline |
| `isSubmitting` | `boolean` | Whether a submission is in progress |

## Firestore Reads (Existing Collections)

This feature reads from the following existing collections but does not write to them directly (writes happen via callable functions):

| Collection | Read Purpose | Write Method |
|---|---|---|
| `users` | Load user profile after auth | Backend `onUserCreate` trigger auto-creates; `setupTOTP`/`verifyTOTP` callables update |
| `users.totp.enabled` | Check TOTP verification status | `verifyTOTP` callable sets via custom claims |

## Firebase Auth Custom Claims (Existing)

| Claim | Type | Set By | Read By |
|---|---|---|---|
| `totpVerified` | `boolean` | `verifyTOTP` callable (backend) | Frontend auth state resolver via `user.getIdTokenResult()` |
