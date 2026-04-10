# Tasks: Connect Auth UI

**Input**: Design documents from `/specs/002-connect-auth-ui/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/

**Tests**: Use pragmatic TDD for this feature. For each implementation task, record a RED failing automated test (where harness exists) or a RED failing manual scenario (where automation is not yet available), then implement and record GREEN passing evidence.

**Organization**: Tasks are grouped by user story so each story can be implemented and validated independently.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependency on incomplete tasks)
- **[Story]**: User story label (`[US1]`, `[US2]`, `[US3]`)
- All task descriptions include concrete file paths

## Quality Gates (Mandatory)

- **QG-001 (RED -> GREEN)**: For each implementation task (all non-commit tasks except pure documentation-only updates), capture RED evidence before code changes and GREEN evidence after completion in specs/002-connect-auth-ui/reviews/review-auth-quality.md.
- **QG-002 (Atomic Scope)**: One primary behavior per task. If a second behavior appears during implementation, add a new task ID instead of expanding scope.
- **QG-003 (Commit Discipline)**: Complete each phase or story checkpoint commit task (T050-T054) with task IDs referenced in the commit message body.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Prepare dependencies and environment contracts used by all stories.

- [ ] T001 Add Firebase Web SDK dependency in package.json
- [ ] T002 Create environment variable template for Firebase web config in .env.example
- [ ] T003 [P] Document auth integration setup/run instructions in README.md

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Build core auth infrastructure required before user story implementation.

**CRITICAL**: No user story work starts until this phase is complete.

- [ ] T004 Test-first: capture failing Firebase bootstrap scenario, then create Firebase app/auth/functions bootstrap module in src/config/firebase.ts
- [ ] T005 [P] Test-first: capture failing type-contract scenario, then define shared auth state, security status, and form state types in src/types/auth.ts
- [ ] T006 Test-first: capture failing auth-utils behavior scenario, then implement shared auth utilities (error mapping, validation, state helpers) in src/services/authService.ts
- [ ] T007 Test-first: capture failing auth hook bootstrap scenario, then implement baseline auth hook scaffold (state types, provider contract, single onAuthStateChanged subscription bootstrap, initial auth-state hydration) in src/hooks/useAuth.ts; reserve resilience hardening for T022
- [ ] T008 Test-first: capture failing provider wiring scenario, then integrate auth state provider wiring and bootstrap usage in src/main.tsx and src/App.tsx
- [ ] T009 Test-first: capture failing non-email-auth UI scenario, then enforce email/password-only scope by disabling non-email auth actions in src/components/AuthModal.tsx [FR-013]
- [ ] T050 Commit checkpoint: commit Setup + Foundational completion with task IDs T001-T009 in commit message body

**Checkpoint**: Foundation complete; user stories can be implemented.

---

## Phase 3: User Story 1 - Sign In With Working Authentication (Priority: P1) 🎯 MVP

**Goal**: Returning users can sign in, get actionable errors, and access authenticated UI with required security gating.

**Independent Test**: From the existing auth modal, sign in with valid credentials and verify authenticated UI; verify invalid credentials, cooldown behavior, and protected-action blocking for incomplete verification.

### Implementation for User Story 1

- [ ] T010 [US1] Test-first: capture failing valid-sign-in scenario, then implement sign-in flow with Firebase email/password auth in src/services/authService.ts [FR-001, SC-001]
- [ ] T011 [US1] Test-first: capture failing cooldown-threshold scenario, then implement client-session failed-attempt window and 15-minute cooldown logic in src/services/authService.ts [FR-016, SC-008]
- [ ] T012 [US1] Test-first: capture failing Sign In validation scenario, then wire Sign In submit orchestration with field-specific validation feedback in src/components/AuthModal.tsx [FR-003, SC-003]
- [ ] T013 [US1] Test-first: capture failing forgot-password submission scenario, then implement forgot-password action using sendPasswordResetEmail from the Sign In view without leaving the auth modal in src/components/AuthModal.tsx [FR-017]
- [ ] T014 [US1] Test-first: capture failing protected-action authorization scenario, then gate protected UI actions when email or TOTP verification is incomplete in src/App.tsx [FR-007, FR-014, SC-006, SC-007]
- [ ] T059 [US1] Test-first: capture failing unauthenticated protected-action scenario, then implement explicit unauthenticated guards for authenticated-only views/actions in src/App.tsx [FR-009, SC-006]
- [ ] T015 [US1] Test-first: capture failing sign-out transition scenario, then implement sign-out action and immediate unauthenticated UI transition in src/App.tsx [FR-010]
- [ ] T045 [US1] Test-first: capture failing Sign In error-surface scenario, then implement inline auth/network error rendering for Sign In in src/components/AuthModal.tsx [FR-004, FR-018, SC-003]
- [ ] T046 [US1] Test-first: capture failing Sign In retry-state scenario, then preserve Sign In form values across recoverable failures/retries in src/components/AuthModal.tsx [FR-011, FR-018]
- [ ] T055 [US1] Test-first: capture failing forgot-password non-enumeration scenario, then implement identical reset-confirmation messaging for registered and unregistered emails in src/components/AuthModal.tsx [FR-017]
- [ ] T056 [US1] Test-first: capture failing forgot-password connectivity scenario, then implement inline connectivity-specific reset-request error handling while preserving current Sign In form values in src/components/AuthModal.tsx [FR-018, FR-011]
- [ ] T047 [US1] Test-first: capture failing gated-remediation scenario, then render guided remediation states for incomplete email verification or TOTP in src/App.tsx [FR-015, SC-007]
- [ ] T051 Commit checkpoint: commit User Story 1 completion with task IDs T010-T015, T045-T047, T055-T056, T059 in commit message body

**Checkpoint**: User Story 1 is independently functional and testable.

---

## Phase 4: User Story 2 - Register New Account From UI (Priority: P1)

**Goal**: New users can register and complete guided post-registration onboarding toward a ready authenticated state.

**Independent Test**: Register a new user in the modal, confirm validation behavior and conflict handling, then verify guided onboarding persists through modal close/reopen.

### Implementation for User Story 2

- [ ] T016 [US2] Test-first: capture failing valid-sign-up scenario, then implement sign-up flow with Firebase createUserWithEmailAndPassword in src/services/authService.ts [FR-002, SC-002]
- [ ] T017 [P] [US2] Test-first: capture failing TOTP callable contract scenario, then implement callable setupTOTP/verifyTOTP client wrappers with normalized network-error surfaces so callers can preserve onboarding state in src/services/authService.ts [FR-008, FR-014]
- [ ] T018 [P] [US2] Test-first: capture failing post-registration state-transition scenario, then implement post-registration auth state resolver for email-verified and TOTP-verified transitions in src/hooks/useAuth.ts [FR-008, FR-014, FR-015]
- [ ] T019 [US2] Test-first: capture failing Register validation scenario, then wire Register tab submission with field-level validation feedback in src/components/AuthModal.tsx [FR-003, SC-003]
- [ ] T057 [US2] Test-first: capture failing Register conflict scenario, then implement actionable account-conflict error handling for registration failures in src/components/AuthModal.tsx [FR-004, SC-003]
- [ ] T058 [US2] Test-first: capture failing Register connectivity scenario, then implement inline network-failure handling for Register while preserving form state in src/components/AuthModal.tsx [FR-018, FR-011]
- [ ] T020 [US2] Test-first: capture failing onboarding-guidance scenario, then add guided onboarding UI for pending email verification and TOTP completion in src/components/AuthModal.tsx [FR-008, FR-015]
- [ ] T021 [US2] Test-first: capture failing form close/reopen continuity scenario, then preserve auth form progress across auth modal close/reopen in src/App.tsx and src/components/AuthModal.tsx [FR-011]
- [ ] T048 [US2] Test-first: capture failing onboarding close/reopen continuity scenario, then preserve onboarding step progress across auth modal close/reopen in src/App.tsx and src/components/AuthModal.tsx [FR-011]
- [ ] T052 Commit checkpoint: commit User Story 2 completion with task IDs T016-T021, T048, T057-T058 in commit message body

**Checkpoint**: User Stories 1 and 2 both work independently.

---

## Phase 5: User Story 3 - Real-Time Auth State Responsiveness (Priority: P2)

**Goal**: UI reflects auth/session/security changes in near real time without manual refresh.

**Independent Test**: Trigger sign-in/sign-out and external verification/session changes; verify UI transitions and modal guidance update automatically, including profile-loading fallback behavior.

### Implementation for User Story 3

- [ ] T022 [US3] Test-first: capture failing subscription-lifecycle scenario, then add lifecycle resilience on top of T007 baseline subscription (strict cleanup/re-subscribe guards, stale-callback protection) in src/hooks/useAuth.ts without re-implementing T007 bootstrap/provider contract work [FR-006]
- [ ] T023 [US3] Test-first: capture failing external-verification detection scenario, then implement external verification change detection via token refresh and claims re-evaluation in src/hooks/useAuth.ts [FR-006, FR-019]
- [ ] T024 [P] [US3] Test-first: capture failing profile-retry behavior scenario, then implement profile fetch with typed result states and capped exponential backoff retry (max 3 attempts: 1s, 2s, 4s) in src/services/authService.ts [FR-020]
- [ ] T025 [US3] Test-first: capture failing profile-loading-shell scenario, then render authenticated shell with inline "Profile loading..." placeholder while retries run in src/App.tsx [FR-020]
- [ ] T026 [US3] Test-first: capture failing account-conflict fallback scenario, then handle account-state conflicts by forcing safe unauthenticated fallback in src/hooks/useAuth.ts and src/App.tsx [FR-012, SC-006]
- [ ] T027 [US3] Test-first: capture failing modal-live-guidance scenario, then auto-update auth modal guidance in-place as verification prerequisites complete in src/components/AuthModal.tsx [FR-015, FR-019]
- [ ] T049 [US3] Test-first: capture failing invalid-session fallback scenario, then handle invalid-session detection with safe unauthenticated fallback in src/hooks/useAuth.ts and src/App.tsx [FR-012, SC-006]
- [ ] T053 Commit checkpoint: commit User Story 3 completion with task IDs T022-T027, T049 in commit message body

**Checkpoint**: All user stories are functional and independently testable.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final quality, documentation, and verification across all stories.

- [ ] T028 [P] Update end-to-end manual validation steps and acceptance checks in specs/002-connect-auth-ui/quickstart.md [SC-001, SC-002, SC-003, SC-004, SC-005, SC-006, SC-007, SC-008]
- [ ] T029 [P] Align auth integration contract details with implemented client behavior in specs/002-connect-auth-ui/contracts/auth-integration.md [FR-001, FR-002, FR-005, FR-006, FR-007, FR-010, FR-011, FR-012, FR-013, FR-014, FR-015, FR-016, FR-017, FR-018, FR-019, FR-020]
- [ ] T030 Test-first: capture failing auth-copy centralization scenario, then normalize auth UX copy via a single copy map for success/error/loading states in src/components/AuthModal.tsx and src/App.tsx [FR-004, FR-015]
- [ ] T060 Test-first: capture failing copy-review evidence scenario, then record the approved auth wording matrix in specs/002-connect-auth-ui/reviews/review-auth-quality.md [FR-004, FR-015]
- [ ] T031 Run lint and build verification using scripts in package.json and record outcomes in specs/002-connect-auth-ui/tasks.md [Quality Gate]
- [ ] T032 [P] Verify SC-001 with timed returning-user sign-in benchmark runs (>=20 valid runs, >=95% completed in <60s) and record evidence in specs/002-connect-auth-ui/reviews/review-auth-metrics.md [FR-001, SC-001]
- [ ] T033 [P] Verify SC-004 with authenticated reload continuity trials (>=100 reloads, >=99% remain recognized without re-auth) and record evidence in specs/002-connect-auth-ui/reviews/review-auth-metrics.md [FR-005, SC-004]
- [ ] T034 [P] Verify SC-005 with auth-state UI latency trials across sign-in/sign-out/external verification events (>=100 events, >=99% reflected in <=5s) and record evidence in specs/002-connect-auth-ui/reviews/review-auth-metrics.md [FR-006, SC-005]
- [ ] T035 [P] Verify SC-002 with new-user registration completion trials (>=20 valid new-user runs, >=95% reach guided next-step state on first attempt) and record protocol + evidence in specs/002-connect-auth-ui/reviews/review-auth-metrics.md [FR-002, FR-008, FR-015, SC-002]
- [ ] T036 [P] Verify SC-003 with a sign-in/sign-up failure matrix (validation, auth rejection, network-loss, account conflict; >=30 total failure events, 100% actionable user-visible errors) and record protocol + evidence in specs/002-connect-auth-ui/reviews/review-auth-quality.md [FR-003, FR-004, FR-018, SC-003]
- [ ] T037 [P] Verify SC-006 with protected-action authorization checks across unauthenticated and unauthorized states (>=30 blocked action attempts across critical protected views/actions, 100% blocked) and record protocol + evidence in specs/002-connect-auth-ui/reviews/review-auth-quality.md [FR-007, FR-009, SC-006]
- [ ] T038 [P] Verify SC-007 with gated-auth remediation checks for incomplete email verification and incomplete TOTP setup states (>=20 gated sessions, 100% blocked + guided remediation visible) and record protocol + evidence in specs/002-connect-auth-ui/reviews/review-auth-quality.md [FR-007, FR-014, FR-015, SC-007]
- [ ] T039 [P] Verify SC-008 with cooldown-enforcement trials (>=20 sessions that trigger 5 failures in 15 minutes, 100% enforce 15-minute disabled submit + cooldown messaging) and record protocol + evidence in specs/002-connect-auth-ui/reviews/review-auth-quality.md [FR-016, SC-008]
- [ ] T040 [P] Verify CON-001 by auditing auth UI + integration contract to confirm TOTP-only 2FA and explicit absence of SMS-based auth paths, and record evidence in specs/002-connect-auth-ui/reviews/review-auth-quality.md [CON-001]
- [ ] T041 [P] Verify CON-002 interoperability by executing an account-deletion regression flow (delete account -> active session invalidated -> safe unauthenticated fallback with no residual authenticated UI access) and record evidence in specs/002-connect-auth-ui/reviews/review-auth-quality.md [CON-002, FR-012]
- [ ] T042 [P] Verify CON-003 non-regression by running authenticated sync conflict scenarios through the new auth UI session path and confirming Logical OR completion preservation, and record evidence in specs/002-connect-auth-ui/reviews/review-auth-quality.md [CON-003]
- [ ] T043 [P] Verify CON-004 by running backend sync/streak decoupling unit-test suites and recording pass evidence in specs/002-connect-auth-ui/reviews/review-auth-quality.md [CON-004]
- [ ] T044 [P] Verify CON-005 process compliance by logging implementation-session evidence of Context7 for documentation lookup and Firebase MCP for Firebase actions in specs/002-connect-auth-ui/reviews/review-auth-quality.md [CON-005]
- [ ] T054 Commit checkpoint: commit Polish + verification completion with task IDs T028-T044, T060 in commit message body

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies; start immediately.
- **Phase 2 (Foundational)**: Depends on Phase 1; blocks all user stories.
- **Phase 3-5 (User Stories)**: Depend on Phase 2 completion.
- **Phase 6 (Polish)**: Depends on completion of desired user stories.

### User Story Dependencies

- **US1 (P1)**: Starts after Phase 2; primary MVP slice.
- **US2 (P1)**: Starts after Phase 2; can run in parallel with US1 after shared modal/service contracts are stable.
- **US3 (P2)**: Starts after Phase 2; T022 depends on T007 and is limited to lifecycle resilience hardening (cleanup/re-subscribe/stale-callback guards), while T007 remains the single source for baseline hook bootstrap/provider contract. The story is best completed after US1 and US2 flows are integrated to validate full real-time behavior.

### Dependency Graph

- Foundational complete -> US1 (MVP)
- Foundational complete -> US2
- T007 baseline hook scaffold complete -> T022 lifecycle hardening (non-overlapping scope)
- US1 + US2 integrated -> US3
- US1 + US2 + US3 complete -> Polish
- Setup + Foundation complete -> T050 commit checkpoint
- US1 complete -> T051 commit checkpoint
- US2 complete -> T052 commit checkpoint
- US3 complete -> T053 commit checkpoint
- Polish complete -> T054 commit checkpoint

---

## Parallel Opportunities

- Setup: T003 can run in parallel with T001-T002.
- Foundational: T005 can run in parallel with T004 after directory structure is in place.
- US2: T017 and T018 can run in parallel after base auth service/hook scaffolding is complete; then T057 and T058 can run in parallel after T019.
- US3: T024 can run in parallel with T022-T023 only after T007 has established the base hook contract.
- Polish: T028, T029, T032, T033, T034, T035, T036, T037, T038, T039, T040, T041, T042, T043, and T044 can run in parallel.
- Commit checkpoints T050-T054 are intentionally sequential and should not run in parallel.

### Parallel Example: User Story 2

- Run T017 and T018 in parallel once T016 establishes the core sign-up contract.
- Merge both outputs before executing T019, then run T057 and T058 in parallel before T020-T021 in src/components/AuthModal.tsx and src/App.tsx.

### Parallel Example: User Story 3

- Run T024 in src/services/authService.ts in parallel with T022-T023 in src/hooks/useAuth.ts after T007 is complete.
- Integrate into UI tasks T025-T027 after both service and hook behavior are stable.

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1 (Setup).
2. Complete Phase 2 (Foundational).
3. Complete Phase 3 (US1).
4. Validate US1 independently using its independent test criteria.
5. Demo/deploy MVP behavior.

### Incremental Delivery

1. Ship Setup + Foundational as internal baseline.
2. Deliver US1 (core sign-in path).
3. Deliver US2 (registration + guided onboarding).
4. Deliver US3 (real-time responsiveness + conflict handling).
5. Execute Phase 6 polish and final verification.

### Parallel Team Strategy

1. Team completes Phase 1-2 together.
2. Developer A: US1 service/modal integration tasks.
3. Developer B: US2 registration/onboarding tasks.
4. Developer C: US3 auth-state responsiveness tasks.
5. Final joint pass on Phase 6.

---

## Notes

- `[P]` tasks indicate safe parallelization points with minimal file contention.
- `[US#]` labels provide traceability from tasks to spec user stories.
- Keep each story independently testable before moving to the next story.
- Validate measurable success criteria in quickstart before closing the feature.
