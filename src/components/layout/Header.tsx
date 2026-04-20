import { useSovereignStore } from '../../store/sovereign';
import { Bell, Plus, User, Moon, Sun, ShoppingBag, Award, Target } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { cn } from '../../lib/utils';

export const Header = () => {
  const {
    freedomScore, setQuestModalOpen, theme, setTheme,
    toggleNotifications, notifications, gold, statTodayXP, dailyGoalXP
  } = useSovereignStore();

  const totalTodayXP = Object.values(statTodayXP).reduce((a, b) => a + b, 0);
  const goalProgress = Math.min((totalTodayXP / dailyGoalXP) * 100, 100);
  const unreadCount = notifications.filter(n => !n.read).length;
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <header className="fixed top-0 left-0 right-0 h-16 border-b border-[var(--border-default)] bg-[var(--bg-primary)]/80 backdrop-blur-md z-50 px-4 md:px-8 flex items-center justify-between transition-colors">
      <div className="flex-1 flex items-center gap-6">
        <span className="font-mono text-xl tracking-[0.15em] font-semibold text-[var(--text-primary)]">SOVEREIGN</span>
        <div className="hidden xl:flex flex-col border-l border-white/10 pl-6">
          <span className="text-[10px] uppercase tracking-[0.2em] text-[var(--text-secondary)] font-medium">Standard Protocol Time</span>
          <span className="text-xs font-mono text-[var(--text-primary)] opacity-90 uppercase tracking-widest whitespace-nowrap">
            {new Intl.DateTimeFormat('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              timeZone: 'Asia/Kolkata'
            }).format(new Date())}
          </span>
        </div>
      </div>

      {/* Centered Hub */}
      <div className="hidden md:flex items-center gap-8 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="flex flex-col items-center justify-center relative group cursor-pointer hover:before:content-[''] hover:before:absolute hover:before:-inset-4 hover:before:bg-white/5 hover:before:rounded-xl transition-all">
          <motion.div
            key={freedomScore}
            initial={{ scale: 1.1, textShadow: '0 0 20px rgba(255,255,255,0.8)' }}
            animate={{ scale: 1, textShadow: '0 0 0px rgba(255,255,255,0)' }}
            className="font-mono text-2xl md:text-3xl font-light tracking-tight text-[var(--text-primary)] mb-2 md:mb-0"
          >
            {freedomScore.toFixed(1)}
          </motion.div>
          <div className="font-mono text-[8px] tracking-[0.2em] text-[var(--text-secondary)] opacity-80 uppercase absolute -bottom-2 md:-bottom-3 text-center whitespace-nowrap">Freedom Score</div>
        </div>

        <div className="hidden lg:flex flex-col items-center gap-1.5 pl-8 border-l border-white/5">
          <div className="flex items-center justify-between w-32 font-mono text-[8px] tracking-widest text-white/40 uppercase">
            <span>Daily Goal</span>
            <span className={cn(totalTodayXP >= dailyGoalXP ? "text-[var(--success)] font-black" : "")}>{totalTodayXP} / {dailyGoalXP}</span>
          </div>
          <div className="w-32 h-1 bg-white/5 rounded-full overflow-hidden border border-white/5">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${goalProgress}%` }}
              className={cn(
                "h-full transition-colors",
                totalTodayXP >= dailyGoalXP ? "bg-[var(--success)] shadow-[0_0_10px_rgba(34,197,94,0.5)]" : "bg-white/40"
              )}
            />
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-end gap-3 md:gap-4">
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="text-gray-400 hover:text-[var(--text-primary)] transition-colors p-2 hidden md:block"
        >
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        <button
          onClick={() => setQuestModalOpen(true)}
          className="hidden md:flex items-center gap-2 bg-[var(--text-primary)] text-[var(--bg-primary)] px-4 py-1.5 rounded text-sm font-mono font-medium hover:opacity-80 transition-opacity"
        >
          <Target size={16} /> MISSION <kbd className="hidden lg:inline px-1 py-0.5 bg-black/10 dark:bg-white/10 rounded ml-2 text-xs">M</kbd>
        </button>

        <button
          onClick={() => navigate('/mind?tab=nexus')}
          className={cn(
            "p-2 rounded-full transition-all group",
            location.search.includes('tab=nexus') ? "text-white bg-white/10" : "text-[var(--text-muted)] hover:text-white hover:bg-white/5"
          )}
          title="Sovereign Evolution"
        >
          <Award size={18} className="group-hover:scale-110 transition-transform" />
        </button>

        <button
          onClick={() => navigate('/marketplace')}
          className={cn(
            "hidden md:flex items-center gap-2 px-4 py-1.5 rounded-full font-mono text-[10px] font-black tracking-widest transition-all shadow-[0_0_15px_rgba(255,255,255,0.2)]",
            location.pathname === '/marketplace' ? "bg-white text-black" : "bg-white/5 text-white hover:bg-white/10"
          )}
        >
          <ShoppingBag size={16} />
          <span className="font-mono text-[10px] font-black">{gold} GC</span>
        </button>

        <button
          onClick={() => toggleNotifications()}
          className="text-gray-400 hover:text-[var(--text-primary)] transition-colors relative"
        >
          <Bell size={20} />
          {unreadCount > 0 && <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-[var(--danger)] border border-[var(--bg-primary)]" />}
        </button>
        <button
          onClick={() => navigate('/settings')}
          className="h-8 w-8 rounded-full border border-[var(--border-default)] flex items-center justify-center text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors"
        >
          <User size={16} />
        </button>

        <button
          onClick={() => setQuestModalOpen(true)}
          className="md:hidden fixed bottom-6 right-6 w-14 h-14 bg-white text-black rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:scale-105 active:scale-95 transition-all z-50"
        >
          <Plus size={24} />
        </button>
      </div>
    </header>
  );
};
