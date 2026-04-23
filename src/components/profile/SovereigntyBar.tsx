import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { computeSovereigntyLevel, totalXPForSovereigntyLevel, getSovereigntyRank } from '../../lib/constants';
import { Zap, ChevronRight, TrendingUp } from 'lucide-react';
import { cn } from '../../lib/utils';

interface SovereigntyBarProps {
  totalXP: number;
}

export const SovereigntyBar = ({ totalXP }: SovereigntyBarProps) => {
  const currentLevel = useMemo(() => computeSovereigntyLevel(totalXP), [totalXP]);
  const currentLevelXP = totalXPForSovereigntyLevel(currentLevel);
  const nextLevelXP = totalXPForSovereigntyLevel(currentLevel + 1);
  
  const progressInLevel = totalXP - currentLevelXP;
  const xpNeededForNext = nextLevelXP - currentLevelXP;
  const progressPercent = Math.min(100, Math.max(0, (progressInLevel / xpNeededForNext) * 100));
  
  const rank = getSovereigntyRank(currentLevel);

  return (
    <div className="bg-white/[0.03] border border-white/10 rounded-[40px] p-8 md:p-10 relative overflow-hidden backdrop-blur-md shadow-2xl">
      {/* Background Accent Grid */}
      <div className="absolute inset-0 opacity-10 pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }} />
      
      <div className="relative z-10 space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-4">
             <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-white/5 border border-white/10">
                    <Zap size={16} className="text-white/60" />
                </div>
                <span className="font-bold text-[10px] tracking-[0.4em] text-white/40 uppercase font-black">Life Progression Matrix</span>
             </div>
             
             <div>
                <h3 className="text-xl font-bold font-black text-white/20 uppercase tracking-[0.2em]">Overall Sovereignty</h3>
                <div className="flex items-baseline gap-4 mt-2">
                    <span className="text-6xl font-black text-white italic tracking-tighter uppercase">LVL {currentLevel}</span>
                    <div className="px-4 py-1.5 rounded-xl border-2 border-white text-white font-black italic text-lg shadow-[0_0_20px_rgba(255,255,255,0.3)]"
                         style={{ borderColor: rank.color, color: rank.color, boxShadow: `0 0 20px ${rank.color}44` }}>
                        {rank.name}
                    </div>
                </div>
             </div>
          </div>

          <div className="text-left md:text-right space-y-2">
            <div className="flex items-center md:justify-end gap-2 text-white/40">
                <TrendingUp size={14} />
                <span className="font-bold text-[10px] font-black uppercase tracking-widest">Next Threshold</span>
            </div>
            <div className="font-bold text-2xl font-black text-white">
                {nextLevelXP.toLocaleString()}<span className="text-xs text-white/20 font-light ml-1 uppercase">Total XP</span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
            <div className="flex justify-between items-end mb-2">
                <span className="font-bold text-[9px] text-white/40 uppercase tracking-widest font-black">
                    Progress to Level {currentLevel + 1}
                </span>
                <span className="font-bold text-xl font-black text-white italic">
                    {Math.floor(progressPercent)}%
                </span>
            </div>
            
            <div className="h-6 w-full bg-white/5 rounded-full border border-white/10 p-1 relative overflow-hidden">
                {/* Segmented Bar Look */}
                <div className="absolute inset-0 flex justify-between px-4 pointer-events-none">
                    {[1,2,3,4,5,6,7,8,9].map(i => (
                        <div key={i} className="h-full w-px bg-white/10" />
                    ))}
                </div>
                
                <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercent}%` }}
                    transition={{ duration: 1.5, ease: "circOut" }}
                    className="h-full rounded-full bg-gradient-to-r from-white/20 via-white to-white/20 shadow-[0_0_20px_rgba(255,255,255,0.4)] relative"
                    style={{ backgroundColor: rank.color }}
                >
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                </motion.div>
            </div>

            <div className="flex justify-between font-bold text-[9px] text-white/20 uppercase tracking-[0.2em] font-black">
                <span>{totalXP.toLocaleString()} XP COMMITTED</span>
                <span>{(nextLevelXP - totalXP).toLocaleString()} XP REMAINING</span>
            </div>
        </div>

        {/* Rank Progression Map (Mini) */}
        <div className="pt-6 border-t border-white/5 flex items-center gap-4 overflow-x-auto no-scrollbar">
            {['INITIATE', 'RECRUIT', 'OPERATIVE', 'AGENT', 'COMMANDER', 'SOVEREIGN', 'ASCENDANT'].map((r, i) => {
                const isActive = rank.name === r;
                const isPast = ['INITIATE', 'RECRUIT', 'OPERATIVE', 'AGENT', 'COMMANDER', 'SOVEREIGN', 'ASCENDANT'].indexOf(rank.name) > i;
                
                return (
                    <div key={r} className="flex items-center gap-4 shrink-0">
                        <div className={cn(
                            "flex flex-col items-center gap-2",
                            isActive ? "opacity-100" : isPast ? "opacity-60" : "opacity-20"
                        )}>
                            <div className={cn(
                                "w-2 h-2 rounded-full",
                                isActive ? "bg-white shadow-[0_0_10px_white]" : isPast ? "bg-white/40" : "bg-white/10"
                            )} />
                            <span className="font-bold text-[8px] font-black tracking-widest">{r}</span>
                        </div>
                        {i < 6 && <ChevronRight size={10} className="text-white/10" />}
                    </div>
                )
            })}
        </div>
      </div>
    </div>
  );
};
