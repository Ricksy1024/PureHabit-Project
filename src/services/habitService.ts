import { collection, query, where, onSnapshot, getDocs, limit, orderBy } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { db, functions } from '../config/firebase';
import { COLLECTIONS } from '../constants/collections';
import type { Habit, HabitLog, StreakStatus } from '../types/habit';

interface CreateHabitParams {
  name: string;
  frequency: {
    type: 'SPECIFIC_DAYS';
    days: ('MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT' | 'SUN')[];
  };
  reminders?: { time: string }[];
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

export const createHabitAction = async (params: CreateHabitParams) => {
  const callable = httpsCallable<CreateHabitParams, { success: boolean; habitId: string }>(functions, 'createHabitAction');
  const result = await callable(params);
  return result.data;
};

export const updateHabitAction = async (params: UpdateHabitParams) => {
  const callable = httpsCallable<UpdateHabitParams, { success: boolean; habitId: string }>(functions, 'updateHabitAction');
  const result = await callable(params);
  return result.data;
};

export const archiveHabitAction = async (habitId: string) => {
  const callable = httpsCallable<{ habitId: string }, { success: boolean; habitId: string }>(functions, 'archiveHabitAction');
  const result = await callable({ habitId });
  return result.data;
};

export const createHabit = async (payload: {
  name: string;
  frequency: Habit['frequency'];
  category?: string;
  uiBgColor?: string;
  uiIconName?: string;
  uiMetric?: string;
}): Promise<{ ok: boolean; habitId?: string; error?: string }> => {
  if (!navigator.onLine) {
    return { ok: false, error: 'No connection — changes could not be saved. Please retry when online.' };
  }
  try {
    const result = await createHabitAction(payload as any);
    return { ok: true, habitId: (result as any).habitId };
  } catch (err: any) {
    console.error('Error creating habit:', err);
    return { ok: false, error: err.message || 'Failed to create habit' };
  }
};

export const updateHabit = async (payload: {
  habitId: string;
  name?: string;
  frequency?: Habit['frequency'];
  category?: string;
  uiBgColor?: string;
  uiIconName?: string;
  uiMetric?: string;
}): Promise<{ ok: boolean; error?: string }> => {
  if (!navigator.onLine) {
    return { ok: false, error: 'No connection — changes could not be saved. Please retry when online.' };
  }
  try {
    await updateHabitAction(payload as any);
    return { ok: true };
  } catch (err: any) {
    console.error('Error updating habit:', err);
    return { ok: false, error: err.message || 'Failed to update habit' };
  }
};

export const archiveHabit = async (habitId: string): Promise<{ ok: boolean; error?: string }> => {
  if (!navigator.onLine) {
    return { ok: false, error: 'No connection — changes could not be saved. Please retry when online.' };
  }
  try {
    await archiveHabitAction(habitId);
    return { ok: true };
  } catch (err: any) {
    console.error('Error archiving habit:', err);
    return { ok: false, error: err.message || 'Failed to archive habit' };
  }
};

export const batchRenameCategoryAction = async (params: BatchRenameCategoryParams) => {
  const callable = httpsCallable<BatchRenameCategoryParams, { success: boolean; updatedCount: number }>(functions, 'batchRenameCategoryAction');
  const result = await callable(params);
  return result.data;
};

export const batchRenameCategory = async (oldName: string, newName: string): Promise<{ ok: boolean; error?: string }> => {
  if (!navigator.onLine) {
    return { ok: false, error: 'No connection — changes could not be saved. Please retry when online.' };
  }
  try {
    await batchRenameCategoryAction({ oldName, newName });
    return { ok: true };
  } catch (err: any) {
    console.error('Error batch renaming category:', err);
    return { ok: false, error: err.message || 'Failed to rename category' };
  }
};

export const subscribeToHabits = (
  userId: string,
  onData: (habits: Habit[]) => void,
  onError: (error: Error) => void
) => {
  const q = query(
    collection(db, COLLECTIONS.HABITS),
    where('userId', '==', userId),
    where('archived', '==', false)
  );
  return onSnapshot(q, (snapshot) => {
    const habits = snapshot.docs.map((doc) => doc.data() as Habit);
    onData(habits);
  }, onError);
};

export const subscribeToStreaks = (
  userId: string,
  onData: (streaks: Record<string, StreakStatus>) => void,
  onError: (error: Error) => void
) => {
  const q = query(
    collection(db, COLLECTIONS.STREAK_STATUS),
    where('userId', '==', userId)
  );
  return onSnapshot(q, (snapshot) => {
    const streaks: Record<string, StreakStatus> = {};
    snapshot.docs.forEach((doc) => {
      const data = doc.data() as StreakStatus;
      streaks[data.habitId] = data;
    });
    onData(streaks);
  }, onError);
};

export const subscribeToHabitLogs = (
  userId: string,
  startDate: string,
  endDate: string,
  onData: (logs: HabitLog[]) => void,
  onError: (error: Error) => void
) => {
  const q = query(
    collection(db, COLLECTIONS.HABIT_LOGS),
    where('userId', '==', userId),
    where('dateString', '>=', startDate),
    where('dateString', '<=', endDate)
  );
  return onSnapshot(q, (snapshot) => {
    const logs = snapshot.docs.map((doc) => doc.data() as HabitLog);
    onData(logs);
  }, onError);
};

export const fetchHabitLogsForRange = async (
  userId: string,
  startDate: string,
  endDate: string,
  maxLimit: number = 1000
): Promise<HabitLog[]> => {
  const q = query(
    collection(db, COLLECTIONS.HABIT_LOGS),
    where('userId', '==', userId),
    where('dateString', '>=', startDate),
    where('dateString', '<=', endDate),
    orderBy('dateString', 'desc'),
    limit(maxLimit)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => doc.data() as HabitLog);
};

export const syncHabitLog = async (logs: { habitId: string; dateString: string; completed: boolean; timestamp?: string }[]) => {
  const callable = httpsCallable<{ logs: any[] }, { success: boolean; processedCount: number }>(functions, 'syncHabitLogs');
  const result = await callable({ logs });
  return result.data;
};

export const registerPushToken = async (token: string) => {
  const callable = httpsCallable<{ token: string }, { success: boolean }>(functions, 'registerDeviceTokenAction');
  const result = await callable({ token });
  return result.data;
};
