import React, { useMemo } from 'react';
import { addDays, format, startOfWeek } from 'date-fns';
import { BarChart, Bar, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, PieChart, Pie, Cell } from 'recharts';
import { useHabitStore } from '@/store';
import { Card, CardContent } from '@/components/ui/card';

export function StatisticsPage() {
  const { habits, logs, categories } = useHabitStore();

  const weekDays = useMemo(() => {
    const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
    return Array.from({ length: 7 }).map((_, i) => addDays(weekStart, i));
  }, []);

  const weeklyData = useMemo(
    () =>
      weekDays.map((day) => {
        const key = format(day, 'yyyy-MM-dd');
        const due = habits.filter((h) => !h.archived).length;
        const done = habits.filter((h) => logs.some((l) => l.habitId === h.id && l.completedDate === key)).length;
        return {
          day: format(day, 'EEE'),
          completed: done,
          rate: due ? Math.round((done / due) * 100) : 0,
        };
      }),
    [weekDays, habits, logs],
  );

  const categoryData = useMemo(
    () =>
      categories.map((cat) => {
        const members = habits.filter((h) => h.category === cat.name && !h.archived);
        return {
          name: cat.name,
          value: members.reduce((sum, habit) => sum + logs.filter((l) => l.habitId === habit.id).length, 0),
          color: cat.color,
        };
      }),
    [categories, habits, logs],
  );

  const totalDueThisWeek = habits.filter((h) => !h.archived).length * 7;
  const totalDoneThisWeek = weeklyData.reduce((sum, d) => sum + d.completed, 0);
  const weekRate = totalDueThisWeek ? Math.round((totalDoneThisWeek / totalDueThisWeek) * 100) : 0;

  const topHabit = useMemo(() => {
    return habits
      .filter((h) => !h.archived)
      .map((habit) => ({
        ...habit,
        completions: logs.filter((l) => l.habitId === habit.id).length,
      }))
      .sort((a, b) => b.completions - a.completions)[0];
  }, [habits, logs]);

  return (
    <div className="flex-1 p-6 md:p-10 overflow-y-auto bg-background space-y-6">
      <header>
        <h2 className="text-3xl md:text-4xl font-serif font-medium">Statistics</h2>
        <p className="text-muted-foreground">Deeper insight into completion trends, category balance, and consistency.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="rounded-[24px] border-border/60"><CardContent className="p-5"><p className="text-xs uppercase tracking-widest text-muted-foreground">Weekly Completion</p><p className="text-3xl font-bold mt-2">{weekRate}%</p></CardContent></Card>
        <Card className="rounded-[24px] border-border/60"><CardContent className="p-5"><p className="text-xs uppercase tracking-widest text-muted-foreground">Total Check-ins</p><p className="text-3xl font-bold mt-2">{logs.length}</p></CardContent></Card>
        <Card className="rounded-[24px] border-border/60"><CardContent className="p-5"><p className="text-xs uppercase tracking-widest text-muted-foreground">Most Consistent Habit</p><p className="text-xl font-semibold mt-2 truncate">{topHabit?.title ?? 'No data yet'}</p></CardContent></Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <Card className="rounded-[24px] border-border/60">
          <CardContent className="p-5 md:p-6">
            <h3 className="font-semibold mb-4">Daily Completion (Current Week)</h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="completed" fill="#E67E5F" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[24px] border-border/60">
          <CardContent className="p-5 md:p-6">
            <h3 className="font-semibold mb-4">Category Distribution</h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={categoryData} dataKey="value" nameKey="name" outerRadius={110} innerRadius={58}>
                    {categoryData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
