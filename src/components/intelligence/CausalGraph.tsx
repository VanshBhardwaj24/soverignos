import { motion } from 'framer-motion';
import { Share2, Zap } from 'lucide-react';
import { useSovereignStore } from '../../store/sovereign';

export const CausalGraph = () => {
  const { surveillanceMetrics } = useSovereignStore();
  const graph = surveillanceMetrics.causalGraph || { nodes: [], connections: [] };

  return (
    <section className="p-8 rounded-3xl border border-[var(--border-default)] bg-white/[0.02] backdrop-blur-xl h-full flex flex-col">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-2">
          <Share2 size={18} className="text-emerald-400" />
          <h2 className="font-mono text-xs tracking-[0.2em] uppercase text-[var(--text-secondary)]">Causal Relationship Graph</h2>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 font-mono text-[9px] text-white/20 uppercase">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            Positive
          </div>
          <div className="flex items-center gap-1.5 font-mono text-[9px] text-white/20 uppercase">
            <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
            Negative
          </div>
        </div>
      </div>

      <div className="flex-1 relative min-h-[300px] bg-black/20 rounded-2xl border border-white/5 overflow-hidden">
        <svg className="absolute inset-0 w-full h-full">
          {graph.connections.map((conn: any, i: number) => {
            const from = graph.nodes.find((n: any) => n.id === conn.from);
            const to = graph.nodes.find((n: any) => n.id === conn.to);
            if (!from || !to) return null;

            return (
              <g key={i}>
                <motion.line
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  x1={from.x} y1={from.y} x2={to.x} y2={to.y}
                  stroke={conn.strength > 0 ? "rgba(52, 211, 153, 0.2)" : "rgba(248, 113, 113, 0.2)"}
                  strokeWidth={2 + Math.abs(conn.strength) * 10}
                />
                <circle cx={(from.x + to.x)/2} cy={(from.y + to.y)/2} r={2} fill="white" className="animate-pulse" />
              </g>
            );
          })}
        </svg>

        {graph.nodes.map((node: any, i: number) => (
          <motion.div
            key={i}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-2 group cursor-pointer"
            style={{ left: node.x, top: node.y }}
          >
            <div 
              className="w-12 h-12 rounded-xl border border-white/10 flex items-center justify-center bg-black/40 backdrop-blur-md group-hover:border-emerald-500/50 transition-all shadow-xl"
              style={{ color: node.color }}
            >
              <span className="font-mono text-[10px] font-black uppercase">{node.label.slice(0, 4)}</span>
            </div>
            <span className="font-mono text-[8px] text-white/40 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
              {node.label}
            </span>
          </motion.div>
        ))}
      </div>

      <div className="mt-8 p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10 flex items-center gap-3">
        <Zap size={14} className="text-emerald-400" />
        <p className="text-[10px] text-emerald-400/80 font-mono italic">
          Discovery #1: High BODY XP correlates with a 34% increase in subsequent CODE session quality.
        </p>
      </div>
    </section>
  );
};
