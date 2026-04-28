import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ChevronDown } from 'lucide-react';
import { ShaderBackground } from './ShaderBackground';

interface EntryPageProps {
  onGetStarted: () => void;
  isDarkMode: boolean;
}

export function EntryPage({ onGetStarted, isDarkMode }: EntryPageProps) {
  const [scrollPosition, setScrollPosition] = useState(0);

  const features = [
    {
      title: 'Dashboard',
      description: 'Track your daily progress with an intuitive overview. See your habits, progress, and upcoming activities at a glance.',
      items: ['Today\'s Progress', 'Daily Habits', 'Activity Chart', 'Calendar View'],
      color: 'from-[#D0705B] to-[#A58876]'
    },
    {
      title: 'Statistics',
      description: 'Analyze your habit patterns with detailed charts and insights. Understand your progress over time.',
      items: ['Weekly trends', 'Monthly overview', 'Habit performance', 'Achievement badges'],
      color: 'from-[#A58876] to-[#8A7E7A]'
    },
    {
      title: 'Habits Management',
      description: 'Create, edit, and manage all your habits in one place. Set categories and track different types of activities.',
      items: ['Add habits', 'Edit activities', 'Organize by category', 'Set reminders'],
      color: 'from-[#D0705B] to-[#C86B52]'
    },
    {
      title: 'Streak Tracking',
      description: 'Build consistency with streak tracking. Never miss a day and celebrate your achievements.',
      items: ['Daily streaks', 'Longest streaks', 'Achievement milestones', 'Motivation boost'],
      color: 'from-[#E8A398] to-[#D0705B]'
    }
  ];

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollPosition((e.target as HTMLDivElement).scrollLeft);
  };

  return (
    <div className={`min-h-screen w-full relative overflow-hidden transition-colors duration-500 ${isDarkMode ? 'bg-gradient-to-br from-[#1A1817] to-[#2A2421]' : 'bg-gradient-to-br from-[#FEF6F1] to-[#FAF5F0]'}`}>
      {/* Shader Background - Left side */}
      <div className="absolute left-0 top-0 w-1/3 h-full pointer-events-none z-0">
        <ShaderBackground isDarkMode={isDarkMode}>
          <div></div>
        </ShaderBackground>
      </div>

      {/* Shader Background - Right side */}
      <div className="absolute right-0 top-0 w-1/3 h-full pointer-events-none z-0">
        <ShaderBackground isDarkMode={isDarkMode}>
          <div></div>
        </ShaderBackground>
      </div>

      {/* Content */}
      <div className="relative z-10 h-screen flex flex-col">
        {/* Header */}
        <header className="flex justify-between items-center px-8 py-6">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className={`flex items-center gap-2 transition-colors duration-500 ${isDarkMode ? 'text-[#FDF8F3]' : 'text-[#2A2421]'}`}
          >
            <Sparkles className="w-6 h-6" />
            <span className="font-serif text-2xl font-semibold">PureHabit</span>
          </motion.div>

          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onGetStarted}
            className={`px-6 py-2 rounded-full font-medium transition-all duration-300 ${
              isDarkMode
                ? 'bg-[#D0705B] text-white hover:bg-[#C86B52] shadow-lg hover:shadow-xl'
                : 'bg-[#D0705B] text-white hover:bg-[#C86B52] shadow-lg hover:shadow-xl'
            }`}
          >
            Login
          </motion.button>
        </header>

        {/* Main Content - Center */}
        <div className="flex-1 flex items-center justify-center px-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-2xl"
          >
            <h1 className={`font-serif text-6xl font-bold mb-6 transition-colors duration-500 ${
              isDarkMode ? 'text-[#FDF8F3]' : 'text-[#2A2421]'
            }`}>
              Build Better Habits
            </h1>
            <p className={`text-lg mb-8 transition-colors duration-500 ${
              isDarkMode ? 'text-[#A58876]' : 'text-[#8A7E7A]'
            }`}>
              Transform your life with PureHabit. Track daily activities, build streaks, and achieve your goals with our beautiful habit tracking app.
            </p>

            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onGetStarted}
              className="px-8 py-3 rounded-full bg-[#D0705B] text-white font-semibold text-lg hover:bg-[#C86B52] transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              Get Started
            </motion.button>

            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="mt-12"
            >
              <ChevronDown className={`w-6 h-6 mx-auto transition-colors duration-500 ${
                isDarkMode ? 'text-[#A58876]' : 'text-[#8A7E7A]'
              }`} />
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Features Section - Scrollable */}
      <div 
        className={`relative z-10 min-h-screen overflow-x-auto overflow-y-hidden snap-x snap-mandatory transition-colors duration-500 ${
          isDarkMode ? 'bg-[#1A1817]/80' : 'bg-[#FEF6F1]/80'
        }`}
        style={{ backdropFilter: 'blur(8px)' }}
        onScroll={handleScroll}
      >
        <div className="flex w-max">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: 100 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="w-screen h-screen flex items-center justify-center px-8 snap-center"
            >
              <div className="max-w-2xl w-full">
                <div className={`rounded-3xl backdrop-blur-md p-12 soft-shadow transition-colors duration-500 ${
                  isDarkMode ? 'bg-[#2A2421]/70' : 'bg-[#FAF5F0]/70'
                }`}>
                  <motion.div
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    transition={{ duration: 0.4 }}
                    className={`inline-block w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.color} mb-6`}
                  />

                  <h2 className={`font-serif text-4xl font-bold mb-4 transition-colors duration-500 ${
                    isDarkMode ? 'text-[#FDF8F3]' : 'text-[#2A2421]'
                  }`}>
                    {feature.title}
                  </h2>

                  <p className={`text-lg mb-8 transition-colors duration-500 ${
                    isDarkMode ? 'text-[#A58876]' : 'text-[#8A7E7A]'
                  }`}>
                    {feature.description}
                  </p>

                  <div className="grid grid-cols-2 gap-4">
                    {feature.items.map((item, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className={`flex items-center gap-3 p-4 rounded-xl transition-colors duration-500 ${
                          isDarkMode
                            ? 'bg-[#4A2C24]/50 text-[#FDF8F3]'
                            : 'bg-[#E8DCD1]/50 text-[#2A2421]'
                        }`}
                      >
                        <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${feature.color}`} />
                        <span className="font-medium">{item}</span>
                      </motion.div>
                    ))}
                  </div>

                  {/* Preview Image */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className={`mt-8 rounded-2xl p-4 transition-colors duration-500 ${
                      isDarkMode ? 'bg-[#1A1817]/50' : 'bg-white/50'
                    }`}
                  >
                    <div className={`w-full h-48 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center text-white font-semibold`}>
                      {feature.title} Preview
                    </div>
                  </motion.div>

                  {/* Hint for scrolling */}
                  {index < features.length - 1 && (
                    <motion.div
                      animate={{ x: [0, 10, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className={`mt-8 text-center text-sm transition-colors duration-500 ${
                        isDarkMode ? 'text-[#A58876]' : 'text-[#8A7E7A]'
                      }`}
                    >
                      Scroll →
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
