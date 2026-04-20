import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Eye, ChevronRight } from 'lucide-react';
import { usePsychStore } from '../../store/sovereign-psych';
import { useSovereignStore } from '../../store/sovereign';
import { cn } from '../../lib/utils';

interface Props {
  onComplete: () => void;
}

export function MirrorScore({ onComplete }: Props) {
  const { mirrorScores, addMirrorScore } = usePsychStore();
  const { activityLog, dailyGoalXP } = useSovereignStore();

  const [perceived, setPerceived] = useState(5);
  const [submitted, setSubmitted] = useState(false);

  // Calculate actual XP this week
  const weeklyActualXP = useMemo(() => {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay()); // Sunday = day 0
    startOfWeek.setHours(0, 0, 0, 0);
    return activityLog
      .filter(a => new Date(a.timestamp) >= startOfWeek)
      .reduce((sum, a) => sum + a.xp, 0);
  }, [activityLog]);

  const weekOf = new Date().toISOString().split('T')[0];
  const goalXP = dailyGoalXP || 100;

  // Normalized actual (1-10 scale)
  const normalizedActual = Math.min(10, Math.max(1, Math.round((weeklyActualXP / (goalXP * 7)) * 10)));
  const delusionGap = perceived - normalizedActual;

  const handleSubmit = () => {
    addMirrorScore(weekOf, perceived, weeklyActualXP, goalXP);
    setSubmitted(true);
  };

  const last8 = mirrorScores.slice(0, 8).reverse();

  const gapLabel = () => {
    if (Math.abs(delusionGap) <= 1) return { text: 'CALIBRATED', color: 'text-[var(--success)]' };
    if (delusionGap > 0) return { text: `OVERESTIMATING +${delusionGap}`, color: 'text-orange-400' };
    return { text: `UNDERESTIMATING ${delusionGap}`, color: 'text-[var(--stat-code)]' };
  };

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <Eye size={16} className="text-[var(--stat-mind)]" />
          <span className="font-mono text-[9px] tracking-[0.3em] text-[var(--stat-mind)] uppercase font-black">
            Mirror Score
          </span>
        </div>
        <p className="font-mono text-white/30 text-xs">
          The gap between how productive you feel and how productive you actually were.
        </p>
      </div>

      {/* This week's actual XP */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-4 bg-white/[0.03] border border-white/10 rounded-2xl text-center">
          <p className="font-mono text-[8px] text-white/25 uppercase tracking-widest mb-2">Actual XP This Week</p>
          <p className="font-mono text-3xl font-light text-[var(--success)]">{weeklyActualXP}</p>
          <p className="font-mono text-[8px] text-white/20">{normalizedActual}/10 normalized</p>
        </div>
        <div className="p-4 bg-white/[0.03] border border-white/10 rounded-2xl text-center">
          <p className="font-mono text-[8px] text-white/25 uppercase tracking-widest mb-2">Delusion Gap</p>
          <p className={cn('font-mono text-3xl font-light', delusionGap > 1 ? 'text-orange-400' : delusionGap < -1 ? 'text-[var(--stat-code)]' : 'text-[var(--success)]')}>
            {delusionGap > 0 ? '+' : ''}{delusionGap}
          </p>
          <p className={cn('font-mono text-[8px]', gapLabel().color)}>{gapLabel().text}</p>
        </div>
      </div>

      {/* Perceived slider */}
      {!submitted ? (
        <div className="space-y-4">
          <label className="block font-mono text-lg font-light text-white">
            How productive do you feel you were this week?
          </label>
          <div className="flex items-center gap-4">
            <span className="font-mono text-[9px] text-white/25">1</span>
            <input
              type="range"
              min={1}
              max={10}
              value={perceived}
              onChange={e => setPerceived(Number(e.target.value))}
              className="flex-1 accent-[var(--stat-mind)] h-1"
            />
            <span className="font-mono text-[9px] text-white/25">10</span>
            <span className="font-mono text-2xl font-black text-white w-8 text-center">{perceived}</span>
          </div>
          <button
            onClick={handleSubmit}
            className="w-full py-4 bg-white text-black font-mono text-[10px] font-black tracking-widest uppercase rounded-2xl hover:brightness-90 transition-all"
          >
            Commit Score
          </button>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-4 bg-[var(--stat-mind)]/5 border border-[var(--stat-mind)]/20 rounded-2xl"
        >
          <p className="font-mono text-[10px] text-[var(--stat-mind)] text-center uppercase tracking-widest">
            Score recorded. {Math.abs(delusionGap) <= 1
              ? 'Rare calibration. You know yourself.'
              : delusionGap > 1
                ? 'You\'re overestimating your output. The data doesn\'t lie.'
                : 'You\'re harder on yourself than the data suggests.'}
          </p>
        </motion.div>
      )}

      {/* Historical chart */}
      {last8.length >= 2 && (
        <div>
          <p className="font-mono text-[8px] text-white/20 uppercase tracking-widest mb-3">History</p>
          <div className="flex items-end gap-2 h-20">
            {last8.map((score, i) => (
              <div key={score.id} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full flex flex-col gap-0.5 items-center" style={{ height: '60px', justifyContent: 'flex-end' }}>
                  {/* Perceived bar */}
                  <div
                    className="w-full rounded-t-sm bg-orange-400/40"
                    style={{ height: `${(score.perceivedProductivity / 10) * 60}px` }}
                  />
                  {/* Actual bar */}
                  <div
                    className="w-full rounded-b-sm bg-[var(--success)]/40 -mt-1"
                    style={{ height: `${(score.normalizedActual / 10) * 60}px` }}
                  />
                </div>
                <span className="font-mono text-[6px] text-white/15">
                  W{i + 1}
                </span>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-4 mt-2">
            <div className="flex items-center gap-1.5">
              <div className="h-2 w-2 rounded-sm bg-orange-400/60" />
              <span className="font-mono text-[7px] text-white/20">Perceived</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-2 w-2 rounded-sm bg-[var(--success)]/60" />
              <span className="font-mono text-[7px] text-white/20">Actual</span>
            </div>
          </div>
        </div>
      )}

      {submitted && (
        <button
          onClick={onComplete}
          className="w-full py-4 bg-white/5 border border-white/10 text-white font-mono text-[10px] font-black tracking-widest uppercase rounded-2xl hover:bg-white/10 transition-all flex items-center justify-center gap-2"
        >
          Continue <ChevronRight size={14} />
        </button>
      )}
    </div>
  );
}
