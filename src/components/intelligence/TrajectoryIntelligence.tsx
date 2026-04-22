import { Gauge, Zap, AlertTriangle } from 'lucide-react';
import { useSovereignStore } from '../../store/sovereign';
import { cn } from '../../lib/utils';

export const TrajectoryIntelligence = () => {
  const { surveillanceMetrics } = useSovereignStore();
  const data = surveillanceMetrics.trajectoryData || { velocity: 0, acceleration: 0, trend: 'stable' };

  const isDecelerating = data.acceleration < 0;
  const stallWeeks = isDecelerating ? Math.abs(data.velocity / data.acceleration).toFixed(1) : 'N/A';

  return (
    <section className="p-8 rounded-3xl border border-[var(--border-default)] bg-white/[0.02] backdrop-blur-xl">
      <div className="flex items-center gap-2 mb-8">
        <Gauge size={18} className="text-orange-400" />
        <h2 className="font-mono text-xs tracking-[0.2em] uppercase text-[var(--text-secondary)]">Trajectory Intelligence</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Velocity */}
        <div className="space-y-2">
          <p className="font-mono text-[10px] text-white/40 uppercase">Current Velocity</p>
          <div className="flex items-end gap-2">
            <span className="text-4xl font-bold tracking-tighter text-white">+{data.velocity}</span>
            <span className="font-mono text-[10px] text-white/40 mb-1.5">PTS/WEEK</span>
          </div>
          <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500" style={{ width: `${Math.min(100, data.velocity * 20)}%` }} />
          </div>
        </div>

        {/* Acceleration */}
        <div className="space-y-2">
          <p className="font-mono text-[10px] text-white/40 uppercase">Current Acceleration</p>
          <div className="flex items-end gap-2">
            <span className={cn("text-4xl font-bold tracking-tighter", isDecelerating ? "text-red-400" : "text-emerald-400")}>
              {data.acceleration > 0 ? '+' : ''}{data.acceleration}
            </span>
            <span className="font-mono text-[10px] text-white/40 mb-1.5">ΔV/WEEK</span>
          </div>
          <p className={cn("font-mono text-[10px] uppercase tracking-widest", isDecelerating ? "text-red-400" : "text-emerald-400")}>
            {data.trend.toUpperCase()} {isDecelerating ? '⚠' : '✓'}
          </p>
        </div>

        {/* Prediction */}
        <div className="space-y-2">
          <p className="font-mono text-[10px] text-white/40 uppercase">System Stall Forecast</p>
          {isDecelerating ? (
            <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/10">
              <div className="flex items-center gap-2 text-red-400 mb-1">
                <AlertTriangle size={14} />
                <span className="font-mono text-[10px] font-black uppercase">Stall Predicted</span>
              </div>
              <p className="text-sm font-bold text-white tracking-tight">~{stallWeeks} Weeks to Stall</p>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
              <div className="flex items-center gap-2 text-emerald-400 mb-1">
                <Zap size={14} />
                <span className="font-mono text-[10px] font-black uppercase">Stable Growth</span>
              </div>
              <p className="text-sm font-bold text-white tracking-tight">On track for Target 80</p>
            </div>
          )}
        </div>
      </div>

      <div className="mt-8 pt-8 border-t border-white/5">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-mono text-[10px] text-white/40 uppercase tracking-widest">Acceleration Required</h3>
          <span className="text-[10px] font-mono text-emerald-400">+1.2 PTS/WEEK</span>
        </div>
        <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
          Completing <span className="text-blue-400">NETWORK missions</span> (currently 1% completion) at 50% rate would reverse current deceleration and close the gap.
        </p>
      </div>
    </section>
  );
};
