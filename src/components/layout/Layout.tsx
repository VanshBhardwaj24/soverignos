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
import { GodModeTracker } from './GodMode';
import { LogModal } from '../log/LogModal';
import { motion, AnimatePresence } from 'framer-motion';
import { LevelUpOverlay } from '../stats/LevelUpOverlay';
import { LootDropOverlay } from '../stats/LootDropOverlay';
import { QuestModal } from '../quests/QuestModal';
import { ProofModal } from '../log/ProofModal';
import { STATS } from '../../lib/constants';
import { cn } from '../../lib/utils';
import { useDailyBriefing } from '../../hooks/useDailyBriefing';
import { ReminderModal } from '../ui/ReminderModal';

export const Layout = () => {
  const setLogModalOpen = useSovereignStore(state => state.setLogModalOpen);
  const setQuestModalOpen = useSovereignStore(state => state.setQuestModalOpen);
  const theme = useSovereignStore(state => state.theme);
  const lastLeveledStat = useSovereignStore(state => state.lastLeveledStat);
  const setLastLeveledStat = useSovereignStore(state => state.setLastLeveledStat);
  const pendingLootDrop = useSovereignStore(state => state.pendingLootDrop);
  const setPendingLootDrop = useSovereignStore(state => state.setPendingLootDrop);
  const location = useLocation();

  const { modalMode, closeBriefing, date } = useDailyBriefing();

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
        {pendingLootDrop && (
          <LootDropOverlay
            drop={pendingLootDrop}
            onClose={() => setPendingLootDrop(null)}
          />
        )}
      </AnimatePresence>
      <ParticleBackground />
      <Header />
      <Sidebar />
      <NotificationPanel />
      <main className={cn(
        "pt-20 pb-20 px-4 md:px-8 max-w-[1600px] mx-auto z-10 relative transition-all duration-300 ease-in-out",
        useSovereignStore.getState().sidebarCollapsed ? "md:pl-24" : "md:pl-72"
      )}>
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 4, filter: 'blur(4px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -4, filter: 'blur(4px)' }}
            transition={{ 
              duration: 0.15, 
              ease: [0.23, 1, 0.32, 1] // Snappy out-expo
            }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      <ReminderModal
        mode={modalMode}
        onClose={closeBriefing}
        date={date}
      />

      <LogModal />
      <QuestModal />
      <ProofModal />
      {location.pathname === '/' && <FlowPlayer />}
      <CommandPalette />
      <InventoryModal />
      <GodModeTracker />
    </div>
  );
};
