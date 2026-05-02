import { memo } from 'react';
import { useSovereignStore } from '../../store/sovereign';
import { Shield } from 'lucide-react';
import { cn } from '../../lib/utils';
import { getRank as getCentralizedRank } from '../../lib/constants';

export const SystemRank = memo(function SystemRank() {
  const freedomScore = useSovereignStore(state => state.freedomScore);

  const centralizedRank = getCentralizedRank(freedomScore);
  const rank = {
    title: centralizedRank.name,
    color: centralizedRank.color,
    bg: centralizedRank.tier === 0 ? 'bg-zinc-800' : 
        centralizedRank.tier === 6 ? 'bg-white' : `bg-[${centralizedRank.color}]/10`,
    text: centralizedRank.tier === 6 ? 'text-black' : 'text-white'
  };

  return (
    <div className="flex flex-col gap-1.5 p-4 rounded-3xl bg-white/[0.03] border border-white/10">
      <div className="flex items-center justify-between">
        <span className="font-bold text-[9px] tracking-[0.3em] text-[var(--text-muted)] uppercase font-black">Authentication Rank</span>
        <Shield size={12} className={cn("opacity-50", rank.text)} style={{ color: rank.color }} />
      </div>
      <div className="flex items-baseline gap-2">
        <span className={cn(
          "px-2 py-0.5 rounded text-[10px] font-black tracking-widest uppercase border border-white/5 shadow-sm",
          rank.bg, rank.text
        )} style={centralizedRank.tier !== 0 && centralizedRank.tier !== 6 ? { backgroundColor: `${rank.color}20`, color: rank.color, borderColor: `${rank.color}30` } : {}}>
          {rank.title}
        </span>
      </div>
    </div>
  );
});
