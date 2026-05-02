import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Target, Plus, Clock,
  Search, LayoutGrid, List as ListIcon,
  CheckCircle2, Pencil, Trash2,
  Zap, Star
} from 'lucide-react';
import { useSovereignStore } from '../store/sovereign';
import { cn } from '../lib/utils';
import { STATS } from '../lib/constants';
import GoalModal from '../components/goals/GoalModal';

type GoalType = 'daily' | 'weekly' | 'monthly' | 'yearly' | 'life' | 'all';

export default function Goals() {
  const { goals, completeGoal, syncAutoTrackedGoals, checkGoalExpiries } = useSovereignStore();
  const [activeTab, setActiveTab] = useState<GoalType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null);

  useEffect(() => {
    syncAutoTrackedGoals();
    checkGoalExpiries();
    const interval = setInterval(() => {
      syncAutoTrackedGoals();
      checkGoalExpiries();
    }, 60000); // Sync every minute
    return () => clearInterval(interval);
  }, [syncAutoTrackedGoals, checkGoalExpiries]);

  // Filter goals based on tab and search
  const filteredGoals = useMemo(() => {
    return goals.filter((goal: any) => {
      const matchesTab = activeTab === 'all' || goal.type === activeTab;
      const matchesSearch = goal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        goal.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesTab && matchesSearch;
    });
  }, [goals, activeTab, searchQuery]);

  const stats = useMemo(() => {
    const total = goals.length;
    const completed = goals.filter((g: any) => g.status === 'completed').length;
    const active = goals.filter((g: any) => g.status === 'active').length;
    const completionRate = total > 0 ? (completed / total) * 100 : 0;

    return { total, completed, active, completionRate };
  }, [goals]);

  return (
    <div className="max-w-[1400px] mx-auto pb-24 px-4 sm:px-8 lg:px-12 animate-in fade-in slide-in-from-bottom-6 duration-700">

      {/* Header HUD */}
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 mb-16 pt-8">
        <div className="flex items-center gap-6">
          <div className="h-16 w-16 bg-white/[0.03] border border-white/10 rounded-3xl flex items-center justify-center text-white shadow-2xl relative group overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <Target size={32} strokeWidth={1.5} className="relative z-10" />
          </div>
          <div>
            <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] mb-1">Strategic Command</p>
            <h1 className="text-6xl font-light text-white tracking-tighter leading-none">
              Goals
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-8">
          <div className="hidden sm:flex items-center gap-8 px-8 border-r border-white/5">
            <StatItem label="Completion" value={`${stats.completionRate.toFixed(0)}%`} color="text-[var(--success)]" />
            <StatItem label="Active" value={stats.active} />
            <StatItem label="Milestones" value={stats.completed} color="text-[var(--stat-code)]" />
          </div>

          <button
            onClick={() => {
              setEditingGoalId(null);
              setIsModalOpen(true);
            }}
            className="group flex items-center gap-3 bg-white text-black px-6 py-3 rounded-xl font-black text-[10px] tracking-[0.2em] uppercase hover:scale-105 active:scale-95 transition-all shadow-xl shadow-white/10"
          >
            <Plus size={18} />
            Initialize Goal
          </button>
        </div>
      </header>

      {/* Navigation & Controls */}
      <div className="flex flex-col md:flex-row items-center gap-6 mb-12">
        <nav className="flex items-center p-1.5 bg-white/[0.03] border border-white/10 rounded-2xl backdrop-blur-xl w-full md:w-fit overflow-x-auto no-scrollbar">
          {(['all', 'daily', 'weekly', 'monthly', 'yearly', 'life'] as GoalType[]).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "px-6 py-3 rounded-xl font-black text-[10px] tracking-[0.2em] uppercase transition-all whitespace-nowrap relative",
                activeTab === tab ? "text-black" : "text-white/40 hover:text-white"
              )}
            >
              {activeTab === tab && (
                <motion.div
                  layoutId="active-goal-tab"
                  className="absolute inset-0 bg-white rounded-xl"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <span className="relative z-10">{tab}</span>
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64 group">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-white/60 transition-colors" />
            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Filter Objectives..."
              className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-3.5 pl-12 pr-6 text-sm text-white outline-none focus:border-white/20 transition-all font-medium placeholder:text-white/10 shadow-inner"
            />
          </div>

          <div className="flex items-center p-1.5 bg-white/[0.03] border border-white/10 rounded-2xl">
            <button
              onClick={() => setViewMode('grid')}
              className={cn(
                "p-2 rounded-lg transition-all",
                viewMode === 'grid' ? "bg-white/10 text-white shadow-lg" : "text-white/20 hover:text-white/40"
              )}
            >
              <LayoutGrid size={18} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={cn(
                "p-2 rounded-lg transition-all",
                viewMode === 'list' ? "bg-white/10 text-white shadow-lg" : "text-white/20 hover:text-white/40"
              )}
            >
              <ListIcon size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Goals Display */}
      <AnimatePresence mode="popLayout">
        {filteredGoals.length > 0 ? (
          <div className={cn(
            "grid gap-6",
            viewMode === 'grid' ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"
          )}>
            {filteredGoals.map((goal: any, idx: number) => (
              <GoalCard
                key={goal.id}
                goal={goal}
                index={idx}
                onEdit={() => {
                  setEditingGoalId(goal.id);
                  setIsModalOpen(true);
                }}
                onComplete={() => completeGoal(goal.id)}
              />
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="py-40 text-center bg-white/[0.01] border border-dashed border-white/10 rounded-[40px] relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-noise opacity-5 pointer-events-none" />
            <Target size={48} strokeWidth={1} className="mx-auto mb-6 text-white/10 group-hover:scale-110 group-hover:text-white/20 transition-all duration-700" />
            <h3 className="text-xl font-black text-white/30 uppercase tracking-[0.4em] mb-2 italic">Zero Objectives Detected</h3>
            <p className="text-[10px] text-white/20 font-bold uppercase tracking-[0.2em]">The sector is currently offline. Initialize a protocol to begin.</p>
          </motion.div>
        )}
      </AnimatePresence>

      <GoalModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        editingGoalId={editingGoalId}
      />
    </div>
  );
}

function StatItem({ label, value, color = "text-white" }: { label: string, value: string | number, color?: string }) {
  return (
    <div className="flex flex-col items-end">
      <span className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em] mb-1">{label}</span>
      <span className={cn("text-4xl font-light tracking-tighter tabular-nums", color)}>{value}</span>
    </div>
  );
}

function ProgressRing({ progress, color, size = 120 }: { progress: number, color: string, size?: number }) {
  const radius = size * 0.4;
  const stroke = size * 0.08;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg
        height={size}
        width={size}
        className="transform -rotate-90"
      >
        <circle
          stroke="rgba(255,255,255,0.03)"
          fill="transparent"
          strokeWidth={stroke}
          r={normalizedRadius}
          cx={size / 2}
          cy={size / 2}
        />
        <motion.circle
          stroke={color}
          fill="transparent"
          strokeWidth={stroke}
          strokeDasharray={circumference + ' ' + circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          r={normalizedRadius}
          cx={size / 2}
          cy={size / 2}
          strokeLinecap="round"
          className="drop-shadow-[0_0_8px_var(--glow-color)]"
          style={{ '--glow-color': color } as any}
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center">
        <span className="text-2xl font-light text-white tracking-tighter">{progress}%</span>
      </div>
    </div>
  );
}

function GoalCard({ goal, index, onEdit, onComplete }: { goal: any, index: number, onEdit: () => void, onComplete: () => void }) {
  const { deleteGoal, updateGoal } = useSovereignStore();
  const stat = STATS[goal.statId] || STATS.code;
  const isCompleted = goal.status === 'completed';
  const progress = goal.progress || 0;

  const timeRemaining = useMemo(() => {
    if (goal.status === 'completed') return 'COMPLETED';
    const deadline = new Date(goal.deadline);
    if (goal.deadline.length <= 10) {
      deadline.setHours(23, 59, 59, 999);
    }
    const now = new Date();
    const diffTime = deadline.getTime() - now.getTime();

    if (diffTime <= 0) return 'EXPIRED';

    const days = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diffTime % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return `${days} DAY${days > 1 ? 'S' : ''} LEFT`;
    if (hours > 0) return `${hours}H ${minutes}M LEFT`;
    return `${minutes} MINS LEFT`;
  }, [goal.deadline, goal.status]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -8 }}
      className={cn(
        "group relative p-8 bg-white/[0.02] border border-white/5 rounded-[48px] flex flex-col items-center min-h-[400px] transition-all duration-700 overflow-hidden backdrop-blur-xl",
        isCompleted ? "opacity-60 grayscale-[0.5]" : "hover:bg-white/[0.04] hover:border-white/10 hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.5)]"
      )}
    >
      {/* Subtle Stat Glow */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-1000"
        style={{ background: `radial-gradient(circle at center, ${stat.colorVar}, transparent 70%)` }}
      />

      <div className="relative z-10 w-full flex flex-col items-center flex-1">
        <div className="w-full flex items-start justify-between mb-8">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">{goal.type}</span>
              {goal.isAutoTracked && (
                <span className="flex items-center gap-1 text-[8px] font-black bg-white/10 text-white px-2 py-0.5 rounded-full border border-white/10 animate-pulse">
                  <Zap size={8} fill="currentColor" /> AUTO
                </span>
              )}
            </div>
            <h3 className={cn(
              "text-2xl font-bold text-white tracking-tight leading-tight max-w-[200px]",
              isCompleted && "line-through text-white/40"
            )}>
              {goal.title}
            </h3>
          </div>

          <div className="flex gap-2">
            <button
              onClick={onEdit}
              className="h-10 w-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all"
            >
              <Pencil size={18} />
            </button>
            <button
              onClick={() => {
                if (confirm('TERMINATE OBJECTIVE?')) deleteGoal(goal.id);
              }}
              className="h-10 w-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-all"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center py-4 w-full gap-8">
          <div className="relative group/ring">
            <ProgressRing progress={progress} color={stat.colorVar} size={160} />
          </div>

          <div className="w-full space-y-4 px-4">
            <div className={cn("relative h-6 group/slider", goal.isAutoTracked && "pointer-events-none")}>
              <input
                type="range"
                min="0"
                max="100"
                value={progress}
                onChange={e => !goal.isAutoTracked && updateGoal(goal.id, { progress: parseInt(e.target.value) })}
                className={cn(
                  "w-full h-full bg-white/5 rounded-full appearance-none cursor-pointer accent-white overflow-hidden border border-white/5",
                  goal.isAutoTracked && "opacity-50 grayscale"
                )}
              />
              <div
                className="absolute inset-y-0 left-0 bg-white pointer-events-none transition-all duration-300"
                style={{ width: `${progress}%`, mixBlendMode: 'difference' }}
              />
              {goal.isAutoTracked && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">Autonomous Sync Active</span>
                </div>
              )}
            </div>

            <div className={cn("flex justify-between gap-1.5", goal.isAutoTracked && "pointer-events-none opacity-50")}>
              {[0, 25, 50, 75, 100].map(val => (
                <button
                  key={val}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!goal.isAutoTracked) updateGoal(goal.id, { progress: val });
                  }}
                  className={cn(
                    "flex-1 py-1.5 rounded-xl text-[9px] font-black transition-all border",
                    progress === val
                      ? "bg-white text-black border-white"
                      : "bg-white/5 text-white/40 border-white/5 hover:bg-white/10 hover:text-white"
                  )}
                >
                  {val}%
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="w-full mt-8 flex items-end justify-between">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-white/40">
              <Clock size={12} className={timeRemaining === 'EXPIRED' ? 'text-red-400' : ''} />
              <span className={cn(
                "text-[10px] font-black uppercase tracking-widest",
                timeRemaining === 'EXPIRED' ? 'text-red-400' : ''
              )}>
                {timeRemaining}
              </span>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <Zap size={10} className="text-[var(--stat-code)]" />
                <span className="text-xs font-medium text-white/60">+{goal.xpReward}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Star size={10} className="text-[var(--stat-wealth)]" />
                <span className="text-xs font-medium text-white/60">+{goal.gcReward}</span>
              </div>
            </div>
          </div>

          {!isCompleted && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onComplete();
              }}
              className="h-12 w-12 rounded-[20px] bg-white text-black flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-xl shadow-white/20 group/btn overflow-hidden relative"
            >
              <motion.div
                className="absolute inset-0 bg-black/5 opacity-0 group-hover/btn:opacity-100 transition-opacity"
              />
              <CheckCircle2 size={24} className="relative z-10" />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}


