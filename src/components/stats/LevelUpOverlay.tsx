import { motion, AnimatePresence } from 'framer-motion';
import { Shield, ChevronRight } from 'lucide-react';

interface LevelUpOverlayProps {
  statName: string;
  oldLevel: number;
  newLevel: number;
  color: string;
  onClose: () => void;
}

export function LevelUpOverlay({ statName, oldLevel, newLevel, color, onClose }: LevelUpOverlayProps) {
  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-xl"
        onClick={onClose}
      >
        <motion.div 
          initial={{ scale: 0.8, y: 20, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          transition={{ type: "spring", damping: 15 }}
          className="relative max-w-sm w-full p-12 text-center"
        >
          {/* Background Glow */}
          <div 
            className="absolute inset-0 blur-[100px] opacity-30 rounded-full"
            style={{ backgroundColor: color }}
          />

          <motion.div 
            animate={{ 
              rotate: [0, 5, -5, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{ repeat: Infinity, duration: 4 }}
            className="mb-8 flex justify-center"
          >
            <div 
              className="h-24 w-24 rounded-3xl flex items-center justify-center shadow-[0_0_50px_rgba(255,255,255,0.1)] border border-white/20"
              style={{ backgroundColor: `${color}20` }}
            >
              <Shield size={48} style={{ color: color }} />
            </div>
          </motion.div>

          <h1 className="font-mono text-[10px] tracking-[0.5em] text-white/40 uppercase mb-2">Capabilities Evolution</h1>
          <h2 className="font-mono text-5xl font-black text-white tracking-tighter mb-8 uppercase italic">Rank Up</h2>
          
          <div className="flex items-center justify-center gap-6 mb-12">
            <div className="flex flex-col items-center">
              <span className="text-[10px] font-mono text-white/40 uppercase mb-1">Pillar</span>
              <span className="text-sm font-bold text-white tracking-widest uppercase">{statName}</span>
            </div>
            <div className="h-10 w-[1px] bg-white/10" />
            <div className="flex items-center gap-4">
              <span className="text-4xl font-mono font-black text-white/20">{oldLevel}</span>
              <ChevronRight className="text-white/40" />
              <motion.span 
                animate={{ scale: [1, 1.5, 1] }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="text-6xl font-mono font-black text-white"
                style={{ textShadow: `0 0 30px ${color}` }}
              >
                {newLevel}
              </motion.span>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="px-8 py-3 bg-white text-black font-mono font-black text-xs tracking-widest rounded-full hover:scale-105 active:scale-95 transition-all uppercase"
          >
            Acknowledge [Enter]
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
