import { motion } from 'framer-motion';
import { Target, ShieldCheck, ArrowRight } from 'lucide-react';
import { useSovereignStore } from '../../store/sovereign';
import { cn } from '../../lib/utils';

export const PredictionEngine = () => {
  const { surveillanceMetrics } = useSovereignStore();
  const predictions = surveillanceMetrics.predictions || [];

  return (
    <section className="p-8 rounded-3xl border border-[var(--border-default)] bg-white/[0.02] backdrop-blur-xl h-full">
      <div className="flex justify-between items-start mb-10">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Target size={18} className="text-orange-400" />
            <h2 className="font-bold text-xs tracking-[0.2em] uppercase text-[var(--text-secondary)]">Prediction Engine</h2>
          </div>
          <p className="font-bold text-[9px] text-white/20 uppercase tracking-[0.2em]">Next 72-Hour Horizon</p>
        </div>
        <div className="text-right">
          <p className="font-bold text-[9px] text-white/30 uppercase tracking-widest mb-1">System Accuracy</p>
          <p className="text-xl font-bold text-white tracking-tighter">94.2%</p>
        </div>
      </div>

      <div className="space-y-4">
        {predictions.map((pred: any, i: number) => (
          <div key={i} className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 group hover:border-orange-500/30 transition-all">
            <div className="flex justify-between items-center mb-3">
              <span className="font-bold text-[11px] text-white/80">{pred.text}</span>
              <span className={cn(
                "px-2 py-0.5 rounded-full font-bold text-[8px] font-black uppercase",
                pred.status === 'High' ? "bg-red-500/20 text-red-400" : "bg-emerald-500/20 text-emerald-400"
              )}>
                {pred.status}
              </span>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${pred.prob}%` }}
                  className={cn("h-full", pred.prob > 70 ? "bg-orange-500" : "bg-blue-400")}
                />
              </div>
              <span className="font-bold text-[10px] font-bold text-white min-w-[30px]">{pred.prob}%</span>
            </div>

            {pred.beatable && (
              <div className="mt-4 flex items-center justify-between pt-3 border-t border-white/5 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="font-bold text-[9px] text-white/40 uppercase">Recommended Antidote</span>
                <button className="flex items-center gap-1 font-bold text-[9px] text-orange-400 uppercase font-black">
                  Falsify Prediction <ArrowRight size={10} />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-8 pt-8 border-t border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck size={14} className="text-emerald-400" />
          <span className="font-bold text-[9px] text-white/40 uppercase tracking-widest">falsifiable layer active</span>
        </div>
        <span className="font-bold text-[9px] text-white/20 uppercase">Last updated: Just Now</span>
      </div>
    </section>
  );
};
