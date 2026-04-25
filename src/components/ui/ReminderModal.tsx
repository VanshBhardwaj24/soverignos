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
  ShieldCheck,
  Flame
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
    causalityDiscoveries,
    surveillanceMetrics
  } = useSovereignStore();

  const recentDiscovery = causalityDiscoveries.find(d => d.status === 'verified') || causalityDiscoveries[0];
  const intelligenceTip = surveillanceMetrics.resistanceFactor < 50 
    ? "Low Resistance detected. Prioritize P0 tasks to restore throughput."
    : surveillanceMetrics.lateNightRisk > 30 
    ? "High Late-Night Risk. Avoid creating missions after 11 PM."
    : "System operating at nominal capacity. Maintain current trajectory.";

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

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[500] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/90 backdrop-blur-xl"
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
          initial={{ opacity: 0, scale: 0.98, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.98, y: 10 }}
          className="relative w-full max-w-2xl bg-[#080808] border border-white/10 rounded-[32px] overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.8)] flex flex-col max-h-[90vh]"
        >
          {/* Header Accent */}
          <div className={cn(
            "h-1.5 w-full",
            mode === 'morning' ? "bg-blue-500" : (allCompleted ? "bg-emerald-500" : "bg-red-500")
          )} />

          <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar">
            {/* Icon & Title */}
            <div className="flex items-center gap-6 mb-8">
              <div className={cn(
                "h-14 w-14 rounded-2xl border flex items-center justify-center shrink-0",
                mode === 'morning' ? "bg-blue-500/10 border-blue-500/20 text-blue-400" :
                  (allCompleted ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-red-500/10 border-red-500/20 text-red-500")
              )}>
                {mode === 'morning' ? <Zap size={28} /> : (allCompleted ? <ShieldCheck size={28} /> : <AlertTriangle size={28} />)}
              </div>

              <div className="flex-1">
                <h2 className="font-bold text-[9px] tracking-[0.4em] text-white/30 uppercase font-black mb-1">
                  {mode === 'morning' ? "Strategic Briefing" : "Daily Operational Report"}
                </h2>
                <h1 className="font-bold text-2xl font-light text-white tracking-tight leading-none">
                  {mode === 'morning' ? "Initialize Objectives" : (allCompleted ? "Protocol Success" : "Protocol Disruption")}
                </h1>
              </div>

              <div className="hidden sm:block text-right">
                <p className="text-[8px] font-black text-white/20 uppercase tracking-widest mb-1">Status</p>
                <p className={cn(
                  "text-[10px] font-bold uppercase tracking-widest",
                  mode === 'morning' ? "text-blue-400" : (allCompleted ? "text-emerald-400" : "text-red-500")
                )}>
                  {mode === 'morning' ? "NOMINAL" : (allCompleted ? "OPTIMIZED" : "STRESSED")}
                </p>
              </div>
            </div>

            {/* Content Section */}
            <div className="space-y-6 mb-10">
              {mode === 'morning' ? (
                <>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {briefingTemplates.map(t => (
                      <button
                        key={t.id}
                        onClick={() => setSelectedTemplateId(t.id)}
                        className={cn(
                          "relative p-2 rounded-xl border transition-all duration-300 text-left group overflow-hidden",
                          selectedTemplateId === t.id
                            ? "bg-white border-white shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                            : "bg-white/[0.02] border-white/5 text-white/40 hover:bg-white/5 hover:border-white/10"
                        )}
                      >
                        <span className={cn(
                          "relative z-10 block text-[8px] font-black uppercase tracking-tighter transition-colors",
                          selectedTemplateId === t.id ? "text-black" : "text-white/40 group-hover:text-white"
                        )}>
                          {t.title.split(' ')[0]}
                          <br />
                          {t.title.split(' ').slice(1).join(' ')}
                        </span>
                      </button>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white/[0.01] border border-white/5 rounded-2xl p-5 space-y-3">
                      <h3 className="text-[9px] font-black text-white/30 uppercase tracking-widest mb-1">Protocol Objectives</h3>
                      <div className="space-y-2">
                        {currentTemplate.tasks.map((task, i) => (
                          <div key={i} className="flex items-center gap-3">
                            <Target size={12} className="text-white/20" />
                            <span className="font-bold text-xs text-white/70 truncate flex-1">{task.title}</span>
                            <span className="font-bold text-[8px] text-white/10 uppercase font-black">{task.statId}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4">
                      {/* Intelligence Briefing */}
                      <div className="p-5 rounded-2xl bg-blue-500/5 border border-blue-500/10 space-y-3">
                        <div className="flex items-center gap-2">
                          <Zap size={12} className="text-blue-400" />
                          <h3 className="font-bold text-[9px] tracking-widest text-blue-400 uppercase font-black">Intelligence Briefing</h3>
                        </div>
                        {recentDiscovery && (
                          <div className="space-y-1">
                            <p className="font-bold text-[10px] text-white/80 uppercase leading-tight">{recentDiscovery.title}</p>
                            <p className="text-[10px] text-white/40 leading-relaxed italic line-clamp-2">"{recentDiscovery.insight}"</p>
                          </div>
                        )}
                        <p className="pt-2 border-t border-blue-500/10 font-bold text-[9px] text-blue-300 uppercase leading-tight flex items-start gap-2">
                          <ArrowRight size={10} className="mt-0.5 shrink-0" />
                          {intelligenceTip}
                        </p>
                      </div>

                      {/* Energy / Ethical Check */}
                      <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
                        <div>
                          <p className="text-[8px] font-black text-white/20 uppercase tracking-widest mb-1">Energy Required</p>
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map(v => (
                              <div key={v} className={cn("h-1 w-4 rounded-full", v <= (currentTemplate.tasks.length > 5 ? 5 : currentTemplate.tasks.length) ? "bg-blue-500/40" : "bg-white/5")} />
                            ))}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-[8px] font-black text-white/20 uppercase tracking-widest mb-1">Time Investment</p>
                          <p className="text-[10px] font-bold text-white/60">~{currentTemplate.tasks.length * 45} mins</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="space-y-3">
                  {todayBriefingQuests.map((q, i) => (
                    <div key={i} className={cn(
                      "flex items-center gap-4 p-4 rounded-2xl border transition-all",
                      q.completed ? "bg-emerald-500/5 border-emerald-500/10" : "bg-red-500/5 border-red-500/10"
                    )}>
                      {q.completed ?
                        <CheckCircle2 size={18} className="text-emerald-400" /> :
                        <XCircle size={18} className="text-red-500" />
                      }
                      <span className={cn(
                        "font-bold text-xs",
                        q.completed ? "text-white/80" : "text-white/40 line-through"
                      )}>
                        {q.title}
                      </span>
                    </div>
                  ))}
                  {todayBriefingQuests.length === 0 && (
                    <p className="text-center font-bold text-[10px] text-white/20 py-10 uppercase tracking-widest">No objectives tracked for this session.</p>
                  )}
                </div>
              )}
            </div>

            {/* Footer Action */}
            <div className="flex flex-col gap-4">
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 py-4 rounded-2xl font-bold text-[10px] text-white/20 uppercase tracking-[0.2em] border border-white/5 hover:bg-white/5 hover:text-white/40 transition-all"
                >
                  Stand down
                </button>
                <button
                  onClick={handleAction}
                  disabled={isFinalized}
                  className={cn(
                    "flex-[2] py-4 rounded-2xl font-bold text-[11px] font-black tracking-[0.2em] uppercase transition-all flex items-center justify-center gap-3 shadow-xl",
                    mode === 'morning' ? "bg-white text-black hover:scale-[1.02] active:scale-[0.98]" :
                      (allCompleted ? "bg-emerald-500 text-white hover:scale-[1.02] active:scale-[0.98]" : "bg-white/10 text-white/40 hover:bg-white/20")
                  )}
                >
                  {mode === 'morning' ? (
                    <>Initialise Protocol <ArrowRight size={16} /></>
                  ) : (
                    allCompleted ? <>Claim Integrity Bonus <Award size={16} /></> : "Acknowledge Disruption"
                  )}
                </button>
              </div>
              <p className="text-center text-[8px] text-white/10 uppercase tracking-widest italic">
                Self-authoring protocol initiated. Choose your trajectory with intent.
              </p>
            </div>
          </div>

          {/* Decorative Corner */}
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <Flame size={120} />
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
