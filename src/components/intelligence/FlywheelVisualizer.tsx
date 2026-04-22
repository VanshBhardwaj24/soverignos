import { motion } from 'framer-motion';
import { RefreshCw, Zap, AlertCircle } from 'lucide-react';
import { useSovereignStore } from '../../store/sovereign';
import { cn } from '../../lib/utils';

export const FlywheelVisualizer = () => {
  const { surveillanceMetrics } = useSovereignStore();
  const flywheels = surveillanceMetrics.flywheels || [];

  return (
    <section className="p-8 rounded-3xl border border-[var(--border-default)] bg-white/[0.02] backdrop-blur-xl h-full">
      <div className="flex items-center gap-2 mb-8">
        <RefreshCw size={18} className="text-emerald-400" />
        <h2 className="font-mono text-xs tracking-[0.2em] uppercase text-[var(--text-secondary)]">Active Flywheels</h2>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {flywheels.map((flywheel: any, i: number) => (
          <div key={i} className="p-6 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 space-y-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2 text-emerald-400">
                <Zap size={14} />
                <span className="font-mono text-[10px] font-black uppercase">{flywheel.label}</span>
              </div>
              <span className={cn(
                "font-mono text-[10px] uppercase",
                flywheel.active ? "text-emerald-400" : "text-white/20"
              )}>
                {flywheel.active ? `${flywheel.strength}% Strong` : 'Inactive'}
              </span>
            </div>

            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="relative aspect-square w-32 shrink-0">
                <motion.div 
                  animate={{ rotate: flywheel.active ? 360 : 0 }}
                  transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
                  className={cn(
                    "absolute inset-0 rounded-full border-2 border-dashed",
                    flywheel.active ? "border-emerald-500/30" : "border-white/5"
                  )}
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
                  <span className="font-mono text-[8px] text-white/20 uppercase">Status</span>
                  <span className={cn(
                    "text-xs font-bold tracking-tighter uppercase",
                    flywheel.active ? "text-emerald-400" : "text-white/40"
                  )}>
                    {flywheel.active ? 'Accelerating' : 'Stalled'}
                  </span>
                </div>
              </div>

              <div className="flex-1 space-y-4">
                <p className="text-[10px] font-mono text-white/60 leading-relaxed">
                  {flywheel.path}
                </p>
                {!flywheel.active && (
                  <div className="flex items-center gap-2 text-red-400">
                    <AlertCircle size={12} />
                    <span className="font-mono text-[9px] uppercase font-black">Missing Variable: GYM Activity</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
