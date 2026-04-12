import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface EditCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (oldName: string, newName: string) => void;
  isDarkMode: boolean;
  categoryName: string | null;
}

export const EditCategoryModal: React.FC<EditCategoryModalProps> = ({ 
  isOpen, 
  onClose, 
  onSave, 
  isDarkMode, 
  categoryName 
}) => {
  const [newName, setNewName] = useState('');

  useEffect(() => {
    if (categoryName) {
      setNewName(categoryName);
    }
  }, [categoryName, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newName.trim() && categoryName && newName !== categoryName) {
      onSave(categoryName, newName.trim());
      onClose();
    }
  };

  if (!categoryName) return null;

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
            className={`fixed left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-md rounded-3xl p-8 soft-shadow z-50 transition-colors duration-500 ${
              isDarkMode ? 'bg-[#2A2421]' : 'bg-[#FAF5F0]'
            }`}
          >
            <div className="flex justify-between items-center mb-6">
              <h2
                className={`font-serif text-3xl font-semibold transition-colors duration-500 ${
                  isDarkMode ? 'text-[#FDF8F3]' : 'text-[#2A2421]'
                }`}
              >
                Edit Category
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
              {/* Category Name */}
              <div>
                <label
                  className={`block text-sm font-semibold mb-2 transition-colors duration-500 ${
                    isDarkMode ? 'text-[#FDF8F3]' : 'text-[#2A2421]'
                  }`}
                >
                  Category Name
                </label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g., Health, Fitness, Learning"
                  className={`w-full px-4 py-3 rounded-xl text-sm font-medium transition-colors duration-500 ${
                    isDarkMode
                      ? 'bg-[#4A2C24]/50 border border-[#4A2C24] text-[#FDF8F3] placeholder-[#A58876] focus:border-[#D0705B] focus:outline-none'
                      : 'bg-white border border-[#E8DCD1] text-[#2A2421] placeholder-[#8A7E7A] focus:border-[#D0705B] focus:outline-none'
                  }`}
                  autoFocus
                />
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
                  Save
                </motion.button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
