import { useEffect, useState } from 'react';
import { subscribeToHabitLogs, syncHabitLog } from '../services/habitService';
import type { HabitLog } from '../types/habit';
import { calendarDateToLogicalDay } from '../utils/dateUtils';
import { buildCompletionMap } from '../utils/habitUtils';
import { useAuth } from './useAuth';

export function useHabitLogs(userId: string | undefined, selectedDate: Date) {
  const { authState } = useAuth();
  const [logs, setLogs] = useState<HabitLog[]>([]);
  const [completionMap, setCompletionMap] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);

  const timezone =
    authState.status === 'authenticated_ready' ||
    authState.status === 'authenticated_pending'
      ? authState.profile?.timezone ||
        Intl.DateTimeFormat().resolvedOptions().timeZone
      : Intl.DateTimeFormat().resolvedOptions().timeZone;
  const dateString = calendarDateToLogicalDay(timezone, selectedDate);

  useEffect(() => {
    if (!userId) {
      setLogs([]);
      setCompletionMap({});
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const timeoutId = window.setTimeout(() => {
      setLoading(false);
      setError('Loading timeout. Please check your connection or retry.');
    }, 10000);

    const unsubscribe = subscribeToHabitLogs(
      userId,
      dateString,
      dateString,
      (fetchedLogs) => {
        window.clearTimeout(timeoutId);
        setLogs(fetchedLogs);
        setCompletionMap(buildCompletionMap(fetchedLogs));
        setLoading(false);
        setError(null);
      },
      (subscriptionError) => {
        window.clearTimeout(timeoutId);
        setLoading(false);
        setError(subscriptionError.message || 'Failed to load habit logs.');
      },
    );

    return () => {
      window.clearTimeout(timeoutId);
      unsubscribe();
    };
  }, [dateString, userId]);

  async function toggleCompletion(habitId: string, currentValue: boolean) {
    if (!userId) {
      return;
    }

    const nextValue = !currentValue;
    setSyncError(null);
    setCompletionMap((previous) => ({ ...previous, [habitId]: nextValue }));

    const result = await syncHabitLog([
      {
        habitId,
        dateString,
        completed: nextValue,
        timestamp: new Date().toISOString(),
      },
    ]);

    if (!result.success) {
      setCompletionMap((previous) => ({ ...previous, [habitId]: currentValue }));
      setSyncError(result.error || 'Failed to sync completion state.');
    }
  }

  return {
    logs,
    completionMap,
    toggleCompletion,
    loading,
    error,
    syncError,
    clearSyncError: () => setSyncError(null),
  };
}
