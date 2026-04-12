import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Edit2, Trash2, Flame } from 'lucide-react';

interface Habit {
  id: number;
  title: string;
  metric: string;
  icon: React.ReactNode;
  applicableDays?: string[];
  category?: string;
  streak?: string;
  done?: boolean;
  bg?: string;
  iconName?: string;
}

interface StreakPageProps {
  isDarkMode: boolean;
  habits: Habit[];
  onEdit: (habit: Habit) => void;
  onDelete: (id: number) => void;
}

const StreakCard = ({ habit, isDarkMode, onEdit, onDelete }: { habit: Habit; isDarkMode: boolean; onEdit: (habit: Habit) => void; onDelete: (id: number) => void }) => {
  const streakCount = habit.streak ? parseInt(habit.streak.split(' ')[0]) : 0;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ y: -4 }}
      className={`backdrop-blur-md rounded-2xl p-6 soft-shadow transition-colors duration-500 group ${
        isDarkMode ? 'bg-[#2A2421]/70 hover:bg-[#2A2421]/90' : 'bg-[#FAF5F0]/70 hover:bg-[#FAF5F0]/90'
      }`}
    >
      <div className="flex items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-4 flex-1">
          <div className={`w-14 h-14 rounded-xl flex items-center justify-center shrink-0 text-lg ${isDarkMode ? 'bg-[#4A2C24]' : 'bg-[#FDECE8]'}`}>
            {habit.icon}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className={`font-bold text-lg truncate transition-colors ${isDarkMode ? 'text-[#FDF8F3]' : 'text-[#2A2421]'}`}>
              {habit.title}
            </h3>
            <p className={`text-sm mt-1 transition-colors ${isDarkMode ? 'text-[#A58876]' : 'text-[#8A7E7A]'}`}>
              {habit.metric}
            </p>
          </div>
        </div>

        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onEdit(habit)}
            className={`p-2 rounded-lg transition-colors ${
              isDarkMode ? 'bg-[#D0705B]/20 text-[#D0705B] hover:bg-[#D0705B]/30' : 'bg-[#D0705B]/10 text-[#D0705B] hover:bg-[#D0705B]/20'
            }`}
          >
            <Edit2 className="w-4 h-4" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onDelete(habit.id)}
            className={`p-2 rounded-lg transition-colors ${
              isDarkMode ? 'bg-[#EF5350]/20 text-[#EF5350] hover:bg-[#EF5350]/30' : 'bg-[#EF5350]/10 text-[#EF5350] hover:bg-[#EF5350]/20'
            }`}
          >
            <Trash2 className="w-4 h-4" />
          </motion.button>
        </div>
      </div>

      <div className="space-y-3">
        {habit.category && (
          <div className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
            isDarkMode ? 'bg-[#4A2C24]/30' : 'bg-[#E8DCD1]/30'
          }`}>
            <span className={`text-sm font-medium transition-colors ${isDarkMode ? 'text-[#A58876]' : 'text-[#8A7E7A]'}`}>
              Category
            </span>
            <span className={`text-sm font-bold transition-colors ${isDarkMode ? 'text-[#FDF8F3]' : 'text-[#2A2421]'}`}>
              {habit.category}
            </span>
          </div>
        )}

        {/* Streak Display */}
        <div className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
          isDarkMode ? 'bg-[#D0705B]/20' : 'bg-[#D0705B]/10'
        }`}>
          <div className="flex items-center gap-2">
            <Flame className={`w-5 h-5 transition-colors ${isDarkMode ? 'text-[#D0705B]' : 'text-[#D0705B]'}`} />
            <span className={`text-sm font-medium transition-colors ${isDarkMode ? 'text-[#A58876]' : 'text-[#8A7E7A]'}`}>
              Current Streak
            </span>
          </div>
          <motion.span
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className={`text-xl font-bold transition-colors ${isDarkMode ? 'text-[#D0705B]' : 'text-[#D0705B]'}`}
          >
            {habit.streak || '0 days'}
          </motion.span>
        </div>

        {habit.applicableDays && habit.applicableDays.length > 0 && (
          <div className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
            isDarkMode ? 'bg-[#4A2C24]/30' : 'bg-[#E8DCD1]/30'
          }`}>
            <span className={`text-sm font-medium transition-colors ${isDarkMode ? 'text-[#A58876]' : 'text-[#8A7E7A]'}`}>
              Schedule
            </span>
            <span className={`text-sm font-semibold transition-colors ${isDarkMode ? 'text-[#FDF8F3]' : 'text-[#2A2421]'}`}>
              {habit.applicableDays.join(', ')}
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export const StreakPage = ({ isDarkMode, habits, onEdit, onDelete }: StreakPageProps) => {
  // Sort habits by streak count (descending)
  const sortedHabits = [...habits].sort((a, b) => {
    const streakA = a.streak ? parseInt(a.streak.split(' ')[0]) : 0;
    const streakB = b.streak ? parseInt(b.streak.split(' ')[0]) : 0;
    return streakB - streakA;
  });

  const topStreakCount = sortedHabits.length > 0 ? parseInt(sortedHabits[0].streak?.split(' ')[0] || '0') : 0;

  return (
    <main className="flex-1 p-8 overflow-y-auto z-10">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className={`text-4xl font-serif font-bold mb-2 transition-colors ${
            isDarkMode ? 'text-[#FDF8F3]' : 'text-[#2A2421]'
          }`}>
            Streaks
          </h1>
          <p className={`transition-colors ${
            isDarkMode ? 'text-[#A58876]' : 'text-[#8A7E7A]'
          }`}>
            Keep your momentum going
          </p>
        </div>

        {/* Top Streak Summary */}
        {sortedHabits.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`backdrop-blur-md rounded-2xl p-6 mb-8 soft-shadow transition-colors ${
              isDarkMode ? 'bg-[#2A2421]/70' : 'bg-[#FAF5F0]/70'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium transition-colors ${isDarkMode ? 'text-[#A58876]' : 'text-[#8A7E7A]'}`}>
                  Your Longest Streak
                </p>
                <h2 className={`text-2xl font-bold mt-1 transition-colors ${isDarkMode ? 'text-[#FDF8F3]' : 'text-[#2A2421]'}`}>
                  {sortedHabits[0].title}
                </h2>
              </div>
              <motion.div
                className="flex items-center gap-2"
              >
                <Flame className="w-8 h-8 text-[#D0705B]" />
                <span className={`text-3xl font-bold transition-colors ${isDarkMode ? 'text-[#D0705B]' : 'text-[#D0705B]'}`}>
                  {topStreakCount}
                </span>
              </motion.div>
            </div>
          </motion.div>
        )}

        {/* Habits List */}
        <div className="grid gap-4">
          <AnimatePresence mode="popLayout">
            {sortedHabits.length > 0 ? (
              sortedHabits.map((habit, idx) => (
                <motion.div
                  key={habit.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <StreakCard
                    habit={habit}
                    isDarkMode={isDarkMode}
                    onEdit={onEdit}
                    onDelete={onDelete}
                  />
                </motion.div>
              ))
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className={`text-center py-12 rounded-2xl backdrop-blur-md transition-colors ${
                  isDarkMode ? 'bg-[#2A2421]/50' : 'bg-[#FAF5F0]/50'
                }`}
              >
                <Flame className={`w-12 h-12 mx-auto mb-4 opacity-30 ${isDarkMode ? 'text-[#FDF8F3]' : 'text-[#2A2421]'}`} />
                <p className={`transition-colors ${
                  isDarkMode ? 'text-[#A58876]' : 'text-[#8A7E7A]'
                }`}>
                  No habits yet. Create one to start building your streak!
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </main>
  );
};
