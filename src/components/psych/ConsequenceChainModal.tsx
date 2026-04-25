import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle, ArrowRight, ShieldAlert } from 'lucide-react';
import { usePsychStore } from '../../store/sovereign-psych';
import { cn } from '../../lib/utils';
import { ModalPortal } from '../ui/ModalPortal';

interface Props {
  open: boolean;
  statId: string;
  questTitle: string;
  onConfirmSkip: () => void;
  onResume: () => void;
  onUseInsurance?: () => void;
}

export function ConsequenceChainModal({ open, statId, questTitle, onConfirmSkip, onResume, onUseInsurance }: Props) {
  const { consequenceChains, getRegretProbability, streakInsurance } = usePsychStore();
  const chain = consequenceChains[statId] || consequenceChains['code'];
  const regretProb = getRegretProbability(statId);
  const frame = { identity: '', question: ' Do you really want to break your streak?' };

  // Prevent body scroll when open
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  return (
    <ModalPortal>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[900] bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.92, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.92, y: 20 }}
              transition={{ type: 'spring', bounce: 0.25 }}
              className="w-full max-w-md bg-[#0d0d0d] border border-red-500/20 rounded-[28px] overflow-hidden shadow-[0_0_80px_rgba(239,68,68,0.15)]"
            >
              {/* Header */}
              <div className="px-6 pt-6 pb-4 border-b border-white/5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-8 w-8 rounded-xl bg-red-500/10 flex items-center justify-center">
                    <ShieldAlert size={16} className="text-red-500" />
                  </div>
                  <span className="font-bold text-[9px] tracking-[0.3em] text-red-100 uppercase font-black">
                    Consequence Chain
                  </span>
                </div>
                <h2 className="font-bold text-xl font-light text-white/60">
                  You're about to skip:
                </h2>
                <p className="font-sans text-2xl font-black text-white tracking-tight mt-1">
                  {questTitle}
                </p>
              </div>

              {/* Chain */}
              <div className="px-6 py-2 space-y-1 max-h-[240px] overflow-y-auto no-scrollbar">
                {chain.map((step, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.08, duration: 0.3 }}
                    className="flex items-start gap-3"
                  >
                    {/* Node */}
                    <div className="flex flex-col items-center pt-1 shrink-0">
                      <div className={cn(
                        'h-2 w-2 rounded-full border',
                        i === 0 ? 'bg-red-500 border-red-500' :
                          i === chain.length - 1 ? 'bg-red-600 border-red-600 shadow-[0_0_8px_rgba(239,68,68,0.8)]' :
                            'bg-white/20 border-white/10'
                      )} />
                      {i < chain.length - 1 && (
                        <div className="w-px flex-1 min-h-[20px] bg-gradient-to-b from-white/10 to-transparent mt-1" />
                      )}
                    </div>

                    {/* Text */}
                    <p className={cn(
                      'font-bold text-[10px] pb-2 leading-relaxed',
                      i === 0 ? 'text-orange-400 font-bold' :
                        i === chain.length - 1 ? 'text-red-400 font-bold' :
                          'text-white/60'
                    )}>
                      {i === chain.length - 1 && <AlertTriangle size={10} className="inline mr-1.5 text-red-500" />}
                      {step}
                    </p>
                  </motion.div>
                ))}
              </div>

              {/* Regret probability */}
              <div className="mx-6 mb-3 px-4 py-2 bg-red-500/5 border border-red-500/15 rounded-xl flex items-center justify-between">
                <span className="font-bold text-[8px] text-white/60 uppercase tracking-widest">
                  Probability you will regret this
                </span>
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="font-bold text-lg font-black text-red-400"
                >
                  {regretProb}%
                </motion.span>
              </div>

              {/* Identity challenge */}
              {frame && (
                <div className="mx-6 mb-4 text-center">
                  <p className="font-bold text-[8px] text-white/40 tracking-[0.2em]">
                    {frame.identity.toUpperCase()} {frame.question.toUpperCase()}
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="px-6 pb-6 flex flex-col gap-2">
                <div className="flex gap-2">
                  <button
                    onClick={onResume}
                    className="flex-1 py-3 bg-white/10 border border-white/20 text-white font-bold font-black text-[9px] tracking-widest uppercase rounded-xl hover:bg-white/20 transition-all flex items-center justify-center gap-2"
                  >
                    <ArrowRight size={14} /> Resume
                  </button>
                  <button
                    onClick={onConfirmSkip}
                    className="flex-1 py-3 bg-white/10 border border-white/20 text-white font-bold text-[9px] uppercase tracking-widest rounded-xl hover:bg-white/20 transition-all flex items-center justify-center gap-2"
                  >
                    <X size={14} /> Take a break
                  </button>
                </div>

                {onUseInsurance && (streakInsurance.usesThisMonth || 0) < 4 && (
                  <button
                    onClick={onUseInsurance}
                    className="w-full py-3 bg-amber-500/10 border border-amber-500/30 text-amber-500 font-bold text-[9px] uppercase tracking-widest rounded-xl hover:bg-amber-500/20 transition-all mt-1"
                  >
                    Use Insurance Token
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </ModalPortal>
  );
}
