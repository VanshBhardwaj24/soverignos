import { motion } from 'framer-motion';
import { ShieldAlert, Zap, Banknote, Brain, CheckCircle2, ChevronRight } from 'lucide-react';
import type { Punishment } from '../../store/sovereign';
import { cn } from '../../lib/utils';
import { useSovereignStore } from '../../store/sovereign';

interface Props {
  punishment: Punishment;
}

export const PunishmentCard = ({ punishment }: Props) => {
  const { acceptPunishmentOption, clearPunishment } = useSovereignStore();

  const getTypeConfig = () => {
    switch (punishment.type) {
      case 'physical': return { icon: Zap, color: 'var(--warning)', bg: 'color-mix(in srgb, var(--warning) 10%, transparent)', label: 'Physical' };
      case 'financial': return { icon: Banknote, color: 'var(--danger)', bg: 'color-mix(in srgb, var(--danger) 10%, transparent)', label: 'Financial' };
      case 'mental': return { icon: Brain, color: 'var(--stat-brand)', bg: 'color-mix(in srgb, var(--stat-brand) 10%, transparent)', label: 'Mental' };
      case 'consequential': return { icon: ShieldAlert, color: 'var(--stat-code)', bg: 'color-mix(in srgb, var(--stat-code) 10%, transparent)', label: 'Consequential' };
      default: return { icon: ShieldAlert, color: 'var(--text-muted)', bg: 'var(--bg-elevated)', label: 'System' };
    }
  };

  const config = getTypeConfig();
  const Icon = config.icon;
  const isCleared = punishment.status === 'cleared';
  const isAwaiting = punishment.status === 'awaiting_selection';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "surface-card p-6 flex flex-col h-full relative overflow-hidden group",
        isCleared && "opacity-50 grayscale",
        isAwaiting && "border-[var(--danger)]/30 bg-[color-mix(in_srgb,var(--danger)_3%,transparent)] shadow-[0_0_20px_rgba(239,68,68,0.05)]"
      )}
    >
      {/* Background Icon Watermark */}
      <div
        className="absolute -top-4 -right-4 opacity-[0.03] transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6"
        style={{ color: config.color }}
      >
        <Icon size={140} strokeWidth={1} />
      </div>

      <div className="relative z-10 flex flex-col h-full">
        <div className="flex items-start justify-between mb-5">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center border border-white/5 shadow-inner"
            style={{ backgroundColor: isCleared ? 'var(--bg-elevated)' : config.bg }}
          >
            <Icon size={24} style={{ color: isCleared ? 'var(--text-muted)' : config.color }} strokeWidth={1.5} />
          </div>
          <div className="flex flex-col items-end gap-1.5">
            <span className="font-mono text-[9px] font-bold text-[var(--text-muted)] tracking-wider uppercase bg-white/5 px-2.5 py-1 rounded-md border border-white/5">
              {new Date(punishment.date).toLocaleDateString()}
            </span>
            {isAwaiting && (
              <span className="eyebrow text-[10px] text-red-500/80 animate-pulse">Action Required</span>
            )}
          </div>
        </div>

        <div className="mb-6 flex-1">
          <h4 className="h-card text-white mb-2 leading-tight">
            {punishment.title}
          </h4>
          <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed font-medium">
            {punishment.description}
          </p>
          {punishment.penalty && (
            <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[var(--danger)]/10 border border-[var(--danger)]/20 shadow-sm">
              <span className="font-mono text-[10px] font-bold text-[var(--danger)] uppercase tracking-tight">Sanction: −{punishment.penalty} GC</span>
            </div>
          )}
        </div>

        {isAwaiting ? (
          <div className="space-y-2.5 mt-2">
            <p className="eyebrow text-[10px] text-[var(--text-muted)] mb-1">Select Resolution Protocol:</p>
            {punishment.options?.map((option: any) => (
              <button
                key={option.id}
                onClick={() => acceptPunishmentOption(punishment.id, option.id)}
                className="w-full p-4 bg-white/[0.03] border border-white/5 rounded-2xl text-left hover:bg-white/[0.06] hover:border-white/20 transition-all group/opt active:scale-[0.98] flex items-center justify-between gap-4"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-[12px] text-white truncate">{option.title}</span>
                    <span className="font-mono text-[10px] text-[var(--stat-brand)] shrink-0">+{option.xpReward} XP</span>
                  </div>
                  <p className="text-[11px] text-[var(--text-muted)] line-clamp-2 leading-tight">
                    {option.description}
                  </p>
                </div>
                <ChevronRight size={14} className="text-[var(--text-muted)] group-hover/opt:translate-x-1 transition-transform" />
              </button>
            ))}
          </div>
        ) : !isCleared ? (
          <div className="flex gap-3 mt-2">
            <button
              onClick={() => clearPunishment(punishment.id)}
              disabled={!!(punishment.type === 'consequential' && punishment.status === 'active' && punishment.questId) && (new Date().getTime() - new Date(punishment.date).getTime() <= 48 * 60 * 60 * 1000)}
              className={cn(
                "flex-1 py-3.5 bg-white text-black rounded-2xl font-bold text-[11px] tracking-tight hover:bg-white/90 active:scale-[0.98] transition-all shadow-lg",
                (punishment.type === 'consequential' && punishment.status === 'active' && punishment.questId) && (new Date().getTime() - new Date(punishment.date).getTime() <= 48 * 60 * 60 * 1000) && "opacity-50 cursor-not-allowed bg-white/20 text-white/40 shadow-none border border-white/5"
              )}
            >
              {(punishment.type === 'consequential' && punishment.status === 'active' && punishment.questId)
                ? (new Date().getTime() - new Date(punishment.date).getTime() > 48 * 60 * 60 * 1000)
                  ? "Acknowledge & Dismiss"
                  : "Resolving via Protocol..."
                : "Certify Resolution"}
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3 py-3 bg-[var(--success)]/5 rounded-2xl px-5 border border-[var(--success)]/10 text-[var(--success)] shadow-inner">
            <CheckCircle2 size={18} strokeWidth={2} />
            <span className="font-semibold text-[12px] tracking-tight">Protocol Standardized</span>
          </div>
        )}
      </div>
    </motion.div>
  );
};
