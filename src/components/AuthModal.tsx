import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, isDarkMode }) => {
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-6"
          onClick={onClose}
        >
          {/* Animated mesh gradient backdrop */}
          <div
            className="absolute inset-0"
            style={{
              background: isDarkMode
                ? 'linear-gradient(-45deg, #1a1210, #2A2421, #4A2C24, #6b3a2e)'
                : 'linear-gradient(-45deg, #f5f5dc, #e9e4d4, #C06C5D, #d6816a)',
              backgroundSize: '400% 400%',
              animation: 'authMeshGradient 15s ease infinite',
            }}
          />
          {/* Dimming overlay */}
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />

          {/* Modal card */}
          <motion.section
            initial={{ opacity: 0, scale: 0.92, y: 30 }}
            animate={{ opacity: 1, scale: 0.98, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 30 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-[480px] max-h-[90vh] overflow-y-auto overflow-x-hidden rounded-3xl shadow-2xl"
            style={{
              background: isDarkMode
                ? 'rgba(42, 36, 33, 0.85)'
                : 'rgba(255, 255, 255, 0.65)',
              backdropFilter: 'blur(32px)',
              WebkitBackdropFilter: 'blur(32px)',
              border: isDarkMode
                ? '1px solid rgba(74, 44, 36, 0.5)'
                : '1px solid rgba(255, 255, 255, 0.4)',
            }}
          >
            {/* Close button */}
            <motion.button
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className={`absolute top-5 right-5 z-20 p-2 rounded-full transition-colors ${
                isDarkMode
                  ? 'text-[#A58876] hover:text-[#FDF8F3] hover:bg-[#4A2C24]/50'
                  : 'text-[#8A7E7A] hover:text-[#2A2421] hover:bg-black/5'
              }`}
            >
              <X className="w-5 h-5" />
            </motion.button>

            <div className="p-8 md:p-10">
              {/* Branding */}
              <div className="flex flex-col items-center mb-10 text-center">
                <div className="inline-flex items-center space-x-2 text-[#C06C5D] mb-4">
                  <Sparkles className="w-8 h-8" />
                  <span className="font-serif italic text-2xl tracking-tight">PureHabit</span>
                </div>
                <h1
                  className={`text-4xl font-serif italic tracking-tight ${
                    isDarkMode ? 'text-[#FDF8F3]' : 'text-[#3a2e2a]'
                  }`}
                >
                  Enter your sanctuary
                </h1>
              </div>

              {/* Auth Tabs */}
              <div className="flex justify-center space-x-12 mb-8">
                <button
                  onClick={() => setActiveTab('signin')}
                  className="group relative pb-2 focus:outline-none"
                >
                  <span
                    className={`text-xl font-serif italic transition-opacity duration-300 ${
                      isDarkMode ? 'text-[#FDF8F3]' : 'text-[#3a2e2a]'
                    } ${activeTab !== 'signin' ? 'opacity-40 hover:opacity-100' : ''}`}
                  >
                    Sign In
                  </span>
                  {activeTab === 'signin' && (
                    <motion.span
                      layoutId="authTabIndicator"
                      className="absolute bottom-0 left-0 w-full h-0.5 bg-[#C06C5D] rounded-full"
                    />
                  )}
                </button>
                <button
                  onClick={() => setActiveTab('signup')}
                  className="group relative pb-2 focus:outline-none"
                >
                  <span
                    className={`text-xl font-serif italic transition-opacity duration-300 ${
                      isDarkMode ? 'text-[#FDF8F3]' : 'text-[#3a2e2a]'
                    } ${activeTab !== 'signup' ? 'opacity-40 hover:opacity-100' : ''}`}
                  >
                    Sign Up
                  </span>
                  {activeTab === 'signup' && (
                    <motion.span
                      layoutId="authTabIndicator"
                      className="absolute bottom-0 left-0 w-full h-0.5 bg-[#C06C5D] rounded-full"
                    />
                  )}
                </button>
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, x: activeTab === 'signin' ? -20 : 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: activeTab === 'signin' ? 20 : -20 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-6"
                >
                  {/* Google Sign-In */}
                  <button
                    className={`w-full flex items-center justify-center space-x-3 py-4 px-6 rounded-full shadow-sm transition-all duration-300 border ${
                      isDarkMode
                        ? 'bg-[#2A2421]/60 border-[#4A2C24]/40 hover:bg-[#3a2e2a]/80 text-[#FDF8F3]'
                        : 'bg-white/50 border-white/40 hover:bg-white/80 text-[#3a2e2a]'
                    }`}
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        fill="#4285F4"
                      />
                      <path
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        fill="#34A853"
                      />
                      <path
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                        fill="#FBBC05"
                      />
                      <path
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        fill="#EA4335"
                      />
                    </svg>
                    <span className="text-sm font-semibold">Continue with Google</span>
                  </button>

                  {/* Divider */}
                  <div className="relative flex py-2 items-center">
                    <div
                      className={`flex-grow border-t ${
                        isDarkMode ? 'border-[#4A2C24]/40' : 'border-[#3a2e2a]/10'
                      }`}
                    />
                    <span
                      className={`flex-shrink mx-4 text-xs uppercase tracking-widest font-medium ${
                        isDarkMode ? 'text-[#A58876]/60' : 'text-[#3a2e2a]/40'
                      }`}
                    >
                      or via email
                    </span>
                    <div
                      className={`flex-grow border-t ${
                        isDarkMode ? 'border-[#4A2C24]/40' : 'border-[#3a2e2a]/10'
                      }`}
                    />
                  </div>

                  {/* Form */}
                  <form
                    className="space-y-5"
                    onSubmit={(e) => {
                      e.preventDefault();
                      // TODO: hook up real auth
                    }}
                  >
                    {/* Name field — Sign Up only */}
                    {activeTab === 'signup' && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-1.5"
                      >
                        <label
                          className={`block text-[10px] uppercase tracking-[0.2em] ml-4 font-medium ${
                            isDarkMode ? 'text-[#A58876]/80' : 'text-[#7c6d66]/80'
                          }`}
                          htmlFor="auth-name"
                        >
                          Full Name
                        </label>
                        <input
                          className={`w-full border-none rounded-full px-6 py-4 focus:ring-2 focus:ring-[#C06C5D]/20 placeholder:opacity-30 shadow-sm transition-all text-sm ${
                            isDarkMode
                              ? 'bg-[#1a1210]/50 text-[#FDF8F3] placeholder:text-[#FDF8F3]'
                              : 'bg-white/40 text-[#3a2e2a] placeholder:text-[#3a2e2a]'
                          }`}
                          id="auth-name"
                          placeholder="Elias Thorne"
                          type="text"
                        />
                      </motion.div>
                    )}

                    <div className="space-y-1.5">
                      <label
                        className={`block text-[10px] uppercase tracking-[0.2em] ml-4 font-medium ${
                          isDarkMode ? 'text-[#A58876]/80' : 'text-[#7c6d66]/80'
                        }`}
                        htmlFor="auth-email"
                      >
                        Email Address
                      </label>
                      <input
                        className={`w-full border-none rounded-full px-6 py-4 focus:ring-2 focus:ring-[#C06C5D]/20 placeholder:opacity-30 shadow-sm transition-all text-sm ${
                          isDarkMode
                            ? 'bg-[#1a1210]/50 text-[#FDF8F3] placeholder:text-[#FDF8F3]'
                            : 'bg-white/40 text-[#3a2e2a] placeholder:text-[#3a2e2a]'
                        }`}
                        id="auth-email"
                        placeholder="elias@purehabit.com"
                        type="email"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center px-4">
                        <label
                          className={`block text-[10px] uppercase tracking-[0.2em] font-medium ${
                            isDarkMode ? 'text-[#A58876]/80' : 'text-[#7c6d66]/80'
                          }`}
                          htmlFor="auth-password"
                        >
                          {activeTab === 'signup' ? 'Master Password' : 'Password'}
                        </label>
                        {activeTab === 'signin' && (
                          <button
                            className="text-[10px] uppercase tracking-widest text-[#C06C5D] hover:underline font-medium"
                            type="button"
                          >
                            Forgot?
                          </button>
                        )}
                      </div>
                      <input
                        className={`w-full border-none rounded-full px-6 py-4 focus:ring-2 focus:ring-[#C06C5D]/20 placeholder:opacity-30 shadow-sm transition-all text-sm ${
                          isDarkMode
                            ? 'bg-[#1a1210]/50 text-[#FDF8F3] placeholder:text-[#FDF8F3]'
                            : 'bg-white/40 text-[#3a2e2a] placeholder:text-[#3a2e2a]'
                        }`}
                        id="auth-password"
                        placeholder="••••••••••••"
                        type="password"
                      />
                    </div>

                    <div className="pt-6">
                      <motion.button
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        className="w-full py-4 bg-[#C06C5D] text-white rounded-full font-bold text-sm tracking-widest uppercase shadow-lg transition-all duration-300"
                        style={{ boxShadow: '0 8px 24px rgba(192, 108, 93, 0.3)' }}
                        type="submit"
                      >
                        {activeTab === 'signup' ? 'Create My Sanctuary' : 'Enter My Sanctuary'}
                      </motion.button>
                    </div>
                  </form>
                </motion.div>
              </AnimatePresence>

              {/* Footer */}
              <footer className="text-center pt-10">
                <p
                  className={`text-[10px] max-w-xs mx-auto leading-relaxed ${
                    isDarkMode ? 'text-[#A58876]/70' : 'text-[#7c6d66]/70'
                  }`}
                >
                  By continuing, you agree to PureHabit's{' '}
                  <a className="underline hover:text-[#C06C5D]" href="#">
                    Terms of Service
                  </a>{' '}
                  and{' '}
                  <a className="underline hover:text-[#C06C5D]" href="#">
                    Mindful Use Policy
                  </a>
                  .
                </p>
              </footer>
            </div>
          </motion.section>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
