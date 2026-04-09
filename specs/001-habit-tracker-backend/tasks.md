# Tasks: Habit Tracker Backend Core

**Input**: Design documents from `/specs/001-habit-tracker-backend/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/api.md, quickstart.md

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story. Tests are explicit and mandatory for synchronization logic and streaks per the embedded Constitution.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Initialize Node.js `firebase-functions` project with `firebase init functions` and `firestore` (set up inside `/functions`)
- [x] T002 Install standard dependencies (`firebase-admin`, `firebase-functions`, `otplib`) and dev dependencies (`jest`) in `/functions` directory
- [x] T003 [P] Create decoupled src folder structure: `functions/src/core/`, `functions/src/handlers/`, and `functions/tests/core/`
- [x] T004 [P] Configure Jest testing environment in `functions/package.json`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

- [x] T005 [P] Create database context/admin helper singleton in `functions/src/handlers/db.js`
- [x] T006 [P] Build a reusable HTTP error responder for callables in `functions/src/handlers/errors.js`
- [x] T007 Define shared data types, validation constants, and collection name keys in `functions/src/core/models.js`

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Secure Login & Onboarding (Priority: P1) 🎯 MVP

**Goal**: A user registers securely and links an Authenticator app (TOTP) ensuring zero SMS-based vulnerability gaps.
**Independent Test**: Can be fully tested by creating an account and verifying `verifyTOTP` successfully activates the flow.

### Tests for User Story 1
- [x] T008 [P] [US1] Integration tests for `verifyTOTP` using mocked keys in `functions/tests/core/test_auth.js`

### Implementation for User Story 1
- [x] T009 [P] [US1] Implement TOTP generation/verification pure functions via `otplib` in `functions/src/core/auth.js`
- [x] T009a [US1] Create the `setupTOTP` Callable Firebase Handler to generate initial secret/URI leveraging Firebase documentation in `functions/src/handlers/api.js`
- [x] T010 [US1] Create the `verifyTOTP` Callable Firebase Handler specified in contracts in `functions/src/handlers/api.js`
- [x] T011 [US1] Implement Firebase Auth `onCreate` trigger to initialize standard `users` profile data in `functions/src/handlers/triggers.js`
- [x] T011b [P] [US1] Implement Callable Auth Guard middleware to rigorously block requests lacking verified emails or TOTP confirmation in `functions/src/handlers/authMiddleware.js`

**Checkpoint**: Secure login architecture is independently testable.

---

## Phase 4: User Story 2 - Account Deletion & Data Erasure (Priority: P1)

**Goal**: Support GDPR cascade "Hard Deletes".
**Independent Test**: Execute `deleteAccountAction` and assert that associated subcollections and rules in Firestore are purged.

### Tests for User Story 2
- [x] T011a [P] [US2] Integration tests verifying full GDPR hard-delete cascading action across `firestore` in `functions/tests/core/test_deletion.js`

### Implementation for User Story 2
- [x] T012 [P] [US2] Implement deletion query cascade graphing service in `functions/src/core/deletion.js`
- [x] T013 [US2] Create the `deleteAccountAction` Callable Firebase Handler returning success message in `functions/src/handlers/api.js`

**Checkpoint**: Data lifecycle handles privacy purges perfectly.

---

## Phase 5: User Story 3 - Offline Habit Logging & Sync (Priority: P2)

**Goal**: Support delayed offline events through pure Logical-OR resolution so completions are never lost.
**Independent Test**: Sync payloads with past dates explicitly merging without overwriting previously synchronized values.

### Tests for User Story 3 (MANDATORY ⚠️)
- [x] T014 [P] [US3] Unit tests for pure `Logical OR` merge logic mathematically in `functions/tests/core/test_sync.js`
- [x] T014a [P] [US3] Unit tests enforcing strict 3:00 AM universal grace period offset math for "logical day" string parsing in `functions/tests/core/test_date.js`

### Implementation for User Story 3
- [x] T014b [P] [US3] Implement isolated logical day calculator pure functions applying the 3:00 AM overlap logic given an ISO string and timezone in `functions/src/core/date.js`
- [x] T015 [P] [US3] Implement `computeMerge` (Logical OR pure function) to determine winning state in `functions/src/core/sync.js`
- [x] T016 [US3] Create the `syncHabitLogs` Callable Firebase Handler in `functions/src/handlers/api.js`
- [x] T017 [US3] Implement Firestore Batched Writes utilizing `computeMerge` inside the handler resolving race conditions.

**Checkpoint**: Core synchronization values flawlessly persist.

---

## Phase 6: User Story 4 - Changing Rules Without Penalty (Priority: P2)

**Goal**: Ensure streak lengths do not collapse or penalize users when configuration mappings change.
**Independent Test**: Simulate frequency update triggers verifying `longestStreak` remains exactly identical pre- and post-hook.

### Tests for User Story 4 (MANDATORY ⚠️)
- [x] T018 [P] [US4] Unit tests for isolated streak calculator logic utilizing specific-days arrays in `functions/tests/core/test_streaks.js`

### Implementation for User Story 4
- [x] T019 [P] [US4] Implement frequency evaluation rule engine (Specific Days array parsing) in `functions/src/core/rules.js`
- [x] T020 [US4] Implement streak calculator logic (evaluating `currentStreak` and `longestStreak`) in `functions/src/core/streaks.js`
- [x] T021 [US4] Implement `onWrite` Firestore trigger for `habit_logs` reacting and dispatching the cache recalculation to `streak_status` in `functions/src/handlers/triggers.js`

**Checkpoint**: Streaks dynamically track real-world completions securely.

---

## Phase 7: User Story 5 - Accurate Reminders (Priority: P3)

**Goal**: Queue localized push notifications intelligently validating standard timezones properly.
**Independent Test**: Simulating local time against 8:00 PM constraints evaluates delivery true or suppressed boolean cleanly.

### Implementation for User Story 5
- [x] T022 [P] [US5] Implement timezone conversion and filter evaluator in `functions/src/core/reminders.js`
- [x] T023 [US5] Build the scheduled Pub/Sub job (`onSchedule`) Firebase trigger processing pending routines in `functions/src/handlers/triggers.js`
- [x] T024 [US5] Integrate Push Notification delivery skeleton using Firebase Admin Messaging in `functions/src/handlers/notifications.js`

**Checkpoint**: End-to-end active notification pipeline complete.

---

## Final Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Security hardening and operational readiness.

- [x] T025 Validate `.specify` template adherence verifying no hardcoded Firebase constraints violate standard principles.
- [x] T026 Update `package.json` setup and implement basic CI scripts ensuring `jest` runs smoothly.
- [x] T027 Code cleanup across `core/` to guarantee absolute lack of database imports globally ensuring high modularity.

---

## Dependencies & Execution Order

### Phase Dependencies
- **Setup & Foundational**: Must execute first to provide the scaffolding and DB singletons to the Firebase emulator or unit environment.
- **US1 & US2**: Form the core Identity scope. Should run sequentially.
- **US3 & US4**: Rely heavily on `firestore` handlers and mathematically constrained pure functions. These must run tests strictly before integration.

### Within Each User Story
- Tests MUST be written and FAIL before implementation (especially for Sync/Streaks).
- The `core/` utility modules must be completed before wiring them into `handlers/`.

### Parallel Opportunities
- Foundational items (`db.js` and `errors.js`) can be executed independently.
- T014 (Sync Unit Tests) and T018 (Streak Unit Tests) can be executed in complete isolation from the Firebase CLI layer by separate team members.
