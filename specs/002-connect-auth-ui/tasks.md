# Tasks: Connect Auth UI

**Input**: Design documents from `/specs/002-connect-auth-ui/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/

**Tests**: The specification does not explicitly require automated TDD for this feature. Tasks focus on implementation and independent manual verification criteria per user story.

**Organization**: Tasks are grouped by user story so each story can be implemented and validated independently.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependency on incomplete tasks)
- **[Story]**: User story label (`[US1]`, `[US2]`, `[US3]`)
- All task descriptions include concrete file paths

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Prepare dependencies and environment contracts used by all stories.

- [ ] T001 Add Firebase Web SDK dependency in package.json
- [ ] T002 Create environment variable template for Firebase web config in .env.example
- [ ] T003 [P] Document auth integration setup/run instructions in README.md

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Build core auth infrastructure required before user story implementation.

**CRITICAL**: No user story work starts until this phase is complete.

- [ ] T004 Create Firebase app/auth/functions bootstrap module in src/config/firebase.ts
- [ ] T005 [P] Define shared auth state, security status, and form state types in src/types/auth.ts
- [ ] T006 Implement shared auth utilities (error mapping, validation, state helpers) in src/services/authService.ts
- [ ] T007 Implement baseline auth hook scaffold (state types, provider contract, single onAuthStateChanged subscription bootstrap, initial auth-state hydration) in src/hooks/useAuth.ts; reserve resilience hardening for T022
- [ ] T008 Integrate auth state provider wiring and bootstrap usage in src/main.tsx and src/App.tsx
- [ ] T009 Enforce email/password-only scope by disabling non-email auth actions in src/components/AuthModal.tsx

**Checkpoint**: Foundation complete; user stories can be implemented.

---

## Phase 3: User Story 1 - Sign In With Working Authentication (Priority: P1) 🎯 MVP

**Goal**: Returning users can sign in, get actionable errors, and access authenticated UI with required security gating.

**Independent Test**: From the existing auth modal, sign in with valid credentials and verify authenticated UI; verify invalid credentials, cooldown behavior, and protected-action blocking for incomplete verification.

### Implementation for User Story 1

- [ ] T010 [US1] Implement sign-in flow with Firebase email/password auth in src/services/authService.ts
- [ ] T011 [US1] Implement client-session failed-attempt window and 15-minute cooldown logic in src/services/authService.ts
- [ ] T012 [US1] Wire Sign In submit handling with field-specific validation feedback, inline network/auth errors, and form-value preservation in src/components/AuthModal.tsx
- [ ] T013 [US1] Implement forgot-password action using sendPasswordResetEmail with non-enumerating confirmation UI plus inline network-failure handling that preserves current auth form state in src/components/AuthModal.tsx
- [ ] T014 [US1] Gate protected UI actions and show remediation guidance when email or TOTP verification is incomplete in src/App.tsx
- [ ] T015 [US1] Implement sign-out action and immediate unauthenticated UI transition in src/App.tsx

**Checkpoint**: User Story 1 is independently functional and testable.

---

## Phase 4: User Story 2 - Register New Account From UI (Priority: P1)

**Goal**: New users can register and complete guided post-registration onboarding toward a ready authenticated state.

**Independent Test**: Register a new user in the modal, confirm validation behavior and conflict handling, then verify guided onboarding persists through modal close/reopen.

### Implementation for User Story 2

- [ ] T016 [US2] Implement sign-up flow with Firebase createUserWithEmailAndPassword in src/services/authService.ts
- [ ] T017 [P] [US2] Implement callable setupTOTP/verifyTOTP client wrappers with normalized network-error surfaces so callers can preserve onboarding state in src/services/authService.ts
- [ ] T018 [P] [US2] Implement post-registration auth state resolver for email-verified and TOTP-verified transitions in src/hooks/useAuth.ts
- [ ] T019 [US2] Wire Register tab submission with field-level validation feedback, conflict errors, and inline network-failure handling that preserves form/onboarding state in src/components/AuthModal.tsx
- [ ] T020 [US2] Add guided onboarding UI for pending email verification and TOTP completion in src/components/AuthModal.tsx
- [ ] T021 [US2] Preserve onboarding and form progress across auth modal close/reopen in src/App.tsx and src/components/AuthModal.tsx

**Checkpoint**: User Stories 1 and 2 both work independently.

---

## Phase 5: User Story 3 - Real-Time Auth State Responsiveness (Priority: P2)

**Goal**: UI reflects auth/session/security changes in near real time without manual refresh.

**Independent Test**: Trigger sign-in/sign-out and external verification/session changes; verify UI transitions and modal guidance update automatically, including profile-loading fallback behavior.

### Implementation for User Story 3

- [ ] T022 [US3] Add lifecycle resilience on top of T007 baseline subscription (strict cleanup/re-subscribe guards, stale-callback protection) in src/hooks/useAuth.ts without re-implementing T007 bootstrap/provider contract work
- [ ] T023 [US3] Implement external verification change detection via token refresh and claims re-evaluation in src/hooks/useAuth.ts
- [ ] T024 [P] [US3] Implement profile fetch with typed result states and capped exponential backoff retry (max 3 attempts: 1s, 2s, 4s) in src/services/authService.ts
- [ ] T025 [US3] Render authenticated shell with inline "Profile loading..." placeholder while retries run in src/App.tsx
- [ ] T026 [US3] Handle account-state conflicts and invalid sessions by forcing safe unauthenticated fallback in src/hooks/useAuth.ts and src/App.tsx
- [ ] T027 [US3] Auto-update auth modal guidance in-place as verification prerequisites complete in src/components/AuthModal.tsx

**Checkpoint**: All user stories are functional and independently testable.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final quality, documentation, and verification across all stories.

- [ ] T028 [P] Update end-to-end manual validation steps and acceptance checks in specs/002-connect-auth-ui/quickstart.md
- [ ] T029 [P] Align auth integration contract details with implemented client behavior in specs/002-connect-auth-ui/contracts/auth-integration.md
- [ ] T030 Normalize auth UX copy for consistency across success/error/loading states in src/components/AuthModal.tsx and src/App.tsx
- [ ] T031 Run lint and build verification using scripts in package.json and record outcomes in specs/002-connect-auth-ui/tasks.md
- [ ] T032 [P] Verify SC-001 with timed returning-user sign-in benchmark runs (>=20 valid runs, >=95% completed in <60s) and record evidence in specs/002-connect-auth-ui/reviews/review-auth-metrics.md
- [ ] T033 [P] Verify SC-004 with authenticated reload continuity trials (>=100 reloads, >=99% remain recognized without re-auth) and record evidence in specs/002-connect-auth-ui/reviews/review-auth-metrics.md
- [ ] T034 [P] Verify SC-005 with auth-state UI latency trials across sign-in/sign-out/external verification events (>=100 events, >=99% reflected in <=5s) and record evidence in specs/002-connect-auth-ui/reviews/review-auth-metrics.md

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

---

## Parallel Opportunities

- Setup: T003 can run in parallel with T001-T002.
- Foundational: T005 can run in parallel with T004 after directory structure is in place.
- US2: T017 and T018 can run in parallel after base auth service/hook scaffolding is complete.
- US3: T024 can run in parallel with T022-T023 only after T007 has established the base hook contract.
- Polish: T028, T029, T032, T033, and T034 can run in parallel.

### Parallel Example: User Story 2

- Run T017 and T018 in parallel once T016 establishes the core sign-up contract.
- Merge both outputs before executing T019-T021 in src/components/AuthModal.tsx and src/App.tsx.

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
