import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { CommandPalette } from './CommandPalette';
import { ParticleBackground } from './ParticleBackground';
import { FlowPlayer } from './FlowPlayer';
import { InventoryModal } from './InventoryModal';
import { NotificationPanel } from './NotificationPanel';
import { useSovereignStore } from '../../store/sovereign';
import { LogModal } from '../log/LogModal';
import { motion, AnimatePresence } from 'framer-motion';
import { LevelUpOverlay } from '../stats/LevelUpOverlay';
import { QuestModal } from '../quests/QuestModal';
import { STATS } from '../../lib/constants';
import { cn } from '../../lib/utils';

export const Layout = () => {
  const setLogModalOpen = useSovereignStore(state => state.setLogModalOpen);
  const setQuestModalOpen = useSovereignStore(state => state.setQuestModalOpen);
  const theme = useSovereignStore(state => state.theme);
  const lastLeveledStat = useSovereignStore(state => state.lastLeveledStat);
  const setLastLeveledStat = useSovereignStore(state => state.setLastLeveledStat);
  const location = useLocation();

  const leveledStatInfo = lastLeveledStat ? STATS[lastLeveledStat.statId] : null;

  useEffect(() => {
    if (theme === 'light') {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }
  }, [theme]);

  // F14: Aura Theme Engine logic
  useEffect(() => {
    const path = location.pathname.split('/')[1] || 'dashboard';
    const mainStatRoutes: Record<string, string> = {
      'quests': 'mind',
      'wealth': 'wealth',
      'jobs': 'network',
      'foundry': 'code',
      'travel': 'brand',
      'stats': 'stats',
      'punishments': 'body'
    };
    const aura = mainStatRoutes[path] || 'dashboard';
    document.documentElement.setAttribute('data-aura', aura);
  }, [location.pathname]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;

      switch (e.key.toLowerCase()) {
        case 'm':
          e.preventDefault();
          setQuestModalOpen(true);
          break;
        case 'escape':
          setLogModalOpen(false);
          setQuestModalOpen(false);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setLogModalOpen, setQuestModalOpen]);

  const [punished, setPunished] = useState(false);
  useEffect(() => {
    const handlePunishment = () => {
      setPunished(true);
      setTimeout(() => setPunished(false), 800);
    };
    window.addEventListener('sovereign:punishment', handlePunishment);
    return () => window.removeEventListener('sovereign:punishment', handlePunishment);
  }, []);

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] font-sans selection:bg-[var(--text-primary)]/20 relative transition-colors duration-300">
      <AnimatePresence>
        {punished && (
          <motion.div
            initial={{ opacity: 0.8 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="fixed inset-0 bg-[var(--danger)] pointer-events-none z-[9999] mix-blend-color"
          />
        )}
        {lastLeveledStat && leveledStatInfo && (
          <LevelUpOverlay
            statName={leveledStatInfo.name}
            oldLevel={lastLeveledStat.oldLevel}
            newLevel={lastLeveledStat.newLevel}
            color={leveledStatInfo.colorVar}
            onClose={() => setLastLeveledStat(null)}
          />
        )}
      </AnimatePresence>
      <ParticleBackground />
      <Header />
      <Sidebar />
      <NotificationPanel />
      <main className={cn(
        "pt-24 pb-20 px-4 md:px-8 max-w-[1400px] mx-auto z-10 relative transition-all duration-300",
        useSovereignStore.getState().sidebarCollapsed ? "md:pl-20" : "md:pl-64"
      )}>
        <Outlet />
      </main>

      <LogModal />
      <QuestModal />
      {location.pathname === '/' && <FlowPlayer />}
      <CommandPalette />
      <InventoryModal />
    </div>
  );
};
