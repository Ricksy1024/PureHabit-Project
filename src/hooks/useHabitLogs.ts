import { useState, useEffect, useCallback } from 'react';
import { subscribeToHabitLogs, syncHabitLog } from '../services/habitService';
import { useAuth } from './useAuth';
import { logicalDay } from '../utils/dateUtils';
import type { HabitLog } from '../types/habit';

export function useHabitLogs(userId: string | undefined, selectedDate: Date) {
  const { profile } = useAuth();
  const [logs, setLogs] = useState<HabitLog[]>([]);
  const [completionMap, setCompletionMap] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const userTimezone = profile?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone;
  const dateString = logicalDay(userTimezone, selectedDate);

  useEffect(() => {
    if (!userId) {
      setLogs([]);
      setCompletionMap({});
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    let timeoutId = setTimeout(() => {
      setError('Loading is taking longer than expected. Please check your connection.');
    }, 10000);

    const unsubscribe = subscribeToHabitLogs(
      userId,
      dateString,
      dateString,
      (fetchedLogs) => {
        clearTimeout(timeoutId);
        setLogs(fetchedLogs);
        
        const newMap: Record<string, boolean> = {};
        fetchedLogs.forEach(log => {
          newMap[log.habitId] = log.completed;
        });
        setCompletionMap(newMap);
        setLoading(false);
        setError(null);
      },
      (err) => {
        clearTimeout(timeoutId);
        console.error('Error fetching habit logs:', err);
        setError(err.message || 'Failed to fetch habit logs');
        setLoading(false);
      }
    );

    return () => {
      clearTimeout(timeoutId);
      unsubscribe();
    };
  }, [userId, dateString]);

  const toggleCompletion = useCallback(async (habitId: string, currentValue: boolean) => {
    if (!userId) return;

    // Optimistic update
    const newValue = !currentValue;
    setCompletionMap(prev => ({ ...prev, [habitId]: newValue }));

    try {
      const result = await syncHabitLog([{
        habitId,
        dateString,
        completed: newValue
      }]);

      if (!(result as any)?.success) {
        throw new Error('Sync failed');
      }
    } catch (err) {
      console.error('Error syncing habit log:', err);
      // Revert on error
      setCompletionMap(prev => ({ ...prev, [habitId]: currentValue }));
      alert('Failed to sync completion state. Reverting change.');
    }
  }, [userId, dateString]);

  return { completionMap, toggleCompletion, loading, error };
}
