import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Apple, Dumbbell, Book, Heart, Moon, Flame, Coffee, Smile, Music, Zap, Target, Edit2, Trash2, Plus } from 'lucide-react';

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
}

interface HabitCardProps {
  habit: Habit;
  isDarkMode: boolean;
  onEdit: (habit: Habit) => void;
  onDelete: (id: number) => void;
}

const HabitCard = ({ habit, isDarkMode, onEdit, onDelete }: HabitCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, scale: 0.9 }}
    whileHover={{ y: -4 }}
    className={`backdrop-blur-md rounded-2xl p-4 soft-shadow transition-colors duration-500 group ${
      isDarkMode ? 'bg-[#2A2421]/70 hover:bg-[#2A2421]/90' : 'bg-[#FAF5F0]/70 hover:bg-[#FAF5F0]/90'
    }`}
  >
    <div className="flex items-start justify-between gap-4">
      <div className="flex items-start gap-3 flex-1">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${isDarkMode ? 'bg-[#4A2C24]' : 'bg-[#FDECE8]'}`}>
          {habit.icon}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className={`font-bold text-base truncate transition-colors ${isDarkMode ? 'text-[#FDF8F3]' : 'text-[#2A2421]'}`}>
            {habit.title}
          </h3>
          <p className={`text-xs mt-1 transition-colors ${isDarkMode ? 'text-[#A58876]' : 'text-[#8A7E7A]'}`}>
            {habit.metric}
          </p>
          <div className="flex gap-2 mt-2 flex-wrap">
            {habit.category && (
              <span className={`text-[10px] px-2 py-1 rounded-md transition-colors ${
                isDarkMode ? 'bg-[#D0705B]/20 text-[#D0705B]' : 'bg-[#D0705B]/10 text-[#D0705B]'
              }`}>
                {habit.category}
              </span>
            )}
            {habit.applicableDays && habit.applicableDays.length > 0 && (
              <span className={`text-[10px] px-2 py-1 rounded-md transition-colors ${
                isDarkMode ? 'bg-[#4A2C24] text-[#A58876]' : 'bg-[#E8DCD1] text-[#2A2421]'
              }`}>
                {habit.applicableDays.join(', ')}
              </span>
            )}
          </div>
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
  </motion.div>
);

interface HabitsPageProps {
  isDarkMode: boolean;
  habits: Habit[];
  onEdit: (habit: Habit) => void;
  onDelete: (id: number) => void;
  onAddClick: () => void;
}

export const HabitsPage = ({ isDarkMode, habits, onEdit, onDelete, onAddClick }: HabitsPageProps) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredHabits = habits.filter(habit =>
    habit.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    habit.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <main className="flex-1 p-8 overflow-y-auto z-10">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-start gap-8 mb-8">
          <div>
            <h1 className={`text-4xl font-serif font-bold mb-2 transition-colors ${isDarkMode ? 'text-[#FDF8F3]' : 'text-[#2A2421]'}`}>
              Your Habits
            </h1>
            <p className={`transition-colors ${isDarkMode ? 'text-[#A58876]' : 'text-[#8A7E7A]'}`}>
              Manage and customize your daily activities
            </p>
          </div>
          <motion.button
            onClick={onAddClick}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors shrink-0 ${
              isDarkMode ? 'bg-[#D0705B]/20 text-[#D0705B] hover:bg-[#D0705B]/30' : 'bg-[#D0705B]/10 text-[#D0705B] hover:bg-[#D0705B]/20'
            }`}
          >
            <Plus className="w-4 h-4" />
            Add New
          </motion.button>
        </div>

        <div className="mb-6">
          <input
            type="text"
            placeholder="Search habits..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full px-4 py-3 rounded-xl backdrop-blur-md transition-colors ${
              isDarkMode
                ? 'bg-[#2A2421]/70 text-[#FDF8F3] placeholder-[#A58876] border border-[#4A2C24]/50 focus:border-[#D0705B]/50'
                : 'bg-[#FAF5F0]/70 text-[#2A2421] placeholder-[#8A7E7A] border border-[#E8DCD1]/50 focus:border-[#D0705B]/50'
            } focus:outline-none`}
          />
        </div>

        <div className="grid gap-4">
          <AnimatePresence mode="popLayout">
            {filteredHabits.length > 0 ? (
              filteredHabits.map(habit => (
                <HabitCard
                  key={habit.id}
                  habit={habit}
                  isDarkMode={isDarkMode}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
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
                <p className={`transition-colors ${isDarkMode ? 'text-[#A58876]' : 'text-[#8A7E7A]'}`}>
                  No habits found
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </main>
  );
};
