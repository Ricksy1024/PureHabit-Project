import React, { useEffect, useState } from 'react';
import {
  addMonths,
  addWeeks,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  startOfMonth,
  startOfWeek,
  subDays,
  subMonths,
  subWeeks,
} from 'date-fns';
import confetti from 'canvas-confetti';
import { AnimatePresence, motion, Reorder } from 'framer-motion';
import {
  Activity,
  Apple,
  BarChart2,
  Book,
  Check,
  CheckSquare,
  ChevronLeft,
  ChevronRight,
  Coffee,
  Dumbbell,
  Flame,
  Folder,
  GripVertical,
  Heart,
  LayoutDashboard,
  LogIn,
  LogOut,
  Moon,
  Music,
  Settings,
  ShieldAlert,
  Smile,
  Sparkles,
  Target,
  Zap,
} from 'lucide-react';
import { AddActivityModal, type NewActivity } from './components/AddActivityModal';
import { AuthModal } from './components/AuthModal';
import { CategoriesPage } from './components/CategoriesPage';
import { ConnectedSettingsModal } from './components/ConnectedSettingsModal';
import {
  EditActivityModal,
  type ActivityToEdit,
  type EditedActivity,
} from './components/EditActivityModal';
import { EditCategoryModal } from './components/EditCategoryModal';
import { HabitsPage } from './components/HabitsPage';
import { ShaderBackground } from './components/ShaderBackground';
import { StatisticsPage } from './components/StatisticsPage';
import { StreakPage } from './components/StreakPage';
import { ThemeToggle } from './components/ThemeToggle';
import { AUTH_COPY, VERIFICATION_STEP_COPY } from './constants/authCopy';
import { useAuth } from './hooks/useAuth';
import { useHabitLogs } from './hooks/useHabitLogs';
import { useHabits } from './hooks/useHabits';
import { useStatistics } from './hooks/useStatistics';
import { useStreaks } from './hooks/useStreaks';
import {
  archiveHabit,
  batchRenameCategory,
  createHabit,
  updateHabit,
} from './services/habitService';
import type { AuthState } from './types/auth';
import type { Habit, StreakStatus } from './types/habit';
import {
  calculateCompletionPercentage,
  DAY_CODE_TO_NAME,
  DAY_NAME_TO_CODE,
  getHabitsForDate,
  getPastSevenDates,
} from './utils/habitUtils';

const ICON_MAP = {
  Activity,
  Apple,
  Book,
  Coffee,
  Dumbbell,
  Flame,
  Heart,
  Moon,
  Music,
  Smile,
  Target,
  Zap,
};

function Sidebar({
  isDarkMode,
  setIsDarkMode,
  activeTab,
  setActiveTab,
  onSettingsClick,
  userDisplayName,
}: {
  isDarkMode: boolean;
  setIsDarkMode: (value: boolean) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onSettingsClick: () => void;
  userDisplayName: string;
}) {
  return (
    <aside
      className={`w-64 h-screen flex flex-col px-6 py-8 backdrop-blur-sm border-r ${
        isDarkMode ? 'bg-black/20 border-[#4A2C24]/30' : 'bg-white/10 border-[#EADCCF]/20'
      }`}
    >
      <div
        className={`flex items-center gap-2 mb-12 px-2 ${
          isDarkMode ? 'text-[#FDF8F3]' : 'text-[#2A2421]'
        }`}
      >
        <Sparkles className="w-6 h-6" />
        <span className="font-serif text-2xl font-semibold">PureHabit</span>
      </div>

      <nav className="flex-1 space-y-1">
        {[
          { label: 'Dashboard', icon: LayoutDashboard },
          { label: 'Statistics', icon: BarChart2 },
          { label: 'Habits', icon: CheckSquare },
          { label: 'Categories', icon: Folder },
          { label: 'Streak', icon: Flame },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <a
              key={item.label}
              href="#"
              onClick={(event) => {
                event.preventDefault();
                setActiveTab(item.label);
              }}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl relative ${
                activeTab === item.label
                  ? isDarkMode
                    ? 'text-[#FDF8F3] font-medium'
                    : 'text-[#2A2421] font-medium'
                  : isDarkMode
                    ? 'text-[#A58876] hover:bg-[#4A2C24]/30'
                    : 'text-[#2A2421] hover:bg-[#E8DCD1]/30'
              }`}
            >
              {activeTab === item.label ? (
                <motion.div
                  layoutId="activeNav"
                  className={`absolute inset-0 rounded-2xl -z-10 ${
                    isDarkMode ? 'bg-[#4A2C24]/60' : 'bg-[#E8DCD1]/60'
                  }`}
                />
              ) : null}
              <Icon className="w-5 h-5" />
              <span className="text-sm">{item.label}</span>
            </a>
          );
        })}
      </nav>

      <div className="mt-auto px-2 space-y-4">
        <ThemeToggle isDark={isDarkMode} setIsDark={setIsDarkMode} />

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.95 }}
          onClick={onSettingsClick}
          className={`w-full flex items-center gap-3 p-3 rounded-2xl ${
            isDarkMode
              ? 'bg-[#2A2421]/80 border border-[#4A2C24]/50'
              : 'border border-transparent hover:bg-[#E8DCD1]/30'
          }`}
        >
          <div className="w-10 h-10 rounded-xl bg-[#D0705B]/20 flex items-center justify-center text-[#D0705B] font-semibold">
            {userDisplayName.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 text-left">
            <p
              className={`text-sm font-bold ${
                isDarkMode ? 'text-[#FDF8F3]' : 'text-[#2A2421]'
              }`}
            >
              {userDisplayName}
            </p>
            <p
              className={`text-[11px] ${
                isDarkMode ? 'text-[#A58876]' : 'text-[#8A7E7A]'
              }`}
            >
              Settings & profile
            </p>
          </div>
          <Settings
            className={`w-4 h-4 ${isDarkMode ? 'text-[#FDF8F3]' : 'text-[#2A2421]'}`}
          />
        </motion.button>
      </div>
    </aside>
  );
}

function Header({
  currentDate,
  range,
  setRange,
  isDarkMode,
  userDisplayName,
}: {
  currentDate: Date;
  range: string;
  setRange: (range: string) => void;
  isDarkMode: boolean;
  userDisplayName: string;
}) {
  return (
    <div className="flex justify-between items-end gap-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1
          className={`font-serif text-4xl font-medium mb-1 ${
            isDarkMode ? 'text-[#FDF8F3]' : 'text-[#2A2421]'
          }`}
        >
          Good Morning, {userDisplayName}
        </h1>
        <p className={isDarkMode ? 'text-[#A58876]' : 'text-[#2A2421]'}>
          {format(currentDate, 'EEEE, MMMM d, yyyy')}
        </p>
      </motion.div>
      <div
        className={`flex backdrop-blur-md rounded-full p-1 soft-shadow ${
          isDarkMode ? 'bg-[#2A2421]/60' : 'bg-[#FAF5F0]/60'
        }`}
      >
        {['Today', 'Weekly', 'Month'].map((option) => (
          <button
            key={option}
            onClick={() => setRange(option)}
            className={`relative px-5 py-1.5 rounded-full text-sm font-medium z-10 ${
              range === option
                ? 'text-white'
                : isDarkMode
                  ? 'text-[#A58876]'
                  : 'text-[#2A2421]'
            }`}
          >
            {range === option ? (
              <motion.div
                layoutId="activeRange"
                className="absolute inset-0 bg-[#D0705B] rounded-full -z-10"
              />
            ) : null}
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}

function ProgressSection({
  progress,
  isDarkMode,
}: {
  progress: number;
  isDarkMode: boolean;
}) {
  return (
    <div className="flex items-center gap-4 mb-8">
      <span
        className={`text-sm font-medium whitespace-nowrap ${
          isDarkMode ? 'text-[#FDF8F3]' : 'text-[#2A2421]'
        }`}
      >
        Today&apos;s Progress
      </span>
      <div
        className={`flex-1 h-5 backdrop-blur-sm rounded-full overflow-hidden ${
          isDarkMode ? 'bg-black/30' : 'bg-white/50'
        }`}
      >
        <motion.div
          className="h-full bg-[#D0705B] rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
        />
      </div>
      <span className="text-sm font-semibold text-[#D0705B]">{progress}%</span>
    </div>
  );
}

function CalendarStrip({
  selectedDate,
  setSelectedDate,
  range,
  viewDate,
  setViewDate,
  getDayProgress,
  isDarkMode,
}: {
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
  range: string;
  viewDate: Date;
  setViewDate: (date: Date) => void;
  getDayProgress: (date: Date) => number;
  isDarkMode: boolean;
}) {
  const days =
    range === 'Month'
      ? eachDayOfInterval({
          start: startOfMonth(viewDate),
          end: endOfMonth(viewDate),
        })
      : eachDayOfInterval({
          start: startOfWeek(viewDate, { weekStartsOn: 1 }),
          end: endOfWeek(viewDate, { weekStartsOn: 1 }),
        });

  return (
    <div>
      {range !== 'Today' ? (
        <div className="flex items-center justify-between mb-6">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() =>
              setViewDate(
                range === 'Month' ? subMonths(viewDate, 1) : subWeeks(viewDate, 1),
              )
            }
            className={`p-2 rounded-full ${
              isDarkMode ? 'hover:bg-[#4A2C24]/50' : 'hover:bg-[#E8DCD1]/50'
            }`}
          >
            <ChevronLeft className={isDarkMode ? 'w-5 h-5 text-[#FDF8F3]' : 'w-5 h-5 text-[#2A2421]'} />
          </motion.button>
          <span
            className={`font-serif text-lg font-medium ${
              isDarkMode ? 'text-[#FDF8F3]' : 'text-[#2A2421]'
            }`}
          >
            {range === 'Month'
              ? format(viewDate, 'MMMM yyyy')
              : `Week of ${format(startOfWeek(viewDate, { weekStartsOn: 1 }), 'MMM d')}`}
          </span>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() =>
              setViewDate(
                range === 'Month' ? addMonths(viewDate, 1) : addWeeks(viewDate, 1),
              )
            }
            className={`p-2 rounded-full ${
              isDarkMode ? 'hover:bg-[#4A2C24]/50' : 'hover:bg-[#E8DCD1]/50'
            }`}
          >
            <ChevronRight className={isDarkMode ? 'w-5 h-5 text-[#FDF8F3]' : 'w-5 h-5 text-[#2A2421]'} />
          </motion.button>
        </div>
      ) : null}

      <div className={`flex ${range === 'Month' ? 'flex-wrap gap-y-6' : 'justify-between'} px-2`}>
        {days.map((date) => {
          const progress = getDayProgress(date);
          const active = isSameDay(date, selectedDate);

          return (
            <div
              key={date.toISOString()}
              className={`flex flex-col items-center gap-3 cursor-pointer group ${
                range === 'Month' ? 'w-[14.28%]' : ''
              }`}
              onClick={() => setSelectedDate(date)}
            >
              <span
                className={`text-[10px] font-bold tracking-widest ${
                  active
                    ? 'text-[#D0705B]'
                    : isDarkMode
                      ? 'text-[#A58876]'
                      : 'text-[#2A2421]'
                }`}
              >
                {format(date, 'EEE').toUpperCase()}
              </span>
              <div className="relative">
                <svg
                  className="absolute -inset-1 w-12 h-12 -rotate-90 pointer-events-none overflow-visible"
                  viewBox="0 0 36 36"
                >
                  <path
                    className={isDarkMode ? 'text-[#4A2C24]/50' : 'text-[#E8DCD1]/50'}
                    strokeWidth="2"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-[#D0705B]"
                    strokeDasharray={`${progress}, 100`}
                    strokeWidth="2"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div
                  className={`relative w-10 h-10 rounded-full flex items-center justify-center ${
                    active
                      ? isDarkMode
                        ? 'text-[#FDF8F3] font-bold'
                        : 'text-white font-bold'
                      : isDarkMode
                        ? 'text-[#FDF8F3]'
                        : 'text-[#2A2421]'
                  }`}
                >
                  {active ? (
                    <motion.div
                      layoutId="activeCalendarDay"
                      className={`absolute inset-0 rounded-full ${
                        isDarkMode ? 'bg-[#D0705B]/30' : 'bg-[#D0705B]'
                      }`}
                    />
                  ) : null}
                  <span className="relative z-10">{format(date, 'd')}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ActivityChart({
  isDarkMode,
  dates,
  values,
}: {
  isDarkMode: boolean;
  dates: string[];
  values: number[];
}) {
  return (
    <div
      className={`backdrop-blur-md rounded-3xl p-6 soft-shadow ${
        isDarkMode ? 'bg-[#2A2421]/70' : 'bg-[#FAF5F0]/70'
      }`}
    >
      <h3
        className={`text-[11px] font-bold tracking-widest mb-6 uppercase ${
          isDarkMode ? 'text-[#FDF8F3]' : 'text-[#2A2421]'
        }`}
      >
        Activity
      </h3>
      <div className="flex items-end justify-between h-32 mb-4 gap-1.5">
        {values.map((value, index) => (
          <div key={dates[index]} className="flex flex-col-reverse items-center gap-1 flex-1 h-full">
            <span className={isDarkMode ? 'text-[10px] font-bold text-[#A58876]' : 'text-[10px] font-bold text-[#2A2421]'}>
              {format(new Date(`${dates[index]}T12:00:00Z`), 'EEE')}
            </span>
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: `${value || 5}%` }}
              className="w-full bg-[#D0705B] rounded-md"
            />
            <span className={isDarkMode ? 'text-[10px] font-bold text-[#FDF8F3]' : 'text-[10px] font-bold text-[#2A2421]'}>
              {value}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function DashboardHabitList({
  habits,
  completionMap,
  streakMap,
  isDarkMode,
  onAddClick,
  onToggle,
  loading,
  error,
}: {
  habits: Habit[];
  completionMap: Record<string, boolean>;
  streakMap: Record<string, StreakStatus>;
  isDarkMode: boolean;
  onAddClick: () => void;
  onToggle: (habitId: string, currentValue: boolean, event: React.MouseEvent) => void;
  loading: boolean;
  error: string | null;
}) {
  return (
    <div>
      <div className="flex justify-between items-center mb-4 px-2">
        <h2
          className={`font-serif text-2xl ${
            isDarkMode ? 'text-[#FDF8F3]' : 'text-[#2A2421]'
          }`}
        >
          Daily Habits
        </h2>
        <motion.button
          onClick={onAddClick}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`px-4 py-2 rounded-xl text-sm font-medium ${
            isDarkMode ? 'bg-[#D0705B]/20 text-[#D0705B]' : 'bg-[#D0705B]/10 text-[#D0705B]'
          }`}
        >
          Add New
        </motion.button>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className={`backdrop-blur-md rounded-3xl p-4 flex items-center gap-4 soft-shadow h-[88px] animate-pulse ${
                isDarkMode ? 'bg-[#2A2421]/30' : 'bg-[#FAF5F0]/30'
              }`}
            >
              <div
                className={`w-14 h-14 rounded-2xl ${
                  isDarkMode ? 'bg-[#4A2C24]/30' : 'bg-[#EADCCF]/30'
                }`}
              />
              <div className="flex-1 space-y-2">
                <div
                  className={`h-4 rounded-full w-1/3 ${
                    isDarkMode ? 'bg-[#4A2C24]/50' : 'bg-[#EADCCF]/50'
                  }`}
                />
                <div
                  className={`h-3 rounded-full w-1/4 ${
                    isDarkMode ? 'bg-[#4A2C24]/30' : 'bg-[#EADCCF]/30'
                  }`}
                />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="text-red-500 text-sm font-medium">{error}</div>
      ) : habits.length === 0 ? (
        <div className="text-center py-12">
          <p
            className={`text-lg font-medium mb-2 ${
              isDarkMode ? 'text-[#FDF8F3]' : 'text-[#2A2421]'
            }`}
          >
            No habits yet
          </p>
          <button
            onClick={onAddClick}
            className="px-6 py-2.5 rounded-xl bg-[#D0705B] text-white text-sm font-semibold"
          >
            Add First Habit
          </button>
        </div>
      ) : (
        <Reorder.Group axis="y" values={habits} onReorder={() => {}} className="space-y-4">
          <AnimatePresence>
            {habits.map((habit) => {
              const Icon = ICON_MAP[habit.uiIconName as keyof typeof ICON_MAP] || Activity;
              const isDone = completionMap[habit.id] ?? false;
              const streakCount = streakMap[habit.id]?.currentStreak ?? 0;
              return (
                <Reorder.Item
                  key={habit.id}
                  value={habit}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className={`backdrop-blur-md rounded-3xl p-4 flex items-center gap-4 soft-shadow ${
                    isDarkMode ? 'bg-[#2A2421]/70' : 'bg-[#FAF5F0]/70'
                  }`}
                >
                  <div
                    className={`p-1 ${
                      isDarkMode ? 'text-[#A58876]/40' : 'text-[#8A7E7A]/40'
                    }`}
                  >
                    <GripVertical className="w-5 h-5" />
                  </div>
                  <div
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                      isDarkMode
                        ? habit.uiBgColor.replace('bg-[#FDECE8]', 'bg-[#4A2C24]')
                        : habit.uiBgColor
                    }`}
                  >
                    <Icon className="w-6 h-6 text-[#D0705B]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3
                      className={`font-bold text-base truncate ${
                        isDone
                          ? 'text-[#8A7E7A] line-through'
                          : isDarkMode
                            ? 'text-[#FDF8F3]'
                            : 'text-[#2A2421]'
                      }`}
                    >
                      {habit.name}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-[#8A7E7A] mt-1 font-medium">
                      <Flame className="w-3.5 h-3.5 text-[#D0705B]" />
                      <span>
                        {streakCount} day{streakCount === 1 ? '' : 's'}
                      </span>
                      <span className="w-1 h-1 rounded-full bg-[#8A7E7A]/50" />
                      <span className="truncate">{habit.uiMetric}</span>
                    </div>
                  </div>
                  <motion.button
                    whileTap={{ scale: 0.8 }}
                    onClick={(event) => onToggle(habit.id, isDone, event)}
                    className={`w-10 h-10 rounded-full border-2 flex items-center justify-center ${
                      isDone
                        ? 'bg-[#D0705B] border-[#D0705B] text-white'
                        : isDarkMode
                          ? 'border-[#4A2C24]'
                          : 'border-[#EADCCF]'
                    }`}
                  >
                    {isDone ? <Check className="w-4 h-4" /> : null}
                  </motion.button>
                </Reorder.Item>
              );
            })}
          </AnimatePresence>
        </Reorder.Group>
      )}
    </div>
  );
}

function AuthGatePanel({
  authState,
  isDarkMode,
  onOpenAuth,
  onRefresh,
}: {
  authState: AuthState;
  isDarkMode: boolean;
  onOpenAuth: () => void;
  onRefresh: () => void;
}) {
  const isPending = authState.status === 'authenticated_pending';
  const missingSteps = isPending ? authState.security.missingSteps : [];

  return (
    <main className="flex-1 p-8 overflow-y-auto z-10">
      <div className="max-w-3xl mx-auto">
        <motion.section
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-3xl p-8 soft-shadow backdrop-blur-md ${
            isDarkMode ? 'bg-[#2A2421]/75' : 'bg-[#FAF5F0]/80'
          }`}
        >
          <div className="flex items-center gap-3 mb-4">
            <ShieldAlert className={isDarkMode ? 'w-6 h-6 text-[#D0705B]' : 'w-6 h-6 text-[#B85F4C]'} />
            <h2
              className={`font-serif text-3xl ${
                isDarkMode ? 'text-[#FDF8F3]' : 'text-[#2A2421]'
              }`}
            >
              {isPending ? AUTH_COPY.gateTitlePending : AUTH_COPY.gateTitleSignIn}
            </h2>
          </div>

          <p className={isDarkMode ? 'text-sm leading-relaxed text-[#EADCCF]' : 'text-sm leading-relaxed text-[#4A3E37]'}>
            {isPending ? AUTH_COPY.gateBodyPending : AUTH_COPY.gateBodySignIn}
          </p>

          {isPending ? (
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
                  <p className={isDarkMode ? 'text-sm font-semibold text-[#FDF8F3]' : 'text-sm font-semibold text-[#2A2421]'}>
                    {VERIFICATION_STEP_COPY[step].title}
                  </p>
                  <p className={isDarkMode ? 'text-xs mt-1 text-[#EADCCF]' : 'text-xs mt-1 text-[#4A3E37]'}>
                    {VERIFICATION_STEP_COPY[step].body}
                  </p>
                </div>
              ))}
            </div>
          ) : null}

          {authState.message ? (
            <p className={isDarkMode ? 'mt-5 text-sm text-[#F5C5BA]' : 'mt-5 text-sm text-[#8C3B2B]'}>
              {authState.message}
            </p>
          ) : null}

          <div className="mt-7 flex flex-wrap gap-3">
            <button
              onClick={onOpenAuth}
              className="rounded-xl bg-[#D0705B] px-5 py-2.5 text-sm font-semibold text-white"
            >
              {isPending ? AUTH_COPY.gateOpenAuthPending : AUTH_COPY.gateOpenAuthSignIn}
            </button>
            {isPending ? (
              <button
                onClick={onRefresh}
                className={`rounded-xl px-5 py-2.5 text-sm font-semibold ${
                  isDarkMode
                    ? 'border border-[#A58876]/40 text-[#FDF8F3]'
                    : 'border border-[#C9B7AA] text-[#2A2421]'
                }`}
              >
                {AUTH_COPY.gateRefreshStatus}
              </button>
            ) : null}
          </div>
        </motion.section>
      </div>
    </main>
  );
}

function toHabitFormValues(habit: Habit | null): ActivityToEdit | null {
  if (!habit) {
    return null;
  }

  return {
    id: habit.id,
    name: habit.name,
    metric: habit.uiMetric,
    category: habit.category || 'Uncategorized',
    iconName: habit.uiIconName || 'Activity',
    days: habit.frequency.days.map((day) => DAY_CODE_TO_NAME[day]),
  };
}

export default function AppShell() {
  const { authState, refreshAuthState, signOut } = useAuth();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [range, setRange] = useState('Today');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewDate, setViewDate] = useState(new Date());
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [isEditCategoryModalOpen, setIsEditCategoryModalOpen] = useState(false);
  const [pageFeedback, setPageFeedback] = useState<string | null>(null);

  const isAuthenticated =
    authState.status === 'authenticated_ready' ||
    authState.status === 'authenticated_pending';
  const userId =
    authState.status === 'authenticated_ready' ||
    authState.status === 'authenticated_pending'
      ? authState.user.uid
      : undefined;
  const { habits, loading: habitsLoading, error: habitsError } = useHabits(userId);
  const {
    completionMap,
    toggleCompletion,
    syncError,
    clearSyncError,
  } = useHabitLogs(userId, selectedDate);
  const {
    streakMap,
    loading: streakLoading,
    error: streakError,
  } = useStreaks(
    userId,
    habits.map((habit) => habit.id),
  );

  const chartStartDate = subDays(selectedDate, 6);
  const { stats: chartStats } = useStatistics(userId, chartStartDate, selectedDate);

  useEffect(() => {
    if (!isAuthenticated) {
      setIsAuthOpen(true);
      setIsSettingsOpen(false);
      setActiveTab('Dashboard');
    }
  }, [isAuthenticated]);

  const userDisplayName = (() => {
    if (
      authState.status !== 'authenticated_ready' &&
      authState.status !== 'authenticated_pending'
    ) {
      return 'Alex';
    }

    return authState.user.displayName?.trim() || 'Alex';
  })();

  const showProfileLoading =
    authState.status === 'authenticated_ready' &&
    authState.profileStatus === 'loading';

  const currentHabits = getHabitsForDate(habits, selectedDate);
  const progress = calculateCompletionPercentage(currentHabits, completionMap);

  const dayProgress = (date: Date) => {
    const habitsForDate = getHabitsForDate(habits, date);
    const dateString = format(date, 'yyyy-MM-dd');
    const dateCompletionMap = chartStats.logsByDate[dateString] || {};
    return calculateCompletionPercentage(habitsForDate, dateCompletionMap);
  };

  const activityDates = getPastSevenDates(selectedDate);
  const activityValues = activityDates.map((dateString) =>
    calculateCompletionPercentage(
      getHabitsForDate(habits, new Date(`${dateString}T12:00:00Z`)),
      chartStats.logsByDate[dateString] || {},
    ),
  );

  async function handleAddActivity(activity: NewActivity) {
    setPageFeedback(null);
    const result = await createHabit({
      name: activity.name,
      frequency: {
        type: 'SPECIFIC_DAYS',
        days: activity.days.map((day) => DAY_NAME_TO_CODE[day]),
      },
      category: activity.category,
      uiBgColor: 'bg-[#FDECE8]',
      uiIconName: activity.iconName,
      uiMetric: activity.metric,
    });

    if (!result.ok) {
      setPageFeedback(result.error || 'Failed to create habit.');
      return;
    }

    setIsAddModalOpen(false);
  }

  async function handleSaveEditedHabit(edited: EditedActivity) {
    setPageFeedback(null);
    const result = await updateHabit({
      habitId: edited.id,
      name: edited.name,
      frequency: {
        type: 'SPECIFIC_DAYS',
        days: edited.days.map((day) => DAY_NAME_TO_CODE[day]),
      },
      category: edited.category,
      uiIconName: edited.iconName,
      uiMetric: edited.metric,
    });

    if (!result.ok) {
      setPageFeedback(result.error || 'Failed to update habit.');
      return;
    }

    setIsEditModalOpen(false);
    setEditingHabit(null);
  }

  async function handleDeleteHabit(id: string) {
    const confirmed = window.confirm(
      'Archive this habit? Existing logs will be preserved.',
    );
    if (!confirmed) {
      return;
    }

    const result = await archiveHabit(id);
    if (!result.ok) {
      setPageFeedback(result.error || 'Failed to archive habit.');
    }
  }

  async function handleSaveEditedCategory(oldName: string, newName: string) {
    setPageFeedback(null);
    const result = await batchRenameCategory(oldName, newName);
    if (!result.ok) {
      setPageFeedback(result.error || 'Failed to rename category.');
      return;
    }

    setIsEditCategoryModalOpen(false);
    setEditingCategory(null);
  }

  function handleDashboardToggle(
    habitId: string,
    currentValue: boolean,
    event: React.MouseEvent,
  ) {
    if (!currentValue) {
      const rect = (event.target as HTMLElement).getBoundingClientRect();
      confetti({
        particleCount: 60,
        spread: 70,
        origin: {
          x: (rect.left + rect.width / 2) / window.innerWidth,
          y: (rect.top + rect.height / 2) / window.innerHeight,
        },
        colors: ['#D0705B', '#A58876', '#EADCCF', '#FDF8F3'],
        disableForReducedMotion: true,
      });
    }

    void toggleCompletion(habitId, currentValue);
  }

  const dashboardView = (
    <main className="flex-1 p-8 overflow-y-auto z-10">
      <div className="max-w-5xl mx-auto">
        {showProfileLoading ? (
          <div
            className={`mb-5 rounded-2xl px-4 py-3 text-sm font-medium ${
              isDarkMode ? 'bg-[#D0705B]/20 text-[#FDF8F3]' : 'bg-[#D0705B]/15 text-[#2A2421]'
            }`}
          >
            {AUTH_COPY.shellProfileLoading}
          </div>
        ) : null}
        {pageFeedback ? (
          <div
            className={`mb-5 rounded-2xl px-4 py-3 text-sm ${
              isDarkMode ? 'bg-[#EF5350]/15 text-[#F5C5BA]' : 'bg-[#EF5350]/10 text-[#8C3B2B]'
            }`}
          >
            {pageFeedback}
          </div>
        ) : null}
        {syncError ? (
          <div
            className={`mb-5 rounded-2xl px-4 py-3 text-sm cursor-pointer ${
              isDarkMode ? 'bg-[#EF5350]/15 text-[#F5C5BA]' : 'bg-[#EF5350]/10 text-[#8C3B2B]'
            }`}
            onClick={clearSyncError}
          >
            {syncError}
          </div>
        ) : null}

        <Header
          currentDate={selectedDate}
          range={range}
          setRange={(nextRange) => {
            setRange(nextRange);
            if (nextRange === 'Today' || nextRange === 'Weekly') {
              setViewDate(new Date());
            }
          }}
          isDarkMode={isDarkMode}
          userDisplayName={userDisplayName}
        />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mt-8 backdrop-blur-md rounded-3xl p-6 soft-shadow ${
            isDarkMode ? 'bg-[#2A2421]/60' : 'bg-[#FAF5F0]/60'
          }`}
        >
          <ProgressSection progress={progress} isDarkMode={isDarkMode} />
          <CalendarStrip
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            range={range}
            viewDate={viewDate}
            setViewDate={setViewDate}
            getDayProgress={dayProgress}
            isDarkMode={isDarkMode}
          />
        </motion.div>

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <DashboardHabitList
              habits={currentHabits}
              completionMap={completionMap}
              streakMap={streakMap}
              isDarkMode={isDarkMode}
              onAddClick={() => setIsAddModalOpen(true)}
              onToggle={handleDashboardToggle}
              loading={habitsLoading}
              error={habitsError}
            />
          </div>
          <div className="space-y-6">
            <ActivityChart
              isDarkMode={isDarkMode}
              dates={activityDates}
              values={activityValues}
            />
          </div>
        </div>
      </div>
    </main>
  );

  return (
    <ShaderBackground isDarkMode={isDarkMode}>
      <div
        className={`flex h-screen overflow-hidden relative z-10 ${
          isDarkMode ? 'text-[#FDF8F3]' : 'text-[#2A2421]'
        }`}
      >
        <Sidebar
          isDarkMode={isDarkMode}
          setIsDarkMode={setIsDarkMode}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onSettingsClick={() => setIsSettingsOpen(true)}
          userDisplayName={userDisplayName}
        />

        {authState.status === 'loading' || !isAuthenticated ? (
          <AuthGatePanel
            authState={authState}
            isDarkMode={isDarkMode}
            onOpenAuth={() => setIsAuthOpen(true)}
            onRefresh={() => {
              void refreshAuthState(true);
            }}
          />
        ) : activeTab === 'Dashboard' ? (
          dashboardView
        ) : activeTab === 'Statistics' ? (
          <StatisticsPage
            isDarkMode={isDarkMode}
            userId={userId}
            userDisplayName={userDisplayName}
          />
        ) : activeTab === 'Habits' ? (
          <HabitsPage
            isDarkMode={isDarkMode}
            habits={habits}
            completionMap={completionMap}
            streakMap={streakMap}
            syncError={syncError}
            onToggle={(habitId, currentValue) => {
              void toggleCompletion(habitId, currentValue);
            }}
            onEdit={(habit) => {
              setEditingHabit(habit);
              setIsEditModalOpen(true);
            }}
            onDelete={(habitId) => {
              void handleDeleteHabit(habitId);
            }}
            onAddClick={() => setIsAddModalOpen(true)}
          />
        ) : activeTab === 'Categories' ? (
          <CategoriesPage
            isDarkMode={isDarkMode}
            habits={habits}
            onEdit={(habit) => {
              setEditingHabit(habit);
              setIsEditModalOpen(true);
            }}
            onEditCategory={(category) => {
              setEditingCategory(category);
              setIsEditCategoryModalOpen(true);
            }}
          />
        ) : (
          <StreakPage
            isDarkMode={isDarkMode}
            habits={habits}
            streakMap={streakMap}
            loading={streakLoading}
            error={streakError}
            onEdit={(habit) => {
              setEditingHabit(habit);
              setIsEditModalOpen(true);
            }}
            onDelete={(habitId) => {
              void handleDeleteHabit(habitId);
            }}
          />
        )}
      </div>

      <AddActivityModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={(activity) => {
          void handleAddActivity(activity);
        }}
        isDarkMode={isDarkMode}
      />
      <EditActivityModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingHabit(null);
        }}
        onSave={(activity) => {
          void handleSaveEditedHabit(activity);
        }}
        isDarkMode={isDarkMode}
        activity={toHabitFormValues(editingHabit)}
      />
      <EditCategoryModal
        isOpen={isEditCategoryModalOpen}
        onClose={() => {
          setIsEditCategoryModalOpen(false);
          setEditingCategory(null);
        }}
        onSave={(oldName, newName) => {
          void handleSaveEditedCategory(oldName, newName);
        }}
        isDarkMode={isDarkMode}
        categoryName={editingCategory}
      />
      <ConnectedSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
        isAuthenticated={isAuthenticated}
        onAuthAction={() => {
          if (isAuthenticated) {
            void signOut();
            setIsSettingsOpen(false);
            setIsAuthOpen(true);
            return;
          }

          setIsSettingsOpen(false);
          setIsAuthOpen(true);
        }}
        authState={authState}
        refreshAuthState={refreshAuthState}
        signOut={signOut}
      />
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => {
          if (isAuthenticated) {
            setIsAuthOpen(false);
          }
        }}
        isDarkMode={isDarkMode}
      />
    </ShaderBackground>
  );
}
