import { motion } from 'framer-motion';
import { Activity } from 'lucide-react';

export function StabilityMeter() {
  // Mock logic: stability based on current freedom score + some randomness for flavor
  const stability = 85.4; 
  
  return (
    <div className="p-5 rounded-3xl bg-white/[0.03] border border-white/10 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
           <Activity size={14} className="text-[#00FFA3]" />
           <span className="font-mono text-[9px] tracking-[0.3em] text-[var(--text-muted)] uppercase font-black">System Stability</span>
        </div>
        <span className="font-mono text-[10px] font-black text-[#00FFA3]">{stability}%</span>
      </div>

      <div className="h-12 flex items-end gap-1 px-1">
        {[40, 60, 45, 80, 70, 90, 85].map((val, i) => (
          <motion.div 
            key={i}
            initial={{ height: 0 }}
            animate={{ height: `${val}%` }}
            transition={{ delay: i * 0.1 }}
            className="flex-1 bg-gradient-to-t from-[#00FFA3]/10 to-[#00FFA3]/40 rounded-t-sm"
          />
        ))}
      </div>
      
      <p className="text-[10px] font-mono text-white/20 uppercase tracking-tighter leading-tight">
        Operational integrity is nominal. No significant divergence detected in local timelines.
      </p>
    </div>
  );
}
