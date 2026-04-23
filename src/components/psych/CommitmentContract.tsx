import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { FileText, PenLine, ChevronRight, Check, Plus, Trash2 } from 'lucide-react';
import { usePsychStore } from '../../store/sovereign-psych';
import { useSovereignStore } from '../../store/sovereign';

interface Props {
  onComplete: () => void;
}

const DEFAULT_COMMITMENTS = [
  'Solve at least 1 LeetCode problem every day',
  'Send at least 3 job applications',
  'Post at least 1 piece of content publicly',
  'Log energy every morning',
  'Write one honest sentence daily',
  '',
  '',
];

export function CommitmentContract({ onComplete }: Props) {
  const { weeklyContracts, createContract, reviewContract } = usePsychStore();
  const { user } = useSovereignStore();

  const [commitments, setCommitments] = useState<string[]>(DEFAULT_COMMITMENTS);
  const [phase, setPhase] = useState<'review' | 'write' | 'sign' | 'done'>('review');
  const [adherenceScore, setAdherenceScore] = useState(70);
  const signatureRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSigned, setHasSigned] = useState(false);

  const weekOf = new Date().toISOString().split('T')[0];
  const userName = user?.email?.split('@')[0] || 'Operator';

  // Last week's contract
  const lastContract = weeklyContracts[0];
  const isPastContract = lastContract && lastContract.weekOf !== weekOf && !lastContract.reviewedAt;

  // Canvas drawing
  const startDraw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = signatureRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = signatureRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.stroke();
    setHasSigned(true);
  };

  const stopDraw = () => setIsDrawing(false);

  const clearSig = () => {
    const canvas = signatureRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSigned(false);
  };

  const handleExecute = () => {
    if (!hasSigned) return;
    const filled = commitments.filter(c => c.trim());
    createContract(weekOf, userName, filled);
    setPhase('done');
  };

  if (phase === 'done') {
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
          <h3 className="font-bold text-lg font-light text-white mb-2">Contract Executed</h3>
          <p className="font-bold text-sm text-white/40">
            {commitments.filter(c => c.trim()).length} commitments locked in for this week.
          </p>
          <p className="font-bold text-[10px] text-white/20 mt-1">
            You will be asked to review this next Sunday.
          </p>
        </div>
        <button
          onClick={onComplete}
          className="px-8 py-3 bg-white text-black font-bold text-[10px] font-black tracking-widest uppercase rounded-2xl hover:brightness-90 transition-all flex items-center gap-2"
        >
          Complete Protocol <ChevronRight size={14} />
        </button>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <FileText size={16} className="text-white/60" />
          <span className="font-bold text-[9px] tracking-[0.3em] text-white/60 uppercase font-black">
            Commitment Contract
          </span>
        </div>
        <p className="font-bold text-white/30 text-xs">
          A signed commitment you review next Sunday.
        </p>
      </div>

      {/* Review last week's contract */}
      {isPastContract && phase === 'review' ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <div className="p-5 bg-white/[0.02] border border-white/10 rounded-2xl">
            <p className="font-bold text-[8px] text-white/20 uppercase tracking-widest mb-3">
              Last Week's Contract — Review
            </p>
            <div className="space-y-1.5 mb-4">
              {lastContract.commitments.map((c, i) => (
                <div key={i} className="flex items-start gap-2">
                  <div className="h-3 w-3 rounded border border-white/20 flex items-center justify-center mt-0.5 shrink-0">
                    <div className="h-1.5 w-1.5 rounded-sm bg-white/20" />
                  </div>
                  <span className="font-bold text-[10px] text-white/40">{c}</span>
                </div>
              ))}
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="font-bold text-[9px] text-white/30 uppercase tracking-widest">
                  Adherence %
                </label>
                <span className="font-bold text-sm font-black text-white">{adherenceScore}%</span>
              </div>
              <input
                type="range" min={0} max={100} value={adherenceScore}
                onChange={e => setAdherenceScore(Number(e.target.value))}
                className="w-full accent-white/60 h-1"
              />
              <button
                onClick={() => {
                  reviewContract(lastContract.id, adherenceScore);
                  setPhase('write');
                }}
                className="w-full py-3 bg-white/10 border border-white/20 text-white font-bold text-[9px] font-black tracking-widest uppercase rounded-xl hover:bg-white/20 transition-all"
              >
                Submit Review → Write New Contract
              </button>
            </div>
          </div>
        </motion.div>
      ) : (
        <div className="space-y-4">
          {/* PDF-style contract */}
          <div className="p-6 bg-white/[0.02] border border-white/[0.08] rounded-2xl font-bold space-y-4">
            <div className="text-center border-b border-white/10 pb-4">
              <p className="text-[10px] text-white/30 uppercase tracking-[0.3em] mb-1">Sovereign Weekly Contract</p>
              <p className="text-[9px] text-white/20">
                Week of {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>
            <p className="text-[10px] text-white/40">I, <span className="text-white font-bold uppercase">{userName}</span>, commit to:</p>
            <div className="space-y-2">
              {commitments.map((c, i) => (
                <div key={i} className="flex items-center gap-2 group">
                  <span className="text-[9px] text-white/20 w-4 shrink-0">{i + 1}.</span>
                  <input
                    value={c}
                    onChange={e => {
                      const next = [...commitments];
                      next[i] = e.target.value;
                      setCommitments(next);
                    }}
                    placeholder={i < 5 ? "Add commitment..." : "Optional..."}
                    className="flex-1 bg-transparent border-b border-white/10 focus:border-white/30 outline-none text-[10px] text-white/70 py-1 transition-all placeholder:text-white/15"
                  />
                  {commitments.length > 3 && (
                    <button
                      onClick={() => setCommitments(commitments.filter((_, j) => j !== i))}
                      className="opacity-0 group-hover:opacity-100 text-white/15 hover:text-red-400 transition-all"
                    >
                      <Trash2 size={10} />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button
              onClick={() => setCommitments([...commitments, ''])}
              className="flex items-center gap-1.5 text-white/20 hover:text-white/50 transition-colors text-[9px]"
            >
              <Plus size={10} /> Add commitment
            </button>

            {/* Signature pad */}
            <div className="border-t border-white/10 pt-4">
              <p className="text-[9px] text-white/25 mb-2">Signed:</p>
              <div className="relative border border-white/10 rounded-xl overflow-hidden bg-white/[0.02]">
                <canvas
                  ref={signatureRef}
                  width={400}
                  height={80}
                  onMouseDown={startDraw}
                  onMouseMove={draw}
                  onMouseUp={stopDraw}
                  onMouseLeave={stopDraw}
                  className="w-full cursor-crosshair"
                />
                {!hasSigned && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="flex items-center gap-2 opacity-20">
                      <PenLine size={14} />
                      <span className="text-[9px]">Draw your signature</span>
                    </div>
                  </div>
                )}
                {hasSigned && (
                  <button
                    onClick={clearSig}
                    className="absolute top-2 right-2 text-[8px] text-white/20 hover:text-white/50 font-bold uppercase tracking-widest"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={handleExecute}
            disabled={!hasSigned || !commitments.some(c => c.trim())}
            className="w-full py-4 bg-white text-black font-bold text-[10px] font-black tracking-widest uppercase rounded-2xl disabled:opacity-20 hover:brightness-90 transition-all"
          >
            Execute Contract
          </button>
        </div>
      )}
    </div>
  );
}
