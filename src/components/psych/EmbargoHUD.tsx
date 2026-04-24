import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, Clock, Flame } from 'lucide-react';
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
          <div className="relative mb-8 rounded-[48px] border border-red-500/20 bg-black overflow-hidden shadow-2xl">
            <div className="relative z-10 p-10">
              <div className="flex items-start justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0">
                    <ShieldAlert size={20} className="text-red-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-bold text-sm font-black text-red-400 uppercase tracking-[0.3em]">
                        DIGITAL FORTRESS
                      </h3>
                      <div className="px-2 py-0.5 bg-red-500/10 border border-red-500/20 rounded-full">
                        <span className="font-bold text-[8px] text-red-400 uppercase font-black tracking-widest">DAY {daysActive + 1}</span>
                      </div>
                    </div>
                    <p className="font-bold text-[10px] text-white/30 uppercase tracking-[0.1em]">
                      Dopamine sources restricted.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-orange-400">
                      <Clock size={14} />
                      <span className="font-bold text-lg font-black">{daysRemaining}d</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 grid grid-cols-1 gap-2">
                {EMBARGO_RULES.slice(0, 3).map((rule, i) => (
                  <div key={i} className="flex items-center gap-3 py-1 text-white/40">
                    <span className="font-bold text-[10px] uppercase tracking-widest">{rule}</span>
                  </div>
                ))}
              </div>

              <div className="mt-8 flex items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-white/10">
                  <Flame size={14} className="text-orange-500/30" />
                  <p className="font-bold text-[8px] uppercase tracking-[0.2em] font-black">
                    LOG CREATE ACTIVITY TO RELEASE
                  </p>
                </div>
                <button
                  onClick={clearEmbargo}
                  className="font-bold text-[8px] uppercase font-black tracking-widest text-white/10 hover:text-white/30 transition-all"
                >
                  Override
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
