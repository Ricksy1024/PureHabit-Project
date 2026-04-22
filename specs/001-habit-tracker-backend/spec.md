# Feature Specification: Habit Tracker Backend Core

**Feature Branch**: `001-habit-tracker-backend`
**Created**: 2026-04-08
**Status**: Draft
**Input**: User description for building the PureHabit backend core.

## Clarifications

### Session 2026-04-08
- Q: Midnight Cutoff & Grace Periods → A: Fixed universal grace period (logical "day" ends at 3:00 AM local time).
- Q: Single Habit Deletion Strategy → A: Soft delete (archive) the habit to preserve historical logs.
- Q: "X times a week" Habit Evaluation → A: Habits map to specific days (e.g. Mon/Wed/Fri) allowing streak breaks to be calculated immediately.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Secure Login & Onboarding (Priority: P1)

A user registers a new account to start tracking habits. They enforce security by confirming their email and linking a TOTP Authenticator app. They can now rest assured their account is secure against unauthorized access.

**Why this priority**: Without secure authentication there is no system. Foundation of all interactions and data privacy.

**Independent Test**: Can be fully tested by creating an account, validating email tokens, and pairing a TOTP device for subsequent sign-ins.

**Acceptance Scenarios**:

1. **Given** a new user registers, **When** they submit email and password, **Then** they receive a verification email and cannot log in until verified.
2. **Given** a verified user logging in, **When** they do not have TOTP set up, **Then** the system prompts and demands TOTP setup.
3. **Given** a returning user with TOTP, **When** they provide valid credentials and TOTP code, **Then** they are authenticated into the system.

---

### User Story 2 - Account Deletion & Data Erasure (Priority: P1)

A user decides they no longer want to use the service. They request an account deletion.

**Why this priority**: Required for GDPR compliance and the "Strict Data Protection" core principle. Mandatory to be built alongside user creation to avoid data leaks.

**Independent Test**: Testable by creating an account, populating dummy data, triggering the deletion endpoint, and verifying zero records remain in the database.

**Acceptance Scenarios**:

1. **Given** an authenticated user requests account deletion, **When** the deletion is confirmed, **Then** all habits, habit logs, preferences, and the Auth account itself are permanently and irreversibly erased.

---

### User Story 3 - Offline Habit Logging & Sync (Priority: P2)

A user frequently commutes through areas without internet. They check off their morning habit while completely offline. Later on, they arrive at work, connect to Wi-Fi, and their app seamlessly syncs with the backend. Another device (e.g. their tablet) also independently logged a check.

**Why this priority**: This fulfills the core value proposition of an always-reliable system.

**Independent Test**: Testable by receiving delayed habit-completion webhook requests or API payloads with past timestamps and observing conflict resolution logic (Logical OR).

**Acceptance Scenarios**:

1. **Given** two competing sync payloads for the same habit and date (one checked, one unchecked), **When** the backend processes the conflict, **Then** the "checked" status always wins (Logical OR).
2. **Given** a sync payload from a past date, **When** the system receives it, **Then** it correctly inserts the historical log without overwriting newer continuous logs.

---

### User Story 4 - Changing Rules Without Penalty (Priority: P2)

A user has maintained a 30-day streak on a "3-days-a-week" habit. They decide they want to increase the difficulty to "Every Day". They change the habit rule.

**Why this priority**: Ensures the system is forgiving and encourages progression rather than penalizing rule updates.

**Independent Test**: Testable by asserting that the "Longest Streak" value for the habit remains exactly the same before and after the rule metadata is fully updated.

**Acceptance Scenarios**:

1. **Given** a user with an established 30-day longest streak, **When** they modify the habit goal frequency, **Then** the historical 30-day streak is preserved and the new frequency constraints apply only to future days.

---

### User Story 5 - Accurate Reminders (Priority: P3)

The user travels across timezones and sets a reminder for a habit at 8:00 PM. The system uses their active timezone to send a push notification precisely at 8:00 PM local time, but skips it if they already did the habit.

**Why this priority**: Important for user engagement, requires scheduled cron-like or queue processing.

**Independent Test**: Can be tested by simulating current clock time per timezone, evaluating the completion status, and observing notification queue dispatch.

**Acceptance Scenarios**:

1. **Given** a habit with an 8:00 PM reminder and no completion log for today, **When** the local time reaches 8:00 PM, **Then** a push notification is queued.
2. **Given** a habit with an 8:00 PM reminder that was already checked off today, **When** the local time reaches 8:00 PM, **Then** the reminder is suppressed.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST process offline sync payloads with past timestamps reliably.
- **FR-002**: System MUST merge sync payload conflicts applying the "Logical OR" rule (true overrides false).
- **FR-003**: System MUST determine whether a habit is completed for the "current day" strictly using the user's configured/detected Timezone.
- **FR-004**: System MUST suppress push notifications for habits that have already registered a completion log for the day in the user's timezone.
- **FR-005**: System MUST freeze/preserve historical streak metrics when frequency configuration for a habit is altered.
- **FR-006**: System MUST securely pair a TOTP seed with the user's account and mandate it during authentication.

### Constitution Constraints *(mandatory)*

- **CON-001**: System MUST implement TOTP (Authenticator App) based Two-Factor Authentication (2FA). SMS-based authentication is strictly prohibited.
- **CON-002**: System MUST implement a "Hard Delete" on all user databases records and Auth account on user account deletion.
- **CON-003**: System MUST NOT lose any recorded habit completion during sync (conflict resolution MUST use "Logical OR").
- **CON-004**: System MUST have its synchronization and streak logic completely decoupled and fully covered by unit tests.

### Key Entities

- **User**: Core profile containing timezone settings, Auth references, and TOTP secrets.
- **Habit**: Configuration for a tracked activity. Includes schedule mapping to **specific designated days** (e.g. Mon, Wed), reminder times, and an "archived" boolean state for soft-deletion.
- **Habit Log**: Immutable un-deletable (unless account is deleted) event representing a completion occurrence on a specific date/time for a habit.
- **Streak Status**: Calculated metric for a Habit containing "Current Streak" and "Longest Historic Streak".

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Habit logs from offline devices synchronize merging without dropping a single "completed" state across devices (100% success rate on Logical OR tests).
- **SC-002**: Notification system evaluates the user's localized timezone and dispatches reminders on time based on their local time frame.
- **SC-003**: Alterations to a Habit's frequency causes 0% drift or reset to the user's historical "Longest Streak" records.
- **SC-004**: Account deletion processes cascade through the database and finalize leaving 0 orphaned records tied to the user.

## Assumptions

- Users have intermittent internet connectivity, thus syncing payloads may contain events from days or weeks ago.
- Push Notification infrastructure (like APNS/FCM) will be integrated with our push worker.
- A logical "day" is strictly defined by the user's current contextual timezone, but extended with a fixed 3:00 AM grace period (e.g. 2:00 AM on Tuesday counts towards Monday's streak).
- The backend will use Node.js and Firebase based on the constitutional templates.
