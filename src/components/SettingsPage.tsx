import React from 'react';
import { useHabitStore } from '@/store';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export function SettingsPage() {
  const {
    userName,
    setUserName,
    theme,
    setTheme,
    timezone,
    setTimezone,
    notificationsEnabled,
    setNotificationsEnabled,
    aiInsightsEnabled,
    setAiInsightsEnabled,
    reminderWindow,
    setReminderWindow,
  } = useHabitStore();

  return (
    <div className="flex-1 p-6 md:p-10 overflow-y-auto bg-background space-y-6">
      <header>
        <h2 className="text-3xl md:text-4xl font-serif font-medium">Settings</h2>
        <p className="text-muted-foreground">Personalize your workflow, reminders, theme, and AI guidance style.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="rounded-[24px] border-border/60">
          <CardContent className="p-6 space-y-4">
            <h3 className="font-semibold">Profile</h3>
            <div className="space-y-2">
              <Label htmlFor="name">Display Name</Label>
              <Input id="name" value={userName} onChange={(e) => setUserName(e.target.value)} className="rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="timezone">Timezone</Label>
              <Input id="timezone" value={timezone} onChange={(e) => setTimezone(e.target.value)} className="rounded-xl" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[24px] border-border/60">
          <CardContent className="p-6 space-y-4">
            <h3 className="font-semibold">Appearance & Intelligence</h3>
            <div className="flex items-center justify-between">
              <span className="text-sm">Dark mode</span>
              <Switch checked={theme === 'dark'} onCheckedChange={(v) => setTheme(v ? 'dark' : 'light')} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">AI insights</span>
              <Switch checked={aiInsightsEnabled} onCheckedChange={setAiInsightsEnabled} />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[24px] border-border/60 lg:col-span-2">
          <CardContent className="p-6 space-y-4">
            <h3 className="font-semibold">Reminders</h3>
            <div className="flex items-center justify-between">
              <span className="text-sm">Enable reminders</span>
              <Switch checked={notificationsEnabled} onCheckedChange={setNotificationsEnabled} />
            </div>
            <div className="space-y-2 max-w-sm">
              <Label>Preferred Reminder Window</Label>
              <Select value={reminderWindow} onValueChange={(value: 'morning' | 'afternoon' | 'evening' | 'custom') => setReminderWindow(value)}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="morning">Morning</SelectItem>
                  <SelectItem value="afternoon">Afternoon</SelectItem>
                  <SelectItem value="evening">Evening</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
