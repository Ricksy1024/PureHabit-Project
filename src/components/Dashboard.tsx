import React, { useMemo, useState } from 'react';
import {
  addDays,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isAfter,
  isSameDay,
  startOfDay,
  startOfMonth,
  startOfWeek,
} from 'date-fns';
import { Plus, Check, Flame, Quote } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useHabitStore } from '@/store';
import { BarChart, Bar, ResponsiveContainer, XAxis, Tooltip, Cell } from 'recharts';
import { AddHabitModal } from './AddHabitModal';
import { AIInsights } from './AIInsights';

type Scope = 'today' | 'week' | 'month';

type DashboardProps = {
  onNavigate: (tab: 'statistics' | 'categories' | 'settings' | 'dashboard' | 'calendar' | 'habits' | 'streaks') => void;
};

const quotes = [
  'Consistency compounds faster than intensity.',
  'Small daily rituals build extraordinary outcomes.',
  'Clarity first, effort second, momentum always.',
];

export function Dashboard({ onNavigate }: DashboardProps) {
  const { habits, logs, toggleHabit, userName, categories } = useHabitStore();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewScope, setViewScope] = useState<Scope>('today');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const today = new Date();
  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 1 });
  const monthStart = startOfMonth(selectedDate);
  const monthEnd = endOfMonth(selectedDate);

  const weekDays = useMemo(
    () => Array.from({ length: 7 }).map((_, i) => addDays(weekStart, i)),
    [weekStart],
  );

  const activeHabits = useMemo(
    () => habits.filter((h) => !h.archived && (!selectedCategory || h.category === selectedCategory)),
    [habits, selectedCategory],
  );

  const selectedDayKey = format(startOfDay(selectedDate), 'yyyy-MM-dd');
  const completedForSelectedDay = activeHabits.filter((h) =>
    logs.some((l) => l.habitId === h.id && l.completedDate === selectedDayKey),
  );

  const expectedInRange = useMemo(() => {
    if (viewScope === 'today') {
      return activeHabits.length;
    }

    const rangeDays = viewScope === 'week'
      ? eachDayOfInterval({ start: weekStart, end: weekEnd })
      : eachDayOfInterval({ start: monthStart, end: monthEnd });

    return activeHabits.length * rangeDays.length;
  }, [activeHabits.length, viewScope, weekStart, weekEnd, monthStart, monthEnd]);

  const doneInRange = useMemo(() => {
    if (viewScope === 'today') {
      return completedForSelectedDay.length;
    }

    const dateSet = new Set(
      (viewScope === 'week'
        ? eachDayOfInterval({ start: weekStart, end: weekEnd })
        : eachDayOfInterval({ start: monthStart, end: monthEnd })
      ).map((d) => format(d, 'yyyy-MM-dd')),
    );

    return logs.filter((log) => {
      if (!dateSet.has(log.completedDate)) {
        return false;
      }
      return activeHabits.some((h) => h.id === log.habitId);
    }).length;
  }, [activeHabits, logs, monthEnd, monthStart, viewScope, weekEnd, weekStart, completedForSelectedDay.length]);

  const progress = expectedInRange > 0 ? Math.round((doneInRange / expectedInRange) * 100) : 0;

  const chartData = weekDays.map((day) => {
    const dateStr = format(day, 'yyyy-MM-dd');
    const completedCount = activeHabits.filter((h) =>
      logs.some((l) => l.habitId === h.id && l.completedDate === dateStr),
    ).length;
    return {
      name: format(day, 'EEE').charAt(0),
      value: completedCount,
      fullDate: dateStr,
      isToday: isSameDay(day, today),
    };
  });

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const scopeTitle = viewScope === 'today' ? "Today's Progress" : viewScope === 'week' ? 'This Week Progress' : 'This Month Progress';
  const quote = quotes[new Date().getDate() % quotes.length];
  const canToggleSelectedDate = !isAfter(startOfDay(selectedDate), startOfDay(today));

  return (
    <div className="flex-1 p-6 md:p-10 overflow-y-auto bg-background">
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4">
        <div>
          <h2 className="text-3xl md:text-4xl font-serif font-medium mb-1">
            {userName ? `${getGreeting()}, ${userName}` : 'Welcome back'}
          </h2>
          <p className="text-muted-foreground">{format(new Date(), 'EEEE, MMMM d, yyyy')}</p>
        </div>
        <div className="bg-secondary/50 p-1 rounded-2xl flex gap-1">
          {(['today', 'week', 'month'] as const).map((scope) => (
            <button
              key={scope}
              onClick={() => setViewScope(scope)}
              className={cn(
                'px-5 py-2 rounded-xl text-sm font-medium transition-all duration-200',
                viewScope === scope ? 'bg-primary text-white shadow-soft' : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {scope.charAt(0).toUpperCase() + scope.slice(1)}
            </button>
          ))}
        </div>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 md:gap-8">
        <div className="xl:col-span-8 space-y-8">
          <section className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <h3 className="text-lg font-semibold">{scopeTitle}</h3>
                  <span className="text-primary font-bold">{progress}%</span>
                </div>
                <div className="relative h-4 bg-secondary rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    className={cn('absolute top-0 left-0 h-full', progress === 100 ? 'bg-emerald-500' : 'bg-primary')}
                    transition={{ duration: 0.7, ease: 'easeOut' }}
                  />
                </div>
                {expectedInRange === 0 && <p className="text-sm text-muted-foreground">No habits are due in this range yet.</p>}
              </div>
              <AIInsights />
            </div>

            <div className="grid grid-cols-7 gap-2 md:gap-3">
              {weekDays.map((day) => {
                const isSelected = isSameDay(day, selectedDate);
                const isToday = isSameDay(day, today);
                return (
                  <button
                    key={day.toISOString()}
                    onClick={() => setSelectedDate(day)}
                    className={cn(
                      'flex flex-col items-center gap-1 md:gap-2 p-3 md:p-4 rounded-3xl transition-all duration-300',
                      isSelected
                        ? 'bg-primary text-white shadow-premium scale-[1.03]'
                        : 'bg-secondary/30 text-muted-foreground hover:bg-secondary/60',
                    )}
                  >
                    <span className="text-[10px] font-bold uppercase tracking-widest">{format(day, 'EEE')}</span>
                    <span className="text-lg md:text-xl font-bold">{format(day, 'd')}</span>
                    {isToday && !isSelected && <div className="w-1.5 h-1.5 bg-primary rounded-full" />}
                  </button>
                );
              })}
            </div>
          </section>

          <section className="space-y-6">
            <div className="flex flex-wrap gap-3 justify-between items-center">
              <h3 className="text-2xl font-serif font-medium">Daily Habits</h3>
              <AddHabitModal>
                <Button variant="ghost" className="text-primary hover:text-primary/80 font-medium">
                  <Plus className="w-4 h-4 mr-1" /> Add New
                </Button>
              </AddHabitModal>
            </div>

            {activeHabits.length === 0 && (
              <Card className="rounded-[28px] border-border/60">
                <CardContent className="p-8 text-center space-y-2">
                  <h4 className="text-lg font-semibold">No habits in this view</h4>
                  <p className="text-muted-foreground">Try another category filter or create a new habit to get started.</p>
                </CardContent>
              </Card>
            )}

            <div className="space-y-4">
              {activeHabits.map((habit) => {
                const isCompleted = logs.some(
                  (l) => l.habitId === habit.id && l.completedDate === selectedDayKey,
                );

                return (
                  <motion.div
                    key={habit.id}
                    layout
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn(
                      'group flex items-center gap-4 p-5 rounded-[28px] bg-card border border-border/50 transition-all duration-300 hover:shadow-premium hover:border-primary/20',
                      isCompleted && 'bg-secondary/20',
                    )}
                  >
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-soft"
                      style={{ backgroundColor: `${habit.color}20`, color: habit.color }}
                    >
                      {habit.icon}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-lg">{habit.title}</h4>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground flex-wrap">
                        <span className="flex items-center gap-1">
                          <Flame className="w-3.5 h-3.5 text-orange-500" />
                          {habit.currentStreak} days
                        </span>
                        <span>•</span>
                        <span>{habit.target} {habit.unit}</span>
                        <span>•</span>
                        <span>{habit.category}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => canToggleSelectedDate && toggleHabit(habit.id, selectedDate)}
                      disabled={!canToggleSelectedDate}
                      className={cn(
                        'w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all duration-500 disabled:opacity-40 disabled:cursor-not-allowed',
                        isCompleted
                          ? 'bg-primary border-primary text-white scale-110 shadow-soft'
                          : 'border-border hover:border-primary/50 text-transparent',
                      )}
                    >
                      <Check className={cn('w-6 h-6 transition-transform duration-500', isCompleted ? 'scale-100' : 'scale-0')} />
                    </button>
                  </motion.div>
                );
              })}
            </div>

            {!canToggleSelectedDate && (
              <p className="text-sm text-muted-foreground">Future days are preview-only in this mode.</p>
            )}
          </section>
        </div>

        <div className="xl:col-span-4 space-y-6">
          <Card className="rounded-[28px] border-none shadow-premium overflow-hidden">
            <CardContent className="p-6 space-y-5">
              <div className="flex justify-between items-center">
                <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Weekly Activity</h4>
                <button className="text-xs font-semibold text-primary" onClick={() => onNavigate('statistics')}>Open Stats</button>
              </div>
              <div className="h-44 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#A3A3A3' }} dy={10} />
                    <Tooltip cursor={{ fill: 'transparent' }} />
                    <Bar dataKey="value" radius={[6, 6, 6, 6]} barSize={24}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.isToday ? '#E67E5F' : '#F5F2ED'} className="transition-all duration-300 hover:opacity-80" />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[28px] border-none bg-primary text-white p-6 shadow-premium relative overflow-hidden group">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
            <Quote className="w-9 h-9 mb-5 opacity-50" />
            <p className="text-xl font-serif italic mb-4 leading-relaxed">"{quote}"</p>
            <p className="text-xs font-bold uppercase tracking-widest opacity-70">— Daily Focus</p>
          </Card>

          <Card className="rounded-[28px] border-none shadow-premium p-6">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Categories</h4>
              <button className="text-xs font-semibold text-primary" onClick={() => onNavigate('categories')}>Manage</button>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                className={cn(
                  'px-3 py-2 rounded-xl text-sm font-medium transition-colors',
                  selectedCategory === null ? 'bg-primary text-white' : 'bg-secondary/50 hover:bg-secondary',
                )}
                onClick={() => setSelectedCategory(null)}
              >
                All
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  className={cn(
                    'px-3 py-2 rounded-xl text-sm font-medium transition-colors',
                    selectedCategory === cat.name ? 'bg-primary text-white' : 'bg-secondary/50 hover:bg-secondary',
                  )}
                  onClick={() => setSelectedCategory(cat.name)}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
