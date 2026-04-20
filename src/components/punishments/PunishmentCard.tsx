import { motion } from 'framer-motion';
import { ShieldAlert, Zap, Banknote, Brain, CheckCircle2 } from 'lucide-react';
import type { Punishment } from '../../store/sovereign';
import { cn } from '../../lib/utils';
import { useSovereignStore } from '../../store/sovereign';

interface Props {
  punishment: Punishment;
}

export const PunishmentCard = ({ punishment }: Props) => {
  const clearPunishment = useSovereignStore(state => state.clearPunishment);
  
  const getTypeConfig = () => {
    switch (punishment.type) {
      case 'physical': return { icon: Zap, color: '#FFB800', bg: 'rgba(255,184,0,0.1)' };
      case 'financial': return { icon: Banknote, color: '#ef4444', bg: 'rgba(239,68,68,0.1)' };
      case 'mental': return { icon: Brain, color: '#A855F7', bg: 'rgba(168,85,247,0.1)' };
      default: return { icon: ShieldAlert, color: '#888', bg: 'rgba(255,255,255,0.05)' };
    }
  };

  const config = getTypeConfig();
  const Icon = config.icon;
  const isCleared = punishment.status === 'cleared';

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "p-6 rounded-[2rem] border transition-all relative overflow-hidden group",
        isCleared 
          ? "bg-white/[0.02] border-white/5 opacity-50 grayscale" 
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
          <span className="font-mono text-[9px] text-white/20 uppercase font-black tracking-widest bg-white/5 px-3 py-1 rounded-full">
            {new Date(punishment.date).toLocaleDateString()}
          </span>
        </div>

        <div className="mb-6 flex-1">
          <h4 className="font-mono text-sm font-black text-white uppercase mb-2 tracking-tight">
            {punishment.title}
          </h4>
          <p className="text-[11px] text-white/40 leading-relaxed font-medium uppercase tracking-tighter">
            {punishment.description}
          </p>
          {punishment.penalty && (
            <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-red-500/10 border border-red-500/20">
               <span className="font-mono text-[10px] text-red-500 font-black">PENALTY: -{punishment.penalty} GC</span>
            </div>
          )}
        </div>

        {!isCleared ? (
          <button 
            onClick={() => clearPunishment(punishment.id)}
            className="w-full py-4 bg-white text-black rounded-2xl font-mono text-[10px] font-black tracking-[0.2em] uppercase hover:brightness-90 active:scale-[0.98] transition-all"
          >
            CERTIFY RESOLUTION
          </button>
        ) : (
          <div className="flex items-center gap-2 text-[var(--success)] py-2">
            <CheckCircle2 size={16} />
            <span className="font-mono text-[10px] font-black uppercase tracking-widest">Protocol Standardized</span>
          </div>
        )}
      </div>
    </motion.div>
  );
};
