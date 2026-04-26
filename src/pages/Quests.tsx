import { useState, useMemo, useEffect } from 'react';
import { useSovereignStore } from '../store/sovereign';
import {
  AlertTriangle, Trash2, CheckCircle, Pencil, RefreshCcw,
  Plus, Search, Zap, Flame, CheckSquare, ChevronUp, ChevronDown, RotateCcw, Target,
  Pin, PinOff, Eraser, List
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { STATS } from '../lib/constants';
import { cn } from '../lib/utils';
import { PostponeModal } from '../components/quests/PostponeModal';
import { ConsequenceChainModal } from '../components/psych/ConsequenceChainModal';
import { StreakInsuranceModal } from '../components/psych/StreakInsuranceModal';
import { SubtaskPanel } from '../components/quests/SubtaskPanel';
import { usePsychStore } from '../store/sovereign-psych';
import { useCadenceStore } from '../store/cadence';

type QuestTab = 'strategic' | 'operational' | 'campaigns' | 'archived';

export default function Quests() {
  const [activeTab, setActiveTab] = useState<QuestTab>('strategic');
  const [search, setSearch] = useState('');
  const [selectedPillar, setSelectedPillar] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'xp' | 'streak' | 'date'>('date');
  const [selectedQuestIds, setSelectedQuestIds] = useState<string[]>([]);
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [allCollapsed, setAllCollapsed] = useState(false);
  const [postponeId, setPostponeId] = useState<string | null>(null);
  const [consequenceQuest, setConsequenceQuest] = useState<{ id: string; statId: string; title: string } | null>(null);
  const [insuranceQuest, setInsuranceQuest] = useState<{ id: string; title: string } | null>(null);

  const {
    dailyQuests, bulkDeleteQuests, updateQuestNotes, tickQuests, setQuestModalOpen, setTargetQuestId, setPendingActivity, failQuest, bulkCompleteQuests, protectQuest, togglePinQuest
  } = useSovereignStore();
  const { checkCadence } = useCadenceStore();
  const { logSkip } = usePsychStore();

  const handleQuestFail = (quest: { id: string; statId: string; title: string }) => {
    setConsequenceQuest(quest);
  };

  const handleConfirmSkip = async () => {
    if (!consequenceQuest) return;
    logSkip(consequenceQuest.statId);
    await failQuest(consequenceQuest.id);
    setConsequenceQuest(null);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      tickQuests();
      checkCadence();
    }, 1000);
    return () => clearInterval(interval);
  }, [tickQuests, checkCadence]);

  // Filter Logic
  const filteredQuests = useMemo(() => {
    let result = dailyQuests.filter(q => {
      const matchesPillar = !selectedPillar || q.statId === selectedPillar;
      const matchesSearch = q.title.toLowerCase().includes(search.toLowerCase());
      const isArchived = q.archived === true;
      const isCompleted = q.completed === true;

      // Filter logic: Repeating missions stay in active tabs even if completed. 
      // Non-repeating done missions go to archive.
      const matchesTab =
        (activeTab === 'archived')
          ? (isArchived || (isCompleted && !q.repeating))
          : (!isArchived && (!isCompleted || q.repeating)) && (
            (activeTab === 'strategic' && q.type === 'daily') ||
            (activeTab === 'operational' && q.type === 'weekly') ||
            (activeTab === 'campaigns' && (q.type === 'boss' || q.type === 'raid'))
          );
      return matchesPillar && matchesSearch && matchesTab;
    });

    if (sortBy === 'xp') result.sort((a, b) => b.xpReward - a.xpReward);
    if (sortBy === 'streak') result.sort((a, b) => b.streak - a.streak);

    // Final Sort: Pinned first
    return result.sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));
  }, [dailyQuests, selectedPillar, search, activeTab, sortBy]);

  const stats = useMemo(() => {
    const totalXP = dailyQuests.reduce((acc, q) => acc + (q.completed ? q.xpReward : 0), 0);
    const goldEarned = Math.floor(totalXP / 2);
    return {
      completed: dailyQuests.filter(q => q.completed).length,
      active: dailyQuests.filter(q => !q.completed && !q.failed).length,
      failureRate: (dailyQuests.filter(q => q.failed).length / (dailyQuests.length || 1)) * 100,
      totalXP,
      goldEarned
    };
  }, [dailyQuests]);

  return (
    <div className="max-w-[1100px] mx-auto pb-24 px-4 sm:px-6 animate-in fade-in slide-in-from-bottom-6 duration-700">
      <ConsequenceChainModal
        open={!!consequenceQuest}
        statId={consequenceQuest?.statId ?? 'code'}
        questTitle={consequenceQuest?.title ?? ''}
        onConfirmSkip={handleConfirmSkip}
        onResume={() => setConsequenceQuest(null)}
        onUseInsurance={() => {
          setInsuranceQuest(consequenceQuest);
          setConsequenceQuest(null);
        }}
      />

      <AnimatePresence>
        {insuranceQuest && (
          <StreakInsuranceModal
            questTitle={insuranceQuest.title}
            onConfirm={async () => {
              await protectQuest(insuranceQuest.id);
              setInsuranceQuest(null);
            }}
            onCancel={() => setInsuranceQuest(null)}
          />
        )}
      </AnimatePresence>

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 relative z-10">
        <div>
          <div>
            <p className="eyebrow text-white/40 mb-4">System Protocols</p>
            <div className="flex flex-col">
              <h2 className="text-5xl font-bold tracking-tighter text-white leading-none">MISSION BOARD</h2>
              <div className="flex items-center gap-4 mt-4">
                <span className="text-4xl text-white/10 font-light">/</span>
                <span className="text-4xl h-display text-white/40">{activeTab}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 pt-5">
          <div className="hidden lg:flex items-center gap-6 px-6 border-r border-white/5">
            <Metric label="Active" value={stats.active} />
            <Metric label="Success Rate" value={`${(100 - stats.failureRate).toFixed(1)}%`} color="text-[var(--success)]" />
            <Metric label="XP Today" value={stats.totalXP} color="text-[var(--stat-code)]" />
            <Metric label="Gold Today" value={stats.goldEarned} color="text-[var(--stat-gold)]" />
          </div>
          <button
            onClick={() => setQuestModalOpen(true)}
            aria-label="Add new mission"
            className="flex items-center gap-2 bg-white text-black px-6 py-2.5 rounded text-sm font-bold font-black hover:shadow-[0_0_20px_rgba(255,255,255,0.4)] transition-all active:scale-95 shadow-md mt-4"
          >
            <Plus size={16} /> ADD MISSION
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className="space-y-8 relative z-10">

        {/* Search & Filters Row */}
        <div className="flex flex-col md:flex-row items-center gap-4 surface-card p-3 shadow-lg relative overflow-hidden">
          <div className="absolute inset-0 bg-noise opacity-5 pointer-events-none" />
          <div className="relative w-full md:w-64 z-10">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" />
            <input
              placeholder="Search ID..."
              aria-label="Search missions"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-9 pr-3 text-[11px] outline-none focus:border-white/20 transition-all font-bold text-white shadow-inner"
            />
          </div>

          <div className="flex items-center gap-2 ml-auto z-10">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-white/5 border border-white/10 rounded-xl py-2 px-4 text-[11px] font-bold text-white outline-none focus:border-white/20 shadow-sm"
            >
              <option value="date" className="bg-[#111]">SORT: DATE</option>
              <option value="xp" className="bg-[#111]">SORT: XP</option>
              <option value="streak" className="bg-[#111]">SORT: STREAK</option>
            </select>

            <button
              onClick={() => {
                setIsSelectMode(!isSelectMode);
                setSelectedQuestIds([]);
              }}
              className={cn(
                "px-4 py-2 rounded-xl border font-bold text-[10px] tracking-widest uppercase transition-all shadow-sm",
                isSelectMode ? "bg-white text-black font-black" : "bg-white/5 border-white/10 text-white/40 hover:text-white hover:bg-white/10"
              )}
            >
              {isSelectMode ? 'EXIT SELECT' : 'SELECT MODE'}
            </button>

            <div className="h-4 w-px bg-white/10 mx-2" />

            <button
              onClick={() => dailyQuests.forEach(q => q.archived && bulkDeleteQuests([q.id]))}
              className="p-2 text-white/20 hover:text-red-500 transition-colors"
              title="Clear All Archived"
            >
              <Eraser size={16} />
            </button>

            <button
              onClick={() => setAllCollapsed(!allCollapsed)}
              className="p-2 text-white/20 hover:text-white transition-colors"
              title={allCollapsed ? "Expand All" : "Collapse All"}
            >
              <List size={16} />
            </button>
          </div>

          <div className="h-4 w-px bg-white/10 hidden md:block z-10" />

          <div className="flex flex-wrap items-center gap-2 z-10">
            {Object.values(STATS).map(pillar => (
              <button
                key={pillar.id}
                onClick={() => setSelectedPillar(selectedPillar === pillar.id ? null : pillar.id)}
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all active:scale-95 group shadow-sm",
                  selectedPillar === pillar.id
                    ? "text-white shadow-[0_0_10px_rgba(255,255,255,0.1)]"
                    : "bg-white/5 border-transparent text-white/40 hover:bg-white/10"
                )}
                style={selectedPillar === pillar.id ? { backgroundColor: `color-mix(in srgb, ${pillar.colorVar} 20%, transparent)`, borderColor: pillar.colorVar } : undefined}
              >
                <div className={cn("h-2 w-2 rounded-full", selectedPillar === pillar.id && "shadow-[0_0_5px_currentColor]")} style={{ backgroundColor: pillar.colorVar }} />
                <span className="text-[10px] font-bold tracking-tight uppercase">{pillar.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Quest Deck */}
        <div className="space-y-6">

          {/* Tab Navigation & Secondary Meta */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Tabs Row */}
            <div className="relative flex items-center p-1 bg-[#090909] border border-white/[0.05] rounded-full w-full lg:w-fit shadow-2xl">
              {(['strategic', 'operational', 'campaigns', 'archived'] as QuestTab[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    "relative px-6 py-2 font-black text-[10px] tracking-[0.1em] uppercase transition-all duration-300 whitespace-nowrap flex-1 lg:flex-none lg:min-w-[130px] text-center",
                    activeTab === tab ? "text-black" : "text-white/40 hover:text-white/70"
                  )}
                >
                  {activeTab === tab && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-white rounded-full"
                      transition={{ type: 'spring', bounce: 0.15, duration: 0.5 }}
                    />
                  )}
                  <span className="relative z-10">{tab}</span>
                </button>
              ))}
            </div>

            {/* <div className="flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-[var(--danger)] animate-pulse shadow-[0_0_5px_var(--danger)]" />
              <span className="font-bold text-[9px] text-white/50 uppercase tracking-[0.2em]">Risk Coefficient: <span className="text-[var(--danger)] drop-shadow-[0_0_2px_var(--danger)] font-black">{stats.failureRate.toFixed(1)}%</span></span>
            </div> */}
          </div>

          <div className="space-y-2">
            <AnimatePresence mode="popLayout">
              {filteredQuests.length === 0 ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-24 flex flex-col items-center justify-center text-center border border-dashed border-white/10 rounded-3xl bg-white/[0.01] relative overflow-hidden group shadow-inner">
                  <div className="absolute inset-0 bg-noise opacity-5 pointer-events-none" />
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
                  <Target size={48} strokeWidth={1} className="text-white/10 mb-6 group-hover:scale-110 group-hover:text-white/20 transition-all duration-700 drop-shadow-glow" />
                  <p className="font-bold text-[12px] uppercase tracking-[0.4em] text-white/30 font-black mb-2">NO MISSIONS DETECTED</p>
                  <p className="text-[10px] text-white/20 font-mono">Sector {activeTab.toUpperCase()} is currently clear.</p>
                </motion.div>
              ) : (
                filteredQuests.map((quest, index) => (
                  <QuestEntry
                    key={quest.id}
                    quest={quest}
                    index={index}
                    isSelected={selectedQuestIds.includes(quest.id)}
                    onToggleSelect={() => {
                      setSelectedQuestIds(prev =>
                        prev.includes(quest.id) ? prev.filter(id => id !== quest.id) : [...prev, quest.id]
                      );
                    }}
                    isSelectMode={isSelectMode}
                    onExecute={() => {
                      setTargetQuestId(quest.id);
                      setPendingActivity({
                        statId: quest.statId,
                        xp: quest.xpReward,
                        questId: quest.id
                      });
                      useSovereignStore.getState().setProofModalOpen(true);
                    }}
                    onFail={() => handleQuestFail({ id: quest.id, statId: quest.statId, title: quest.title })}
                    onUpdateNotes={(notes, subtasks, subtasksEnabled) => updateQuestNotes(quest.id, notes, subtasks, subtasksEnabled)}
                    onPostpone={() => setPostponeId(quest.id)}
                    onTogglePin={() => togglePinQuest(quest.id)}
                    forceCollapse={allCollapsed}
                    activeTab={activeTab}
                  />
                ))
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Bulk Action Bar */}
      <AnimatePresence>
        {selectedQuestIds.length > 0 && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-white text-black px-6 py-4 rounded-[28px] shadow-[0_32px_64px_rgba(0,0,0,0.4)] flex items-center gap-8 z-50 backdrop-blur-xl"
          >
            <div className="flex flex-col">
              <span className="text-[10px] font-bold tracking-widest uppercase opacity-40">Selected</span>
              <span className="text-sm font-bold tracking-tight">{selectedQuestIds.length} Missions</span>
            </div>

            <div className="h-8 w-px bg-black/10" />

            <div className="flex items-center gap-2">
              <button
                onClick={async () => {
                  await bulkCompleteQuests(selectedQuestIds);
                  setSelectedQuestIds([]);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-xl text-[10px] font-black tracking-widest uppercase hover:scale-105 transition-all"
              >
                <CheckCircle size={14} /> BULK COMPLETE
              </button>
              <button
                onClick={async () => {
                  await bulkDeleteQuests(selectedQuestIds);
                  setSelectedQuestIds([]);
                }}
                className="flex items-center gap-2 px-4 py-2 border border-black/10 rounded-xl text-[10px] font-black tracking-widest uppercase hover:bg-black/5 transition-all"
              >
                Delete
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <PostponeModal
        questId={postponeId}
        onClose={() => setPostponeId(null)}
      />

    </div>
  );
}

function Metric({ label, value, color = "text-white/80" }: { label: string, value: string | number, color?: string }) {
  return (
    <div className="flex flex-col gap-1.5 min-w-[100px]">
      <span className="font-bold text-[10px] text-white/30 uppercase tracking-[0.2em] font-black">{label}</span>
      <span className={cn("text-3xl font-bold tabular-nums", color)}>{value}</span>
    </div>
  );
}

function QuestEntry({
  quest, onExecute, onFail, index, isSelected, onToggleSelect, isSelectMode, onUpdateNotes, onPostpone, onTogglePin, forceCollapse, activeTab
}: {
  quest: any, onExecute: () => void, onFail: () => void, index: number,
  isSelected: boolean, onToggleSelect: () => void, isSelectMode: boolean,
  onUpdateNotes: (notes: string, subtasks: any, subtasksEnabled: boolean) => void,
  onPostpone: () => void,
  onTogglePin: () => void,
  forceCollapse?: boolean,
  activeTab: string
}) {
  const isBoss = quest.type === 'boss';
  const isWeekly = quest.type === 'weekly';
  const isArchivedTab = activeTab === 'archived';
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (forceCollapse) setExpanded(false);
  }, [forceCollapse]);
  const setTargetQuestId = useSovereignStore(state => state.setTargetQuestId);
  const setQuestModalOpen = useSovereignStore(state => state.setQuestModalOpen);
  const restoreQuest = useSovereignStore(state => state.restoreQuest);
  const deleteQuest = useSovereignStore(state => state.deleteQuest);
  const completeSubtask = useSovereignStore(state => state.completeSubtask);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      exit={{ opacity: 0, scale: 0.98 }}
      className={cn(
        "relative surface-card transition-all duration-300 group overflow-hidden hover-lift",
        quest.completed ? (quest.repeating ? "bg-[var(--success)]/[0.03] border-[var(--success)]/10 opacity-70" : "bg-white/[0.01] border-white/5 opacity-40") :
          quest.failed ? "bg-red-500/[0.05] border-red-500/20 grayscale-[0.5]" :
            isBoss ? "bg-[var(--bg-elevated)] border-[#7649C9]/30 shadow-[0_0_20px_rgba(118,73,201,0.1)]" :
              "bg-white/[0.03] border-white/5 hover:border-white/10 shadow-sm",
        isSelected && "border-white/40 ring-1 ring-white/20"
      )}
    >
      <div className="flex items-center justify-between gap-6 p-3">
        <div className="flex items-center gap-3">
          {isSelectMode ? (
            <button
              onClick={onToggleSelect}
              className={cn(
                "h-7 w-7 rounded-lg flex items-center justify-center border transition-all shadow-sm",
                isSelected ? "bg-white text-black border-white shadow-[0_0_10px_rgba(255,255,255,0.4)]" : "bg-white/5 border-white/10 text-white/20"
              )}
            >
              {isSelected ? <CheckSquare size={14} /> : <div className="h-3 w-3 border-2 border-white/10 rounded" />}
            </button>
          ) : isArchivedTab ? (
            <button
              onClick={() => restoreQuest(quest.id)}
              className="h-8 w-8 rounded-lg flex items-center justify-center bg-white/10 text-white border border-white/10 hover:bg-white hover:text-black transition-all"
              title="Restore to Active Board"
            >
              <RotateCcw size={16} />
            </button>
          ) : (
            <button
              onClick={onExecute}
              aria-label={quest.completed && quest.repeating ? "Protocol successfully executed" : `Execute protocol: ${quest.title}`}
              disabled={quest.completed || quest.failed}
              className={cn(
                "h-9 w-9 rounded-xl flex items-center justify-center transition-all border duration-500 group/zap relative",
                quest.completed ? "bg-[var(--success)]/10 text-[var(--success)] border-[var(--success)]/20 shadow-[0_0_15px_rgba(74,222,128,0.2)]" :
                  isBoss ? "bg-[#7649C9]/20 text-[#7649C9] border-[#7649C9]/30 shadow-[0_0_15px_rgba(118,73,201,0.2)]" :
                    quest.failed ? "bg-red-500/20 text-red-500 border-red-500/30" :
                      "bg-white/[0.03] border-white/10 hover:border-white/20",
                !quest.completed && !quest.failed && !isBoss && `glow-stat-${quest.statId}`
              )}
              style={(!quest.completed && !quest.failed && !isBoss) ? {
                color: `var(--stat-${quest.statId})`,
                borderColor: `color-mix(in srgb, var(--stat-${quest.statId}) 30%, transparent)`,
                backgroundColor: `color-mix(in srgb, var(--stat-${quest.statId}) 5%, transparent)`
              } : undefined}
              title={quest.completed && quest.repeating ? "Protocol successfully executed for today." : "Execute protocol"}
            >
              <div className="absolute inset-0 rounded-xl bg-current opacity-0 group-hover/zap:opacity-10 transition-opacity" />
              {quest.completed ? (
                <CheckSquare size={18} className="relative z-10" />
              ) : (
                <Zap
                  size={18}
                  strokeWidth={2}
                  className={cn(
                    "relative z-10 transition-transform duration-500 group-hover/zap:scale-110",
                    !quest.completed && !quest.failed && "animate-pulse-slow"
                  )}
                />
              )}
            </button>
          )}

          <div>
            <div className="flex items-center gap-1.5 mb-1">
              {quest.pinned && (
                <span className="flex items-center gap-1 font-bold text-[7px] bg-blue-500/20 text-blue-400 border border-blue-500/30 px-1.5 py-0.5 rounded shadow-[0_0_10px_rgba(59,130,246,0.2)]">
                  <Pin size={8} className="fill-blue-400" /> PINNED
                </span>
              )}
              <span className={cn(
                "font-bold text-[7px] font-black tracking-[0.1em] px-1.5 py-0.5 rounded-sm uppercase text-white/70 border border-white/10 bg-white/[0.05]",
                isBoss ? "text-[#7649C9] border-[#7649C9]/20 bg-[#7649C9]/5" : ""
              )}>
                {quest.statId} // {quest.type}
              </span>
              <span className={cn(
                "font-bold text-[7px] font-black tracking-[0.1em] px-1.5 py-0.5 rounded-sm border",
                quest.priority === 'P0' ? "bg-red-500/10 text-red-500 border-red-500/20" :
                  quest.priority === 'P1' ? "bg-orange-500/10 text-orange-500 border-orange-500/20" :
                    "bg-white/5 text-white/30 border-white/5"
              )}>
                {quest.priority}
              </span>
              {quest.repeating && (
                <span className="flex items-center gap-1 font-bold text-[8px] text-[var(--success)] font-bold border border-[var(--success)]/10 px-1.5 py-0.5 rounded animate-pulse">
                  <RefreshCcw size={8} /> REPEATING
                </span>
              )}
              {quest.streak > 0 && (
                <span className="flex items-center gap-1 font-bold text-[8px] text-orange-500/80 font-bold border border-orange-500/10 px-1.5 py-0.5 rounded">
                  <Flame size={8} /> STREAK {quest.streak}
                </span>
              )}
              {quest.postponeCount > 0 && (
                <span className={cn(
                  "flex items-center gap-1 font-bold text-[8px] font-bold border px-1.5 py-0.5 rounded",
                  isBoss ? "text-red-500 border-red-500/20" : "text-orange-500 border-orange-500/20"
                )}>
                  {isBoss ? `STRIKE ${quest.postponeCount}/3` : `EXTENDED ${quest.postponeCount}/1`}
                </span>
              )}
              {/* {quest.failureStreak >= 3 && (
                <span className={cn(
                  "flex items-center gap-1 font-bold text-[8px] font-black tracking-widest px-1.5 py-0.5 rounded border",
                  quest.failureStreak >= 6 ? "bg-red-600 text-white border-red-600" :
                    quest.failureStreak >= 5 ? "bg-red-500/20 text-red-500 border-red-500/40" :
                      "bg-black/40 text-red-500 border-red-500/20"
                )}>
                  <AlertTriangle size={8} /> 
                  {quest.failureStreak >= 6 ? "TERMINATION IMMINENT" : "REPEAT OFFENDER"} 
                  {` — FAILURE #${quest.failureStreak}`}
                </span>
              )}
              )} */}
            </div>
            <div className="flex items-center gap-3">
              <h3 className={cn(
                "font-sans text-sm font-bold tracking-tight uppercase",
                quest.completed ? "text-white/40 line-through" :
                  quest.failed ? "text-red-500/60" : "text-white font-black"
              )}>
                {quest.failed && <span className="mr-2 text-red-500 font-black">[FAILED]</span>}
                {quest.title}
                {quest.subtasksEnabled && (quest.subtasks?.length || 0) > 0 && (
                  <span className="ml-3 font-bold text-[9px] bg-white/5 border border-white/20 px-1.5 py-0.5 rounded text-white/60 tracking-widest">
                    {quest.subtasks?.filter((s: any) => s.completed).length || 0}/{quest.subtasks?.length || 0} ✓
                  </span>
                )}
              </h3>
              <button
                onClick={() => setExpanded(!expanded)}
                className="text-white/40 hover:text-white transition-all outline-none focus-visible:ring-2 focus-visible:ring-white/20 rounded-sm"
              >
                {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
            </div>
            {(!quest.completed && !quest.failed) && (
              <div className="flex items-center gap-2 mt-2">
                <div className={cn(
                  "h-1.5 w-1.5 rounded-full animate-pulse",
                  (() => {
                    const targetDate = quest.dueDate || quest.expiresAt;
                    if (!targetDate) return "bg-white/10";
                    const diff = new Date(targetDate).getTime() - new Date().getTime();
                    if (diff / 3600000 < 1) return "bg-red-500";
                    if (diff / 3600000 < 4) return "bg-orange-500";
                    return "bg-green-500";
                  })()
                )} />
                <span className={cn(
                  "font-bold text-[9px] font-black tracking-widest uppercase",
                  (() => {
                    // Fallback to IST midnight today if no deadline exists
                    const getISTMidnight = () => {
                      const now = new Date();
                      const istOffset = 5.5 * 60 * 60 * 1000;
                      const istTime = new Date(now.getTime() + istOffset);
                      istTime.setUTCHours(23, 59, 59, 999);
                      return new Date(istTime.getTime() - istOffset);
                    };

                    const targetDate = quest.dueDate || quest.expiresAt || getISTMidnight();
                    const diff = new Date(targetDate).getTime() - new Date().getTime();
                    if (diff / 3600000 < 1) return "text-red-500";
                    if (diff / 3600000 < 4) return "text-orange-500";
                    return "text-green-500";
                  })()
                )}>
                  Remaining: {(() => {
                    const getISTMidnight = () => {
                      const now = new Date();
                      const istOffset = 5.5 * 60 * 60 * 1000;
                      const istNow = new Date(now.getTime() + istOffset);
                      const y = istNow.getUTCFullYear();
                      const m = istNow.getUTCMonth();
                      const d = istNow.getUTCDate();
                      let target = new Date(Date.UTC(y, m, d, 18, 29, 59, 999));
                      if (target <= now) target = new Date(Date.UTC(y, m, d + 1, 18, 29, 59, 999));
                      return target;
                    };
                    const targetDate = quest.dueDate || quest.expiresAt || getISTMidnight();
                    const diff = new Date(targetDate).getTime() - new Date().getTime();
                    if (diff <= 0) return 'EXPIRED';
                    const h = Math.floor(diff / 3600000);
                    const m = Math.floor((diff % 3600000) / 60000);
                    return h > 0 ? `${h}h ${m}m` : `${m}m`;
                  })()}
                </span>
              </div>
            )}
            {quest.isTimed && !quest.completed && !quest.failed && (
              <div className="flex items-center gap-2 mt-1">
                <div className="h-1.5 w-1.5 rounded-full bg-[var(--danger)] animate-pulse" />
                <span className="font-bold text-[9px] text-[var(--danger)] font-black tracking-widest uppercase">
                  Time Left: {Math.floor((quest.timeLeft || 0) / 60)}m {(quest.timeLeft || 0) % 60}s
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-8">
          <div className="hidden md:block text-right">
            <span className={cn(
              "font-bold text-sm font-black block",
              isBoss ? "text-[#7649C9]" : "text-[var(--stat-code)]"
            )}>
              {quest.failed ? "-" : "+"}{quest.xpReward} XP
            </span>
            {quest.subtasksEnabled && (quest.subtasks?.length || 0) > 0 && (
              <span className="text-[9px] font-bold text-white/30 block tracking-widest uppercase">
                ({quest.subtasks?.reduce((sum: number, st: any) => sum + (st.xpReward || 0), 0) || 0} via tasks)
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={onTogglePin}
              className={cn(
                "p-2 transition-all hover:scale-110 icon-glow-blue",
                quest.pinned ? "text-blue-400 drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]" : "text-blue-400/40 hover:text-blue-400"
              )}
              title={quest.pinned ? "Unpin Mission" : "Pin Mission"}
            >
              {quest.pinned ? <PinOff size={14} /> : <Pin size={14} />}
            </button>

            <button
              onClick={() => {
                if (quest.completed && !quest.repeating) return;
                setTargetQuestId(quest.id);
                setQuestModalOpen(true);
              }}
              disabled={quest.completed && !quest.repeating}
              className={cn(
                "p-2 transition-colors hover:scale-110 icon-glow-emerald",
                quest.completed && !quest.repeating ? "text-white/5 cursor-not-allowed" : "text-emerald-400/40 hover:text-emerald-400"
              )}
              title={quest.completed && !quest.repeating ? "Protocol Locked" : "Edit Protocol"}
            >
              <Pencil size={14} />
            </button>

            <button
              onClick={() => deleteQuest(quest.id)}
              className="p-2 text-rose-500/40 hover:text-rose-500 transition-colors hover:scale-110 icon-glow-rose"
              title="Delete Permanently"
            >
              <Trash2 size={14} />
            </button>
            {!quest.completed && !quest.failed && (
              <>
                <button
                  onClick={onFail}
                  className="p-2 text-amber-500/40 hover:text-amber-500 transition-colors hover:scale-110 icon-glow-amber"
                  title="Mark as Failed"
                >
                  <AlertTriangle size={14} />
                </button>
                {(isBoss || isWeekly) && (
                  <button
                    onClick={onPostpone}
                    className="flex items-center gap-1 px-2 py-1 bg-white/5 border border-white/10 rounded text-[9px] font-bold text-white/40 hover:text-white hover:border-white/30 transition-all uppercase tracking-tighter"
                    title="Reschedule Protocol"
                  >
                    <RefreshCcw size={10} /> Shift
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <SubtaskPanel
            quest={quest}
            onUpdateNotes={(notes, subtasks, enabled) => onUpdateNotes(notes, subtasks, enabled)}
            onCompleteSubtask={(subtaskId) => completeSubtask(quest.id, subtaskId)}
            isArchived={isArchivedTab}
          />
        )}
      </AnimatePresence>

      {isBoss && !quest.completed && (
        <div className="mt-4 h-1 w-full bg-white/5 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: '85%' }}
            animate={{ width: '85%' }}
            className="h-full bg-gradient-to-r from-[#7649C9] to-[#A855F7]"
          />
        </div>
      )}
    </motion.div>
  );
}
