import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { Activity, Apple, Dumbbell, Book, Heart, Moon, Flame, Coffee, Smile, Music, Zap, Target } from 'lucide-react';

interface AddActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (activity: NewActivity) => void;
  isDarkMode: boolean;
}

export interface NewActivity {
  name: string;
  metric: string;
  days: string[];
  category: string;
  iconName: string;
}

const ICONS = [
  { name: 'Activity', component: Activity },
  { name: 'Apple', component: Apple },
  { name: 'Dumbbell', component: Dumbbell },
  { name: 'Book', component: Book },
  { name: 'Heart', component: Heart },
  { name: 'Moon', component: Moon },
  { name: 'Flame', component: Flame },
  { name: 'Coffee', component: Coffee },
  { name: 'Smile', component: Smile },
  { name: 'Music', component: Music },
  { name: 'Zap', component: Zap },
  { name: 'Target', component: Target },
];

const CATEGORIES = ['Health', 'Fitness', 'Learning', 'Mindset', 'Productivity', 'Entertainment'];
const DAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
const DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export const AddActivityModal: React.FC<AddActivityModalProps> = ({ isOpen, onClose, onAdd, isDarkMode }) => {
  const [formData, setFormData] = useState<NewActivity>({
    name: '',
    metric: '',
    days: [],
    category: 'Health',
    iconName: 'Activity',
  });
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, name: e.target.value });
  };

  const handleMetricChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, metric: e.target.value });
  };

  const handleDayToggle = (dayName: string) => {
    setFormData(prev => ({
      ...prev,
      days: prev.days.includes(dayName)
        ? prev.days.filter(d => d !== dayName)
        : [...prev.days, dayName]
    }));
  };

  const handleCategorySelect = (category: string) => {
    setFormData({ ...formData, category });
    setIsCategoryDropdownOpen(false);
  };

  const handleIconSelect = (iconName: string) => {
    setFormData({ ...formData, iconName });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name.trim()) {
      onAdd(formData);
      setFormData({
        name: '',
        metric: '',
        days: [],
        category: 'Health',
        iconName: 'Activity',
      });
      onClose();
    }
  };

  const SelectedIconComponent = ICONS.find(i => i.name === formData.iconName)?.component || Activity;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 z-40"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className={`fixed left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl p-8 soft-shadow z-50 transition-colors duration-500 ${
              isDarkMode ? 'bg-[#2A2421]' : 'bg-[#FAF5F0]'
            }`}
          >
            <div className="flex justify-between items-center mb-6">
              <h2
                className={`font-serif text-3xl font-semibold transition-colors duration-500 ${
                  isDarkMode ? 'text-[#FDF8F3]' : 'text-[#2A2421]'
                }`}
              >
                Add New Activity
              </h2>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className={`p-2 rounded-full transition-colors ${
                  isDarkMode
                    ? 'hover:bg-[#4A2C24] text-[#FDF8F3]'
                    : 'hover:bg-[#E8DCD1] text-[#2A2421]'
                }`}
              >
                <X className="w-6 h-6" />
              </motion.button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Activity Name */}
              <div>
                <label
                  className={`block text-sm font-semibold mb-2 transition-colors duration-500 ${
                    isDarkMode ? 'text-[#FDF8F3]' : 'text-[#2A2421]'
                  }`}
                >
                  Activity Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={handleNameChange}
                  placeholder="e.g., Morning Meditation"
                  className={`w-full px-4 py-3 rounded-xl text-sm font-medium transition-colors duration-500 ${
                    isDarkMode
                      ? 'bg-[#4A2C24]/50 border border-[#4A2C24] text-[#FDF8F3] placeholder-[#A58876]'
                      : 'bg-white border border-[#E8DCD1] text-[#2A2421] placeholder-[#8A7E7A]'
                  }`}
                />
              </div>

              {/* Unit of Measurement */}
              <div>
                <label
                  className={`block text-sm font-semibold mb-2 transition-colors duration-500 ${
                    isDarkMode ? 'text-[#FDF8F3]' : 'text-[#2A2421]'
                  }`}
                >
                  Unit of Measurement
                </label>
                <input
                  type="text"
                  value={formData.metric}
                  onChange={handleMetricChange}
                  placeholder="e.g., 15 minutes, 2.5 liters"
                  className={`w-full px-4 py-3 rounded-xl text-sm font-medium transition-colors duration-500 ${
                    isDarkMode
                      ? 'bg-[#4A2C24]/50 border border-[#4A2C24] text-[#FDF8F3] placeholder-[#A58876]'
                      : 'bg-white border border-[#E8DCD1] text-[#2A2421] placeholder-[#8A7E7A]'
                  }`}
                />
              </div>

              {/* Category */}
              <div>
                <label
                  className={`block text-sm font-semibold mb-2 transition-colors duration-500 ${
                    isDarkMode ? 'text-[#FDF8F3]' : 'text-[#2A2421]'
                  }`}
                >
                  Category
                </label>
                <div className="relative">
                  <motion.button
                    type="button"
                    onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
                    className={`w-full px-4 py-3 rounded-xl text-sm font-medium transition-colors text-left flex items-center justify-between ${
                      isDarkMode
                        ? 'bg-[#4A2C24]/50 border border-[#4A2C24] text-[#FDF8F3] hover:bg-[#4A2C24]'
                        : 'bg-white border border-[#E8DCD1] text-[#2A2421] hover:bg-[#E8DCD1]/30'
                    }`}
                  >
                    <span>{formData.category}</span>
                    <motion.svg
                      animate={{ rotate: isCategoryDropdownOpen ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </motion.svg>
                  </motion.button>

                  <AnimatePresence>
                    {isCategoryDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className={`absolute top-full left-0 right-0 mt-2 rounded-xl border shadow-lg z-50 overflow-hidden transition-colors ${
                          isDarkMode
                            ? 'bg-[#4A2C24]/80 border-[#4A2C24]'
                            : 'bg-white border-[#E8DCD1]'
                        }`}
                      >
                        {CATEGORIES.map((category, index) => (
                          <motion.button
                            key={category}
                            type="button"
                            onClick={() => handleCategorySelect(category)}
                            whileHover={{ backgroundColor: isDarkMode ? 'rgba(208, 112, 91, 0.2)' : 'rgba(208, 112, 91, 0.1)' }}
                            className={`w-full px-4 py-3 text-sm font-medium text-left transition-colors ${
                              formData.category === category
                                ? isDarkMode
                                  ? 'bg-[#D0705B]/30 text-[#D0705B]'
                                  : 'bg-[#D0705B]/20 text-[#D0705B]'
                                : isDarkMode
                                ? 'text-[#FDF8F3]'
                                : 'text-[#2A2421]'
                            } ${index !== CATEGORIES.length - 1 ? (isDarkMode ? 'border-b border-[#4A2C24]' : 'border-b border-[#E8DCD1]') : ''}`}
                          >
                            {category}
                          </motion.button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Days Selection */}
              <div>
                <label
                  className={`block text-sm font-semibold mb-3 transition-colors duration-500 ${
                    isDarkMode ? 'text-[#FDF8F3]' : 'text-[#2A2421]'
                  }`}
                >
                  Days
                </label>
                <div className="grid grid-cols-7 gap-2">
                  {DAYS.map((day, index) => (
                    <motion.button
                      key={day}
                      type="button"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleDayToggle(DAY_NAMES[index])}
                      className={`py-2 px-2 rounded-lg font-medium text-sm transition-colors ${
                        formData.days.includes(DAY_NAMES[index])
                          ? 'bg-[#D0705B] text-white shadow-[0_2px_8px_rgba(208,112,91,0.4)]'
                          : isDarkMode
                          ? 'bg-[#4A2C24]/50 border border-[#4A2C24] text-[#FDF8F3] hover:bg-[#4A2C24]'
                          : 'bg-white border border-[#E8DCD1] text-[#2A2421] hover:bg-[#E8DCD1]/30'
                      }`}
                    >
                      {day}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Icon Selection */}
              <div>
                <label
                  className={`block text-sm font-semibold mb-3 transition-colors duration-500 ${
                    isDarkMode ? 'text-[#FDF8F3]' : 'text-[#2A2421]'
                  }`}
                >
                  Icon
                </label>
                <div className="grid grid-cols-6 gap-2 mb-4">
                  {ICONS.map(({ name, component: IconComponent }) => (
                    <motion.button
                      key={name}
                      type="button"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleIconSelect(name)}
                      className={`p-3 rounded-xl transition-colors ${
                        formData.iconName === name
                          ? 'bg-[#D0705B] shadow-[0_2px_8px_rgba(208,112,91,0.4)]'
                          : isDarkMode
                          ? 'bg-[#4A2C24]/50 border border-[#4A2C24] hover:bg-[#4A2C24]'
                          : 'bg-white border border-[#E8DCD1] hover:bg-[#E8DCD1]/30'
                      }`}
                    >
                      <IconComponent
                        className={`w-5 h-5 ${
                          formData.iconName === name
                            ? 'text-white'
                            : isDarkMode
                            ? 'text-[#D0705B]'
                            : 'text-[#D0705B]'
                        }`}
                      />
                    </motion.button>
                  ))}
                </div>
                <div
                  className={`flex items-center justify-center p-4 rounded-xl ${
                    isDarkMode ? 'bg-[#4A2C24]/30' : 'bg-[#E8DCD1]/30'
                  }`}
                >
                  <SelectedIconComponent className="w-8 h-8 text-[#D0705B]" />
                  <span
                    className={`ml-3 text-sm font-medium transition-colors duration-500 ${
                      isDarkMode ? 'text-[#FDF8F3]' : 'text-[#2A2421]'
                    }`}
                  >
                    {formData.iconName}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <motion.button
                  type="button"
                  onClick={onClose}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`flex-1 px-4 py-3 rounded-xl font-medium transition-colors ${
                    isDarkMode
                      ? 'bg-[#4A2C24]/50 text-[#FDF8F3] hover:bg-[#4A2C24]'
                      : 'bg-[#E8DCD1] text-[#2A2421] hover:bg-[#E8DCD1]/70'
                  }`}
                >
                  Cancel
                </motion.button>
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 px-4 py-3 rounded-xl bg-[#D0705B] text-white font-medium hover:bg-[#B85F4C] transition-colors shadow-[0_2px_8px_rgba(208,112,91,0.4)]"
                >
                  Add Activity
                </motion.button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
