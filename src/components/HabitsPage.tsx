import React, { useState } from 'react';
import { useHabitStore } from '@/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Search, Filter, MoreVertical, Edit2, Archive, Trash2, Flame } from 'lucide-react';
import { AddHabitModal } from './AddHabitModal';
import { cn } from '@/lib/utils';
import { motion } from 'motion/react';

export function HabitsPage() {
  const { habits, deleteHabit, updateHabit } = useHabitStore();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredHabits = habits.filter(h => 
    h.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex-1 p-10 overflow-y-auto bg-background">
      <header className="flex justify-between items-center mb-10">
        <div>
          <h2 className="text-4xl font-serif font-medium mb-1">My Habits</h2>
          <p className="text-muted-foreground">Manage and track your routines</p>
        </div>
        <AddHabitModal>
          <Button className="rounded-xl px-6 py-6 text-lg font-medium shadow-premium">
            <Plus className="w-5 h-5 mr-2" /> Create Habit
          </Button>
        </AddHabitModal>
      </header>

      <div className="flex gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Search habits..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-2xl bg-secondary/30 border-none focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>
        <Button variant="outline" className="rounded-2xl px-6 h-auto">
          <Filter className="w-5 h-5 mr-2" /> Filter
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredHabits.map((habit) => (
          <motion.div
            key={habit.id}
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Card className="rounded-[32px] border-none shadow-soft hover:shadow-premium transition-all duration-300 group overflow-hidden">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <div 
                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-soft"
                    style={{ backgroundColor: `${habit.color}20`, color: habit.color }}
                  >
                    {habit.icon}
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" className="rounded-full w-8 h-8">
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="rounded-full w-8 h-8 text-destructive hover:text-destructive"
                      onClick={() => deleteHabit(habit.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                <h3 className="text-xl font-semibold mb-2">{habit.title}</h3>
                <div className="flex items-center gap-2 mb-6">
                  <span className="px-3 py-1 rounded-full bg-secondary text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    {habit.category}
                  </span>
                  <span className="px-3 py-1 rounded-full bg-secondary text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    {habit.frequency}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border/50">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Current Streak</p>
                    <div className="flex items-center gap-1.5">
                      <Flame className="w-4 h-4 text-orange-500" />
                      <span className="font-bold">{habit.currentStreak} days</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Best Streak</p>
                    <div className="flex items-center gap-1.5">
                      <Flame className="w-4 h-4 text-primary" />
                      <span className="font-bold">{habit.longestStreak} days</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
