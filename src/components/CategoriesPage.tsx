import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Edit2 } from 'lucide-react';

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

interface CategoryItemProps {
  category: string;
  habits: Habit[];
  isDarkMode: boolean;
  expanded: boolean;
  onToggle: () => void;
  onEdit: (habit: Habit) => void;
}

const CategoryItem = ({ category, habits, isDarkMode, expanded, onToggle, onEdit }: CategoryItemProps) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className={`backdrop-blur-md rounded-2xl overflow-hidden transition-colors ${
      isDarkMode ? 'bg-[#2A2421]/70' : 'bg-[#FAF5F0]/70'
    }`}
  >
    <motion.button
      onClick={onToggle}
      className={`w-full px-6 py-4 flex items-center justify-between transition-colors ${
        isDarkMode ? 'hover:bg-[#2A2421]/90' : 'hover:bg-[#FAF5F0]/90'
      }`}
    >
      <div className="flex items-center gap-4 flex-1">
        <span className={`text-sm font-bold px-3 py-1 rounded-lg transition-colors ${
          isDarkMode ? 'bg-[#D0705B]/20 text-[#D0705B]' : 'bg-[#D0705B]/10 text-[#D0705B]'
        }`}>
          {habits.length} {habits.length === 1 ? 'habit' : 'habits'}
        </span>
        <h3 className={`text-lg font-bold transition-colors ${
          isDarkMode ? 'text-[#FDF8F3]' : 'text-[#2A2421]'
        }`}>
          {category}
        </h3>
      </div>
      <motion.div
        animate={{ rotate: expanded ? 180 : 0 }}
        transition={{ duration: 0.3 }}
      >
        <ChevronDown className={`w-5 h-5 transition-colors ${
          isDarkMode ? 'text-[#A58876]' : 'text-[#8A7E7A]'
        }`} />
      </motion.div>
    </motion.button>

    <AnimatePresence>
      {expanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
          className={`border-t transition-colors ${
            isDarkMode ? 'border-[#4A2C24]/50' : 'border-[#E8DCD1]/50'
          }`}
        >
          <div className="px-6 py-4 space-y-3">
            {habits.map((habit, idx) => (
              <motion.div
                key={`${habit.id}-${idx}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className={`flex items-center justify-between gap-3 p-3 rounded-lg transition-colors ${
                  isDarkMode ? 'bg-[#4A2C24]/30 hover:bg-[#4A2C24]/50' : 'bg-[#E8DCD1]/30 hover:bg-[#E8DCD1]/50'
                }`}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-sm ${
                    isDarkMode ? 'bg-[#2A2421]' : 'bg-[#FAF5F0]'
                  }`}>
                    {habit.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-bold truncate transition-colors ${
                      isDarkMode ? 'text-[#FDF8F3]' : 'text-[#2A2421]'
                    }`}>
                      {habit.title}
                    </p>
                    <p className={`text-xs transition-colors ${
                      isDarkMode ? 'text-[#A58876]' : 'text-[#8A7E7A]'
                    }`}>
                      {habit.metric}
                    </p>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onEdit(habit)}
                  className={`p-2 rounded-lg transition-colors shrink-0 ${
                    isDarkMode ? 'bg-[#D0705B]/20 text-[#D0705B] hover:bg-[#D0705B]/30' : 'bg-[#D0705B]/10 text-[#D0705B] hover:bg-[#D0705B]/20'
                  }`}
                >
                  <Edit2 className="w-4 h-4" />
                </motion.button>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  </motion.div>
);

interface CategoriesPageProps {
  isDarkMode: boolean;
  habits: Habit[];
  onEdit: (habit: Habit) => void;
}

export const CategoriesPage = ({ isDarkMode, habits, onEdit }: CategoriesPageProps) => {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  // Group habits by category
  const groupedByCategory = habits.reduce((acc, habit) => {
    const category = habit.category || 'Uncategorized';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(habit);
    return acc;
  }, {} as Record<string, Habit[]>);

  const categories = Object.keys(groupedByCategory).sort();

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  return (
    <main className="flex-1 p-8 overflow-y-auto z-10">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className={`text-4xl font-serif font-bold mb-2 transition-colors ${
            isDarkMode ? 'text-[#FDF8F3]' : 'text-[#2A2421]'
          }`}>
            Categories
          </h1>
          <p className={`transition-colors ${
            isDarkMode ? 'text-[#A58876]' : 'text-[#8A7E7A]'
          }`}>
            Organize your habits by category
          </p>
        </div>

        <div className="grid gap-4">
          <AnimatePresence mode="popLayout">
            {categories.length > 0 ? (
              categories.map(category => (
                <CategoryItem
                  key={category}
                  category={category}
                  habits={groupedByCategory[category]}
                  isDarkMode={isDarkMode}
                  expanded={expandedCategories.has(category)}
                  onToggle={() => toggleCategory(category)}
                  onEdit={onEdit}
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
                <p className={`transition-colors ${
                  isDarkMode ? 'text-[#A58876]' : 'text-[#8A7E7A]'
                }`}>
                  No categories found
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </main>
  );
};
