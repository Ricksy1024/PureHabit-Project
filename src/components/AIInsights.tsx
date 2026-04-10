import React, { useEffect, useState } from 'react';
import { useHabitStore } from '@/store';
import { getHabitInsights } from '@/services/geminiService';
import { Sparkles, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function AIInsights() {
  const { habits, logs, userName } = useHabitStore();
  const [insight, setInsight] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchInsight = async () => {
    setLoading(true);
    const newInsight = await getHabitInsights(habits, logs, userName);
    setInsight(newInsight);
    setLoading(false);
  };

  useEffect(() => {
    fetchInsight();
  }, []);

  return (
    <div className="bg-secondary/30 rounded-[32px] p-6 border border-border/50 relative overflow-hidden group">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-4 h-4 text-primary" />
        <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">AI Insight</h4>
        <button 
          onClick={fetchInsight}
          disabled={loading}
          className="ml-auto p-1 hover:bg-secondary rounded-full transition-colors disabled:opacity-50"
        >
          <RefreshCw className={cn("w-3 h-3 text-muted-foreground", loading && "animate-spin")} />
        </button>
      </div>
      
      <AnimatePresence mode="wait">
        <motion.p
          key={insight}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="text-sm leading-relaxed text-foreground/80 italic"
        >
          {loading ? "Analyzing your patterns..." : insight}
        </motion.p>
      </AnimatePresence>
    </div>
  );
}
