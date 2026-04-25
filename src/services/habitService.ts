import { FirebaseError } from 'firebase/app';
import {
  collection,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  where,
  type QueryDocumentSnapshot,
} from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { onMessage, type MessagePayload } from 'firebase/messaging';
import { db, functions, isFirebaseConfigured, messaging } from '../config/firebase';
import { COLLECTIONS } from '../constants/collections';
import type { Habit, HabitLog, StreakStatus } from '../types/habit';

interface CreateHabitParams {
  name: string;
  frequency: Habit['frequency'];
  reminders?: Habit['reminders'];
  category?: string;
  uiBgColor?: string;
  uiIconName?: string;
  uiMetric?: string;
}

interface UpdateHabitParams extends Partial<CreateHabitParams> {
  habitId: string;
}

interface BatchRenameCategoryParams {
  oldName: string;
  newName: string;
}

interface UpdateUserProfileParams {
  displayName?: string;
  timezone?: string;
}

const OFFLINE_ERROR =
  'No connection — changes could not be saved. Please retry when online.';
const CONNECTIVITY_ERROR =
  'Unable to connect. Check your connection and try again.';
const FIREBASE_CONFIG_ERROR =
  'Firebase is not configured. Set VITE_FIREBASE_* values in .env.';

function isOffline() {
  return (
    typeof navigator !== 'undefined' &&
    'onLine' in navigator &&
    navigator.onLine === false
  );
}

function getErrorMessage(error: unknown, fallback: string) {
  if (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as { message: unknown }).message === 'string'
  ) {
    return (error as { message: string }).message;
  }

  return fallback;
}

function ensureFirebaseConfigured() {
  if (isFirebaseConfigured) {
    return null;
  }

  return {
    ok: false as const,
    error: FIREBASE_CONFIG_ERROR,
    errorCode: 'client/firebase-not-configured',
  };
}

function getErrorCode(error: unknown) {
  if (error instanceof FirebaseError) {
    return error.code;
  }

  if (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    typeof (error as { code: unknown }).code === 'string'
  ) {
    return (error as { code: string }).code;
  }

  return 'unknown';
}

function mapCallableError(error: unknown, fallback: string) {
  const code = getErrorCode(error);
  const message = getErrorMessage(error, fallback);

  switch (code) {
    case 'functions/unavailable':
    case 'functions/internal':
    case 'auth/network-request-failed':
      return { ok: false as const, error: CONNECTIVITY_ERROR, errorCode: code };
    case 'functions/not-found':
    case 'functions/unimplemented':
      return {
        ok: false as const,
        error: 'Habit write backend is not deployed. Deploy the latest Firebase functions.',
        errorCode: code,
      };
    case 'functions/unauthenticated':
      return {
        ok: false as const,
        error: 'You need to sign in again to continue.',
        errorCode: code,
      };
    case 'functions/permission-denied':
      return {
        ok: false as const,
        error:
          message === 'TOTP verification is required.'
            ? 'This user-data change requires authenticator verification. Open Settings and unlock protected controls first.'
            : message,
        errorCode: code,
      };
    default:
      return {
        ok: false as const,
        error: message,
        errorCode: code,
      };
  }
}

function toDate(value: unknown) {
  if (value instanceof Date) {
    return value;
  }

  if (
    typeof value === 'object' &&
    value !== null &&
    'toDate' in value &&
    typeof (value as { toDate: unknown }).toDate === 'function'
  ) {
    return (value as { toDate: () => Date }).toDate();
  }

  if (typeof value === 'string' || typeof value === 'number') {
    return new Date(value);
  }

  return new Date();
}

function mapHabit(snapshot: QueryDocumentSnapshot) {
  const data = snapshot.data() as Record<string, unknown>;
  return {
    id: String(data.id || snapshot.id),
    userId: String(data.userId || ''),
    name: String(data.name || ''),
    frequency: (data.frequency || { type: 'SPECIFIC_DAYS', days: [] }) as Habit['frequency'],
    reminders: Array.isArray(data.reminders) ? (data.reminders as Habit['reminders']) : [],
    archived: Boolean(data.archived),
    category: String(data.category || ''),
    uiBgColor: String(data.uiBgColor || 'bg-[#FDECE8]'),
    uiIconName: String(data.uiIconName || 'Activity'),
    uiMetric: String(data.uiMetric || 'times'),
    createdAt: toDate(data.createdAt),
    updatedAt: toDate(data.updatedAt),
  } satisfies Habit;
}

function mapHabitLog(snapshot: QueryDocumentSnapshot) {
  const data = snapshot.data() as Record<string, unknown>;
  return {
    id: String(data.id || snapshot.id),
    habitId: String(data.habitId || ''),
    userId: String(data.userId || ''),
    dateString: String(data.dateString || ''),
    completed: Boolean(data.completed),
    timestamp: toDate(data.timestamp),
  } satisfies HabitLog;
}

function mapStreak(snapshot: QueryDocumentSnapshot) {
  const data = snapshot.data() as Record<string, unknown>;
  return {
    habitId: String(data.habitId || snapshot.id),
    userId: String(data.userId || ''),
    currentStreak: Number(data.currentStreak || 0),
    longestStreak: Number(data.longestStreak || 0),
    lastEvaluatedDate: String(data.lastEvaluatedDate || ''),
  } satisfies StreakStatus;
}

export async function createHabitAction(params: CreateHabitParams) {
  const callable = httpsCallable<
    CreateHabitParams,
    { success: boolean; habitId: string }
  >(functions, 'createHabitAction');
  const result = await callable(params);
  return result.data;
}

export async function updateHabitAction(params: UpdateHabitParams) {
  const callable = httpsCallable<
    UpdateHabitParams,
    { success: boolean; habitId: string }
  >(functions, 'updateHabitAction');
  const result = await callable(params);
  return result.data;
}

export async function archiveHabitAction(habitId: string) {
  const callable = httpsCallable<
    { habitId: string },
    { success: boolean; habitId: string }
  >(functions, 'archiveHabitAction');
  const result = await callable({ habitId });
  return result.data;
}

export async function createHabit(payload: CreateHabitParams) {
  const configurationError = ensureFirebaseConfigured();
  if (configurationError) {
    return configurationError;
  }

  if (isOffline()) {
    return { ok: false, error: OFFLINE_ERROR };
  }

  try {
    const result = await createHabitAction(payload);
    return { ok: true, habitId: result.habitId };
  } catch (error) {
    return mapCallableError(error, 'Failed to create habit.');
  }
}

export async function updateHabit(payload: UpdateHabitParams) {
  const configurationError = ensureFirebaseConfigured();
  if (configurationError) {
    return configurationError;
  }

  if (isOffline()) {
    return { ok: false, error: OFFLINE_ERROR };
  }

  try {
    await updateHabitAction(payload);
    return { ok: true };
  } catch (error) {
    return mapCallableError(error, 'Failed to update habit.');
  }
}

export async function archiveHabit(habitId: string) {
  const configurationError = ensureFirebaseConfigured();
  if (configurationError) {
    return configurationError;
  }

  if (isOffline()) {
    return { ok: false, error: OFFLINE_ERROR };
  }

  try {
    await archiveHabitAction(habitId);
    return { ok: true };
  } catch (error) {
    return mapCallableError(error, 'Failed to archive habit.');
  }
}

export async function batchRenameCategoryAction(params: BatchRenameCategoryParams) {
  const callable = httpsCallable<
    BatchRenameCategoryParams,
    { success: boolean; updatedCount: number }
  >(functions, 'batchRenameCategoryAction');
  const result = await callable(params);
  return result.data;
}

export async function batchRenameCategory(oldName: string, newName: string) {
  const configurationError = ensureFirebaseConfigured();
  if (configurationError) {
    return configurationError;
  }

  if (isOffline()) {
    return { ok: false, error: OFFLINE_ERROR };
  }

  try {
    await batchRenameCategoryAction({ oldName, newName });
    return { ok: true };
  } catch (error) {
    return mapCallableError(error, 'Failed to rename category.');
  }
}

export async function updateUserProfile(params: UpdateUserProfileParams) {
  try {
    const callable = httpsCallable<
      UpdateUserProfileParams,
      { success: boolean }
    >(functions, 'updateUserProfileAction');
    await callable(params);
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error: getErrorMessage(error, 'Failed to update your profile.'),
    };
  }
}

export function subscribeToHabits(
  userId: string,
  onData: (habits: Habit[]) => void,
  onError: (error: Error) => void,
  options: { includeArchived?: boolean } = {},
) {
  const constraints = [where('userId', '==', userId)];
  if (!options.includeArchived) {
    constraints.push(where('archived', '==', false));
  }

  const habitsQuery = query(collection(db, COLLECTIONS.HABITS), ...constraints);

  return onSnapshot(
    habitsQuery,
    (snapshot) => {
      onData(snapshot.docs.map(mapHabit));
    },
    onError,
  );
}

export async function fetchHabitsForUser(
  userId: string,
  options: { includeArchived?: boolean } = {},
) {
  const constraints = [where('userId', '==', userId)];
  if (!options.includeArchived) {
    constraints.push(where('archived', '==', false));
  }

  const habitsQuery = query(collection(db, COLLECTIONS.HABITS), ...constraints);
  const snapshot = await getDocs(habitsQuery);
  return snapshot.docs.map(mapHabit);
}

export function subscribeToStreaks(
  userId: string,
  onData: (streaks: Record<string, StreakStatus>) => void,
  onError: (error: Error) => void,
) {
  const streaksQuery = query(
    collection(db, COLLECTIONS.STREAK_STATUS),
    where('userId', '==', userId),
  );

  return onSnapshot(
    streaksQuery,
    (snapshot) => {
      const streaks = snapshot.docs.reduce<Record<string, StreakStatus>>(
        (map, doc) => {
          const streak = mapStreak(doc);
          map[streak.habitId] = streak;
          return map;
        },
        {},
      );
      onData(streaks);
    },
    onError,
  );
}

export function subscribeToHabitLogs(
  userId: string,
  startDate: string,
  endDate: string,
  onData: (logs: HabitLog[]) => void,
  onError: (error: Error) => void,
) {
  const logsQuery = query(
    collection(db, COLLECTIONS.HABIT_LOGS),
    where('userId', '==', userId),
    where('dateString', '>=', startDate),
    where('dateString', '<=', endDate),
    orderBy('dateString', 'asc'),
  );

  return onSnapshot(
    logsQuery,
    (snapshot) => {
      onData(snapshot.docs.map(mapHabitLog));
    },
    onError,
  );
}

export async function fetchHabitLogsForRange(
  userId: string,
  startDate: string,
  endDate: string,
  maxLimit = 1000,
) {
  const logsQuery = query(
    collection(db, COLLECTIONS.HABIT_LOGS),
    where('userId', '==', userId),
    where('dateString', '>=', startDate),
    where('dateString', '<=', endDate),
    orderBy('dateString', 'desc'),
    limit(maxLimit),
  );
  const snapshot = await getDocs(logsQuery);
  return snapshot.docs.map(mapHabitLog);
}

export async function syncHabitLog(
  logs: Array<{
    habitId: string;
    dateString: string;
    completed: boolean;
    timestamp?: string;
  }>,
) {
  try {
    const callable = httpsCallable<
      { logs: typeof logs },
      { success: boolean; processedCount: number }
    >(functions, 'syncHabitLogs');
    const result = await callable({ logs });
    return { success: result.data.success, processedCount: result.data.processedCount };
  } catch (error) {
    return {
      success: false,
      error: getErrorMessage(error, 'Failed to sync your habit log.'),
    };
  }
}

export async function registerPushToken(token: string) {
  try {
    const callable = httpsCallable<{ token: string }, { success: boolean }>(
      functions,
      'registerDeviceTokenAction',
    );
    await callable({ token });
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error: getErrorMessage(error, 'Failed to enable notifications.'),
    };
  }
}

export function listenForForegroundMessages(
  onNotification: (payload: MessagePayload) => void,
) {
  if (!messaging) {
    return () => {};
  }

  return onMessage(messaging, onNotification);
}
