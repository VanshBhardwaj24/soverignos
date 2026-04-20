import { motion } from 'framer-motion';
import { ShieldCheck, ShieldAlert, ShieldX } from 'lucide-react';

interface Props {
  score: number;
}

export const AccountabilityMeter = ({ score }: Props) => {
  const getStatus = () => {
    if (score >= 90) return { label: 'TRUSTED', color: 'var(--success)', icon: ShieldCheck };
    if (score >= 60) return { label: 'STANDARD', color: 'var(--text-primary)', icon: ShieldCheck };
    if (score >= 30) return { label: 'PAROLE', color: 'var(--warning)', icon: ShieldAlert };
    return { label: 'EXILED', color: 'var(--danger)', icon: ShieldX };
  };

  const status = getStatus();
  const Icon = status.icon;
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center p-8 bg-[var(--bg-elevated)]/40 rounded-[40px] border border-white/5 backdrop-blur-xl relative overflow-hidden group">
      {/* Background Glow */}
      <div 
        className="absolute inset-0 opacity-5 blur-3xl transition-colors duration-1000"
        style={{ backgroundColor: status.color }}
      />

      <div className="relative w-32 h-32 mb-4">
        <svg className="w-full h-full -rotate-90">
          <circle
            cx="64"
            cy="64"
            r={radius}
            fill="transparent"
            stroke="currentColor"
            strokeWidth="4"
            className="text-white/5"
          />
          <motion.circle
            cx="64"
            cy="64"
            r={radius}
            fill="transparent"
            stroke={status.color}
            strokeWidth="4"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            strokeLinecap="round"
          />
        </svg>
        
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-mono text-3xl font-black text-white">{score}</span>
          <span className="font-mono text-[8px] text-white/40 tracking-[0.2em] font-black uppercase">Integrity</span>
        </div>
      </div>

      <div className="flex flex-col items-center gap-1 relative z-10">
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10">
          <Icon size={12} style={{ color: status.color }} />
          <span className="font-mono text-[10px] font-black tracking-widest text-white uppercase">{status.label}</span>
        </div>
        <p className="text-[9px] text-white/30 font-medium uppercase tracking-tighter mt-1">System Trust Quotient</p>
      </div>
    </div>
  );
};
