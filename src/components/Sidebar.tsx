import React from 'react';
import { LayoutDashboard, BarChart3, ListTodo, Layers, Flame, Settings, Moon, Sun } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useHabitStore } from '@/store';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'statistics', label: 'Statistics', icon: BarChart3 },
  { id: 'habits', label: 'Habits', icon: ListTodo },
  { id: 'categories', label: 'Categories', icon: Layers },
  { id: 'streak', label: 'Streak', icon: Flame },
];

export function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  const { theme, setTheme, userName } = useHabitStore();

  return (
    <aside className="w-64 h-screen flex flex-col border-r border-border bg-background/50 backdrop-blur-sm sticky top-0">
      <div className="p-8 flex items-center gap-3">
        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
          <Flame className="text-white w-5 h-5" />
        </div>
        <h1 className="text-xl font-semibold tracking-tight">Pure Habit</h1>
      </div>

      <nav className="flex-1 px-4 space-y-2 mt-4">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
              activeTab === item.id
                ? "bg-secondary text-foreground font-medium shadow-soft"
                : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
            )}
          >
            <item.icon className={cn(
              "w-5 h-5 transition-colors",
              activeTab === item.id ? "text-primary" : "group-hover:text-primary"
            )} />
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 rounded-2xl">
          <div className="flex items-center gap-2">
            {theme === 'dark' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            <span className="text-sm font-medium">Dark Mode</span>
          </div>
          <Switch 
            checked={theme === 'dark'} 
            onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
          />
        </div>

        <div className="flex items-center gap-3 p-3 rounded-2xl hover:bg-secondary/50 transition-colors cursor-pointer group">
          <Avatar className="w-10 h-10 border-2 border-primary/20">
            <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=Alex" />
            <AvatarFallback>AM</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate">{userName} Morgan</p>
            <p className="text-xs text-muted-foreground truncate">Pro Member</p>
          </div>
          <Settings className="w-4 h-4 text-muted-foreground group-hover:rotate-90 transition-transform duration-300" />
        </div>
      </div>
    </aside>
  );
}
