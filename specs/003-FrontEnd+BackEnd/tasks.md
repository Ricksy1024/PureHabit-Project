# Tasks: Connect Frontend to Backend

**Input**: Design documents from `/specs/003-FrontEnd+BackEnd/`
**Prerequisites**: plan.md, spec.md, data-model.md, contracts/callable-endpoints.md, research.md

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Firebase config updates and shared TypeScript types

- [ ] T001 [P] Define Habit, HabitLog, StreakStatus, and HabitFrequency TypeScript interfaces in `src/types/habit.ts` mirroring Firestore schema from `specs/001-habit-tracker-backend/data-model.md` — include `category`, `uiBgColor`, `uiIconName`, `uiMetric` UI fields
- [ ] T002 [P] Add Firestore multi-tab offline persistence and Firebase Messaging initialization to `src/config/firebase.ts` — export `messaging` instance; guard messaging init behind `isSupported()` check
- [ ] T003 [P] Define shared Firestore collection name constants in `src/constants/collections.ts` matching `functions/src/core/models.js` COLLECTIONS values (`users`, `habits`, `habit_logs`, `streak_status`)
- [ ] T004 [P] Add a `logicalDay` utility function in `src/utils/dateUtils.ts` that derives the current logical date from a timezone string using the 3 AM grace period rule (matching `functions/src/core/date.js` `getLogicalDay`)

**Checkpoint**: Foundation types and config ready — service layer can begin

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Backend callable stubs and service layer that ALL user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T005 [BACKEND-CHANGE] Implement `createHabitAction` callable in `functions/src/handlers/api.js` — validate `name`, `frequency.days` via `VALIDATORS`, set `userId` from `requireCallableAuth`, set `archived: false`, `createdAt`/`updatedAt` to server timestamps, return `{ success: true, habitId }`. Follow existing handler pattern (see `setupTOTPHandler`). [SECURITY-GAP] — required because `firestore.rules` sets `allow write: if false` on `habits`
- [ ] T006 [BACKEND-CHANGE] Implement `updateHabitAction` callable in `functions/src/handlers/api.js` — validate `habitId` ownership via `requireCallableAuth` uid match, merge provided fields (`name`, `frequency`, `reminders`, `category`, `uiBgColor`, `uiIconName`, `uiMetric`), set `updatedAt` to server timestamp. [SECURITY-GAP]
- [ ] T007 [BACKEND-CHANGE] Implement `archiveHabitAction` callable in `functions/src/handlers/api.js` — validate `habitId` ownership, set `archived: true` and `updatedAt` to server timestamp. [SECURITY-GAP]
- [ ] T008 [BACKEND-CHANGE] Implement `registerDeviceTokenAction` callable in `functions/src/handlers/api.js` — validate `token` is non-empty string, write to `users/{uid}.pushToken` via `requireCallableAuth`. [SECURITY-GAP]
- [ ] T009 [BACKEND-CHANGE] Implement `batchRenameCategoryAction` callable in `functions/src/handlers/api.js` — accept `oldName` and `newName`, query all `habits` where `userId == uid` and `category == oldName`, batch-update to `newName` in a single Firestore batch write. [SECURITY-GAP]
- [ ] T010 [BACKEND-CHANGE] Export all 5 new callables (`createHabitAction`, `updateHabitAction`, `archiveHabitAction`, `registerDeviceTokenAction`, `batchRenameCategoryAction`) from `functions/index.js`
- [ ] T011 Create `src/services/habitService.ts` implementing: `subscribeToHabits(userId, onData, onError)` using `onSnapshot` on `habits` where `userId == uid` and `archived == false`; `subscribeToStreaks(habitIds, onData, onError)` using `onSnapshot` on `streak_status`; `subscribeToHabitLogs(userId, startDate, endDate, onData, onError)` using `onSnapshot` on `habit_logs` bounded by `dateString` range; `createHabit(data)` calling `createHabitAction` callable; `updateHabit(data)` calling `updateHabitAction` callable; `archiveHabit(habitId)` calling `archiveHabitAction` callable; `syncHabitLog(logs)` calling existing `syncHabitLogs` callable; `batchRenameCategory(oldName, newName)` calling `batchRenameCategoryAction` callable; `registerPushToken(token)` calling `registerDeviceTokenAction` callable; `fetchHabitLogsForRange(userId, startDate, endDate, limit)` using `getDocs` with `limit(1000)` ordered by `dateString` desc. Follow `authService.ts` patterns for error mapping

**Checkpoint**: Backend endpoints and service layer ready — hooks can now be built

---

## Phase 3: User Story 1 — Habit Management: Create & Read (Priority: P1) 🎯 MVP

**Goal**: Signed-in users can create habits that persist to Firestore and see them in real-time via `onSnapshot`

**Independent Test**: Create a habit through the UI, reload the page, confirm it persists. Verify the Firestore document exists with correct `userId`.

- [ ] T012 [US1] Implement `src/hooks/useHabits.ts` — subscribe to authenticated user's non-archived habits via `habitService.subscribeToHabits`; return `{ habits: Habit[], loading: boolean, error: string | null }`; show skeleton state while `loading` is true; convert Firestore Timestamps to Dates; unsubscribe on unmount; implement 10-second timeout that transitions from loading to error with retry action
- [ ] T013 [US1] Add skeleton loading component to `src/App.tsx` `HabitsList` — render 3 dimmed habit-card-shaped placeholder elements (matching existing card dimensions and border-radius) when `useHabits` returns `loading: true`; preserve all existing Framer Motion animations
- [ ] T014 [US1] Add empty state component to `src/App.tsx` `HabitsList` — render "No habits yet" message with Add button when `useHabits` returns `habits.length === 0` and `loading === false`
- [ ] T015 [US1] Wire `AddActivityModal` submit handler to call `habitService.createHabit` — map form fields (`name`, `metric`, `days`, `category`, `iconName`) to the `createHabitAction` callable payload; show inline error on failure; close modal on success; do NOT apply optimistic update (CRUD requires connectivity per FR-006)
- [ ] T016 [US1] Replace local `weeklyHabits` state in `src/App.tsx` `MainContent` with `useHabits` hook — remove `useState<Habit[]>` for `weeklyHabits`, replace with `useHabits()` data; update `currentHabits` derivation to use real Firestore data; update `Habit` interface usage to use `src/types/habit.ts` types

**Checkpoint**: Habits persist to Firestore and load in real-time. Reload shows real data.

---

## Phase 4: User Story 2 — Habit Management: Edit & Archive (Priority: P1)

**Goal**: Users can edit habit fields and archive habits, with changes persisting to Firestore

**Independent Test**: Edit a habit field, reload, confirm it persists. Archive a habit, confirm it disappears from active list but `habit_logs` remain.

- [ ] T017 [US2] Wire `EditActivityModal` save handler to call `habitService.updateHabit` — map edited fields to `updateHabitAction` callable payload; show inline error on failure; close modal on success; do NOT apply optimistic update
- [ ] T018 [US2] Wire archive (delete) action in `HabitsPage` to call `habitService.archiveHabit` — replace local `filter` delete with callable invocation; add confirmation dialog before archiving; show inline error on failure; the `onSnapshot` subscription will automatically remove the archived habit from the list
- [ ] T019 [US2] Add offline detection guard to create/edit/archive operations in `src/services/habitService.ts` — check `navigator.onLine` before calling CRUD callables; if offline, return error result `{ ok: false, error: 'No connection — changes could not be saved. Please retry when online.' }` without making the callable request

**Checkpoint**: Habit CRUD fully wired. Edits and archives persist across reloads.

---

## Phase 5: User Story 3 — Daily Habit Completion & Sync (Priority: P1)

**Goal**: Users can toggle habit completions via the dashboard; completions persist through `syncHabitLogs` callable with Logical OR semantics

**Independent Test**: Toggle a habit complete, verify `habit_logs` document in Firestore. Simulate conflict, confirm `completed: true` wins.

- [ ] T020 [US3] Implement `src/hooks/useHabitLogs.ts` — accept `userId` and `selectedDate`; subscribe to `habit_logs` for that date via `habitService.subscribeToHabitLogs`; expose `completionMap: Record<habitId, boolean>` and `toggleCompletion(habitId, currentValue)` function; implement optimistic toggle (flip local state immediately, call `habitService.syncHabitLog`, revert on error with inline toast); derive `dateString` using `logicalDay` utility from `src/utils/dateUtils.ts` with the user's stored timezone
- [ ] T021 [US3] Wire dashboard `HabitsList` toggle button to `useHabitLogs.toggleCompletion` — replace local `toggleHabit` function; read completion state from `completionMap`; preserve confetti animation on completion; show error toast on sync failure with revert
- [ ] T022 [US3] Wire `HabitsPage` completion toggles to `useHabitLogs.toggleCompletion` — same pattern as T021 for the Habits management page
- [ ] T023 [US3] Update `getDayProgress` and `ProgressSection` in `src/App.tsx` to compute progress from `useHabitLogs` completion map instead of local `done` field — filter habits by their `frequency.days` matching the selected day-of-week before calculating percentage

**Checkpoint**: Completions round-trip through `syncHabitLogs` with Logical OR. Optimistic UI reverts on failure.

---

## Phase 6: User Story 4 — Real-Time Streak Display (Priority: P2)

**Goal**: Streak counters update in real-time from `streak_status` Firestore documents — zero frontend computation

**Independent Test**: Complete a habit, wait for backend trigger, verify UI streak matches `streak_status.currentStreak`.

- [ ] T024 [US4] Implement `src/hooks/useStreaks.ts` — accept array of `habitId`s from `useHabits`; subscribe via `habitService.subscribeToStreaks`; return `{ streakMap: Record<habitId, StreakStatus>, loading: boolean }`; show "0 days" default when no `streak_status` document exists for a habit
- [ ] T025 [US4] Wire streak display in dashboard `HabitsList` cards to read `currentStreak` from `useStreaks` — replace hardcoded `habit.streak` string with `streakMap[habit.id]?.currentStreak ?? 0` formatted as "X days"; preserve Flame icon styling
- [ ] T026 [US4] Wire `StreakPage` component to consume `useStreaks` hook — replace hardcoded streak data with real `currentStreak` and `longestStreak` from `streakMap`; show "0 days" for habits without a `streak_status` document
- [ ] T027 [US4] Wire `HabitsPage` streak display to read from `useStreaks` — same pattern as T025

**Checkpoint**: Streaks update within 5 seconds of completion via backend trigger. No frontend-computed streaks.

---

## Phase 7: User Story 5 — Statistics Page with Real Data (Priority: P2)

**Goal**: Statistics page shows real completion rates from Firestore, scoped by date range, using scheduled-days-only denominator

**Independent Test**: Log completions, open Statistics, verify percentages match actual `habit_logs` records.

- [ ] T028 [US5] Implement `src/hooks/useStatistics.ts` — accept `userId`, `startDate`, `endDate`; call `habitService.fetchHabitLogsForRange` with `limit(1000)` on range selection (lazy loading); fetch ALL user habits (including archived) for frequency data; calculate completion rate per habit as `completedCount / scheduledDayCount` where `scheduledDayCount` counts only days in range matching `frequency.days`; return `{ stats, loading, error, isCapped }` where `isCapped` is true when result count equals 1000
- [ ] T029 [US5] Replace all hardcoded mock data in `src/components/StatisticsPage.tsx` with `useStatistics` hook — replace `getStatistics()` function with real data; map real habits to the category performance bars and habit area breakdown; derive categories from habit `category` field; show "No data for this period" empty state when no logs exist; show "Showing data for your most recent habits" notice when `isCapped` is true; preserve all existing Framer Motion animations and Tailwind classes
- [ ] T030 [US5] Replace hardcoded profile name "Alex Morgan" in `StatisticsPage` header with real user `displayName` from `useAuth` — pass `userDisplayName` prop or consume `useAuth` directly

**Checkpoint**: Statistics driven entirely by Firestore. Denominator uses scheduled days only. Archived habit logs included.

---

## Phase 8: User Story 6 — User Profile & Settings (Priority: P2)

**Goal**: Settings shows real profile data, supports display name/timezone updates, and account deletion

**Independent Test**: Change display name, reload, confirm it persists. Delete account, confirm cascade.

- [ ] T031 [BACKEND-CHANGE] [US6] Implement `updateUserProfileAction` callable in `functions/src/handlers/api.js` — accept `displayName` (optional) and `timezone` (optional); if `displayName` provided, call `admin.auth().updateUser(uid, { displayName })` AND update `displayName` on `users/{uid}` document; if `timezone` provided, validate it's a valid IANA timezone string and update `users/{uid}.timezone`; update `updatedAt`. Export from `functions/index.js`. [SECURITY-GAP]
- [ ] T032 [US6] Add `updateUserProfile(data)` method to `src/services/habitService.ts` — call `updateUserProfileAction` callable
- [ ] T033 [US6] Wire Settings profile tab to display real data from `useAuth` — replace hardcoded `formData` state (`'Alex Morgan'`, `'alex.morgan@example.com'`) with `authState.user.displayName`, `authState.user.email`, and `authState.profile.timezone`; make email field read-only; add timezone selector field
- [ ] T034 [US6] Wire Settings save button to call `habitService.updateUserProfile` — persist `displayName` and `timezone` changes; call `refreshAuthState()` after successful save to update the sidebar header name; show success/error feedback
- [ ] T035 [US6] Wire Settings account deletion to call `deleteAccountAction` callable then sign out — add delete account button to Security tab; require confirmation dialog; call existing `deleteAccountAction` via `authService` pattern; call `signOut()` on success; show error message on failure
- [ ] T036 [US6] Replace hardcoded sidebar display name "Alex Morgan" in `src/App.tsx` `Sidebar` component with real `userDisplayName` — pass as prop from App's `userDisplayName` derivation

**Checkpoint**: Profile data round-trips. Account deletion cascades correctly.

---

## Phase 9: User Story 7 — Categories from Real Data (Priority: P2)

**Goal**: Categories page derives category list from real habits and supports batch rename

**Independent Test**: Create habits in "Health", verify Categories shows "Health". Rename to "Wellness", confirm all habits update.

- [ ] T037 [US7] Wire `CategoriesPage` to derive categories from `useHabits` data — replace hardcoded category tags with unique `category` values extracted from real habits; group habits by category; hide categories with zero non-archived habits
- [ ] T038 [US7] Wire category rename in `EditCategoryModal` to call `habitService.batchRenameCategory` — replace local `handleSaveEditedCategory` with callable invocation; the `onSnapshot` subscription will automatically reflect updated category names; show error on failure

**Checkpoint**: Categories fully derived from Firestore. Batch rename is atomic.

---

## Phase 10: User Story 8 — Push Notification Token Registration (Priority: P3)

**Goal**: Users can opt-in to push notifications from Settings; FCM token stored in Firestore

**Independent Test**: Grant notification permission, verify `users.pushToken` in Firestore.

- [ ] T039 [US8] Add "Enable Notifications" button to Settings notifications tab in `src/components/SettingsModal.tsx` — request `Notification.permission` on click; if granted, call `getToken(messaging)` with VAPID key from env; call `habitService.registerPushToken(token)`; if denied, show explanatory message; if already granted, show "Notifications enabled" status
- [ ] T040 [US8] Handle FCM token refresh in `src/services/habitService.ts` — use `onMessage(messaging, ...)` listener to handle foreground messages; no background service worker required for this release

**Checkpoint**: FCM token registered. Backend `reminderScheduler` can now deliver notifications.

---

## Phase 10.5: Tests — Frontend Services & Hooks (Priority: P1)

**Goal**: Fulfill CON-004 requirement by fully testing sync logic and new service functions

**Independent Test**: Run `npm test` and verify all new frontend unit tests pass

- [ ] T040a [P] [US1] Unit tests for `src/services/habitService.ts` — Mock Firebase SDK; verify `subscribeToHabits`, `subscribeToHabitLogs`, and CRUD callables handle success and error mappings correctly
- [ ] T040b [P] [US3] Unit tests for `src/hooks/useHabitLogs.ts` — Verify optimistic UI flip, callable invocation, and rollback on error
- [ ] T040c [P] [US4] Unit tests for `src/hooks/useHabits.ts` and `src/hooks/useStreaks.ts` — Verify state transitions (loading -> data/error) and subscription cleanup

---

## Phase 11: Polish & Cross-Cutting Concerns

**Purpose**: Cleanup, sidebar wiring, and validation

- [ ] T041 Remove all remaining hardcoded/mock habit data from `src/App.tsx` — delete the `getHabitsForDate` function with its seed-based mock data generation; delete inline `Habit` interface definition (replaced by `src/types/habit.ts`); delete `weeklyHabits` initial state array; ensure `habitData` Record state is removed
- [ ] T042 Wire `ActivityChart` in dashboard to use real completion data — replace `getCompletionForDay` mock calculation with data derived from `useHabitLogs` for the past 7 days
- [ ] T043 Verify all existing backend Jest tests pass by running `cd functions && npm test` — fix any regressions caused by new callable additions in `api.js`; do NOT modify `functions/src/core/` files
- [ ] T044 Verify frontend builds and lints cleanly by running `npm run lint && npm run build` from project root
- [ ] T045 Run quickstart.md validation — open app in two tabs, create a habit in tab 1, verify it appears in tab 2 via `onSnapshot`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 — BLOCKS all user stories
- **US1 (Phase 3)**: Depends on Phase 2
- **US2 (Phase 4)**: Depends on US1 (T016 replaces local state that US2 modifies)
- **US3 (Phase 5)**: Depends on US1 (needs `useHabits` for habit list)
- **US4 (Phase 6)**: Depends on US1 (needs habit IDs for streak subscription)
- **US5 (Phase 7)**: Depends on US1 (needs habits for frequency denominator)
- **US6 (Phase 8)**: Can start after Phase 2 (independent of habit hooks)
- **US7 (Phase 9)**: Depends on US1 (needs `useHabits` for category derivation)
- **US8 (Phase 10)**: Can start after Phase 2 (independent of habit hooks)
- **Polish (Phase 11)**: Depends on all story phases

### User Story Independence

- **US6** and **US8** can run in parallel with US1-US5
- **US4**, **US5**, **US7** can run in parallel after US1 completes
- **US2** and **US3** can run in parallel after US1 completes

### Within Each User Story

- Service methods before hooks
- Hooks before component wiring
- Component wiring before integration validation

### Parallel Opportunities

```text
# After Phase 2 completes, launch in parallel:
Stream A: US1 (T012-T016) → US2 (T017-T019) → US3 (T020-T023)
Stream B: US6 (T031-T036)
Stream C: US8 (T039-T040)

# After US1 completes, add parallel:
Stream D: US4 (T024-T027)
Stream E: US5 (T028-T030)
Stream F: US7 (T037-T038)
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T004)
2. Complete Phase 2: Foundational (T005-T011)
3. Complete Phase 3: US1 (T012-T016)
4. **STOP and VALIDATE**: Create a habit, reload, confirm persistence
5. Deploy/demo if ready

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. US1 → Habits persist → MVP!
3. US2 → Edit/Archive works
4. US3 → Completions sync with Logical OR
5. US4 → Streaks update in real-time
6. US5 → Statistics show real data
7. US6 → Profile/Settings wired
8. US7 → Categories from real data
9. US8 → Push notifications registered
10. Polish → Cleanup and validation

---

## Notes

- [P] tasks = different files, no dependencies
- [BACKEND-CHANGE] = modifies `functions/` — review separately
- [SECURITY-GAP] = callable added because `firestore.rules` blocks direct writes
- Do NOT modify `functions/src/core/` files
- Do NOT modify or remove existing Framer Motion animations or Tailwind classes
- Do NOT re-enable TOTP verification gates — leave TODO comments intact
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
