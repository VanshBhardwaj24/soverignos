import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Zap, Hammer, Shield, Sparkles, Box,
  Cpu, Wallet, CheckCircle2, Lock
} from 'lucide-react';
import { useSovereignStore } from '../store/sovereign';
import { CRAFTING_RECIPES } from '../lib/constants';
import type { Recipe } from '../lib/constants';
import { cn } from '../lib/utils';

export default function Forge() {
  const { gold, resources, craftItem, inventory } = useSovereignStore();
  const [isForging, setIsForging] = useState<string | null>(null);

  const handleForge = async (recipe: Recipe) => {
    setIsForging(recipe.id);
    // Artificial delay for cinematic effect
    await new Promise(resolve => setTimeout(resolve, 2000));
    await craftItem(recipe.id);
    setIsForging(null);
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-7xl mx-auto pb-20 px-4 md:px-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16 pt-8">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <span className="w-8 h-px bg-white/20" />
            <span className="font-bold text-[10px] tracking-[0.4em] text-white/40 uppercase font-black">Augmentation Protocol</span>
          </div>
          <h1 className="font-bold text-5xl font-black tracking-tighter text-white uppercase italic">
            Neural <span className="text-white/20">Forge</span>
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          {/* Gold Display */}
          <div className="bg-white/5 border border-white/10 rounded-2xl px-6 py-4 backdrop-blur-md shadow-2xl flex items-center gap-4">
            <div className="h-10 w-10 rounded-xl bg-yellow-500/10 text-yellow-500 flex items-center justify-center border border-yellow-500/20">
              <Wallet size={20} />
            </div>
            <div>
              <span className="block font-bold text-[9px] text-white/30 uppercase tracking-widest font-black">Gold Reserve</span>
              <span className="text-xl font-bold font-black text-white">{gold.toLocaleString()}</span>
            </div>
          </div>

          {/* Resource: Neural Shards */}
          <div className="bg-white/5 border border-white/10 rounded-2xl px-6 py-4 backdrop-blur-md shadow-2xl flex items-center gap-4">
            <div className="h-10 w-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center border border-blue-500/20">
              <Cpu size={20} />
            </div>
            <div>
              <span className="block font-bold text-[9px] text-white/30 uppercase tracking-widest font-black">Neural Shards</span>
              <span className="text-xl font-bold font-black text-white">{resources?.neural_shard || 0}</span>
            </div>
          </div>

          {/* Resource: Boss Souls */}
          <div className="bg-white/5 border border-white/10 rounded-2xl px-6 py-4 backdrop-blur-md shadow-2xl flex items-center gap-4">
            <div className="h-10 w-10 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center border border-purple-500/20">
              <Sparkles size={20} />
            </div>
            <div>
              <span className="block font-bold text-[9px] text-white/30 uppercase tracking-widest font-black">Boss Souls</span>
              <span className="text-xl font-bold font-black text-white">{resources?.boss_soul || 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Forge Area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {CRAFTING_RECIPES.map((recipe) => {
          const hasGold = gold >= recipe.cost;
          const hasIngredients = Object.entries(recipe.ingredients).every(
            ([ing, count]) => (resources[ing] || 0) >= count
          );
          const alreadyOwned = inventory?.includes(recipe.resultItem);
          const canForge = hasGold && hasIngredients && !alreadyOwned;

          return (
            <motion.div
              key={recipe.id}
              className={cn(
                "relative bg-white/[0.02] border border-white/5 rounded-[40px] p-8 overflow-hidden group transition-all duration-500",
                alreadyOwned ? "border-green-500/20 bg-green-500/[0.01]" : "hover:border-white/20"
              )}
            >
              {/* Background Glow */}
              <div className="absolute top-0 right-0 p-12 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity pointer-events-none grayscale">
                <Hammer size={180} />
              </div>

              <div className="relative z-10">
                <div className="flex justify-between items-start mb-10">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "h-14 w-14 rounded-2xl flex items-center justify-center border transition-all duration-500 shadow-2xl",
                      alreadyOwned ? "bg-green-500/10 text-green-500 border-green-500/20" : "bg-white/5 text-white/60 border-white/10 group-hover:text-white"
                    )}>
                      {alreadyOwned ? <CheckCircle2 size={28} /> : <Box size={28} />}
                    </div>
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter">{recipe.name}</h3>
                        {alreadyOwned && (
                          <span className="px-2 py-0.5 bg-green-500/10 text-green-500 border border-green-500/20 rounded-full font-bold text-[8px] font-black uppercase tracking-widest">Acquired</span>
                        )}
                      </div>
                      <p className="font-bold text-[10px] text-white/40 uppercase tracking-[0.1em] mt-1">{recipe.desc}</p>
                    </div>
                  </div>
                </div>

                {/* Requirements Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
                  {/* Gold Requirement */}
                  <RequirementBox
                    label="Gold Cost"
                    value={recipe.cost}
                    current={gold}
                    icon={<Wallet size={12} />}
                    color="text-yellow-500"
                  />

                  {/* Ingredient Requirements */}
                  {Object.entries(recipe.ingredients).map(([ing, count]) => (
                    <RequirementBox
                      key={ing}
                      label={ing.replace('_', ' ')}
                      value={count}
                      current={resources[ing] || 0}
                      icon={ing === 'neural_shard' ? <Cpu size={12} /> : <Sparkles size={12} />}
                      color={ing === 'neural_shard' ? 'text-blue-500' : 'text-purple-500'}
                    />
                  ))}
                </div>

                {/* Forge Button */}
                <button
                  disabled={!canForge || isForging !== null}
                  onClick={() => handleForge(recipe)}
                  className={cn(
                    "w-full h-16 rounded-2xl font-bold text-xs font-black tracking-[.3em] uppercase transition-all flex items-center justify-center gap-3 relative overflow-hidden",
                    canForge
                      ? "bg-white text-black hover:scale-[1.02] active:scale-[0.98] shadow-[0_20px_40px_rgba(255,255,255,0.1)]"
                      : alreadyOwned
                        ? "bg-green-500/5 text-green-500 border border-green-500/10 cursor-default"
                        : "bg-white/5 text-white/20 border border-white/5 cursor-not-allowed"
                  )}
                >
                  <AnimatePresence mode="wait">
                    {isForging === recipe.id ? (
                      <motion.div
                        key="forging"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="flex items-center gap-2"
                      >
                        <Hammer size={18} className="animate-bounce" /> FORGING...
                      </motion.div>
                    ) : (
                      <motion.div
                        key="idle"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="flex items-center gap-2"
                      >
                        {alreadyOwned ? <CheckCircle2 size={18} /> : canForge ? <Zap size={18} /> : <Lock size={18} />}
                        {alreadyOwned ? 'ARTIFACT ARCHIVED' : canForge ? 'INITIALIZE FORGE' : 'INSUFFICIENT RESOURCES'}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Progress Bar for Forging */}
                  {isForging === recipe.id && (
                    <motion.div
                      className="absolute bottom-0 left-0 h-1 bg-black"
                      initial={{ width: 0 }}
                      animate={{ width: '100%' }}
                      transition={{ duration: 2 }}
                    />
                  )}
                </button>
              </div>
            </motion.div>
          );
        })}

        {/* Empty Slot for Mystery */}
        <div className="bg-white/[0.01] border border-dashed border-white/5 rounded-[40px] p-8 flex flex-col items-center justify-center text-center gap-4 opacity-40">
          <div className="h-16 w-16 rounded-full bg-white/5 flex items-center justify-center text-white/20">
            <Shield size={32} />
          </div>
          <div>
            <h3 className="font-bold text-sm font-black text-white/40 uppercase tracking-widest">Locked Blueprint</h3>
            <p className="font-bold text-[9px] text-white/20 uppercase tracking-tighter mt-1 italic">Defeat Tier 2 Bosses to unlock legendary equipment.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function RequirementBox({ label, value, current, icon, color }: any) {
  const met = current >= value;
  return (
    <div className="bg-white/5 border border-white/5 rounded-2xl p-4 flex flex-col gap-2">
      <div className="flex justify-between items-center">
        <span className="font-bold text-[8px] text-white/20 uppercase tracking-widest font-black">{label}</span>
        <div className={cn("opacity-40", color)}>{icon}</div>
      </div>
      <div className="flex items-baseline gap-1">
        <span className={cn("text-lg font-bold font-black", met ? "text-white" : "text-[var(--danger)]")}>{current}</span>
        <span className="text-[10px] font-bold text-white/20">/ {value}</span>
      </div>
      <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
        <motion.div
          className={cn("h-full", met ? "bg-white" : "bg-[var(--danger)]")}
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(100, (current / value) * 100)}%` }}
        />
      </div>
    </div>
  );
}
