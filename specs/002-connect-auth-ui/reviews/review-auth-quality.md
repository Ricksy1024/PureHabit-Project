# Auth Quality Review Log

## Scope

Implementation evidence for setup, foundational, and initial user-story auth integration tasks.

## RED -> GREEN Evidence

| Task IDs                              | RED Evidence (before)                                                                                                                                                                   | GREEN Evidence (after)                                                                                                                                                                                               |
| ------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| T001, T002, T003                      | No Firebase dependency in root package, no Firebase keys in `.env.example`, and README lacked auth integration setup/run details.                                                       | Added `firebase` dependency, added `VITE_FIREBASE_*` template keys to `.env.example`, and documented auth integration workflow in `README.md`.                                                                       |
| T004, T005                            | `src/config/firebase.ts` and `src/types/auth.ts` did not exist.                                                                                                                         | Added Firebase bootstrap module and shared auth/security/form-related type contracts.                                                                                                                                |
| T006                                  | No shared auth service existed; auth modal submit handler was TODO-only.                                                                                                                | Added `src/services/authService.ts` with auth API calls, cooldown logic, validation/error mapping, reset flow, TOTP callable wrappers, and profile retry loading.                                                    |
| T007, T008                            | No auth hook/provider existed and app bootstrap had no auth context wiring.                                                                                                             | Added `src/hooks/useAuth.ts` with real-time listener, stale-callback protection, periodic refresh for gated/profile-loading states, and provider wiring via `src/main.tsx`.                                          |
| T009                                  | Auth modal exposed Google action button in active form flow.                                                                                                                            | Google button is now non-operational/disabled and clearly labeled email/password-only scope.                                                                                                                         |
| T010-T015, T045-T047, T055-T056, T059 | App and auth modal were static, no Firebase submit orchestration, no protected action guards, no forgot-password behavior, no auth error/cooldown handling, and no sign-out transition. | Wired sign-in and register submit orchestration, cooldown/error messaging, password reset flow, authenticated/pending/unauthenticated guards, guided remediation UI, and sign-out action in sidebar.                 |
| T016-T021, T048, T057-T058            | No registration integration, no onboarding guidance, no continuity handling through close/reopen, no conflict/connectivity-specific register handling.                                  | Added registration flow, onboarding guidance for pending verification states, preserved form/onboarding state in modal, and inline actionable conflict/connectivity errors through service mapping + modal surfaces. |
| T022-T027, T049                       | No real-time auth/session state resilience, no profile retry fallback, and no invalid-session/account-conflict fallback handling.                                                       | Added token-change listener + guarded refresh lifecycle, profile fetch retry with placeholder state, and safe unauthenticated fallback handling for invalid sessions/conflicts.                                      |

## Constitution Verification Evidence

- CON-001 (TOTP-only 2FA scope): Searched `src/` and `functions/src/` for SMS/phone auth paths (`sms`, `signInWithPhoneNumber`, `PhoneAuthProvider`, `phoneNumber`) and found no matching implementation paths. Auth UI explicitly labels email/password-only scope and uses TOTP callable setup/verify contracts.
- CON-004 (sync/streak decoupling non-regression): Ran `npm --prefix /workspaces/PureHabit-Project/functions test -- tests/core/test_sync.js tests/core/test_streaks.js` and both suites passed (`2/2 suites`, `20/20 tests`).

## Notes

- Manual RED evidence was captured from the prior code state: static auth modal (`TODO: hook up real auth`), no auth provider, and missing auth integration files.
- Automated frontend test harness is not yet configured in the root package; this log currently records implementation-level RED/GREEN checks and lint/build verification evidence.

## Approved Auth Wording Matrix (T060)

| Context                          | Approved wording                                                                                       |
| -------------------------------- | ------------------------------------------------------------------------------------------------------ |
| Profile loading fallback         | `Profile loading... You can continue using the app while we retry in the background.`                  |
| Gated state title                | `Finish Security Setup`                                                                                |
| Unauthenticated gate title       | `Sign In Required`                                                                                     |
| Gated body copy                  | `Your account is signed in, but protected actions stay blocked until all security steps are complete.` |
| Sign-in success                  | `Sign in successful.`                                                                                  |
| Sign-up success                  | `Account created. Complete verification to unlock protected actions.`                                  |
| Ready-state success              | `Authentication complete. Protected actions are now unlocked.`                                         |
| Cooldown message                 | `Sign in is temporarily disabled. Retry in approximately {seconds} second(s).`                         |
| Password reset fallback error    | `Unable to process reset right now.`                                                                   |
| TOTP setup fallback error        | `Unable to start TOTP setup right now.`                                                                |
| TOTP verify fallback error       | `Invalid authentication code.`                                                                         |
| Email/password scope enforcement | `Email/password only in this release`                                                                  |
