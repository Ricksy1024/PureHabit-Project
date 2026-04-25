import { useEffect, useState } from 'react';
import { subscribeToStreaks } from '../services/habitService';
import type { StreakStatus } from '../types/habit';

export function useStreaks(userId: string | undefined, habitIds: string[]) {
  const [streakMap, setStreakMap] = useState<Record<string, StreakStatus>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const habitKey = habitIds.join('|');

  useEffect(() => {
    if (!userId || habitIds.length === 0) {
      setStreakMap({});
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    const unsubscribe = subscribeToStreaks(
      userId,
      (streaks) => {
        const filtered = habitIds.reduce<Record<string, StreakStatus>>(
          (map, habitId) => {
            if (streaks[habitId]) {
              map[habitId] = streaks[habitId];
            }
            return map;
          },
          {},
        );
        setStreakMap(filtered);
        setLoading(false);
      },
      (subscriptionError) => {
        setError(subscriptionError.message || 'Failed to load streaks.');
        setLoading(false);
      },
    );

    return () => {
      unsubscribe();
    };
  }, [habitKey, userId]);

  return { streakMap, loading, error };
}
