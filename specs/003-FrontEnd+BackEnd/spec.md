# Feature Specification: Connect Frontend to Backend

**Feature Branch**: `003-FrontEnd+BackEnd`
**Created**: 2026-04-24
**Status**: Draft
**Input**: User description: "Wire all frontend UI functions and data to the Firebase backend (Firestore + Cloud Functions). All meaningful state must migrate from local React state to the real backend."

## Clarifications

### Session 2026-04-24

- Q: Should habit CRUD use direct Firestore SDK writes or new Cloud Function callables? → A: Direct Firestore SDK writes from the authenticated client for habit CRUD (rules already permit this for the owning user); `syncHabitLogs` callable stays for log sync to preserve Logical OR semantics.
- Q: Should the Statistics page load logs eagerly (all at once) or lazily (on demand per range switch)? → A: Lazy / on-demand — query Firestore only when the user selects a date range, and cache the result locally for the session.
- Q: Should push notification permission be requested immediately on first sign-in or deferred to an in-app prompt? → A: Deferred — request only after the user explicitly visits Settings, to avoid surprise browser prompts.
- Q: Which write operations MUST work while the user is offline? → A: Completions only — habit completion toggles are queued by Firestore offline persistence (IndexedDB) and synced on reconnect; habit CRUD (create/edit/archive) requires active connectivity and MUST show a clear error if attempted offline.
- Q: How should concurrent edits to the same habit's metadata be resolved? → A: Last write wins — whichever device saves last overwrites the other; no conflict detection, merge logic, or stale-write warnings are required for habit metadata edits.
- Q: What should the UI display while the initial habit list is loading from Firestore? → A: Skeleton placeholders — show 3 dimmed habit-card-shaped placeholder elements to maintain layout stability and communicate that content is loading; replace with real data or an empty state once the first snapshot delivers.
- Q: Can users unarchive (restore) a previously archived habit in this release? → A: No — archive is a one-way action for this release; restore/unarchive is explicitly out of scope. Historical logs are preserved but the habit cannot be reactivated until a dedicated restore feature is built.
- Q: When a Firestore security rule gap blocks a required frontend write, what is the mandatory resolution path? → A: Add a minimal callable Cloud Function wrapper — keep security rules unchanged and route the blocked write through a new backend callable using the established `requireCallableAuth` pattern; document the gap and the new callable in the spec.
- Q: What is the denominator for calculating a habit's completion rate on the Statistics page? → A: Scheduled days only — only calendar days within the selected range on which the habit was scheduled (per its `frequency.days` field) count as the denominator. Days outside the schedule are excluded from both numerator and denominator.
- Q: Should historical completions from archived habits count in the Statistics page? → A: Yes — logs from archived habits are included in all Statistics calculations. Excluding them would cause rates to jump misleadingly when a habit is archived, producing a dishonest picture of historical performance.
- Q: What is the maximum number of `habit_logs` documents a single Statistics query may fetch? → A: 1,000 documents maximum per query (Firestore SDK default limit). If the query would exceed this, the Statistics page displays a notice: "Showing data for your most recent habits" — no pagination UI is required.

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Habit Management: Create & Read (Priority: P1)

A signed-in user opens the Habits page, creates a new habit by filling in the
name, metric, schedule days, and category, and immediately sees it appear in
their habit list. After a full page reload the habit is still present. A second
device owned by the same user also shows the habit upon reload.

**Why this priority**: Without persistent habit storage, every other feature
(completion, streaks, statistics, categories) has no real data to operate on.

**Independent Test**: Create a habit through the UI, reload the page, confirm
the habit appears with the same data. Verify the document exists in the
`habits` Firestore collection with the correct `userId`.

**Acceptance Scenarios**:

1. **Given** a signed-in user on the Add Habit form, **When** they submit valid
   habit data, **Then** a new document is created in `habits` and the habit
   immediately appears in the list without a page reload.
2. **Given** an existing habit document, **When** the user reloads the page,
   **Then** the habit list is repopulated from Firestore — no mock data is
   shown.
3. **Given** the user has zero habits, **When** the Habits page loads, **Then**
   an empty state message is shown (not a mock list).

---

### User Story 2 — Habit Management: Edit & Archive (Priority: P1)

A signed-in user edits an existing habit (name, metric, schedule, category) and
the update is reflected everywhere in the UI immediately. The user can also
soft-delete (archive) a habit so it no longer appears in active lists while its
historical logs are preserved.

**Why this priority**: Data integrity — edits and deletes must be durable and
consistent across sessions and devices.

**Independent Test**: Edit a habit field, reload the page, confirm the updated
value persists. Archive a habit, confirm it disappears from the active list but
its `habit_logs` documents remain in Firestore.

**Acceptance Scenarios**:

1. **Given** a signed-in user edits a habit, **When** they submit the form,
   **Then** the `habits` document is updated in Firestore and the UI reflects
   the change without a reload.
2. **Given** a signed-in user archives a habit, **When** the action is
   confirmed, **Then** the habit's `archived` field is set to `true` in
   Firestore and it disappears from all active lists immediately.
3. **Given** an archived habit, **When** the user queries `habit_logs`,
   **Then** the historical logs for that habit still exist and are accessible
   to the streak and statistics systems.

---

### User Story 3 — Daily Habit Completion & Sync (Priority: P1)

A signed-in user opens the Dashboard, sees the habits scheduled for today's
logical day (derived from their stored timezone), and checks off a habit. The
completion is persisted to Firestore. If the same habit was already checked on
another device, the "completed" state wins regardless of order (Logical OR).

**Why this priority**: Completion tracking is the core daily interaction. All
streaks and statistics depend on it.

**Independent Test**: Toggle a habit as complete, inspect the `habit_logs`
Firestore collection and confirm a document with `completed: true` exists for
today's logical date. Simulate a conflict by writing a second log with
`completed: false` and confirm the document retains `completed: true`.

**Acceptance Scenarios**:

1. **Given** a signed-in user with habits for today, **When** they tap the
   completion toggle, **Then** a log entry is written to `habit_logs` via
   `syncHabitLogs` with `completed: true` for the correct logical date.
2. **Given** a habit checked on device A while device B is offline,
   **When** device B comes online and syncs its unchecked state,
   **Then** the `habit_logs` document retains `completed: true` (Logical OR).
3. **Given** the user's timezone is stored as `America/New_York`, **When**
   they complete a habit at 1:00 AM, **Then** the logical date used is the
   previous calendar day (within the 3 AM grace period), consistent with the
   backend rule.

---

### User Story 4 — Real-Time Streak Display (Priority: P2)

After a user completes a habit, the streak counter on the Habit card and on the
Streak page automatically updates to show the current and longest streak values
sourced from the `streak_status` Firestore collection — computed by the backend
trigger, not by the frontend.

**Why this priority**: Streaks are a core engagement mechanic; stale or
independently computed values would undermine trust.

**Independent Test**: Complete a habit, wait for the `onHabitLogWrite` backend
trigger to recalculate streaks, then verify the streak counter in the UI matches
the `streak_status.currentStreak` value in Firestore.

**Acceptance Scenarios**:

1. **Given** a user completes a habit that extends their streak,
   **When** the backend trigger updates `streak_status`,
   **Then** the streak counter in the UI updates within 5 seconds without a
   page reload.
2. **Given** the `streak_status` document for a habit,
   **When** the Streak page loads,
   **Then** "Current Streak" and "Longest Streak" values match the Firestore
   document exactly.
3. **Given** a habit whose frequency rules change,
   **When** the user views the Streak page,
   **Then** the longest streak shown is the historical maximum — it is never
   reset by a frequency change.

---

### User Story 5 — Statistics Page with Real Data (Priority: P2)

The Statistics page loads real completion rates and habit counts from Firestore
for the authenticated user, scoped to the date range selected by the user
(Today / Weekly / Month). No hardcoded or mock data is visible.

**Why this priority**: Statistics is the primary feedback loop that motivates
continued use.

**Independent Test**: Log several habit completions across multiple days, open
Statistics, switch between Today / Weekly / Month ranges, and verify that the
percentages and counts match the actual `habit_logs` records.

**Acceptance Scenarios**:

1. **Given** a user with real habit logs, **When** they open the Statistics
   page, **Then** completion rates reflect actual `habit_logs` documents, not
   hardcoded values.
2. **Given** the user switches the date range selector, **When** the new
   range is selected, **Then** statistics update to reflect only logs within
   that range.
3. **Given** a user with no habit logs for the selected range, **When** they
   view Statistics, **Then** completion rate shows 0% and an appropriate empty
   state is displayed — not a loading spinner or error.
4. **Given** a user who archived a habit last month but completed it regularly
   before archiving, **When** they view Statistics for a range covering those
   completions, **Then** the archived habit's logs ARE included in the completion
   rate — the rate MUST NOT change after the habit was archived.

---

### User Story 6 — User Profile & Settings (Priority: P2)

The Settings panel displays the authenticated user's real display name, email,
and timezone from Firestore / Firebase Auth. The user can update their display
name and timezone, and those changes are persisted. Account deletion triggers a
full backend cascade delete and immediately signs the user out.

**Why this priority**: User identity and timezone are foundational to
correct habit scheduling and logical-day calculation.

**Independent Test**: Change the display name in Settings, reload the page, and
confirm the new name appears in the header. Change the timezone, complete a
habit near midnight, and verify the logical date matches the new timezone.

**Acceptance Scenarios**:

1. **Given** a signed-in user opens Settings, **When** the panel loads,
   **Then** the display name, email, and timezone shown match the `users`
   Firestore document and Firebase Auth profile.
2. **Given** a user updates their display name, **When** they save,
   **Then** Firebase Auth `displayName` is updated and the sidebar header
   reflects the new name without a reload.
3. **Given** a user updates their timezone, **When** they save,
   **Then** `users.timezone` is updated in Firestore and future logical-day
   calculations use the new timezone.
4. **Given** a signed-in user confirms account deletion, **When** the
   `deleteAccountAction` callable completes, **Then** all Firestore records
   are erased, the user is signed out, and the auth modal is shown.

---

### User Story 7 — Categories from Real Data (Priority: P2)

The Categories page derives its category list and associated habits from the
`category` field of the authenticated user's real `habits` Firestore documents.
Renaming a category updates all affected habit documents in a single batch.

**Why this priority**: Categories must be consistent with the real habit dataset
to avoid stale category names after edits.

**Independent Test**: Create habits in category "Health", open Categories, verify
"Health" appears with those habits listed. Rename "Health" to "Wellness", reload,
confirm all affected habit documents show `category: "Wellness"`.

**Acceptance Scenarios**:

1. **Given** habits with various category values, **When** the Categories page
   loads, **Then** the unique category list is derived from `habits` documents,
   not hardcoded.
2. **Given** a user renames a category, **When** the rename is submitted,
   **Then** all `habits` documents with the old category value are batch-updated
   to the new value in a single Firestore batch write.
3. **Given** a category with zero habits (all archived), **When** the Categories
   page loads, **Then** that category is not shown in the active list.

---

### User Story 8 — Push Notification Token Registration (Priority: P3)

When a signed-in user explicitly requests push notifications from the Settings
panel, the app requests browser notification permission, retrieves the FCM
device token, and stores it at `users.pushToken` in Firestore. The backend
reminder scheduler then uses this token to deliver habit reminders.

**Why this priority**: Enables the backend reminder scheduler to actually
deliver notifications; without this, all reminder logic is inert.

**Independent Test**: Grant notification permission in Settings, confirm the
`users.pushToken` field is set in Firestore, then verify the backend reminder
scheduler can read and use the token.

**Acceptance Scenarios**:

1. **Given** a signed-in user clicks "Enable Notifications" in Settings,
   **When** the browser grants notification permission, **Then** the FCM token
   is written to `users.pushToken` in Firestore.
2. **Given** the user denies notification permission, **When** the browser
   denies the request, **Then** no token is stored and a clear message is shown
   explaining that notifications are disabled.
3. **Given** an existing `pushToken`, **When** the user re-enables
   notifications, **Then** the token is refreshed (overwritten) in Firestore.

---

### Edge Cases

- What happens when a Firestore write fails during habit completion toggle?
  The optimistic UI update is reverted to the previous state and an inline error
  message is displayed. The user can retry the toggle.
- What happens when the user attempts to create, edit, or archive a habit while offline?
  Habit CRUD requires active connectivity. If the device is offline, the system
  MUST detect the connectivity failure, show an inline error ("No connection —
  changes could not be saved. Please retry when online."), and NOT apply an
  optimistic local update for CRUD operations.
- What happens if `streak_status` has no document for a given habit?
  The UI shows "0 days" for both current and longest streak until the backend
  trigger creates the document after the first completion.
- What happens when `habit_logs` query returns no results for Statistics?
  An empty-state view with "No data for this period" is shown instead of zero
  bars or a loading state.
- What happens if the user's stored timezone is invalid or missing?
  The system falls back to the browser's detected timezone for display and
  notifies the user to update their timezone in Settings.
- What happens when account deletion fails mid-cascade on the backend?
  The callable returns an error, the user is shown an actionable error message,
  and they remain signed in. No partial data loss occurs on the client.
- What happens when two devices edit the same habit's metadata simultaneously?
  Last write wins — Firestore's native update semantics apply. The final
  persisted state reflects whichever save reached Firestore last. No warning
  or conflict prompt is shown to the user.
- What does the user see while the habit list is loading on first page visit?
  Three dimmed skeleton habit-card placeholders are shown immediately after
  authentication resolves. They are replaced by real cards (or the empty-state
  message) as soon as the first `onSnapshot` delivery arrives. The skeleton
  state MUST NOT persist longer than 10 seconds; if no data arrives by then,
  an inline error with a retry action is shown instead.
- What happens when a Statistics query hits the 1,000-document limit?
  The query returns the first 1,000 matching `habit_logs` documents (ordered
  by `dateString` descending to favour the most recent data). The Statistics
  page displays a non-blocking notice: "Showing data for your most recent
  habits." Completion rates are calculated on the returned subset only —
  no second query or pagination is triggered.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST persist newly created habits to the `habits` Firestore
  collection with the authenticated user's `userId`, returning the document ID
  as the canonical habit identifier.
- **FR-002**: System MUST load the authenticated user's non-archived habits from
  Firestore on every page load and reflect real-time updates via `onSnapshot`
  subscriptions. While awaiting the first snapshot delivery, the system MUST
  display 3 dimmed skeleton habit-card placeholders to maintain layout stability;
  these MUST be replaced by real habit cards (or the empty-state message) as
  soon as the first snapshot arrives.
- **FR-003**: System MUST persist habit edits (name, metric, frequency days,
  category) to the existing `habits` Firestore document immediately on save.
  Concurrent edits from multiple devices are resolved by last write wins —
  no conflict detection or merge is required for habit metadata.
- **FR-004**: System MUST soft-delete habits by setting `archived: true` on the
  `habits` document; archived habits MUST be excluded from all active lists and
  completion flows. Archive is a **one-way action** in this release — no
  unarchive or restore capability is provided. The archived habit's `habit_logs`
  and `streak_status` documents are preserved for historical integrity.
- **FR-005**: System MUST submit habit completion toggles via the `syncHabitLogs`
  callable Cloud Function, passing the correct `habitId`, `dateString` (logical
  day in user's timezone), and `completed` boolean.
- **FR-006**: System MUST apply an optimistic UI update on habit completion toggle
  (the only offline-capable write operation) and revert if the backend call
  ultimately fails on reconnect, displaying a user-visible inline error. Habit
  CRUD operations (create/edit/archive) MUST NOT apply optimistic updates — they
  require connectivity and MUST surface a clear offline error if attempted without
  a network connection.
- **FR-007**: System MUST derive the logical date for habit completion using
  the timezone stored in `users.timezone`, consistent with the backend's
  3 AM grace period rule.
- **FR-008**: System MUST subscribe to `streak_status` Firestore documents
  via `onSnapshot` and display `currentStreak` and `longestStreak` values
  directly from those documents — no frontend streak computation is permitted.
- **FR-009**: System MUST load Statistics data from `habit_logs` and `habits`
  Firestore documents, scoped to the authenticated user and selected date range,
  only when the date range is selected (lazy loading). Completion rate MUST be
  calculated as `completedCount / scheduledDayCount` where `scheduledDayCount`
  is the number of days in the selected range on which the habit's
  `frequency.days` includes that day-of-week. Days outside the habit's schedule
  MUST NOT contribute to either the numerator or denominator. Logs from
  **archived habits MUST be included** in Statistics calculations — archiving a
  habit MUST NOT retroactively alter historical completion rates. Each Statistics
  query MUST apply a hard limit of **1,000 documents**; if results are capped,
  the Statistics page MUST display a non-blocking notice: "Showing data for your
  most recent habits."
- **FR-010**: System MUST display the authenticated user's real display name,
  email, and timezone in the Settings panel, sourced from the `users` Firestore
  document and Firebase Auth profile.
- **FR-011**: System MUST persist display name updates to Firebase Auth via
  `updateProfile` and update the `users` Firestore document accordingly.
- **FR-012**: System MUST persist timezone updates to `users.timezone` in
  Firestore and immediately use the updated timezone for all subsequent
  logical-day calculations in the current session.
- **FR-013**: System MUST call the `deleteAccountAction` callable Cloud Function
  on user-confirmed account deletion and sign the user out immediately upon
  success.
- **FR-014**: System MUST derive the Categories list from the unique `category`
  values present on the authenticated user's non-archived `habits` documents.
- **FR-015**: System MUST batch-update all affected `habits` documents when a
  category is renamed, in a single Firestore batch write.
- **FR-016**: System MUST request browser notification permission and store the
  FCM device token at `users.pushToken` in Firestore only when the user
  explicitly requests it from the Settings panel.
- **FR-017**: System MUST NOT modify Firestore security rules as part of this
  feature. If a security rule gap is discovered that blocks a required frontend
  write, the mandatory resolution path is to add a minimal callable Cloud
  Function using the existing `requireCallableAuth` pattern, document the gap
  in the spec, and route the write through that callable. New callables added
  under this policy MUST be flagged with a `[SECURITY-GAP]` comment in both
  the implementation task and the callable source.
- **FR-018**: System MUST preserve all existing Framer Motion animations and UI
  component aesthetics; this feature adds data wiring only.
- **FR-019**: System MUST leave all TOTP verification gate bypass TODO comments
  in `useAuth.tsx` and `App.tsx` untouched.
- **FR-020**: System MUST use the Firebase Web SDK v11 modular imports for all
  Firestore, Cloud Functions, and Messaging operations; no REST API calls to
  Firestore are permitted.

### Constitution Constraints *(mandatory)*

- **CON-001**: System MUST implement TOTP (Authenticator App) based Two-Factor
  Authentication (2FA). SMS-based authentication is strictly prohibited.
- **CON-002**: System MUST implement a "Hard Delete" on all user database records
  and Auth account on user account deletion (enforced by existing
  `deleteAccountAction` callable — this feature only calls it).
- **CON-003**: System MUST NOT lose any recorded habit completion during sync;
  conflict resolution MUST use "Logical OR" — enforced by the existing
  `syncHabitLogs` callable which this feature invokes.
- **CON-004**: System MUST have its synchronization and streak logic completely
  decoupled and fully covered by unit tests (existing backend tests must remain
  green; new frontend service functions must be unit-tested).
- **CON-005**: AI Agents executing tasks MUST exclusively use the Context7 MCP
  server for documentation and the Firebase MCP server for Firebase actions.
- **CON-006**: Every piece of meaningful cross-session data MUST be persisted to
  and retrieved from the Firebase backend. No application state meaningful beyond
  a single browser session may be kept exclusively in React component state or
  local memory. Habit CRUD, completion toggles (`syncHabitLogs`), streak data
  (`streak_status` collection), and user profile data (`users` collection) MUST
  all round-trip through the backend. The canonical timezone for logical-day
  calculations is `users.timezone`.

### Key Entities *(include if feature involves data)*

- **Habit**: A tracked activity owned by a user. Stored in the `habits`
  Firestore collection with fields: `id`, `userId`, `name`, `frequency`
  (type + days array), `reminders`, `category`, `archived`, `createdAt`,
  `updatedAt`.
- **Habit Log**: An immutable completion event for a specific habit and logical
  date. Stored in `habit_logs` with a composite document ID
  (`{userId}_{habitId}_{dateString}`). The `completed` boolean field is merged
  using Logical OR.
- **Streak Status**: A computed cache per habit in `streak_status` containing
  `currentStreak`, `longestStreak`, and `lastEvaluatedDate`. Written by the
  `onHabitLogWrite` backend trigger; read-only on the frontend.
- **User Profile**: The user's Firestore document in the `users` collection
  containing `id`, `email`, `timezone`, `totp`, `pushToken`, `createdAt`,
  `updatedAt`.
- **Auth Session State**: The discriminated union maintained by `useAuth` hook
  representing `loading` / `unauthenticated` / `authenticated_pending` /
  `authenticated_ready` states (defined in prior feature 002).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of habit create, edit, and archive operations result in a
  durable Firestore document change — verified by reloading the page and
  confirming the change persists.
- **SC-002**: 100% of habit completion toggles result in a `habit_logs`
  document with the correct `completed` value in Firestore, verifiable within
  3 seconds of the toggle action.
- **SC-003**: Streak values shown in the UI match the `streak_status` Firestore
  document values with 100% accuracy — no frontend-computed streak values appear
  anywhere in the application.
- **SC-004**: Statistics page completion rates match the ratio of
  `completed: true` logs to the total number of days the habit was scheduled
  (per `frequency.days`) within the selected date range — days outside the
  habit's schedule are excluded from both numerator and denominator. Zero
  hardcoded values remain in the Statistics page.
- **SC-005**: Account deletion leaves zero orphaned Firestore documents across
  `users`, `habits`, `habit_logs`, and `streak_status` collections for the
  deleted user.
- **SC-006**: Category rename updates 100% of affected `habits` documents in a
  single atomic batch write — no partial renames occur.
- **SC-007**: All existing backend Jest unit tests pass without modification
  after this feature is implemented.
- **SC-008**: The authenticated user's display name, email, and timezone shown
  in Settings match the corresponding Firestore and Firebase Auth values on
  every page load.

## Assumptions

- The existing Firestore security rules permit authenticated users to read and
  write their own `habits`, `users`, and `habit_logs` documents directly via the
  Firebase Web SDK. If a rule gap is discovered that blocks a required write,
  the resolution path is to add a minimal callable Cloud Function using the
  existing `requireCallableAuth` pattern (not to modify the security rules).
  The gap and the new callable MUST be documented in this spec before
  implementation proceeds.
- The `onHabitLogWrite` backend trigger fires reliably within a few seconds of a
  `habit_logs` document being written, making real-time streak updates feasible.
- Firebase Offline Persistence (IndexedDB) is enabled for the Firestore client
  instance. Offline persistence applies **only to habit completion toggles** —
  these are queued and synced on reconnect. Habit CRUD operations (create, edit,
  archive) require active connectivity and are not optimistically cached offline.
- The backend `syncHabitLogs` callable correctly enforces Logical OR merge for
  all callers — the frontend does not need to implement this logic itself.
- The TOTP verification gate remains bypassed for this feature (all authenticated
  users are treated as fully ready); re-enabling it is out of scope.
- FCM (Firebase Cloud Messaging) is configured in the Firebase project and the
  necessary VAPID key is available for web push token generation.
- The `functions/src/core/models.js` COLLECTIONS constants (`habits`,
  `habit_logs`, `streak_status`, `users`) match the actual Firestore collection
  names used in production.
- Non-web clients (iOS, Android) are out of scope for this feature.
- Unarchiving (restoring) a habit is out of scope for this release; the UI
  provides no mechanism to reverse an archive action. A restore feature may be
  introduced in a future feature branch.
