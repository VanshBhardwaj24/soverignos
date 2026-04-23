import { motion } from 'framer-motion';
import { BarChart2, ChevronRight, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useSovereignStore } from '../../store/sovereign';
import { usePsychStore } from '../../store/sovereign-psych';
import { cn } from '../../lib/utils';

interface Props {
  onComplete: () => void;
}

interface MetricRow {
  label: string;
  value: string | number;
  subLabel?: string;
  color?: string;
  trend?: 'up' | 'down' | 'flat';
}

function getStartOfWeek(): Date {
  const d = new Date();
  d.setDate(d.getDate() - d.getDay());
  d.setHours(0, 0, 0, 0);
  return d;
}

export function SundayNumbers({ onComplete }: Props) {
  const { activityLog, jobApplications, dailyQuests, freedomScore, snapshotHistory } = useSovereignStore();
  const { energyLogs, dailySentences } = usePsychStore();

  const weekStart = getStartOfWeek();

  // Filter this week's data
  const thisWeekActivity = activityLog.filter(a => new Date(a.timestamp) >= weekStart);
  const thisWeekJobs = jobApplications.filter(j => {
    const d = j.appliedAt ? new Date(j.appliedAt) : null;
    return d && d >= weekStart;
  });
  const thisWeekEnergy = energyLogs.filter(e => new Date(e.date + 'T00:00:00') >= weekStart);
  const thisWeekSentences = dailySentences.filter(s => new Date(s.date + 'T00:00:00') >= weekStart);

  // Count by stat
  const statDays = (statId: string) => {
    const days = new Set<string>();
    thisWeekActivity.filter(a => (a as any).stat === statId || a.statId === statId).forEach(a => {
      days.add(a.timestamp.split('T')[0]);
    });
    return days.size;
  };

  const totalXP = thisWeekActivity.reduce((s, a) => s + a.xp, 0);
  const avgEnergy = thisWeekEnergy.length
    ? (thisWeekEnergy.reduce((s, e) => s + e.level, 0) / thisWeekEnergy.length).toFixed(1)
    : '—';

  // Freedom delta from last week's snapshot
  const lastWeekSnapshot = snapshotHistory?.[snapshotHistory.length - 2];
  const freedomDelta = lastWeekSnapshot
    ? (freedomScore - (lastWeekSnapshot.freedomScore || 0)).toFixed(1)
    : null;

  const completedQuests = dailyQuests.filter(q => q.completed).length;
  const failedQuests = dailyQuests.filter(q => q.failed).length;

  const metrics: MetricRow[] = [
    { label: 'Total XP Earned', value: totalXP, color: 'text-[var(--stat-code)]', trend: totalXP > 500 ? 'up' : totalXP < 200 ? 'down' : 'flat' },
    { label: 'Code Days', value: `${statDays('code')}/7`, subLabel: 'days with code activity' },
    { label: 'Body Days', value: `${statDays('body')}/7`, subLabel: 'days with gym/exercise' },
    { label: 'Mind Days', value: `${statDays('mind')}/7`, subLabel: 'days with deep study' },
    { label: 'Brand Days', value: `${statDays('brand')}/7`, subLabel: 'days posted publicly' },
    { label: 'Create Days', value: `${statDays('create')}/7`, subLabel: 'days with creative output' },
    { label: 'Applications Sent', value: thisWeekJobs.length, subLabel: 'job applications', color: thisWeekJobs.length >= 5 ? 'text-[var(--success)]' : 'text-orange-400', trend: thisWeekJobs.length >= 5 ? 'up' : 'down' },
    { label: 'Energy Avg', value: `${avgEnergy}/5`, subLabel: 'wake-up energy' },
    { label: 'Honest Sentences', value: `${thisWeekSentences.length}/7`, subLabel: 'days logged' },
    { label: 'Quests Completed', value: completedQuests, color: 'text-[var(--success)]' },
    { label: 'Quests Failed', value: failedQuests, color: failedQuests > 3 ? 'text-red-400' : 'text-white/40' },
    ...(freedomDelta !== null ? [{ label: 'Freedom Score Δ', value: `${Number(freedomDelta) >= 0 ? '+' : ''}${freedomDelta}`, color: Number(freedomDelta) >= 0 ? 'text-[var(--success)]' : 'text-red-400', trend: Number(freedomDelta) > 0 ? 'up' as const : Number(freedomDelta) < 0 ? 'down' as const : 'flat' as const }] : []),
  ];

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <BarChart2 size={16} className="text-[var(--stat-wealth)]" />
          <span className="font-bold text-[9px] tracking-[0.3em] text-[var(--stat-wealth)] uppercase font-black">
            Sunday Numbers
          </span>
        </div>
        <p className="font-bold text-white/30 text-xs">
          Raw data. No commentary. No color-coding the excuses.
        </p>
      </div>

      {/* Week label */}
      <div className="flex items-center gap-3 pb-3 border-b border-white/5">
        <span className="font-bold text-[8px] text-white/20 uppercase tracking-widest">
          W{new Date().toISOString().slice(0, 10).replace(/-/g, '')} REPORT
        </span>
        <span className="font-bold text-[8px] text-white/15">
          {weekStart.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} — {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' })}
        </span>
      </div>

      {/* Metric list — monospace, no frills */}
      <div className="space-y-0">
        {metrics.map((m, i) => (
          <motion.div
            key={m.label}
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.04 }}
            className="flex items-center justify-between py-2.5 border-b border-white/[0.04] last:border-0 group"
          >
            <div className="flex items-center gap-2">
              {m.trend === 'up' && <TrendingUp size={10} className="text-[var(--success)] shrink-0" />}
              {m.trend === 'down' && <TrendingDown size={10} className="text-red-400 shrink-0" />}
              {(!m.trend || m.trend === 'flat') && <Minus size={10} className="text-white/15 shrink-0" />}
              <span className="font-bold text-[10px] text-white/40 group-hover:text-white/60 transition-colors">{m.label}</span>
              {m.subLabel && (
                <span className="font-bold text-[8px] text-white/15 hidden sm:inline">{m.subLabel}</span>
              )}
            </div>
            <span className={cn('font-bold text-[11px] font-black tabular-nums', m.color || 'text-white/70')}>
              {m.value}
            </span>
          </motion.div>
        ))}
      </div>

      <button
        onClick={onComplete}
        className="w-full py-4 bg-white text-black font-bold text-[10px] font-black tracking-widest uppercase rounded-2xl hover:brightness-90 transition-all flex items-center justify-center gap-2"
      >
        Acknowledged <ChevronRight size={14} />
      </button>
    </div>
  );
}
