import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Activity,
  Apple,
  Book,
  Check,
  Coffee,
  Dumbbell,
  Edit2,
  Flame,
  Heart,
  Moon,
  Music,
  Plus,
  Smile,
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
  Smile,
  Target,
  Zap,
};

interface HabitsPageProps {
  isDarkMode: boolean;
  habits: Habit[];
  completionMap: Record<string, boolean>;
  streakMap: Record<string, StreakStatus>;
  syncError?: string | null;
  onToggle: (habitId: string, currentValue: boolean) => void;
  onEdit: (habit: Habit) => void;
  onDelete: (id: string) => void;
  onAddClick: () => void;
}

function HabitCard({
  habit,
  completionMap,
  streakMap,
  isDarkMode,
  onToggle,
  onEdit,
  onDelete,
}: {
  habit: Habit;
  completionMap: Record<string, boolean>;
  streakMap: Record<string, StreakStatus>;
  isDarkMode: boolean;
  onToggle: (habitId: string, currentValue: boolean) => void;
  onEdit: (habit: Habit) => void;
  onDelete: (id: string) => void;
}) {
  const IconComponent = ICON_MAP[habit.uiIconName as keyof typeof ICON_MAP] || Activity;
  const isCompleted = completionMap[habit.id] ?? false;
  const currentStreak = streakMap[habit.id]?.currentStreak ?? 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      whileHover={{ y: -4 }}
      className={`backdrop-blur-md rounded-2xl p-4 soft-shadow transition-colors duration-500 group ${
        isDarkMode ? 'bg-[#2A2421]/70 hover:bg-[#2A2421]/90' : 'bg-[#FAF5F0]/70 hover:bg-[#FAF5F0]/90'
      }`}
    >
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => onToggle(habit.id, isCompleted)}
          className={`w-9 h-9 rounded-full border-2 flex items-center justify-center transition-colors ${
            isCompleted
              ? 'border-[#D0705B] bg-[#D0705B] text-white'
              : isDarkMode
                ? 'border-[#4A2C24] text-[#A58876]'
                : 'border-[#D9C8BC] text-[#8A7E7A]'
          }`}
          aria-label={`Toggle ${habit.name}`}
        >
          {isCompleted ? <Check className="w-4 h-4" /> : null}
        </button>

        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
            isDarkMode
              ? habit.uiBgColor.replace('bg-[#FDECE8]', 'bg-[#4A2C24]')
              : habit.uiBgColor
          }`}
        >
          <IconComponent className="w-6 h-6 text-[#D0705B]" />
        </div>

        <div className="flex-1 min-w-0">
          <h3
            className={`font-bold text-base truncate transition-colors ${
              isCompleted
                ? 'line-through text-[#8A7E7A]'
                : isDarkMode
                  ? 'text-[#FDF8F3]'
                  : 'text-[#2A2421]'
            }`}
          >
            {habit.name}
          </h3>
          <div className="flex items-center gap-2 text-xs mt-1">
            <Flame className="w-3.5 h-3.5 text-[#D0705B]" />
            <span className={isDarkMode ? 'text-[#A58876]' : 'text-[#8A7E7A]'}>
              {currentStreak} day{currentStreak === 1 ? '' : 's'}
            </span>
            <span className="w-1 h-1 rounded-full bg-[#8A7E7A]/50" />
            <span className={isDarkMode ? 'text-[#A58876]' : 'text-[#8A7E7A]'}>
              {habit.uiMetric}
            </span>
          </div>
          <div className="flex gap-2 mt-3 flex-wrap">
            {habit.category ? (
              <span
                className={`text-[10px] px-2 py-1 rounded-md ${
                  isDarkMode ? 'bg-[#D0705B]/20 text-[#F5C5BA]' : 'bg-[#D0705B]/10 text-[#B85F4C]'
                }`}
              >
                {habit.category}
              </span>
            ) : null}
            <span
              className={`text-[10px] px-2 py-1 rounded-md ${
                isDarkMode ? 'bg-[#4A2C24] text-[#EADCCF]' : 'bg-[#E8DCD1] text-[#4A3E37]'
              }`}
            >
              {habit.frequency.days.join(', ')}
            </span>
          </div>
        </div>

        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onEdit(habit)}
            className={`p-2 rounded-lg ${
              isDarkMode ? 'bg-[#D0705B]/20 text-[#D0705B]' : 'bg-[#D0705B]/10 text-[#B85F4C]'
            }`}
          >
            <Edit2 className="w-4 h-4" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onDelete(habit.id)}
            className={`p-2 rounded-lg ${
              isDarkMode ? 'bg-[#EF5350]/20 text-[#EF5350]' : 'bg-[#EF5350]/10 text-[#C43A37]'
            }`}
          >
            <Trash2 className="w-4 h-4" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

export function HabitsPage({
  isDarkMode,
  habits,
  completionMap,
  streakMap,
  syncError,
  onToggle,
  onEdit,
  onDelete,
  onAddClick,
}: HabitsPageProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredHabits = habits.filter((habit) => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) {
      return true;
    }

    return (
      habit.name.toLowerCase().includes(query) ||
      habit.category.toLowerCase().includes(query)
    );
  });

  return (
    <main className="flex-1 p-8 overflow-y-auto z-10">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-start gap-8 mb-8">
          <div>
            <h1
              className={`text-4xl font-serif font-bold mb-2 transition-colors ${
                isDarkMode ? 'text-[#FDF8F3]' : 'text-[#2A2421]'
              }`}
            >
              Your Habits
            </h1>
            <p className={isDarkMode ? 'text-[#A58876]' : 'text-[#8A7E7A]'}>
              Manage, complete, and refine your routines in real time.
            </p>
          </div>
          <motion.button
            onClick={onAddClick}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium ${
              isDarkMode ? 'bg-[#D0705B]/20 text-[#D0705B]' : 'bg-[#D0705B]/10 text-[#B85F4C]'
            }`}
          >
            <Plus className="w-4 h-4" />
            Add New
          </motion.button>
        </div>

        {syncError ? (
          <div
            className={`mb-5 rounded-2xl px-4 py-3 text-sm ${
              isDarkMode ? 'bg-[#EF5350]/15 text-[#F5C5BA]' : 'bg-[#EF5350]/10 text-[#8C3B2B]'
            }`}
          >
            {syncError}
          </div>
        ) : null}

        <div className="mb-6">
          <input
            type="text"
            placeholder="Search habits or categories..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            className={`w-full px-4 py-3 rounded-xl backdrop-blur-md border focus:outline-none ${
              isDarkMode
                ? 'bg-[#2A2421]/70 text-[#FDF8F3] placeholder-[#A58876] border-[#4A2C24]/50'
                : 'bg-[#FAF5F0]/70 text-[#2A2421] placeholder-[#8A7E7A] border-[#E8DCD1]/50'
            }`}
          />
        </div>

        <div className="grid gap-4">
          <AnimatePresence mode="popLayout">
            {filteredHabits.length > 0 ? (
              filteredHabits.map((habit) => (
                <div key={habit.id}>
                  <HabitCard
                    habit={habit}
                    completionMap={completionMap}
                    streakMap={streakMap}
                    isDarkMode={isDarkMode}
                    onToggle={onToggle}
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
                No habits found
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </main>
  );
}
