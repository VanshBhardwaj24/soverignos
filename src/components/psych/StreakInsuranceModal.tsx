import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, KeyRound, Check, X } from 'lucide-react';
import { usePsychStore } from '../../store/sovereign-psych';
import { cn } from '../../lib/utils';

const REQUIRED_PHRASE = 'I am consciously choosing to skip today.';

interface StreakInsuranceModalProps {
  onConfirm: () => void;
  onCancel: () => void;
  questTitle?: string;
}

export function StreakInsuranceModal({ onConfirm, onCancel, questTitle }: StreakInsuranceModalProps) {
  const { streakInsurance, useStreakInsurance } = usePsychStore();
  const [typed, setTyped] = useState('');
  const [failed, setFailed] = useState(false);
  const [used, setUsed] = useState(false);

  const isMatch = typed === REQUIRED_PHRASE;
  const isAvailable = !streakInsurance.usedThisMonth;

  const handleActivate = () => {
    if (!isMatch) { setFailed(true); return; }
    const success = useStreakInsurance();
    if (success) {
      setUsed(true);
      setTimeout(onConfirm, 1500);
    } else {
      setFailed(true);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[900] bg-black/90 backdrop-blur-xl flex items-center justify-center p-6"
    >
      <motion.div
        initial={{ scale: 0.9, y: 30 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 30 }}
        className="w-full max-w-lg bg-[#0a0a0a] border border-amber-500/30 rounded-[40px] p-10 shadow-[0_0_60px_rgba(245,158,11,0.15)] relative overflow-hidden"
      >
        {/* Glow */}
        <div className="absolute inset-0 bg-gradient-to-b from-amber-500/5 to-transparent pointer-events-none rounded-[40px]" />

        <button onClick={onCancel} className="absolute top-8 right-8 text-white/20 hover:text-white transition-colors">
          <X size={20} />
        </button>

        <AnimatePresence mode="wait">
          {used ? (
            <motion.div key="used" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-8">
              <div className="h-20 w-20 rounded-full bg-amber-500/20 flex items-center justify-center mx-auto mb-6">
                <Check size={40} className="text-amber-400" />
              </div>
              <p className="font-mono text-2xl font-black text-amber-400 uppercase">Override Activated</p>
              <p className="font-mono text-[9px] text-white/30 mt-2 uppercase tracking-widest">Streak protected. Use wisely next time.</p>
            </motion.div>
          ) : (
            <motion.div key="main" initial={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-8">
              {/* Header */}
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-[20px] bg-amber-500/10 flex items-center justify-center text-amber-400 shrink-0">
                  <Flame size={28} />
                </div>
                <div>
                  <p className="font-mono text-[10px] tracking-[0.3em] text-amber-500/60 uppercase font-black">Emergency Override</p>
                  <p className="font-mono text-2xl font-light text-white">STREAK INSURANCE</p>
                </div>
              </div>

              {/* Status */}
              <div className={cn(
                'p-5 rounded-[20px] border flex items-center gap-4',
                isAvailable
                  ? 'bg-amber-500/10 border-amber-500/30'
                  : 'bg-red-500/10 border-red-500/30'
              )}>
                <KeyRound size={20} className={isAvailable ? 'text-amber-400' : 'text-red-400'} />
                <div>
                  <p className={cn('font-mono text-[10px] font-black uppercase tracking-widest', isAvailable ? 'text-amber-400' : 'text-red-400')}>
                    {isAvailable ? '1 SOVEREIGN OVERRIDE AVAILABLE THIS MONTH' : 'NO OVERRIDES REMAINING — USED THIS MONTH'}
                  </p>
                  {streakInsurance.lastUsedDate && (
                    <p className="font-mono text-[8px] text-white/20 mt-0.5">
                      Last used: {new Date(streakInsurance.lastUsedDate).toLocaleDateString('en-IN')}
                    </p>
                  )}
                </div>
              </div>

              {questTitle && (
                <div className="px-4 py-3 bg-white/5 border border-white/10 rounded-2xl">
                  <p className="font-mono text-[8px] text-white/20 uppercase tracking-widest mb-1">Skipping quest</p>
                  <p className="font-mono text-sm text-white/60">{questTitle}</p>
                </div>
              )}

              {isAvailable ? (
                <>
                  <div>
                    <p className="font-mono text-[9px] text-white/30 uppercase tracking-widest mb-3">
                      Type exactly to activate:
                    </p>
                    <p className="font-mono text-[10px] text-amber-400/60 mb-3 italic select-none">
                      "{REQUIRED_PHRASE}"
                    </p>
                    <input
                      value={typed}
                      onChange={e => { setTyped(e.target.value); setFailed(false); }}
                      placeholder="Type the phrase exactly..."
                      className={cn(
                        'w-full bg-white/5 border rounded-xl p-4 font-mono text-sm text-white outline-none transition-all',
                        failed ? 'border-red-500/50 text-red-400' :
                        isMatch ? 'border-amber-500/50 text-amber-300' :
                        'border-white/10 focus:border-white/20'
                      )}
                    />
                    {failed && (
                      <p className="font-mono text-[8px] text-red-400 mt-2">
                        Phrase doesn't match. This is intentional — commitment requires precision.
                      </p>
                    )}
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={handleActivate}
                      disabled={!isMatch}
                      className="flex-1 py-4 bg-amber-500 text-black font-mono font-black text-[10px] uppercase tracking-widest rounded-2xl hover:brightness-110 transition-all disabled:opacity-20 disabled:cursor-not-allowed"
                    >
                      ACTIVATE OVERRIDE
                    </button>
                    <button
                      onClick={onCancel}
                      className="px-6 py-4 bg-white/5 text-white/40 font-mono text-[9px] uppercase rounded-2xl hover:text-white hover:bg-white/10 transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                </>
              ) : (
                <button
                  onClick={onCancel}
                  className="w-full py-4 bg-white/5 text-white/40 font-mono text-[10px] uppercase tracking-widest rounded-2xl hover:text-white transition-all"
                >
                  Close — No overrides remaining
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
