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
        <p className="eyebrow text-[var(--text-muted)] mb-2">Global Logistics</p>
        <h1 className="h-display">Travel archive</h1>
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
                  ? "bg-[var(--bg-primary)]/40 border-[var(--border-default)] opacity-50 grayscale"
                  : "surface-card hover-lift"
              )}
            >
              <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
                {loc.icon}
              </div>

              <div className="mb-6 flex justify-between items-start">
                <div className={cn(
                  "h-12 w-12 rounded-2xl flex items-center justify-center border transition-colors",
                  loc.isLocked
                    ? "bg-[var(--bg-elevated)] border-[var(--border-default)] text-[var(--text-muted)]"
                    : "bg-[var(--bg-hover)] border-[var(--border-strong)] text-[var(--text-primary)]"
                )}>
                  {loc.isLocked ? <Lock size={20} /> : loc.icon}
                </div>
                {!loc.isLocked && (
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : loc.id)}
                    className="p-2 hover:bg-[var(--bg-hover)] rounded-xl transition-colors text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                  >
                    {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </button>
                )}
              </div>

              <h3 className="h-section italic mb-2 text-[var(--text-primary)]">{loc.name}</h3>
              <p className="stat-label text-[var(--text-muted)] mb-6 italic">
                {loc.desc}
              </p>

              {goal && !loc.isLocked && (
                <div className="space-y-3 mb-8">
                  <div className="flex justify-between items-center stat-label">
                    <span className="text-[var(--text-muted)]">Savings Progress</span>
                    <span className="text-[var(--stat-wealth)]">{progress.toFixed(0)}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-[var(--bg-elevated)] rounded-full overflow-hidden border border-[var(--border-default)]">
                    <div className="h-full bg-gradient-to-r from-[var(--stat-wealth)] to-[var(--stat-code)] transition-all duration-1000" style={{ width: `${progress}%` }} />
                  </div>
                </div>
              )}

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden border-t border-[var(--border-default)] pt-6 mt-2 space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="stat-label text-[var(--text-muted)]">Inventory Checklist</h4>
                      <Package size={12} className="text-[var(--text-muted)]" />
                    </div>
                    <div className="space-y-2">
                      {['Passport Proxy', 'Hardware Vault', 'Tactical Gear'].map(item => (
                        <div key={item} className="flex items-center gap-3 p-3 surface-elevated group/item border-[var(--border-default)]">
                          <CheckSquare size={14} className="text-[var(--text-muted)] group-hover/item:text-[var(--success)]" />
                          <span className="stat-label text-[var(--text-secondary)] group-hover/item:text-[var(--text-primary)] transition-colors italic">{item}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="mt-auto space-y-3 pt-6">
                <div className="flex justify-between items-center text-[10px] font-bold uppercase font-black">
                  <span className="text-[var(--text-muted)]">Requirement</span>
                  <span className={loc.isLocked ? "text-[var(--danger)]" : "text-[var(--success)]"}>{loc.condition}</span>
                </div>
                <button
                  disabled={loc.isLocked}
                  className={cn(
                    "btn-primary w-full py-5",
                    loc.isLocked && "opacity-20 cursor-not-allowed grayscale"
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
