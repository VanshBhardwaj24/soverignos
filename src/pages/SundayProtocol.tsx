import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Check, ChevronLeft, Shield, Eye, MessageCircle, BarChart2, FileText, ArrowLeft } from 'lucide-react';
import { FrictionAudit } from '../components/psych/FrictionAudit';
import { MirrorScore } from '../components/psych/MirrorScore';
import { WeeklyQuestion } from '../components/psych/WeeklyQuestion';
import { SundayNumbers } from '../components/psych/SundayNumbers';
import { CommitmentContract } from '../components/psych/CommitmentContract';
import { useSovereignStore } from '../store/sovereign';
import { cn } from '../lib/utils';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';

import { DependencyMirror } from '../components/psych/DependencyMirror';
import { ContextPhotoSnap } from '../components/psych/ContextPhotoSnap';
import { Camera } from 'lucide-react';

// Check if today is the first Sunday of the month
const isFirstSunday = () => {
  const d = new Date();
  if (d.getDay() !== 0) return false; // Must be Sunday
  return d.getDate() <= 7; // Must be 1st-7th
};

const PROTOCOL_STEPS = [
  { id: 'friction', label: 'Friction Audit', icon: Shield, color: 'var(--stat-mind)' },
  { id: 'mirror', label: 'Mirror Score', icon: Eye, color: 'var(--stat-mind)' },
  { id: 'question', label: 'Weekly Question', icon: MessageCircle, color: 'var(--stat-mind)' },
  { id: 'numbers', label: 'Sunday Numbers', icon: BarChart2, color: 'var(--stat-wealth)' },
  { id: 'contract', label: 'Commitment Contract', icon: FileText, color: 'var(--text-primary)' },
  { id: 'snapshot', label: 'Context Snapshot', icon: Camera, color: 'var(--stat-mind)' },
];

if (isFirstSunday()) {
  PROTOCOL_STEPS.push({ id: 'dependency', label: 'Dependency Mirror', icon: Eye, color: 'var(--stat-spirit)' });
}

export default function SundayProtocol() {
  const [currentStep, setCurrentStep] = useState(0);
  const [completed, setCompleted] = useState(false);
  const { logActivity } = useSovereignStore();
  const navigate = useNavigate();

  const isSunday = new Date().getDay() === 0;

  if (!isSunday) {
    const now = new Date();
    const nextSunday = new Date(now);
    nextSunday.setDate(now.getDate() + (7 - now.getDay()) % 7);
    nextSunday.setHours(0, 0, 0, 0);
    const diff = nextSunday.getTime() - now.getTime();
    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);

    return (
      <div className="min-h-[80vh] flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-[#0a0a0a] border border-white/10 rounded-[40px] p-10 text-center relative overflow-hidden"
        >
          {/* Ambient Glow */}
          {/* <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-[var(--stat-mind)]/5 blur-[80px] rounded-full" /> */}

          <div className="relative z-10">
            <div className="h-20 w-20 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-8">
              <Calendar size={32} className="text-white/20" />
              <div className="absolute inset-0 bg-white/5 animate-pulse rounded-3xl" />
            </div>

            <h2 className="font-mono text-[10px] tracking-[0.3em] text-white/30 uppercase font-black mb-2">System Protocol</h2>
            <h1 className="font-mono text-2xl font-light text-white mb-4">LOCKED</h1>

            <p className="font-mono text-[11px] text-white/20 leading-relaxed mb-8">
              The Sunday Protocol is a weekly terminal for system-wide reflection and recalibration. It only unlocks when the cycle completes.
            </p>

            <div className="grid grid-cols-2 gap-4 mb-10">
              <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
                <p className="font-mono text-[18px] font-black text-white">{hours}h</p>
                <p className="font-mono text-[7px] text-white/20 uppercase tracking-widest mt-1">HOURS REMAINING</p>
              </div>
              <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
                <p className="font-mono text-[18px] font-black text-white">{minutes}m</p>
                <p className="font-mono text-[7px] text-white/20 uppercase tracking-widest mt-1">MINUTES REMAINING</p>
              </div>
            </div>

            <Link
              to="/"
              className="w-full py-4 bg-white text-black font-mono text-[10px] font-black tracking-widest uppercase rounded-2xl hover:brightness-90 transition-all flex items-center justify-center gap-2 relative z-50 cursor-pointer"
            >
              <ArrowLeft size={14} className="pointer-events-none" /> Return to HQ
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  const handleStepComplete = () => {
    if (currentStep < PROTOCOL_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // All steps done — reward XP
      const isFullMonthAudit = PROTOCOL_STEPS.length === 6;
      logActivity('mind', isFullMonthAudit ? 100 : 50);
      logActivity('spirit', isFullMonthAudit ? 60 : 30);
      toast.success(isFullMonthAudit ? 'MONTHLY FREEDOM PROTOCOL COMPLETE' : 'SUNDAY PROTOCOL COMPLETE', {
        description: isFullMonthAudit
          ? '+100 MIND XP, +60 SPIRIT XP — Monthly audit finished.'
          : '+50 MIND XP, +30 SPIRIT XP — You just out-reflected 99% of people.',
      });
      setCompleted(true);
    }
  };

  if (completed) {
    return (
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-2xl mx-auto py-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-8 text-center"
        >
          <div className="relative">
            <div className="h-24 w-24 rounded-full bg-[var(--success)]/10 flex items-center justify-center border border-[var(--success)]/30">
              <Check size={48} className="text-[var(--success)]" />
            </div>
            <div className="absolute inset-0 rounded-full bg-[var(--success)]/5 animate-ping" />
          </div>
          <div>
            <h1 className="font-mono text-3xl font-light text-white mb-3">Protocol Complete</h1>
            <p className="font-mono text-sm text-white/40 max-w-md mx-auto leading-relaxed">
              5 systems executed. Friction surfaced. Delusion measured. Truth committed. Contract signed. Numbers reviewed.
            </p>
          </div>
          <div className="flex gap-4 mt-4">
            <div className="px-6 py-3 bg-[var(--stat-mind)]/10 border border-[var(--stat-mind)]/20 rounded-xl flex items-center gap-2">
              <span className="font-mono text-[10px] text-[var(--stat-mind)] font-black uppercase tracking-wider">+50 MIND XP</span>
            </div>
            <div className="px-6 py-3 bg-[var(--stat-spirit)]/10 border border-[var(--stat-spirit)]/20 rounded-xl flex items-center gap-2">
              <span className="font-mono text-[10px] text-[var(--stat-spirit)] font-black uppercase tracking-wider">+30 SPIRIT XP</span>
            </div>
          </div>
          <Link
            to="/"
            className="mt-8 px-10 py-4 bg-white text-black font-mono text-[10px] font-black tracking-widest uppercase rounded-2xl hover:brightness-90 transition-all flex items-center gap-2 relative z-50 cursor-pointer"
          >
            <ArrowLeft size={14} className="pointer-events-none" /> Return to HQ
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-2xl mx-auto pb-12">
      {/* Header */}
      <div className="mb-10">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-white/20 hover:text-white/50 transition-colors mb-6 font-mono text-[10px] uppercase tracking-widest"
        >
          <ChevronLeft size={14} /> Back to Dashboard
        </button>
        <div className="flex items-center gap-4 mb-2">
          <div className="h-10 w-10 rounded-xl bg-[var(--stat-mind)]/10 flex items-center justify-center text-[var(--stat-mind)]">
            <Calendar size={20} />
          </div>
          <div>
            <h1 className="font-mono text-[11px] tracking-[0.2em] text-[var(--text-muted)] uppercase font-semibold">Sunday Ritual</h1>
            <div className="font-mono text-3xl font-light tracking-tight text-white">
              SUNDAY PROTOCOL
            </div>
          </div>
        </div>
        <p className="font-mono text-[10px] text-white/25 mt-2">
          {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>

      {/* Progress bar */}
      <div className="mb-10">
        <div className="flex items-center gap-1 mb-3">
          {PROTOCOL_STEPS.map((step, i) => {
            return (
              <div key={step.id} className="flex items-center flex-1">
                <div className={cn(
                  'flex items-center gap-2 px-3 py-2 rounded-xl transition-all w-full',
                  i === currentStep ? 'bg-white/5 border border-white/10' :
                    i < currentStep ? 'opacity-50' : 'opacity-20'
                )}>
                  <div className={cn(
                    'h-5 w-5 rounded-lg flex items-center justify-center shrink-0 text-[10px]',
                    i < currentStep ? 'bg-[var(--success)]/20 text-[var(--success)]' :
                      i === currentStep ? 'bg-white/10 text-white' : 'bg-white/5 text-white/20'
                  )}>
                    {i < currentStep ? <Check size={10} /> : i + 1}
                  </div>
                  <span className="font-mono text-[7px] tracking-[0.15em] uppercase hidden lg:block truncate">{step.label}</span>
                </div>
              </div>
            );
          })}
        </div>
        {/* Linear progress */}
        <div className="h-1 bg-white/5 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-[var(--stat-mind)] to-[var(--success)] rounded-full"
            initial={{ width: '0%' }}
            animate={{ width: `${((currentStep) / PROTOCOL_STEPS.length) * 100}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>
        <p className="font-mono text-[8px] text-white/15 mt-2">
          Step {currentStep + 1} of {PROTOCOL_STEPS.length}: {PROTOCOL_STEPS[currentStep].label}
        </p>
      </div>

      {/* Step content */}
      <div className="p-8 bg-white/[0.02] border border-white/[0.06] rounded-[32px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.3 }}
          >
            {currentStep === 0 && <FrictionAudit onComplete={handleStepComplete} />}
            {currentStep === 1 && <MirrorScore onComplete={handleStepComplete} />}
            {currentStep === 2 && <WeeklyQuestion onComplete={handleStepComplete} />}
            {currentStep === 3 && <SundayNumbers onComplete={handleStepComplete} />}
            {currentStep === 4 && <CommitmentContract onComplete={handleStepComplete} />}
            {currentStep === 5 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
                <DependencyMirror />
                <button
                  onClick={handleStepComplete}
                  className="w-full py-4 bg-white text-black font-mono font-black text-[10px] uppercase tracking-widest rounded-2xl hover:brightness-90 transition-all"
                >
                  Confirm Dependency Audit
                </button>
              </div>
            )}
            {currentStep === 6 && (
              <ContextPhotoSnap onComplete={handleStepComplete} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
