import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  CreditCard, Calendar, Target,
  ChevronRight, X, Shield, Info
} from 'lucide-react';
import { useSovereignStore } from '../../store/sovereign';
import { cn } from '../../lib/utils';
import { SHOP_ITEMS } from '../../lib/constants';

interface LoanModalProps {
  itemId: string;
  onClose: () => void;
}

export default function LoanModal({ itemId, onClose }: LoanModalProps) {
  const { requestLoan } = useSovereignStore();
  const item = SHOP_ITEMS.find(i => i.id === itemId);

  const [duration, setDuration] = useState<1 | 3 | 6 | 12>(1);
  const [strategy, setStrategy] = useState<'all_earnings' | 'monthly_target'>('all_earnings');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!item) return null;

  const interestRate = 0.05;
  const totalRepay = Math.floor(item.cost * (1 + interestRate));
  const interestAmount = totalRepay - item.cost;
  const monthlyRepayment = Math.floor(totalRepay / duration);

  const handleRequest = async () => {
    setIsSubmitting(true);
    const result = await requestLoan(itemId, duration, strategy);
    if (result.success) {
      onClose();
    }
    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-[1100] flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/90 backdrop-blur-2xl"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative w-full max-w-lg bg-[#0a0a0a] border border-white/10 rounded-[32px] overflow-hidden shadow-[0_0_100px_rgba(0,0,0,1)] mt-10"
      >
        {/* Glow Effects */}
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-[var(--stat-wealth)]/10 rounded-full blur-[100px]" />
        <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-purple-500/10 rounded-full blur-[100px]" />

        <div className="relative z-10 p-6 md:p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 bg-[var(--stat-wealth)]/20 rounded-xl flex items-center justify-center text-[var(--stat-wealth)] border border-[var(--stat-wealth)]/30">
                <CreditCard size={20} />
              </div>
              <div>
                <h2 className="font-bold text-[8px] tracking-[0.4em] text-white/30 uppercase font-black">GC LENDING PROTOCOL</h2>
                <div className="text-lg font-black text-white tracking-tighter uppercase italic">Loan Acquisition</div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="h-8 w-8 rounded-full bg-white/5 flex items-center justify-center text-white/20 hover:text-white hover:bg-white/10 transition-all"
            >
              <X size={16} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column: Summary */}
            <div className="space-y-4">
              <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
                <div className="flex items-center gap-2 mb-2 opacity-30">
                  <Target size={12} className="text-white" />
                  <span className="font-bold text-[8px] uppercase tracking-widest font-bold">Asset Target</span>
                </div>
                <h3 className="text-sm font-black text-white uppercase italic mb-0.5">{item.name}</h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-white">{item.cost}</span>
                  <span className="text-[10px] font-bold text-white/20 uppercase">GC</span>
                </div>
              </div>

              <div className="space-y-3 px-1">
                <div className="flex justify-between items-center">
                  <span className="text-[9px] font-bold text-white/30 uppercase tracking-widest">Principal</span>
                  <span className="text-sm font-bold text-white">{item.cost} GC</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[9px] font-bold text-white/30 uppercase tracking-widest">Interest (5%)</span>
                  <span className="text-sm font-bold text-[var(--stat-wealth)]">+{interestAmount} GC</span>
                </div>
                <div className="h-px bg-white/5 my-2" />
                <div className="flex justify-between items-center py-3 px-4 bg-white/5 rounded-2xl border border-white/5">
                  <span className="text-[9px] font-bold text-white/60 uppercase tracking-widest font-black">Total Debt</span>
                  <span className="text-base font-black text-white">{totalRepay} GC</span>
                </div>
              </div>
            </div>

            {/* Right Column: Configuration */}
            <div className="space-y-6">
              {/* Duration Selection */}
              <div>
                <label className="flex items-center gap-2 mb-3">
                  <Calendar size={12} className="text-white/20" />
                  <span className="font-bold text-[8px] uppercase text-white/40 tracking-widest font-black">Duration</span>
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[1, 3, 6, 12].map((m) => (
                    <button
                      key={m}
                      onClick={() => setDuration(m as any)}
                      className={cn(
                        "py-2.5 rounded-xl font-bold text-xs font-black transition-all border",
                        duration === m
                          ? "bg-white text-black border-white"
                          : "bg-white/5 text-white/40 border-white/5 hover:border-white/20"
                      )}
                    >
                      {m}M
                    </button>
                  ))}
                </div>
              </div>

              {/* Repayment Strategy */}
              <div>
                <label className="flex items-center gap-2 mb-4">
                  <Shield size={14} className="text-white/20" />
                  <span className="font-bold text-[9px] uppercase text-white/40 tracking-widest font-black">Repayment Mode</span>
                </label>
                <div className="space-y-2">
                  <button
                    onClick={() => setStrategy('all_earnings')}
                    className={cn(
                      "w-full p-4 rounded-2xl border text-left transition-all group",
                      strategy === 'all_earnings'
                        ? "bg-white/10 border-white/20"
                        : "bg-white/[0.02] border-white/5 hover:border-white/10"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className={cn("text-[9px] font-black uppercase tracking-widest", strategy === 'all_earnings' ? "text-white" : "text-white/40")}>Aggressive</span>
                      <div className={cn("h-3 w-3 rounded-full border-2", strategy === 'all_earnings' ? "border-white bg-white" : "border-white/10")} />
                    </div>
                    <p className="text-[9px] text-white/20 mt-1 uppercase">100% EARNINGS DIVERSION</p>
                  </button>
                  <button
                    onClick={() => setStrategy('monthly_target')}
                    className={cn(
                      "w-full p-4 rounded-2xl border text-left transition-all group",
                      strategy === 'monthly_target'
                        ? "bg-white/10 border-white/20"
                        : "bg-white/[0.02] border-white/5 hover:border-white/10"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className={cn("text-[9px] font-black uppercase tracking-widest", strategy === 'monthly_target' ? "text-white" : "text-white/40")}>Targeted</span>
                      <div className={cn("h-3 w-3 rounded-full border-2", strategy === 'monthly_target' ? "border-white bg-white" : "border-white/10")} />
                    </div>
                    <div className="flex justify-between items-end mt-1">
                      <p className="text-[9px] text-white/20 uppercase">Monthly Target</p>
                      <span className="text-[11px] font-bold text-white/60">{monthlyRepayment} GC/mo</span>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Warning Footer */}
          <div className="mt-8 p-5 bg-[var(--stat-wealth)]/5 border border-[var(--stat-wealth)]/10 rounded-[28px] flex gap-5 items-start">
            <Info className="text-[var(--stat-wealth)] shrink-0" size={20} />
            <div className="space-y-1">
              <h4 className="text-[9px] font-black text-[var(--stat-wealth)] uppercase tracking-widest">Transparency Disclosure</h4>
              <p className="text-[10px] text-[var(--stat-wealth)]/50 uppercase leading-relaxed font-medium">
                THIS WILL COST YOU <span className="text-[var(--stat-wealth)] font-black">{interestAmount} GC</span> MORE THAN BUYING OUTRIGHT.
                <br />
                FAILURE TO REPAY WITHIN 14 DAYS TRIGGERS XP DAMPENING (50% REDUCTION) UNTIL RESOLVED.
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-8 flex gap-4">
            <button
              onClick={onClose}
              className="flex-1 py-4 font-bold text-xs font-black tracking-widest text-white/30 uppercase hover:text-white transition-colors"
            >
              Decline
            </button>
            <button
              onClick={handleRequest}
              disabled={isSubmitting}
              className="flex-[2] py-4 bg-white text-black rounded-2xl font-bold text-xs font-black tracking-widest uppercase hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-white/5 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? 'PROCESSING...' : 'REQUEST LOAN'} <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
