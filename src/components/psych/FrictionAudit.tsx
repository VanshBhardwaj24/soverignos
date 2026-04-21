import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, ChevronRight, Check } from 'lucide-react';
import { usePsychStore } from '../../store/sovereign-psych';
import { useSovereignStore } from '../../store/sovereign';
import { cn } from '../../lib/utils';

interface Props {
  onComplete: () => void;
}

export function FrictionAudit({ onComplete }: Props) {
  const { addFrictionAudit } = usePsychStore();
  const { addQuest } = useSovereignStore();

  const [step, setStep] = useState(0);
  const [hardestTask, setHardestTask] = useState('');
  const [firstAction, setFirstAction] = useState('');
  const [under2Min, setUnder2Min] = useState<boolean | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (!hardestTask || !firstAction || under2Min === null) return;

    addFrictionAudit({
      date: new Date().toISOString(),
      hardestTask,
      firstAction,
      under2Min,
      microQuestCreated: under2Min,
    });

    // Generate micro-quest if first action takes <2min
    if (under2Min) {
      addQuest({
        title: `FRICTION-BREAK: ${firstAction}`,
        xpReward: 10,
        statId: 'mind',
        difficulty: 'easy',
        type: 'daily',
        priority: 'P1',
        failureStreak: 0
      });
    }
    setSubmitted(true);
  };

  const steps = [
    {
      question: 'What task felt hardest to start this week?',
      hint: 'Be specific. "LeetCode" not just "work".',
      value: hardestTask,
      onChange: setHardestTask,
    },
    {
      question: 'What was the first physical action that task required?',
      hint: 'Exact action. "Open VS Code and type the function name".',
      value: firstAction,
      onChange: setFirstAction,
    },
  ];

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center gap-6 py-8 text-center"
      >
        <div className="h-16 w-16 rounded-full bg-[var(--success)]/10 flex items-center justify-center text-[var(--success)]">
          <Check size={32} />
        </div>
        <div>
          <h3 className="font-mono text-lg font-light text-white mb-2">Friction Located</h3>
          {under2Min ? (
            <div className="space-y-2">
              <p className="font-mono text-sm text-white/50">
                A micro-quest has been deployed to tomorrow's board:
              </p>
              <div className="inline-block px-4 py-2 bg-[var(--success)]/10 border border-[var(--success)]/20 rounded-xl">
                <p className="font-mono text-[11px] text-[var(--success)] font-bold">{firstAction}</p>
              </div>
              <p className="font-mono text-[10px] text-white/30">
                That's your only quest for that stat tomorrow. Just start.
              </p>
            </div>
          ) : (
            <p className="font-mono text-sm text-white/40">
              The first action takes more than 2 minutes. Consider breaking it down further.
            </p>
          )}
        </div>
        <button
          onClick={onComplete}
          className="px-8 py-3 bg-white text-black font-mono text-[10px] font-black tracking-widest uppercase rounded-2xl hover:brightness-90 transition-all flex items-center gap-2"
        >
          Continue <ChevronRight size={14} />
        </button>
      </motion.div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <Shield size={16} className="text-[var(--stat-mind)]" />
          <span className="font-mono text-[9px] tracking-[0.3em] text-[var(--stat-mind)] uppercase font-black">
            Friction Audit
          </span>
        </div>
        <p className="font-mono text-white/30 text-xs">
          Identify where your resistance lives — not the task, but the exact friction point before it.
        </p>
      </div>

      {/* Step indicator */}
      <div className="flex gap-2">
        {[0, 1, 2].map(i => (
          <div key={i} className={cn(
            'h-1 flex-1 rounded-full transition-all duration-500',
            i <= step ? 'bg-[var(--stat-mind)]' : 'bg-white/10'
          )} />
        ))}
      </div>

      <AnimatePresence mode="wait">
        {step < 2 ? (
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <label className="block font-mono text-lg font-light text-white leading-snug">
              {steps[step].question}
            </label>
            <p className="font-mono text-[10px] text-white/25 uppercase tracking-widest">
              {steps[step].hint}
            </p>
            <textarea
              value={steps[step].value}
              onChange={e => steps[step].onChange(e.target.value)}
              placeholder="Type here..."
              autoFocus
              className="w-full bg-white/[0.03] border border-white/10 rounded-2xl p-4 text-sm font-mono text-white/80 min-h-[100px] outline-none focus:border-[var(--stat-mind)]/40 transition-all resize-none placeholder:text-white/15"
            />
            <button
              onClick={() => {
                if (!steps[step].value.trim()) return;
                setStep(step + 1);
              }}
              disabled={!steps[step].value.trim()}
              className="w-full py-4 bg-white text-black font-mono text-[10px] font-black tracking-widest uppercase rounded-2xl disabled:opacity-20 hover:brightness-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              Next <ChevronRight size={14} />
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <label className="block font-mono text-lg font-light text-white leading-snug">
              Can that first action be completed in under 2 minutes?
            </label>
            <div className="grid grid-cols-2 gap-3">
              {[true, false].map(val => (
                <button
                  key={String(val)}
                  onClick={() => setUnder2Min(val)}
                  className={cn(
                    'py-6 rounded-2xl border font-mono text-sm font-black uppercase tracking-wide transition-all',
                    under2Min === val
                      ? val
                        ? 'bg-[var(--success)]/10 border-[var(--success)]/40 text-[var(--success)]'
                        : 'bg-red-500/10 border-red-500/40 text-red-400'
                      : 'bg-white/[0.03] border-white/10 text-white/40 hover:border-white/20'
                  )}
                >
                  {val ? 'Yes' : 'No'}
                </button>
              ))}
            </div>
            <button
              onClick={handleSubmit}
              disabled={under2Min === null}
              className="w-full py-4 bg-white text-black font-mono text-[10px] font-black tracking-widest uppercase rounded-2xl disabled:opacity-20 hover:brightness-90 transition-all"
            >
              Lock In Audit
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
