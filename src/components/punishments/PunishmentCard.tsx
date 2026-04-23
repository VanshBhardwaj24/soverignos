import { motion } from 'framer-motion';
import { ShieldAlert, Zap, Banknote, Brain, CheckCircle2 } from 'lucide-react';
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
      case 'physical': return { icon: Zap, color: '#FFB800', bg: 'rgba(255,184,0,0.1)', label: 'PHYSICAL' };
      case 'financial': return { icon: Banknote, color: '#ef4444', bg: 'rgba(239,68,68,0.1)', label: 'FINANCIAL' };
      case 'mental': return { icon: Brain, color: '#A855F7', bg: 'rgba(168,85,247,0.1)', label: 'MENTAL' };
      case 'consequential': return { icon: ShieldAlert, color: '#00D1FF', bg: 'rgba(0,209,255,0.1)', label: 'CONSEQUENTIAL' };
      default: return { icon: ShieldAlert, color: '#888', bg: 'rgba(255,255,255,0.05)', label: 'SYSTEM' };
    }
  };

  const config = getTypeConfig();
  const Icon = config.icon;
  const isCleared = punishment.status === 'cleared';
  const isAwaiting = punishment.status === 'awaiting_selection';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "p-6 rounded-[2rem] border transition-all relative overflow-hidden group",
        isCleared
          ? "bg-white/[0.02] border-white/5 opacity-50 grayscale"
          : isAwaiting
            ? "bg-red-500/[0.03] border-red-500/20 shadow-2xl shadow-red-500/5 ring-1 ring-red-500/10"
            : "bg-[var(--bg-elevated)]/60 border-white/10 hover:border-white/20 shadow-xl"
      )}
    >
      <div
        className="absolute top-0 right-0 p-8 opacity-5 transition-transform group-hover:scale-110"
        style={{ color: config.color }}
      >
        <Icon size={120} />
      </div>

      <div className="relative z-10 flex flex-col h-full">
        <div className="flex items-start justify-between mb-4">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center border transition-colors shadow-lg"
            style={{
              backgroundColor: isCleared ? 'rgba(255,255,255,0.05)' : config.bg,
              borderColor: isCleared ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.1)'
            }}
          >
            <Icon size={24} style={{ color: isCleared ? 'white' : config.color }} />
          </div>
          <div className="flex flex-col items-end gap-1">
            <span className="font-bold text-[9px] text-white/20 uppercase font-black tracking-widest bg-white/5 px-3 py-1 rounded-full border border-white/5">
              {new Date(punishment.date).toLocaleDateString()}
            </span>
            {isAwaiting && (
              <span className="text-[8px] font-black text-red-500/80 animate-pulse tracking-widest uppercase">Action Required</span>
            )}
          </div>
        </div>

        <div className="mb-6 flex-1">
          <h4 className="font-bold text-sm font-black text-white uppercase mb-2 tracking-tight flex items-center gap-2">
            {punishment.title}
          </h4>
          <p className="text-[11px] text-white/40 leading-relaxed font-medium uppercase tracking-tighter">
            {punishment.description}
          </p>
          {punishment.penalty && (
            <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-red-500/10 border border-red-500/20">
              <span className="font-bold text-[10px] text-red-500 font-black">SANCTION: -{punishment.penalty} GC</span>
            </div>
          )}
        </div>

        {isAwaiting ? (
          <div className="space-y-3">
            <p className="text-[9px] font-bold font-black text-white/40 uppercase tracking-widest mb-1 italic">Select Resolution Protocol:</p>
            {punishment.options?.map((option: any) => (
              <button
                key={option.id}
                onClick={() => acceptPunishmentOption(punishment.id, option.id)}
                className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl text-left hover:bg-white/10 hover:border-white/20 transition-all group/opt active:scale-[0.99]"
              >
                <div className="flex items-center justify-between gap-4 mb-1">
                  <span className="font-bold text-[10px] font-black text-white uppercase group-hover/opt:text-[var(--accent)] transition-colors">{option.title}</span>
                  <span className="text-[9px] font-bold text-white/20 uppercase">+{option.xpReward} XP</span>
                </div>
                <p className="text-[9px] text-white/30 lowercase font-medium tracking-tight line-clamp-2 leading-relaxed">
                  {option.description}
                </p>
              </button>
            ))}
          </div>
        ) : !isCleared ? (
          <div className="flex gap-2">
            <button
              onClick={() => clearPunishment(punishment.id)}
              disabled={!!(punishment.type === 'consequential' && punishment.status === 'active' && punishment.questId) && (new Date().getTime() - new Date(punishment.date).getTime() <= 48 * 60 * 60 * 1000)}
              className={cn(
                "flex-1 py-4 bg-white text-black rounded-2xl font-bold text-[10px] font-black tracking-[0.2em] uppercase hover:brightness-90 active:scale-[0.98] transition-all",
                (punishment.type === 'consequential' && punishment.status === 'active' && punishment.questId) && (new Date().getTime() - new Date(punishment.date).getTime() <= 48 * 60 * 60 * 1000) && "opacity-50 cursor-not-allowed bg-white/20 text-white/40 border border-white/10"
              )}
            >
              {(punishment.type === 'consequential' && punishment.status === 'active' && punishment.questId)
                ? (new Date().getTime() - new Date(punishment.date).getTime() > 48 * 60 * 60 * 1000)
                  ? "Acknowledge & Dismiss"
                  : "Resolving via Protocol..."
                : "Certify Resolution"}
            </button>
            {punishment.status === 'active' && (new Date().getTime() - new Date(punishment.date).getTime() > 48 * 60 * 60 * 1000) && punishment.questId && (
              <button
                onClick={() => clearPunishment(punishment.id)}
                className="flex-1 py-4 bg-white/5 border border-white/10 text-white/50 rounded-2xl font-bold text-[10px] uppercase hover:bg-white/10 hover:text-white transition-all"
              >
                Dismiss
              </button>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2 text-[var(--success)] py-2 bg-[var(--success)]/5 rounded-xl px-4 border border-[var(--success)]/10">
            <CheckCircle2 size={16} />
            <span className="font-bold text-[10px] font-black uppercase tracking-widest">Protocol Standardized</span>
          </div>
        )}
      </div>
    </motion.div>
  );
};
