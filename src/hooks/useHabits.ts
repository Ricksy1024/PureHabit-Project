import { useState, useEffect } from 'react';
import { subscribeToHabits } from '../services/habitService';
import type { Habit } from '../types/habit';

export function useHabits(userId: string | null | undefined) {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setHabits([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    // 10-second timeout for loading
    const timeoutId = setTimeout(() => {
      setLoading(false);
      setError('Loading timeout. Please check your connection or retry.');
    }, 10000);

    const unsubscribe = subscribeToHabits(
      userId,
      (data) => {
        clearTimeout(timeoutId);
        
        // Convert any timestamps to Dates if needed (Firestore SDK returns Timestamps if we don't map them, 
        // but let's assume they are stored as serverTimestamp() and retrieved as Timestamp objects.
        // The service layer might pass raw data, so let's do a lightweight parse here:
        const mappedData = data.map((habit: any) => ({
          ...habit,
          createdAt: habit.createdAt?.toDate ? habit.createdAt.toDate() : new Date(habit.createdAt),
          updatedAt: habit.updatedAt?.toDate ? habit.updatedAt.toDate() : new Date(habit.updatedAt),
        }));
        
        setHabits(mappedData);
        setLoading(false);
        setError(null);
      },
      (err) => {
        clearTimeout(timeoutId);
        setLoading(false);
        setError(err.message || 'Failed to load habits.');
      }
    );

    return () => {
      clearTimeout(timeoutId);
      unsubscribe();
    };
  }, [userId]);

  return { habits, loading, error };
}
