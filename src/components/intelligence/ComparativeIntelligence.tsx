import { Target, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useSovereignStore } from '../../store/sovereign';
import { cn } from '../../lib/utils';

export const ComparativeIntelligence = () => {
  const { surveillanceMetrics } = useSovereignStore();
  const benchmarks = surveillanceMetrics.benchmarks || [];

  return (
    <section className="p-8 rounded-3xl border border-[var(--border-default)] bg-white/[0.02] backdrop-blur-xl h-full">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-2">
          <Target size={18} className="text-blue-400" />
          <h2 className="font-mono text-xs tracking-[0.2em] uppercase text-[var(--text-secondary)]">Comparative Intelligence</h2>
        </div>
        <span className="font-mono text-[9px] text-white/20 uppercase tracking-widest">Target Profile</span>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-4 font-mono text-[9px] text-white/30 uppercase tracking-widest pb-2 border-b border-white/5">
          <span>Metric</span>
          <span className="text-right">You</span>
          <span className="text-right">Bench</span>
          <span className="text-right">Gap</span>
        </div>

        {benchmarks.map((stat: any, i: number) => {
          const gap = stat.actual - stat.benchmark;
          const isAtRisk = gap < 0;

          return (
            <div key={i} className="grid grid-cols-4 font-mono text-xs items-center group">
              <span className="text-white/60 group-hover:text-white transition-colors">{stat.label}</span>
              <span className="text-right font-bold">{stat.actual}{stat.unit}</span>
              <span className="text-right text-white/40">{stat.benchmark}{stat.unit}</span>
              <div className="flex items-center justify-end gap-2">
                <span className={cn("font-bold", isAtRisk ? "text-red-400" : "text-emerald-400")}>
                  {gap > 0 ? '+' : ''}{gap}{stat.unit}
                </span>
                {isAtRisk ? <AlertCircle size={10} className="text-red-500" /> : <CheckCircle2 size={10} className="text-emerald-500" />}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 p-4 rounded-xl bg-purple-500/5 border border-purple-500/10">
        <p className="text-[10px] text-purple-300 leading-relaxed font-mono">
          Commander, knowing the SDE-1 benchmark for consistency is 60% and yours is {surveillanceMetrics.consistency}% is actionable intelligence. Your primary bottleneck is routine stability, not technical breadth.
        </p>
      </div>
    </section>
  );
};
