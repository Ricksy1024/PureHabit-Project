import React, { useState } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { format, addDays, startOfWeek, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval, subMonths, addMonths, subWeeks, addWeeks } from 'date-fns';
import confetti from 'canvas-confetti';
import { 
  Sparkles, LayoutDashboard, BarChart2, CheckSquare, Folder, Flame, 
  Check, Wind, Droplet, BookOpen, ChevronLeft, ChevronRight, GripVertical, LogIn, LogOut, ShieldAlert
} from 'lucide-react';
import { ThemeToggle } from './components/ThemeToggle';
import { ShaderBackground } from './components/ShaderBackground';
import { StatisticsPage } from './components/StatisticsPage';
import { AuthModal } from './components/AuthModal';
import { useAuth } from './hooks/useAuth';
import type { AuthState } from './types/auth';
import { AUTH_COPY, VERIFICATION_STEP_COPY } from './constants/authCopy';

const Sidebar = ({ isDarkMode, setIsDarkMode, activeTab, setActiveTab, onOpenAuthModal, onAuthAction, isAuthenticated }: { isDarkMode: boolean, setIsDarkMode: (v: boolean) => void, activeTab: string, setActiveTab: (t: string) => void, onOpenAuthModal: () => void, onAuthAction: () => void, isAuthenticated: boolean }) => (
  <aside className={`w-64 h-screen flex flex-col px-6 py-8 backdrop-blur-sm border-r transition-colors duration-500 ${isDarkMode ? 'bg-black/20 border-[#4A2C24]/30' : 'bg-white/10 border-[#EADCCF]/20'}`}>
    <div className={`flex items-center gap-2 mb-12 px-2 transition-colors duration-500 ${isDarkMode ? 'text-[#FDF8F3]' : 'text-[#2A2421]'}`}>
      <Sparkles className="w-6 h-6" />
      <span className="font-serif text-2xl font-semibold">PureHabit</span>
    </div>

    <nav className="flex-1 space-y-1">
      <NavItem icon={<LayoutDashboard />} label="Dashboard" active={activeTab === 'Dashboard'} onClick={isAuthenticated ? () => setActiveTab('Dashboard') : onOpenAuthModal} isDarkMode={isDarkMode} />
      <NavItem icon={<BarChart2 />} label="Statistics" active={activeTab === 'Statistics'} onClick={isAuthenticated ? () => setActiveTab('Statistics') : onOpenAuthModal} isDarkMode={isDarkMode} />
      <NavItem icon={<CheckSquare />} label="Habits" isDarkMode={isDarkMode} />
      <NavItem icon={<Folder />} label="Categories" isDarkMode={isDarkMode} />
      <NavItem icon={<Flame />} label="Streak" isDarkMode={isDarkMode} />
    </nav>

    <div className="mt-auto space-y-8 px-2">
      <div className="flex items-center">
        <ThemeToggle isDark={isDarkMode} setIsDark={setIsDarkMode} />
      </div>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        onClick={onAuthAction}
        className={`flex items-center gap-3 w-full p-3 -mx-2 rounded-2xl transition-all duration-500 cursor-pointer group ${
          isDarkMode
            ? 'bg-[#D0705B]/15 border border-[#D0705B]/30 hover:bg-[#D0705B]/25 shadow-lg'
            : 'bg-[#D0705B]/10 border border-[#D0705B]/20 hover:bg-[#D0705B]/20'
        }`}
      >
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
          isDarkMode ? 'bg-[#D0705B]/20' : 'bg-[#D0705B]/15'
        }`}>
          {isAuthenticated ? (
            <LogOut className="w-5 h-5 text-[#D0705B]" />
          ) : (
            <LogIn className="w-5 h-5 text-[#D0705B]" />
          )}
        </div>
        <div className="flex-1 text-left">
          <p className={`text-sm font-bold transition-colors duration-500 ${isDarkMode ? 'text-[#FDF8F3]' : 'text-[#2A2421]'}`}>{isAuthenticated ? 'Sign Out' : 'Sign In'}</p>
          <p className={`text-[11px] transition-colors duration-500 ${isDarkMode ? 'text-[#A58876]' : 'text-[#8A7E7A]'}`}>{isAuthenticated ? 'End current session' : 'Login or Register'}</p>
        </div>
        <ChevronRight className={`w-4 h-4 transition-all duration-300 group-hover:translate-x-0.5 ${isDarkMode ? 'text-[#A58876]' : 'text-[#8A7E7A]'}`} />
      </motion.button>
    </div>
  </aside>
);

const NavItem = ({ icon, label, active = false, onClick, isDarkMode }: { icon: React.ReactElement, label: string, active?: boolean, onClick?: () => void, isDarkMode: boolean }) => (
  <a href="#" onClick={(e) => { e.preventDefault(); if (onClick) onClick(); }} className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-colors relative ${active ? (isDarkMode ? 'text-[#FDF8F3] font-medium' : 'text-[#2A2421] font-medium') : (isDarkMode ? 'text-[#A58876] hover:bg-[#4A2C24]/30 hover:text-[#FDF8F3]' : 'text-[#2A2421] hover:bg-[#E8DCD1]/30')}`}>
    {active && (
      <motion.div layoutId="activeNav" className={`absolute inset-0 rounded-2xl -z-10 transition-colors duration-500 ${isDarkMode ? 'bg-[#4A2C24]/60' : 'bg-[#E8DCD1]/60'}`} />
    )}
    {React.cloneElement(icon, { className: 'w-5 h-5' })}
    <span className="text-sm">{label}</span>
  </a>
);

const Header = ({ range, setRange, currentDate, isDarkMode, userDisplayName }: { range: string, setRange: (r: string) => void, currentDate: Date, isDarkMode: boolean, userDisplayName: string }) => (
  <div className="flex justify-between items-end">
    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
      <h1 className={`font-serif text-4xl font-medium mb-1 transition-colors duration-500 ${isDarkMode ? 'text-[#FDF8F3]' : 'text-[#2A2421]'}`}>Good Morning, {userDisplayName}</h1>
      <p className={`text-sm transition-colors duration-500 ${isDarkMode ? 'text-[#A58876]' : 'text-[#2A2421]'}`}>{format(currentDate, 'EEEE, MMMM d, yyyy')}</p>
    </motion.div>
    <div className={`flex backdrop-blur-md rounded-full p-1 soft-shadow relative transition-colors duration-500 ${isDarkMode ? 'bg-[#2A2421]/60' : 'bg-[#FAF5F0]/60'}`}>
      {['Today', 'Weekly', 'Month'].map((r) => (
        <button
          key={r}
          onClick={() => setRange(r)}
          className={`relative px-5 py-1.5 rounded-full text-sm font-medium transition-colors z-10 ${range === r ? 'text-white' : (isDarkMode ? 'text-[#A58876] hover:bg-[#4A2C24]/50 hover:text-[#FDF8F3]' : 'text-[#2A2421] hover:bg-[#E8DCD1]/50')}`}
        >
          {range === r && (
            <motion.div
              layoutId="activeRange"
              className="absolute inset-0 bg-[#D0705B] rounded-full -z-10"
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
          )}
          {r}
        </button>
      ))}
    </div>
  </div>
);

const ProgressSection = ({ progress, isDarkMode }: { progress: number, isDarkMode: boolean }) => (
  <div className="flex items-center gap-4 mb-8">
    <span className={`text-sm font-medium whitespace-nowrap transition-colors duration-500 ${isDarkMode ? 'text-[#FDF8F3]' : 'text-[#2A2421]'}`}>Today's Progress</span>
    <div className={`flex-1 h-5 backdrop-blur-sm rounded-full overflow-hidden inner-shadow relative transition-colors duration-500 ${isDarkMode ? 'bg-black/30' : 'bg-white/50'}`}>
      <motion.div 
        className="absolute top-0 left-0 h-full bg-[#D0705B] rounded-full flex items-center justify-center min-w-10"
        initial={{ width: 0 }}
        animate={{ width: `${progress}%` }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <span className="text-white text-[10px] font-medium">{progress}%</span>
      </motion.div>
    </div>
  </div>
);

const CalendarStrip = ({ selectedDate, setSelectedDate, range, getDayProgress, viewDate, setViewDate, isDarkMode }: { selectedDate: Date, setSelectedDate: (d: Date) => void, range: string, getDayProgress: (d: Date) => number, viewDate: Date, setViewDate: (d: Date) => void, isDarkMode: boolean }) => {
  let days: Date[] = [];
  if (range === 'Month') {
    const monthStart = startOfMonth(viewDate);
    const monthEnd = endOfMonth(viewDate);
    days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  } else {
    const weekStart = startOfWeek(viewDate, { weekStartsOn: 1 });
    days = Array.from({ length: 7 }).map((_, i) => addDays(weekStart, i));
  }

  return (
    <div className="flex flex-col w-full mt-4">
      <AnimatePresence mode="wait">
        {(range === 'Month' || range === 'Weekly') && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex justify-between items-center w-full mb-6 px-4"
          >
            <motion.button
              whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
              onClick={() => setViewDate(range === 'Month' ? subMonths(viewDate, 1) : subWeeks(viewDate, 1))}
              className={`p-2 rounded-full transition-colors ${isDarkMode ? 'hover:bg-[#4A2C24]/50' : 'hover:bg-[#E8DCD1]/50'}`}
            >
              <ChevronLeft className={`w-5 h-5 ${isDarkMode ? 'text-[#FDF8F3]' : 'text-[#2A2421]'}`} />
            </motion.button>
            <span className={`font-serif text-lg font-medium ${isDarkMode ? 'text-[#FDF8F3]' : 'text-[#2A2421]'}`}>
              {range === 'Month' ? format(viewDate, 'MMMM yyyy') : `Week of ${format(startOfWeek(viewDate, { weekStartsOn: 1 }), 'MMM d')}`}
            </span>
            <motion.button
              whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
              onClick={() => setViewDate(range === 'Month' ? addMonths(viewDate, 1) : addWeeks(viewDate, 1))}
              className={`p-2 rounded-full transition-colors ${isDarkMode ? 'hover:bg-[#4A2C24]/50' : 'hover:bg-[#E8DCD1]/50'}`}
            >
              <ChevronRight className={`w-5 h-5 ${isDarkMode ? 'text-[#FDF8F3]' : 'text-[#2A2421]'}`} />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className={`flex ${range === 'Month' ? 'flex-wrap gap-y-6' : ''} justify-between items-center px-2`}>
        {days.map((d, i) => {
          const isActive = isSameDay(d, selectedDate);
          const progress = getDayProgress(d);
          return (
            <div key={i} className={`flex flex-col items-center gap-3 cursor-pointer group ${range === 'Month' ? 'w-[14.28%]' : ''}`} onClick={() => setSelectedDate(d)}>
              <span className={`text-[10px] font-bold tracking-widest transition-colors ${isActive ? 'text-[#D0705B]' : (isDarkMode ? 'text-[#A58876] group-hover:text-[#D0705B]/70' : 'text-[#2A2421] group-hover:text-[#D0705B]/70')}`}>{format(d, 'EEE').toUpperCase()}</span>
              <div className="relative">
                <svg className="absolute -inset-1 w-12 h-12 -rotate-90 pointer-events-none overflow-visible" viewBox="0 0 36 36">
                  <path className={`transition-colors duration-500 ${isDarkMode ? 'text-[#4A2C24]/50' : 'text-[#E8DCD1]/50'}`} strokeWidth="2" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  <path className="text-[#D0705B] transition-all duration-500" strokeDasharray={`${progress}, 100`} strokeWidth="2" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                </svg>
                <div className={`relative w-10 h-10 rounded-full flex items-center justify-center text-base ${isActive ? (isDarkMode ? 'text-[#FDF8F3] font-bold' : 'text-white font-bold') : (isDarkMode ? 'text-[#FDF8F3] font-medium group-hover:bg-white/10' : 'text-[#2A2421] font-medium group-hover:bg-white/30')}`}>
                  {isActive && (
                    <motion.div
                      layoutId="activeCalendarDay"
                      className={`absolute inset-0 rounded-full ${isDarkMode ? 'bg-[#D0705B]/30 shadow-[0_0_15px_rgba(208,112,91,0.2)]' : 'bg-[#D0705B] shadow-[0_4px_12px_rgba(208,112,91,0.4)]'}`}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10">{format(d, 'd')}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

interface Habit {
  id: number;
  title: string;
  streak: string;
  metric: string;
  icon: React.ReactNode;
  done: boolean;
  bg: string;
}

const HabitsList = ({ habits, toggleHabit, onReorder, isDarkMode }: { habits: Habit[], toggleHabit: (id: number) => void, onReorder: (newOrder: Habit[]) => void, isDarkMode: boolean }) => {
  const handleToggle = (id: number, e: React.MouseEvent) => {
    const habit = habits.find(h => h.id === id);
    if (!habit?.done) {
      const rect = (e.target as HTMLElement).getBoundingClientRect();
      const x = (rect.left + rect.width / 2) / window.innerWidth;
      const y = (rect.top + rect.height / 2) / window.innerHeight;
      
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { x, y },
        colors: ['#D0705B', '#A58876', '#EADCCF', '#FDF8F3'],
        disableForReducedMotion: true
      });
    }
    toggleHabit(id);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4 px-2">
        <h2 className={`font-serif text-2xl transition-colors duration-500 ${isDarkMode ? 'text-[#FDF8F3]' : 'text-[#2A2421]'}`}>Daily Habits</h2>
        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${isDarkMode ? 'bg-[#D0705B]/20 text-[#D0705B] hover:bg-[#D0705B]/30' : 'bg-[#D0705B]/10 text-[#D0705B] hover:bg-[#D0705B]/20'}`}>Add New</motion.button>
      </div>
      <Reorder.Group axis="y" values={habits} onReorder={onReorder} className="space-y-4">
        <AnimatePresence>
          {habits.map(habit => (
            <Reorder.Item
              key={habit.id}
              value={habit}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className={`backdrop-blur-md rounded-3xl p-4 flex items-center gap-4 soft-shadow cursor-default transition-colors duration-500 ${isDarkMode ? 'bg-[#2A2421]/70' : 'bg-[#FAF5F0]/70'}`}
            >
              <div className={`cursor-grab active:cursor-grabbing p-1 transition-colors ${isDarkMode ? 'text-[#A58876]/40 hover:text-[#FDF8F3]' : 'text-[#8A7E7A]/40 hover:text-[#2A2421]'}`}>
                <GripVertical className="w-5 h-5" />
              </div>
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${isDarkMode ? habit.bg.replace('bg-[#FDECE8]', 'bg-[#4A2C24]').replace('bg-[#F2E8E3]', 'bg-[#3A2A24]') : habit.bg}`}>
                {habit.icon}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className={`font-bold text-base truncate transition-colors ${habit.done ? 'text-[#8A7E7A] line-through' : (isDarkMode ? 'text-[#FDF8F3]' : 'text-[#2A2421]')}`}>{habit.title}</h3>
                <div className="flex items-center gap-2 text-xs text-[#8A7E7A] mt-1 font-medium">
                  <Flame className={`w-3.5 h-3.5 shrink-0 ${habit.done ? 'text-[#8A7E7A]' : 'text-[#D0705B]'}`} />
                  <span>{habit.streak}</span>
                  <span className="w-1 h-1 rounded-full bg-[#8A7E7A]/50 mx-1 shrink-0"></span>
                  <span className="truncate">{habit.metric}</span>
                </div>
              </div>
              <motion.button
                whileTap={{ scale: 0.8 }}
                onClick={(e) => handleToggle(habit.id, e)}
                className={`w-8 h-8 shrink-0 rounded-full flex items-center justify-center border-2 transition-colors mr-2 ${habit.done ? 'bg-[#D0705B] border-[#D0705B] text-white shadow-[0_2px_8px_rgba(208,112,91,0.4)]' : (isDarkMode ? 'border-[#A58876]/30 text-transparent hover:border-[#D0705B]/50' : 'border-[#8A7E7A]/30 text-transparent hover:border-[#D0705B]/50')}`}
              >
                <motion.div
                  initial={false}
                  animate={{ scale: habit.done ? 1 : 0, opacity: habit.done ? 1 : 0 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                >
                  <Check className="w-5 h-5" strokeWidth={3} />
                </motion.div>
              </motion.button>
            </Reorder.Item>
          ))}
        </AnimatePresence>
      </Reorder.Group>
    </div>
  );
};

const ActivityChart = ({ isDarkMode }: { isDarkMode: boolean }) => {
  const data = [40, 60, 30, 80, 50, 20, 30];
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  
  return (
    <div className={`backdrop-blur-md rounded-3xl p-6 soft-shadow transition-colors duration-500 ${isDarkMode ? 'bg-[#2A2421]/70' : 'bg-[#FAF5F0]/70'}`}>
      <h3 className={`text-[11px] font-bold tracking-widest mb-6 uppercase transition-colors duration-500 ${isDarkMode ? 'text-[#FDF8F3]' : 'text-[#2A2421]'}`}>Activity Bar Chart</h3>
      <div className="flex items-end justify-between h-24 mb-4">
        {data.map((val, i) => (
          <div key={i} className="flex flex-col items-center gap-2 w-full group">
            <motion.div 
              initial={{ height: 0 }}
              animate={{ height: `${val}%` }}
              transition={{ duration: 0.8, delay: i * 0.1 }}
              className={`w-5 rounded-md transition-colors ${i === 3 ? 'bg-[#D0705B]' : (isDarkMode ? 'bg-[#4A2C24] group-hover:bg-[#D0705B]/50' : 'bg-[#E8DCD1] group-hover:bg-[#D0705B]/50')}`} 
            />
          </div>
        ))}
      </div>
      <div className="flex justify-between px-1 mb-4">
        {days.map((d, i) => (
          <span key={i} className={`text-[10px] font-bold ${i === 3 ? 'text-[#D0705B]' : (isDarkMode ? 'text-[#A58876]' : 'text-[#2A2421]')}`}>{d}</span>
        ))}
      </div>
      <p className={`text-[11px] text-center font-medium transition-colors duration-500 ${isDarkMode ? 'text-[#FDF8F3]' : 'text-[#2A2421]'}`}>
        Your productivity is up <span className="text-[#4CAF50]">14%</span> this week
      </p>
    </div>
  );
};

const QuoteCard = ({ isDarkMode }: { isDarkMode: boolean }) => (
  <motion.div 
    whileHover={{ scale: 1.02 }}
    className={`rounded-3xl p-6 text-white soft-shadow relative overflow-hidden cursor-pointer transition-colors duration-500 ${isDarkMode ? 'bg-[#B85F4C]' : 'bg-[#D0705B]'}`}
  >
    <div className="absolute top-4 left-4 opacity-20">
      <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path d="M14.017 18L14.017 10.609C14.017 4.905 17.748 1.039 23 0L23.995 2.151C21.563 3.068 20 5.789 20 8H24V18H14.017ZM0 18V10.609C0 4.905 3.748 1.038 9 0L9.996 2.151C7.563 3.068 6 5.789 6 8H9.983L9.983 18L0 18Z" />
      </svg>
    </div>
    <div className="relative z-10 pt-6">
      <p className="font-serif text-xl italic leading-snug mb-4">
        "Simplicity is the ultimate sophistication."
      </p>
      <p className="text-[10px] font-bold tracking-widest uppercase opacity-80">
        — Leonardo da Vinci
      </p>
    </div>
  </motion.div>
);

const CategoriesWidget = ({ isDarkMode }: { isDarkMode: boolean }) => {
  const tags = ['Health', 'Mindset', 'Learning', 'Fitness', '+ Explore'];
  return (
    <div className={`backdrop-blur-md rounded-3xl p-6 soft-shadow transition-colors duration-500 ${isDarkMode ? 'bg-[#2A2421]/70' : 'bg-[#FAF5F0]/70'}`}>
      <h3 className={`text-[11px] font-bold tracking-widest mb-4 uppercase transition-colors duration-500 ${isDarkMode ? 'text-[#FDF8F3]' : 'text-[#2A2421]'}`}>Categories</h3>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag, i) => (
          <motion.button 
            key={i} 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${tag.startsWith('+') ? 'bg-[#D0705B]/10 text-[#D0705B]' : (isDarkMode ? 'bg-[#4A2C24]/50 text-[#FDF8F3] hover:bg-[#4A2C24]' : 'bg-[#E8DCD1]/50 text-[#2A2421] hover:bg-[#E8DCD1]')}`}
          >
            {tag}
          </motion.button>
        ))}
      </div>
    </div>
  );
};

const MainContent = ({ isDarkMode, showProfileLoading, userDisplayName }: { isDarkMode: boolean, showProfileLoading: boolean, userDisplayName: string }) => {
  const [range, setRange] = useState('Today');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewDate, setViewDate] = useState(new Date());
  const [habitData, setHabitData] = useState<Record<string, Habit[]>>({});

  const handleSetRange = (r: string) => {
    setRange(r);
    if (r === 'Today' || r === 'Weekly') {
      const today = new Date();
      setSelectedDate(today);
      setViewDate(today);
    }
  };

  const getHabitsForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    if (habitData[dateStr]) return habitData[dateStr];
    
    const isPast = date < new Date() && !isSameDay(date, new Date());
    const seed = date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate();

    return [
      { id: 1, title: 'Morning Meditation', streak: '12 days', metric: '15 min', icon: <Wind className="text-[#D0705B] w-6 h-6" />, done: isPast ? (seed % 2 === 0) : false, bg: 'bg-[#FDECE8]' },
      { id: 2, title: 'Hydrate Regularly', streak: '4 days', metric: '2.5 Liters', icon: <Droplet className="text-[#A58876] w-6 h-6" />, done: isPast ? (seed % 3 !== 0) : false, bg: 'bg-[#F2E8E3]' },
      { id: 3, title: 'Daily Reading', streak: '28 days', metric: '20 pages', icon: <BookOpen className="text-[#A58876] w-6 h-6" />, done: isPast ? (seed % 5 !== 0) : false, bg: 'bg-[#F2E8E3]' },
    ];
  };

  const [weeklyHabits, setWeeklyHabits] = useState<Habit[]>([
    { id: 4, title: 'Workout 3x', streak: '2 weeks', metric: '1/3 done', icon: <Flame className="text-[#D0705B] w-6 h-6" />, done: false, bg: 'bg-[#FDECE8]' },
    { id: 5, title: 'Read a book', streak: '1 month', metric: '100 pages', icon: <BookOpen className="text-[#A58876] w-6 h-6" />, done: true, bg: 'bg-[#F2E8E3]' },
    { id: 6, title: 'Meal Prep', streak: '3 weeks', metric: '5 meals', icon: <Droplet className="text-[#A58876] w-6 h-6" />, done: false, bg: 'bg-[#F2E8E3]' },
  ]);

  const currentHabits = range === 'Weekly' ? weeklyHabits : getHabitsForDate(selectedDate);

  const toggleHabit = (id: number) => {
    if (range === 'Weekly') {
      setWeeklyHabits(weeklyHabits.map(h => h.id === id ? { ...h, done: !h.done } : h));
    } else {
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      const updatedHabits = currentHabits.map(h => h.id === id ? { ...h, done: !h.done } : h);
      setHabitData({ ...habitData, [dateStr]: updatedHabits });
    }
  };

  const handleReorder = (newOrder: Habit[]) => {
    if (range === 'Weekly') {
      setWeeklyHabits(newOrder);
    } else {
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      setHabitData({ ...habitData, [dateStr]: newOrder });
    }
  };

  const getDayProgress = (date: Date) => {
    const habitsForDay = getHabitsForDate(date);
    return habitsForDay.length > 0 ? Math.round((habitsForDay.filter(h => h.done).length / habitsForDay.length) * 100) : 0;
  };

  const progress = range === 'Weekly' 
    ? (weeklyHabits.length > 0 ? Math.round((weeklyHabits.filter(h => h.done).length / weeklyHabits.length) * 100) : 0)
    : getDayProgress(selectedDate);

  return (
    <main className="flex-1 p-8 overflow-y-auto z-10">
      <div className="max-w-5xl mx-auto">
        {showProfileLoading && (
          <div className={`mb-5 rounded-2xl px-4 py-3 text-sm font-medium transition-colors duration-500 ${isDarkMode ? 'bg-[#D0705B]/20 text-[#FDF8F3]' : 'bg-[#D0705B]/15 text-[#2A2421]'}`}>
            {AUTH_COPY.shellProfileLoading}
          </div>
        )}
        <Header range={range} setRange={handleSetRange} currentDate={selectedDate} isDarkMode={isDarkMode} userDisplayName={userDisplayName} />
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mt-8 backdrop-blur-md rounded-3xl p-6 soft-shadow transition-colors duration-500 ${isDarkMode ? 'bg-[#2A2421]/60' : 'bg-[#FAF5F0]/60'}`}
        >
           <ProgressSection progress={progress} isDarkMode={isDarkMode} />
           <CalendarStrip selectedDate={selectedDate} setSelectedDate={setSelectedDate} range={range} getDayProgress={getDayProgress} viewDate={viewDate} setViewDate={setViewDate} isDarkMode={isDarkMode} />
        </motion.div>

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <HabitsList habits={currentHabits} toggleHabit={toggleHabit} onReorder={handleReorder} isDarkMode={isDarkMode} />
          </div>
          <div className="space-y-6">
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
              <ActivityChart isDarkMode={isDarkMode} />
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
              <QuoteCard isDarkMode={isDarkMode} />
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
              <CategoriesWidget isDarkMode={isDarkMode} />
            </motion.div>
          </div>
        </div>
      </div>
    </main>
  );
};

const AuthGatePanel = ({
  authState,
  isDarkMode,
  onOpenAuth,
  onRefresh,
}: {
  authState: AuthState;
  isDarkMode: boolean;
  onOpenAuth: () => void;
  onRefresh: () => void;
}) => {
  const isPending = authState.status === 'authenticated_pending';
  const missingSteps = isPending ? authState.security.missingSteps : [];

  return (
    <main className="flex-1 p-8 overflow-y-auto z-10">
      <div className="max-w-3xl mx-auto">
        <motion.section
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-3xl p-8 soft-shadow backdrop-blur-md transition-colors duration-500 ${
            isDarkMode ? 'bg-[#2A2421]/75' : 'bg-[#FAF5F0]/80'
          }`}
        >
          <div className="flex items-center gap-3 mb-4">
            <ShieldAlert className={`w-6 h-6 ${isDarkMode ? 'text-[#D0705B]' : 'text-[#B85F4C]'}`} />
            <h2 className={`font-serif text-3xl transition-colors duration-500 ${isDarkMode ? 'text-[#FDF8F3]' : 'text-[#2A2421]'}`}>
              {isPending ? AUTH_COPY.gateTitlePending : AUTH_COPY.gateTitleSignIn}
            </h2>
          </div>

          <p className={`text-sm leading-relaxed transition-colors duration-500 ${isDarkMode ? 'text-[#EADCCF]' : 'text-[#4A3E37]'}`}>
            {isPending
              ? AUTH_COPY.gateBodyPending
              : AUTH_COPY.gateBodySignIn}
          </p>

          {isPending && (
            <div className="mt-6 space-y-3">
              {missingSteps.map((step) => (
                <div
                  key={step}
                  className={`rounded-2xl border px-4 py-3 ${
                    isDarkMode
                      ? 'border-[#D0705B]/30 bg-[#D0705B]/10'
                      : 'border-[#D0705B]/25 bg-[#D0705B]/10'
                  }`}
                >
                  <p className={`text-sm font-semibold ${isDarkMode ? 'text-[#FDF8F3]' : 'text-[#2A2421]'}`}>
                    {VERIFICATION_STEP_COPY[step].title}
                  </p>
                  <p className={`text-xs mt-1 ${isDarkMode ? 'text-[#EADCCF]' : 'text-[#4A3E37]'}`}>
                    {VERIFICATION_STEP_COPY[step].body}
                  </p>
                </div>
              ))}
            </div>
          )}

          {authState.message && (
            <p className={`mt-5 text-sm ${isDarkMode ? 'text-[#F5C5BA]' : 'text-[#8C3B2B]'}`}>
              {authState.message}
            </p>
          )}

          <div className="mt-7 flex flex-wrap gap-3">
            <button
              onClick={onOpenAuth}
              className="rounded-xl bg-[#D0705B] px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            >
              {isPending ? AUTH_COPY.gateOpenAuthPending : AUTH_COPY.gateOpenAuthSignIn}
            </button>
            {isPending && (
              <button
                onClick={onRefresh}
                className={`rounded-xl px-5 py-2.5 text-sm font-semibold transition-colors ${
                  isDarkMode
                    ? 'border border-[#A58876]/40 text-[#FDF8F3] hover:bg-[#4A2C24]/40'
                    : 'border border-[#C9B7AA] text-[#2A2421] hover:bg-[#E8DCD1]/60'
                }`}
              >
                {AUTH_COPY.gateRefreshStatus}
              </button>
            )}
          </div>
        </motion.section>
      </div>
    </main>
  );
};

export default function App() {
  const { authState, refreshAuthState, signOut } = useAuth();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  const isAuthenticated =
    authState.status === 'authenticated_ready' ||
    authState.status === 'authenticated_pending';
  // TODO(auth-verification-coming-soon): Restore strict authorization gate when email + TOTP verification is enabled.
  // const isAuthorized = authState.status === 'authenticated_ready';
  const isAuthorized = isAuthenticated;

  const handleAuthAction = () => {
    if (isAuthenticated) {
      void signOut();
      return;
    }

    setIsAuthOpen(true);
  };

  const showProfileLoading =
    authState.status === 'authenticated_ready' &&
    authState.profileStatus === 'loading';

  const userDisplayName = (() => {
    if (
      authState.status !== 'authenticated_ready' &&
      authState.status !== 'authenticated_pending'
    ) {
      return 'Alex';
    }

    const displayName = authState.user.displayName?.trim();
    if (displayName) {
      return displayName;
    }

    return 'Alex';
  })();

  return (
    <ShaderBackground isDarkMode={isDarkMode}>
      <div className={`flex h-screen overflow-hidden relative z-10 transition-colors duration-500 ${isDarkMode ? 'text-[#FDF8F3]' : 'text-[#2A2421]'}`}>
        <Sidebar
          isDarkMode={isDarkMode}
          setIsDarkMode={setIsDarkMode}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onOpenAuthModal={() => setIsAuthOpen(true)}
          onAuthAction={handleAuthAction}
          isAuthenticated={isAuthenticated}
        />
        {isAuthorized ? (
          activeTab === 'Dashboard' ? (
            <MainContent isDarkMode={isDarkMode} showProfileLoading={showProfileLoading} userDisplayName={userDisplayName} />
          ) : activeTab === 'Statistics' ? (
            <StatisticsPage isDarkMode={isDarkMode} />
          ) : (
            <MainContent isDarkMode={isDarkMode} showProfileLoading={showProfileLoading} userDisplayName={userDisplayName} />
          )
        ) : (
          <AuthGatePanel
            authState={authState}
            isDarkMode={isDarkMode}
            onOpenAuth={() => setIsAuthOpen(true)}
            onRefresh={() => {
              void refreshAuthState(true);
            }}
          />
        )}
      </div>
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} isDarkMode={isDarkMode} />
    </ShaderBackground>
  );
}
