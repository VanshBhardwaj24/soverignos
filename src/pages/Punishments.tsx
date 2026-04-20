import { useSovereignStore } from '../store/sovereign';
import { ShieldAlert, History, AlertTriangle, Scale, Zap, Ban } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { PunishmentCard } from '../components/punishments/PunishmentCard';
import { AccountabilityMeter } from '../components/punishments/AccountabilityMeter';
import { cn } from '../lib/utils';
import { useState } from 'react';

export default function Punishments() {
  const { punishments, accountabilityScore } = useSovereignStore();
  const [filter, setFilter] = useState<'all' | 'active' | 'cleared'>('active');

  const filteredPunishments = punishments.filter(p => {
    if (filter === 'all') return true;
    return p.status === filter;
  });

  const activeCount = punishments.filter(p => p.status === 'active').length;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-7xl mx-auto space-y-12 pb-24">
      {/* Header section */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 pt-8">
        <div>
          <h1 className="font-mono text-[11px] tracking-[0.5em] text-red-500 uppercase font-black mb-3 flex items-center gap-2">
            <AlertTriangle size={14} className="animate-pulse" /> Accountability Command
          </h1>
          <h2 className="font-mono text-5xl font-black text-white tracking-tighter uppercase max-w-2xl leading-none">
            Penal Protocols <span className="text-white/20">&</span> Sanction Registry
          </h2>
          <p className="mt-6 text-sm text-[var(--text-secondary)] font-medium max-w-xl uppercase tracking-tighter leading-relaxed">
            The system tracks all deviations from the prime protocol. Unresolved violations will result in progressive neural degradation and wealth sanctions.
          </p>
        </div>

        <div className="w-full lg:w-auto">
          <AccountabilityMeter score={accountabilityScore} />
        </div>
      </div>

      {/* Control Bar */}
      <div className="flex items-center justify-between p-2 bg-[var(--bg-elevated)]/40 border border-white/5 rounded-3xl backdrop-blur-md">
        <div className="flex items-center gap-2">
          <FilterButton active={filter === 'active'} onClick={() => setFilter('active')} label="Active Violations" count={activeCount} />
          <FilterButton active={filter === 'cleared'} onClick={() => setFilter('cleared')} label="Standardized" count={punishments.length - activeCount} />
          <FilterButton active={filter === 'all'} onClick={() => setFilter('all')} label="Entire registry" />
        </div>

        <div className="hidden md:flex items-center gap-6 px-4">
          <div className="flex flex-col items-end">
            <span className="text-[9px] font-mono text-white/30 uppercase tracking-[0.2em]">Status</span>
            <span className={cn(
              "text-xs font-black uppercase tracking-widest",
              accountabilityScore >= 90 ? "text-[var(--success)]" : accountabilityScore < 40 ? "text-red-500" : "text-white"
            )}>
              {accountabilityScore >= 90 ? 'FULLY COMPLIANT' : accountabilityScore < 40 ? 'CRITICAL INSTABILITY' : 'OPERATIONAL'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        <AnimatePresence mode="popLayout">
          {filteredPunishments.length > 0 ? (
            filteredPunishments.map(p => (
              <PunishmentCard key={p.id} punishment={p} />
            ))
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="col-span-full py-32 border border-dashed border-white/10 rounded-[40px] flex flex-col items-center justify-center text-center px-6"
            >
              <div className="h-20 w-20 rounded-[40px] bg-white/5 flex items-center justify-center text-white/20 mb-6">
                <ShieldAlert size={32} />
              </div>
              <h3 className="font-mono text-lg font-black text-white uppercase mb-2">Registry Clear</h3>
              <p className="font-mono text-[10px] text-white/30 uppercase tracking-[0.3em]">No active protocol violations detected at this altitude.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* F29: Escalation Registry */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { tier: 'Tier 1: Minor', penalty: '-5 ACCOUNTABILITY', trigger: '1-2 Active Violations', color: 'text-yellow-500' },
          { tier: 'Tier 2: Severe', penalty: '-2% WEALTH // -10 MIND', trigger: '3-4 Active Violations', color: 'text-orange-500' },
          { tier: 'Tier 3: Critical', penalty: 'PROTOCOL LOCKOUT // -50 GLOBAL XP', trigger: '5+ Active Violations', color: 'text-red-500' }
        ].map((t, i) => (
          <div key={i} className="p-6 bg-white/[0.02] border border-white/5 rounded-3xl group hover:border-red-500/20 transition-all">
            <div className="flex justify-between items-center mb-4">
              <span className={cn("font-mono text-[9px] font-black uppercase tracking-widest", t.color)}>{t.tier}</span>
              {activeCount >= (i * 2 + 1) ? <Zap size={14} className={t.color} /> : <div className="h-1.5 w-1.5 rounded-full bg-white/10" />}
            </div>
            <h4 className="text-sm font-black text-white italic uppercase mb-1">{t.penalty}</h4>
            <p className="text-[9px] font-mono text-white/20 uppercase tracking-widest">Trigger: {t.trigger}</p>
          </div>
        ))}
      </div>

      {/* Footer Info */}
      <div className="p-8 rounded-[40px] bg-red-500/[0.03] border border-red-500/10 flex flex-col md:flex-row items-center gap-8">
        <div className="h-16 w-16 shrink-0 rounded-full border border-red-500/20 flex items-center justify-center text-red-500/40">
          <History size={32} />
        </div>
        <div className="space-y-1 text-center md:text-left">
          <h4 className="font-mono text-sm font-black text-white uppercase tracking-tight">System Policy</h4>
          <p className="text-[10px] text-white/30 font-medium uppercase tracking-tighter max-w-2xl">
            Daily protocol missed at 00:00 IST results in -5 Accountability. Manual FAILURE results in -2. Clearing a physical penalty restores +1 Integrity.
          </p>
        </div>
      </div>

    </div>
  );
}

function FilterButton({ active, label, count, onClick }: { active: boolean, label: string, count?: number, onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-6 py-2.5 rounded-2xl font-mono text-[9px] font-black tracking-widest uppercase transition-all flex items-center gap-3",
        active ? "bg-white text-black shadow-xl" : "text-white/40 hover:text-white/60 hover:bg-white/5"
      )}
    >
      {label}
      {count !== undefined && (
        <span className={cn(
          "px-1.5 py-0.5 rounded text-[8px]",
          active ? "bg-black/10 text-black/60" : "bg-white/10 text-white/40"
        )}>
          {count}
        </span>
      )}
    </button>
  );
}
