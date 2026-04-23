import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, CheckCircle, ChevronDown, ChevronUp, Search } from 'lucide-react';
import { usePsychStore } from '../../store/sovereign-psych';

const EXAMPLE_SENTENCES = [
  'Applied to 2 jobs, avoided leetcode again, gym was good.',
  'Did nothing meaningful today and I know exactly why.',
  'Shipped the backtesting UI skeleton. First real progress in a week.',
  'Studied 3 hours, gym skipped, feeling behind but not broken.',
  'Solid day. Needs to happen 6 more times this week.',
];

export function HonestSentence() {
  const { dailySentences, addDailySentence } = usePsychStore();
  const [text, setText] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [exampleIdx, setExampleIdx] = useState(Math.floor(Math.random() * EXAMPLE_SENTENCES.length));
  const inputRef = useRef<HTMLInputElement>(null);

  const today = new Date().toISOString().split('T')[0];
  const todayEntry = dailySentences.find(s => s.date === today);

  // Streak: count consecutive days with entries
  const streak = (() => {
    let count = 0;
    let d = new Date();
    while (true) {
      const key = d.toISOString().split('T')[0];
      if (dailySentences.find(s => s.date === key)) {
        count++;
        d.setDate(d.getDate() - 1);
      } else break;
    }
    return count;
  })();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || todayEntry) return;
    addDailySentence(text.trim());
    setText('');
  };

  const filteredHistory = dailySentences.filter(s =>
    s.text.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-5 rounded-[24px] border border-white/[0.06] bg-white/[0.02]">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="h-7 w-7 rounded-lg bg-[var(--stat-mind)]/10 flex items-center justify-center text-[var(--stat-mind)]">
            <MessageSquare size={14} />
          </div>
          <div>
            <h3 className="font-bold text-[9px] font-black tracking-[0.3em] text-[var(--stat-mind)] uppercase">
              One Honest Sentence
            </h3>
            {streak > 0 && (
              <p className="font-bold text-[8px] text-white/25 uppercase tracking-wider">
                {streak} consecutive day{streak !== 1 ? 's' : ''} logged
              </p>
            )}
          </div>
        </div>
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="text-white/20 hover:text-white transition-colors"
        >
          {showHistory ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
      </div>

      {/* Input area */}
      {todayEntry ? (
        <div className="flex items-start gap-3 p-3 bg-[var(--stat-mind)]/5 border border-[var(--stat-mind)]/15 rounded-xl">
          <CheckCircle size={14} className="text-[var(--stat-mind)] mt-0.5 shrink-0" />
          <p className="font-bold text-[11px] text-white/60 leading-relaxed">{todayEntry.text}</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="relative">
            <input
              ref={inputRef}
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder={EXAMPLE_SENTENCES[exampleIdx]}
              onFocus={() => setExampleIdx(Math.floor(Math.random() * EXAMPLE_SENTENCES.length))}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-[11px] font-bold text-white/80 outline-none focus:border-[var(--stat-mind)]/40 transition-all pr-20 placeholder:text-white/10"
            />
            <button
              type="submit"
              disabled={!text.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-[var(--stat-mind)]/80 text-white font-bold text-[8px] font-black tracking-widest uppercase rounded-lg disabled:opacity-20 transition-all hover:bg-[var(--stat-mind)]"
            >
              COMMIT
            </button>
          </div>
          <p className="mt-2 font-bold text-[8px] text-white/15 uppercase tracking-widest">
            One sentence. No minimum length. Just honest.
          </p>
        </form>
      )}

      {/* History panel */}
      <AnimatePresence>
        {showHistory && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="mt-4 overflow-hidden"
          >
            <div className="relative mb-3">
              <Search size={11} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" />
              <input
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Search entries..."
                className="w-full bg-white/5 border border-white/5 rounded-xl pl-8 pr-3 py-2 text-[10px] font-bold text-white/60 outline-none"
              />
            </div>
            <div className="space-y-1.5 max-h-48 overflow-y-auto no-scrollbar">
              {filteredHistory.slice(0, 30).map(entry => (
                <div key={entry.id} className="flex gap-3 py-1.5 border-b border-white/[0.04] last:border-0">
                  <span className="font-bold text-[8px] text-white/15 shrink-0 mt-0.5 w-16">
                    {new Date(entry.date + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </span>
                  <p className="font-bold text-[10px] text-white/40 leading-relaxed">{entry.text}</p>
                </div>
              ))}
              {filteredHistory.length === 0 && (
                <p className="text-center text-white/15 font-bold text-[9px] py-4">No entries found</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
