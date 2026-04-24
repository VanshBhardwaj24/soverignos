import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Package } from 'lucide-react';
import type { LootDrop } from '../../types/loot';
import { cn } from '../../lib/utils';

interface LootDropOverlayProps {
  drop: LootDrop;
  onClose: () => void;
}

const RARITY_COLORS = {
  common: 'white',
  uncommon: '#3b82f6', // blue
  rare: '#a855f7', // purple
  epic: '#f59e0b', // amber
  legendary: '#ef4444' // red
};

export function LootDropOverlay({ drop, onClose }: LootDropOverlayProps) {
  const [phase, setPhase] = useState<0 | 1 | 2 | 3>(0);
  const color = RARITY_COLORS[drop.rarity];

  useEffect(() => {
    // Phase 0: 0-0.3s (Fade in)
    const t1 = setTimeout(() => setPhase(1), 300);
    // Phase 1: 0.3-1.0s (Shake/Vibrate)
    const t2 = setTimeout(() => setPhase(2), 1000);
    // Phase 2: 1.0-1.5s (Burst open)
    const t3 = setTimeout(() => setPhase(3), 1500);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[250] flex items-center justify-center bg-black/95 backdrop-blur-2xl"
      >
        <div className="relative w-full max-w-sm flex flex-col items-center p-8">
          
          {/* Phase 0: "SUPPLY DROP INCOMING" */}
          <AnimatePresence>
            {phase < 3 && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="absolute top-12 text-center"
              >
                <h1 className="text-[10px] tracking-[0.5em] text-white/50 uppercase font-bold animate-pulse">
                  Protocol Complete
                </h1>
                <h2 className="text-xl font-black text-white tracking-widest mt-2 uppercase italic">
                  Supply Drop Incoming
                </h2>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Glow backdrop (Phases 2-3) */}
          <AnimatePresence>
            {phase >= 2 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 0.3, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="absolute inset-0 blur-[100px] rounded-full pointer-events-none"
                style={{ backgroundColor: color }}
              />
            )}
          </AnimatePresence>

          {/* Chest Icon Area */}
          <div className="relative h-48 w-48 flex items-center justify-center my-16">
            <motion.div
              animate={
                phase === 0 ? { scale: 0.8, opacity: 0 } :
                phase === 1 ? { 
                  x: [0, -5, 5, -5, 5, 0], 
                  y: [0, 2, -2, 2, -2, 0],
                  scale: 1, opacity: 1 
                } :
                phase === 2 ? { scale: 1.5, rotate: [0, -10, 10, 0] } :
                { scale: 1.2, opacity: 0.5, y: -20 } // Phase 3 (opened state background)
              }
              transition={
                phase === 1 ? { repeat: Infinity, duration: 0.3 } :
                phase === 2 ? { type: 'spring', bounce: 0.5 } :
                { duration: 0.4 }
              }
              className={cn(
                "h-32 w-32 rounded-3xl flex items-center justify-center shadow-[0_0_50px_rgba(255,255,255,0.05)] border border-white/10 z-10",
                phase >= 2 ? "bg-black/50 backdrop-blur-md" : "bg-white/5"
              )}
              style={phase >= 2 ? { borderColor: color, boxShadow: `0 0 50px ${color}40` } : {}}
            >
              <Package size={64} className={phase >= 2 ? "" : "text-white/50"} style={phase >= 2 ? { color } : {}} />
            </motion.div>
          </div>

          {/* Phase 3: The Reveal */}
          <AnimatePresence>
            {phase === 3 && (
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ staggerChildren: 0.2 }}
                className="w-full flex flex-col items-center gap-6 z-20"
              >
                <div className="text-center mb-4">
                  <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest block mb-1">
                    {drop.rarity} DROP
                  </span>
                  <motion.h2 
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    className="text-4xl font-black uppercase tracking-tighter"
                    style={{ color, textShadow: `0 0 20px ${color}80` }}
                  >
                    +{drop.gc} GC
                  </motion.h2>
                </div>

                <div className="w-full flex flex-col gap-3">
                  {drop.modifiers.map((mod, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + (i * 0.1) }}
                      className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center gap-3 backdrop-blur-md shadow-xl"
                    >
                      <div className="h-2 w-2 rounded-full" style={{ backgroundColor: color, boxShadow: `0 0 10px ${color}` }} />
                      <span className="text-xs font-bold text-white/90 tracking-widest uppercase">
                        {mod.label}
                      </span>
                    </motion.div>
                  ))}
                </div>

                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                  onClick={onClose}
                  className="mt-8 px-8 py-4 w-full bg-white text-black font-bold font-black text-xs tracking-[0.2em] rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all uppercase shadow-[0_10px_40px_rgba(255,255,255,0.2)]"
                >
                  Collect Loot
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </motion.div>
    </AnimatePresence>
  );
}
