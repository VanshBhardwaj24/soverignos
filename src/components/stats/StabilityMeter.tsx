import { motion } from 'framer-motion';
import { Activity } from 'lucide-react';
import { useSovereignStore } from '../../store/sovereign';
import { memo } from 'react';

export const StabilityMeter = memo(function StabilityMeter() {
  const { integrity } = useSovereignStore();
  const stability = integrity || 85.4;

  return (
    <div className="p-5 rounded-[24px] bg-white/[0.02] border border-white/5 flex flex-col gap-4 shadow-lg relative overflow-hidden group">
      <div className="absolute inset-0 bg-noise opacity-5 pointer-events-none" />
      <div className="flex items-center justify-between relative z-10">
        <div className="flex items-center gap-2">
          <Activity size={14} className="text-[#00FFA3] drop-shadow-[0_0_5px_#00FFA3]" />
          <span className="font-bold text-[9px] tracking-[0.3em] text-[var(--text-muted)] uppercase font-black">System Stability</span>
        </div>
        <span className="font-bold text-[10px] font-black text-[#00FFA3] drop-shadow-[0_0_5px_#00FFA3]">{stability}%</span>
      </div>

      <div className="relative h-12 flex items-end gap-1 px-1 z-10 mt-2">
        <div className="absolute top-0 bottom-0 left-0 right-0 pointer-events-none flex items-end opacity-20">
          <div className="w-full h-full bg-gradient-to-t from-[#00FFA3]/20 to-transparent blur-md" />
        </div>

        {/* Pulsing White Tick Line representing current stability */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute bottom-0 w-full h-[2px] bg-white/20 z-20 pointer-events-none"
          style={{ bottom: `${stability}%` }}
        >
          <div className="absolute right-0 w-2 h-2 -translate-y-1/2 bg-white rounded-full shadow-[0_0_10px_white] animate-pulse" />
          <div className="absolute left-0 w-full h-full bg-gradient-to-r from-transparent via-white/50 to-white animate-pulse" />
        </motion.div>

        {[40, 60, 45, 80, 70, 90, 85].map((val, i) => (
          <motion.div
            key={i}
            initial={{ height: 0 }}
            animate={{ height: `${val}%` }}
            transition={{ delay: i * 0.1, duration: 0.5, ease: "easeOut" }}
            className="flex-1 bg-gradient-to-t from-[#00FFA3]/40 to-[#00FFA3]/80 rounded-t-md shadow-[0_0_10px_rgba(0,255,163,0.2)]"
          />
        ))}
      </div>

      <p className="text-[10px] font-bold text-white/40 uppercase tracking-tighter leading-tight relative z-10">
        Operational integrity is nominal. No significant divergence detected in local timelines.
      </p>
    </div>
  );
});
