import React, { useState } from 'react';
import {
  endOfMonth,
  endOfWeek,
  format,
  startOfMonth,
  startOfWeek,
} from 'date-fns';
import { motion } from 'framer-motion';
import { Activity, Calendar, Flame, Target } from 'lucide-react';
import { useStatistics } from '../hooks/useStatistics';

interface StatisticsPanelProps {
  isDarkMode: boolean;
  userId: string | undefined;
  userDisplayName: string;
}

function getRangeWindow(range: string) {
  const today = new Date();

  if (range === 'Daily') {
    return { startDate: today, endDate: today, label: 'Today' };
  }

  if (range === 'Monthly') {
    return {
      startDate: startOfMonth(today),
      endDate: endOfMonth(today),
      label: format(today, 'MMMM yyyy'),
    };
  }

  return {
    startDate: startOfWeek(today, { weekStartsOn: 1 }),
    endDate: endOfWeek(today, { weekStartsOn: 1 }),
    label: 'This Week',
  };
}

export function StatisticsPanel({
  isDarkMode,
  userId,
  userDisplayName,
}: StatisticsPanelProps) {
  const [range, setRange] = useState('Weekly');
  const { startDate, endDate, label } = getRangeWindow(range);
  const { stats, loading, error, isCapped } = useStatistics(
    userId,
    startDate,
    endDate,
  );

  return (
    <main className="flex-1 p-8 overflow-y-auto z-10">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-8">
          <div>
            <h1
              className={`text-4xl font-serif font-bold mb-2 ${
                isDarkMode ? 'text-[#FDF8F3]' : 'text-[#2A2421]'
              }`}
            >
              {userDisplayName}&apos;s statistics
            </h1>
            <p className={isDarkMode ? 'text-[#A58876]' : 'text-[#8A7E7A]'}>
              Real completion performance for {label.toLowerCase()}.
            </p>
          </div>

          <div
            className={`inline-flex backdrop-blur-md rounded-full p-1 ${
              isDarkMode ? 'bg-[#2A2421]/60' : 'bg-[#FAF5F0]/70'
            }`}
          >
            {['Daily', 'Weekly', 'Monthly'].map((option) => (
              <button
                key={option}
                onClick={() => setRange(option)}
                className={`relative px-5 py-2 text-sm font-medium rounded-full ${
                  range === option
                    ? 'text-white'
                    : isDarkMode
                      ? 'text-[#A58876]'
                      : 'text-[#2A2421]'
                }`}
              >
                {range === option ? (
                  <motion.div
                    layoutId="stats-range-pill"
                    className="absolute inset-0 rounded-full bg-[#D0705B]"
                  />
                ) : null}
                <span className="relative z-10">{option}</span>
              </button>
            ))}
          </div>
        </div>

        {isCapped ? (
          <div
            className={`mb-6 rounded-2xl px-4 py-3 text-sm ${
              isDarkMode
                ? 'bg-[#D0705B]/20 text-[#FDF8F3]'
                : 'bg-[#D0705B]/10 text-[#8C3B2B]'
            }`}
          >
            Showing data for your most recent habits.
          </div>
        ) : null}

        {loading ? (
          <div className={isDarkMode ? 'text-[#A58876]' : 'text-[#8A7E7A]'}>
            Loading statistics...
          </div>
        ) : error ? (
          <div className={isDarkMode ? 'text-[#F5C5BA]' : 'text-[#8C3B2B]'}>
            {error}
          </div>
        ) : stats.habits.length === 0 ? (
          <div
            className={`rounded-3xl p-8 text-center ${
              isDarkMode
                ? 'bg-[#2A2421]/60 text-[#A58876]'
                : 'bg-[#FAF5F0]/60 text-[#8A7E7A]'
            }`}
          >
            No data for this period.
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              {[
                {
                  label: 'Completion Rate',
                  value: `${stats.completionRate}%`,
                  helper: `${stats.completedCount} completed of ${stats.scheduledDayCount} scheduled`,
                  icon: <Target className="w-5 h-5 text-[#D0705B]/40" />,
                },
                {
                  label: 'Daily Average',
                  value: stats.averagePerDay.toFixed(1),
                  helper: 'completed habits per day',
                  icon: <Calendar className="w-5 h-5 text-[#D0705B]/40" />,
                },
                {
                  label: 'Top Habit',
                  value: `${stats.habits[0]?.completionRate ?? 0}%`,
                  helper: stats.habits[0]?.name || 'No habit data',
                  icon: <Flame className="w-5 h-5 text-[#D0705B]/40" />,
                },
              ].map((card, index) => (
                <motion.div
                  key={card.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.08 }}
                  className={`p-6 rounded-3xl backdrop-blur-md soft-shadow ${
                    isDarkMode
                      ? 'bg-[#2A2421]/60 border border-[#4A2C24]/30'
                      : 'bg-[#FAF5F0]/60 border border-[#EADCCF]/20'
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3
                      className={
                        isDarkMode
                          ? 'text-xs font-bold uppercase tracking-widest text-[#A58876]'
                          : 'text-xs font-bold uppercase tracking-widest text-[#8A7E7A]'
                      }
                    >
                      {card.label}
                    </h3>
                    {card.icon}
                  </div>
                  <p
                    className={
                      isDarkMode
                        ? 'text-4xl font-black text-[#FDF8F3]'
                        : 'text-4xl font-black text-[#2A2421]'
                    }
                  >
                    {card.value}
                  </p>
                  <p
                    className={
                      isDarkMode
                        ? 'text-sm mt-2 text-[#A58876]'
                        : 'text-sm mt-2 text-[#8A7E7A]'
                    }
                  >
                    {card.helper}
                  </p>
                </motion.div>
              ))}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`rounded-3xl p-6 backdrop-blur-md soft-shadow ${
                  isDarkMode
                    ? 'bg-[#2A2421]/60 border border-[#4A2C24]/30'
                    : 'bg-[#FAF5F0]/60 border border-[#EADCCF]/20'
                }`}
              >
                <div className="flex items-center justify-between mb-6">
                  <h2
                    className={
                      isDarkMode
                        ? 'font-serif text-2xl text-[#FDF8F3]'
                        : 'font-serif text-2xl text-[#2A2421]'
                    }
                  >
                    Categories
                  </h2>
                  <Activity className="w-5 h-5 text-[#D0705B]/40" />
                </div>
                <div className="space-y-4">
                  {stats.categories.map((category) => (
                    <div key={category.category}>
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className={isDarkMode ? 'text-[#FDF8F3]' : 'text-[#2A2421]'}>
                          {category.category}
                        </span>
                        <span className={isDarkMode ? 'text-[#A58876]' : 'text-[#8A7E7A]'}>
                          {category.completionRate}%
                        </span>
                      </div>
                      <div
                        className={`h-2 rounded-full overflow-hidden ${
                          isDarkMode ? 'bg-[#4A2C24]/40' : 'bg-[#E8DCD1]/50'
                        }`}
                      >
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${category.completionRate}%` }}
                          className="h-full rounded-full bg-[#D0705B]"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </motion.section>

              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08 }}
                className={`rounded-3xl p-6 backdrop-blur-md soft-shadow ${
                  isDarkMode
                    ? 'bg-[#2A2421]/60 border border-[#4A2C24]/30'
                    : 'bg-[#FAF5F0]/60 border border-[#EADCCF]/20'
                }`}
              >
                <h2
                  className={
                    isDarkMode
                      ? 'font-serif text-2xl mb-6 text-[#FDF8F3]'
                      : 'font-serif text-2xl mb-6 text-[#2A2421]'
                  }
                >
                  Habit Breakdown
                </h2>
                <div className="space-y-4">
                  {stats.habits.map((habit) => (
                    <div
                      key={habit.id}
                      className={`rounded-2xl p-4 ${
                        isDarkMode ? 'bg-[#4A2C24]/35' : 'bg-[#E8DCD1]/35'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className={isDarkMode ? 'font-semibold text-[#FDF8F3]' : 'font-semibold text-[#2A2421]'}>
                            {habit.name}
                          </p>
                          <p className={isDarkMode ? 'text-xs mt-1 text-[#A58876]' : 'text-xs mt-1 text-[#8A7E7A]'}>
                            {habit.category} · {habit.completedCount}/
                            {habit.scheduledDayCount} scheduled days
                          </p>
                        </div>
                        <span className="text-lg font-bold text-[#D0705B]">
                          {habit.completionRate}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.section>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
