import { Eye, Activity } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useSovereignStore } from '../../store/sovereign';

export const AttentionAudit = () => {
  const { surveillanceMetrics } = useSovereignStore();
  const audit = surveillanceMetrics.attentionAudit || [];

  const highestDrain = audit.reduce((prev: any, current: any) => 
    (prev.percentage > current.percentage) ? prev : current, 
    { label: 'None', percentage: 0 }
  );

  return (
    <section className="p-8 rounded-3xl border border-[var(--border-default)] bg-white/[0.02] backdrop-blur-xl h-full">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-2">
          <Eye size={18} className="text-cyan-400" />
          <h2 className="font-mono text-xs tracking-[0.2em] uppercase text-[var(--text-secondary)]">Attention Audit</h2>
        </div>
        <div className="flex gap-4 font-mono text-[9px] uppercase tracking-widest">
          <div className="flex items-center gap-2 text-emerald-400">
            <Activity size={10} />
            Live Stream
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {audit.map((item: any, i: number) => (
          <div key={i} className="space-y-2">
            <div className="flex justify-between items-end">
              <span className="font-mono text-xs text-white/80">{item.label}</span>
              <div className="flex items-center gap-4">
                <span className="font-mono text-[9px] text-white/40 uppercase tracking-widest">Output: {item.output}</span>
                <span className="font-mono text-xs font-bold text-white">{item.percentage}%</span>
              </div>
            </div>
            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
              <div 
                className={cn(
                  "h-full rounded-full transition-all duration-1000",
                  item.label.includes('Anxiety') ? "bg-red-500" : "bg-blue-400"
                )} 
                style={{ width: `${item.percentage}%` }} 
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10 p-6 rounded-2xl bg-cyan-500/5 border border-cyan-500/10 flex items-start gap-4">
        <div className="mt-1 p-2 rounded-lg bg-cyan-500/10 text-cyan-400 shrink-0">
          <Activity size={14} />
        </div>
        <div>
          <h4 className="font-mono text-[10px] text-cyan-400 uppercase tracking-widest mb-1 font-black">High ROI Reallocation</h4>
          <p className="text-[11px] text-white/60 leading-relaxed font-mono">
            {highestDrain.label} consumes {highestDrain.percentage}% of total bandwidth. 
            Shifting 10% of this to High-ROI deep work sessions would accelerate Freedom Score by 0.2 points/week.
          </p>
        </div>
      </div>
    </section>
  );
};
