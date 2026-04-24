# Research & Architecture Decisions

**Feature**: `003-FrontEnd+BackEnd`

## 1. Habit State Management (`useHabits`)

- **Decision**: Create a `useHabits` hook that uses Firebase's `onSnapshot` to subscribe to the `habits` collection where `userId == uid`.
- **Rationale**: Provides real-time synchronization out-of-the-box. Firestore SDK's offline persistence ensures cached habits are available immediately on load.
- **States**: 
  - `loading`: Initially `true`. The UI shows 3 skeleton cards (max 10s).
  - `error`: Populated if the snapshot fails (e.g., permission denied).
  - `data`: The array of parsed `Habit` objects.
  - `empty`: Handled by checking if `data.length === 0` after `loading` becomes `false`.

## 2. Habit Log State Management (`useHabitLogs`)

- **Decision**: Create a `useHabitLogs` hook that listens to `habit_logs` via `onSnapshot` bounded by a date range, and exposes a `toggleCompletion` function.
- **Rationale**: `onSnapshot` handles incoming updates (even from other devices). The toggle function will optimistically update the React state, then call the backend `syncHabitLogs` Cloud Function. If the function throws an error, the optimistic update is reverted and an error toast is shown.

## 3. Streak State Management (`useStreaks`)

- **Decision**: Create a `useStreaks` hook that subscribes to `streak_status` via `onSnapshot` where `userId == uid`.
- **Rationale**: The backend computes streaks automatically via triggers when logs change. The frontend purely observes this collection to satisfy SC-003 (no frontend-computed streaks).

## 4. Firestore Service Layer (`habitService.ts`)

- **Decision**: `habitService.ts` will house the logic for establishing `onSnapshot` listeners and invoking Cloud Function callables, but it will NOT perform direct Firestore SDK writes (`addDoc`, `setDoc`, `updateDoc`, `deleteDoc`).
- **Rationale**: The current `firestore.rules` specify `allow write: if false` across all collections. Spec Clarification Q5 explicitly mandates: *"Add a minimal callable Cloud Function wrapper — keep security rules unchanged and route the blocked write through a new backend callable"*.

## 5. Missing Backend Endpoints

- **Decision**: Create three new callable Cloud Functions in `functions/src/handlers/api.js`: `createHabitAction`, `updateHabitAction`, and `archiveHabitAction`.
- **Rationale**: As noted above, Firestore rules block direct client writes. We must follow the `requireCallableAuth` pattern established in the constitution to perform CRUD operations on habits.

## 6. Offline / Optimistic Updates

- **Decision**: Enable `enableMultiTabIndexedDbPersistence` in `src/config/firebase.ts`. For habit completions, `useHabitLogs` will apply the toggle to local React state instantly. Since the write must go through a Cloud Function (`syncHabitLogs`) and callables do not auto-queue offline like Firestore SDK writes, the hook will catch network errors from the callable and revert the optimistic UI update.
- **Rationale**: Balances the "ready-for-ready" speed requirement with the reality of callable functions. Read operations will work seamlessly offline via the Firestore cache.

## 7. FCM Push Token Registration

- **Decision**: Create a `useFCM` hook or put logic in `habitService.ts` to request notification permissions and get the FCM token using `getToken(messaging)`. Send this token to the backend using a new `registerDeviceToken` callable (or add it to user profile).
- **Rationale**: The backend `reminderScheduler` needs FCM tokens to send push notifications. Since writes to the `users` collection are blocked by rules, saving the token must also be done via a callable wrapper.

## 8. Statistics Page Data Fetching

- **Decision**: Use lazy loading in a new `useStatistics` or expanded `useHabitLogs` hook. Query `habit_logs` where `userId == uid`, `dateString >= startDate`, `dateString <= endDate`, bounded by `limit(1000)`.
- **Rationale**: Directly addresses Clarification Q3. If the result set hits 1000, we display the notice "Showing data for your most recent habits." We will also fetch all of the user's habits to calculate the `frequency.days` denominator as mandated by Clarification Q1.
