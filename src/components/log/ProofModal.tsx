import React, { useState } from 'react';
import { useSovereignStore } from '../../store/sovereign';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Lock, Terminal, Check, AlertTriangle } from 'lucide-react';
import { cn } from '../../lib/utils';

export const ProofModal = () => {
  const isOpen = useSovereignStore(state => state.proofModalOpen);
  const setOpen = useSovereignStore(state => state.setProofModalOpen);
  const targetQuestId = useSovereignStore(state => state.targetQuestId);
  const setTargetQuestId = useSovereignStore(state => state.setTargetQuestId);
  const quests = useSovereignStore(state => state.dailyQuests);
  const pendingActivity = useSovereignStore(state => state.pendingActivity);
  const setPendingActivity = useSovereignStore(state => state.setPendingActivity);
  const logActivity = useSovereignStore(state => state.logActivity);

  const [proof, setProof] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const targetQuest = targetQuestId ? quests.find(q => q.id === targetQuestId) : null;

  const handleClose = () => {
    setOpen(false);
    setPendingActivity(null);
    setTargetQuestId(null);
    setProof('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!proof.trim() || !pendingActivity) return;

    setIsSubmitting(true);
    try {
      await logActivity(
        pendingActivity.statId,
        pendingActivity.xp,
        pendingActivity.questId,
        { proof: proof.trim() }
      );
      handleClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[600] flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-black/90 backdrop-blur-xl"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-lg bg-[#050505] border border-white/10 rounded-3xl p-6 overflow-hidden shadow-2xl"
          >
            {/* Background Texture */}
            <div className="absolute inset-0 opacity-[0.02] pointer-events-none">
              <Terminal size={400} className="absolute -top-20 -left-20 rotate-12" />
              <Shield size={400} className="absolute -bottom-20 -right-20 -rotate-12" />
            </div>

            <div className="relative z-10">
              {/* Header */}
              <div className="flex flex-col items-center mb-6 text-center">
                <div className="h-12 w-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[var(--stat-brand)] mb-4 shadow-xl">
                  <Lock size={20} className="animate-pulse" />
                </div>
                <h2 className="font-mono text-[10px] tracking-[0.4em] text-[var(--stat-brand)] uppercase font-black mb-1">Identity Verification Required</h2>
                <div className="text-xl font-black text-white italic tracking-tighter uppercase line-clamp-1">
                  {targetQuest?.title || "PROTOCOL FINALIZATION"}
                </div>
              </div>

              {/* Terminal View */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="relative group">
                  <div className="absolute top-4 left-4 font-mono text-[8px] text-white/20 uppercase tracking-widest flex items-center gap-2">
                    <Terminal size={10} /> console.sovereign.proof / input_stream
                  </div>
                  <textarea
                    value={proof}
                    onChange={e => setProof(e.target.value)}
                    placeholder="Enter strict proof of mission completion..."
                    className="w-full h-32 bg-white/5 border border-white/10 rounded-xl p-6 pt-10 text-white font-mono text-xs tracking-wide focus:border-white/30 outline-none transition-all resize-none scrollbar-hide"
                    autoFocus
                  />
                  <div className="absolute bottom-4 right-4 flex items-center gap-4">
                    <span className="font-mono text-[8px] text-white/20 uppercase">
                      Chars: {proof.length}
                    </span>
                    {proof.length > 0 && (
                      <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-[var(--success)]/10 border border-[var(--success)]/20 text-[var(--success)] font-mono text-[8px] font-black uppercase">
                        <Check size={8} /> Readiness Confirmed
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  <button
                    type="submit"
                    disabled={!proof.trim() || isSubmitting}
                    className={cn(
                      "w-full h-12 rounded-xl font-black tracking-[0.4em] uppercase transition-all flex items-center justify-center gap-3 group relative overflow-hidden",
                      proof.trim() && !isSubmitting
                        ? "bg-white text-black hover:scale-[1.01] shadow-[0_10px_30px_rgba(255,255,255,0.15)]"
                        : "bg-white/5 text-white/10 border border-white/5 cursor-not-allowed"
                    )}
                  >
                    {isSubmitting ? (
                      <div className="h-4 w-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                    ) : (
                      <>
                        <Shield size={16} className="group-hover:rotate-12 transition-transform" />
                        <span className="text-xs">Submit Verification</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleClose}
                    className="w-full h-8 rounded-lg font-mono text-[9px] tracking-widest text-white/20 uppercase hover:text-white transition-colors"
                  >
                    Abort Sequence [Esc]
                  </button>
                </div>
              </form>

              {/* Warning Bar */}
              <div className="mt-6 flex items-center gap-3 px-4 py-1.5 border border-red-500/10 bg-red-500/[0.03] rounded-full">
                <AlertTriangle size={10} className="text-red-500/60" />
                <span className="font-mono text-[7px] text-red-500/40 uppercase tracking-widest">
                  Truth is non-negotiable.
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
