import { eachDayOfInterval, format } from 'date-fns';
import { useEffect, useState } from 'react';
import {
  fetchHabitLogsForRange,
  fetchHabitsForUser,
} from '../services/habitService';
import type { Habit } from '../types/habit';
import { buildLogsByDate, countScheduledDays } from '../utils/habitUtils';

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

function calculateHabitStatistic(
  habit: Habit,
  completedByHabitAndDate: Set<string>,
  startDate: Date,
  endDate: Date,
) {
  const scheduledDayCount = countScheduledDays(habit, startDate, endDate);
  const completedCount = eachDayOfInterval({
    start: startDate,
    end: endDate,
  }).filter((date) =>
    completedByHabitAndDate.has(`${habit.id}:${format(date, 'yyyy-MM-dd')}`),
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

export function useStatistics(
  userId: string | undefined,
  startDate: Date,
  endDate: Date,
) {
  const [stats, setStats] = useState<StatisticsSummary>(EMPTY_STATS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCapped, setIsCapped] = useState(false);

  useEffect(() => {
    if (!userId) {
      setStats(EMPTY_STATS);
      setLoading(false);
      setError(null);
      setIsCapped(false);
      return;
    }

    let cancelled = false;
    const startDateString = format(startDate, 'yyyy-MM-dd');
    const endDateString = format(endDate, 'yyyy-MM-dd');

    setLoading(true);
    setError(null);

    void Promise.all([
      fetchHabitLogsForRange(userId, startDateString, endDateString, 1000),
      fetchHabitsForUser(userId, { includeArchived: true }),
    ])
      .then(([logs, habits]) => {
        if (cancelled) {
          return;
        }

        const completedLogKeys = new Set(
          logs
            .filter((log) => log.completed)
            .map((log) => `${log.habitId}:${log.dateString}`),
        );
        const habitStats = habits
          .map((habit) =>
            calculateHabitStatistic(habit, completedLogKeys, startDate, endDate),
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
                ? Math.round(
                    (category.completedCount / category.scheduledDayCount) * 100,
                  )
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

        setStats({
          habits: habitStats,
          categories,
          completionRate:
            scheduledDayCount > 0
              ? Math.round((completedCount / scheduledDayCount) * 100)
              : 0,
          completedCount,
          scheduledDayCount,
          averagePerDay:
            eachDayOfInterval({ start: startDate, end: endDate }).length > 0
              ? Number(
                  (
                    completedCount /
                    eachDayOfInterval({ start: startDate, end: endDate }).length
                  ).toFixed(1),
                )
              : 0,
          logsByDate: buildLogsByDate(logs),
        });
        setIsCapped(logs.length === 1000);
        setLoading(false);
      })
      .catch((loadError: unknown) => {
        if (cancelled) {
          return;
        }

        setError(
          loadError instanceof Error
            ? loadError.message
            : 'Failed to load statistics.',
        );
        setStats(EMPTY_STATS);
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [endDate, startDate, userId]);

  return { stats, loading, error, isCapped };
}
