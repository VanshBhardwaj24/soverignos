import { useSovereignStore } from '../../store/sovereign';
import { STATS } from '../../lib/constants';
import { Zap, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

export const ActivityHistory = () => {
  const activityLog = useSovereignStore(state => state.activityLog);
  const recent = activityLog.slice(0, 15);

  if (recent.length === 0) {
    return (
      <div className="p-5 rounded-[24px] border border-white/5 bg-white/[0.02] flex flex-col items-center justify-center gap-2 py-10 opacity-30">
        <Clock size={20} />
        <span className="font-bold text-[9px] uppercase tracking-widest">No activity yet</span>
      </div>
    );
  }

  const formatTime = (ts: string) => {
    const diff = Date.now() - new Date(ts).getTime();
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return `${Math.floor(diff / 86400000)}d ago`;
  };

  return (
    <div className="p-5 rounded-[24px] border border-white/5 bg-white/[0.02] flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="font-bold text-[9px] tracking-[0.3em] text-[var(--text-muted)] uppercase font-black">Activity Feed</span>
        <span className="font-bold text-[9px] text-white/20 uppercase">{recent.length} entries</span>
      </div>

      <div className="space-y-1 max-h-[300px] overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
        {recent.map((entry, i) => {
          const stat = STATS[entry.statId];
          return (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03 }}
              className="flex items-center justify-between p-2.5 rounded-xl hover:bg-white/5 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div
                  className="h-6 w-6 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${stat?.colorVar}15`, color: stat?.colorVar }}
                >
                  <Zap size={10} />
                </div>
                <div>
                  <div className="text-[10px] font-bold text-white/70 uppercase tracking-tight">{stat?.name || entry.statId}</div>
                  <div className="text-[8px] text-white/20 font-bold">{formatTime(entry.timestamp)}</div>
                </div>
              </div>
              <div className="text-right">
                <span className="font-bold text-[10px] font-black" style={{ color: stat?.colorVar }}>
                  +{entry.xp} XP
                </span>
                {entry.multiplier > 1 && (
                  <div className="text-[7px] text-[var(--success)] font-bold">{entry.multiplier.toFixed(1)}x</div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
