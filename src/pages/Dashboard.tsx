import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSovereignStore } from '../store/sovereign';
import { RadarStatChart } from '../components/stats/RadarStatChart';
import { InteractiveHeatmap } from '../components/stats/InteractiveHeatmap';
import { CheckSquare, Square, Coins, AlertCircle, Activity, Brain, Smile, Zap, Timer, Play, Pause, RotateCcw, RefreshCcw, Flame } from 'lucide-react';
import { XPBar } from '../components/stats/XPBar';
import { SystemRank } from '../components/stats/SystemRank';
import { StabilityMeter } from '../components/stats/StabilityMeter';
import { FreedomBreakdown } from '../components/stats/FreedomBreakdown';
import { ActivityHistory } from '../components/stats/ActivityHistory';
import { STATS, IDENTITY_FRAMES, computeSovereigntyLevel } from '../lib/constants';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { SalaryClockWidget } from '../components/psych/SalaryClockWidget';
import { AntiWishlistCard } from '../components/psych/AntiWishlistCard';
import { HonestSentence } from '../components/psych/HonestSentence';
import { EnergyDashboard } from '../components/psych/EnergyDashboard';
import { ConsequenceChainModal } from '../components/psych/ConsequenceChainModal';
import { StreakInsuranceModal } from '../components/psych/StreakInsuranceModal';
import { EmbargoHUD } from '../components/psych/EmbargoHUD';
import { usePsychStore } from '../store/sovereign-psych';
import { Calendar, ArrowRight } from 'lucide-react';

export default function Dashboard() {
  const {
    freedomScore, dailyQuests, addQuest,
    statLevels, statXP, gold, activityLog,
    setTargetQuestId, setPendingActivity, setProofModalOpen,
    globalStreak, failQuest, protectQuest
  } = useSovereignStore();
  const { logSkip } = usePsychStore();
  const navigate = useNavigate();

  const isSunday = new Date().getDay() === 0;

  const [now, setNow] = React.useState(new Date());
  const [consequenceQuest, setConsequenceQuest] = React.useState<{ id: string; statId: string; title: string } | null>(null);
  const [insuranceQuest, setInsuranceQuest] = React.useState<{ id: string; title: string } | null>(null);

  const currentStreak = globalStreak?.current || 0;

  const getStreakStyles = () => {
    if (currentStreak >= 30) return "text-red-500 drop-shadow-[0_0_20px_rgba(239,68,68,0.8)] scale-110";
    if (currentStreak >= 15) return "text-orange-500 drop-shadow-[0_0_15px_rgba(249,115,22,0.6)] scale-105";
    if (currentStreak >= 7) return "text-orange-400 drop-shadow-[0_0_10px_rgba(251,146,60,0.4)]";
    return "text-orange-300 opacity-60";
  };

  React.useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const [quickQuest, setQuickQuest] = React.useState('');

  const goldToday = activityLog
    .filter(log => {
      const today = new Date().toISOString().split('T')[0];
      return log.timestamp.startsWith(today);
    })
    .reduce((sum, log) => sum + (log.xp / 10), 0);

  const handleQuickAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickQuest.trim()) return;
    addQuest({
      title: quickQuest,
      xpReward: 20,
      statId: 'code',
      difficulty: 'medium',
      type: 'daily',
      priority: 'P2'
    });
    setQuickQuest('');
  };

  const getExpiryTime = (expiresAt?: string, dueDate?: string) => {
    const targetDate = dueDate || expiresAt;
    let expiry: Date;
    if (!targetDate) {
      expiry = new Date();
      expiry.setHours(23, 59, 59, 999);
    } else {
      expiry = new Date(targetDate);
    }
    const diff = expiry.getTime() - now.getTime();
    if (diff <= 0) return 'EXPIRED';
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    if (h > 0) return `${h}h ${m}m`;
    if (m > 0) return `${m}m`;
    return '< 1m';
  };

  const getExpiryColor = (expiresAt?: string, dueDate?: string) => {
    const targetDate = dueDate || expiresAt;
    let expiry: Date;
    if (!targetDate) {
      expiry = new Date();
      expiry.setHours(23, 59, 59, 999);
    } else {
      expiry = new Date(targetDate);
    }
    const diff = expiry.getTime() - now.getTime();
    if (diff <= 0) return 'text-red-500';
    const hours = diff / 3600000;
    if (hours < 1) return 'text-red-500 animate-pulse';
    if (hours < 4) return 'text-orange-500';
    return 'text-green-500';
  };

  // Intercept fail: show consequence chain first
  const handleQuestFail = (quest: { id: string; statId: string; title: string }) => {
    setConsequenceQuest(quest);
  };

  const handleConfirmSkip = async () => {
    if (!consequenceQuest) return;
    logSkip(consequenceQuest.statId);
    await failQuest(consequenceQuest.id);
    setConsequenceQuest(null);
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Consequence Chain Modal */}
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

      <div className="flex flex-col gap-8 lg:grid lg:grid-cols-12 lg:gap-8">

        {/* Left Column (Stats Panel) */}
        <div className="lg:col-span-3 flex flex-col gap-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              {/* <div className="px-2 py-0.5 bg-[var(--stat-brand)]/20 border border-[var(--stat-brand)]/30 rounded-md">
                <span className="font-mono text-[9px] font-black tracking-widest text-[var(--stat-brand)] uppercase">Sovereignty Level {computeSovereigntyLevel(Object.values(statXP).reduce((a, b) => a + b, 0))}</span>
              </div>
              <div className="h-1 w-1 rounded-full bg-white/20" />
              <span className="font-mono text-[9px] text-white/30 uppercase tracking-widest">Protocol V2.4</span> */}
            </div>
            <div className="font-mono text-5xl md:text-6xl font-light tracking-tight text-white glow-text">
              {freedomScore.toFixed(1)}
            </div>
            <div className="flex items-center justify-between mt-2">
              <div className="font-mono text-[10px] tracking-[0.2em] text-[#999999] opacity-80 uppercase">FREEDOM SCORE</div>
              <div className="flex items-center gap-1 text-[var(--stat-wealth)] font-mono text-xs font-bold px-2 py-0.5 bg-white/5 rounded-full">
                <Coins size={12} /> {gold}
              </div>
            </div>
          </div>

          <div className="space-y-4 p-4 bg-white/[0.02] border border-white/[0.05] rounded-3xl">
            <h2 className="font-mono text-[10px] tracking-[0.2em] text-white opacity-40 uppercase mb-2">Capabilities Progression</h2>
            <div className="space-y-4">
              {Object.values(STATS).map(stat => {
                const isSovereignty = stat.id === 'sovereignty';
                const currentXP = isSovereignty
                  ? Object.values(statXP).reduce((a, b) => a + b, 0)
                  : (statXP[stat.id] || 0);
                const currentLevel = isSovereignty
                  ? computeSovereigntyLevel(currentXP)
                  : (statLevels[stat.id] || 1);

                return (
                  <div key={stat.id} className={isSovereignty ? "border border-[var(--stat-brand)]/20 bg-[var(--stat-brand)]/5 p-2 rounded-xl" : ""}>
                    <XPBar
                      statId={stat.id}
                      name={stat.name}
                      level={currentLevel}
                      xp={currentXP}
                      color={stat.colorVar}
                    />
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4">
            <h2 className="font-mono text-sm tracking-[0.1em] text-white opacity-80 mb-4">CAPABILITIES RADAR</h2>
            <RadarStatChart />
          </div>

          <div className="mt-2">
            <SystemRank />
          </div>
        </div>

        {/* Center Column (Quest Board & Main Metrics) */}
        <div className="lg:col-span-6 flex flex-col gap-6">

          {/* Salary Clock — sits above everything */}
          <SalaryClockWidget />

          {/* Embargo Protocol HUD */}
          <EmbargoHUD />

          {/* Sunday Protocol Banner */}
          {isSunday && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 bg-[var(--stat-mind)]/10 border border-[var(--stat-mind)]/20 rounded-[32px] flex items-center justify-between group cursor-pointer hover:border-[var(--stat-mind)]/40 transition-all"
              onClick={() => navigate('/sunday')}
            >
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-[var(--stat-mind)]/20 flex items-center justify-center text-[var(--stat-mind)] animate-pulse">
                  <Calendar size={24} />
                </div>
                <div>
                  <h3 className="font-mono text-[10px] font-black tracking-[0.3em] text-[var(--stat-mind)] uppercase">
                    Protocol Required
                  </h3>
                  <p className="font-mono text-xl font-light text-white">
                    SUNDAY PROTOCOL ACTIVE
                  </p>
                  <p className="font-mono text-[9px] text-white/30 uppercase tracking-widest mt-1">
                    Execute ritual to synchronize system state
                  </p>
                </div>
              </div>
              <div className="h-10 w-10 rounded-full border border-white/10 flex items-center justify-center text-white/20 group-hover:text-white group-hover:border-white/30 transition-all">
                <ArrowRight size={20} />
              </div>
            </motion.div>
          )}

          <div>
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center gap-2">
                <h2 className="font-mono text-sm tracking-[0.1em] text-[var(--text-primary)] uppercase">Today's Protocols</h2>

                {/* Global Streak Indicator */}
                <div className="flex items-center gap-1.5 ml-2 px-3 py-1 bg-white/[0.03] border border-white/[0.05] rounded-full group cursor-pointer hover:border-white/20 transition-all">
                  <Flame
                    size={20}
                    className={cn("transition-all duration-700", getStreakStyles())}
                  />
                  <span className="font-mono text-xs font-black tracking-tight opacity-90">{currentStreak}</span>
                  <div className="hidden group-hover:block ml-2 font-mono text-[8px] text-white/30 uppercase tracking-widest animate-in fade-in slide-in-from-left-1">
                    GLOBAL STREAK
                  </div>
                </div>
              </div>

              <form onSubmit={handleQuickAdd} className="flex-1 max-w-xs ml-auto relative">
                <input
                  type="text"
                  value={quickQuest}
                  onChange={(e) => setQuickQuest(e.target.value)}
                  placeholder="QUICK DEPLOY MISSION..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-1.5 text-xs font-mono text-white outline-none focus:border-white/30 transition-all"
                />
                <button type="submit" className="absolute right-2 top-1.5 text-white/20 hover:text-white">
                  <CheckSquare size={14} />
                </button>
              </form>
            </div>
            <div className="flex flex-col gap-2">
              {dailyQuests.filter(q => q.type === 'daily' && q.repeating).map(quest => {
                const frame = IDENTITY_FRAMES[quest.statId];
                return (
                  <div key={quest.id} className={cn(
                    "flex items-center justify-between p-4 rounded-2xl border transition-all duration-300 group",
                    quest.completed ? (quest.repeating ? 'bg-[var(--success)]/[0.03] border-[var(--success)]/10 opacity-70' : 'bg-[var(--bg-primary)] border-[var(--border-subtle)] opacity-40') :
                      quest.type === 'boss'
                        ? 'bg-gradient-to-br from-[#111] to-[#222] border-[#7C3AED]/50 shadow-[0_0_30px_rgba(124,58,237,0.15)] ring-1 ring-[#7C3AED]/20'
                        : 'bg-white/[0.03] border-white/[0.05] hover:border-white/20'
                  )}>
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => {
                          setTargetQuestId(quest.id);
                          setPendingActivity({
                            statId: quest.statId,
                            xp: quest.xpReward,
                            questId: quest.id
                          });
                          setProofModalOpen(true);
                        }}
                        disabled={quest.completed || quest.failed}
                        className={cn(
                          "h-10 w-10 rounded-xl flex items-center justify-center transition-all",
                          quest.completed ? 'bg-[var(--success)]/10 text-[var(--success)] shadow-[0_0_10px_var(--success)]' :
                            quest.type === 'boss' ? 'bg-[#7C3AED]/20 text-[#7C3AED] border border-[#7C3AED]/30' : 'bg-white/5 text-white/40 hover:text-white hover:bg-white/10'
                        )}
                      >
                        {quest.completed ? <CheckSquare size={18} /> : <Square size={18} />}
                      </button>
                      <div>
                        {/* Identity framing */}
                        {frame && !quest.completed && (
                          <p className="font-mono text-[7px] text-white/20 uppercase tracking-widest mb-0.5">
                            {frame.identity} {frame.question.split('.')[0].toLowerCase()}.
                          </p>
                        )}
                        <div className="flex items-center gap-3 mb-1">
                          <span className={cn(
                            "font-mono text-[9px] font-black tracking-widest uppercase px-1.5 rounded",
                            quest.type === 'boss' ? 'text-[#7C3AED] bg-[#7C3AED]/20' : 'text-white/20 bg-white/5'
                          )}>
                            {quest.type}
                          </span>
                          {quest.type === 'daily' && (
                            <span className="font-mono text-[8px] text-white/30 uppercase flex items-center gap-2">
                              <span className={cn(
                                "h-1 w-1 rounded-full animate-pulse capitalize",
                                getExpiryColor(quest.expiresAt, quest.dueDate).replace('text-', 'bg-')
                              )} />
                              EXPIRING IN: <span className={cn("font-black", getExpiryColor(quest.expiresAt, quest.dueDate))}>
                                {getExpiryTime(quest.expiresAt, quest.dueDate)}
                              </span>
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={cn(
                            "font-sans text-sm font-bold tracking-tight",
                            quest.completed || quest.failed ? 'line-through text-white/20' : 'text-white'
                          )}>
                            {quest.title}
                          </span>
                          {quest.streak > 0 && (
                            <span className="text-[10px] flex items-center gap-0.5 text-orange-400 bg-orange-400/10 px-1.5 py-0.5 rounded border border-orange-400/20">
                              🔥 {quest.streak}
                            </span>
                          )}
                          {quest.repeating && <RefreshCcw size={12} className="text-[var(--success)]" />}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className={cn(
                          "font-mono text-xs font-black block",
                          quest.type === 'boss' ? 'text-[#7C3AED]' : 'text-[var(--stat-code)]'
                        )}>+{quest.xpReward} XP</span>
                        <span className="font-mono text-[8px] text-white/10 uppercase font-black">UNLOCKED</span>
                      </div>
                      {/* Fail button with consequence chain */}
                      {!quest.completed && !quest.failed && (
                        <button
                          onClick={() => handleQuestFail({ id: quest.id, statId: quest.statId, title: quest.title })}
                          className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-white/20 hover:text-red-400 hover:bg-red-500/10 transition-all"
                          title="Mark as skipped"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Honest Sentence */}
          <HonestSentence />

          <div className="w-full">
            <InteractiveHeatmap entries={activityLog.map(log => ({ timestamp: log.timestamp, xp: log.xp }))} />
          </div>
        </div>

        {/* Right Column (Intel) */}
        <div className="lg:col-span-3 flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h2 className="font-mono text-sm tracking-[0.1em] text-white">INTEL</h2>
            <div className="flex items-center gap-1.5 bg-yellow-400/10 border border-yellow-400/20 px-2 py-0.5 rounded-lg">
              <Coins size={10} className="text-yellow-400" />
              <span className="font-mono text-[10px] text-yellow-400 font-bold">+{goldToday.toFixed(1)} TODAY</span>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <FocusTimer />
            <BioSync />
            <EnergyDashboard />
            <AntiWishlistCard />
            <StabilityMeter />
            <FreedomBreakdown />
            <ActivityHistory />
            <div className="p-4 rounded-[24px] border border-white/5 bg-white/[0.02] flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <AlertCircle size={14} className="text-[var(--stat-brand)]" />
                <span className="font-mono text-[9px] tracking-[0.3em] text-[var(--text-muted)] uppercase font-black">System Oracle</span>
              </div>
              <p className="text-[10px] text-white/40 leading-relaxed font-medium">
                Analysis indicates a 12% increase in Code Capability. Network nexus is currently under-utilized.
                Recommend deploying to "APPLY" phase in Job Hunt.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

function BioSync() {
  const { moodHistory, addMoodEntry } = useSovereignStore();
  const todayEntry = moodHistory.find(m => new Date(m.date).toDateString() === new Date().toDateString());

  const [mood, setMood] = React.useState(3);
  const [energy, setEnergy] = React.useState(3);

  if (todayEntry) return (
    <div className="p-6 bg-white/[0.02] border border-white/5 rounded-[32px] overflow-hidden relative group">
      <div className="flex items-center gap-4 mb-4">
        <div className="h-10 w-10 rounded-xl bg-[var(--success)]/10 flex items-center justify-center text-[var(--success)]">
          <Activity size={20} />
        </div>
        <div>
          <h3 className="font-mono text-[10px] text-white/20 uppercase tracking-[0.2em]">Bio-Sync Status</h3>
          <span className="font-mono text-xs font-black text-[var(--success)] tracking-widest">SYNCHRONIZED</span>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white/5 p-3 rounded-2xl border border-white/5">
          <span className="block text-[8px] text-white/20 uppercase mb-1">Mood</span>
          <div className="flex gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className={cn("h-1 flex-1 rounded-full", i < todayEntry.mood ? "bg-[var(--success)]" : "bg-white/10")} />
            ))}
          </div>
        </div>
        <div className="bg-white/5 p-3 rounded-2xl border border-white/5">
          <span className="block text-[8px] text-white/20 uppercase mb-1">Energy</span>
          <div className="flex gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className={cn("h-1 flex-1 rounded-full", i < todayEntry.energy ? "bg-[var(--stat-mind)]" : "bg-white/10")} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-6 bg-white/[0.03] border border-white/10 rounded-[32px] relative overflow-hidden group shadow-2xl">
      <div className="absolute -right-4 -top-4 text-white/[0.03] group-hover:text-white/[0.05] transition-colors pointer-events-none">
        <Brain size={100} />
      </div>

      <h3 className="font-mono text-[10px] text-[var(--stat-mind)] uppercase tracking-[0.3em] font-black mb-6">Bio-Sync required</h3>

      <div className="space-y-6">
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-[9px] font-mono text-white/40 uppercase tracking-widest">Mood</span>
            <span className="text-[10px] font-black text-white">{mood}/5</span>
          </div>
          <div className="flex gap-1.5">
            {[1, 2, 3, 4, 5].map(v => (
              <button
                key={v}
                onClick={() => setMood(v)}
                className={cn(
                  "flex-1 h-8 rounded-lg border transition-all flex items-center justify-center",
                  mood === v ? "bg-white border-white text-black shadow-lg" : "bg-white/5 border-white/5 text-white/20 hover:border-white/20"
                )}
              >
                <Smile size={14} />
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-[9px] font-mono text-white/40 uppercase tracking-widest">Energy</span>
            <span className="text-[10px] font-black text-white">{energy}/5</span>
          </div>
          <div className="flex gap-1.5">
            {[1, 2, 3, 4, 5].map(v => (
              <button
                key={v}
                onClick={() => setEnergy(v)}
                className={cn(
                  "flex-1 h-8 rounded-lg border transition-all flex items-center justify-center",
                  energy === v ? "bg-[var(--stat-mind)] border-[var(--stat-mind)] text-white shadow-lg" : "bg-white/5 border-white/5 text-white/20 hover:border-white/20"
                )}
              >
                <Zap size={14} />
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={() => addMoodEntry({ mood, energy, intensity: 5, notes: '', date: new Date().toISOString() })}
          className="w-full py-3 bg-white text-black font-mono font-black tracking-widest uppercase rounded-xl hover:brightness-90 transition-all text-[9px] shadow-xl"
        >
          COMMIT BIO-METRICS
        </button>
      </div>
    </div>
  );
}

function FocusTimer() {
  const { logActivity } = useSovereignStore();
  const [minutes, setMinutes] = React.useState(25);
  const [seconds, setSeconds] = React.useState(0);
  const [isActive, setIsActive] = React.useState(false);
  const [mode, setMode] = React.useState<'focus' | 'break'>('focus');

  React.useEffect(() => {
    let interval: any = null;
    if (isActive) {
      interval = setInterval(() => {
        if (seconds > 0) {
          setSeconds(seconds - 1);
        } else if (minutes > 0) {
          setMinutes(minutes - 1);
          setSeconds(59);
        } else {
          setIsActive(false);
          const nextMode = mode === 'focus' ? 'break' : 'focus';
          setMode(nextMode);
          setMinutes(nextMode === 'focus' ? 25 : 5);
          setSeconds(0);
          if (mode === 'focus') {
            logActivity('mind', 15);
          }
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive, minutes, seconds, mode, logActivity]);

  const toggle = () => setIsActive(!isActive);
  const reset = () => {
    setIsActive(false);
    setMinutes(mode === 'focus' ? 25 : 5);
    setSeconds(0);
  };

  return (
    <div className="p-6 bg-white/[0.02] border border-white/5 rounded-[32px] overflow-hidden relative group shadow-inner">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-xl bg-white/5 flex items-center justify-center text-white/40">
            <Timer size={16} />
          </div>
          <span className="font-mono text-[9px] text-white/40 uppercase tracking-[0.2em]">Neural Lock</span>
        </div>
        <div className={cn(
          "px-3 py-1 rounded-full text-[8px] font-black font-mono tracking-widest uppercase border",
          mode === 'focus' ? "border-red-500/20 text-red-500 bg-red-500/5" : "border-green-500/20 text-green-500 bg-green-500/5"
        )}>
          {mode} mode
        </div>
      </div>

      <div className="text-center mb-8">
        <div className="text-6xl font-mono font-light tracking-tighter text-white">
          {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={toggle}
          className={cn(
            "flex-1 py-4 rounded-2xl flex items-center justify-center gap-2 transition-all",
            isActive ? "bg-white/5 text-white border border-white/10" : "bg-white text-black font-black"
          )}
        >
          {isActive ? <Pause size={16} /> : <Play size={16} />}
          <span className="font-mono text-[9px] uppercase tracking-widest text-center">{isActive ? 'SUSPEND' : 'INITIALIZE'}</span>
        </button>
        <button
          onClick={reset}
          className="w-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/20 hover:text-white transition-colors"
        >
          <RotateCcw size={16} />
        </button>
      </div>
    </div>
  );
}
