import { useState, useMemo, useEffect } from 'react';
import { useSovereignStore } from '../store/sovereign';
import {
  AlertTriangle, ChevronDown, ChevronUp, Trash2, CheckCircle, List, Pencil, RefreshCcw,
  Plus, Search, Zap, Flame, CheckSquare, History, Bell
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { STATS } from '../lib/constants';
import { cn } from '../lib/utils';
import { PostponeModal } from '../components/quests/PostponeModal';

type QuestTab = 'strategic' | 'operational' | 'campaigns' | 'archived';

export default function Quests() {
  const [activeTab, setActiveTab] = useState<QuestTab>('strategic');
  const [search, setSearch] = useState('');
  const [selectedPillar, setSelectedPillar] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'xp' | 'streak' | 'date'>('date');
  const [selectedQuestIds, setSelectedQuestIds] = useState<string[]>([]);
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [postponeId, setPostponeId] = useState<string | null>(null);

  const {
    dailyQuests, bulkDeleteQuests, updateQuestNotes, tickQuests, statLevels, setQuestModalOpen, setTargetQuestId, setLogModalOpen, failQuest, bulkCompleteQuests
  } = useSovereignStore();

  useEffect(() => {
    const interval = setInterval(() => {
      tickQuests();
    }, 1000);
    return () => clearInterval(interval);
  }, [tickQuests]);

  // Filter Logic
  const filteredQuests = useMemo(() => {
    let result = dailyQuests.filter(q => {
      const matchesPillar = !selectedPillar || q.statId === selectedPillar;
      const matchesSearch = q.title.toLowerCase().includes(search.toLowerCase());
      const isArchived = q.archived === true;
      const matchesTab =
        (activeTab === 'archived' ? isArchived : !isArchived) && (
          (activeTab === 'strategic' && q.type === 'daily') ||
          (activeTab === 'operational' && q.type === 'weekly') ||
          (activeTab === 'campaigns' && q.type === 'boss') ||
          (activeTab === 'archived')
        );
      return matchesPillar && matchesSearch && matchesTab;
    });

    if (sortBy === 'xp') result.sort((a, b) => b.xpReward - a.xpReward);
    if (sortBy === 'streak') result.sort((a, b) => b.streak - a.streak);
    // Date sorting assumed to be by ID or default order for now as there's no explicit date field in current Quest interface

    return result;
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
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-[1200px] mx-auto pb-12">

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="font-mono text-[11px] tracking-[0.2em] text-[var(--text-muted)] uppercase font-semibold mb-2">System Protocols</h1>
          <div className="font-mono text-4xl font-light tracking-tight text-white flex items-center gap-3">
            MISSION BOARD <span className="text-white/20">/</span> <span className="text-white/40">{activeTab.toUpperCase()}</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden lg:flex flex-col items-end px-6 border-r border-white/5">
            <span className="font-mono text-[10px] text-white/30 uppercase tracking-widest mb-1">Operational Health</span>
            <span className="font-mono text-xs font-black text-[var(--success)]">NOMINAL // 98.2%</span>
          </div>
          <button
            onClick={() => setQuestModalOpen(true)}
            className="flex items-center gap-2 bg-white text-black px-6 py-2.5 rounded text-sm font-mono font-bold hover:opacity-90 transition-all active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.2)]"
          >
            <Plus size={16} /> ADD MISSION
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className="space-y-8">

        {/* Search & Filters Row */}
        <div className="flex flex-col md:flex-row items-center gap-4 bg-white/[0.02] border border-white/10 p-3 rounded-2xl">
          <div className="relative w-full md:w-64">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" />
            <input
              placeholder="Search ID..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-9 pr-3 text-[11px] outline-none focus:border-white/20 transition-all font-mono text-white"
            />
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-white/5 border border-white/10 rounded-xl py-2 px-4 text-[11px] font-mono text-white outline-none focus:border-white/20"
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
                "px-4 py-2 rounded-xl border font-mono text-[10px] tracking-widest uppercase transition-all",
                isSelectMode ? "bg-white text-black font-black" : "bg-white/5 border-white/10 text-white/40 hover:text-white"
              )}
            >
              {isSelectMode ? 'EXIT SELECT' : 'SELECT MODE'}
            </button>
          </div>

          <div className="h-4 w-px bg-white/10 hidden md:block" />

          <div className="flex flex-wrap items-center gap-2">
            {Object.values(STATS).map(pillar => (
              <button
                key={pillar.id}
                onClick={() => setSelectedPillar(selectedPillar === pillar.id ? null : pillar.id)}
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all active:scale-95 group",
                  selectedPillar === pillar.id
                    ? "bg-white/10 border-white/30 text-white"
                    : "bg-white/5 border-transparent text-white/40 hover:bg-white/10"
                )}
              >
                <div className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: pillar.colorVar }} />
                <span className="text-[10px] font-bold tracking-tight uppercase">{pillar.name}</span>
              </button>
            ))}
          </div>

          <div className="ml-auto hidden xl:flex items-center gap-6 px-4 border-l border-white/10">
            <Metric label="Cleared" value={stats.completed} />
            <Metric label="Active" value={stats.active} />
            <Metric label="Total XP" value={stats.totalXP} color="text-[var(--stat-code)]" />
            <Metric label="Gold" value={`${stats.goldEarned} GC`} color="text-yellow-400" />
          </div>
        </div>

        {/* Quest Deck */}
        <div className="space-y-6">

          {/* Tab Navigation & Secondary Meta */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Tabs Row */}
            <div className="flex items-center gap-1 bg-white/[0.02] p-1 rounded-xl border border-white/5 w-fit">
              <TabButton active={activeTab === 'strategic'} onClick={() => setActiveTab('strategic')} label="Strategic" />
              <TabButton active={activeTab === 'operational'} onClick={() => setActiveTab('operational')} label="Operational" />
              <TabButton active={activeTab === 'campaigns'} onClick={() => setActiveTab('campaigns')} label="Campaigns" />
              <TabButton active={activeTab === 'archived'} onClick={() => setActiveTab('archived')} label="Archived" />
            </div>

            <div className="flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-[var(--danger)] animate-pulse" />
              <span className="font-mono text-[9px] text-white/40 uppercase tracking-[0.2em]">Risk Coefficient: {stats.failureRate.toFixed(1)}%</span>
            </div>
          </div>

          <div className="space-y-2">
            <AnimatePresence mode="popLayout">
              {filteredQuests.length === 0 ? (
                <div className="py-20 text-center border border-dashed border-white/5 rounded-3xl opacity-20">
                  <AlertTriangle size={32} className="mx-auto mb-4" />
                  <p className="font-mono text-[10px] uppercase tracking-[0.3em]">No active missions in this sector</p>
                </div>
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
                      setLogModalOpen(true);
                    }}
                    onFail={() => failQuest(quest.id)}
                    onUpdateNotes={(notes, subtasks) => updateQuestNotes(quest.id, notes, subtasks)}
                    onPostpone={() => setPostponeId(quest.id)}
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
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-white text-black p-4 rounded-2xl shadow-[0_20px_50px_rgba(255,255,255,0.1)] flex items-center gap-8 z-50 border border-white/20"
          >
            <div className="flex flex-col">
              <span className="text-[10px] font-black tracking-widest uppercase opacity-40">Active Selection</span>
              <span className="text-sm font-black uppercase tracking-tight">{selectedQuestIds.length} MISSION(S)</span>
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
                <Trash2 size={14} /> PURGE
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
    <div className="flex items-center gap-3">
      <span className="font-mono text-[9px] text-white/30 uppercase tracking-widest">{label}</span>
      <span className={cn("font-mono text-xs font-bold", color)}>{value}</span>
    </div>
  );
}

function TabButton({ active, onClick, label }: { active: boolean, onClick: () => void, label: string }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-6 py-2 rounded-lg font-mono text-[10px] font-bold tracking-widest uppercase transition-all whitespace-nowrap",
        active ? "bg-white/10 text-white" : "text-white/30 hover:text-white/60"
      )}
    >
      {label}
    </button>
  );
}

function QuestEntry({
  quest, onExecute, onFail, index, isSelected, onToggleSelect, isSelectMode, onUpdateNotes
}: {
  quest: any, onExecute: () => void, onFail: () => void, index: number,
  isSelected: boolean, onToggleSelect: () => void, isSelectMode: boolean,
  onUpdateNotes: (notes: string, subtasks: any[]) => void,
  onPostpone: () => void
}) {
  const isBoss = quest.type === 'boss';
  const isWeekly = quest.type === 'weekly';
  const [expanded, setExpanded] = useState(false);
  const [notes, setNotes] = useState(quest.notes || '');
  const { setTargetQuestId, setLogModalOpen } = useSovereignStore();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      exit={{ opacity: 0, scale: 0.98 }}
      className={cn(
        "relative rounded-xl border transition-all duration-300 group overflow-hidden",
        quest.completed ? "bg-white/[0.01] border-white/5 opacity-40" :
          quest.failed ? "bg-[var(--danger)]/[0.03] border-[var(--danger)]/20" :
            isBoss ? "bg-[var(--bg-elevated)] border-[#7649C9]/30 shadow-[0_0_20px_rgba(118,73,201,0.1)]" :
              "bg-white/[0.03] border-white/5 hover:border-white/10 shadow-sm",
        isSelected && "border-white/40 ring-1 ring-white/20"
      )}
    >
      <div className="flex items-center justify-between gap-6 p-4">
        <div className="flex items-center gap-4">
          {isSelectMode ? (
            <button
              onClick={onToggleSelect}
              className={cn(
                "h-9 w-9 rounded-lg flex items-center justify-center border transition-all",
                isSelected ? "bg-white text-black border-white" : "bg-white/5 border-white/10 text-white/20"
              )}
            >
              {isSelected ? <CheckSquare size={18} /> : <div className="h-4 w-4 border-2 border-white/10 rounded" />}
            </button>
          ) : (
            <button
              onClick={onExecute}
              disabled={quest.completed || quest.failed}
              className={cn(
                "h-9 w-9 rounded-lg flex items-center justify-center transition-all border",
                quest.completed ? "bg-[var(--success)]/10 text-[var(--success)] border-[var(--success)]/20 shadow-[0_0_10px_var(--success)]" :
                  isBoss ? "bg-[#7649C9]/20 text-[#7649C9] border-[#7649C9]/30" :
                    "bg-white/5 text-white/20 border-white/10 hover:text-white hover:border-white/30"
              )}
            >
              {quest.completed ? <CheckSquare size={18} /> : <Zap size={18} />}
            </button>
          )}

          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={cn(
                "font-mono text-[8px] font-black tracking-widest px-1.5 py-0.5 rounded-sm uppercase text-white/50 border border-white/10",
                isBoss ? "bg-[#7649C9]/20 text-[#7649C9] border-[#7649C9]/30" : "bg-white/5"
              )}>
                {quest.statId} // {quest.type} // {quest.difficulty || 'medium'}
              </span>
              <span className={cn(
                "font-mono text-[8px] font-black tracking-widest px-1.5 py-0.5 rounded-sm border",
                quest.priority === 'P0' ? "bg-red-500/20 text-red-500 border-red-500/30" :
                  quest.priority === 'P1' ? "bg-orange-500/20 text-orange-500 border-orange-500/30" :
                    "bg-blue-500/20 text-blue-500 border-blue-500/30 text-white/40"
              )}>
                {quest.priority}
              </span>
              {quest.repeating && (
                <span className="flex items-center gap-1 font-mono text-[8px] text-[var(--success)] font-bold border border-[var(--success)]/10 px-1.5 py-0.5 rounded animate-pulse">
                  <RefreshCcw size={8} /> REPEATING
                </span>
              )}
              {quest.streak > 0 && (
                <span className="flex items-center gap-1 font-mono text-[8px] text-orange-500/80 font-bold border border-orange-500/10 px-1.5 py-0.5 rounded">
                  <Flame size={8} /> STREAK {quest.streak}
                </span>
              )}
              {quest.postponeCount > 0 && (
                <span className={cn(
                  "flex items-center gap-1 font-mono text-[8px] font-bold border px-1.5 py-0.5 rounded animate-pulse",
                  isBoss ? "text-red-500 border-red-500/20" : "text-orange-500 border-orange-500/20"
                )}>
                  {isBoss ? `STRIKE ${quest.postponeCount}/3` : `EXTENDED ${quest.postponeCount}/1`}
                </span>
              )}
            </div>
            <div className="flex items-center gap-3">
              <h3 className={cn(
                "font-sans text-sm font-bold tracking-tight uppercase",
                quest.completed || quest.failed ? "text-white/20 line-through" : "text-white"
              )}>
                {quest.title}
              </h3>
              <button
                onClick={() => setExpanded(!expanded)}
                className="text-white/20 hover:text-white transition-all"
              >
                {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
            </div>
            {(quest.dueDate || (quest.type === 'daily' && !quest.completed && !quest.failed)) && (
              <div className="flex items-center gap-2 mt-2">
                <div className={cn(
                  "h-1.5 w-1.5 rounded-full animate-pulse",
                  (() => {
                    const targetDate = quest.dueDate || quest.expiresAt || new Date().setHours(23, 59, 59, 999);
                    const diff = new Date(targetDate).getTime() - new Date().getTime();
                    if (diff / 3600000 < 1) return "bg-red-500";
                    if (diff / 3600000 < 4) return "bg-orange-500";
                    return "bg-green-500";
                  })()
                )} />
                <span className={cn(
                  "font-mono text-[9px] font-black tracking-widest uppercase",
                  (() => {
                    const targetDate = quest.dueDate || quest.expiresAt || new Date().setHours(23, 59, 59, 999);
                    const diff = new Date(targetDate).getTime() - new Date().getTime();
                    if (diff / 3600000 < 1) return "text-red-500";
                    if (diff / 3600000 < 4) return "text-orange-500";
                    return "text-green-500";
                  })()
                )}>
                  Remaining: {(() => {
                    const targetDate = quest.dueDate || quest.expiresAt || new Date().setHours(23, 59, 59, 999);
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
                <span className="font-mono text-[9px] text-[var(--danger)] font-black tracking-widest uppercase">
                  Time Left: {Math.floor((quest.timeLeft || 0) / 60)}m {(quest.timeLeft || 0) % 60}s
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-8">
          <div className="hidden md:block text-right">
            <span className={cn(
              "font-mono text-sm font-black block",
              isBoss ? "text-[#7649C9]" : "text-[var(--stat-code)]"
            )}>
              {quest.failed ? "-" : "+"}{quest.xpReward} XP
            </span>
          </div>

          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => {
                useSovereignStore.getState().setTargetQuestId(quest.id);
                useSovereignStore.getState().setQuestModalOpen(true);
              }}
              className="p-2 text-white/20 hover:text-white transition-colors"
              title="Edit Protocol"
            >
              <Pencil size={14} />
            </button>
            {!quest.completed && !quest.failed && (
              <>
                <button
                  onClick={onFail}
                  className="p-2 text-white/20 hover:text-[var(--danger)] transition-colors"
                  title="Mark as Failed"
                >
                  <AlertTriangle size={14} />
                </button>
                {(isBoss || isWeekly) && (
                  <button
                    onClick={onPostpone}
                    className="flex items-center gap-1 px-2 py-1 bg-white/5 border border-white/10 rounded text-[9px] font-mono text-white/40 hover:text-white hover:border-white/30 transition-all uppercase tracking-tighter"
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
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            className="border-t border-white/5 bg-black/20 p-4"
          >
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              onBlur={() => onUpdateNotes(notes, quest.subtasks || [])}
              placeholder="Operational notes, tactical subtasks, or mission logs..."
              className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-[11px] font-mono text-white/60 min-h-[80px] outline-none focus:border-white/20 transition-all resize-none"
            />

            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <List size={12} className="text-white/20" />
                <span className="text-[9px] font-mono text-white/20 uppercase tracking-widest">Procedural Checkpoint(s)</span>
              </div>
              <button
                onClick={() => {
                  const newTask = { id: Math.random().toString(36).substr(2, 9), text: 'New checkpoint...', completed: false };
                  onUpdateNotes(notes, [...(quest.subtasks || []), newTask]);
                }}
                className="text-[9px] font-mono text-white/40 hover:text-white uppercase tracking-widest"
              >
                + Add Step
              </button>
            </div>

            <div className="mt-3 space-y-2">
              {(quest.subtasks || []).map((st: any) => (
                <div key={st.id} className="flex items-center gap-3 bg-white/[0.02] p-2 rounded-lg border border-white/5">
                  <button
                    onClick={() => {
                      const newSubtasks = quest.subtasks.map((s: any) => s.id === st.id ? { ...s, completed: !s.completed } : s);
                      onUpdateNotes(notes, newSubtasks);
                    }}
                    className={cn(
                      "h-4 w-4 rounded border flex items-center justify-center transition-all",
                      st.completed ? "bg-[var(--success)] border-[var(--success)] text-white" : "border-white/20"
                    )}
                  >
                    {st.completed && <CheckSquare size={10} />}
                  </button>
                  <input
                    value={st.text}
                    onChange={(e) => {
                      const newSubtasks = quest.subtasks.map((s: any) => s.id === st.id ? { ...s, text: e.target.value } : s);
                      onUpdateNotes(notes, newSubtasks);
                    }}
                    className={cn(
                      "bg-transparent border-none outline-none text-[10px] font-mono text-white/50 w-full",
                      st.completed && "line-through opacity-30"
                    )}
                  />
                  <button
                    onClick={() => {
                      const newSubtasks = quest.subtasks.filter((s: any) => s.id !== st.id);
                      onUpdateNotes(notes, newSubtasks);
                    }}
                    className="text-white/10 hover:text-[var(--danger)]"
                  >
                    <Trash2 size={10} />
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
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
