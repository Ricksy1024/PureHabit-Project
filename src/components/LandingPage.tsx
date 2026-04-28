import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Sparkles, CheckCircle, BarChart3, Target, Flame, TrendingUp, Users } from 'lucide-react';
import { ShaderBackground } from './ShaderBackground';

interface LandingPageProps {
  isDarkMode: boolean;
  onLoginClick: () => void;
  onGetStarted: () => void;
}

export function LandingPage({ isDarkMode, onLoginClick, onGetStarted }: LandingPageProps) {
  const [scrollProgress, setScrollProgress] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = (e: Event) => {
      const container = e.target as HTMLDivElement;
      const scrollHeight = container.scrollHeight - container.clientHeight;
      const scrolled = container.scrollTop / scrollHeight;
      setScrollProgress(scrolled);
    };

    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, []);

  return (
    <ShaderBackground isDarkMode={isDarkMode}>
      <div className="min-h-screen w-full flex flex-row relative">
        {/* Header - csak a jobb oldalon */}
        <motion.header 
          className={`absolute top-0 right-0 left-1/2 z-50 backdrop-blur-md border-b transition-colors duration-500 ${isDarkMode ? 'bg-black/20 border-[#4A2C24]/30' : 'bg-white/10 border-[#EADCCF]/20'}`}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
            <motion.div 
              className={`flex items-center gap-2 transition-colors duration-500 ${isDarkMode ? 'text-[#FDF8F3]' : 'text-[#2A2421]'}`}
              whileHover={{ scale: 1.05 }}
            >
              <Sparkles className="w-6 h-6" />
              <span className="font-serif text-2xl font-semibold">PureHabit</span>
            </motion.div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onLoginClick}
              className={`px-6 py-2.5 rounded-full font-medium text-sm transition-all duration-300 ${isDarkMode ? 'bg-[#D0705B] text-white hover:bg-[#E89078] shadow-lg hover:shadow-[0_8px_24px_rgba(208,112,91,0.3)]' : 'bg-[#D0705B] text-white hover:bg-[#E89078] shadow-lg hover:shadow-[0_8px_24px_rgba(208,112,91,0.3)]'}`}
            >
              Sign In
            </motion.button>
          </div>
        </motion.header>

        {/* Left Side - Fixed */}
        <motion.div 
          className="w-1/2 fixed left-0 top-0 h-screen flex flex-col justify-center px-12 py-16 z-10"
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          <div className="max-w-md">
            <motion.h1 
              className={`font-serif text-5xl font-semibold leading-tight mb-6 transition-colors duration-500 ${isDarkMode ? 'text-[#FDF8F3]' : 'text-[#2A2421]'}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              Build Better Habits, <span className="text-[#D0705B]">Transform Your Life</span>
            </motion.h1>
            
            <motion.p 
              className={`text-lg mb-8 leading-relaxed transition-colors duration-500 ${isDarkMode ? 'text-[#A58876]' : 'text-[#2A2421]/70'}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              Track daily habits with beautiful simplicity. Visualize your progress, maintain streaks, and celebrate victories along the way.
            </motion.p>

            <motion.button
              whileHover={{ scale: 1.05, x: 10 }}
              whileTap={{ scale: 0.95 }}
              onClick={onGetStarted}
              className="group px-8 py-4 rounded-full bg-[#D0705B] text-white font-medium text-lg flex items-center gap-3 hover:shadow-[0_12px_32px_rgba(208,112,91,0.4)] transition-all duration-300 mb-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              Get Started
              <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
            </motion.button>

            {/* Feature Highlights */}
            <motion.div 
              className="space-y-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              {[
                { icon: CheckCircle, text: 'Track unlimited habits' },
                { icon: TrendingUp, text: 'Visual progress tracking' },
                { icon: Flame, text: 'Maintain your streaks' }
              ].map((feature, i) => (
                <motion.div 
                  key={i}
                  className="flex items-center gap-3"
                  whileHover={{ x: 5 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <feature.icon className="w-5 h-5 text-[#D0705B] flex-shrink-0" />
                  <span className={`text-sm transition-colors duration-500 ${isDarkMode ? 'text-[#FDF8F3]' : 'text-[#2A2421]'}`}>
                    {feature.text}
                  </span>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.div>

        {/* Right Side - Scrollable */}
        <motion.div 
          ref={scrollContainerRef}
          className="w-1/2 ml-auto h-screen overflow-y-auto scroll-smooth relative z-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          {/* Header spacing */}
          <div className="h-24" />

          {/* Dashboard Preview */}
          <motion.div 
            className="min-h-screen flex items-center justify-center py-16 px-12 relative overflow-hidden"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <motion.div
              className={`relative w-full max-w-sm aspect-square rounded-3xl backdrop-blur-md border soft-shadow overflow-hidden transition-colors duration-500 ${isDarkMode ? 'bg-[#2A2421]/60 border-[#4A2C24]/30' : 'bg-[#FAF5F0]/60 border-[#E8DCD1]/50'}`}
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
              {/* Dashboard Preview */}
              <div className={`w-full h-full p-6 flex flex-col justify-between transition-colors duration-500 ${isDarkMode ? 'bg-gradient-to-br from-[#2A2421]/80 to-[#1A1514]/80' : 'bg-gradient-to-br from-[#FAF5F0]/80 to-[#F5EDEA]/80'}`}>
                {/* Header */}
                <div>
                  <motion.p 
                    className={`text-xs font-bold tracking-widest mb-2 transition-colors duration-500 ${isDarkMode ? 'text-[#A58876]' : 'text-[#8A7E7A]'}`}
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 3, repeat: Infinity }}
                  >
                    TODAY'S PROGRESS
                  </motion.p>
                  <div className={`w-full h-2 rounded-full overflow-hidden inner-shadow transition-colors duration-500 ${isDarkMode ? 'bg-black/30' : 'bg-white/50'}`}>
                    <motion.div 
                      className="h-full bg-[#D0705B] rounded-full"
                      animate={{ width: ['20%', '75%', '50%', '75%', '20%'] }}
                      transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                    />
                  </div>
                </div>

                {/* Habits Preview */}
                <div className="space-y-3">
                  {[
                    { name: 'Morning Exercise', color: '#D0705B', done: true },
                    { name: 'Read 30 mins', color: '#D0705B', done: false },
                    { name: 'Meditation', color: '#D0705B', done: true }
                  ].map((habit, i) => (
                    <motion.div 
                      key={i}
                      className={`flex items-center gap-2 p-2 rounded-lg transition-colors duration-500 ${isDarkMode ? 'bg-[#4A2C24]/40' : 'bg-[#E8DCD1]/30'}`}
                      whileHover={{ x: 5 }}
                    >
                      <div className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${habit.done ? 'bg-[#D0705B] border-[#D0705B]' : (isDarkMode ? 'border-[#A58876]/30' : 'border-[#8A7E7A]/30')}`}>
                        {habit.done && <CheckCircle className="w-3 h-3 text-white" />}
                      </div>
                      <span className={`text-xs flex-1 transition-colors ${habit.done ? (isDarkMode ? 'text-[#A58876] line-through' : 'text-[#8A7E7A] line-through') : (isDarkMode ? 'text-[#FDF8F3]' : 'text-[#2A2421]')}`}>
                        {habit.name}
                      </span>
                      <Flame className="w-3 h-3 text-[#D0705B] flex-shrink-0" />
                    </motion.div>
                  ))}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: 'Streak', value: '12' },
                    { label: 'This week', value: '6/7' },
                    { label: 'Total', value: '245' }
                  ].map((stat, i) => (
                    <div 
                      key={i}
                      className={`text-center p-2 rounded-lg transition-colors duration-500 ${isDarkMode ? 'bg-[#4A2C24]/40' : 'bg-[#E8DCD1]/30'}`}
                    >
                      <p className={`text-xs transition-colors duration-500 ${isDarkMode ? 'text-[#A58876]' : 'text-[#8A7E7A]'}`}>
                        {stat.label}
                      </p>
                      <p className={`text-sm font-bold transition-colors duration-500 ${isDarkMode ? 'text-[#FDF8F3]' : 'text-[#2A2421]'}`}>
                        {stat.value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Features Sections */}
          {/* Feature 1: Dashboard */}
          <FeatureSection 
            number={1}
            title="Beautiful Dashboard"
            description="Get an at-a-glance overview of all your habits. Track daily progress with visual indicators and clear metrics."
            isDarkMode={isDarkMode}
            imagePosition="left"
            imageContent={<DashboardPreview isDarkMode={isDarkMode} />}
          />

          {/* Feature 2: Progress Tracking */}
          <FeatureSection 
            number={2}
            title="Track Your Progress"
            description="Visualize your habit performance over time. Weekly, monthly views and detailed statistics show your journey."
            isDarkMode={isDarkMode}
            imagePosition="right"
            imageContent={<ProgressPreview isDarkMode={isDarkMode} />}
          />

          {/* Feature 3: Streaks */}
          <FeatureSection 
            number={3}
            title="Build Consistent Streaks"
            description="Maintain your motivation with streak tracking. See your consistency grow and stay accountable to your goals."
            isDarkMode={isDarkMode}
            imagePosition="left"
            imageContent={<StreakPreview isDarkMode={isDarkMode} />}
          />

          {/* Feature 4: Categories */}
          <FeatureSection 
            number={4}
            title="Organize by Categories"
            description="Group habits by Health, Mindset, Learning, and more. Stay organized and focus on what matters."
            isDarkMode={isDarkMode}
            imagePosition="right"
            imageContent={<CategoriesPreview isDarkMode={isDarkMode} />}
          />

          {/* CTA Section */}
          <motion.div 
            className="min-h-screen flex flex-col items-center justify-center px-12 text-center relative z-10"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "-100px" }}
          >
            <motion.h2 
              className={`font-serif text-5xl font-semibold mb-6 transition-colors duration-500 ${isDarkMode ? 'text-[#FDF8F3]' : 'text-[#2A2421]'}`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              Ready to Transform Your Habits?
            </motion.h2>
            <motion.p 
              className={`text-xl mb-12 max-w-2xl transition-colors duration-500 ${isDarkMode ? 'text-[#A58876]' : 'text-[#2A2421]/70'}`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              Join thousands of users building better habits every day.
            </motion.p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onGetStarted}
              className="group px-10 py-4 rounded-full bg-[#D0705B] text-white font-medium text-lg flex items-center gap-3 hover:shadow-[0_12px_32px_rgba(208,112,91,0.4)] transition-all duration-300"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Get Started Now
              <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
            </motion.button>
          </motion.div>

          {/* Scroll Progress Indicator */}
          <motion.div 
            className="fixed bottom-8 right-8 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            <div className={`w-12 h-12 rounded-full flex items-center justify-center backdrop-blur-md border transition-colors duration-500 ${isDarkMode ? 'bg-[#2A2421]/60 border-[#4A2C24]/30' : 'bg-[#FAF5F0]/60 border-[#E8DCD1]/50'}`}>
              <svg className="w-8 h-8 -rotate-90" viewBox="0 0 32 32">
                <circle 
                  cx="16" 
                  cy="16" 
                  r="14" 
                  className={`transition-colors duration-500 ${isDarkMode ? 'fill-none stroke-[#4A2C24]/30' : 'fill-none stroke-[#E8DCD1]/50'}`}
                  strokeWidth="2"
                />
                <motion.circle 
                  cx="16" 
                  cy="16" 
                  r="14" 
                  className="fill-none stroke-[#D0705B]"
                  strokeWidth="2"
                  strokeDasharray={`${scrollProgress * 88} 88`}
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </ShaderBackground>
  );
}

// Feature Section Component
function FeatureSection({ 
  number, 
  title, 
  description, 
  isDarkMode, 
  imagePosition, 
  imageContent 
}: { 
  number: number
  title: string
  description: string
  isDarkMode: boolean
  imagePosition: 'left' | 'right'
  imageContent: React.ReactNode
}) {
  return (
    <motion.div 
      className="min-h-screen flex items-center px-12 relative z-10"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6 }}
    >
      <div className="w-full grid grid-cols-2 gap-16 items-center max-w-7xl mx-auto">
        {imagePosition === 'left' && (
          <motion.div 
            className="flex justify-center"
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {imageContent}
          </motion.div>
        )}
        
        <motion.div
          initial={{ opacity: 0, x: imagePosition === 'left' ? 40 : -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <span className={`inline-block text-sm font-bold tracking-widest mb-4 transition-colors duration-500 ${isDarkMode ? 'text-[#D0705B]' : 'text-[#D0705B]'}`}>
            Feature {number}
          </span>
          <h3 className={`font-serif text-4xl font-semibold mb-6 transition-colors duration-500 ${isDarkMode ? 'text-[#FDF8F3]' : 'text-[#2A2421]'}`}>
            {title}
          </h3>
          <p className={`text-lg leading-relaxed mb-8 transition-colors duration-500 ${isDarkMode ? 'text-[#A58876]' : 'text-[#2A2421]/70'}`}>
            {description}
          </p>
          <ul className="space-y-4">
            {[
              'Intuitive and easy to use',
              'Real-time synchronization',
              'Beautiful visualizations'
            ].map((item, i) => (
              <motion.li 
                key={i}
                className="flex items-center gap-3"
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.3 + i * 0.1 }}
              >
                <CheckCircle className="w-5 h-5 text-[#D0705B] flex-shrink-0" />
                <span className={`text-base transition-colors duration-500 ${isDarkMode ? 'text-[#FDF8F3]' : 'text-[#2A2421]'}`}>
                  {item}
                </span>
              </motion.li>
            ))}
          </ul>
        </motion.div>

        {imagePosition === 'right' && (
          <motion.div 
            className="flex justify-center"
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {imageContent}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

// Preview Components
function DashboardPreview({ isDarkMode }: { isDarkMode: boolean }) {
  return (
    <motion.div
      className={`rounded-2xl overflow-hidden shadow-2xl w-full max-w-sm border transition-colors duration-500 ${isDarkMode ? 'bg-[#2A2421]/80 border-[#4A2C24]/30' : 'bg-[#FAF5F0]/80 border-[#E8DCD1]/50'}`}
      whileHover={{ scale: 1.02, y: -10 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <div className={`p-6 transition-colors duration-500 ${isDarkMode ? 'bg-[#2A2421]' : 'bg-[#FAF5F0]'}`}>
        <p className={`text-xs font-bold tracking-widest mb-4 transition-colors duration-500 ${isDarkMode ? 'text-[#A58876]' : 'text-[#8A7E7A]'}`}>Dashboard Overview</p>
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div 
              key={i}
              className={`h-2 rounded-full transition-colors duration-500 ${isDarkMode ? 'bg-[#4A2C24]/50' : 'bg-[#E8DCD1]/50'}`}
              style={{ width: `${75 - i * 10}%` }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}

function ProgressPreview({ isDarkMode }: { isDarkMode: boolean }) {
  return (
    <motion.div
      className={`rounded-2xl overflow-hidden shadow-2xl w-full max-w-sm border transition-colors duration-500 ${isDarkMode ? 'bg-[#2A2421]/80 border-[#4A2C24]/30' : 'bg-[#FAF5F0]/80 border-[#E8DCD1]/50'}`}
      whileHover={{ scale: 1.02, y: -10 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <div className={`p-6 transition-colors duration-500 ${isDarkMode ? 'bg-[#2A2421]' : 'bg-[#FAF5F0]'}`}>
        <p className={`text-xs font-bold tracking-widest mb-4 transition-colors duration-500 ${isDarkMode ? 'text-[#A58876]' : 'text-[#8A7E7A]'}`}>Statistics</p>
        <div className="flex items-end justify-between h-32 gap-2">
          {[40, 60, 80, 90, 70, 85, 95].map((height, i) => (
            <div
              key={i}
              className={`flex-1 rounded-md transition-all duration-500 ${isDarkMode ? 'bg-[#D0705B]' : 'bg-[#D0705B]'}`}
              style={{ height: `${height}%` }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}

function StreakPreview({ isDarkMode }: { isDarkMode: boolean }) {
  return (
    <motion.div
      className={`rounded-2xl overflow-hidden shadow-2xl w-full max-w-sm border transition-colors duration-500 ${isDarkMode ? 'bg-[#2A2421]/80 border-[#4A2C24]/30' : 'bg-[#FAF5F0]/80 border-[#E8DCD1]/50'}`}
      whileHover={{ scale: 1.02, y: -10 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <div className={`p-6 transition-colors duration-500 ${isDarkMode ? 'bg-[#2A2421]' : 'bg-[#FAF5F0]'}`}>
        <p className={`text-xs font-bold tracking-widest mb-4 transition-colors duration-500 ${isDarkMode ? 'text-[#A58876]' : 'text-[#8A7E7A]'}`}>Streaks</p>
        <div className="space-y-2">
          {['12 days', '8 days', '5 days'].map((streak, i) => (
            <div key={i} className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-[#D0705B]" />
              <span className={`text-sm transition-colors duration-500 ${isDarkMode ? 'text-[#FDF8F3]' : 'text-[#2A2421]'}`}>{streak}</span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

function CategoriesPreview({ isDarkMode }: { isDarkMode: boolean }) {
  return (
    <motion.div
      className={`rounded-2xl overflow-hidden shadow-2xl w-full max-w-sm border transition-colors duration-500 ${isDarkMode ? 'bg-[#2A2421]/80 border-[#4A2C24]/30' : 'bg-[#FAF5F0]/80 border-[#E8DCD1]/50'}`}
      whileHover={{ scale: 1.02, y: -10 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <div className={`p-6 transition-colors duration-500 ${isDarkMode ? 'bg-[#2A2421]' : 'bg-[#FAF5F0]'}`}>
        <p className={`text-xs font-bold tracking-widest mb-4 transition-colors duration-500 ${isDarkMode ? 'text-[#A58876]' : 'text-[#8A7E7A]'}`}>Categories</p>
        <div className="flex flex-wrap gap-2">
          {['Health', 'Mindset', 'Learning', 'Fitness'].map((cat, i) => (
            <div
              key={i}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors duration-500 ${isDarkMode ? 'bg-[#D0705B]/20 text-[#D0705B]' : 'bg-[#D0705B]/20 text-[#D0705B]'}`}
            >
              {cat}
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
