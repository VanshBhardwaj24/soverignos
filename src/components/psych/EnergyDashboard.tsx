import { useState } from 'react';
import { motion } from 'framer-motion';
import { Zap, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { usePsychStore } from '../../store/sovereign-psych';
// import { useSovereignStore } from '../../store/sovereign';
import { cn } from '../../lib/utils';

const LEVEL_LABELS: Record<number, { label: string; color: string }> = {
  1: { label: 'Depleted', color: '#FF4444' },
  2: { label: 'Low', color: '#FF7A00' },
  3: { label: 'Neutral', color: '#FFD700' },
  4: { label: 'Good', color: '#00D4FF' },
  5: { label: 'Peak', color: '#00FF88' },
};

interface CorrelationResult {
  label: string;
  delta: number;
}

function computeCorrelations(energyLogs: { date: string; level: number }[]): CorrelationResult[] {
  if (energyLogs.length < 10) return [];

  // Build lookup: date -> energy
  const energyByDate: Record<string, number> = {};
  energyLogs.forEach(e => { energyByDate[e.date] = e.level; });

  // Gym: check if body XP > 0 the day before (approximate via mood entries which have energy)
  const results: CorrelationResult[] = [];

  // Correlation: energy today vs energy yesterday (momentum)
  const momentumPairs: number[][] = [];
  energyLogs.slice(0, -1).forEach((e, i) => {
    const next = energyLogs[i + 1];
    if (next) momentumPairs.push([e.level, next.level]);
  });
  if (momentumPairs.length > 5) {
    const avgFollowUp = momentumPairs.reduce((s, p) => s + p[1], 0) / momentumPairs.length;
    const highDayFollowUp = momentumPairs.filter(p => p[0] >= 4).map(p => p[1]);
    const lowDayFollowUp = momentumPairs.filter(p => p[0] <= 2).map(p => p[1]);
    if (highDayFollowUp.length > 2) {
      const avgHigh = highDayFollowUp.reduce((s, n) => s + n, 0) / highDayFollowUp.length;
      results.push({ label: 'High energy day → next day energy', delta: avgHigh - avgFollowUp });
    }
    if (lowDayFollowUp.length > 2) {
      const avgLow = lowDayFollowUp.reduce((s, n) => s + n, 0) / lowDayFollowUp.length;
      results.push({ label: 'Low energy day → next day energy', delta: avgLow - avgFollowUp });
    }
  }

  return results.filter(r => Math.abs(r.delta) > 0.1);
}

export function EnergyDashboard() {
  const { energyLogs, logEnergy, getTodayEnergy } = usePsychStore();
  // const { moodHistory } = useSovereignStore();
  const [hoveredDay, setHoveredDay] = useState<number | null>(null);

  const todayEnergy = getTodayEnergy();
  const today = new Date().toISOString().split('T')[0];

  const last60 = energyLogs.slice(0, 60).reverse();
  const correlations = computeCorrelations(energyLogs);

  // 7-day average
  const last7 = energyLogs.slice(0, 7);
  const avg7 = last7.length > 0 ? (last7.reduce((s, e) => s + e.level, 0) / last7.length).toFixed(1) : '—';

  return (
    <div className="p-5 rounded-[24px] border border-white/[0.06] bg-white/[0.02] space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="h-7 w-7 rounded-lg bg-[var(--stat-body)]/10 flex items-center justify-center text-[var(--stat-body)]">
            <Zap size={14} />
          </div>
          <div>
            <h3 className="font-mono text-[9px] font-black tracking-[0.3em] text-[var(--stat-body)] uppercase">
              Energy Log
            </h3>
            <p className="font-mono text-[8px] text-white/25">
              7-day avg: <span className="text-white/50 font-bold">{avg7}/5</span>
            </p>
          </div>
        </div>

        {todayEnergy && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl border"
            style={{ borderColor: `${LEVEL_LABELS[todayEnergy.level].color}30`, backgroundColor: `${LEVEL_LABELS[todayEnergy.level].color}10` }}
          >
            <div className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: LEVEL_LABELS[todayEnergy.level].color }} />
            <span className="font-mono text-[9px] font-bold uppercase tracking-wider" style={{ color: LEVEL_LABELS[todayEnergy.level].color }}>
              {LEVEL_LABELS[todayEnergy.level].label}
            </span>
          </div>
        )}
      </div>

      {/* Input — only if not logged today */}
      {!todayEnergy && (
        <div>
          <p className="font-mono text-[9px] text-white/30 uppercase tracking-widest mb-2.5">
            Wake-up energy today?
          </p>
          <div className="flex gap-2">
            {([1, 2, 3, 4, 5] as const).map(level => (
              <button
                key={level}
                onClick={() => logEnergy(level)}
                className={cn(
                  'flex-1 py-3 rounded-xl border font-mono text-xs font-black transition-all active:scale-95',
                )}
                style={{
                  borderColor: `${LEVEL_LABELS[level].color}30`,
                  backgroundColor: `${LEVEL_LABELS[level].color}08`,
                  color: LEVEL_LABELS[level].color,
                }}
              >
                {level}
              </button>
            ))}
          </div>
          <div className="flex justify-between mt-1">
            <span className="font-mono text-[7px] text-white/15">DEPLETED</span>
            <span className="font-mono text-[7px] text-white/15">PEAK</span>
          </div>
        </div>
      )}

      {/* 60-day bar chart */}
      {last60.length > 0 && (
        <div>
          <p className="font-mono text-[8px] text-white/20 uppercase tracking-widest mb-2">
            60-Day Energy History
          </p>
          <div className="flex items-end gap-[2px] h-16 relative">
            {last60.map((entry, i) => {
              const isToday = entry.date === today;
              const color = LEVEL_LABELS[entry.level]?.color ?? '#555';
              const heightPct = (entry.level / 5) * 100;
              return (
                <motion.div
                  key={entry.date}
                  initial={{ scaleY: 0 }}
                  animate={{ scaleY: 1 }}
                  transition={{ delay: i * 0.005 }}
                  className="relative flex-1 rounded-sm origin-bottom cursor-pointer"
                  style={{ height: `${heightPct}%`, backgroundColor: isToday ? color : `${color}60` }}
                  onMouseEnter={() => setHoveredDay(i)}
                  onMouseLeave={() => setHoveredDay(null)}
                >
                  {hoveredDay === i && (
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 bg-[#1a1a1a] border border-white/10 rounded-lg px-2 py-1 whitespace-nowrap z-10">
                      <p className="font-mono text-[8px] text-white/50">{entry.date}</p>
                      <p className="font-mono text-[10px] font-bold" style={{ color }}>
                        {LEVEL_LABELS[entry.level]?.label} ({entry.level}/5)
                      </p>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* Correlations */}
      {correlations.length > 0 && (
        <div className="space-y-1.5">
          <p className="font-mono text-[8px] text-white/20 uppercase tracking-widest">Patterns Detected</p>
          {correlations.map((c, i) => (
            <div key={i} className="flex items-center justify-between py-1.5 border-b border-white/[0.04] last:border-0">
              <span className="font-mono text-[9px] text-white/40">{c.label}</span>
              <span className={cn('flex items-center gap-1 font-mono text-[9px] font-bold', c.delta >= 0 ? 'text-[var(--stat-body)]' : 'text-red-400')}>
                {c.delta >= 0.1 ? <TrendingUp size={10} /> : c.delta <= -0.1 ? <TrendingDown size={10} /> : <Minus size={10} />}
                {c.delta >= 0 ? '+' : ''}{c.delta.toFixed(1)}
              </span>
            </div>
          ))}
        </div>
      )}

      {energyLogs.length < 10 && (
        <p className="font-mono text-[8px] text-white/15 text-center">
          Log {10 - energyLogs.length} more days to unlock pattern detection
        </p>
      )}
    </div>
  );
}
