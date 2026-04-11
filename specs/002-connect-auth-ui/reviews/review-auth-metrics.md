# Auth Metrics Review Log

## Scope

Automated benchmark and responsiveness evidence for:

- T032 / SC-001 (sign-in timing)
- T033 / SC-004 (reload continuity)
- T034 / SC-005 (auth-state UI latency)
- T035 / SC-002 (registration first-attempt success)

## Protocol

- Date: 2026-04-11
- Command:

```bash
npx vitest run src/tests/authService.metrics.test.ts src/tests/app.auth-guards.test.tsx --reporter=verbose
```

- Environment: local Vitest harness with Firebase SDK calls mocked in test modules

## Results

| Task | Success Criterion | Trial Size | Assertion Implemented in Test | Observed Status |
| --- | --- | --- | --- | --- |
| T032 (SC-001) | >=95% of valid returning-user sign-ins complete in <60s | 20 sign-ins | `withinThreshold / 20 >= 0.95` where `withinThreshold` counts durations `< 60000ms` | PASS |
| T033 (SC-004) | >=99% of authenticated reloads remain recognized | 100 reload trials | `recognized / 100 >= 0.99` | PASS |
| T034 (SC-005) | >=99% of auth-state transitions reflect in <=5s | 100 transitions | `withinFiveSeconds / 100 >= 0.99` where elapsed `<= 5000ms` | PASS |
| T035 (SC-002) | >=95% of valid new-user registrations succeed on first attempt | 20 registrations | `successful / 20 >= 0.95` | PASS |

## Raw Test Evidence (Excerpt)

- `SC-001 benchmark: >=95% of 20 valid sign-ins finish under 60s` -> passed
- `SC-002 benchmark: >=95% of 20 valid registrations succeed on first attempt` -> passed
- `SC-004: 100 authenticated reload continuity trials keep session recognized >=99%` -> passed
- `SC-005: 100 auth-state transitions reflect in UI within 5 seconds >=99%` -> passed
- Run summary: `Test Files 2 passed`, `Tests 9 passed`

## Notes

- Benchmarks were executed in deterministic automated tests rather than manual stopwatch runs.
- Threshold assertions are codified in test logic, so regressions will fail CI/local runs automatically.