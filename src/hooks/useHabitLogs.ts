import { useEffect, useState } from 'react';
import {
  endOfMonth,
  endOfWeek,
  startOfMonth,
  startOfWeek,
} from 'date-fns';
import { subscribeToHabitLogs, syncHabitLog } from '../services/habitService';
import type { HabitLog } from '../types/habit';
import { calendarDateToLogicalDay } from '../utils/dateUtils';
import { buildLogsByDate } from '../utils/habitUtils';
import { useAuth } from './useAuth';

export function useHabitLogs(
  userId: string | undefined,
  selectedDate: Date,
  range: string,
  viewDate: Date,
) {
  const { authState } = useAuth();
  const [logs, setLogs] = useState<HabitLog[]>([]);
  const [logsByDate, setLogsByDate] = useState<Record<string, Record<string, boolean>>>({});
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
  const selectedDateString = calendarDateToLogicalDay(timezone, selectedDate);

  const rangeStartDate =
    range === 'Month'
      ? startOfMonth(viewDate)
      : range === 'Weekly'
        ? startOfWeek(viewDate, { weekStartsOn: 1 })
        : selectedDate;
  const rangeEndDate =
    range === 'Month'
      ? endOfMonth(viewDate)
      : range === 'Weekly'
        ? endOfWeek(viewDate, { weekStartsOn: 1 })
        : selectedDate;
  const rangeStartString = calendarDateToLogicalDay(timezone, rangeStartDate);
  const rangeEndString = calendarDateToLogicalDay(timezone, rangeEndDate);

  useEffect(() => {
    if (!userId) {
      setLogs([]);
      setLogsByDate({});
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
      rangeStartString,
      rangeEndString,
      (fetchedLogs) => {
        window.clearTimeout(timeoutId);
        setLogs(fetchedLogs);
        setLogsByDate(buildLogsByDate(fetchedLogs));
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
  }, [rangeEndString, rangeStartString, userId]);

  useEffect(() => {
    setCompletionMap(logsByDate[selectedDateString] || {});
  }, [logsByDate, selectedDateString]);

  async function toggleCompletion(habitId: string, currentValue: boolean) {
    if (!userId) {
      return;
    }

    const nextValue = !currentValue;
    setSyncError(null);
    setCompletionMap((previous) => ({ ...previous, [habitId]: nextValue }));
    setLogsByDate((previous) => ({
      ...previous,
      [selectedDateString]: {
        ...(previous[selectedDateString] || {}),
        [habitId]: nextValue,
      },
    }));

    const result = await syncHabitLog([
      {
        habitId,
        dateString: selectedDateString,
        completed: nextValue,
        timestamp: new Date().toISOString(),
      },
    ]);

    if (!result.success) {
      setCompletionMap((previous) => ({ ...previous, [habitId]: currentValue }));
      setLogsByDate((previous) => ({
        ...previous,
        [selectedDateString]: {
          ...(previous[selectedDateString] || {}),
          [habitId]: currentValue,
        },
      }));
      setSyncError(result.error || 'Failed to sync completion state.');
    }
  }

  return {
    logs,
    logsByDate,
    completionMap,
    toggleCompletion,
    loading,
    error,
    syncError,
    clearSyncError: () => setSyncError(null),
  };
}
