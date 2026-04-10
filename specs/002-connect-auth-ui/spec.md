# Feature Specification: Connect Auth UI

**Feature Branch**: `[002-connect-auth-ui]`  
**Created**: 2026-04-10  
**Status**: Draft  
**Input**: User description: "The objective is to connect the UI Login/register window with the BackEnd! For this you have to understand the current project structure, the current UI and BackEnd relationship, And the Full BackEnd functionalities! The main goal, is to have a functioning UI Login/Regiszter page with working backend Firebase login,authentication and real time responsiveness! For the UI: read the src/ path and its contents. For the backEnd read the specs/001-habit-tracker-backend/ files and implementation plan for understanding, and read the files in the functions/ folder!"

## Clarifications

### Session 2026-04-10

- Q: Should this release include Google OAuth or only email/password auth? → A: Email/password only; Google OAuth is out of scope for this release.
- Q: Should users get a session before email/TOTP completion? → A: Yes, create session but block protected operations until email verification and TOTP are complete, with guided next steps.
- Q: How should repeated failed sign-in attempts be handled? → A: After 5 failed attempts in 15 minutes, show a cooldown message and disable sign-in submit for 15 minutes on that client session.
- Q: Should the "Forgot Password" flow be functional or hidden in this release? → A: Functional — trigger Firebase sendPasswordResetEmail and show a confirmation toast. Low cost and prevents user lockout.
- Q: What should happen when sign-in/sign-up is submitted but the network request fails? → A: Show inline form error ("Unable to connect. Check your connection and try again.") and preserve all entered form data for manual retry.
- Q: What should happen when verification is completed externally while the auth modal is open? → A: Auto-update the modal in-place via the real-time auth state listener — remove completed steps from guidance, show success state if all steps are done.
- Q: What should the UI do when auth succeeds but the user profile cannot be loaded? → A: Show authenticated shell with inline "Profile loading…" placeholder and auto-retry in background (max 3 attempts with backoff). Avoids blocking auth for transient Firestore hiccups.

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Sign In With Working Authentication (Priority: P1)

A returning user opens the login window, enters email/password credentials, and is signed into their account through the existing backend authentication flow.

**Why this priority**: If sign-in does not work, users cannot access their account or habits.

**Independent Test**: Can be fully tested by signing in from the UI with a valid existing account and confirming access to authenticated app content.

**Acceptance Scenarios**:

1. **Given** a registered user with valid credentials, **When** they submit the Sign In form, **Then** they are authenticated and the UI reflects signed-in status.
2. **Given** a user enters invalid credentials, **When** they submit the Sign In form, **Then** the UI shows a clear actionable error and keeps the user unauthenticated.
3. **Given** a user reaches 5 failed sign-in attempts within 15 minutes, **When** they try again during cooldown, **Then** the sign-in submit action is disabled for 15 minutes in that client session and a cooldown message is displayed.
4. **Given** a user without completed security prerequisites, **When** they attempt protected actions after sign-in, **Then** the UI clearly guides them through required verification steps.

---

### User Story 2 - Register New Account From UI (Priority: P1)

A new user opens the register flow, creates an account from the UI with email/password, and completes the required onboarding gates to reach an authenticated ready state.

**Why this priority**: Registration is the entry point for all new users and directly impacts growth.

**Independent Test**: Can be fully tested by creating a new account through the UI, completing required verification steps, and confirming first successful authenticated session.

**Acceptance Scenarios**:

1. **Given** a new visitor, **When** they submit valid registration information, **Then** an account is created and they are guided through next required onboarding steps.
2. **Given** registration data fails validation or conflicts with an existing account, **When** the user submits the form, **Then** the UI displays a specific correction path.
3. **Given** a user closes and reopens the auth flow mid-onboarding, **When** they return, **Then** they can continue from their current account state without data loss.

---

### User Story 3 - Real-Time Auth State Responsiveness (Priority: P2)

An authenticated user sees immediate UI state changes when their authentication or account state changes (sign-in, sign-out, verification completion, or remote account changes).

**Why this priority**: Real-time responsiveness prevents stale state confusion and builds trust.

**Independent Test**: Can be fully tested by changing account/auth state and verifying the UI updates without manual refresh.

**Acceptance Scenarios**:

1. **Given** a user signs in, **When** authentication state changes to authenticated, **Then** login/register controls update immediately to account-aware controls.
2. **Given** a signed-in user signs out, **When** authentication state changes to unauthenticated, **Then** protected views are hidden and login/register controls are restored.
3. **Given** account security state changes from another device or backend action, **When** the change occurs, **Then** the active UI session reflects the change and enforces correct access rules.

### Edge Cases

- What happens when a user submits the form while offline or with unstable connectivity? The system displays an inline error within the form and preserves all entered data so the user can retry without re-entering credentials.
- How does the system handle repeated failed sign-in attempts within a short period? After 5 failed attempts in 15 minutes, the client enters a 15-minute submit cooldown with a clear recovery message.
- How does the UI behave if the account is deleted while the user is still signed in on another device? Per FR-012, the system surfaces the account-state conflict and transitions the user to a safe unauthenticated state.
- What happens when verification is completed externally after the auth modal is already open? The modal auto-updates in-place via the real-time auth state listener, removing completed steps and showing success when all steps are done.
- How does the system recover if authentication succeeds but user profile data is temporarily unavailable? The system shows the authenticated shell with an inline "Profile loading…" placeholder and auto-retries loading the profile in the background (max 3 attempts with exponential backoff).
- What happens when a user submits a password reset request for an email that is not registered? The system shows the same confirmation message regardless to prevent email enumeration.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: System MUST let users sign in from the existing UI authentication modal using backend-backed account authentication.
- **FR-002**: System MUST let new users register from the existing UI authentication modal.
- **FR-003**: System MUST provide clear, field-specific validation feedback for registration and sign-in input errors.
- **FR-004**: System MUST present actionable failure messages for authentication failures without exposing sensitive internals.
- **FR-005**: System MUST preserve authenticated session continuity across full page reloads in the same browser session whenever the Firebase Auth session is still valid, and MUST restore the corresponding authenticated or unauthenticated UI state without requiring credential re-entry.
- **FR-006**: System MUST update visible authentication UI state in near real time when account/session state changes.
- **FR-007**: System MUST enforce existing backend-defined security prerequisites for every protected operation and block execution until prerequisites are satisfied (including users who already have an authenticated session).
- **FR-008**: System MUST require newly registered users to complete required post-registration security steps before marking account setup complete (see FR-015 for ongoing remediation guidance while gated).
- **FR-009**: System MUST prevent unauthenticated access to authenticated-only user actions and views.
- **FR-010**: System MUST support user-initiated sign-out and immediately revoke access to authenticated-only UI features.
- **FR-011**: System MUST preserve user-entered auth form data and in-progress onboarding state through recoverable transient errors and auth modal close/reopen actions, unless the user explicitly invokes a reset action.
- **FR-012**: System MUST surface account-state conflicts (for example deleted account or invalid session) and transition users to a safe unauthenticated state.
- **FR-013**: System MUST scope this release to email/password authentication only and keep Google OAuth sign-in non-operational in this release.
- **FR-014**: System MUST allow authenticated session creation before verification completion and place the user into a gated authenticated state until both email verification and TOTP are complete (see FR-007 for protected-operation enforcement).
- **FR-015**: System MUST present clear guided remediation steps for any signed-in user in the gated authenticated state caused by incomplete email verification or TOTP setup, including returning users and newly registered users (see FR-008 for new-account completion criteria).
- **FR-016**: System MUST apply a client-session sign-in cooldown after 5 failed attempts in 15 minutes by disabling sign-in submit for 15 minutes and displaying a clear recovery message.
- **FR-017**: System MUST provide a functional "Forgot Password" flow on the Sign In view that triggers Firebase `sendPasswordResetEmail` and displays a confirmation toast upon successful submission, without leaving the auth modal.
- **FR-018**: When a sign-in, sign-up, or related auth network request fails, the system MUST display an inline connectivity-specific error in the active auth form and MUST preserve the current form inputs and onboarding step state so the user can retry immediately.
- **FR-019**: System MUST auto-update the auth modal in-place when external verification or security status changes are detected via the real-time auth state listener, removing completed steps from the guided view and showing a success state when all prerequisites are fulfilled.
- **FR-020**: System MUST show the authenticated UI shell when Firebase Auth succeeds even if the user profile document is temporarily unavailable, displaying an inline "Profile loading…" placeholder and auto-retrying profile fetch in the background (max 3 attempts with exponential backoff).

### Constitution Constraints _(mandatory)_

- **CON-001**: System MUST implement TOTP (Authenticator App) based Two-Factor Authentication (2FA). SMS-based authentication is strictly prohibited.
- **CON-002**: System MUST implement a "Hard Delete" on all user databases records and Auth account on user account deletion.
- **CON-003**: System MUST NOT lose any recorded habit completion during sync (conflict resolution MUST use "Logical OR").
- **CON-004**: System MUST have its synchronization and streak logic completely decoupled and fully covered by unit tests.
- **CON-005**: AI Agents executing tasks MUST exclusively use the Context7 MCP server for documentation and the Firebase MCP server for Firebase actions.

### Key Entities _(include if feature involves data)_

- **Auth Session State**: Represents whether the current user is unauthenticated, authenticated, or blocked on required security completion.
- **Auth Attempt**: Represents a single sign-in or sign-up submission, including input validation outcome and user-visible error/success status.
- **Account Security Status**: Represents whether required account verification gates are complete for protected actions.
- **User Profile Presence**: Represents whether the account has the required profile record needed for authenticated app usage.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: At least 95% of valid returning users can complete sign-in from the auth modal in under 60 seconds.
- **SC-002**: At least 95% of valid new users can complete registration and reach a guided next-step state on first attempt.
- **SC-003**: 100% of sign-in and sign-up failures return a user-visible, actionable error message.
- **SC-004**: 99% of authenticated sessions remain correctly recognized after page reload without requiring unnecessary re-entry of credentials.
- **SC-005**: Authentication state changes are reflected in visible UI controls within 5 seconds in 99% of observed events.
- **SC-006**: 100% of protected UI actions are inaccessible when the user is unauthenticated or no longer authorized.
- **SC-007**: 100% of users with incomplete email verification or TOTP are blocked from protected operations and shown a guided remediation state.
- **SC-008**: 100% of sessions that reach 5 failed sign-in attempts in 15 minutes enforce the 15-minute client-session cooldown with visible user messaging.

## Assumptions

- The existing backend authentication and account security rules remain the source of truth and are not redefined by this feature.
- Existing account verification and security prerequisites continue to be required for protected backend operations.
- The current auth modal remains the primary entry point for both sign-in and registration in this release.
- This feature focuses on web UI authentication and session responsiveness; non-web clients are out of scope.
- Existing backend callable capabilities for account security and sync remain available and operational.
