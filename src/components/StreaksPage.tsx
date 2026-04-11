import React, { useMemo } from 'react';
import { Award, Flame } from 'lucide-react';
import { useHabitStore } from '@/store';
import { Card, CardContent } from '@/components/ui/card';

const milestones = [3, 7, 14, 30];

export function StreaksPage() {
  const { habits } = useHabitStore();

  const ranked = useMemo(
    () => [...habits].filter((h) => !h.archived).sort((a, b) => b.currentStreak - a.currentStreak),
    [habits],
  );

  const totalMilestones = ranked.reduce(
    (sum, habit) => sum + milestones.filter((m) => habit.currentStreak >= m).length,
    0,
  );

  return (
    <div className="flex-1 p-6 md:p-10 overflow-y-auto bg-background space-y-6">
      <header>
        <h2 className="text-3xl md:text-4xl font-serif font-medium">Streaks & Achievements</h2>
        <p className="text-muted-foreground">Celebrate progress with subtle motivation and clear streak visibility.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="rounded-[24px] border-border/60">
          <CardContent className="p-5">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Active Habits</p>
            <p className="mt-2 text-3xl font-bold">{ranked.length}</p>
          </CardContent>
        </Card>
        <Card className="rounded-[24px] border-border/60">
          <CardContent className="p-5">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Top Streak</p>
            <p className="mt-2 text-3xl font-bold">{ranked[0]?.currentStreak ?? 0} days</p>
          </CardContent>
        </Card>
        <Card className="rounded-[24px] border-border/60">
          <CardContent className="p-5">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Milestones Unlocked</p>
            <p className="mt-2 text-3xl font-bold">{totalMilestones}</p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-3">
        {ranked.map((habit) => (
          <Card key={habit.id} className="rounded-[24px] border-border/60">
            <CardContent className="p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl" style={{ backgroundColor: `${habit.color}20`, color: habit.color }}>
                  {habit.icon}
                </div>
                <div>
                  <h3 className="font-semibold">{habit.title}</h3>
                  <p className="text-sm text-muted-foreground">Longest streak: {habit.longestStreak} days</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-primary font-semibold">
                <Flame className="w-4 h-4" /> {habit.currentStreak} days
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Award className="w-4 h-4" />
                {milestones.filter((m) => habit.currentStreak >= m).length} milestones
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
