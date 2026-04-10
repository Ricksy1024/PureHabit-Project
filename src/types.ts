export interface Habit {
  id: string;
  title: string;
  icon: string;
  color: string;
  category: string;
  frequency: 'daily' | 'weekly' | 'custom';
  target: number;
  unit: string;
  reminderTime?: string;
  createdAt: string;
  archived: boolean;
  currentStreak: number;
  longestStreak: number;
}

export interface HabitLog {
  id: string;
  habitId: string;
  completedDate: string; // YYYY-MM-DD
  completedAt: string; // ISO String
  value?: number;
}

export interface Category {
  id: string;
  name: string;
  color: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  timezone: string;
  theme: 'light' | 'dark';
}
