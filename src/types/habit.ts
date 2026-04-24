export interface HabitFrequency {
  type: 'SPECIFIC_DAYS';
  days: ('MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT' | 'SUN')[];
}

export interface Habit {
  id: string;
  userId: string;
  name: string;
  frequency: HabitFrequency;
  reminders: { time: string }[];
  archived: boolean;
  category: string;
  uiBgColor: string;
  uiIconName: string;
  uiMetric: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface HabitLog {
  id: string; // {habitId}_{YYYY-MM-DD}
  habitId: string;
  userId: string;
  dateString: string;
  completed: boolean;
  timestamp: Date;
}

export interface StreakStatus {
  habitId: string;
  userId: string;
  currentStreak: number;
  longestStreak: number;
  lastEvaluatedDate: string;
}
