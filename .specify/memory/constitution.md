<!--
Sync Impact Report
- Version change: 1.1.0 → 1.2.0
- List of modified principles:
  - Added new principle: VII. Frontend–Backend Contract Integrity
- Added sections: None
- Removed sections: None
- Templates requiring updates (✅ updated / ⚠ pending):
  ✅ .specify/templates/plan-template.md
  ✅ .specify/templates/spec-template.md
- Follow-up TODOs: None
-->

# PureHabit Backend Constitution

## Core Principles

### I. Security First
Authentication MUST strictly use TOTP (Authenticator App) based Two-Factor
Authentication (2FA). SMS-based authentication is strictly prohibited.

### II. Strict Data Protection (GDPR)
When a user account is deleted, a complete, irreversible, cascading "Hard Delete"
MUST be applied to all database records and the Auth account itself.

### III. User-Centric Synchronization
During data sync, users MUST never lose a recorded habit completion. In case of
conflicts, the "Logical OR" principle applies instead of the traditional
"Last Write Wins".

### IV. Coding Standards
Modular, clean Node.js code, proper handling of asynchronous operations
(Promises/async-await), and strict adherence to Firebase Cloud Functions best
practices.

### V. Testability
Synchronization logic and streak calculations MUST be written in an isolated
manner, fully coverable by unit tests.

### VI. AI Agent Tooling
To effectively navigate and implement the stack, the AI agent MUST use the
Context7 MCP server for retrieving all software documentation. The agent MUST
use the Firebase MCP server directly for executing Firebase actions.

### VII. Frontend–Backend Contract Integrity
Every piece of data created, modified, or displayed in the frontend MUST be
persisted to and retrieved from the Firebase backend (Firestore or Cloud
Functions). No application state that is meaningful beyond a single browser
session may be kept exclusively in React component state or local memory.
Specifically:

- Habit CRUD operations (create, read, update, archive/soft-delete) MUST call
  the corresponding backend Cloud Function or write directly to Firestore through
  the authenticated Firebase Web SDK.
- Habit completion toggles MUST be persisted via the existing `syncHabitLogs`
  callable Cloud Function, applying Logical OR merge.
- Streak data displayed in the UI MUST be read from the `streak_status` Firestore
  collection; it MUST NOT be computed independently on the frontend.
- User profile data (display name, email, timezone, TOTP status) MUST be read
  from the `users` Firestore collection and kept in sync with the `useAuth`
  context.
- The authenticated user's timezone stored in `users.timezone` MUST be used as
  the canonical timezone for all logical-day calculations on both client and
  server.

## Governance

- All updates to the core synchronization logic or data retention models MUST be
  reviewed against this Constitution.
- Amendments to this constitution must increment the version number following
  Semantic Versioning (MAJOR for breaking changes, MINOR for additions, PATCH for
  clarifications).
- All Code Reviews MUST verify compliance with these core principles before
  merging.

**Version**: 1.2.0 | **Ratified**: 2026-04-08 | **Last Amended**: 2026-04-24
