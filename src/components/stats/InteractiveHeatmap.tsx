import { Activity } from 'lucide-react';
import { useMemo, memo } from 'react';
import { motion } from 'framer-motion';

interface Props {
  entries: { timestamp: string; xp: number }[];
}

export const InteractiveHeatmap = memo(({ entries = [] }: Props) => {
  const daysInYear = 365;
  
  const heatmapData = useMemo(() => {
    const data = Array.from({ length: daysInYear }, () => 0);
    if (!entries || !Array.isArray(entries)) return data;
    
    const now = new Date();
    
    entries.forEach(entry => {
      const entryDate = new Date(entry.timestamp);
      const diffTime = now.getTime() - entryDate.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays >= 0 && diffDays < daysInYear) {
        const index = (daysInYear - 1) - diffDays;
        data[index] += 1;
      }
    });
    
    return data;
  }, [entries]);

  const getColor = (val: number) => {
    if (val === 0) return 'bg-[#1A1A1A] border-white/5';
    if (val <= 2) return 'bg-[var(--stat-brand)]/20 border-[var(--stat-brand)]/10';
    if (val <= 5) return 'bg-[var(--stat-brand)]/40 border-[var(--stat-brand)]/20';
    if (val <= 8) return 'bg-[var(--stat-brand)]/70 border-[var(--stat-brand)]/30';
    return 'bg-[var(--stat-brand)] border-white/50';
  };

  return (
    <div className="w-full bg-white/[0.03] border border-white/10 rounded-2xl p-6 overflow-hidden backdrop-blur-md">
      <div className="flex justify-between items-center mb-6">
        <h2 className="font-bold text-[9px] tracking-[0.3em] text-white/40 flex items-center gap-2 uppercase font-black">
          <Activity size={14} className="text-[var(--stat-brand)]" /> Contribution Heatmap (YTD)
        </h2>
        <div className="flex items-center gap-4">
           <span className="font-bold text-[9px] text-[var(--stat-brand)] border border-[var(--stat-brand)]/20 bg-[var(--stat-brand)]/5 rounded px-2 py-0.5 font-bold uppercase tracking-widest">
             {entries.length} SESSIONS
           </span>
        </div>
      </div>
      
      <div className="flex flex-col gap-1 overflow-x-auto pb-4 custom-scrollbar" style={{ scrollbarWidth: 'none' }}>
        <div className="flex gap-1.5">
           {Array.from({ length: 52 }).map((_, weekIndex) => (
             <div key={weekIndex} className="flex flex-col gap-1.5">
               {Array.from({ length: 7 }).map((_, dayIndex) => {
                 const dayOfYear = weekIndex * 7 + dayIndex;
                 if (dayOfYear >= daysInYear) return <div key={dayIndex} className="w-3.5 h-3.5" />;
                 const val = heatmapData[dayOfYear];
                 return (
                   <motion.div 
                     key={dayIndex} 
                     whileHover={{ scale: 1.5, zIndex: 50 }}
                     className={`w-3.5 h-3.5 rounded-[3px] transition-all cursor-crosshair border ${getColor(val)}`}
                     title={`Activity Volume: ${val}`}
                   />
                 )
               })}
             </div>
           ))}
        </div>
      </div>
      
      <div className="flex items-center gap-3 mt-2 justify-end">
        <span className="font-bold text-[8px] text-white/20 uppercase tracking-widest font-black">Low</span>
        <div className="flex gap-1">
          <div className="w-3 h-3 rounded-[2px] bg-[#1A1A1A] border border-white/5"></div>
          <div className="w-3 h-3 rounded-[2px] bg-[var(--stat-brand)]/20 border border-[var(--stat-brand)]/10"></div>
          <div className="w-3 h-3 rounded-[2px] bg-[var(--stat-brand)]/40 border border-[var(--stat-brand)]/20"></div>
          <div className="w-3 h-3 rounded-[2px] bg-[var(--stat-brand)]/70 border border-[var(--stat-brand)]/30"></div>
          <div className="w-3 h-3 rounded-[2px] bg-[var(--stat-brand)] border border-white/50"></div>
        </div>
        <span className="font-bold text-[8px] text-white/20 uppercase tracking-widest font-black">High</span>
      </div>

    </div>
  )
});


