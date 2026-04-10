import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Habit, HabitLog, Category } from './types';
import { startOfDay, format, isSameDay } from 'date-fns';

interface HabitState {
  habits: Habit[];
  logs: HabitLog[];
  categories: Category[];
  userName: string;
  theme: 'light' | 'dark';
  
  // Actions
  addHabit: (habit: Omit<Habit, 'id' | 'createdAt' | 'currentStreak' | 'longestStreak' | 'archived'>) => void;
  updateHabit: (id: string, updates: Partial<Habit>) => void;
  deleteHabit: (id: string) => void;
  toggleHabit: (habitId: string, date: Date) => void;
  setUserName: (name: string) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  addCategory: (category: Category) => void;
}

export const useHabitStore = create<HabitState>()(
  persist(
    (set, get) => ({
      habits: [
        {
          id: '1',
          title: 'Morning Meditation',
          icon: '🧘',
          color: '#E6B9A6',
          category: 'Mindset',
          frequency: 'daily',
          target: 15,
          unit: 'min',
          createdAt: new Date().toISOString(),
          archived: false,
          currentStreak: 12,
          longestStreak: 15,
        },
        {
          id: '2',
          title: 'Hydrate Regularly',
          icon: '💧',
          color: '#93A9D1',
          category: 'Health',
          frequency: 'daily',
          target: 2.5,
          unit: 'Liters',
          createdAt: new Date().toISOString(),
          archived: false,
          currentStreak: 4,
          longestStreak: 10,
        },
        {
          id: '3',
          title: 'Daily Reading',
          icon: '📖',
          color: '#D4A373',
          category: 'Learning',
          frequency: 'daily',
          target: 20,
          unit: 'pages',
          createdAt: new Date().toISOString(),
          archived: false,
          currentStreak: 28,
          longestStreak: 30,
        },
      ],
      logs: [],
      categories: [
        { id: '1', name: 'Health', color: '#93A9D1' },
        { id: '2', name: 'Mindset', color: '#E6B9A6' },
        { id: '3', name: 'Learning', color: '#D4A373' },
        { id: '4', name: 'Fitness', color: '#CCD5AE' },
      ],
      userName: 'Alex',
      theme: 'light',

      addHabit: (habit) => set((state) => ({
        habits: [...state.habits, {
          ...habit,
          id: Math.random().toString(36).substring(7),
          createdAt: new Date().toISOString(),
          currentStreak: 0,
          longestStreak: 0,
          archived: false,
        }]
      })),

      updateHabit: (id, updates) => set((state) => ({
        habits: state.habits.map((h) => h.id === id ? { ...h, ...updates } : h)
      })),

      deleteHabit: (id) => set((state) => ({
        habits: state.habits.filter((h) => h.id !== id)
      })),

      toggleHabit: (habitId, date) => set((state) => {
        const dateStr = format(startOfDay(date), 'yyyy-MM-dd');
        const existingLogIndex = state.logs.findIndex(
          (l) => l.habitId === habitId && l.completedDate === dateStr
        );

        let newLogs = [...state.logs];
        if (existingLogIndex > -1) {
          newLogs.splice(existingLogIndex, 1);
        } else {
          newLogs.push({
            id: Math.random().toString(36).substring(7),
            habitId,
            completedDate: dateStr,
            completedAt: new Date().toISOString(),
          });
        }

        // Recalculate streaks (simplified for now)
        const newHabits = state.habits.map(h => {
          if (h.id === habitId) {
            // This is a placeholder for actual streak calculation logic
            const isCompleted = existingLogIndex === -1;
            const currentStreak = isCompleted ? h.currentStreak + 1 : Math.max(0, h.currentStreak - 1);
            return {
              ...h,
              currentStreak,
              longestStreak: Math.max(h.longestStreak, currentStreak)
            };
          }
          return h;
        });

        return { logs: newLogs, habits: newHabits };
      }),

      setUserName: (name) => set({ userName: name }),
      setTheme: (theme) => set({ theme }),
      addCategory: (category) => set((state) => ({
        categories: [...state.categories, category]
      })),
    }),
    {
      name: 'pure-habit-storage',
    }
  )
);
