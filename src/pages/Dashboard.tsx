import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSovereignStore } from '../store/sovereign';
import { InteractiveHeatmap } from '../components/stats/InteractiveHeatmap';
import { 
  Calendar, ArrowRight, CheckSquare, Square, RefreshCcw, Pause, Play, 
  RotateCcw, Gauge, Zap, Flame, ShieldCheck, Award, TrendingUp, 
  BarChart3, Database, Timer, AlertCircle, Coins, ChevronUp, ChevronDown 
} from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, BarChart, Bar, Cell, XAxis } from 'recharts';
import { XPBar } from '../components/stats/XPBar';
import { StabilityMeter } from '../components/stats/StabilityMeter';
import { FreedomBreakdown } from '../components/stats/FreedomBreakdown';
import { ActivityHistory } from '../components/stats/ActivityHistory';
import { STATS, computeSovereigntyLevel } from '../lib/constants';
import { RadarStatChart } from '../components/stats/RadarStatChart';
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

export default function Dashboard() {
  const {
    freedomScore, dailyQuests, addQuest,
    statLevels, statXP, gold, activityLog,
    setTargetQuestId, setPendingActivity, setProofModalOpen,
    globalStreak, failQuest, protectQuest,
    moodHistory, causalityDiscoveries
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

  const heatmapEntries = React.useMemo(
    () => activityLog.map(log => ({ timestamp: log.timestamp, xp: log.xp })),
    [activityLog]
  );

  const statBarData = React.useMemo(() =>
    Object.values(STATS).map(stat => {
      const isSovereignty = stat.id === 'sovereignty';
      const currentXP = isSovereignty
        ? Object.values(statXP).reduce((a, b) => a + b, 0)
        : (statXP[stat.id] || 0);
      const currentLevel = isSovereignty
        ? computeSovereigntyLevel(currentXP)
        : (statLevels[stat.id] || 1);
      return { stat, isSovereignty, currentXP, currentLevel };
    })
    , [statXP, statLevels]);

  const goldToday = React.useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return activityLog
      .filter(log => log.timestamp.startsWith(today))
      .reduce((sum, log) => sum + (log.xp / 10), 0);
  }, [activityLog]);

  const [isBentoVisible, setIsBentoVisible] = React.useState(() => {
    const saved = localStorage.getItem('sovereign_bento_visible');
    return saved !== null ? JSON.parse(saved) : true;
  });

  const toggleBento = () => {
    const newValue = !isBentoVisible;
    setIsBentoVisible(newValue);
    localStorage.setItem('sovereign_bento_visible', JSON.stringify(newValue));
  };

  const bentoData = React.useMemo(() => {
    const today = new Date().toISOString().split('T')[0];

    // XP Today
    const xpToday = activityLog
      .filter(l => l.timestamp.startsWith(today))
      .reduce((sum, l) => sum + l.xp, 0);

    // XP 7D Trend (Last 7 days)
    const sevenDaysAgoTrend = new Date();
    sevenDaysAgoTrend.setDate(sevenDaysAgoTrend.getDate() - 6);
    const trendData = Array.from({ length: 7 }).map((_, i) => {
      const date = new Date(sevenDaysAgoTrend);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      return { day: i, xp: activityLog.filter(l => l.timestamp.startsWith(dateStr)).reduce((sum, l) => sum + l.xp, 0) };
    });

    // 30-Day Growth (Cumulative)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29);
    let cumulativeXP = 0;
    const growthData = Array.from({ length: 30 }).map((_, i) => {
      const date = new Date(thirtyDaysAgo);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      cumulativeXP += activityLog.filter(l => l.timestamp.startsWith(dateStr)).reduce((sum, l) => sum + l.xp, 0);
      return { day: i, totalXP: cumulativeXP };
    });

    // Quest Progress & Stats
    const dailyRepeatingQuests = dailyQuests.filter(q => q.type === 'daily' && q.repeating);
    const completedQuests = dailyRepeatingQuests.filter(q => q.completed).length;
    const totalQuests = dailyRepeatingQuests.length;
    const topStatEntry = Object.entries(statLevels).sort((a, b) => (b[1] as number) - (a[1] as number))[0];
    const topStat = STATS[topStatEntry?.[0] as keyof typeof STATS] || STATS.code;

    // 6-Point Cognitive Architecture (7D)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    const midPoint = new Date();
    midPoint.setDate(midPoint.getDate() - 3);

    const allocationData = Object.values(STATS).map(stat => {
      const entries = activityLog.filter(l => l.statId === stat.id && new Date(l.timestamp) >= sevenDaysAgo);
      const xp = entries.reduce((s, l) => s + l.xp, 0);
      const value = (xp * 0.7) + (entries.length * 25 * 0.3);
      return { id: stat.id, name: stat.name.toUpperCase(), value, color: `var(${stat.colorVar})` };
    });

    const totalWeighted = allocationData.reduce((a, b) => a + b.value, 0);

    // Balance Index
    let balanceIndex = 0;
    if (totalWeighted > 0) {
      const values = allocationData.map(d => d.value);
      const mean = totalWeighted / 7;
      const variance = values.map(v => Math.pow(v - mean, 2)).reduce((a, b) => a + b, 0) / 7;
      const cv = Math.sqrt(variance) / (mean || 1);
      balanceIndex = Math.max(0, Math.min(100, Math.floor(100 * (1 - cv / 2))));
    }

    const blindSpot = totalWeighted > 0 ? allocationData.sort((a, b) => a.value - b.value)[0] : null;

    // Consistency & Success Rate
    const activeDays = Array.from({ length: 7 }).filter((_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return activityLog.some(l => l.timestamp.startsWith(date.toISOString().split('T')[0]));
    }).length;

    const todayQuests = dailyQuests.filter(q => q.type === 'daily');
    const attempts = todayQuests.filter(q => q.completed || q.failed).length;
    const completed = todayQuests.filter(q => q.completed).length;

    return {
      xpToday,
      trendData,
      growthData,
      allocationData,
      balanceIndex,
      blindSpot,
      consistencyIndex: Math.floor((activeDays / 7) * 100),
      successRate: attempts > 0 ? Math.floor((completed / attempts) * 100) : 100,
      questProgress: { completed: completedQuests, total: totalQuests },
      topStat: { ...topStat, level: topStatEntry?.[1] || 0 },
      streak: currentStreak,
      gold,
      goldToday,
      freedomScore,
      intelCount: causalityDiscoveries?.length || 0,
      hasData: totalWeighted > 0
    };
  }, [activityLog, dailyQuests, statLevels, moodHistory, causalityDiscoveries, currentStreak, gold, goldToday, freedomScore]);

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

      {/* Bento Grid Intelligence Bar Toggle */}
      <div className="flex items-center justify-between mb-2 px-2">
        <div className="flex items-center gap-2 opacity-30 hover:opacity-100 transition-opacity cursor-pointer group" onClick={toggleBento}>
          {isBentoVisible ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          <span className="text-[9px] font-black uppercase tracking-[0.2em]">{isBentoVisible ? 'HIDE' : 'SHOW'} INTELLIGENCE BAR</span>
        </div>
        <div className="text-[8px] font-bold text-white/20 uppercase tracking-widest">
          SYSTEM_VERSION: 4.2.0_STABLE
        </div>
      </div>

      <AnimatePresence>
        {isBentoVisible && (
          <motion.div
            initial={{ height: 0, opacity: 0, marginBottom: 0 }}
            animate={{ height: 'auto', opacity: 1, marginBottom: 32 }}
            exit={{ height: 0, opacity: 0, marginBottom: 0 }}
            className="overflow-hidden"
          >
            <BentoMetricGrid data={bentoData} />
          </motion.div>
        )}
      </AnimatePresence>

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
        <div className="lg:col-span-3 flex flex-col gap-10">
          {/* Flat Freedom Score HUD */}
          <div className="relative pt-6">
            <div className="flex items-start justify-between">
              <div className="flex flex-col">
                <div className="text-[100px] font-bold tracking-tighter text-white leading-none">
                  {freedomScore.toFixed(1)}
                </div>
                <div className="eyebrow mt-4">
                  FREEDOM SCORE
                </div>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 rounded-full mt-10">
                <Coins size={14} className="text-yellow-400" />
                <span className="text-sm font-bold text-yellow-400">{gold}</span>
              </div>
            </div>
          </div>

          <div className="space-y-4 p-4 bg-white/[0.02] border border-white/[0.05] rounded-3xl relative overflow-hidden shadow-xl">
            <div className="absolute inset-0 bg-noise opacity-5 pointer-events-none" />
            <h2 className="font-bold text-[10px] tracking-[0.2em] text-white/60 uppercase mb-4 relative z-10">Capabilities Progression</h2>
            <div className="space-y-4 relative z-10">
              {statBarData.map(({ stat, isSovereignty, currentXP, currentLevel }) => (
                <div key={stat.id} className={isSovereignty ? "border border-[var(--stat-brand)]/20 bg-[var(--stat-brand)]/5 p-2 rounded-xl" : ""}>
                  <XPBar
                    statId={stat.id}
                    name={stat.name}
                    level={currentLevel}
                    xp={currentXP}
                    color={stat.colorVar}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 bg-white/[0.02] border border-white/[0.05] rounded-3xl relative overflow-hidden shadow-xl">
            <div className="absolute inset-0 bg-noise opacity-5 pointer-events-none" />
            <h2 className="font-bold text-[10px] tracking-[0.2em] text-white/60 uppercase mb-4 relative z-10">Neural Blueprint</h2>
            <RadarStatChart />
          </div>

          {/* <BioSync /> */}

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
                  <h3 className="font-bold text-[10px] font-black tracking-[0.3em] text-[var(--stat-mind)] uppercase">
                    Protocol Required
                  </h3>
                  <p className="font-bold text-xl font-light text-foreground">
                    SUNDAY PROTOCOL ACTIVE
                  </p>
                  <p className="font-bold text-[9px] text-foreground/50 uppercase tracking-widest mt-1">
                    Execute ritual to synchronize system state
                  </p>
                </div>
              </div>
              <div className="h-10 w-10 rounded-full border border-white/20 flex items-center justify-center text-white/40 group-hover:text-white group-hover:border-white/40 transition-all">
                <ArrowRight size={20} />
              </div>
            </motion.div>
          )}

          <div>
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center gap-2">
                <h2 className="h-card text-[var(--text-primary)]">Today's Protocols</h2>

                {/* Global Streak Indicator */}
                <div className="flex items-center gap-1.5 ml-2 px-3 py-1 bg-white/[0.03] border border-white/[0.05] rounded-full group cursor-pointer hover:border-white/20 transition-all shadow-sm">
                  <Flame
                    size={20}
                    className={cn("transition-all duration-700", getStreakStyles())}
                  />
                  <span className="font-bold text-xs font-black tracking-tight opacity-90">{currentStreak}</span>
                  <div className="hidden group-hover:block ml-2 eyebrow animate-in fade-in slide-in-from-left-1">
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
                  aria-label="Quick deploy mission"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-[11px] font-bold text-white outline-none focus:border-[var(--text-primary)]/40 focus:ring-4 focus:ring-[var(--text-primary)]/5 transition-all shadow-inner"
                />
                <button type="submit" aria-label="Deploy mission" className="absolute right-2 top-2 text-white/40 hover:text-white transition-colors">
                  <CheckSquare size={16} />
                </button>
              </form>
            </div>
            <div className="flex flex-col gap-2 relative">
              <AnimatePresence mode="popLayout">
                {dailyQuests.filter(q => q.type === 'daily' && q.repeating).map((quest, idx) => {
                  const isBoss = quest.type === 'boss';

                  return (
                    <motion.div
                      key={quest.id}
                      initial={{ opacity: 0, x: -20, filter: 'blur(10px)' }}
                      animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                      exit={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
                      transition={{
                        duration: 0.5,
                        delay: idx * 0.05,
                        ease: [0.2, 0.8, 0.2, 1]
                      }}
                      className={cn(
                        "flex items-center justify-between p-4 surface-card hover-lift group relative overflow-hidden",
                        quest.completed
                          ? (quest.repeating ? 'bg-[var(--success)]/[0.03] border-[var(--success)]/10 opacity-80' : 'bg-[var(--bg-primary)] border-[var(--border-subtle)] opacity-60')
                          : isBoss
                            ? 'bg-gradient-to-br from-[#111] to-[#222] border-[#7C3AED]/50 shadow-[0_0_30px_rgba(124,58,237,0.15)] ring-1 ring-[#7C3AED]/20'
                            : 'bg-white/[0.03] border-white/[0.05] hover:border-white/20 hover:shadow-lg'
                      )}>


                      <div className="flex items-center gap-4 relative z-10">
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
                              isBoss ? 'bg-[#7C3AED]/20 text-[#7C3AED] border border-[#7C3AED]/30 shadow-[0_0_15px_rgba(124,58,237,0.3)]' : 'bg-white/10 text-white/60 hover:text-white hover:bg-white/20 shadow-sm'
                          )}
                        >
                          {quest.completed ? <CheckSquare size={18} /> : <Square size={18} />}
                        </button>
                        <div>
                          <div className="flex items-center gap-3 mb-1">
                            <span className={cn(
                              "font-bold text-[9px] font-black tracking-widest uppercase px-1.5 rounded",
                              isBoss ? 'text-[#7C3AED] bg-[#7C3AED]/20' : 'text-white/40 bg-white/10'
                            )}>
                              {quest.type}
                            </span>
                            {quest.type === 'daily' && (
                              <span className="font-bold text-[8px] text-white/50 uppercase flex items-center gap-2">
                                <span className={cn(
                                  "h-1 w-1 rounded-full capitalize",
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
                              "h-card",
                              quest.completed || quest.failed ? 'line-through text-white/40' : 'text-white'
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
                      <div className="flex items-center gap-3 relative z-10">
                        <div className="text-right">
                          <span className={cn(
                            "font-bold text-xs font-black block",
                            isBoss ? 'text-[#7C3AED]' : 'text-[var(--stat-code)]'
                          )}>+{quest.xpReward} XP</span>
                          <span className="font-bold text-[8px] text-white/30 uppercase font-black">UNLOCKED</span>
                        </div>
                        {/* Fail button with consequence chain */}
                        {!quest.completed && !quest.failed && (
                          <button
                            onClick={() => handleQuestFail({ id: quest.id, statId: quest.statId, title: quest.title })}
                            className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-all"
                            title="Mark as skipped"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>

          {/* Honest Sentence */}
          <HonestSentence />

          <div className="w-full">
            <InteractiveHeatmap entries={heatmapEntries} />
          </div>
        </div>

        {/* Right Column (Intel) */}
        <div className="lg:col-span-3 flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h2 className="h-card">INTEL</h2>
            <div className="flex items-center gap-1.5 bg-yellow-400/10 border border-yellow-400/20 px-2 py-0.5 rounded-lg shadow-sm">
              <Coins size={10} className="text-yellow-400" />
              <span className="font-bold text-[10px] text-yellow-400 font-bold">+{goldToday.toFixed(1)} TODAY</span>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <FocusTimer />
            <EnergyDashboard />
            <AntiWishlistCard />
            <StabilityMeter />
            <FreedomBreakdown />
            <ActivityHistory />
            <LiveIntelFeed />
          </div>
        </div>
      </div>
    </div>
  );
}

const BentoMetricGrid = ({ data }: { data: any }) => {
  return (
    <div className="space-y-4">
      {/* ROW 1: Compact Stat Chips */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <CompactChip
          label="Consistency Index"
          value={`${data.consistencyIndex}%`}
          icon={Gauge}
          trend={data.consistencyIndex > 80 ? "STABLE" : "DECAY"}
          color="#00FFA3"
        />
        <CompactChip
          label="XP Today"
          value={data.xpToday}
          icon={Zap}
          trend={`+${Math.floor(data.xpToday / 100)}%`}
          color="#FFD700"
        />
        <CompactChip
          label="Mission Streak"
          value={`${data.streak}D`}
          icon={Flame}
          trend="FIRE"
          color="#FF4500"
        />
        <CompactChip
          label="Success Rate"
          value={`${data.successRate}%`}
          icon={ShieldCheck}
          trend="OPERATIONAL"
          color="#FACC15"
        />
        <CompactChip
          label="Quest Load"
          value={`${data.questProgress.completed}/${data.questProgress.total}`}
          icon={CheckSquare}
          trend={`${Math.floor((data.questProgress.completed / Math.max(data.questProgress.total, 1)) * 100)}%`}
          color="#3B82F6"
        />
      </div>

      {/* ROW 2: Rich Cards (Hidden on mobile) */}
      <div className="hidden lg:grid grid-cols-4 gap-4">
        {/* XP 7D Sparkline */}
        <RichCard label="7D XP PERFORMANCE" icon={TrendingUp}>
          <div className="h-16 w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.trendData}>
                <defs>
                  <linearGradient id="colorXP" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00FFA3" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#00FFA3" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="xp"
                  stroke="#00FFA3"
                  fillOpacity={1}
                  fill="url(#colorXP)"
                  strokeWidth={2}
                  isAnimationActive={true}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-[10px] font-bold text-[#00FFA3]">TRENDING UP</span>
            <span className="text-[10px] font-bold text-white/40">LAST 7 DAYS</span>
          </div>
        </RichCard>

        {/* Peak Capability */}
        <RichCard label="PRIMARY CAPABILITY" icon={Award}>
          <div className="flex flex-col gap-1 mt-1">
            <div className="flex items-center justify-between">
              <span className="text-lg font-black text-white uppercase italic">{data.topStat.name}</span>
              <span className="text-xs font-black text-[#00FFA3]">LVL {data.topStat.level}</span>
            </div>
            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#00FFA3] shadow-[0_0_10px_#00FFA3]"
                style={{ width: `${(data.topStat.level / 50) * 100}%` }}
              />
            </div>
            <span className="text-[8px] font-bold text-white/20 uppercase tracking-[0.2em]">DOMINANT SYSTEM PROFILE</span>
          </div>
        </RichCard>

        {/* Cognitive Architecture (Bar Chart) */}
        <RichCard
          label="COGNITIVE ARCHITECTURE"
          icon={BarChart3}
          badge={data.hasData ? `${data.balanceIndex}% BALANCE` : 'INITIALIZING'}
        >
          {!data.hasData ? (
            <div className="flex flex-col items-center justify-center h-24 text-center opacity-30">
              <Database size={24} className="mb-2 animate-pulse" />
              <span className="text-[8px] font-black uppercase tracking-widest leading-tight">
                DATA DEFICIENCY<br />
                COMPLETE MISSIONS TO INITIALIZE
              </span>
            </div>
          ) : (
            <div className="flex flex-col gap-2 mt-2">
              <div className="h-20 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart layout="vertical" data={data.allocationData} margin={{ left: -30, top: 0, right: 20, bottom: 0 }}>
                    <XAxis type="number" hide />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={6}>
                      {data.allocationData.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="flex items-center justify-between border-t border-white/5 pt-1">
                <div className="flex flex-col">
                  <span className="text-[7px] font-black text-white/20 uppercase tracking-widest">CRITICAL BLINDSPOT</span>
                  <span className="text-[9px] font-black text-red-400 uppercase">{data.blindSpot.name}</span>
                </div>
                <div className="text-right">
                  <span className="text-[7px] font-black text-white/20 uppercase tracking-widest">SYSTEM STATUS</span>
                  <span className={cn(
                    "text-[9px] font-black uppercase",
                    data.balanceIndex > 70 ? "text-[#00FFA3]" : data.balanceIndex > 40 ? "text-yellow-400" : "text-red-400"
                  )}>
                    {data.balanceIndex > 70 ? 'SYMMETRICAL' : data.balanceIndex > 40 ? 'SKEWED' : 'UNBALANCED'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </RichCard>

        {/* Cumulative Growth (30-Day) */}
        <RichCard label="30D GROWTH CURVE" icon={TrendingUp}>
          <div className="h-20 w-full mt-1">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.growthData}>
                <Area
                  type="stepAfter"
                  dataKey="totalXP"
                  stroke="#3B82F6"
                  fill="#3B82F633"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-[8px] font-black text-white/40 uppercase">Compounding XP</span>
            <span className="text-[8px] font-black text-blue-400 uppercase">30-Day Velocity</span>
          </div>
        </RichCard>
      </div>
    </div>
  );
}

const CompactChip = ({ label, value, icon: Icon, trend }: any) => (
  <div className="bg-white/[0.03] border border-white/[0.05] p-3 rounded-2xl flex flex-col gap-1 group hover:border-white/10 transition-all">
    <div className="flex items-center justify-between">
      <div className="p-1 rounded-lg bg-white/5 text-white/40 group-hover:text-white transition-colors">
        <Icon size={12} />
      </div>
      <span className="text-[8px] font-black text-[#00FFA3] tracking-tighter opacity-0 group-hover:opacity-100 transition-opacity">{trend}</span>
    </div>
    <div className="text-lg font-black text-white leading-none mt-1">{value}</div>
    <div className="text-[7px] font-black text-white/20 uppercase tracking-[0.2em]">{label}</div>
  </div>
);

const RichCard = ({ label, icon: Icon, children, badge }: any) => (
  <div className="bg-white/[0.02] border border-white/[0.05] p-3 rounded-[20px] flex flex-col gap-1 relative overflow-hidden group hover:border-white/10 transition-all">
    <div className="absolute inset-0 bg-noise opacity-5 pointer-events-none" />
    <div className="flex items-center justify-between relative z-10">
      <div className="flex items-center gap-2">
        <Icon size={12} className="text-white/20" />
        <span className="text-[8px] font-black text-white/20 uppercase tracking-[0.3em]">{label}</span>
      </div>
      {badge && (
        <span className="px-2 py-0.5 rounded-sm bg-white/5 border border-white/10 text-[7px] font-black text-white/40 uppercase tracking-widest">
          {badge}
        </span>
      )}
    </div>
    <div className="relative z-10">{children}</div>
  </div>
);

const LiveIntelFeed = () => {
  const { causalityDiscoveries } = useSovereignStore();
  const navigate = useNavigate();
  const [index, setIndex] = React.useState(0);

  const discoveries = causalityDiscoveries?.filter(d => d.status === 'verified') || [];

  React.useEffect(() => {
    if (discoveries.length <= 1) return;
    const timer = setInterval(() => {
      setIndex(prev => (prev + 1) % discoveries.length);
    }, 10000);
    return () => clearInterval(timer);
  }, [discoveries.length]);

  if (discoveries.length === 0) {
    return (
      <div className="p-5 rounded-[24px] border border-white/5 bg-white/[0.02] flex flex-col gap-4 shadow-lg relative overflow-hidden group">
        <div className="absolute inset-0 bg-noise opacity-5 pointer-events-none" />
        <div className="flex items-center gap-2 relative z-10">
          <AlertCircle size={14} className="text-[var(--stat-brand)] opacity-50" />
          <span className="font-bold text-[9px] tracking-[0.3em] text-white/40 uppercase font-black">System Oracle</span>
        </div>
        <p className="text-[10px] text-white/30 font-medium relative z-10 uppercase tracking-tighter">
          No live intelligence verified. Run causality analysis to generate insights.
        </p>
        <button
          onClick={() => navigate('/intelligence')}
          className="text-[9px] font-black text-[var(--stat-brand)] uppercase tracking-widest hover:brightness-125 transition-all text-left"
        >
          INITIALIZE ANALYSIS →
        </button>
      </div>
    );
  }

  const discovery = discoveries[index];

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={discovery.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.5 }}
        className="p-5 rounded-[24px] border border-white/10 bg-white/[0.04] flex flex-col gap-3 shadow-xl relative overflow-hidden cursor-pointer hover:border-white/20 transition-all group"
        onClick={() => navigate('/intelligence')}
      >
        <div className="absolute inset-0 bg-noise opacity-5 pointer-events-none" />

        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-2">
            <Zap size={14} className="text-[var(--stat-brand)] drop-shadow-glow" />
            <span className="font-bold text-[9px] tracking-[0.3em] text-[var(--stat-brand)] uppercase font-black">Neural Discovery</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-[8px] font-black text-white/40">STRENGTH:</span>
            <span className="text-[9px] font-black text-white">{(discovery.correlationStrength * 100).toFixed(0)}%</span>
          </div>
        </div>

        <div className="relative z-10">
          <h4 className="text-[11px] font-black text-white uppercase tracking-tight mb-1">{discovery.title}</h4>
          <p className="text-[10px] text-white/60 leading-relaxed font-medium line-clamp-2 italic">
            "{discovery.insight}"
          </p>
        </div>

        <div className="flex items-center justify-between mt-1 relative z-10">
          <div className="flex gap-1.5">
            {discoveries.map((_, i) => (
              <div key={i} className={cn("h-1 w-4 rounded-full transition-all", i === index ? "bg-[var(--stat-brand)]" : "bg-white/10")} />
            ))}
          </div>
          <span className="text-[8px] font-black text-white/40 uppercase tracking-widest">TAP FOR INTEL</span>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};


const FocusTimer = React.memo(function FocusTimer() {
  const { logActivity, activityLog } = useSovereignStore();
  const [minutes, setMinutes] = React.useState(25);
  const [seconds, setSeconds] = React.useState(0);
  const [isActive, setIsActive] = React.useState(false);
  const [mode, setMode] = React.useState<'focus' | 'break'>('focus');
  const [initialMinutes, setInitialMinutes] = React.useState(25);

  const sessionCount = React.useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return activityLog.filter(l => l.statId === 'mind' && l.timestamp.startsWith(today)).length;
  }, [activityLog]);

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
          const nextMins = nextMode === 'focus' ? initialMinutes : 5;
          setMinutes(nextMins);
          setSeconds(0);
          if (mode === 'focus') {
            logActivity('mind', 15);
          }
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive, minutes, seconds, mode, logActivity, initialMinutes]);

  const toggle = () => setIsActive(!isActive);
  const reset = () => {
    setIsActive(false);
    setMinutes(mode === 'focus' ? initialMinutes : 5);
    setSeconds(0);
  };

  const setDuration = (mins: number) => {
    setIsActive(false);
    setMinutes(mins);
    setInitialMinutes(mins);
    setSeconds(0);
    setMode('focus');
  };

  const totalSeconds = mode === 'focus' ? initialMinutes * 60 : 5 * 60;
  const currentSeconds = minutes * 60 + seconds;
  const progress = ((totalSeconds - currentSeconds) / totalSeconds) * 100;
  const ringColor = mode === 'focus' ? 'var(--danger)' : 'var(--success)';

  return (
    <div className={cn(
      "p-6 bg-white/[0.02] border border-white/5 rounded-[32px] overflow-hidden relative group shadow-lg transition-all duration-500",
      isActive && "ring-1 ring-white/10 bg-white/[0.04]"
    )}>
      <div className="absolute inset-0 bg-noise opacity-5 pointer-events-none" />

      {isActive && (
        <motion.div
          animate={{ opacity: [0.05, 0.1, 0.05] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute inset-0 pointer-events-none"
          style={{ background: `radial-gradient(circle at center, ${ringColor}20 0%, transparent 70%)` }}
        />
      )}

      <div className="flex items-center justify-between mb-6 relative z-10">
        <div className="flex flex-col">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-xl bg-white/10 flex items-center justify-center text-white/60 shadow-inner">
              <Timer size={16} />
            </div>
            <span className="font-bold text-[9px] text-white/60 uppercase tracking-[0.2em]">Neural Lock</span>
          </div>
          <span className="text-[8px] text-white/30 font-bold mt-1 uppercase tracking-widest">{sessionCount} SESSIONS TODAY</span>
        </div>
        <div className={cn(
          "px-3 py-1 rounded-full text-[8px] font-black font-bold tracking-widest uppercase border",
          mode === 'focus' ? "border-red-500/20 text-red-500 bg-red-500/5 shadow-[0_0_10px_rgba(239,68,68,0.2)]" : "border-green-500/20 text-green-500 bg-green-500/5 shadow-[0_0_10px_rgba(34,197,94,0.2)]"
        )}>
          {mode} mode
        </div>
      </div>

      <div className="flex gap-2 mb-6 relative z-10">
        {[25, 45, 90].map(m => (
          <button
            key={m}
            onClick={() => setDuration(m)}
            className={cn(
              "flex-1 py-1.5 rounded-lg text-[8px] font-black tracking-widest uppercase border transition-all",
              initialMinutes === m && mode === 'focus' ? "bg-white/10 border-white/20 text-white" : "bg-white/5 border-white/5 text-white/40 hover:border-white/10"
            )}
          >
            {m}m
          </button>
        ))}
      </div>

      <div className="relative flex items-center justify-center mb-8 h-40 relative z-10">
        <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="45" fill="transparent" stroke="rgba(255,255,255,0.15)" strokeWidth="4" />
          <motion.circle
            cx="50" cy="50" r="45" fill="transparent"
            stroke={ringColor} strokeWidth="4" strokeLinecap="round"
            strokeDasharray="282.7"
            initial={{ strokeDashoffset: 282.7 }}
            animate={{ strokeDashoffset: 282.7 - (282.7 * (progress / 100)) }}
            transition={{ duration: 1, ease: "linear" }}
            style={{ filter: `drop-shadow(0 0 4px ${ringColor})` }}
          />
        </svg>
        <div className={cn(
          "text-5xl font-bold font-light tracking-tighter text-white drop-shadow-glow transition-all",
          isActive && "scale-110"
        )}>
          {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
        </div>
      </div>

      <div className="flex gap-3 relative z-10">
        <button
          onClick={toggle}
          className={cn(
            "flex-1 py-4 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-md",
            isActive ? "bg-white/5 text-white border border-white/10 hover:bg-white/10" : "bg-white text-black font-black hover:shadow-[0_0_20px_rgba(255,255,255,0.4)]"
          )}
        >
          {isActive ? <Pause size={16} /> : <Play size={16} />}
          <span className="font-bold text-[9px] uppercase tracking-widest text-center">{isActive ? 'SUSPEND' : 'INITIALIZE'}</span>
        </button>
        <button
          onClick={reset}
          className="w-14 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/20 transition-colors shadow-sm"
        >
          <RotateCcw size={16} />
        </button>
      </div>
    </div>
  );
});
