import { eachDayOfInterval } from 'date-fns';
import { useEffect, useState } from 'react';
import {
  subscribeToHabitLogs,
  subscribeToHabits,
} from '../services/habitService';
import type { Habit } from '../types/habit';
import { buildLogsByDate, countScheduledDays } from '../utils/habitUtils';
import { calendarDateToLogicalDay } from '../utils/dateUtils';

export interface HabitStatistic {
  id: string;
  name: string;
  category: string;
  completionRate: number;
  completedCount: number;
  scheduledDayCount: number;
  uiIconName: string;
  uiBgColor: string;
  uiMetric: string;
}

export interface CategoryStatistic {
  category: string;
  completionRate: number;
  completedCount: number;
  scheduledDayCount: number;
  habitCount: number;
}

export interface StatisticsSummary {
  habits: HabitStatistic[];
  categories: CategoryStatistic[];
  completionRate: number;
  completedCount: number;
  scheduledDayCount: number;
  averagePerDay: number;
  logsByDate: Record<string, Record<string, boolean>>;
}

const EMPTY_STATS: StatisticsSummary = {
  habits: [],
  categories: [],
  completionRate: 0,
  completedCount: 0,
  scheduledDayCount: 0,
  averagePerDay: 0,
  logsByDate: {},
};

const STATISTICS_TIMEOUT_MS = 10000;

function calculateHabitStatistic(
  habit: Habit,
  completedByHabitAndDate: Set<string>,
  startDate: Date,
  endDate: Date,
  timezone: string,
) {
  const scheduledDayCount = countScheduledDays(habit, startDate, endDate, timezone);
  const completedCount = eachDayOfInterval({
    start: startDate,
    end: endDate,
  }).filter((date) =>
    completedByHabitAndDate.has(`${habit.id}:${date.toISOString().slice(0, 10)}`),
  ).length;

  return {
    id: habit.id,
    name: habit.name,
    category: habit.category?.trim() || 'Uncategorized',
    completionRate:
      scheduledDayCount > 0
        ? Math.round((completedCount / scheduledDayCount) * 100)
        : 0,
    completedCount,
    scheduledDayCount,
    uiIconName: habit.uiIconName,
    uiBgColor: habit.uiBgColor,
    uiMetric: habit.uiMetric,
  } satisfies HabitStatistic;
}

function buildStatisticsSummary(
  logs: Array<{
    habitId: string;
    dateString: string;
    completed: boolean;
  }>,
  habits: Habit[],
  startDate: Date,
  endDate: Date,
  timezone: string,
) {
  const completedLogKeys = new Set(
    logs
      .filter((log) => log.completed)
      .map((log) => `${log.habitId}:${log.dateString}`),
  );

  const habitStats = habits
    .map((habit) =>
      calculateHabitStatistic(
        habit,
        completedLogKeys,
        startDate,
        endDate,
        timezone,
      ),
    )
    .filter((stat) => stat.scheduledDayCount > 0 || stat.completedCount > 0)
    .sort((left, right) => right.completionRate - left.completionRate);

  const categories = Object.values(
    habitStats.reduce<Record<string, CategoryStatistic>>((map, stat) => {
      if (!map[stat.category]) {
        map[stat.category] = {
          category: stat.category,
          completionRate: 0,
          completedCount: 0,
          scheduledDayCount: 0,
          habitCount: 0,
        };
      }

      map[stat.category].completedCount += stat.completedCount;
      map[stat.category].scheduledDayCount += stat.scheduledDayCount;
      map[stat.category].habitCount += 1;
      return map;
    }, {}),
  )
    .map((category) => ({
      ...category,
      completionRate:
        category.scheduledDayCount > 0
          ? Math.round((category.completedCount / category.scheduledDayCount) * 100)
          : 0,
    }))
    .sort((left, right) => right.completionRate - left.completionRate);

  const completedCount = habitStats.reduce(
    (sum, stat) => sum + stat.completedCount,
    0,
  );
  const scheduledDayCount = habitStats.reduce(
    (sum, stat) => sum + stat.scheduledDayCount,
    0,
  );
  const dayCount = eachDayOfInterval({ start: startDate, end: endDate }).length;

  return {
    habits: habitStats,
    categories,
    completionRate:
      scheduledDayCount > 0
        ? Math.round((completedCount / scheduledDayCount) * 100)
        : 0,
    completedCount,
    scheduledDayCount,
    averagePerDay:
      dayCount > 0 ? Number((completedCount / dayCount).toFixed(1)) : 0,
    logsByDate: buildLogsByDate(logs),
  } satisfies StatisticsSummary;
}

export function useStatistics(
  userId: string | undefined,
  startDate: Date,
  endDate: Date,
  timezone: string = 'UTC',
) {
  const [stats, setStats] = useState<StatisticsSummary>(EMPTY_STATS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCapped, setIsCapped] = useState(false);
  const startDateString = calendarDateToLogicalDay(timezone, startDate);
  const endDateString = calendarDateToLogicalDay(timezone, endDate);

  useEffect(() => {
    if (!userId) {
      setStats(EMPTY_STATS);
      setLoading(false);
      setError(null);
      setIsCapped(false);
      return;
    }

    let cancelled = false;
    const stableStartDate = new Date(`${startDateString}T12:00:00.000Z`);
    const stableEndDate = new Date(`${endDateString}T12:00:00.000Z`);
    let habitsLoaded = false;
    let logsLoaded = false;
    let latestHabits: Habit[] = [];
    let latestLogs: Array<{
      habitId: string;
      dateString: string;
      completed: boolean;
    }> = [];

    setLoading(true);
    setError(null);

    const timeoutId = window.setTimeout(() => {
      if (cancelled) {
        return;
      }

      setLoading(false);
      setError('Loading timeout. Please check your connection or retry.');
      setStats(EMPTY_STATS);
      setIsCapped(false);
    }, STATISTICS_TIMEOUT_MS);

    const applySummary = () => {
      if (cancelled || !habitsLoaded || !logsLoaded) {
        return;
      }

      window.clearTimeout(timeoutId);
      setStats(
        buildStatisticsSummary(
          latestLogs,
          latestHabits,
          stableStartDate,
          stableEndDate,
          timezone,
        ),
      );
      setIsCapped(false);
      setLoading(false);
      setError(null);
    };

    const handleError = (loadError: Error) => {
      if (cancelled) {
        return;
      }

      window.clearTimeout(timeoutId);
      setError(loadError.message || 'Failed to load statistics.');
      setStats(EMPTY_STATS);
      setIsCapped(false);
      setLoading(false);
    };

    const unsubscribeLogs = subscribeToHabitLogs(
      userId,
      startDateString,
      endDateString,
      (logs) => {
        latestLogs = logs;
        logsLoaded = true;
        applySummary();
      },
      handleError,
    );

    const unsubscribeHabits = subscribeToHabits(
      userId,
      (habits) => {
        latestHabits = habits;
        habitsLoaded = true;
        applySummary();
      },
      handleError,
      { includeArchived: true },
    );

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
      unsubscribeLogs();
      unsubscribeHabits();
    };
  }, [endDateString, startDateString, timezone, userId]);

  return { stats, loading, error, isCapped };
}
