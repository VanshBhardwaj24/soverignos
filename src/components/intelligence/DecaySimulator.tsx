import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingDown, ShieldAlert, Target } from 'lucide-react';
import { useSovereignStore } from '../../store/sovereign';
import { cn } from '../../lib/utils';
import { predictStateDecay } from '../../lib/intelligence';

export const DecaySimulator = () => {
  const [days, setDays] = useState(7);
  const [statId, setStatId] = useState('code');
  const { statLevels } = useSovereignStore();

  const currentLevel = statLevels[statId] || 1;
  
  const simulation = useMemo(() => {
    const horizons = [3, 7, 14, 30];
    return horizons.map(h => {
      const projected = predictStateDecay(statId, h, currentLevel);
      const retention = (projected / currentLevel) * 100;
      return { days: h, projected, retention };
    });
  }, [statId, currentLevel]);

  const activeSimulation = useMemo(() => {
    const projected = predictStateDecay(statId, days, currentLevel);
    const retention = (projected / currentLevel) * 100;
    const readiness = Math.max(0, retention * 0.8); // Interview readiness heuristic

    return { projected, retention, readiness };
  }, [statId, days, currentLevel]);

  return (
    <section className="p-8 rounded-3xl border border-[var(--border-default)] bg-white/[0.02] backdrop-blur-xl h-full">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-2">
          <TrendingDown size={18} className="text-red-400" />
          <h2 className="font-mono text-xs tracking-[0.2em] uppercase text-[var(--text-secondary)]">State Decay Simulator</h2>
        </div>
        <select 
          value={statId}
          onChange={(e) => setStatId(e.target.value)}
          className="bg-transparent border-none font-mono text-[10px] uppercase tracking-widest text-blue-400 focus:outline-none cursor-pointer"
        >
          {Object.keys(statLevels).map(s => <option key={s} value={s} className="bg-black">{s}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="space-y-8">
          <div className="flex justify-between items-end">
            <div>
              <p className="font-mono text-[10px] text-white/40 uppercase mb-1">Current State</p>
              <h3 className="text-2xl font-bold tracking-tighter text-white">Level {currentLevel}</h3>
            </div>
            <div className="text-right">
              <p className="font-mono text-[10px] text-white/40 uppercase mb-1">Retention</p>
              <h3 className="text-2xl font-bold tracking-tighter text-emerald-400">94%</h3>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between font-mono text-[10px] uppercase">
              <span className="text-white/40">Inactivity Period</span>
              <span className="text-red-400 font-black">{days} Days</span>
            </div>
            <input 
              type="range" 
              min="0" 
              max="30" 
              value={days}
              onChange={(e) => setDays(parseInt(e.target.value))}
              className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-red-500"
            />
            <div className="flex justify-between font-mono text-[8px] text-white/20 uppercase tracking-widest">
              <span>Today</span>
              <span>15 Days</span>
              <span>30 Days</span>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-red-500/5 border border-red-500/10 space-y-4">
            <div className="flex items-center gap-2 text-red-400">
              <ShieldAlert size={16} />
              <span className="font-mono text-[10px] font-black uppercase">Decay Projection</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="font-mono text-[9px] text-white/30 uppercase mb-1">Effective Level</p>
                <p className="text-xl font-bold text-white tracking-tighter">{activeSimulation.projected.toFixed(2)}</p>
              </div>
              <div>
                <p className="font-mono text-[9px] text-white/30 uppercase mb-1">Retention Loss</p>
                <p className="text-xl font-bold text-red-400 tracking-tighter">-{ (100 - activeSimulation.retention).toFixed(1) }%</p>
              </div>
            </div>
            <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
              <motion.div 
                animate={{ width: `${activeSimulation.retention}%` }}
                className="h-full bg-red-500"
              />
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Target size={16} className="text-blue-400" />
              <h3 className="font-mono text-[10px] tracking-widest text-white/40 uppercase">Interview Readiness Index</h3>
            </div>
            <div className="flex items-end gap-3 mb-4">
              <span className={cn(
                "text-5xl font-black tracking-tighter",
                activeSimulation.readiness > 70 ? "text-emerald-400" : activeSimulation.readiness > 50 ? "text-orange-400" : "text-red-500"
              )}>
                {Math.round(activeSimulation.readiness)}%
              </span>
              <span className="font-mono text-[10px] text-white/20 uppercase mb-2 tracking-widest">SDE-1 Profile</span>
            </div>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed italic">
              {activeSimulation.readiness > 70 
                ? "You are currently optimized for technical screening. PROCEED." 
                : activeSimulation.readiness > 40 
                ? "Retention drop detected. Review DSA patterns before technical rounds." 
                : "Critical skill atrophy. RESCHEDULE interview to avoid system rejection."
              }
            </p>
          </div>

          <div className="space-y-3 pt-6 border-t border-white/5">
            <h4 className="font-mono text-[9px] text-white/20 uppercase tracking-widest">Simulation Horizons</h4>
            {simulation.map((s, i) => (
              <div key={i} className="flex justify-between items-center text-[10px] font-mono">
                <span className="text-white/40">Day {s.days} No Practice</span>
                <div className="flex gap-4">
                  <span className="text-white/60">Lv. {s.projected.toFixed(1)}</span>
                  <span className="text-red-400 font-bold">{Math.round(s.retention)}% Ret.</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
