import { motion } from 'framer-motion';
import { Shield, Target, Zap, BarChart2 } from 'lucide-react';

const stats = [
  { icon: Shield, label: 'Security Status', value: 'Optimal', color: 'var(--stat-spirit)' },
  { icon: Target, label: 'Goal Progression', value: '98.4%', color: 'var(--stat-mind)' },
  { icon: Zap, label: 'System Performance', value: 'Calibrated', color: 'var(--stat-code)' },
  { icon: BarChart2, label: 'Personal Analytics', value: 'Stable', color: 'var(--stat-body)' },
];

export const AuthHero = () => {
  return (
    <div className="flex-1 relative flex flex-col justify-center px-12 lg:px-20 overflow-hidden bg-gradient-to-br from-[#050505] to-[#0a0a0a]">
      {/* Decorative Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[var(--stat-code)]/10 blur-[100px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[var(--stat-mind)]/5 blur-[100px] rounded-full" />

      <div className="relative z-10 max-w-lg">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="flex items-center gap-3 mb-6">

          </div>

          <h1 className="text-5xl lg:text-6xl font-bold text-white tracking-tighter mb-8">
            Sovereign <span className="text-white/40">OS</span>
          </h1>

          <p className="text-sm lg:text-base text-[var(--text-muted)] leading-relaxed mb-12 max-w-sm">
            Optimize your performance with precision. The central interface for high-output management and cognitive oversight.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 gap-4">
          {stats.map((stat, idx) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 + idx * 0.1 }}
              className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-all group"
            >
              <stat.icon size={18} className="mb-4" style={{ color: stat.color }} />
              <div className="text-[9px] tracking-widest text-[var(--text-muted)] uppercase font-bold mb-1 group-hover:text-white transition-colors">
                {stat.label}
              </div>
              <div className="text-sm font-bold text-white">
                {stat.value}
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-16 pt-8 border-t border-white/5"
        >
          <div className="flex items-center gap-4">
            <div className="flex-1 h-[1px] bg-white/5" />
            <span className="text-[9px] tracking-[0.3em] text-white/20 uppercase font-bold">System Status: Secure</span>
            <div className="flex-1 h-[1px] bg-white/5" />
          </div>
        </motion.div>
      </div>
    </div>
  );
};
