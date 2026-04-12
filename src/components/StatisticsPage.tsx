import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, Flame, Target, Activity, Briefcase, Users, 
  Brain, Code, Home, ChevronRight, Lightbulb, Bell,
  Dumbbell, Users2, Laptop
} from 'lucide-react';

export const StatisticsPage = ({ isDarkMode }: { isDarkMode: boolean }) => {
  const [range, setRange] = useState('Weekly');

  const getStatistics = () => {
    // Mock data for different time ranges
    const stats: Record<string, { 
      score: number; 
      change: number; 
      daily: number; 
      target: number; 
      streak: number; 
      label: string;
      categories: Array<{ label: string; score: number }>;
      habits: Array<{ icon: React.ReactNode; label: string; score: number; color: string; bg: string }>;
      streakDistribution: Array<{ label: string; height: string; color: string }>;
      insight: string;
    }> = {
      Daily: {
        score: 72,
        change: -2,
        daily: 5.2,
        target: 8.0,
        streak: 3,
        label: 'Today',
        categories: [
          { label: 'Health & Wellness', score: 85 },
          { label: 'Work & Career', score: 65 },
          { label: 'Mindfulness', score: 75 },
          { label: 'Learning & Dev', score: 55 },
        ],
        habits: [
          { icon: <Dumbbell className="w-6 h-6" />, label: 'Health', score: 85, color: 'text-blue-500', bg: 'bg-blue-500/10' },
          { icon: <Briefcase className="w-6 h-6" />, label: 'Work', score: 65, color: 'text-orange-500', bg: 'bg-orange-500/10' },
          { icon: <Users2 className="w-6 h-6" />, label: 'Social', score: 45, color: 'text-pink-500', bg: 'bg-pink-500/10' },
          { icon: <Brain className="w-6 h-6" />, label: 'Mind', score: 75, color: 'text-purple-500', bg: 'bg-purple-500/10' },
          { icon: <Laptop className="w-6 h-6" />, label: 'Dev', score: 55, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
          { icon: <Home className="w-6 h-6" />, label: 'Home', score: 70, color: 'text-amber-500', bg: 'bg-amber-500/10' },
        ],
        streakDistribution: [
          { label: '1-3', height: '30%', color: 'bg-[#D0705B]/10 hover:bg-[#D0705B]/30' },
          { label: '4-7', height: '20%', color: 'bg-[#D0705B]/20 hover:bg-[#D0705B]/40' },
          { label: '8-14', height: '15%', color: 'bg-[#D0705B]/60 hover:bg-[#D0705B]/80' },
          { label: '15-30', height: '25%', color: 'bg-[#D0705B]/40 hover:bg-[#D0705B]/60' },
          { label: '30+', height: '40%', color: 'bg-[#D0705B] hover:bg-[#D0705B]/90' },
        ],
        insight: 'Today you completed most of your Health habits. Try to focus on Social activities for better balance.'
      },
      Weekly: {
        score: 84,
        change: 5,
        daily: 6.4,
        target: 8.0,
        streak: 12,
        label: 'This Week',
        categories: [
          { label: 'Health & Wellness', score: 92 },
          { label: 'Work & Career', score: 78 },
          { label: 'Mindfulness', score: 88 },
          { label: 'Learning & Dev', score: 71 },
        ],
        habits: [
          { icon: <Dumbbell className="w-6 h-6" />, label: 'Health', score: 92, color: 'text-blue-500', bg: 'bg-blue-500/10' },
          { icon: <Briefcase className="w-6 h-6" />, label: 'Work', score: 78, color: 'text-orange-500', bg: 'bg-orange-500/10' },
          { icon: <Users2 className="w-6 h-6" />, label: 'Social', score: 64, color: 'text-pink-500', bg: 'bg-pink-500/10' },
          { icon: <Brain className="w-6 h-6" />, label: 'Mind', score: 88, color: 'text-purple-500', bg: 'bg-purple-500/10' },
          { icon: <Laptop className="w-6 h-6" />, label: 'Dev', score: 71, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
          { icon: <Home className="w-6 h-6" />, label: 'Home', score: 82, color: 'text-amber-500', bg: 'bg-amber-500/10' },
        ],
        streakDistribution: [
          { label: '1-3', height: '20%', color: 'bg-[#D0705B]/10 hover:bg-[#D0705B]/30' },
          { label: '4-7', height: '45%', color: 'bg-[#D0705B]/20 hover:bg-[#D0705B]/40' },
          { label: '8-14', height: '85%', color: 'bg-[#D0705B]/60 hover:bg-[#D0705B]/80' },
          { label: '15-30', height: '60%', color: 'bg-[#D0705B]/40 hover:bg-[#D0705B]/60' },
          { label: '30+', height: '100%', color: 'bg-[#D0705B] hover:bg-[#D0705B]/90' },
        ],
        insight: 'Your consistency in Health has improved by 12% since you started the "Morning Yoga" habit. Consider setting a light "Call a friend" reminder for mid-week.'
      },
      Monthly: {
        score: 78,
        change: 8,
        daily: 5.8,
        target: 8.0,
        streak: 28,
        label: 'This Month',
        categories: [
          { label: 'Health & Wellness', score: 89 },
          { label: 'Work & Career', score: 82 },
          { label: 'Mindfulness', score: 85 },
          { label: 'Learning & Dev', score: 68 },
        ],
        habits: [
          { icon: <Dumbbell className="w-6 h-6" />, label: 'Health', score: 89, color: 'text-blue-500', bg: 'bg-blue-500/10' },
          { icon: <Briefcase className="w-6 h-6" />, label: 'Work', score: 82, color: 'text-orange-500', bg: 'bg-orange-500/10' },
          { icon: <Users2 className="w-6 h-6" />, label: 'Social', score: 72, color: 'text-pink-500', bg: 'bg-pink-500/10' },
          { icon: <Brain className="w-6 h-6" />, label: 'Mind', score: 85, color: 'text-purple-500', bg: 'bg-purple-500/10' },
          { icon: <Laptop className="w-6 h-6" />, label: 'Dev', score: 68, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
          { icon: <Home className="w-6 h-6" />, label: 'Home', score: 79, color: 'text-amber-500', bg: 'bg-amber-500/10' },
        ],
        streakDistribution: [
          { label: '1-3', height: '15%', color: 'bg-[#D0705B]/10 hover:bg-[#D0705B]/30' },
          { label: '4-7', height: '35%', color: 'bg-[#D0705B]/20 hover:bg-[#D0705B]/40' },
          { label: '8-14', height: '75%', color: 'bg-[#D0705B]/60 hover:bg-[#D0705B]/80' },
          { label: '15-30', height: '92%', color: 'bg-[#D0705B]/40 hover:bg-[#D0705B]/60' },
          { label: '30+', height: '88%', color: 'bg-[#D0705B] hover:bg-[#D0705B]/90' },
        ],
        insight: 'Great month! Your overall consistency has grown to 78%. The "Learning & Dev" category needs more attention - try adding a daily coding session.'
      }
    };
    return stats[range];
  };

  const stats = getStatistics();
  return (
    <main className="flex-1 p-8 overflow-y-auto z-10">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <header className="flex justify-between items-end mb-10">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className={`font-serif text-4xl font-medium mb-2 transition-colors duration-500 ${isDarkMode ? 'text-[#FDF8F3]' : 'text-[#2A2421]'}`}>Category Performance</h1>
            <p className={`text-sm max-w-md transition-colors duration-500 ${isDarkMode ? 'text-[#A58876]' : 'text-[#8A7E7A]'}`}>
              A minimal overview of your habit areas and consistency.
            </p>
          </motion.div>
          <div className="flex items-center gap-6">
            <div className={`flex items-center p-1 rounded-xl backdrop-blur-md soft-shadow transition-colors duration-500 ${isDarkMode ? 'bg-[#2A2421]/60' : 'bg-[#FAF5F0]/60'}`}>
              {['Daily', 'Weekly', 'Monthly'].map((timeRange) => (
                <motion.button
                  key={timeRange}
                  onClick={() => setRange(timeRange)}
                  whileTap={{ scale: 0.95 }}
                  className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    range === timeRange
                      ? 'bg-[#D0705B] text-white shadow-sm'
                      : isDarkMode
                      ? 'text-[#A58876] hover:text-[#FDF8F3]'
                      : 'text-[#8A7E7A] hover:text-[#2A2421]'
                  }`}
                >
                  {timeRange}
                </motion.button>
              ))}
            </div>
            
            {/* Profile Section */}
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className={`text-sm font-bold transition-colors duration-500 ${isDarkMode ? 'text-[#FDF8F3]' : 'text-[#2A2421]'}`}>Alex Morgan</p>
                <p className={`text-[10px] font-bold uppercase tracking-widest transition-colors duration-500 ${isDarkMode ? 'text-[#A58876]' : 'text-[#8A7E7A]'}`}>Free Plan</p>
              </div>
              <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-[#D0705B]">
                <img 
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80" 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <button className={`p-2 rounded-xl backdrop-blur-md soft-shadow transition-colors duration-500 ${isDarkMode ? 'bg-[#2A2421]/60 text-[#A58876] hover:text-[#FDF8F3]' : 'bg-[#FAF5F0]/60 text-[#8A7E7A] hover:text-[#2A2421]'}`}>
                <Bell className="w-4 h-4" />
              </button>
            </div>
          </div>
        </header>

        {/* Top Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Global Score */}
          <motion.div 
            key={`score-${range}`}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className={`p-6 rounded-3xl backdrop-blur-md soft-shadow flex flex-col items-center text-center transition-colors duration-500 ${isDarkMode ? 'bg-[#2A2421]/60 border border-[#4A2C24]/30' : 'bg-[#FAF5F0]/60 border border-[#EADCCF]/20'}`}
          >
            <div className="relative w-20 h-20 mb-4">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <path className={`transition-colors duration-500 ${isDarkMode ? 'text-[#4A2C24]/50' : 'text-[#E8DCD1]'}`} strokeWidth="3" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                <path className="text-[#D0705B]" strokeDasharray={`${stats.score}, 100`} strokeWidth="3" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.span
                  key={`score-value-${range}`}
                  initial={{ scale: 0.5 }}
                  animate={{ scale: 1 }}
                  className={`text-xl font-bold transition-colors duration-500 ${isDarkMode ? 'text-[#FDF8F3]' : 'text-[#2A2421]'}`}
                >
                  {stats.score}%
                </motion.span>
              </div>
            </div>
            <h3 className={`text-xs font-bold uppercase tracking-widest mb-1 transition-colors duration-500 ${isDarkMode ? 'text-[#A58876]' : 'text-[#8A7E7A]'}`}>Global Score</h3>
            <motion.p
              key={`score-change-${range}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-lg font-bold text-[#D0705B]"
            >
              {stats.change > 0 ? '+' : ''}{stats.change}% <span className={`text-xs font-normal transition-colors duration-500 ${isDarkMode ? 'text-[#A58876]' : 'text-[#8A7E7A]'}`}>vs last {range.toLowerCase()}</span>
            </motion.p>
          </motion.div>

          {/* Daily Average */}
          <motion.div 
            key={`daily-${range}`}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className={`p-6 rounded-3xl backdrop-blur-md soft-shadow transition-colors duration-500 ${isDarkMode ? 'bg-[#2A2421]/60 border border-[#4A2C24]/30' : 'bg-[#FAF5F0]/60 border border-[#EADCCF]/20'}`}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-xs font-bold uppercase tracking-widest transition-colors duration-500 ${isDarkMode ? 'text-[#A58876]' : 'text-[#8A7E7A]'}`}>Daily Average</h3>
              <Calendar className="w-5 h-5 text-[#D0705B]/40" />
            </div>
            <div className="flex items-baseline gap-2">
              <motion.p
                key={`daily-value-${range}`}
                initial={{ scale: 0.5 }}
                animate={{ scale: 1 }}
                className={`text-4xl font-black transition-colors duration-500 ${isDarkMode ? 'text-[#FDF8F3]' : 'text-[#2A2421]'}`}
              >
                {stats.daily.toFixed(1)}
              </motion.p>
              <p className={`text-sm font-medium transition-colors duration-500 ${isDarkMode ? 'text-[#A58876]' : 'text-[#8A7E7A]'}`}>habits / day</p>
            </div>
            <div className={`mt-4 w-full h-1.5 rounded-full overflow-hidden transition-colors duration-500 ${isDarkMode ? 'bg-black/30' : 'bg-white/50'}`}>
              <motion.div
                key={`daily-progress-${range}`}
                initial={{ width: 0 }}
                animate={{ width: `${(stats.daily / stats.target) * 100}%` }}
                className="h-full bg-[#D0705B] rounded-full"
              />
            </div>
            <p className={`text-[11px] mt-2 transition-colors duration-500 ${isDarkMode ? 'text-[#A58876]' : 'text-[#8A7E7A]'}`}>Target: {stats.target.toFixed(1)} habits per day</p>
          </motion.div>

          {/* Active Streak */}
          <motion.div 
            key={`streak-${range}`}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className={`p-6 rounded-3xl backdrop-blur-md soft-shadow transition-colors duration-500 ${isDarkMode ? 'bg-[#2A2421]/60 border border-[#4A2C24]/30' : 'bg-[#FAF5F0]/60 border border-[#EADCCF]/20'}`}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-xs font-bold uppercase tracking-widest transition-colors duration-500 ${isDarkMode ? 'text-[#A58876]' : 'text-[#8A7E7A]'}`}>Active Streak</h3>
              <Flame className="w-5 h-5 text-[#D0705B]/40" />
            </div>
            <div className="flex items-baseline gap-2">
              <motion.p
                key={`streak-value-${range}`}
                initial={{ scale: 0.5 }}
                animate={{ scale: 1 }}
                className={`text-4xl font-black transition-colors duration-500 ${isDarkMode ? 'text-[#FDF8F3]' : 'text-[#2A2421]'}`}
              >
                {stats.streak}
              </motion.p>
              <p className={`text-sm font-medium transition-colors duration-500 ${isDarkMode ? 'text-[#A58876]' : 'text-[#8A7E7A]'}`}>days solid</p>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${isDarkMode ? 'border-[#2A2421] bg-[#4A2C24]' : 'border-[#FAF5F0] bg-[#EADCCF]'}`}>
                    <Flame className="w-3 h-3 text-[#D0705B]" />
                  </div>
                ))}
              </div>
              <p className={`text-[11px] font-medium transition-colors duration-500 ${isDarkMode ? 'text-[#A58876]' : 'text-[#8A7E7A]'}`}>New personal record!</p>
            </div>
          </motion.div>
        </div>

        {/* Habit Area Breakdown */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h3 className={`text-xl font-bold transition-colors duration-500 ${isDarkMode ? 'text-[#FDF8F3]' : 'text-[#2A2421]'}`}>Habit Area Breakdown</h3>
            <button className="text-[#D0705B] text-sm font-semibold flex items-center gap-1 hover:underline">
              Details <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
            {stats.habits.map((item, i) => (
              <motion.div 
                key={`${range}-habit-${i}`}
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 * i }}
                className={`p-4 rounded-2xl backdrop-blur-md soft-shadow flex flex-col items-center transition-all duration-500 hover:-translate-y-1 ${isDarkMode ? 'bg-[#2A2421]/60 border border-[#4A2C24]/30' : 'bg-[#FAF5F0]/60 border border-[#EADCCF]/20'}`}
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 ${item.bg} ${item.color}`}>
                  {item.icon}
                </div>
                <span className={`text-[10px] font-bold uppercase tracking-tighter transition-colors duration-500 ${isDarkMode ? 'text-[#A58876]' : 'text-[#8A7E7A]'}`}>{item.label}</span>
                <motion.span
                  key={`${range}-habit-score-${i}`}
                  initial={{ scale: 0.5 }}
                  animate={{ scale: 1 }}
                  className={`text-xl font-bold mt-1 transition-colors duration-500 ${isDarkMode ? 'text-[#FDF8F3]' : 'text-[#2A2421]'}`}
                >
                  {item.score}%
                </motion.span>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Category Performance Bars */}
          <motion.div 
            key={`performance-${range}`}
            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}
            className={`p-8 rounded-3xl backdrop-blur-md soft-shadow transition-colors duration-500 ${isDarkMode ? 'bg-[#2A2421]/60 border border-[#4A2C24]/30' : 'bg-[#FAF5F0]/60 border border-[#EADCCF]/20'}`}
          >
            <h3 className={`text-lg font-bold mb-8 transition-colors duration-500 ${isDarkMode ? 'text-[#FDF8F3]' : 'text-[#2A2421]'}`}>Category Performance</h3>
            <div className="space-y-6">
              {stats.categories.map((item, i) => (
                <div key={`${range}-category-${i}`} className="relative pt-1">
                  <div className="flex mb-2 items-center justify-between">
                    <span className={`text-xs font-bold uppercase transition-colors duration-500 ${isDarkMode ? 'text-[#A58876]' : 'text-[#8A7E7A]'}`}>{item.label}</span>
                    <motion.span
                      key={`${range}-category-score-${i}`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-xs font-bold text-[#D0705B]"
                    >
                      {item.score}%
                    </motion.span>
                  </div>
                  <div className={`overflow-hidden h-2 mb-4 text-xs flex rounded-full transition-colors duration-500 ${isDarkMode ? 'bg-black/30' : 'bg-white/50'}`}>
                    <motion.div
                      key={`${range}-category-bar-${i}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${item.score}%` }}
                      className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-[#D0705B] rounded-full"
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Streak Distribution */}
          <motion.div 
            key={`distribution-${range}`}
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}
            className={`p-8 rounded-3xl backdrop-blur-md soft-shadow transition-colors duration-500 ${isDarkMode ? 'bg-[#2A2421]/60 border border-[#4A2C24]/30' : 'bg-[#FAF5F0]/60 border border-[#EADCCF]/20'}`}
          >
            <div className="flex items-center justify-between mb-8">
              <h3 className={`text-lg font-bold transition-colors duration-500 ${isDarkMode ? 'text-[#FDF8F3]' : 'text-[#2A2421]'}`}>Streak Distribution</h3>
              <span className={`text-xs transition-colors duration-500 ${isDarkMode ? 'text-[#A58876]' : 'text-[#8A7E7A]'}`}>Last 3 Months</span>
            </div>
            
            <div className="flex items-end justify-between h-56 px-2 gap-3 mb-6">
              {stats.streakDistribution.map((item, i) => (
                <motion.div
                  key={`${range}-distribution-${i}`}
                  className="flex flex-col items-center gap-3 w-full group"
                  whileHover={{ scale: 1.05 }}
                >
                  {/* Count badge */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 + i * 0.05 }}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition-all opacity-0 group-hover:opacity-100 ${
                      isDarkMode ? 'bg-[#D0705B]/20 text-[#D0705B]' : 'bg-[#D0705B]/10 text-[#D0705B]'
                    }`}
                  >
                    {[12, 24, 38, 18, 44][i]} habits
                  </motion.div>

                  {/* Bar container */}
                  <div className="relative w-full h-full flex items-end justify-center">
                    {/* Background bar */}
                    <div className={`absolute inset-0 rounded-t-2xl transition-colors duration-300 ${
                      isDarkMode ? 'bg-[#4A2C24]/30' : 'bg-[#E8DCD1]/30'
                    }`} />
                    
                    {/* Animated bar */}
                    <motion.div
                      key={`${range}-distribution-bar-${i}`}
                      initial={{ height: 0 }}
                      animate={{ height: item.height }}
                      transition={{ duration: 0.6, ease: 'easeOut', delay: 0.1 * i }}
                      className={`relative w-full rounded-t-2xl shadow-lg transition-all duration-300 group-hover:shadow-xl origin-bottom ${item.color}`}
                    >
                      {/* Shine effect on hover */}
                      <motion.div
                        initial={{ opacity: 0 }}
                        whileHover={{ opacity: 0.3 }}
                        className="absolute inset-0 rounded-t-2xl bg-gradient-to-b from-white to-transparent"
                      />
                    </motion.div>

                    {/* Label */}
                    <span className={`absolute -bottom-8 text-[11px] font-bold transition-colors duration-500 ${
                      isDarkMode ? 'text-[#A58876]' : 'text-[#8A7E7A]'
                    }`}>
                      {item.label}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Stats legend */}
            <div className="mt-16 grid grid-cols-5 gap-2 pt-6 border-t border-[#D0705B]/20">
              {[
                { range: '1-3 days', count: '12%', desc: 'Just starting' },
                { range: '4-7 days', count: '24%', desc: 'Building' },
                { range: '8-14 days', count: '38%', desc: 'Consistent' },
                { range: '15-30 days', count: '18%', desc: 'Strong' },
                { range: '30+ days', count: '44%', desc: 'Master' },
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + i * 0.05 }}
                  className={`text-center p-3 rounded-lg transition-colors ${
                    isDarkMode ? 'hover:bg-[#4A2C24]/30' : 'hover:bg-[#E8DCD1]/30'
                  }`}
                >
                  <p className={`text-[10px] font-bold uppercase transition-colors ${
                    isDarkMode ? 'text-[#A58876]' : 'text-[#8A7E7A]'
                  }`}>
                    {stat.desc}
                  </p>
                  <p className={`text-lg font-black my-1 transition-colors ${
                    isDarkMode ? 'text-[#D0705B]' : 'text-[#D0705B]'
                  }`}>
                    {stat.count}
                  </p>
                  <p className={`text-[9px] transition-colors ${
                    isDarkMode ? 'text-[#A58876]' : 'text-[#8A7E7A]'
                  }`}>
                    {stat.range}
                  </p>
                </motion.div>
              ))}
            </div>

            <p className={`text-xs text-center mt-6 italic transition-colors duration-500 ${isDarkMode ? 'text-[#A58876]' : 'text-[#8A7E7A]'}`}>💡 More habits are reaching 30+ day streaks, showing improved consistency!</p>
          </motion.div>
        </div>

        {/* Zen Insights Footer */}
        <motion.section 
          key={`insights-${range}`}
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
          className={`mt-8 p-8 rounded-3xl border transition-colors duration-500 ${isDarkMode ? 'bg-[#D0705B]/10 border-[#D0705B]/20' : 'bg-[#D0705B]/5 border-[#D0705B]/10'}`}
        >
          <div className="flex items-start gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm transition-colors duration-500 ${isDarkMode ? 'bg-[#2A2421] text-[#D0705B]' : 'bg-white text-[#D0705B]'}`}>
              <Lightbulb className="w-6 h-6" />
            </div>
            <div>
              <h4 className={`text-lg font-bold transition-colors duration-500 ${isDarkMode ? 'text-[#FDF8F3]' : 'text-[#2A2421]'}`}>Zen Insights</h4>
              <motion.p
                key={`insight-text-${range}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`mt-1 leading-relaxed transition-colors duration-500 ${isDarkMode ? 'text-[#A58876]' : 'text-[#8A7E7A]'}`}
              >
                {stats.insight}
              </motion.p>
              <button className={`mt-4 px-4 py-2 rounded-xl text-xs font-bold border shadow-sm hover:shadow-md transition-all duration-300 ${isDarkMode ? 'bg-[#2A2421] text-[#D0705B] border-[#D0705B]/20' : 'bg-white text-[#D0705B] border-[#D0705B]/10'}`}>
                Enable Smart Reminders
              </button>
            </div>
          </div>
        </motion.section>

      </div>
    </main>
  );
};
