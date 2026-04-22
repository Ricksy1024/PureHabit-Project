# Data Model: Habit Tracker Backend Core

## Firestore Collections

### Collection: `users`
Represents the core user profile.

- `id` (String): Firebase Auth UID.
- `email` (String): Verified email address.
- `timezone` (String): Standard IANA timezone (e.g., "America/Los_Angeles").
- `totp` (Object):
  - `enabled` (Boolean)
  - `secret` (String, encrypted/secured)
- `createdAt` (Timestamp)
- `updatedAt` (Timestamp)

### Collection: `habits`
Represents the user's tracking rules. Stored as a subcollection under `users/{userId}/habits` or root collection with `userId`. Let's use a root collection for shallower querying and easier exports.

- `id` (String): Auto-generated.
- `userId` (String): Reference to `users.id`.
- `name` (String): Display name of the habit.
- `frequency` (Object): 
  - `type` (String): Always "SPECIFIC_DAYS" (per Clarification decision).
  - `days` (Array<String>): e.g. `["MON", "WED", "FRI"]`.
- `reminders` (Array<Object>):
  - `time` (String): "HH:mm" 24h format.
- `archived` (Boolean): Default `false`. If true, habit is hidden but data is preserved.
- `createdAt` (Timestamp)
- `updatedAt` (Timestamp)

### Collection: `habit_logs`
Represents a completion event. To satisfy "Logical OR", we use a unique document ID based on Date + HabitID.

- `id` (String): Format `{habitId}_{YYYY-MM-DD}` (e.g., `hab123_2026-04-08`).
- `habitId` (String): Reference to `habits.id`.
- `userId` (String): Reference to `users.id`.
- `dateString` (String): The local date "YYYY-MM-DD" the completion occurred.
- `completed` (Boolean): true/false. (Conflict resolution ensures `true` overrides `false`).
- `timestamp` (Timestamp): Precise exact time of the action (used to resolve ties if needed, but logical OR takes precedence).

### Collection: `streak_status`
Calculated cache, 1:1 with Habits.

- `habitId` (String): Document ID matches the Habit ID.
- `userId` (String): Reference to `users.id`.
- `currentStreak` (Number): Number of sequential required days hit.
- `longestStreak` (Number): Max recorded.
- `lastEvaluatedDate` (String): "YYYY-MM-DD" of the last time this streak was computed, to prevent duplicate calculations.

## Database Rules (Cascades)
- **Account Deletion Cascade**: When triggered, a background job MUST query and `batch.delete()` all documents in `users`, `habits`, `habit_logs`, and `streak_status` matching the `userId`. Finally, `admin.auth().deleteUser(uid)` is called.
