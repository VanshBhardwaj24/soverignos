import { useEffect, useState } from 'react';
import { useSovereignStore } from '../../store/sovereign';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Gift } from 'lucide-react';

export const InventoryModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const statLevels = useSovereignStore(state => state.statLevels);

  const totalLevels = Object.values(statLevels).reduce((a, b) => a + b, 0);
  const remainingTokens = Math.floor(totalLevels / 5);

  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener('sovereign:open-inventory', handleOpen);
    return () => window.removeEventListener('sovereign:open-inventory', handleOpen);
  }, []);

  const items = [
    { id: 1, name: 'Guilt-Free Cheat Meal', cost: 2, desc: 'Consume anything. No tracking required.' },
    { id: 2, name: 'Absolute Rest Day', cost: 5, desc: 'Zero daily quests required. No streak penalty.' },
    { id: 3, name: 'Video Game Session', cost: 1, desc: '2 hours of unrestricted, guilt-free gaming.' },
    { id: 4, name: 'Purchase Gear', cost: 10, desc: 'Authorize purchase of 1 wish-list item under $100.' },
  ]

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-md z-[600] flex items-center justify-center p-4 selection:bg-[var(--text-primary)]/20 text-[var(--text-primary)]"
        >
          <motion.div 
            initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: -20 }}
            className="w-full max-w-3xl bg-[var(--bg-card)] border border-[var(--border-default)] rounded-2xl overflow-hidden shadow-2xl relative"
          >
            <div className="p-6 border-b border-[var(--border-default)] flex justify-between items-center relative z-10">
              <div className="flex items-center gap-3">
                <Gift size={20} className="text-[var(--stat-wealth)]" />
                <h2 className="font-mono text-xl tracking-widest text-[var(--text-primary)]">VAULT INVENTORY</h2>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-[var(--text-muted)] hover:text-[var(--danger)] transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="p-8">
              <div className="flex items-center justify-between mb-8 pb-4 border-b border-[var(--border-subtle)]">
                <div>
                    <span className="font-mono text-sm tracking-widest text-[var(--text-secondary)] block mb-1">AVAILABLE IMPERIAL TOKENS</span>
                    <span className="font-mono text-[10px] text-[var(--text-muted)] block">Earned globally by advancing stats. 5 Levels = 1 Token.</span>
                </div>
                <span className="font-mono text-5xl text-[var(--stat-wealth)] font-light glow-text" style={{textShadow: '0 0 20px rgba(0, 255, 136, 0.4)'}}>{remainingTokens}</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {items.map(item => {
                  const canAfford = remainingTokens >= item.cost;
                  return (
                    <div key={item.id} className={`p-4 border rounded-xl transition-all cursor-pointer group ${canAfford ? 'border-[var(--border-default)] bg-[var(--bg-elevated)] hover:border-[var(--text-primary)]' : 'border-dashed border-[var(--border-subtle)] bg-transparent opacity-50'}`}>
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-mono text-sm font-bold text-[var(--text-primary)]">{item.name}</span>
                        <span className="font-mono text-[10px] bg-[var(--bg-primary)] border border-[var(--border-subtle)] px-2 py-1 rounded text-[var(--stat-wealth)] font-bold">COST: {item.cost}</span>
                      </div>
                      <p className="text-xs text-[var(--text-muted)] mb-4">{item.desc}</p>
                      <button disabled={!canAfford} className={`w-full py-2 bg-[var(--bg-primary)] border rounded text-xs font-mono tracking-widest transition-colors ${canAfford ? 'border-[var(--border-default)] text-[var(--text-primary)] hover:border-[var(--text-primary)]' : 'border-[var(--border-subtle)] text-[var(--text-muted)]'}`}>
                        {canAfford ? 'REDEEM' : 'INSUFFICIENT FUNDS'}
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
