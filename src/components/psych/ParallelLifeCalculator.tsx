import { motion } from 'framer-motion';
import { usePsychStore } from '../../store/sovereign-psych';
import { useSovereignStore } from '../../store/sovereign';
import { TrendingUp, Minus } from 'lucide-react';

interface ParallelLifeCalculatorProps {
  compact?: boolean;
}

export function ParallelLifeCalculator({ compact = false }: ParallelLifeCalculatorProps) {
  const { parallelLifeConfig } = usePsychStore();
  const { activityLog, jobApplications } = useSovereignStore();

  const { startDate, dailyTargets } = parallelLifeConfig;
  const daysSinceStart = Math.max(1, Math.floor(
    (Date.now() - new Date(startDate).getTime()) / 86400000
  ));

  // Pull real activity counts from store
  const sinceCutoff = new Date(startDate).getTime();
  const recentLogs = (activityLog || []).filter(
    (l) => l.timestamp && new Date(l.timestamp).getTime() >= sinceCutoff
  );

  const countStatDays = (statId: string) =>
    new Set(
      recentLogs
        .filter((l) => l.statId === statId)
        .map((l) => l.timestamp?.split('T')[0])
    ).size;

  const appsCount = (jobApplications || []).filter(
    (j: { date?: string }) => j.date && new Date(j.date).getTime() >= sinceCutoff
  ).length;

  const metrics = [
    {
      label: 'LeetCode Days',
      key: 'leetcode',
      actual:  countStatDays('code'),
      target:  Math.floor(daysSinceStart * dailyTargets.leetcode),
      unit: 'days',
      color: 'var(--stat-code)',
    },
    {
      label: 'Commit Days',
      key: 'commits',
      actual:  countStatDays('code'),
      target:  Math.floor(daysSinceStart * dailyTargets.commits),
      unit: 'days',
      color: 'var(--stat-code)',
    },
    {
      label: 'Applications Sent',
      key: 'applications',
      actual:  appsCount,
      target:  Math.floor(daysSinceStart * dailyTargets.applications),
      unit: '',
      color: 'var(--stat-wealth)',
    },
    {
      label: 'Gym Days',
      key: 'gym',
      actual:  countStatDays('body'),
      target:  Math.floor(daysSinceStart * dailyTargets.gym),
      unit: 'days',
      color: 'var(--stat-body)',
    },
    {
      label: 'Content Posts',
      key: 'tweets',
      actual:  countStatDays('brand'),
      target:  Math.floor(daysSinceStart * dailyTargets.tweets),
      unit: '',
      color: 'var(--stat-brand)',
    },
    {
      label: 'Cold Outreach',
      key: 'outreach',
      actual:  countStatDays('network'),
      target:  Math.floor(daysSinceStart * dailyTargets.outreach),
      unit: '',
      color: 'var(--stat-network)',
    },
  ];

  const totalGap = metrics.reduce((acc, m) => acc + Math.max(0, m.target - m.actual), 0);
  const freedomDelayDays = Math.round(totalGap * 2.5); // rough heuristic

  if (compact) {
    return (
      <div className="p-6 bg-white/[0.02] border border-white/[0.06] rounded-[28px]">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-[9px] tracking-[0.25em] text-white/30 uppercase font-black">Parallel Life</h3>
            <p className="font-bold text-sm font-light text-white">Current vs. Consistent You</p>
          </div>
          <div className="text-right">
            <p className="font-bold text-[8px] text-white/20 uppercase">Freedom delayed by</p>
            <p className="font-bold text-lg font-black text-red-400">{freedomDelayDays}d</p>
          </div>
        </div>
        <div className="space-y-2">
          {metrics.map(m => {
            const pct = m.target === 0 ? 100 : Math.min(100, Math.round((m.actual / m.target) * 100));
            return (
              <div key={m.key}>
                <div className="flex justify-between font-bold text-[8px] text-white/30 mb-1">
                  <span>{m.label}</span>
                  <span>{m.actual} / {m.target}</span>
                </div>
                <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.8, delay: 0.1 }}
                    className="h-full rounded-full"
                    style={{ background: pct >= 80 ? 'var(--success)' : pct >= 50 ? 'var(--stat-wealth)' : 'var(--stat-spirit)' }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="font-bold text-[10px] tracking-[0.3em] text-white/30 uppercase font-black mb-1">Reality Divergence Engine</h2>
        <p className="font-bold text-2xl font-light text-white">PARALLEL LIFE CALCULATOR</p>
        <p className="font-bold text-[9px] text-white/20 mt-1 uppercase tracking-widest">
          Day {daysSinceStart} since {new Date(startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
        </p>
      </div>

      {/* Freedom delay banner */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`p-6 rounded-[28px] border flex items-center justify-between ${
          freedomDelayDays === 0
            ? 'bg-green-500/10 border-green-500/20'
            : 'bg-red-500/10 border-red-500/20'
        }`}
      >
        <div>
          <p className="font-bold text-[9px] uppercase tracking-widest text-white/40">Estimated Freedom Delay</p>
          <p className={`font-bold text-4xl font-black mt-1 ${freedomDelayDays === 0 ? 'text-green-400' : 'text-red-400'}`}>
            {freedomDelayDays === 0 ? 'ON TRACK' : `+${freedomDelayDays} DAYS`}
          </p>
          <p className="font-bold text-[8px] text-white/20 mt-1">
            {freedomDelayDays === 0
              ? 'Consistent you would be proud.'
              : `The version of you that doesn't slack is ${freedomDelayDays} days ahead.`}
          </p>
        </div>
        <TrendingUp size={48} className={`${freedomDelayDays === 0 ? 'text-green-500/20' : 'text-red-500/20'}`} />
      </motion.div>

      {/* Metrics table */}
      <div className="p-6 bg-white/[0.02] border border-white/[0.06] rounded-[28px] space-y-1">
        {/* Table header */}
        <div className="grid grid-cols-5 gap-4 px-2 pb-4 border-b border-white/5">
          <span className="col-span-2 font-bold text-[8px] text-white/20 uppercase tracking-widest">Metric</span>
          <span className="font-bold text-[8px] text-white/20 uppercase tracking-widest text-center">Current You</span>
          <span className="font-bold text-[8px] text-green-400/60 uppercase tracking-widest text-center">Consistent You</span>
          <span className="font-bold text-[8px] text-white/20 uppercase tracking-widest text-right">Gap</span>
        </div>

        {metrics.map((m, i) => {
          const gap = m.target - m.actual;
          const pct = m.target === 0 ? 100 : Math.min(100, Math.round((m.actual / m.target) * 100));
          return (
            <motion.div
              key={m.key}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06 }}
              className="grid grid-cols-5 gap-4 px-2 py-3 rounded-xl hover:bg-white/[0.02] transition-colors"
            >
              <div className="col-span-2 flex items-center gap-3">
                <div className="h-2 w-2 rounded-full shrink-0" style={{ background: m.color }} />
                <span className="font-bold text-[10px] text-white/60">{m.label}</span>
              </div>
              <div className="text-center">
                <span className={`font-bold text-sm font-bold ${gap > 0 ? 'text-red-400' : 'text-white'}`}>
                  {m.actual}
                </span>
                <div className="h-1 bg-white/5 rounded-full mt-1 overflow-hidden">
                  <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: m.color, opacity: 0.6 }} />
                </div>
              </div>
              <div className="text-center">
                <span className="font-bold text-sm font-bold text-green-400">{m.target}</span>
              </div>
              <div className="text-right flex items-center justify-end gap-1">
                {gap > 0 ? (
                  <>
                    <span className="font-bold text-sm font-black text-red-400">-{gap}</span>
                  </>
                ) : (
                  <div className="flex items-center gap-1 text-green-400">
                    <Minus size={12} />
                    <span className="font-bold text-sm font-black">0</span>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      <p className="font-bold text-[8px] text-white/10 text-center uppercase tracking-widest">
        Targets based on {Math.round(dailyTargets.leetcode * 7)}/week LeetCode · {Math.round(dailyTargets.gym * 7)}/week Gym · {Math.round(dailyTargets.tweets * 7)}/week Content
      </p>
    </div>
  );
}
