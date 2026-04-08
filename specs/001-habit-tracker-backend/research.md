# Research & Decisions: Habit Tracker Backend Core

## 1. Authentication & TOTP

- **Decision**: Use `otplib` for TOTP secret generation, QR code generation strings, and token verification.
- **Rationale**: `otplib` is the standard, well-maintained library for TOTP in Node.js, fully supporting RFC 6238 and RFC 4226. No external auth servers are required for TOTP handling.
- **Alternatives considered**: `speakeasy` (no longer maintained / deprecated).

## 2. Testing Framework

- **Decision**: Use `Jest` for unit casting.
- **Rationale**: High adoption in the Node.js ecosystem, out-of-the-box mocking which makes it easy to stub out Firebase Admin calls, and excellent test-coverage reporting to satisfy the Constitution requirement.
- **Alternatives considered**: Mocha/Chai (requires more boilerplate for mocking and assertions).

## 3. Storage & Conflict Resolution (Logical OR)

- **Decision**: Use Firebase Cloud Firestore. For conflict resolution, use a pure function to compute the "Logical OR" merge offline, then use `set(..., { merge: true })` or Firestore transactions. Extracted pure logic: `computeMerge(localData, remoteData) => mergedData`.
- **Rationale**: Firebase naturally handles offline queuing on the client, but the backend must resolve concurrent delayed writes (from multiple devices writing conflicting states). Firestore Transactions allow us to read current state and correctly apply the Logical OR for completions.
- **Alternatives considered**: Realtime Database (less ideal for complex querying and scalable document structure).

## 4. Architecture & Modularity

- **Decision**: Separate HTTP/Trigger Handlers from Business Logic.
- **Rationale**: Follows the testability principle strictly. The `SyncService` and `StreakService` will be pure JavaScript classes that never directly import `firebase-admin`. They take interfaces or plain objects, allowing 100% unit test coverage.
- **Alternatives considered**: Writing everything directly inside `functions.https.onCall`, which tightly couples Firebase to the logic and breaks test isolation.
