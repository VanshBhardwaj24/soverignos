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
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-lg bg-[#0d0d0d] border border-white/10 rounded-[40px] overflow-hidden shadow-[0_0_100px_rgba(255,255,255,0.05)]"
        >
          {/* Header Accent */}
          <div className={cn(
            "h-1.5 w-full",
            mode === 'morning' ? "bg-blue-500" : (allCompleted ? "bg-emerald-500" : "bg-red-500")
          )} />

          <div className="p-10">
            {/* Icon & Title */}
            <div className="flex flex-col items-center gap-4 mb-8 text-center">
              <div className={cn(
                "p-4 rounded-3xl border",
                mode === 'morning' ? "bg-blue-500/10 border-blue-500/20 text-blue-400" :
                  (allCompleted ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-red-500/10 border-red-500/20 text-red-500")
              )}>
                {mode === 'morning' ? <Zap size={32} /> : (allCompleted ? <ShieldCheck size={32} /> : <AlertTriangle size={32} />)}
              </div>

              <div>
                <h2 className="font-mono text-[10px] tracking-[0.4em] text-white/30 uppercase font-black mb-1">
                  {mode === 'morning' ? "Strategic Briefing" : "Daily Operational Report"}
                </h2>
                <h1 className="font-mono text-2xl font-light text-white tracking-tight">
                  {mode === 'morning' ? "Initialize Objectives" : (allCompleted ? "Protocol Success" : "Protocol Disruption")}
                </h1>
              </div>
            </div>

            {/* Content Section */}
            <div className="space-y-6 mb-10">
              {mode === 'morning' ? (
                <>
                  <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
                    {briefingTemplates.map(t => (
                      <button
                        key={t.id}
                        onClick={() => setSelectedTemplateId(t.id)}
                        className={cn(
                          "px-4 py-2 rounded-xl font-mono text-[10px] uppercase tracking-wider transition-all whitespace-nowrap",
                          selectedTemplateId === t.id
                            ? "bg-white text-black font-black"
                            : "bg-white/5 text-white/40 hover:bg-white/10"
                        )}
                      >
                        {t.title}
                      </button>
                    ))}
                  </div>

                  <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 space-y-3">
                    {currentTemplate.tasks.map((task, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <Target size={14} className="text-white/20" />
                        <span className="font-mono text-xs text-white/70">{task.title}</span>
                        <span className="ml-auto font-mono text-[10px] text-white/20 uppercase">{task.statId}</span>
                      </div>
                    ))}
                  </div>

                  {/* Intelligence Integration (Phase 2) */}
                  <div className="p-6 rounded-2xl bg-blue-500/5 border border-blue-500/10 space-y-3">
                    <div className="flex items-center gap-2">
                      <Zap size={14} className="text-blue-400" />
                      <h3 className="font-mono text-[9px] tracking-widest text-blue-400 uppercase font-black">Intelligence Briefing</h3>
                    </div>
                    {recentDiscovery && (
                      <div className="space-y-1">
                        <p className="font-mono text-[10px] text-white/80 uppercase leading-tight">Verified Insight: {recentDiscovery.title}</p>
                        <p className="text-[10px] text-white/40 leading-relaxed italic">"{recentDiscovery.insight}"</p>
                      </div>
                    )}
                    <div className="pt-2 border-t border-blue-500/10">
                      <p className="font-mono text-[9px] text-blue-300 uppercase leading-tight flex items-center gap-2">
                        <ArrowRight size={10} />
                        {intelligenceTip}
                      </p>
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
                        "font-mono text-xs",
                        q.completed ? "text-white/80" : "text-white/40 line-through"
                      )}>
                        {q.title}
                      </span>
                    </div>
                  ))}
                  {todayBriefingQuests.length === 0 && (
                    <p className="text-center font-mono text-[10px] text-white/20 py-10 uppercase tracking-widest">No objectives tracked for this session.</p>
                  )}
                </div>
              )}
            </div>

            {/* Footer Action */}
            <div className="space-y-4">
              <button
                onClick={handleAction}
                disabled={isFinalized}
                className={cn(
                  "w-full py-5 rounded-2xl font-mono text-[11px] font-black tracking-[0.2em] uppercase transition-all flex items-center justify-center gap-3",
                  mode === 'morning' ? "bg-white text-black hover:scale-[1.02]" :
                    (allCompleted ? "bg-emerald-500 text-white hover:scale-[1.02]" : "bg-white/10 text-white/40 hover:bg-white/20")
                )}
              >
                {mode === 'morning' ? (
                  <>Initialise Protocol <ArrowRight size={16} /></>
                ) : (
                  allCompleted ? <>Claim Integrity Bonus <Award size={16} /></> : "Acknowledge System Disruption"
                )}
              </button>

              <button
                onClick={onClose}
                className="w-full text-center font-mono text-[10px] text-white/20 uppercase tracking-[0.3em] hover:text-white/40 transition-colors"
              >
                Stand down
              </button>
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
