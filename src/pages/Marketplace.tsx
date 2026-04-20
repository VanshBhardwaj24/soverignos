import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Shield, Brain, CreditCard, Check, ArrowUpRight, Coins, Clock, ShoppingBag } from 'lucide-react';
import { useSovereignStore } from '../store/sovereign';
import { cn } from '../lib/utils';

interface ShopItem {
  id: string;
  name: string;
  description: string;
  cost: number;
  icon: React.ReactNode;
  color: string;
  type: 'booster' | 'equipment' | 'special';
  stat?: string;
}

const SHOP_ITEMS: ShopItem[] = [
  { 
    id: 'dev_desk', 
    name: 'Tactical Workspace', 
    description: '+10% CODE XP gain multiplier permanently.', 
    cost: 500, 
    icon: <Shield size={20} />, 
    color: 'var(--stat-code)',
    type: 'equipment',
    stat: 'CODE'
  },
  { 
    id: 'energy_drink', 
    name: 'Adrenaline Surge', 
    description: 'Double XP gains for all stats for 4 hours.', 
    cost: 200, 
    icon: <Zap size={20} />, 
    color: '#FFB800',
    type: 'booster' 
  },
  { 
    id: 'philosophy_tome', 
    name: 'Ancient Codex', 
    description: 'Unlock special "Lore" archives in the notebook.', 
    cost: 1000, 
    icon: <Brain size={20} />, 
    color: 'var(--stat-mind)',
    type: 'special',
    stat: 'MIND'
  },
  { 
    id: 'black_card', 
    name: 'Sovereign Black Card', 
    description: 'Reduced mission failure penalties by 50%.', 
    cost: 2500, 
    icon: <CreditCard size={20} />, 
    color: 'var(--stat-wealth)',
    type: 'equipment',
    stat: 'WEALTH'
  }
];

export default function Marketplace() {
  const { gold, inventory, buyItem } = useSovereignStore();

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-[1200px] mx-auto pb-12">
      
      {/* Header & Wealth HUD */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
        <div>
          <h1 className="font-mono text-[11px] tracking-[0.2em] text-[var(--text-muted)] uppercase font-semibold mb-2">System Exchange</h1>
          <div className="font-mono text-4xl font-light tracking-tight text-white flex items-center gap-3 lowercase italic opacity-80">
             supply <span className="text-white/20">/</span> <span className="text-white/40">marketplace</span>
          </div>
        </div>

        <div className="flex items-center gap-6 bg-white/[0.02] border border-white/10 p-4 rounded-2xl shadow-xl">
          <div className="flex flex-col items-end pr-6 border-r border-white/5">
             <span className="font-mono text-[9px] text-white/30 uppercase tracking-widest mb-1">Available Credits</span>
             <div className="flex items-center gap-2">
                <Coins size={16} className="text-[var(--stat-wealth)]" />
                <span className="font-mono text-2xl font-black text-white">{gold} GC</span>
             </div>
          </div>
          <div className="flex flex-col items-end">
             <span className="font-mono text-[9px] text-white/30 uppercase tracking-widest mb-1">Loyalty Tier</span>
             <span className="font-mono text-xs font-black text-[var(--stat-brand)]">OPERATIVE</span>
          </div>
        </div>
      </div>

      {/* F27: Flash Deals */}
      <div className="mb-12 relative overflow-hidden p-8 bg-gradient-to-r from-[var(--stat-brand)]/20 to-purple-500/10 border border-white/10 rounded-[40px] flex flex-col md:flex-row items-center justify-between gap-8 group">
         <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none group-hover:scale-110 transition-transform duration-1000">
            <Zap size={200} />
         </div>
         <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
            <div className="h-16 w-16 bg-white text-black rounded-3xl flex items-center justify-center shadow-[0_0_30px_rgba(255,255,255,0.3)]">
               <Clock size={32} />
            </div>
            <div>
               <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter">Limited Flash Deal</h3>
               <p className="font-mono text-[10px] text-white/40 uppercase tracking-widest mt-1">Experimental "Neuro-Sync" Module // 40% Discount Protocol Active</p>
            </div>
         </div>
         <button className="relative z-10 px-10 py-4 bg-white text-black font-black font-mono text-xs tracking-widest rounded-2xl hover:scale-105 transition-all shadow-2xl">
            CLAIM ASSET // 1200 GC
         </button>
      </div>


      {/* Product Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {SHOP_ITEMS.map((item, index) => {
          const owned = inventory.includes(item.id);
          const canAfford = gold >= item.cost;

          return (
            <motion.div 
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={cn(
                "group relative p-8 rounded-[32px] border transition-all duration-500 overflow-hidden",
                owned 
                  ? "bg-white/[0.01] border-white/5 opacity-60 grayscale" 
                  : "bg-white/[0.03] border-white/[0.05] hover:bg-white/[0.06] hover:border-white/20 shadow-2xl"
              )}
            >
              {/* Decorative Icon Background */}
              <div className="absolute -top-4 -right-4 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
                 {React.cloneElement(item.icon as React.ReactElement<any>, { size: 140 })}
              </div>

              <div className="relative z-10">
                <div className="flex items-center justify-between mb-8">
                  <div 
                    className="h-14 w-14 rounded-2xl flex items-center justify-center shadow-2xl border transition-transform group-hover:scale-110"
                    style={{ 
                      backgroundColor: `${item.color}10`, 
                      color: item.color,
                      borderColor: `${item.color}30`
                    }}
                  >
                    {item.icon}
                  </div>
                  <span className="font-mono text-[9px] font-black tracking-widest text-white/20 uppercase bg-white/5 px-3 py-1 rounded-full border border-white/5">
                    {item.type}
                  </span>
                </div>

                <div className="mb-8">
                  <h3 className="font-sans text-xl font-black text-white uppercase tracking-tight mb-2 flex items-center gap-2">
                    {item.name}
                    {item.stat && (
                       <span className="text-[9px] opacity-40 font-mono tracking-widest">[{item.stat}]</span>
                    )}
                  </h3>
                  <p className="text-xs text-white/40 leading-relaxed font-medium">
                    {item.description}
                  </p>
                </div>

                <div className="flex items-center justify-between gap-4 pt-6 border-t border-white/5">
                  <div className="flex items-end gap-1.5">
                     <span className={cn(
                       "font-mono text-3xl font-black tracking-tighter",
                       owned ? "text-white/20" : canAfford ? "text-white" : "text-[var(--danger)]"
                     )}>
                       {item.cost}
                     </span>
                     <span className="font-mono text-[10px] text-white/20 uppercase font-black mb-1.5">GC</span>
                  </div>
                  
                  <button 
                    disabled={owned || !canAfford}
                    onClick={() => buyItem(item.id, item.cost)}
                    className={cn(
                      "px-8 py-3 rounded-2xl text-[11px] font-black tracking-widest uppercase transition-all flex items-center gap-2 shadow-xl",
                      owned 
                        ? "bg-white/5 text-white/20 cursor-default" 
                        : canAfford 
                          ? "bg-white text-black hover:scale-105 active:scale-95" 
                          : "bg-white/5 text-white/20 border border-white/5"
                    )}
                  >
                    {owned ? <Check size={14} /> : <ArrowUpRight size={14} />}
                    {owned ? 'DEPLOYED' : 'ACQUIRE'}
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* F28: Acquisition Archive */}
      <div className="mt-20">
         <div className="flex items-center gap-3 mb-8">
            <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center text-white/40">
               <ShoppingBag size={20} />
            </div>
            <div>
               <h4 className="font-mono text-xl font-light text-white uppercase tracking-tight">Acquisition Archive</h4>
               <p className="font-mono text-[9px] text-white/20 uppercase tracking-widest mt-1 italic">Historical deployment of tactical assets.</p>
            </div>
         </div>

         <div className="space-y-4">
            {inventory.length === 0 ? (
              <div className="py-20 border border-dashed border-white/5 rounded-[40px] flex flex-col items-center justify-center opacity-10">
                 <ShoppingBag size={40} className="mb-4" />
                 <p className="font-mono text-xs uppercase tracking-[0.4em]">No Assets Deployed</p>
              </div>
            ) : (
              inventory.map(itemId => {
                const item = SHOP_ITEMS.find(i => i.id === itemId);
                if (!item) return null;
                return (
                  <div key={itemId} className="p-6 bg-white/[0.02] border border-white/5 rounded-3xl flex items-center justify-between group hover:border-white/10 transition-all">
                     <div className="flex items-center gap-6">
                        <div className="p-3 rounded-xl bg-white/5 text-white/40 group-hover:text-white transition-colors">
                           {item.icon}
                        </div>
                        <div>
                           <h5 className="text-white font-black uppercase text-sm italic">{item.name}</h5>
                           <span className="font-mono text-[9px] text-white/20 uppercase tracking-widest">{item.type} • DEPLOYED</span>
                        </div>
                     </div>
                     <Check size={20} className="text-[var(--success)] opacity-40" />
                  </div>
                );
              })
            )}
         </div>
      </div>

      <div className="mt-20 p-8 rounded-[40px] bg-white/[0.01] border border-white/5 text-center">
         <p className="font-mono text-[10px] text-white/20 uppercase tracking-[0.4em]">Exchange secure. All upgrades are permanent and non-refundable.</p>
      </div>

    </div>
  );
}
