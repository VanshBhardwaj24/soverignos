import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { IndianRupee, TrendingDown, CheckCircle2 } from 'lucide-react';
import { usePsychStore } from '../../store/sovereign-psych';
import { useSovereignStore } from '../../store/sovereign';
import { cn } from '../../lib/utils';

function formatINR(amount: number): string {
  // Indian numbering: lakhs + crores
  if (amount >= 10000000) {
    return `${(amount / 10000000).toFixed(2)} Cr`;
  }
  if (amount >= 100000) {
    return `${(amount / 100000).toFixed(2)} L`;
  }
  // Standard format with Indian commas
  return new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(Math.floor(amount));
}

export function SalaryClockWidget() {
  const { salaryClockConfig, configureSalaryClock, stopSalaryClock } = usePsychStore();
  const { jobApplications } = useSovereignStore();
  const [currentCost, setCurrentCost] = useState(0);
  const [showConfig, setShowConfig] = useState(false);
  const [configGradDate, setConfigGradDate] = useState(salaryClockConfig.graduationDate);
  const [configRate, setConfigRate] = useState(String(salaryClockConfig.hourlyOpportunityCost));

  // Detect job offer — stop the clock automatically
  const hasOffer = jobApplications.some(j => j.status === 'ACCEPTED' || j.status === 'PENDING OFFER');

  useEffect(() => {
    if (hasOffer && !salaryClockConfig.stopped) {
      stopSalaryClock();
    }
  }, [hasOffer, salaryClockConfig.stopped, stopSalaryClock]);

  // Live ticker
  const computeCost = useCallback(() => {
    const cfg = salaryClockConfig;
    const startMs = new Date(cfg.stopped && cfg.stoppedAt ? cfg.stoppedAt : cfg.graduationDate).getTime();
    const endMs = cfg.stopped && cfg.stoppedAt ? new Date(cfg.stoppedAt).getTime() : Date.now();
    const elapsedHours = (endMs - startMs) / 3600000;
    return Math.max(0, elapsedHours * cfg.hourlyOpportunityCost);
  }, [salaryClockConfig]);

  useEffect(() => {
    setCurrentCost(computeCost());
    if (salaryClockConfig.stopped) return; // no interval needed
    const id = setInterval(() => setCurrentCost(computeCost()), 1000);
    return () => clearInterval(id);
  }, [computeCost, salaryClockConfig.stopped]);

  const stopped = salaryClockConfig.stopped;

  return (
    <div className={cn(
      'relative p-5 rounded-[24px] border overflow-hidden transition-all duration-700',
      stopped
        ? 'bg-[var(--stat-body)]/5 border-[var(--stat-body)]/20 shadow-[0_0_40px_rgba(0,255,136,0.08)]'
        : 'bg-red-950/10 border-red-500/15 shadow-[0_0_30px_rgba(239,68,68,0.06)]'
    )}>
      {/* Ambient */}
      <div className={cn(
        'absolute inset-0 pointer-events-none transition-opacity duration-1000',
        stopped ? 'opacity-100' : 'opacity-0'
      )}>
        <div className="absolute top-0 right-0 w-40 h-40 bg-[var(--stat-body)]/8 rounded-full blur-3xl" />
      </div>

      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={cn(
            'h-7 w-7 rounded-lg flex items-center justify-center',
            stopped ? 'bg-[var(--stat-body)]/15 text-[var(--stat-body)]' : 'bg-red-500/10 text-red-400'
          )}>
            {stopped ? <CheckCircle2 size={14} /> : <TrendingDown size={14} />}
          </div>
          <div>
            <h3 className={cn(
              'font-bold text-[9px] font-black tracking-[0.3em] uppercase',
              stopped ? 'text-[var(--stat-body)]' : 'text-red-400'
            )}>
              {stopped ? 'Opportunity Cost — NEUTRALIZED' : 'Opportunity Cost'}
            </h3>
            <p className="font-bold text-[8px] text-white/20 uppercase tracking-wider">
              {stopped ? 'Cost frozen — offer secured' : `Since ${new Date(salaryClockConfig.graduationDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' })}`}
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowConfig(!showConfig)}
          className="font-bold text-[8px] text-white/15 hover:text-white/40 uppercase tracking-widest transition-colors"
        >
          {showConfig ? 'DONE' : 'EDIT'}
        </button>
      </div>

      {/* Main counter */}
      <div className="text-center py-4">
        <div className="flex items-center justify-center gap-1">
          <IndianRupee size={20} className={cn('mb-1', stopped ? 'text-[var(--stat-body)]' : 'text-red-400')} strokeWidth={1.5} />
          <motion.span
            key={Math.floor(currentCost / 1000)}
            className={cn(
              'font-bold font-black tabular-nums tracking-tighter text-5xl',
              stopped ? 'text-[var(--stat-body)]' : 'text-white'
            )}
          >
            {formatINR(currentCost)}
          </motion.span>
        </div>
        {!stopped && (
          <div className="flex items-center justify-center gap-1.5 mt-2">
            <div className="h-1.5 w-1.5 rounded-full bg-red-500 animate-ping" />
            <span className="font-bold text-[8px] text-red-400/60 uppercase tracking-widest">
              ₹{salaryClockConfig.hourlyOpportunityCost}/hr accumulating
            </span>
          </div>
        )}
        {stopped && (
          <p className="font-bold text-[9px] text-[var(--stat-body)]/60 uppercase tracking-widest mt-2">
            ✓ First offer received
          </p>
        )}
      </div>

      {/* Config panel */}
      {showConfig && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-2 pt-4 border-t border-white/5 space-y-3"
        >
          <div>
            <label className="block font-bold text-[8px] text-white/20 uppercase tracking-widest mb-1.5">
              Graduation / Start Date
            </label>
            <input
              type="date"
              value={configGradDate}
              onChange={e => setConfigGradDate(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-[11px] font-bold text-white outline-none focus:border-white/30 [color-scheme:dark]"
            />
          </div>
          <div>
            <label className="block font-bold text-[8px] text-white/20 uppercase tracking-widest mb-1.5">
              Hourly Rate (₹/hr)
            </label>
            <input
              type="number"
              value={configRate}
              onChange={e => setConfigRate(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-[11px] font-bold text-white outline-none focus:border-white/30"
              placeholder="300"
            />
            <p className="font-bold text-[7px] text-white/15 mt-1">
              Entry-level ₹8L/yr ≈ ₹385/hr
            </p>
          </div>
          <button
            onClick={() => {
              configureSalaryClock({
                graduationDate: configGradDate,
                hourlyOpportunityCost: Number(configRate) || 300,
              });
              setShowConfig(false);
            }}
            className="w-full py-2.5 bg-white text-black font-bold text-[9px] font-black tracking-widest uppercase rounded-xl hover:brightness-90 transition-all"
          >
            Save Config
          </button>
        </motion.div>
      )}
    </div>
  );
}
