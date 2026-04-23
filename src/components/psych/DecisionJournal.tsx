import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Plus, ChevronRight, Clock, Check, AlertCircle, X, Target } from 'lucide-react';
import { usePsychStore } from '../../store/sovereign-psych';
import { cn } from '../../lib/utils';

const CONFIDENCE_LABELS: Record<number, string> = {
  1: 'Wild Guess', 2: 'Uncertain', 3: 'Slightly Sure', 4: 'Leaning Yes',
  5: 'Moderate', 6: 'Fairly Sure', 7: 'Confident', 8: 'Very Confident',
  9: 'Near Certain', 10: 'Absolute'
};

export function DecisionJournal() {
  const { decisions, addDecision, reviewDecision } = usePsychStore();
  const [showForm, setShowForm] = useState(false);
  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [actualOutcome, setActualOutcome] = useState('');
  const [activeTab, setActiveTab] = useState<'pending' | 'reviewed'>('pending');

  // Form state
  const [decision, setDecision] = useState('');
  const [reasoning, setReasoning] = useState('');
  const [expectedOutcome, setExpectedOutcome] = useState('');
  const [confidence, setConfidence] = useState(5);
  const [date] = useState(new Date().toISOString());

  const pendingReview = decisions.filter(
    d => !d.reviewed && new Date(d.followUpDate) <= new Date()
  );
  const upcomingReview = decisions.filter(
    d => !d.reviewed && new Date(d.followUpDate) > new Date()
  );
  const reviewedDecisions = decisions.filter(d => d.reviewed);

  const handleSubmit = () => {
    if (!decision.trim() || !reasoning.trim() || !expectedOutcome.trim()) return;
    addDecision({ decision, reasoning, expectedOutcome, confidence, date });
    setDecision(''); setReasoning(''); setExpectedOutcome(''); setConfidence(5);
    setShowForm(false);
  };

  const handleReview = (id: string) => {
    if (!actualOutcome.trim()) return;
    reviewDecision(id, actualOutcome);
    setReviewingId(null);
    setActualOutcome('');
  };

  const allActive = activeTab === 'pending'
    ? [...pendingReview, ...upcomingReview]
    : reviewedDecisions;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-bold text-[10px] tracking-[0.3em] text-white/30 uppercase font-black mb-1">Calibration Engine</h2>
          <p className="font-bold text-2xl font-light text-white">DECISION JOURNAL</p>
        </div>

        <div className="flex items-center gap-3">
          {/* Stats */}
          {reviewedDecisions.length > 0 && (() => {
            return (
              <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl font-bold text-[9px] text-white/30 uppercase tracking-wider">
                {reviewedDecisions.length} logged • avg confidence {(reviewedDecisions.reduce((a, b) => a + b.confidence, 0) / reviewedDecisions.length).toFixed(1)}/10
              </div>
            );
          })()}

          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-[var(--stat-mind)] text-white rounded-2xl font-bold text-[9px] font-black tracking-widest uppercase hover:brightness-110 transition-all"
          >
            <Plus size={14} /> Log Decision
          </button>
        </div>
      </div>

      {/* Due for review alert */}
      {pendingReview.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center gap-4"
        >
          <AlertCircle size={20} className="text-amber-500 shrink-0" />
          <div>
            <p className="font-bold text-[10px] font-black text-amber-400 uppercase tracking-widest">
              {pendingReview.length} Decision{pendingReview.length > 1 ? 's' : ''} Due for Review
            </p>
            <p className="font-bold text-[9px] text-white/30 mt-0.5">It's been 3 months. What actually happened?</p>
          </div>
          <button onClick={() => setActiveTab('pending')} className="ml-auto font-bold text-[9px] text-amber-400 flex items-center gap-1 uppercase hover:text-amber-300">
            Review <ChevronRight size={12} />
          </button>
        </motion.div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 bg-white/[0.03] border border-white/5 rounded-2xl w-fit">
        {(['pending', 'reviewed'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              'px-6 py-2 rounded-xl font-bold text-[9px] font-black tracking-widest uppercase transition-all',
              activeTab === tab ? 'bg-white text-black' : 'text-white/30 hover:text-white/60'
            )}
          >
            {tab === 'pending' ? `Active (${upcomingReview.length + pendingReview.length})` : `Reviewed (${reviewedDecisions.length})`}
          </button>
        ))}
      </div>

      {/* Decision list */}
      <div className="space-y-3">
        <AnimatePresence>
          {allActive.length === 0 ? (
            <div className="py-16 text-center opacity-20">
              <BookOpen size={32} className="mx-auto mb-3" />
              <p className="font-bold text-[9px] uppercase tracking-[0.3em]">
                {activeTab === 'pending' ? 'No decisions logged yet' : 'No reviewed decisions'}
              </p>
            </div>
          ) : (
            allActive.map((d, i) => {
              const isDueNow = !d.reviewed && new Date(d.followUpDate) <= new Date();
              const daysUntilReview = Math.max(0, Math.ceil((new Date(d.followUpDate).getTime() - Date.now()) / 86400000));

              return (
                <motion.div
                  key={d.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={cn(
                    'p-6 rounded-[24px] border transition-all group',
                    isDueNow
                      ? 'bg-amber-500/5 border-amber-500/20 hover:border-amber-500/40'
                      : d.reviewed
                      ? 'bg-white/[0.015] border-white/[0.04] hover:border-white/10'
                      : 'bg-white/[0.02] border-white/[0.06] hover:border-white/10'
                  )}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        {d.reviewed ? (
                          <span className="px-2 py-0.5 bg-green-500/10 border border-green-500/20 rounded-lg font-bold text-[8px] text-green-400 uppercase tracking-wider">Reviewed</span>
                        ) : isDueNow ? (
                          <span className="px-2 py-0.5 bg-amber-500/10 border border-amber-500/20 rounded-lg font-bold text-[8px] text-amber-400 uppercase tracking-wider animate-pulse">Review Due</span>
                        ) : (
                          <span className="px-2 py-0.5 bg-white/5 border border-white/10 rounded-lg font-bold text-[8px] text-white/30 uppercase tracking-wider">{daysUntilReview}d until review</span>
                        )}
                        <span className="font-bold text-[8px] text-white/20 uppercase">
                          Confidence: {d.confidence}/10 — {CONFIDENCE_LABELS[d.confidence]}
                        </span>
                      </div>

                      <h3 className="font-bold text-sm font-semibold text-white mb-1 line-clamp-2">{d.decision}</h3>
                      <p className="font-bold text-[10px] text-white/30 line-clamp-2 mb-2">{d.reasoning}</p>

                      <div className="flex items-start gap-2">
                        <Target size={10} className="text-white/20 mt-0.5 shrink-0" />
                        <p className="font-bold text-[9px] text-white/20 italic">Expected: {d.expectedOutcome}</p>
                      </div>

                      {d.reviewed && d.actualOutcome && (
                        <div className="mt-3 pt-3 border-t border-white/5">
                          <div className="flex items-start gap-2">
                            <Check size={10} className="text-green-400 mt-0.5 shrink-0" />
                            <p className="font-bold text-[9px] text-green-400/70">Actual: {d.actualOutcome}</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {isDueNow && !d.reviewed && (
                      <button
                        onClick={() => setReviewingId(d.id)}
                        className="shrink-0 px-4 py-2 bg-amber-500/20 border border-amber-500/30 rounded-xl font-bold text-[8px] text-amber-400 uppercase tracking-wider hover:bg-amber-500/30 transition-all"
                      >
                        Review
                      </button>
                    )}
                  </div>

                  {/* Review inline */}
                  <AnimatePresence>
                    {reviewingId === d.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-4 pt-4 border-t border-white/10 space-y-3"
                      >
                        <p className="font-bold text-[9px] text-white/40 uppercase tracking-widest">What actually happened?</p>
                        <textarea
                          value={actualOutcome}
                          onChange={e => setActualOutcome(e.target.value)}
                          placeholder="Be honest. Calibration requires truth..."
                          className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-[10px] text-white outline-none focus:border-[var(--stat-mind)] resize-none h-20 font-bold"
                        />
                        <div className="flex gap-2">
                          <button onClick={() => handleReview(d.id)} className="px-5 py-2 bg-white text-black rounded-xl font-bold text-[8px] font-black tracking-widest uppercase hover:opacity-90">Commit</button>
                          <button onClick={() => setReviewingId(null)} className="px-5 py-2 bg-white/5 text-white/40 rounded-xl font-bold text-[8px] uppercase hover:text-white">Cancel</button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>

      {/* Add Decision Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[800] bg-black/80 backdrop-blur-md flex items-center justify-center p-6"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="w-full max-w-2xl bg-[#0a0a0a] border border-white/10 rounded-[40px] p-10 shadow-2xl relative max-h-[90vh] overflow-y-auto no-scrollbar"
            >
              <button onClick={() => setShowForm(false)} className="absolute top-8 right-8 text-white/20 hover:text-white transition-colors">
                <X size={24} />
              </button>

              <h3 className="font-bold text-[10px] tracking-[0.3em] text-[var(--stat-mind)] uppercase font-black mb-1">Log a Decision</h3>
              <p className="font-bold text-2xl font-light text-white mb-8">Commit to calibration</p>

              <div className="space-y-6">
                <div>
                  <label className="block font-bold text-[8px] text-white/30 uppercase tracking-widest mb-3">The Decision</label>
                  <input
                    value={decision}
                    onChange={e => setDecision(e.target.value)}
                    placeholder="e.g. I'm going to cold-email 10 engineers this week..."
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white text-sm outline-none focus:border-[var(--stat-mind)] font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[8px] text-white/30 uppercase tracking-widest mb-3">Why You're Making It</label>
                  <textarea
                    value={reasoning}
                    onChange={e => setReasoning(e.target.value)}
                    placeholder="Walk through your reasoning honestly..."
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white text-sm outline-none focus:border-[var(--stat-mind)] font-bold resize-none h-24"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[8px] text-white/30 uppercase tracking-widest mb-3">Expected Outcome (3 months)</label>
                  <input
                    value={expectedOutcome}
                    onChange={e => setExpectedOutcome(e.target.value)}
                    placeholder="What do you expect to happen as a result?"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white text-sm outline-none focus:border-[var(--stat-mind)] font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[8px] text-white/30 uppercase tracking-widest mb-3">
                    Confidence: {confidence}/10 — {CONFIDENCE_LABELS[confidence]}
                  </label>
                  <input
                    type="range" min={1} max={10} value={confidence}
                    onChange={e => setConfidence(Number(e.target.value))}
                    className="w-full accent-[var(--stat-mind)]"
                  />
                  <div className="flex justify-between font-bold text-[7px] text-white/20 mt-1">
                    <span>Wild Guess</span><span>Absolute Certainty</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <div className="flex items-center gap-2 text-white/20 font-bold text-[8px] uppercase">
                    <Clock size={12} />
                    Review scheduled: {new Date(Date.now() + 90 * 86400000).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </div>
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={!decision.trim() || !reasoning.trim() || !expectedOutcome.trim()}
                  className="w-full py-5 bg-white text-black font-bold font-black text-[10px] uppercase tracking-widest rounded-2xl hover:opacity-90 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  COMMIT DECISION
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
