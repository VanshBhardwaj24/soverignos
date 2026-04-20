import { motion } from 'framer-motion';
import { xpForLevel } from '../../lib/constants';

interface XPBarProps {
  statId: string;
  name: string;
  level: number;
  xp: number;
  color: string;
}

export function XPBar({ name, level, xp, color }: XPBarProps) {
  const currentLevelXP = xpForLevel(level);
  const nextLevelXP = xpForLevel(level + 1);
  const progressXP = xp - currentLevelXP;
  const totalNeeded = nextLevelXP - currentLevelXP;
  const percentage = Math.min(Math.max((progressXP / totalNeeded) * 100, 0), 100);

  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-end">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[9px] tracking-widest text-white/40 uppercase font-black">{name}</span>
          <span className="font-mono text-[10px] text-white font-bold bg-white/5 px-1.5 rounded">LVL {level}</span>
        </div>
        <span className="font-mono text-[9px] text-white/30 uppercase">{xp} / {nextLevelXP} XP</span>
      </div>
      <div className="h-1.5 w-full bg-white/[0.03] rounded-full overflow-hidden border border-white/[0.05] relative">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="h-full relative overflow-hidden"
          style={{ backgroundColor: color }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
        </motion.div>
      </div>
    </div>
  );
}
