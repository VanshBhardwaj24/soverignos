import React, { useState } from 'react';
import { useSovereignStore } from '../../store/sovereign';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield, Check, Info, FileText
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { Select } from '../ui/Select';

export const ProofModal = () => {
  const isOpen = useSovereignStore(state => state.proofModalOpen);
  const setOpen = useSovereignStore(state => state.setProofModalOpen);
  const targetQuestId = useSovereignStore(state => state.targetQuestId);
  const setTargetQuestId = useSovereignStore(state => state.setTargetQuestId);
  const quests = useSovereignStore(state => state.dailyQuests);
  const pendingActivity = useSovereignStore(state => state.pendingActivity);
  const setPendingActivity = useSovereignStore(state => state.setPendingActivity);
  const completeQuest = useSovereignStore(state => state.completeQuest);

  const [learnings, setLearnings] = useState('');
  const [achievement, setAchievement] = useState('100');
  const [speed, setSpeed] = useState('on-time');
  const [quality, setQuality] = useState('5');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const targetQuest = targetQuestId ? quests.find(q => q.id === targetQuestId) : null;

  const handleClose = () => {
    setOpen(false);
    setPendingActivity(null);
    setTargetQuestId(null);
    setLearnings('');
    setAchievement('100');
    setSpeed('on-time');
    setQuality('5');
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pendingActivity) return;

    if (parseInt(achievement) === 0 && !learnings.trim()) {
      setError("Please provide a reflection/learning if objective was not achieved.");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      await completeQuest(
        pendingActivity.questId!,
        false,
        {
          ...pendingActivity.metadata,
          learnings: learnings.trim(),
          achievement: achievement,
          speed: speed,
          quality: quality
        }
      );
      handleClose();
    } catch (err: any) {
      console.error('[SUBMIT_ERROR] ProofModal:', err);
      setError("System failure during verification. Data locally cached.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const achievementOptions = [
    { value: '100', label: '100% - Objective Secured' },
    { value: '75', label: '75% - Substantial Progress' },
    { value: '50', label: '50% - Partial Success' },
    { value: '25', label: '25% - Initial Breach' },
    { value: '0', label: '0% - Tactical Pivot' }
  ];

  const speedOptions = [
    { value: 'on-time', label: 'Target Completion (On-Time)' },
    { value: '1h-early', label: 'Efficient Action (+10% Bonus)' },
    { value: '4h-early', label: 'Strategic Rush (+25% Bonus)' },
    { value: '8h-early', label: 'Blitz / Instant Clear (+50% Bonus)' }
  ];

  const qualityOptions = [
    { value: '5', label: 'L5 - Peak Performance (100% XP)' },
    { value: '4', label: 'L4 - Standard Effort (85% XP)' },
    { value: '3', label: 'L3 - Minor Distractions (70% XP)' },
    { value: '2', label: 'L2 - Poor Focus (55% XP)' },
    { value: '1', label: 'L1 - Minimal Trace (40% XP)' }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[600] flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="relative w-full max-w-lg bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-[32px] p-8 shadow-2xl overflow-hidden"
          >
            <div className="relative z-10">
              {/* Header */}
              <div className="flex items-center gap-4 mb-8">
                <div className="h-12 w-12 rounded-2xl bg-[var(--text-primary)]/5 border border-[var(--text-primary)]/10 flex items-center justify-center text-[var(--text-primary)]">
                  <Shield size={24} />
                </div>
                <div>
                  <h2 className="font-bold text-[10px] tracking-[0.2em] text-[var(--text-muted)] uppercase font-black">Mission Finalization</h2>
                  <div className="text-xl font-bold text-[var(--text-primary)] tracking-tight">
                    {targetQuest?.title || "PROTOCOL VERIFICATION"}
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="font-bold text-[10px] uppercase text-[var(--text-muted)] mb-3 block tracking-widest font-bold">Achievement Level</label>
                  <Select
                    options={achievementOptions}
                    value={achievement}
                    onChange={setAchievement}
                  />
                  <p className="mt-2 text-[9px] text-[var(--text-muted)] font-bold italic">
                    * Final XP will be scaled based on achievement ratio.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="font-bold text-[10px] uppercase text-[var(--text-muted)] mb-3 block tracking-widest font-bold">Execution Speed</label>
                    <Select
                      options={speedOptions}
                      value={speed}
                      onChange={setSpeed}
                    />
                  </div>
                  <div>
                    <label className="font-bold text-[10px] uppercase text-[var(--text-muted)] mb-3 block tracking-widest font-bold">Session Quality</label>
                    <Select
                      options={qualityOptions}
                      value={quality}
                      onChange={setQuality}
                    />
                    {parseInt(quality) < 5 && (
                      <p className="mt-2 text-[9px] text-red-400/70 font-bold italic">
                        * Tactical Penalty: -{(5 - parseInt(quality)) * 15}% XP reduction.
                      </p>
                    )}
                  </div>
                </div>

                {pendingActivity?.metadata?.hours && (
                  <div className="p-4 bg-blue-500/5 border border-blue-500/10 rounded-2xl flex items-center justify-between mt-2">
                    <span className="font-bold text-[9px] text-blue-400 uppercase tracking-widest font-black">Sleep Duration Recorded</span>
                    <span className="font-bold text-xl font-black text-white italic">{pendingActivity.metadata.hours} <span className="text-[10px] opacity-30">HRS</span></span>
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="font-bold text-[10px] uppercase text-[var(--text-muted)] block tracking-widest font-bold">Learnings & Reflections</label>
                    <span className="text-[9px] text-[var(--text-muted)] bg-white/5 px-2 py-0.5 rounded uppercase font-bold">Optional</span>
                  </div>
                  <div className="relative">
                    <textarea
                      value={learnings}
                      onChange={e => {
                        setLearnings(e.target.value);
                        setError(null);
                      }}
                      placeholder="What did you learn from this encounter? (Growth/Failure patterns...)"
                      className="w-full h-28 bg-[var(--bg-primary)] border border-[var(--border-default)] rounded-2xl p-4 text-[var(--text-primary)] font-sans text-sm focus:border-[var(--text-primary)] outline-none transition-all resize-none"
                    />
                    <FileText size={14} className="absolute bottom-4 right-4 text-[var(--text-muted)] opacity-20" />
                  </div>
                </div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-bold flex items-center gap-2"
                  >
                    <Info size={12} /> {error}
                  </motion.div>
                )}

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={cn(
                      "w-full h-14 rounded-2xl font-bold tracking-widest uppercase transition-all flex items-center justify-center gap-3 relative overflow-hidden",
                      !isSubmitting
                        ? "bg-[var(--text-primary)] text-[var(--bg-primary)] hover:brightness-90 active:scale-[0.98] shadow-lg"
                        : "bg-white/5 text-[var(--text-muted)] cursor-not-allowed"
                    )}
                  >
                    {isSubmitting ? (
                      <div className="h-5 w-5 border-2 border-[var(--bg-primary)] border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <Check size={18} />
                        <span>Commit Data & Gain XP</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleClose}
                    className="w-full mt-4 py-2 text-[10px] font-bold text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors uppercase tracking-widest"
                  >
                    Cancel Operations
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
