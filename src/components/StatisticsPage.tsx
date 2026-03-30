import React from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, Flame, Target, Activity, Briefcase, Users, 
  Brain, Code, Home, ChevronRight, Lightbulb, Bell,
  Dumbbell, Users2, Laptop
} from 'lucide-react';

export const StatisticsPage = ({ isDarkMode }: { isDarkMode: boolean }) => {
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
              <button className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors ${isDarkMode ? 'text-[#A58876] hover:text-[#FDF8F3]' : 'text-[#8A7E7A] hover:text-[#2A2421]'}`}>Daily</button>
              <button className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-[#D0705B] text-white shadow-sm">Weekly</button>
              <button className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors ${isDarkMode ? 'text-[#A58876] hover:text-[#FDF8F3]' : 'text-[#8A7E7A] hover:text-[#2A2421]'}`}>Monthly</button>
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
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className={`p-6 rounded-3xl backdrop-blur-md soft-shadow flex flex-col items-center text-center transition-colors duration-500 ${isDarkMode ? 'bg-[#2A2421]/60 border border-[#4A2C24]/30' : 'bg-[#FAF5F0]/60 border border-[#EADCCF]/20'}`}
          >
            <div className="relative w-20 h-20 mb-4">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <path className={`transition-colors duration-500 ${isDarkMode ? 'text-[#4A2C24]/50' : 'text-[#E8DCD1]'}`} strokeWidth="3" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                <path className="text-[#D0705B]" strokeDasharray="84, 100" strokeWidth="3" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className={`text-xl font-bold transition-colors duration-500 ${isDarkMode ? 'text-[#FDF8F3]' : 'text-[#2A2421]'}`}>84%</span>
              </div>
            </div>
            <h3 className={`text-xs font-bold uppercase tracking-widest mb-1 transition-colors duration-500 ${isDarkMode ? 'text-[#A58876]' : 'text-[#8A7E7A]'}`}>Global Score</h3>
            <p className="text-lg font-bold text-[#D0705B]">+5% <span className={`text-xs font-normal transition-colors duration-500 ${isDarkMode ? 'text-[#A58876]' : 'text-[#8A7E7A]'}`}>vs last week</span></p>
          </motion.div>

          {/* Daily Average */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className={`p-6 rounded-3xl backdrop-blur-md soft-shadow transition-colors duration-500 ${isDarkMode ? 'bg-[#2A2421]/60 border border-[#4A2C24]/30' : 'bg-[#FAF5F0]/60 border border-[#EADCCF]/20'}`}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-xs font-bold uppercase tracking-widest transition-colors duration-500 ${isDarkMode ? 'text-[#A58876]' : 'text-[#8A7E7A]'}`}>Daily Average</h3>
              <Calendar className="w-5 h-5 text-[#D0705B]/40" />
            </div>
            <div className="flex items-baseline gap-2">
              <p className={`text-4xl font-black transition-colors duration-500 ${isDarkMode ? 'text-[#FDF8F3]' : 'text-[#2A2421]'}`}>6.4</p>
              <p className={`text-sm font-medium transition-colors duration-500 ${isDarkMode ? 'text-[#A58876]' : 'text-[#8A7E7A]'}`}>habits / day</p>
            </div>
            <div className={`mt-4 w-full h-1.5 rounded-full overflow-hidden transition-colors duration-500 ${isDarkMode ? 'bg-black/30' : 'bg-white/50'}`}>
              <div className="h-full bg-[#D0705B] w-[78%] rounded-full"></div>
            </div>
            <p className={`text-[11px] mt-2 transition-colors duration-500 ${isDarkMode ? 'text-[#A58876]' : 'text-[#8A7E7A]'}`}>Target: 8.0 habits per day</p>
          </motion.div>

          {/* Active Streak */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className={`p-6 rounded-3xl backdrop-blur-md soft-shadow transition-colors duration-500 ${isDarkMode ? 'bg-[#2A2421]/60 border border-[#4A2C24]/30' : 'bg-[#FAF5F0]/60 border border-[#EADCCF]/20'}`}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-xs font-bold uppercase tracking-widest transition-colors duration-500 ${isDarkMode ? 'text-[#A58876]' : 'text-[#8A7E7A]'}`}>Active Streak</h3>
              <Flame className="w-5 h-5 text-[#D0705B]/40" />
            </div>
            <div className="flex items-baseline gap-2">
              <p className={`text-4xl font-black transition-colors duration-500 ${isDarkMode ? 'text-[#FDF8F3]' : 'text-[#2A2421]'}`}>12</p>
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
            {[
              { icon: <Dumbbell className="w-6 h-6" />, label: 'Health', score: '92%', color: 'text-blue-500', bg: 'bg-blue-500/10' },
              { icon: <Briefcase className="w-6 h-6" />, label: 'Work', score: '78%', color: 'text-orange-500', bg: 'bg-orange-500/10' },
              { icon: <Users2 className="w-6 h-6" />, label: 'Social', score: '64%', color: 'text-pink-500', bg: 'bg-pink-500/10' },
              { icon: <Brain className="w-6 h-6" />, label: 'Mind', score: '88%', color: 'text-purple-500', bg: 'bg-purple-500/10' },
              { icon: <Laptop className="w-6 h-6" />, label: 'Dev', score: '71%', color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
              { icon: <Home className="w-6 h-6" />, label: 'Home', score: '82%', color: 'text-amber-500', bg: 'bg-amber-500/10' },
            ].map((item, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 * i }}
                className={`p-4 rounded-2xl backdrop-blur-md soft-shadow flex flex-col items-center transition-all duration-500 hover:-translate-y-1 ${isDarkMode ? 'bg-[#2A2421]/60 border border-[#4A2C24]/30' : 'bg-[#FAF5F0]/60 border border-[#EADCCF]/20'}`}
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 ${item.bg} ${item.color}`}>
                  {item.icon}
                </div>
                <span className={`text-[10px] font-bold uppercase tracking-tighter transition-colors duration-500 ${isDarkMode ? 'text-[#A58876]' : 'text-[#8A7E7A]'}`}>{item.label}</span>
                <span className={`text-xl font-bold mt-1 transition-colors duration-500 ${isDarkMode ? 'text-[#FDF8F3]' : 'text-[#2A2421]'}`}>{item.score}</span>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Category Performance Bars */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}
            className={`p-8 rounded-3xl backdrop-blur-md soft-shadow transition-colors duration-500 ${isDarkMode ? 'bg-[#2A2421]/60 border border-[#4A2C24]/30' : 'bg-[#FAF5F0]/60 border border-[#EADCCF]/20'}`}
          >
            <h3 className={`text-lg font-bold mb-8 transition-colors duration-500 ${isDarkMode ? 'text-[#FDF8F3]' : 'text-[#2A2421]'}`}>Category Performance</h3>
            <div className="space-y-6">
              {[
                { label: 'Health & Wellness', score: '92%' },
                { label: 'Work & Career', score: '78%' },
                { label: 'Mindfulness', score: '88%' },
                { label: 'Learning & Dev', score: '71%' },
              ].map((item, i) => (
                <div key={i} className="relative pt-1">
                  <div className="flex mb-2 items-center justify-between">
                    <span className={`text-xs font-bold uppercase transition-colors duration-500 ${isDarkMode ? 'text-[#A58876]' : 'text-[#8A7E7A]'}`}>{item.label}</span>
                    <span className="text-xs font-bold text-[#D0705B]">{item.score}</span>
                  </div>
                  <div className={`overflow-hidden h-2 mb-4 text-xs flex rounded-full transition-colors duration-500 ${isDarkMode ? 'bg-black/30' : 'bg-white/50'}`}>
                    <div className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-[#D0705B]" style={{ width: item.score }}></div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Streak Distribution */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}
            className={`p-8 rounded-3xl backdrop-blur-md soft-shadow transition-colors duration-500 ${isDarkMode ? 'bg-[#2A2421]/60 border border-[#4A2C24]/30' : 'bg-[#FAF5F0]/60 border border-[#EADCCF]/20'}`}
          >
            <div className="flex items-center justify-between mb-8">
              <h3 className={`text-lg font-bold transition-colors duration-500 ${isDarkMode ? 'text-[#FDF8F3]' : 'text-[#2A2421]'}`}>Streak Distribution</h3>
              <span className={`text-xs transition-colors duration-500 ${isDarkMode ? 'text-[#A58876]' : 'text-[#8A7E7A]'}`}>Last 3 Months</span>
            </div>
            
            <div className="flex items-end justify-between h-48 px-2 gap-2">
              {[
                { label: '1-3', height: '20%', color: 'bg-[#D0705B]/10 hover:bg-[#D0705B]/30' },
                { label: '4-7', height: '45%', color: 'bg-[#D0705B]/20 hover:bg-[#D0705B]/40' },
                { label: '8-14', height: '85%', color: 'bg-[#D0705B]/60 hover:bg-[#D0705B]/80' },
                { label: '15-30', height: '60%', color: 'bg-[#D0705B]/40 hover:bg-[#D0705B]/60' },
                { label: '30+', height: '100%', color: 'bg-[#D0705B] hover:bg-[#D0705B]/90' },
              ].map((item, i) => (
                <div key={i} className="flex flex-col items-center gap-2 w-full">
                  <div className={`w-full rounded-t-lg transition-colors cursor-pointer ${item.color}`} style={{ height: item.height }}></div>
                  <span className={`text-[10px] font-bold transition-colors duration-500 ${isDarkMode ? 'text-[#A58876]' : 'text-[#8A7E7A]'}`}>{item.label}</span>
                </div>
              ))}
            </div>
            <p className={`text-xs text-center mt-6 italic transition-colors duration-500 ${isDarkMode ? 'text-[#A58876]' : 'text-[#8A7E7A]'}`}>Streak length in days</p>
          </motion.div>
        </div>

        {/* Zen Insights Footer */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
          className={`mt-8 p-8 rounded-3xl border transition-colors duration-500 ${isDarkMode ? 'bg-[#D0705B]/10 border-[#D0705B]/20' : 'bg-[#D0705B]/5 border-[#D0705B]/10'}`}
        >
          <div className="flex items-start gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm transition-colors duration-500 ${isDarkMode ? 'bg-[#2A2421] text-[#D0705B]' : 'bg-white text-[#D0705B]'}`}>
              <Lightbulb className="w-6 h-6" />
            </div>
            <div>
              <h4 className={`text-lg font-bold transition-colors duration-500 ${isDarkMode ? 'text-[#FDF8F3]' : 'text-[#2A2421]'}`}>Zen Insights</h4>
              <p className={`mt-1 leading-relaxed transition-colors duration-500 ${isDarkMode ? 'text-[#A58876]' : 'text-[#8A7E7A]'}`}>
                Your consistency in <strong className="text-[#D0705B]">Health</strong> has improved by 12% since you started the "Morning Yoga" habit. However, <strong className="text-[#D0705B]">Social</strong> habits tend to drop on Tuesdays. Consider setting a light "Call a friend" reminder for mid-week.
              </p>
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
