import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, 
  Brain, 
  Zap, 
  Activity, 
  Target, 
  HelpCircle,
  X,
  Info
} from 'lucide-react';
import { useSovereignStore } from '../../store/sovereign';
import { cn } from '../../lib/utils';

interface MetricMetadata {
  label: string;
  definition: string;
  formula: string;
  target: string;
  icon: any;
  color: string;
}

const METADATA: Record<string, MetricMetadata> = {
  resistanceFactor: {
    label: 'RESISTANCE FACTOR',
    definition: 'Measures your ability to tackle P0 (High Stakes) tasks over P3 (Low Stakes) fluff.',
    formula: '(P0 completion / Total tasks) * 100',
    target: '> 80%',
    icon: Shield,
    color: 'text-blue-400'
  },
  cognitiveEntropy: {
    label: 'COGNITIVE ENTROPY',
    definition: 'Measures the disorder and fragmentation in your stat distribution.',
    formula: 'Shannon entropy applied to stat XP variance',
    target: '20-40%',
    icon: Brain,
    color: 'text-purple-400'
  },
  willpowerReserve: {
    label: 'WILLPOWER RESERVE',
    definition: 'Your ability to maintain output quality during high-fatigue hours.',
    formula: '(Late-night XP avg / Daily XP avg) * 100',
    target: '> 70%',
    icon: Zap,
    color: 'text-yellow-400'
  },
  throughput: {
    label: 'THROUGHPUT',
    definition: 'Your total cognitive output volume over the last 30 days.',
    formula: 'Sum of all XP logged in 30D window',
    target: '> 2000 XP',
    icon: Activity,
    color: 'text-emerald-400'
  },
  focusBalance: {
    label: 'FOCUS BALANCE',
    definition: 'How well you distribute effort across all 8 Sovereign stats.',
    formula: '1 - (Std Dev / Mean of stat levels)',
    target: '> 60%',
    icon: Target,
    color: 'text-pink-400'
  },
  consistency: {
    label: 'CONSISTENCY',
    definition: 'The stability of your daily output cycle.',
    formula: '1 - (Variance of daily XP / Mean)',
    target: '> 60%',
    icon: Shield,
    color: 'text-indigo-400'
  }
};

export const SurveillanceMatrix = () => {
  const { surveillanceMetrics } = useSovereignStore();
  const [activeFormula, setActiveFormula] = useState<string | null>(null);

  return (
    <section>
      <div className="flex items-center gap-2 mb-4">
        <Activity size={18} className="text-emerald-400" />
        <h2 className="font-mono text-xs tracking-[0.2em] uppercase text-[var(--text-secondary)]">Surveillance Matrix</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(METADATA).map(([key, meta]) => {
          const value = surveillanceMetrics[key] || 0;
          const isHealthy = value >= 50; // Simplified health check

          return (
            <motion.div 
              key={key}
              whileHover={{ scale: 1.02 }}
              className="p-6 rounded-2xl border border-[var(--border-default)] bg-white/[0.02] relative group cursor-pointer overflow-hidden"
              onClick={() => setActiveFormula(key)}
            >
              <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <HelpCircle size={14} className="text-[var(--text-secondary)]" />
              </div>

              <div className="flex items-center gap-4 mb-4">
                <div className={cn("p-3 rounded-xl bg-white/5", meta.color)}>
                  <meta.icon size={20} />
                </div>
                <div>
                  <h3 className="font-mono text-[10px] tracking-widest text-[var(--text-secondary)] uppercase">{meta.label}</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold tracking-tighter">{value}{key === 'throughput' ? '' : '%'}</span>
                    <span className="text-xs text-emerald-400">↑ 12%</span>
                  </div>
                </div>
              </div>

              <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${value}%` }}
                  className={cn("h-full", isHealthy ? "bg-blue-500" : "bg-red-500")}
                />
              </div>

              {/* Hover Tooltip - Simplified implementation using CSS for performance */}
              <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity h-0 group-hover:h-auto overflow-hidden">
                <p className="text-[10px] text-[var(--text-secondary)] leading-relaxed italic">
                  {meta.definition}
                </p>
                <div className="flex justify-between mt-3 pt-3 border-t border-white/5">
                  <span className="text-[9px] font-mono uppercase text-white/40">Target</span>
                  <span className="text-[9px] font-mono text-emerald-400">{meta.target}</span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <AnimatePresence>
        {activeFormula && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
              onClick={() => setActiveFormula(null)}
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-md p-8 rounded-[32px] bg-[#0d0d0d] border border-white/10 shadow-2xl"
            >
              <button 
                onClick={() => setActiveFormula(null)}
                className="absolute top-6 right-6 p-2 rounded-full bg-white/5 hover:bg-white/10"
              >
                <X size={16} />
              </button>

              <div className="flex items-center gap-4 mb-6">
                <div className={cn("p-4 rounded-2xl bg-white/5", METADATA[activeFormula].color)}>
                  {React.createElement(METADATA[activeFormula].icon, { size: 24 })}
                </div>
                <div>
                  <h2 className="text-xl font-bold tracking-tight">{METADATA[activeFormula].label}</h2>
                  <p className="text-sm text-[var(--text-secondary)]">Calculation Formula</p>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-white/5 font-mono text-sm border border-white/5 mb-6">
                {METADATA[activeFormula].formula}
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Info size={16} className="text-blue-400 mt-0.5" />
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                    This metric is recalculated every 60 seconds based on your active mission logs and behavioral patterns.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};
