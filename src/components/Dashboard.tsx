import React, { useState } from 'react';
import { format, addDays, startOfWeek, isSameDay, startOfDay } from 'date-fns';
import { Plus, Check, Flame, Quote, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { useHabitStore } from '@/store';
import { BarChart, Bar, ResponsiveContainer, XAxis, Tooltip, Cell } from 'recharts';
import { AddHabitModal } from './AddHabitModal';
import { AIInsights } from './AIInsights';

export function Dashboard() {
  const { habits, logs, toggleHabit, userName, categories } = useHabitStore();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewScope, setViewScope] = useState<'today' | 'week' | 'month'>('today');

  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }).map((_, i) => addDays(weekStart, i));

  const habitsDueToday = habits.filter(h => !h.archived); // Simplified: all active habits for now
  const completedToday = habitsDueToday.filter(h => 
    logs.some(l => l.habitId === h.id && l.completedDate === format(startOfDay(selectedDate), 'yyyy-MM-dd'))
  );
  
  const progress = habitsDueToday.length > 0 
    ? Math.round((completedToday.length / habitsDueToday.length) * 100) 
    : 0;

  const chartData = weekDays.map(day => {
    const dateStr = format(day, 'yyyy-MM-dd');
    const completedCount = habits.filter(h => 
      logs.some(l => l.habitId === h.id && l.completedDate === dateStr)
    ).length;
    return {
      name: format(day, 'E').charAt(0),
      value: completedCount,
      fullDate: dateStr,
      isToday: isSameDay(day, new Date())
    };
  });

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <div className="flex-1 p-10 overflow-y-auto bg-background">
      <header className="flex justify-between items-start mb-10">
        <div>
          <h2 className="text-4xl font-serif font-medium mb-1">{getGreeting()}, {userName}</h2>
          <p className="text-muted-foreground">{format(new Date(), 'EEEE, MMMM d, yyyy')}</p>
        </div>
        <div className="bg-secondary/50 p-1 rounded-2xl flex gap-1">
          {(['today', 'week', 'month'] as const).map((scope) => (
            <button
              key={scope}
              onClick={() => setViewScope(scope)}
              className={cn(
                "px-6 py-2 rounded-xl text-sm font-medium transition-all duration-200",
                viewScope === scope 
                  ? "bg-primary text-white shadow-soft" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {scope.charAt(0).toUpperCase() + scope.slice(1)}
            </button>
          ))}
        </div>
      </header>

      <div className="grid grid-cols-12 gap-8">
        <div className="col-span-8 space-y-10">
          {/* Progress Section */}
          <section className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              <div className="space-y-6">
                <div className="flex justify-between items-end">
                  <h3 className="text-lg font-semibold">Today's Progress</h3>
                  <span className="text-primary font-bold">{progress}%</span>
                </div>
                <div className="relative h-4 bg-secondary rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    className="absolute top-0 left-0 h-full bg-primary"
                    transition={{ duration: 1, ease: "easeOut" }}
                  />
                </div>
              </div>
              <AIInsights />
            </div>

            <div className="grid grid-cols-7 gap-4">
              {weekDays.map((day) => {
                const isSelected = isSameDay(day, selectedDate);
                const isToday = isSameDay(day, new Date());
                return (
                  <button
                    key={day.toISOString()}
                    onClick={() => setSelectedDate(day)}
                    className={cn(
                      "flex flex-col items-center gap-2 p-4 rounded-3xl transition-all duration-300",
                      isSelected 
                        ? "bg-primary text-white shadow-premium scale-105" 
                        : "bg-secondary/30 text-muted-foreground hover:bg-secondary/60"
                    )}
                  >
                    <span className="text-[10px] font-bold uppercase tracking-widest">{format(day, 'EEE')}</span>
                    <span className="text-xl font-bold">{format(day, 'd')}</span>
                    {isToday && !isSelected && <div className="w-1.5 h-1.5 bg-primary rounded-full" />}
                  </button>
                );
              })}
            </div>
          </section>

          {/* Habits Section */}
          <section className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-2xl font-serif font-medium">Daily Habits</h3>
              <AddHabitModal>
                <Button variant="ghost" className="text-primary hover:text-primary/80 font-medium">
                  <Plus className="w-4 h-4 mr-1" /> Add New
                </Button>
              </AddHabitModal>
            </div>

            <div className="space-y-4">
              {habitsDueToday.map((habit) => {
                const isCompleted = logs.some(
                  l => l.habitId === habit.id && l.completedDate === format(startOfDay(selectedDate), 'yyyy-MM-dd')
                );
                return (
                  <motion.div
                    key={habit.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn(
                      "group flex items-center gap-4 p-5 rounded-[32px] bg-card border border-border/50 transition-all duration-300 hover:shadow-premium hover:border-primary/20",
                      isCompleted && "bg-secondary/20"
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
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Flame className="w-3.5 h-3.5 text-orange-500" />
                          {habit.currentStreak} days
                        </span>
                        <span>•</span>
                        <span>{habit.target} {habit.unit}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => toggleHabit(habit.id, selectedDate)}
                      className={cn(
                        "w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all duration-500",
                        isCompleted 
                          ? "bg-primary border-primary text-white scale-110 shadow-soft" 
                          : "border-border hover:border-primary/50 text-transparent"
                      )}
                    >
                      <Check className={cn("w-6 h-6 transition-transform duration-500", isCompleted ? "scale-100" : "scale-0")} />
                    </button>
                  </motion.div>
                );
              })}
            </div>
          </section>
        </div>

        <div className="col-span-4 space-y-8">
          {/* Activity Chart */}
          <Card className="rounded-[32px] border-none shadow-premium overflow-hidden">
            <CardContent className="p-8 space-y-6">
              <div className="flex justify-between items-center">
                <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Activity Bar Chart</h4>
              </div>
              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 12, fill: '#A3A3A3' }}
                      dy={10}
                    />
                    <Tooltip 
                      cursor={{ fill: 'transparent' }}
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-foreground text-background px-3 py-1.5 rounded-lg text-xs font-bold">
                              {payload[0].value} habits
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar dataKey="value" radius={[6, 6, 6, 6]} barSize={24}>
                      {chartData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.isToday ? '#E67E5F' : '#F5F2ED'} 
                          className="transition-all duration-300 hover:opacity-80"
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <p className="text-center text-sm text-muted-foreground">
                Your productivity is up <span className="text-green-500 font-bold">14%</span> this week
              </p>
            </CardContent>
          </Card>

          {/* Quote Card */}
          <Card className="rounded-[32px] border-none bg-primary text-white p-8 shadow-premium relative overflow-hidden group">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
            <Quote className="w-10 h-10 mb-6 opacity-50" />
            <p className="text-2xl font-serif italic mb-6 leading-relaxed">
              "Simplicity is the ultimate sophistication."
            </p>
            <p className="text-xs font-bold uppercase tracking-widest opacity-70">— Leonardo Da Vinci</p>
          </Card>

          {/* Categories */}
          <Card className="rounded-[32px] border-none shadow-premium p-8">
            <div className="flex justify-between items-center mb-6">
              <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Categories</h4>
            </div>
            <div className="flex flex-wrap gap-2">
              {categories.map(cat => (
                <button
                  key={cat.id}
                  className="px-4 py-2 rounded-xl bg-secondary/50 text-sm font-medium hover:bg-secondary transition-colors"
                >
                  {cat.name}
                </button>
              ))}
              <button className="px-4 py-2 rounded-xl text-primary text-sm font-medium hover:bg-primary/10 transition-colors">
                + Explore
              </button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
