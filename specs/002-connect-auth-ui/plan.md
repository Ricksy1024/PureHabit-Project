# Implementation Plan: Connect Auth UI

**Branch**: `002-connect-auth-ui` | **Date**: 2026-04-10 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-connect-auth-ui/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Connect the existing glassmorphic AuthModal component to the Firebase backend by integrating the Firebase Web SDK (v9+ modular) for email/password authentication, wiring up callable Cloud Functions for TOTP setup/verification post-registration, adding a real-time auth state listener, and implementing client-side rate limiting, password reset, profile loading with retry, and comprehensive error handling. The UI already exists; this feature purely adds the integration layer and auth state management.

## Technical Context

**Language/Version**: TypeScript 5.8, Node.js (functions: CommonJS)  
**Primary Dependencies**: React 19, Vite 6, Framer Motion 12, Firebase Web SDK v11 (firebase/auth, firebase/functions), Tailwind CSS 4  
**Storage**: Firebase Auth (accounts), Firestore (user profiles, habits, logs, streaks)  
**Testing**: Jest 30 (backend), Vitest or manual testing (frontend — no test framework in package.json yet)  
**Target Platform**: Web (Vite dev server, modern browsers)  
**Project Type**: Web application (Vite + React frontend + Firebase Cloud Functions backend)  
**Performance Goals**: Auth state change reflected in UI within 5 seconds (SC-005), sign-in under 60s (SC-001)  
**Constraints**: Email/password only (no Google OAuth), TOTP-based 2FA mandatory, offline-resilient error handling, client-side cooldown after 5 failed attempts  
**Scale/Scope**: Single-user web app, ~4 components affected (AuthModal, App, new auth service, new Firebase config)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] Security First: Authentication must strictly use TOTP (Authenticator App) based Two-Factor Authentication (2FA). SMS-based authentication is strictly prohibited.
  - ✅ Spec FR-014/FR-015 require TOTP gating on protected operations. Backend `setupTOTP`/`verifyTOTP` callable functions already exist. UI will call these after registration to guide TOTP setup. No SMS path exists.
- [x] Strict Data Protection (GDPR): When a user account is deleted, a complete, irreversible, cascading "Hard Delete" must be applied to all database records and the Auth account itself.
  - ✅ Backend `deleteAccountAction` callable already implements cascade delete. This feature does not change deletion logic; it only provides UI access to authenticated session which is a prerequisite for calling delete.
- [x] User-Centric Synchronization: During data sync, users must never lose a recorded habit completion. In case of conflicts, the "Logical OR" principle applies instead of the traditional "Last Write Wins".
  - ✅ Sync logic lives entirely in the backend `syncHabitLogs` callable. This feature does not modify sync logic — it only provides the authenticated session needed to call sync functions.
- [x] Coding Standards: Modular, clean Node.js code, proper handling of asynchronous operations (Promises/async-await), and strict adherence to Firebase Cloud Functions best practices.
  - ✅ New frontend code will use async/await throughout. Firebase SDK v9+ modular imports for tree-shaking. Auth service will be a standalone module with clean separation.
- [x] Testability: Synchronization logic and streak calculations must be written in an isolated manner, fully coverable by unit tests.
  - ✅ No changes to sync/streak logic. New auth service module will be isolated and testable.
- [x] AI Agent Tooling: The agent MUST use the Context7 MCP server for retrieving all software documentation. The agent MUST use the Firebase MCP server directly for executing Firebase actions.
  - ✅ Context7 used to research Firebase Web SDK auth APIs. Firebase MCP will be used for any Firebase project actions during implementation.

## Project Structure

### Documentation (this feature)

```text
specs/002-connect-auth-ui/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
src/
├── App.tsx              # Root component — add auth state context
├── main.tsx             # Entry point
├── index.css            # Global styles
├── config/
│   └── firebase.ts      # NEW: Firebase app initialization + auth + functions
├── services/
│   └── authService.ts   # NEW: Auth operations (sign in, sign up, reset, listeners)
├── hooks/
│   └── useAuth.ts       # NEW: React hook for auth state management
├── components/
│   ├── AuthModal.tsx    # MODIFIED: Wire form submissions to authService
│   ├── ShaderBackground.tsx
│   ├── StatisticsPage.tsx
│   └── ThemeToggle.tsx
└── types/
    └── auth.ts          # NEW: TypeScript interfaces for auth state

functions/               # EXISTING — no changes needed
├── index.js
├── src/
│   ├── core/            # auth.js, sync.js, etc. — untouched
│   └── handlers/        # api.js (setupTOTP, verifyTOTP, etc.) — untouched
└── tests/
```

**Structure Decision**: The frontend is a single Vite + React app under `src/`. New code adds a `config/`, `services/`, `hooks/`, and `types/` directory under `src/` following standard React project conventions. The backend (`functions/`) is not modified — only called via Firebase callable functions from the frontend. This is a web application structure (Option 2 variant) with a clear frontend/backend separation.

## Complexity Tracking

> **No Constitution Check violations. Table not applicable.**
