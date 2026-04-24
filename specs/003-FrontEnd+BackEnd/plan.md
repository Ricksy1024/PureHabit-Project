# Implementation Plan: FrontEnd+BackEnd Integration

**Branch**: `003-FrontEnd+BackEnd` | **Date**: 2026-04-24 | **Spec**: [spec.md](./spec.md)

## Summary

This feature bridges the gap between the polished PureHabit React UI and the robust Firebase backend. It replaces all hardcoded local state with real-time Firestore subscriptions (`onSnapshot`) for habits, logs, and streaks. Due to strict `allow write: if false` Firestore security rules, all mutations are routed through Cloud Function callables (optimistic UI for logs, standard loading states for CRUD). The integration must preserve all existing Framer Motion animations while delivering a seamless, offline-resilient experience for habit completions.

## Technical Context

**Language/Version**: TypeScript 5.8 (frontend), CommonJS Node.js (backend)
**Primary Dependencies**: React 19, Vite 6, Framer Motion 12, Firebase Web SDK v11, Tailwind CSS 4
**Storage**: Cloud Firestore (real-time listeners), Firebase Cloud Functions v2 (callables for writes)
**Architecture**: React Hooks (`useHabits`, `useHabitLogs`, `useStreaks`) driving state, `habitService.ts` managing SDK interactions, new Backend Callables wrapping Firestore mutations.
**Constraints**: 
- **Constitution Principle VII**: No application state meaningful beyond a single session may be kept exclusively in React component state.
- **Security Rules**: Firestore reads are authenticated-owner only. Firestore writes are BLOCKED (`allow write: if false`), mandating the use of the `requireCallableAuth` pattern for all new mutations (create, update, archive).
- **Offline Limits**: Offline reads work via SDK persistence. Offline *writes* for callables do not queue automatically, so the frontend must optimistically update and cleanly revert on network failure.

## Constitution Check

- [x] Security First (TOTP-only 2FA): 
  - ✅ Remains intact. The UI still uses the TOTP gates established in 002.
- [x] Strict Data Protection (GDPR):
  - ✅ Cascade delete remains in the backend. Front-end settings panel connects to the existing `deleteAccountAction`.
- [x] User-Centric Synchronization:
  - ✅ `syncHabitLogs` callable is the sole mechanism for logging completions, enforcing Logical OR on the backend.
- [x] Coding Standards:
  - ✅ Frontend uses standard React Hooks, modular Firebase imports, and strict TypeScript. Backend callables follow the existing modular handler pattern.
- [x] Testability:
  - ✅ Custom hooks isolate state logic from UI components, making Vitest testing straightforward.
- [x] AI Agent Tooling:
  - ✅ Context7 and Firebase MCP are available for use.
- [x] Frontend-Backend Contract Integrity:
  - ✅ The entire architecture shifts local state to real-time Firebase subscriptions.

## Project Structure

### Documentation

```text
specs/003-FrontEnd+BackEnd/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── callable-endpoints.md
└── tasks.md
```

### Source Code

```text
src/
├── config/
│   └── firebase.ts          # MODIFIED: Enable multi-tab indexedDB persistence
├── services/
│   └── habitService.ts      # NEW: Firestore onSnapshot subscriptions + callable invocations
├── hooks/
│   ├── useHabits.ts         # NEW: Subscribe to user's habits
│   ├── useHabitLogs.ts      # NEW: Subscribe to date-ranged logs + optimistic sync toggle
│   ├── useStreaks.ts        # NEW: Subscribe to computed streak_status
│   └── useStatistics.ts     # NEW: Lazy-loaded query (max 1000) for Stats page
├── types/
│   └── habit.ts             # NEW: TypeScript models mapping to Firestore schemas
├── components/
│   ├── App.tsx              # MODIFIED: Strip local state, inject hooks
│   ├── HabitsPage.tsx       # MODIFIED: Real data binding
│   ├── StatisticsPage.tsx   # MODIFIED: Implement FR-009 calculation logic
│   ├── StreakPage.tsx       # MODIFIED: Bind to useStreaks
│   ├── CategoriesPage.tsx   # MODIFIED: Real data binding
│   ├── SettingsModal.tsx    # MODIFIED: Show real auth profile + trigger delete
│   └── (Modals)             # MODIFIED: Form submissions call habitService
functions/
└── src/
    └── handlers/
        └── api.js           # MODIFIED: Add createHabitAction, updateHabitAction, archiveHabitAction
```

## Complexity Tracking

| Issue | Resolution | Risk |
|-------|------------|------|
| **Blocked Firestore Writes** | Create minimal backend callable wrappers (`createHabitAction`, etc.) to bypass `allow write: if false`. | Low |
| **Offline Sync Callables** | Implement robust optimistic UI that instantly reverts on callable failure. | Medium |
| **Stats Query Limit** | Add 1,000 document limit to `useStatistics` query with a non-blocking UI notice. | Low |
