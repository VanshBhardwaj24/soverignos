import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSovereignStore } from '../../store/sovereign';
import {
  Zap,
  Target,
  CheckCircle2,
  XCircle,
  Award,
  AlertTriangle,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import ReactConfetti from 'react-confetti';
import { cn } from '../../lib/utils';

interface ReminderModalProps {
  mode: 'morning' | 'evening' | null;
  onClose: () => void;
  date: string;
}

export const ReminderModal = ({ mode, onClose, date }: ReminderModalProps) => {
  const {
    briefingTemplates,
    dailyQuests,
    applyDailyTemplate,
    finalizeDailyBriefing,
    username,
    alias
  } = useSovereignStore();

  const displayName = alias || username || "Sovereign";

  const [selectedTemplateId, setSelectedTemplateId] = useState(briefingTemplates[0].id);
  const [isFinalized, setIsFinalized] = useState(false);
  const [windowSize, setWindowSize] = useState({ width: window.innerWidth, height: window.innerHeight });

  const currentTemplate = briefingTemplates.find(t => t.id === selectedTemplateId) || briefingTemplates[0];
  const todayBriefingQuests = dailyQuests.filter(q => q.dailyBriefingDate === date);
  const allCompleted = todayBriefingQuests.length > 0 && todayBriefingQuests.every(q => q.completed);

  useEffect(() => {
    const handleResize = () => setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!mode) return null;

  const handleAction = () => {
    if (mode === 'morning') {
      applyDailyTemplate(selectedTemplateId);
      onClose();
    } else {
      finalizeDailyBriefing(date);
      setIsFinalized(true);
      setTimeout(onClose, 4000);
    }
  };

  const accentColor = mode === 'morning' ? "var(--stat-code)" : (allCompleted ? "var(--success)" : "var(--danger)");

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 sm:p-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-3xl"
          onClick={onClose}
        />

        {mode === 'evening' && allCompleted && !isFinalized && (
          <ReactConfetti
            width={windowSize.width}
            height={windowSize.height}
            recycle={false}
            numberOfPieces={400}
            gravity={0.15}
            colors={['#fff', '#3b82f6', '#10b981', '#f59e0b']}
          />
        )}

        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 40 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 40 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="relative w-full max-w-lg bg-white/[0.03] border border-white/10 rounded-[40px] overflow-hidden shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6)] flex flex-col max-h-[90vh] backdrop-blur-2xl"
        >
          <div className="p-6 md:p-10 overflow-y-auto no-scrollbar">
            {/* Compact Apple-Style Header */}
            <div className="flex flex-col items-center text-center mb-8">
              <motion.div 
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className={cn(
                  "h-16 w-16 rounded-[20px] flex items-center justify-center mb-4 shadow-2xl relative",
                  "bg-gradient-to-br from-white/10 to-transparent border border-white/10"
                )}
              >
                <div className="absolute inset-0 blur-2xl opacity-20" style={{ backgroundColor: accentColor }} />
                <div className="relative z-10" style={{ color: accentColor }}>
                  {mode === 'morning' ? <Zap size={32} strokeWidth={1.5} /> : (allCompleted ? <ShieldCheck size={32} strokeWidth={1.5} /> : <AlertTriangle size={32} strokeWidth={1.5} />)}
                </div>
              </motion.div>

              <h2 className="text-[10px] font-bold tracking-[0.2em] text-white/30 uppercase mb-1">
                {mode === 'morning' ? "Strategic Briefing" : "Daily Operational Report"}
              </h2>
              <h1 className="text-2xl font-semibold text-white tracking-tight">
                {mode === 'morning' ? `Good Morning, ${displayName}` : (allCompleted ? "Exceptional Integrity" : "Protocol Deviation")}
              </h1>
              <p className="text-xs text-white/40 mt-1 max-w-[240px] leading-relaxed">
                {mode === 'morning' ? "Set your trajectory for the next 24 hours." : (allCompleted ? "You have maintained peak alignment." : "Inconsistencies detected in today's throughput.")}
              </p>
            </div>

            {/* Content Section */}
            <div className="space-y-6 mb-8">
              {mode === 'morning' ? (
                <>
                  {/* Template Picker */}
                  <div className="space-y-3">
                    <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest pl-2">Trajectories</p>
                    <div className="flex flex-wrap gap-2">
                      {briefingTemplates.map(t => (
                        <button
                          key={t.id}
                          onClick={() => setSelectedTemplateId(t.id)}
                          className={cn(
                            "px-4 py-2 rounded-full border transition-all duration-300 text-[11px] font-medium",
                            selectedTemplateId === t.id
                              ? "bg-white text-black border-white shadow-lg"
                              : "bg-white/[0.04] border-white/5 text-white/60 hover:bg-white/10"
                          )}
                        >
                          {t.title}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Objective List (More Compact) */}
                  <div className="bg-white/[0.04] border border-white/10 rounded-[28px] p-5 space-y-4">
                    <div className="flex items-center justify-between border-b border-white/5 pb-3">
                      <h3 className="text-[11px] font-semibold text-white/80">Primary Objectives</h3>
                      <span className="text-[9px] font-bold text-white/20 uppercase">{currentTemplate.tasks.length} Modules</span>
                    </div>
                    <div className="space-y-2 max-h-[160px] overflow-y-auto no-scrollbar">
                      {currentTemplate.tasks.map((task, i) => (
                        <motion.div 
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.05 }}
                          key={i} 
                          className="flex items-center gap-3 bg-white/[0.01] p-2.5 rounded-xl border border-white/5"
                        >
                          <Target size={12} className="text-white/20" />
                          <span className="text-[12px] font-medium text-white/70 flex-1 truncate">{task.title}</span>
                          <span className="px-1.5 py-0.5 rounded bg-white/5 text-[8px] font-bold text-white/20 uppercase">{task.statId}</span>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <div className="space-y-2">
                  <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest pl-2 mb-3">Objective Log</p>
                  <div className="space-y-2 max-h-[240px] overflow-y-auto no-scrollbar">
                    {todayBriefingQuests.map((q, i) => (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        key={i} 
                        className={cn(
                          "flex items-center gap-3 p-4 rounded-[20px] border transition-all",
                          q.completed ? "bg-emerald-500/5 border-emerald-500/10" : "bg-white/[0.02] border-white/5"
                        )}
                      >
                        <div className={cn(
                          "h-7 w-7 rounded-full flex items-center justify-center shrink-0",
                          q.completed ? "bg-emerald-500/20 text-emerald-400" : "bg-white/5 text-white/10"
                        )}>
                          {q.completed ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                        </div>
                        <span className={cn(
                          "text-[13px] font-medium flex-1 truncate",
                          q.completed ? "text-white/90" : "text-white/30"
                        )}>
                          {q.title}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                  {todayBriefingQuests.length === 0 && (
                    <div className="py-8 text-center bg-white/[0.02] rounded-[24px] border border-dashed border-white/5">
                      <p className="text-[12px] text-white/20 italic">No objectives tracked.</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Compact Footer Actions */}
            <div className="flex flex-col gap-4">
              <div className="flex gap-2">
                <button
                  onClick={onClose}
                  className="flex-1 py-3.5 rounded-[22px] font-semibold text-xs text-white/30 hover:bg-white/5 hover:text-white/50 transition-all"
                >
                  Dismiss
                </button>
                <button
                  onClick={handleAction}
                  disabled={isFinalized}
                  style={{ backgroundColor: accentColor }}
                  className={cn(
                    "flex-[1.8] py-3.5 rounded-[22px] font-bold text-xs text-black transition-all flex items-center justify-center gap-2 shadow-2xl hover:brightness-110 active:scale-[0.98]",
                    isFinalized && "opacity-50 grayscale pointer-events-none",
                    !allCompleted && mode === 'evening' && "bg-white/10 text-white/40"
                  )}
                >
                  {mode === 'morning' ? (
                    <>Initialize <ArrowRight size={14} /></>
                  ) : (
                    allCompleted ? <>Claim Bonus <Award size={14} /></> : "Acknowledge"
                  )}
                </button>
              </div>
              <p className="text-center text-[9px] text-white/10 italic font-medium">
                Sovereign OS · Authorization Verified
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};


