import { addDays, eachDayOfInterval, format, subDays } from 'date-fns';
import type { Habit, HabitLog } from '../types/habit';

export const DAY_NAME_TO_CODE: Record<string, Habit['frequency']['days'][number]> = {
  Monday: 'MON',
  Tuesday: 'TUE',
  Wednesday: 'WED',
  Thursday: 'THU',
  Friday: 'FRI',
  Saturday: 'SAT',
  Sunday: 'SUN',
};

export const DAY_CODE_TO_NAME: Record<Habit['frequency']['days'][number], string> = {
  MON: 'Monday',
  TUE: 'Tuesday',
  WED: 'Wednesday',
  THU: 'Thursday',
  FRI: 'Friday',
  SAT: 'Saturday',
  SUN: 'Sunday',
};

export function getDayCode(date: Date): Habit['frequency']['days'][number] {
  return DAY_NAME_TO_CODE[format(date, 'EEEE')];
}

export function getHabitsForDate(habits: Habit[], date: Date) {
  const dayCode = getDayCode(date);
  return habits.filter((habit) => {
    const days = habit.frequency?.days || [];
    return days.length === 0 || days.includes(dayCode);
  });
}

export function calculateCompletionPercentage(
  habits: Habit[],
  completionMap: Record<string, boolean>,
) {
  if (habits.length === 0) {
    return 0;
  }

  const completed = habits.filter((habit) => completionMap[habit.id]).length;
  return Math.round((completed / habits.length) * 100);
}

export function buildCompletionMap(logs: HabitLog[]) {
  return logs.reduce<Record<string, boolean>>((map, log) => {
    map[log.habitId] = log.completed;
    return map;
  }, {});
}

export function groupHabitsByCategory(habits: Habit[]) {
  return habits.reduce<Record<string, Habit[]>>((groups, habit) => {
    const category = habit.category?.trim() || 'Uncategorized';
    if (!groups[category]) {
      groups[category] = [];
    }

    groups[category].push(habit);
    return groups;
  }, {});
}

export function buildLogsByDate(logs: HabitLog[]) {
  return logs.reduce<Record<string, Record<string, boolean>>>((map, log) => {
    if (!map[log.dateString]) {
      map[log.dateString] = {};
    }

    map[log.dateString][log.habitId] = log.completed;
    return map;
  }, {});
}

export function getPastSevenDates(anchorDate: Date) {
  return Array.from({ length: 7 }, (_, index) =>
    format(addDays(subDays(anchorDate, 6), index), 'yyyy-MM-dd'),
  );
}

export function countScheduledDays(habit: Habit, startDate: Date, endDate: Date) {
  return eachDayOfInterval({ start: startDate, end: endDate }).filter((date) =>
    getHabitsForDate([habit], date).length > 0,
  ).length;
}
