import { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, ChevronRight, Lock } from 'lucide-react';
import { usePsychStore } from '../../store/sovereign-psych';

interface Props {
  onComplete: () => void;
}

const WEEKLY_QUESTIONS = [
  "What are you tolerating right now that you shouldn't be?",
  "If your closest friend reviewed how you spent this week, what would they say?",
  "What have you been meaning to do for more than 3 weeks that you still haven't started?",
  "What would you do differently this week if you knew for certain you'd get the outcome you want?",
  "What story are you telling yourself that isn't true?",
  "Who did you avoid reaching out to this week, and why?",
  "What did you do this week that 6-months-ago-you would be proud of?",
  "What problem are you pretending doesn't exist?",
];

// Deterministic: rotate based on ISO week number
function getWeekNumber(d: Date): number {
  const onejan = new Date(d.getFullYear(), 0, 1);
  return Math.ceil(((d.getTime() - onejan.getTime()) / 86400000 + onejan.getDay() + 1) / 7);
}

export function WeeklyQuestion({ onComplete }: Props) {
  const { addWeeklyAnswer, weeklyQuestions } = usePsychStore();

  const weekNum = getWeekNumber(new Date());
  const question = WEEKLY_QUESTIONS[weekNum % WEEKLY_QUESTIONS.length];
  const [answer, setAnswer] = useState('');
  const [submitted, setSubmitted] = useState(false);

  // Check if already answered this week
  const todayKey = new Date().toISOString().split('T')[0];
  const alreadyAnswered = weeklyQuestions.some(q =>
    q.date.startsWith(todayKey.slice(0, 7)) && q.question === question
  );

  const handleSubmit = () => {
    if (!answer.trim()) return;
    addWeeklyAnswer(question, answer.trim());
    setSubmitted(true);
  };

  const wordCount = answer.trim().split(/\s+/).filter(Boolean).length;

  if (alreadyAnswered && !submitted) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Lock size={16} className="text-[var(--stat-mind)]/50" />
          <span className="font-mono text-[9px] tracking-[0.3em] text-[var(--stat-mind)]/50 uppercase font-black">
            Weekly Question — Answered
          </span>
        </div>
        <div className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl">
          <p className="font-mono text-xs text-white/30 italic">"{question}"</p>
          <p className="font-mono text-xs text-white/50 mt-3">
            {weeklyQuestions.find(q => q.question === question)?.answer}
          </p>
        </div>
        <button
          onClick={onComplete}
          className="w-full py-4 bg-white/5 border border-white/10 text-white font-mono text-[10px] font-black tracking-widest uppercase rounded-2xl hover:bg-white/10 transition-all flex items-center justify-center gap-2"
        >
          Continue <ChevronRight size={14} />
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <MessageCircle size={16} className="text-[var(--stat-mind)]" />
          <span className="font-mono text-[9px] tracking-[0.3em] text-[var(--stat-mind)] uppercase font-black">
            Weekly Question
          </span>
        </div>
        <p className="font-mono text-white/30 text-xs">
          One hard question. No right answer. Total privacy.
        </p>
      </div>

      {/* The question */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 bg-[var(--stat-mind)]/[0.04] border border-[var(--stat-mind)]/15 rounded-2xl"
      >
        <span className="font-mono text-[8px] text-[var(--stat-mind)]/50 uppercase tracking-widest block mb-3">
          Week {weekNum} Question
        </span>
        <p className="font-sans text-xl font-light text-white leading-snug">
          "{question}"
        </p>
      </motion.div>

      {!submitted ? (
        <div className="space-y-3">
          <textarea
            value={answer}
            onChange={e => setAnswer(e.target.value)}
            placeholder="Write your honest answer here. No one else will read this."
            autoFocus
            className="w-full bg-white/[0.03] border border-white/10 rounded-2xl p-5 text-sm font-mono text-white/80 min-h-[160px] outline-none focus:border-[var(--stat-mind)]/30 transition-all resize-none placeholder:text-white/10 leading-relaxed"
          />
          <div className="flex items-center justify-between">
            <span className="font-mono text-[8px] text-white/15">
              {wordCount} word{wordCount !== 1 ? 's' : ''}
            </span>
            <button
              onClick={handleSubmit}
              disabled={wordCount < 3}
              className="px-8 py-3 bg-white text-black font-mono text-[10px] font-black tracking-widest uppercase rounded-2xl disabled:opacity-20 hover:brightness-90 transition-all"
            >
              Commit Truth
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-4 bg-[var(--stat-mind)]/5 border border-[var(--stat-mind)]/15 rounded-2xl"
          >
            <p className="font-mono text-[10px] text-[var(--stat-mind)] uppercase tracking-widest text-center">
              Truth committed. This answer will age.
            </p>
          </motion.div>
          <button
            onClick={onComplete}
            className="w-full py-4 bg-white/5 border border-white/10 text-white font-mono text-[10px] font-black tracking-widest uppercase rounded-2xl hover:bg-white/10 transition-all flex items-center justify-center gap-2"
          >
            Continue <ChevronRight size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
