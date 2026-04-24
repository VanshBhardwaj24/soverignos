import { motion } from 'framer-motion';
import { xpForLevel, totalXPForSovereigntyLevel } from '../../lib/constants';

interface XPBarProps {
  statId: string;
  name: string;
  level: number;
  xp: number;
  color: string;
}

export function XPBar({ statId, name, level, xp, color }: XPBarProps) {
  const isSovereignty = statId === 'sovereignty';

  const currentLevelXP = isSovereignty ? totalXPForSovereigntyLevel(level) : xpForLevel(level);
  const nextLevelXP = isSovereignty ? totalXPForSovereigntyLevel(level + 1) : xpForLevel(level + 1);

  const progressXP = Math.max(0, xp - currentLevelXP);
  const totalNeeded = Math.max(1, nextLevelXP - currentLevelXP);
  const percentage = Math.min(Math.max((progressXP / totalNeeded) * 100, 0), 100);

  return (
    <div className="space-y-1.5 group relative">
      <div className="flex justify-between items-end">
        <div className="flex items-center gap-2">
          <span className="eyebrow text-white/40">{name}</span>
          <span
            className="font-mono text-[10px] font-bold text-white px-1.5 py-0.5 rounded-sm"
            style={{ backgroundColor: `color-mix(in srgb, ${color} 20%, transparent)` }}
          >
            LVL {level}
          </span>
        </div>
        <span className="font-mono text-[9px] text-white/30 uppercase tabular-nums tracking-widest">{Math.floor(progressXP)} / {totalNeeded} XP</span>
      </div>
      <div className="h-2 w-full bg-white/[0.04] rounded-full overflow-hidden border border-white/5 relative">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="h-full relative rounded-full"
          style={{ backgroundColor: color, boxShadow: `0 0 20px color-mix(in srgb, ${color} 40%, transparent)` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-white/40 animate-shimmer" />
          {/* Tip Glow */}
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-full blur-[2px]" style={{ backgroundColor: color }} />
        </motion.div>
      </div>

      {/* Tooltip for Next Level */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-[var(--surface-3)] border border-[var(--border-default)] rounded-md opacity-0 group-hover:opacity-100 transition-opacity z-10 whitespace-nowrap shadow-xl pointer-events-none">
        <span className="text-[9px] font-black tracking-widest uppercase text-white/80">
          {totalNeeded - Math.floor(progressXP)} XP TO LEVEL {level + 1}
        </span>
      </div>
    </div>
  );
}
