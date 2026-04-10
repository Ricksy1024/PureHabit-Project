import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { HabitsPage } from './components/HabitsPage';
import { useHabitStore } from './store';
import { TooltipProvider } from '@/components/ui/tooltip';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { theme } = useHabitStore();

  return (
    <TooltipProvider>
      <div className={`flex min-h-screen ${theme === 'dark' ? 'dark bg-zinc-950 text-zinc-50' : 'bg-background text-foreground'}`}>
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        <main className="flex-1 flex flex-col">
          {activeTab === 'dashboard' && <Dashboard />}
          {activeTab === 'habits' && <HabitsPage />}
          {activeTab !== 'dashboard' && activeTab !== 'habits' && (
            <div className="flex-1 flex items-center justify-center p-10">
              <div className="text-center space-y-4">
                <h2 className="text-3xl font-serif font-medium capitalize">{activeTab}</h2>
                <p className="text-muted-foreground">This section is coming soon. Stay tuned!</p>
              </div>
            </div>
          )}
        </main>
      </div>
    </TooltipProvider>
  );
}
