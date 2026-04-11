import React, { useMemo, useState } from 'react';
import {
  addDays,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  startOfMonth,
  startOfWeek,
  subMonths,
  addMonths,
} from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useHabitStore } from '@/store';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export function CalendarPage() {
  const { habits, logs } = useHabitStore();
  const [month, setMonth] = useState(new Date());

  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(month);
    const monthEnd = endOfMonth(month);
    const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 });
    const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

    const days: Date[] = [];
    let cursor = gridStart;
    while (cursor <= gridEnd) {
      days.push(cursor);
      cursor = addDays(cursor, 1);
    }
    return days;
  }, [month]);

  const getCompletionRate = (day: Date) => {
    const dateKey = format(day, 'yyyy-MM-dd');
    const due = habits.filter((h) => !h.archived).length;
    if (!due) {
      return 0;
    }
    const done = habits.filter((h) => logs.some((l) => l.habitId === h.id && l.completedDate === dateKey)).length;
    return Math.round((done / due) * 100);
  };

  const intensityClass = (rate: number) => {
    if (rate === 0) return 'bg-secondary/50';
    if (rate < 35) return 'bg-primary/25';
    if (rate < 70) return 'bg-primary/55';
    return 'bg-primary';
  };

  return (
    <div className="flex-1 p-6 md:p-10 overflow-y-auto bg-background space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl md:text-4xl font-serif font-medium">Calendar Heatmap</h2>
          <p className="text-muted-foreground">Track your consistency and review historical completion intensity.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" className="rounded-xl" onClick={() => setMonth(subMonths(month, 1))}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <div className="px-4 py-2 rounded-xl bg-secondary/40 text-sm font-semibold min-w-44 text-center">
            {format(month, 'MMMM yyyy')}
          </div>
          <Button variant="outline" size="icon" className="rounded-xl" onClick={() => setMonth(addMonths(month, 1))}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </header>

      <Card className="rounded-[28px] border-border/60">
        <CardContent className="p-5 md:p-8 space-y-4">
          <div className="grid grid-cols-7 gap-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((label) => (
              <div key={label} className="text-center">{label}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2">
            {calendarDays.map((day) => {
              const rate = getCompletionRate(day);
              const isCurrentMonth = isSameMonth(day, month);
              return (
                <div
                  key={day.toISOString()}
                  title={`${format(day, 'PPP')} - ${rate}% completed`}
                  className={cn(
                    'aspect-square rounded-xl p-2 flex flex-col justify-between transition-transform hover:scale-[1.03]',
                    intensityClass(rate),
                    !isCurrentMonth && 'opacity-35',
                  )}
                >
                  <span className="text-[11px] font-bold text-foreground/80">{format(day, 'd')}</span>
                  <span className="text-[10px] font-medium text-foreground/70">{rate}%</span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
