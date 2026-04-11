import React, { useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import { useHabitStore } from '@/store';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function CategoriesPage() {
  const { categories, habits, logs, addCategory } = useHabitStore();
  const [name, setName] = useState('');
  const [color, setColor] = useState('#E67E5F');

  const categoryStats = useMemo(
    () =>
      categories.map((cat) => {
        const inCategory = habits.filter((h) => h.category === cat.name && !h.archived);
        const totalCompletions = inCategory.reduce(
          (sum, habit) => sum + logs.filter((l) => l.habitId === habit.id).length,
          0,
        );

        return {
          ...cat,
          habitsCount: inCategory.length,
          totalCompletions,
        };
      }),
    [categories, habits, logs],
  );

  const createCategory = () => {
    if (!name.trim()) {
      return;
    }

    addCategory({
      id: Math.random().toString(36).slice(2),
      name: name.trim(),
      color,
    });
    setName('');
    setColor('#E67E5F');
  };

  return (
    <div className="flex-1 p-6 md:p-10 overflow-y-auto bg-background space-y-6">
      <header>
        <h2 className="text-3xl md:text-4xl font-serif font-medium">Categories</h2>
        <p className="text-muted-foreground">Organize habits by focus area and monitor category-level momentum.</p>
      </header>

      <Card className="rounded-[28px] border-border/60">
        <CardContent className="p-5 md:p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="New category name" className="md:col-span-2 rounded-xl" />
            <Input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="h-10 rounded-xl p-1" />
            <Button className="rounded-xl" onClick={createCategory}>
              <Plus className="w-4 h-4 mr-2" /> Add Category
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {categoryStats.map((cat) => (
          <Card key={cat.id} className="rounded-[24px] border-border/60">
            <CardContent className="p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg">{cat.name}</h3>
                <span className="w-4 h-4 rounded-full" style={{ backgroundColor: cat.color }} />
              </div>
              <p className="text-sm text-muted-foreground">{cat.habitsCount} active habits</p>
              <p className="text-sm text-muted-foreground">{cat.totalCompletions} total completions logged</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
