# Data Model: Frontend Types

**Feature**: `003-FrontEnd+BackEnd`

This document defines the TypeScript interfaces that map to the Firestore schema and power the React frontend. These types should be placed in `src/types/habit.ts`.

## `Habit`
Represents a tracking rule. Maps to the `habits` Firestore collection.

```typescript
export interface HabitFrequency {
  type: 'SPECIFIC_DAYS';
  days: string[]; // 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'
}

export interface HabitReminder {
  time: string; // 'HH:mm'
}

export interface Habit {
  id: string; // Auto-generated Firestore ID
  userId: string;
  name: string;
  frequency: HabitFrequency;
  reminders: HabitReminder[];
  archived: boolean;
  createdAt: Date; // Converted from Firestore Timestamp
  updatedAt: Date; // Converted from Firestore Timestamp
  
  // UI Specific visual properties (saved in Firestore, but mapped from the old local state)
  // We add these to the schema to maintain the Framer Motion visuals
  uiBgColor?: string; // e.g. 'bg-[#FDECE8]'
  uiIconName?: string; // e.g. 'Activity'
  uiMetric?: string; // e.g. '15 min'
}
```

## `HabitLog`
Represents a completion event. Maps to the `habit_logs` Firestore collection.

```typescript
export interface HabitLog {
  id: string; // Format: {habitId}_{YYYY-MM-DD}
  habitId: string;
  userId: string;
  dateString: string; // 'YYYY-MM-DD'
  completed: boolean;
  timestamp: string; // ISO-8601 string
}
```

## `StreakStatus`
Represents the automatically calculated streak cache. Maps to the `streak_status` Firestore collection.

```typescript
export interface StreakStatus {
  habitId: string;
  userId: string;
  currentStreak: number;
  longestStreak: number;
  lastEvaluatedDate: string; // 'YYYY-MM-DD'
}
```

## `UserProfile`
Extended from the existing `types/auth.ts` to include FCM properties if needed.

```typescript
// (Existing in auth.ts)
export interface UserProfile {
  id: string;
  email: string | null;
  timezone: string | null;
  totp: {
    enabled: boolean;
  };
  createdAt: unknown;
  updatedAt: unknown;
  
  // New property for push notifications
  fcmTokens?: string[];
}
```
