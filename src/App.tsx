import React, { useEffect, useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { HabitsPage } from './components/HabitsPage';
import { StatisticsPage } from './components/StatisticsPage';
import { CalendarPage } from './components/CalendarPage';
import { CategoriesPage } from './components/CategoriesPage';
import { StreaksPage } from './components/StreaksPage';
import { SettingsPage } from './components/SettingsPage';
import { useHabitStore } from './store';
import { TooltipProvider } from '@/components/ui/tooltip';
import { BarChart3, Calendar, LayoutDashboard, ListTodo, Settings } from 'lucide-react';

type AppTab = 'dashboard' | 'calendar' | 'statistics' | 'habits' | 'categories' | 'streaks' | 'settings';

const mobileTabs: Array<{ id: AppTab; label: string; icon: React.ComponentType<{ className?: string }> }> = [
  { id: 'dashboard', label: 'Today', icon: LayoutDashboard },
  { id: 'calendar', label: 'Calendar', icon: Calendar },
  { id: 'statistics', label: 'Stats', icon: BarChart3 },
  { id: 'habits', label: 'Habits', icon: ListTodo },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<AppTab>('dashboard');
  const { theme } = useHabitStore();

  useEffect(() => {
    const savedTab = localStorage.getItem('pure-habit-active-tab') as AppTab | null;
    if (savedTab) {
      setActiveTab(savedTab);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('pure-habit-active-tab', activeTab);
  }, [activeTab]);

  const renderTab = () => {
    if (activeTab === 'dashboard') return <Dashboard onNavigate={setActiveTab} />;
    if (activeTab === 'calendar') return <CalendarPage />;
    if (activeTab === 'statistics') return <StatisticsPage />;
    if (activeTab === 'habits') return <HabitsPage />;
    if (activeTab === 'categories') return <CategoriesPage />;
    if (activeTab === 'streaks') return <StreaksPage />;
    return <SettingsPage />;
  };

  return (
    <TooltipProvider>
      <div className={theme === 'dark' ? 'dark' : ''}>
        <div className="flex min-h-screen bg-background text-foreground">
          <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} onOpenSettings={() => setActiveTab('settings')} />
          <main className="flex-1 flex flex-col pb-24 md:pb-0">{renderTab()}</main>
        </div>

        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-background/95 backdrop-blur-xl">
          <div className="grid grid-cols-5">
            {mobileTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-3 px-1 flex flex-col items-center gap-1 text-[11px] font-medium transition-colors ${
                  activeTab === tab.id ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </nav>
      </div>
    </TooltipProvider>
  );
}
