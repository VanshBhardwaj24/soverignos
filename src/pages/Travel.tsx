import React from 'react';
import { AnimatePresence } from 'framer-motion';
import { Lock, Wind, Sun, Palmtree, Package, CheckSquare, ChevronDown, ChevronUp } from 'lucide-react';
import { useSovereignStore } from '../store/sovereign';
import { cn } from '../lib/utils';
import { motion } from 'framer-motion';

export default function Travel() {
  const { freedomScore, statLevels, financialGoals } = useSovereignStore();
  const [expandedId, setExpandedId] = React.useState<string | null>(null);


  const destinations = [
    {
      id: 'bali',
      name: 'UBUD, BALI',
      condition: 'WEALTH LV. 10',
      isLocked: statLevels.wealth < 10,
      icon: <Palmtree size={24} />,
      desc: 'Digital nomad hub. High clarity, low burn rate.',
      cost: 2500
    },
    {
      id: 'tokyo',
      name: 'SHIBUYA, TOKYO',
      condition: 'CODE LV. 20',
      isLocked: statLevels.code < 20,
      icon: <Wind size={24} />,
      desc: 'Neon-lit optimization. High-frequency networking.',
      cost: 8000
    },
    {
      id: 'lisbon',
      name: 'LISBON, PT',
      condition: 'FREEDOM > 40',
      isLocked: freedomScore < 40,
      icon: <Sun size={24} />,
      desc: 'The Atlantic nexus. Tactical expansion gateway.',
      cost: 4500
    },
    {
      id: 'mars',
      name: 'OLYMPUS MONS, MARS',
      condition: 'SOVEREIGN STATUS',
      isLocked: freedomScore < 95,
      icon: <Box size={20} />, // Placeholder for Box
      desc: 'The ultimate sovereignty. Off-world expansion.',
      cost: 1000000
    }
  ];

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-6xl mx-auto pb-12">
      <div className="mb-12">
        <h1 className="font-bold text-[11px] tracking-[0.2em] text-[var(--text-secondary)] opacity-80 uppercase mb-2">Global Logistics</h1>
        <h2 className="font-bold text-4xl font-light tracking-tight text-white">TRAVEL ARCHIVE</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {destinations.map((loc) => {
          const goal = financialGoals.find(g => g.name.toLowerCase().includes(loc.id));
          const progress = goal ? (goal.currentAmount / goal.targetAmount) * 100 : 0;
          const isExpanded = expandedId === loc.id;

          return (
            <motion.div
              key={loc.id}
              className={cn(
                "relative p-6 rounded-[32px] border transition-all duration-500 flex flex-col min-h-[380px] overflow-hidden group",
                loc.isLocked
                  ? "bg-white/[0.01] border-white/5 opacity-50 grayscale"
                  : "bg-white/[0.03] border-white/10 hover:border-white/30 shadow-2xl"
              )}
            >
              <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
                {loc.icon}
              </div>

              <div className="mb-6 flex justify-between items-start">
                <div className={cn(
                  "h-12 w-12 rounded-2xl flex items-center justify-center border",
                  loc.isLocked ? "bg-white/5 border-white/10 text-white/20" : "bg-white/10 border-white/20 text-white"
                )}>
                  {loc.isLocked ? <Lock size={20} /> : loc.icon}
                </div>
                {!loc.isLocked && (
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : loc.id)}
                    className="p-2 hover:bg-white/5 rounded-xl transition-colors text-white/20 hover:text-white"
                  >
                    {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </button>
                )}
              </div>

              <h3 className="text-2xl font-black text-white mb-2 uppercase italic tracking-tighter">{loc.name}</h3>
              <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest leading-relaxed mb-6 italic">
                {loc.desc}
              </p>

              {goal && !loc.isLocked && (
                <div className="space-y-3 mb-8">
                  <div className="flex justify-between items-center text-[10px] font-bold uppercase font-black">
                    <span className="text-white/20 tracking-tighter">Savings Progress</span>
                    <span className="text-[var(--stat-wealth)]">{progress.toFixed(0)}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                    <div className="h-full bg-gradient-to-r from-[var(--stat-wealth)] to-cyan-400 transition-all duration-1000" style={{ width: `${progress}%` }} />
                  </div>
                </div>
              )}

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden border-t border-white/5 pt-6 mt-2 space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="text-[10px] font-black font-bold text-white/40 uppercase tracking-widest">Inventory Checklist</h4>
                      <Package size={12} className="text-white/20" />
                    </div>
                    <div className="space-y-2">
                      {['Passport Proxy', 'Hardware Vault', 'Tactical Gear'].map(item => (
                        <div key={item} className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5 hover:bg-white/[0.08] transition-colors cursor-pointer group/item">
                          <CheckSquare size={14} className="text-white/20 group-hover/item:text-[var(--success)]" />
                          <span className="text-[11px] text-white/60 group-hover/item:text-white transition-colors uppercase font-bold">{item}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="mt-auto space-y-3 pt-6">
                <div className="flex justify-between items-center text-[10px] font-bold uppercase font-black">
                  <span className="text-white/20">Requirement</span>
                  <span className={loc.isLocked ? "text-[var(--danger)]" : "text-[var(--success)]"}>{loc.condition}</span>
                </div>
                <button
                  disabled={loc.isLocked}
                  className={cn(
                    "w-full py-4 rounded-xl font-bold text-[10px] font-black tracking-widest uppercase transition-all",
                    loc.isLocked
                      ? "bg-white/5 text-white/20 cursor-not-allowed border border-white/5"
                      : "bg-white text-black hover:scale-[0.98] active:scale-[0.95]"
                  )}
                >
                  {loc.isLocked ? "DEPLOYMENT LOCKED" : `INITIALIZE TRANSFER // $${loc.cost}`}
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

function Box({ size, className }: any) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
      <path d="m3.3 7 8.7 5 8.7-5" />
      <path d="M12 22V12" />
    </svg>
  );
}
