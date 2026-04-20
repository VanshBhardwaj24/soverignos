import { motion } from 'framer-motion';
import { Lock, Unlock, Star } from 'lucide-react';
import { cn } from '../../lib/utils';
import { SKILL_PERKS } from '../../lib/constants';

interface SkillTreeProps {
  statId: string;
  currentLevel: number;
}

export const SkillTree = ({ statId, currentLevel }: SkillTreeProps) => {
  const perks = SKILL_PERKS[statId] || [];

  return (
    <div className="relative py-12 px-6">
      <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-white/20 via-white/5 to-transparent -translate-x-1/2 pointer-events-none" />
      
      <div className="flex flex-col gap-16 relative z-10">
        {perks.map((perk, index) => {
          const isUnlocked = currentLevel >= perk.level;
          const isNext = !isUnlocked && (index === 0 || currentLevel >= perks[index-1].level);
          
          return (
            <motion.div 
              key={perk.level}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex justify-center"
            >
              <div className={cn(
                "group relative w-full max-w-sm p-6 rounded-3xl border transition-all duration-500",
                isUnlocked 
                  ? "bg-white/10 border-white/20 shadow-[0_0_30px_rgba(255,255,255,0.05)]" 
                  : isNext 
                    ? "bg-white/[0.03] border-white/10 border-dashed animate-pulse" 
                    : "bg-white/[0.01] border-white/5 opacity-40"
              )}>
                {/* Connector Dot */}
                <div className={cn(
                  "absolute -top-8 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full border-2 border-[#050505] z-20",
                  isUnlocked ? "bg-white" : "bg-white/10"
                )} />

                <div className="flex items-start gap-4">
                  <div className={cn(
                    "h-12 w-12 rounded-2xl flex items-center justify-center border transition-all duration-500",
                    isUnlocked ? "bg-white text-black shadow-2xl" : "bg-white/5 text-white/20"
                  )}>
                    {isUnlocked ? <Unlock size={20} /> : <Lock size={20} />}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                       <span className={cn(
                         "font-mono text-[8px] px-2 py-0.5 rounded border uppercase tracking-widest font-black",
                         isUnlocked ? "bg-white/20 text-white border-white/20" : "bg-white/5 text-white/20 border-white/5"
                       )}>Level {perk.level}</span>
                       {isUnlocked && <Star size={12} className="text-yellow-500 fill-yellow-500 shadow-glow" />}
                    </div>
                    <h4 className="text-lg font-black text-white uppercase italic tracking-tighter mb-1">{perk.name}</h4>
                    <p className="text-[10px] text-white/40 leading-relaxed uppercase tracking-widest font-medium">
                       {perk.desc}
                    </p>
                  </div>
                </div>

                {/* Progress bar inside card for 'Next' item */}
                {isNext && (
                  <div className="mt-4 h-1 w-full bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-white/20"
                      initial={{ width: 0 }}
                      animate={{ width: `${(currentLevel / perk.level) * 100}%` }}
                    />
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
