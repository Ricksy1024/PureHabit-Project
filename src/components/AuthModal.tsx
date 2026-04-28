import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, User, Eye, EyeOff } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (email: string, password: string, username?: string) => void;
  isDarkMode: boolean;
}

export function AuthModal({ isOpen, onClose, onLogin, isDarkMode }: AuthModalProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    if (isSignUp) {
      if (!username) {
        setError('Username is required');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match');
        return;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters');
        return;
      }
    }

    // Simulate login/signup
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onLogin(email, password, username);
    }, 1000);
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setUsername('');
    setConfirmPassword('');
    setError('');
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  const toggleMode = () => {
    resetForm();
    setIsSignUp(!isSignUp);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className={`rounded-3xl backdrop-blur-md p-8 shadow-2xl max-w-md w-full transition-colors duration-500 ${
              isDarkMode ? 'bg-[#2A2421]/95' : 'bg-[#FAF5F0]/95'
            }`}
          >
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <h2 className={`font-serif text-3xl font-bold transition-colors duration-500 ${
                isDarkMode ? 'text-[#FDF8F3]' : 'text-[#2A2421]'
              }`}>
                {isSignUp ? 'Sign Up' : 'Login'}
              </h2>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className={`p-2 rounded-full transition-colors duration-300 ${
                  isDarkMode
                    ? 'hover:bg-[#4A2C24] text-[#A58876]'
                    : 'hover:bg-[#E8DCD1] text-[#8A7E7A]'
                }`}
              >
                <X className="w-5 h-5" />
              </motion.button>
            </div>

            <p className={`mb-6 transition-colors duration-500 ${
              isDarkMode ? 'text-[#A58876]' : 'text-[#8A7E7A]'
            }`}>
              {isSignUp
                ? 'Create a new account to get started'
                : 'Welcome back! Please login to continue'}
            </p>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Username field - SignUp only */}
              {isSignUp && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <label className={`block text-sm font-medium mb-2 transition-colors duration-500 ${
                    isDarkMode ? 'text-[#FDF8F3]' : 'text-[#2A2421]'
                  }`}>
                    Username
                  </label>
                  <div className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                    isDarkMode
                      ? 'bg-[#4A2C24]/30 border border-[#4A2C24]/50 focus-within:border-[#D0705B]'
                      : 'bg-[#E8DCD1]/20 border border-[#E8DCD1]/50 focus-within:border-[#D0705B]'
                  }`}>
                    <User className={`w-5 h-5 transition-colors duration-300 ${
                      isDarkMode ? 'text-[#A58876]' : 'text-[#8A7E7A]'
                    }`} />
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Choose a username"
                      className={`flex-1 bg-transparent outline-none transition-colors duration-500 ${
                        isDarkMode ? 'text-[#FDF8F3] placeholder-[#A58876]' : 'text-[#2A2421] placeholder-[#8A7E7A]'
                      }`}
                    />
                  </div>
                </motion.div>
              )}

              {/* Email field */}
              <div>
                <label className={`block text-sm font-medium mb-2 transition-colors duration-500 ${
                  isDarkMode ? 'text-[#FDF8F3]' : 'text-[#2A2421]'
                }`}>
                  Email
                </label>
                <div className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                  isDarkMode
                    ? 'bg-[#4A2C24]/30 border border-[#4A2C24]/50 focus-within:border-[#D0705B]'
                    : 'bg-[#E8DCD1]/20 border border-[#E8DCD1]/50 focus-within:border-[#D0705B]'
                }`}>
                  <Mail className={`w-5 h-5 transition-colors duration-300 ${
                    isDarkMode ? 'text-[#A58876]' : 'text-[#8A7E7A]'
                  }`} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your.email@example.com"
                    className={`flex-1 bg-transparent outline-none transition-colors duration-500 ${
                      isDarkMode ? 'text-[#FDF8F3] placeholder-[#A58876]' : 'text-[#2A2421] placeholder-[#8A7E7A]'
                    }`}
                  />
                </div>
              </div>

              {/* Password field */}
              <div>
                <label className={`block text-sm font-medium mb-2 transition-colors duration-500 ${
                  isDarkMode ? 'text-[#FDF8F3]' : 'text-[#2A2421]'
                }`}>
                  Password
                </label>
                <div className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                  isDarkMode
                    ? 'bg-[#4A2C24]/30 border border-[#4A2C24]/50 focus-within:border-[#D0705B]'
                    : 'bg-[#E8DCD1]/20 border border-[#E8DCD1]/50 focus-within:border-[#D0705B]'
                }`}>
                  <Lock className={`w-5 h-5 transition-colors duration-300 ${
                    isDarkMode ? 'text-[#A58876]' : 'text-[#8A7E7A]'
                  }`} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className={`flex-1 bg-transparent outline-none transition-colors duration-500 ${
                      isDarkMode ? 'text-[#FDF8F3] placeholder-[#A58876]' : 'text-[#2A2421] placeholder-[#8A7E7A]'
                    }`}
                  />
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.1 }}
                    onClick={() => setShowPassword(!showPassword)}
                    className={`transition-colors duration-300 ${
                      isDarkMode ? 'text-[#A58876] hover:text-[#FDF8F3]' : 'text-[#8A7E7A] hover:text-[#2A2421]'
                    }`}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </motion.button>
                </div>
              </div>

              {/* Confirm Password field - SignUp only */}
              {isSignUp && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <label className={`block text-sm font-medium mb-2 transition-colors duration-500 ${
                    isDarkMode ? 'text-[#FDF8F3]' : 'text-[#2A2421]'
                  }`}>
                    Confirm Password
                  </label>
                  <div className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                    isDarkMode
                      ? 'bg-[#4A2C24]/30 border border-[#4A2C24]/50 focus-within:border-[#D0705B]'
                      : 'bg-[#E8DCD1]/20 border border-[#E8DCD1]/50 focus-within:border-[#D0705B]'
                  }`}>
                    <Lock className={`w-5 h-5 transition-colors duration-300 ${
                      isDarkMode ? 'text-[#A58876]' : 'text-[#8A7E7A]'
                    }`} />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className={`flex-1 bg-transparent outline-none transition-colors duration-500 ${
                        isDarkMode ? 'text-[#FDF8F3] placeholder-[#A58876]' : 'text-[#2A2421] placeholder-[#8A7E7A]'
                      }`}
                    />
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.1 }}
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className={`transition-colors duration-300 ${
                        isDarkMode ? 'text-[#A58876] hover:text-[#FDF8F3]' : 'text-[#8A7E7A] hover:text-[#2A2421]'
                      }`}
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </motion.button>
                  </div>
                </motion.div>
              )}

              {/* Error message */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="p-3 rounded-lg bg-red-500/20 text-red-500 text-sm font-medium"
                  >
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Submit button */}
              <motion.button
                type="submit"
                disabled={isLoading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full py-3 rounded-xl font-semibold text-white transition-all duration-300 ${
                  isLoading
                    ? 'bg-[#D0705B]/50 cursor-not-allowed'
                    : 'bg-[#D0705B] hover:bg-[#C86B52] cursor-pointer'
                }`}
              >
                {isLoading ? 'Loading...' : isSignUp ? 'Sign Up' : 'Login'}
              </motion.button>
            </form>

            {/* Toggle mode */}
            <div className={`mt-6 text-center text-sm transition-colors duration-500 ${
              isDarkMode ? 'text-[#A58876]' : 'text-[#8A7E7A]'
            }`}>
              {isSignUp ? 'Already have an account?' : 'Don\'t have an account?'}{' '}
              <button
                onClick={toggleMode}
                className={`font-semibold transition-colors duration-300 ${
                  isDarkMode
                    ? 'text-[#D0705B] hover:text-[#E8A398]'
                    : 'text-[#D0705B] hover:text-[#C86B52]'
                }`}
              >
                {isSignUp ? 'Login' : 'Sign Up'}
              </button>
            </div>

            {/* Demo hint */}
            <div className={`mt-6 pt-6 border-t transition-colors duration-500 ${
              isDarkMode ? 'border-[#4A2C24]/50' : 'border-[#E8DCD1]/50'
            }`}>
              <p className={`text-xs text-center mb-2 transition-colors duration-500 ${
                isDarkMode ? 'text-[#8A7E7A]' : 'text-[#A58876]'
              }`}>
                Demo credentials:
              </p>
              <p className={`text-xs text-center transition-colors duration-500 ${
                isDarkMode ? 'text-[#A58876]' : 'text-[#8A7E7A]'
              }`}>
                Email: demo@example.com | Password: password123
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
