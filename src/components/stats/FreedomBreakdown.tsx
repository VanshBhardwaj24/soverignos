import { useSovereignStore } from '../../store/sovereign';
import { STATS } from '../../lib/constants';
import { motion } from 'framer-motion';

export const FreedomBreakdown = () => {
  const statLevels = useSovereignStore(state => state.statLevels);
  const freedomScore = useSovereignStore(state => state.freedomScore);

  const weights: Record<string, number> = {
    code: 0.22,
    wealth: 0.22,
    body: 0.15,
    mind: 0.12,
    brand: 0.15,
    network: 0.14,
  };

  const breakdown = Object.entries(weights).map(([statId, weight]) => {
    const level = statLevels[statId] || 0;
    const normalizedLevel = Math.min(level / 50, 1) * 100;
    const contribution = normalizedLevel * weight;
    return {
      id: statId,
      name: STATS[statId].name,
      color: STATS[statId].colorVar,
      contribution: contribution.toFixed(2),
      percent: ((contribution / freedomScore) * 100).toFixed(0)
    };
  });

  return (
    <div className="p-5 rounded-[24px] border border-white/5 bg-white/[0.02] flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <span className="font-bold text-[9px] tracking-[0.3em] text-[var(--text-muted)] uppercase font-black">Freedom Breakdown</span>
        <span className="font-bold text-[9px] text-white/20 uppercase">Contribution %</span>
      </div>
      
      <div className="space-y-3">
        {breakdown.map((item) => (
          <div key={item.id} className="space-y-1">
            <div className="flex justify-between text-[10px] font-bold uppercase tracking-tighter">
              <span style={{ color: item.color }} className="font-bold">{item.name}</span>
              <span className="text-white/40">{item.percent}%</span>
            </div>
            <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${Math.max(2, (Number(item.contribution) / 22) * 100)}%` }}
                className="h-full"
                style={{ backgroundColor: item.color }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
