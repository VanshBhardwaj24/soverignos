import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, X, Clock, Flame } from 'lucide-react';
import { usePsychStore } from '../../store/sovereign-psych';

const EMBARGO_RULES = [
  '🚫 No YouTube, Netflix, or streaming',
  '🚫 No sugar, junk food, or alcohol',
  '🚫 No gaming or passive scrolling',
  '🚫 No social media except professional outreach',
  '⚡ CREATE stat output is mandatory until embargo lifts',
];

export function EmbargoHUD() {
  const { embargoActive, embargoStartDate, clearEmbargo } = usePsychStore();

  const getDaysActive = () => {
    if (!embargoStartDate) return 0;
    const diff = Date.now() - new Date(embargoStartDate).getTime();
    return Math.floor(diff / 86400000);
  };

  const daysActive = getDaysActive();
  const daysRemaining = Math.max(0, 3 - daysActive);

  return (
    <AnimatePresence>
      {embargoActive && (
        <motion.div
          initial={{ opacity: 0, y: -20, height: 0 }}
          animate={{ opacity: 1, y: 0, height: 'auto' }}
          exit={{ opacity: 0, y: -20, height: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="overflow-hidden"
        >
          <div className="relative mb-8 rounded-[28px] border border-red-500/40 bg-red-500/5 backdrop-blur-md overflow-hidden">
            {/* Animated warning stripe */}
            <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(239,68,68,0.03)_10px,rgba(239,68,68,0.03)_20px)]" />

            <div className="relative z-10 p-6 md:p-8">
              <div className="flex items-start justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center shrink-0">
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                    >
                      <ShieldAlert size={24} className="text-red-400" />
                    </motion.div>
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-mono text-sm font-black text-red-400 uppercase tracking-[0.2em]">
                        ⚠ DIGITAL FORTRESS ACTIVE
                      </h3>
                      <div className="px-2 py-0.5 bg-red-500/20 border border-red-500/30 rounded-full">
                        <span className="font-mono text-[8px] text-red-400 uppercase font-black tracking-widest">EMBARGO DAY {daysActive + 1}</span>
                      </div>
                    </div>
                    <p className="font-mono text-[10px] text-white/40 uppercase tracking-widest">
                      CREATE stat was zero for 3+ days. All dopamine sources are locked.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <div className="text-right">
                    <div className="flex items-center gap-2 text-orange-400 mb-1">
                      <Clock size={14} />
                      <span className="font-mono text-xl font-black">{daysRemaining}d</span>
                    </div>
                    <p className="font-mono text-[8px] text-white/30 uppercase tracking-widest">to release</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-2">
                {EMBARGO_RULES.map((rule, i) => (
                  <div key={i} className="flex items-center gap-3 py-2 px-4 bg-white/[0.02] border border-white/5 rounded-xl">
                    <span className="font-mono text-[11px] text-white/50">{rule}</span>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-white/20">
                  <Flame size={14} className="text-orange-500/50" />
                  <p className="font-mono text-[9px] uppercase tracking-widest">
                    Log CREATE activity daily to end the embargo early.
                  </p>
                </div>
                <button
                  onClick={clearEmbargo}
                  className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl font-mono text-[9px] uppercase font-black tracking-widest text-white/30 hover:text-white hover:border-white/20 transition-all flex items-center gap-2"
                >
                  <X size={12} /> Override (Admin)
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
