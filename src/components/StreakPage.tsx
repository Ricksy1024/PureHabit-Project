import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Activity,
  Apple,
  Book,
  Coffee,
  Dumbbell,
  Edit2,
  Flame,
  Heart,
  Moon,
  Music,
  Target,
  Trash2,
  Zap,
} from 'lucide-react';
import type { Habit, StreakStatus } from '../types/habit';

const ICON_MAP = {
  Activity,
  Apple,
  Book,
  Coffee,
  Dumbbell,
  Flame,
  Heart,
  Moon,
  Music,
  Target,
  Zap,
};

interface StreakPageProps {
  isDarkMode: boolean;
  habits: Habit[];
  streakMap: Record<string, StreakStatus>;
  loading?: boolean;
  error?: string | null;
  onEdit: (habit: Habit) => void;
  onDelete: (id: string) => void;
}

function StreakCard({
  habit,
  streak,
  isDarkMode,
  onEdit,
  onDelete,
}: {
  habit: Habit;
  streak?: StreakStatus;
  isDarkMode: boolean;
  onEdit: (habit: Habit) => void;
  onDelete: (id: string) => void;
}) {
  const IconComponent = ICON_MAP[habit.uiIconName as keyof typeof ICON_MAP] || Activity;
  const currentStreak = streak?.currentStreak ?? 0;
  const longestStreak = streak?.longestStreak ?? 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      className={`backdrop-blur-md rounded-2xl p-6 soft-shadow transition-colors duration-500 group ${
        isDarkMode ? 'bg-[#2A2421]/70 hover:bg-[#2A2421]/90' : 'bg-[#FAF5F0]/70 hover:bg-[#FAF5F0]/90'
      }`}
    >
      <div className="flex items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-4 flex-1">
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
              isDarkMode
                ? habit.uiBgColor.replace('bg-[#FDECE8]', 'bg-[#4A2C24]')
                : habit.uiBgColor
            }`}
          >
            <IconComponent className="w-6 h-6 text-[#D0705B]" />
          </div>
          <div>
            <h3 className={isDarkMode ? 'font-bold text-[#FDF8F3]' : 'font-bold text-[#2A2421]'}>
              {habit.name}
            </h3>
            <p className={isDarkMode ? 'text-xs text-[#A58876]' : 'text-xs text-[#8A7E7A]'}>
              {habit.uiMetric}
            </p>
          </div>
        </div>

        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            type="button"
            onClick={() => onEdit(habit)}
            className={`p-2 rounded-lg ${
              isDarkMode ? 'bg-[#D0705B]/20 text-[#D0705B]' : 'bg-[#D0705B]/10 text-[#B85F4C]'
            }`}
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(habit.id)}
            className={`p-2 rounded-lg ${
              isDarkMode ? 'bg-[#EF5350]/20 text-[#EF5350]' : 'bg-[#EF5350]/10 text-[#C43A37]'
            }`}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div
          className={`rounded-2xl p-4 ${
            isDarkMode ? 'bg-[#4A2C24]/45' : 'bg-[#E8DCD1]/45'
          }`}
        >
          <p className={isDarkMode ? 'text-xs text-[#A58876]' : 'text-xs text-[#8A7E7A]'}>
            Current Streak
          </p>
          <p className="mt-2 text-2xl font-bold text-[#D0705B]">
            {currentStreak} day{currentStreak === 1 ? '' : 's'}
          </p>
        </div>
        <div
          className={`rounded-2xl p-4 ${
            isDarkMode ? 'bg-[#4A2C24]/45' : 'bg-[#E8DCD1]/45'
          }`}
        >
          <p className={isDarkMode ? 'text-xs text-[#A58876]' : 'text-xs text-[#8A7E7A]'}>
            Longest Streak
          </p>
          <p className={isDarkMode ? 'mt-2 text-2xl font-bold text-[#FDF8F3]' : 'mt-2 text-2xl font-bold text-[#2A2421]'}>
            {longestStreak} day{longestStreak === 1 ? '' : 's'}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

export function StreakPage({
  isDarkMode,
  habits,
  streakMap,
  loading,
  error,
  onEdit,
  onDelete,
}: StreakPageProps) {
  const sortedHabits = [...habits].sort(
    (left, right) =>
      (streakMap[right.id]?.currentStreak ?? 0) -
      (streakMap[left.id]?.currentStreak ?? 0),
  );
  const topHabit = sortedHabits[0];
  const topStreakCount = topHabit ? streakMap[topHabit.id]?.currentStreak ?? 0 : 0;

  return (
    <main className="flex-1 p-8 overflow-y-auto z-10">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className={isDarkMode ? 'text-4xl font-serif font-bold mb-2 text-[#FDF8F3]' : 'text-4xl font-serif font-bold mb-2 text-[#2A2421]'}>
            Streaks
          </h1>
          <p className={isDarkMode ? 'text-[#A58876]' : 'text-[#8A7E7A]'}>
            Live streak counters from the backend streak cache.
          </p>
        </div>

        {topHabit ? (
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            className={`backdrop-blur-md rounded-2xl p-6 mb-8 soft-shadow ${
              isDarkMode ? 'bg-[#2A2421]/70' : 'bg-[#FAF5F0]/70'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className={isDarkMode ? 'text-sm text-[#A58876]' : 'text-sm text-[#8A7E7A]'}>
                  Current leader
                </p>
                <h2 className={isDarkMode ? 'text-2xl font-bold mt-1 text-[#FDF8F3]' : 'text-2xl font-bold mt-1 text-[#2A2421]'}>
                  {topHabit.name}
                </h2>
              </div>
              <div className="flex items-center gap-2 text-[#D0705B]">
                <Flame className="w-8 h-8" />
                <span className="text-3xl font-bold">{topStreakCount}</span>
              </div>
            </div>
          </motion.div>
        ) : null}

        {loading ? (
          <div className={isDarkMode ? 'text-[#A58876]' : 'text-[#8A7E7A]'}>
            Loading streaks...
          </div>
        ) : error ? (
          <div className={isDarkMode ? 'text-[#F5C5BA]' : 'text-[#8C3B2B]'}>{error}</div>
        ) : (
          <div className="grid gap-4">
            <AnimatePresence mode="popLayout">
              {sortedHabits.length > 0 ? (
                sortedHabits.map((habit) => (
                  <div key={habit.id}>
                    <StreakCard
                      habit={habit}
                      streak={streakMap[habit.id]}
                      isDarkMode={isDarkMode}
                      onEdit={onEdit}
                      onDelete={onDelete}
                    />
                  </div>
                ))
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className={`text-center py-12 rounded-2xl backdrop-blur-md ${
                    isDarkMode ? 'bg-[#2A2421]/50 text-[#A58876]' : 'bg-[#FAF5F0]/50 text-[#8A7E7A]'
                  }`}
                >
                  <Flame className="w-12 h-12 mx-auto mb-4 opacity-30" />
                  No habits yet. Create one to start building your streak.
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </main>
  );
}
