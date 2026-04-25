import {
  addDays,
  eachDayOfInterval,
  endOfWeek,
  format,
  startOfWeek,
  subDays,
} from 'date-fns';
import type { Habit, HabitLog } from '../types/habit';
import { calendarDateToLogicalDay } from './dateUtils';

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

export function getDayCodeFromDateString(
  dateString: string,
): Habit['frequency']['days'][number] {
  const date = new Date(`${dateString}T00:00:00.000Z`);
  const weekday = date.getUTCDay();
  const dayCodes: Habit['frequency']['days'][number][] = [
    'SUN',
    'MON',
    'TUE',
    'WED',
    'THU',
    'FRI',
    'SAT',
  ];

  return dayCodes[weekday];
}

export function getHabitsForDate(habits: Habit[], date: Date) {
  const dayCode = getDayCode(date);
  return habits.filter((habit) => {
    const days = habit.frequency?.days || [];
    return days.length === 0 || days.includes(dayCode);
  });
}

export function getHabitsForDateString(habits: Habit[], dateString: string) {
  const dayCode = getDayCodeFromDateString(dateString);
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

export function buildLogsByDate(
  logs: Array<Pick<HabitLog, 'habitId' | 'dateString' | 'completed'>>,
) {
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

export function shiftDateString(dateString: string, daysDelta: number) {
  const baseDate = new Date(`${dateString}T00:00:00.000Z`);
  baseDate.setUTCDate(baseDate.getUTCDate() + daysDelta);
  return baseDate.toISOString().slice(0, 10);
}

export function getPastSevenLogicalDates(
  anchorDate: Date,
  timezone: string = 'UTC',
) {
  const anchorDateString = calendarDateToLogicalDay(timezone, anchorDate);

  return Array.from({ length: 7 }, (_, index) =>
    shiftDateString(anchorDateString, index - 6),
  );
}

export function getWeekLogicalDates(
  anchorDate: Date,
  timezone: string = 'UTC',
) {
  const weekDates = eachDayOfInterval({
    start: startOfWeek(anchorDate, { weekStartsOn: 1 }),
    end: endOfWeek(anchorDate, { weekStartsOn: 1 }),
  });

  return weekDates.map((date) => calendarDateToLogicalDay(timezone, date));
}

export function countScheduledDays(
  habit: Habit,
  startDate: Date,
  endDate: Date,
  _timezone: string = 'UTC',
) {
  return eachDayOfInterval({ start: startDate, end: endDate }).filter((date) =>
    getHabitsForDateString([habit], date.toISOString().slice(0, 10)).length > 0,
  ).length;
}
