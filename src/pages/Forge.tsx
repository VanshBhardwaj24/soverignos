import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Zap, Hammer, Shield, Sparkles, Box,
  Cpu, Wallet, CheckCircle2, Lock, Plus, Pencil, Trash2
} from 'lucide-react';
import { useSovereignStore } from '../store/sovereign';
import { CRAFTING_RECIPES } from '../lib/constants';
import type { Recipe } from '../lib/constants';
import { cn } from '../lib/utils';

export default function Forge() {
  const { gold, resources, craftItem, inventory, blueprints, addBlueprint, updateBlueprint, deleteBlueprint } = useSovereignStore();
  const [isForging, setIsForging] = useState<string | null>(null);
  const [editingBlueprint, setEditingBlueprint] = useState<Recipe | null>(null);
  const [showCreator, setShowCreator] = useState(false);

  const handleForge = async (recipe: Recipe) => {
    setIsForging(recipe.id);
    await new Promise(resolve => setTimeout(resolve, 2000));
    await craftItem(recipe.id);
    setIsForging(null);
  };

  const handleSaveBlueprint = (data: Omit<Recipe, 'id'>) => {
    if (editingBlueprint) {
      updateBlueprint(editingBlueprint.id, data);
    } else {
      addBlueprint(data);
    }
    setShowCreator(false);
    setEditingBlueprint(null);
  };

  return (
    <div className="max-w-[1200px] mx-auto pb-32 px-6 sm:px-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
      {/* Apple-Style Header & Resource Dashboard */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12 mb-20 pt-16 relative z-10">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-bold tracking-[0.25em] text-white/30 uppercase pl-1">Protocol: Augmentation</span>
          </div>
          <h1 className="text-6xl font-semibold tracking-tight text-white leading-none">
            Forge <span className="text-white/20 font-light">Studio</span>
          </h1>
          <p className="text-sm text-white/40 max-w-md leading-relaxed">
            Synthesize legendary equipment and custom artifacts to amplify your system throughput.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <ResourcePod
            label="Gold Reserve"
            value={gold.toLocaleString()}
            icon={<Wallet size={20} />}
            color="text-amber-400"
            glow="bg-amber-400/20"
          />
          <ResourcePod
            label="Neural Shards"
            value={resources?.neural_shard || 0}
            icon={<Cpu size={20} />}
            color="text-blue-400"
            glow="bg-blue-400/20"
          />
          <ResourcePod
            label="Boss Souls"
            value={resources?.boss_soul || 0}
            icon={<Sparkles size={20} />}
            color="text-purple-400"
            glow="bg-purple-400/20"
          />
        </div>
      </div>

      <div className="space-y-24">
        {/* Standard Blueprints Section */}
        <section className="space-y-8">
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <h2 className="text-xl font-medium text-white/80 tracking-tight">System Blueprints</h2>
            <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">{CRAFTING_RECIPES.length} Modules</span>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {CRAFTING_RECIPES.map((recipe) => (
              <ForgeCard
                key={recipe.id}
                recipe={recipe}
                isForging={isForging === recipe.id}
                onForge={() => handleForge(recipe)}
                gold={gold}
                resources={resources}
                inventory={inventory}
                isSystem={true}
              />
            ))}
          </div>
        </section>

        {/* Custom Studio Section (CRUD) */}
        <section className="space-y-8">
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-medium text-white/80 tracking-tight">Custom Studio</h2>
              <span className="px-3 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full text-[9px] font-bold uppercase tracking-widest">Experimental</span>
            </div>
            <button
              onClick={() => {
                setEditingBlueprint(null);
                setShowCreator(true);
              }}
              className="flex items-center gap-2 bg-white text-black px-6 py-2 rounded-full text-[11px] font-bold hover:scale-[1.05] transition-all shadow-xl"
            >
              <Plus size={14} strokeWidth={3} /> New Blueprint
            </button>
          </div>

          {blueprints.length === 0 ? (
            <div className="py-20 flex flex-col items-center justify-center text-center bg-white/[0.02] border border-dashed border-white/10 rounded-[40px] opacity-40">
              <Box size={48} strokeWidth={1} className="mb-4" />
              <p className="text-sm font-medium">No custom blueprints initialized.</p>
              <p className="text-xs text-white/40 mt-1 italic">Click 'New Blueprint' to design custom equipment.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {blueprints.map((recipe: Recipe) => (
                <ForgeCard
                  key={recipe.id}
                  recipe={recipe}
                  isForging={isForging === recipe.id}
                  onForge={() => handleForge(recipe)}
                  onEdit={() => {
                    setEditingBlueprint(recipe);
                    setShowCreator(true);
                  }}
                  onDelete={() => deleteBlueprint(recipe.id)}
                  gold={gold}
                  resources={resources}
                  inventory={inventory}
                  isSystem={false}
                />
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Creator Modal */}
      <AnimatePresence>
        {showCreator && (
          <BlueprintModal
            blueprint={editingBlueprint}
            onClose={() => setShowCreator(false)}
            onSave={handleSaveBlueprint}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function ResourcePod({ label, value, icon, color, glow }: any) {
  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      className="bg-white/[0.03] border border-white/5 rounded-[28px] px-8 py-5 min-w-[160px] backdrop-blur-2xl shadow-sm relative group overflow-hidden"
    >
      <div className={cn("absolute -top-12 -right-12 h-24 w-24 rounded-full blur-3xl opacity-20 transition-opacity group-hover:opacity-40", glow)} />
      <div className={cn("mb-3 flex items-center justify-between", color)}>
        {icon}
        <div className="h-1.5 w-1.5 rounded-full bg-current animate-pulse shadow-[0_0_8px_currentColor]" />
      </div>
      <span className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] block mb-1">{label}</span>
      <span className="text-3xl font-semibold text-white tracking-tighter tabular-nums">{value}</span>
    </motion.div>
  );
}

function ForgeCard({ recipe, isForging, onForge, onEdit, onDelete, gold, resources, inventory, isSystem }: any) {
  const alreadyOwned = inventory?.includes(recipe.resultItem);
  const hasGold = gold >= recipe.cost;
  const hasIngredients = Object.entries(recipe.ingredients).every(
    ([ing, count]) => (resources[ing] || 0) >= (count as number)
  );
  const canForge = hasGold && hasIngredients && !alreadyOwned;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "relative bg-white/[0.03] border border-white/10 rounded-[36px] p-8 backdrop-blur-xl overflow-hidden transition-all duration-500",
        alreadyOwned ? "border-emerald-500/20 bg-emerald-500/[0.01]" : "hover:border-white/20 hover:bg-white/[0.05] hover:shadow-2xl"
      )}
    >
      <div className="flex justify-between items-start mb-10">
        <div className="flex items-center gap-5">
          <div className={cn(
            "h-16 w-16 rounded-[24px] flex items-center justify-center border transition-all duration-700 shadow-inner relative",
            alreadyOwned ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-white/5 text-white/60 border-white/10"
          )}>
            {alreadyOwned ? <CheckCircle2 size={32} /> : <Box size={32} strokeWidth={1.5} />}
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h3 className="text-2xl font-semibold text-white tracking-tight">{recipe.name}</h3>
              {alreadyOwned && (
                <span className="px-2.5 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-[9px] font-bold uppercase tracking-widest">Archived</span>
              )}
            </div>
            <p className="text-sm text-white/40 mt-1 max-w-[280px] leading-relaxed">{recipe.desc}</p>
          </div>
        </div>

        {!isSystem && !alreadyOwned && (
          <div className="flex items-center gap-2">
            <button onClick={onEdit} className="p-2.5 rounded-full bg-white/5 text-white/20 hover:text-white transition-all"><Pencil size={16} /></button>
            <button onClick={onDelete} className="p-2.5 rounded-full bg-white/5 text-white/20 hover:text-rose-500 transition-all"><Trash2 size={16} /></button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-10">
        <RequirementTile label="Gold" value={recipe.cost} current={gold} icon={<Wallet size={12} />} color="text-amber-400" />
        {Object.entries(recipe.ingredients).map(([ing, count]) => (
          <RequirementTile
            key={ing}
            label={ing.replace('_', ' ')}
            value={count as number}
            current={resources[ing] || 0}
            icon={ing === 'neural_shard' ? <Cpu size={12} /> : <Sparkles size={12} />}
            color={ing === 'neural_shard' ? 'text-blue-400' : 'text-purple-400'}
          />
        ))}
      </div>

      <button
        disabled={!canForge || isForging}
        onClick={onForge}
        className={cn(
          "w-full h-16 rounded-[22px] font-bold text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 relative overflow-hidden",
          canForge
            ? "bg-white text-black hover:scale-[1.01] active:scale-[0.98] shadow-2xl"
            : alreadyOwned
              ? "bg-emerald-500/5 text-emerald-400 border border-emerald-500/10 cursor-default"
              : "bg-white/[0.04] text-white/20 border border-white/5 cursor-not-allowed"
        )}
      >
        <AnimatePresence mode="wait">
          {isForging ? (
            <motion.div key="forging" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-3">
              <Hammer size={20} className="animate-bounce" /> INITIALIZING...
            </motion.div>
          ) : (
            <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2">
              {alreadyOwned ? <Shield size={18} /> : canForge ? <Zap size={18} fill="currentColor" /> : <Lock size={18} />}
              {alreadyOwned ? 'Artifact Integration Complete' : canForge ? 'Forge Artifact' : 'Insufficient Resources'}
            </motion.div>
          )}
        </AnimatePresence>

        {isForging && (
          <motion.div
            className="absolute bottom-0 left-0 h-1 bg-black"
            initial={{ width: 0 }}
            animate={{ width: '100%' }}
            transition={{ duration: 2 }}
          />
        )}
      </button>
    </motion.div>
  );
}

function RequirementTile({ label, value, current, icon, color }: any) {
  const met = current >= value;
  return (
    <div className="bg-white/[0.03] border border-white/5 rounded-[22px] p-4 space-y-3 backdrop-blur-md shadow-sm">
      <div className="flex justify-between items-center">
        <span className="text-[9px] font-bold text-white/20 uppercase tracking-widest">{label}</span>
        <div className={cn("opacity-40", color)}>{icon}</div>
      </div>
      <div className="flex items-baseline gap-1.5">
        <span className={cn("text-xl font-semibold tabular-nums", met ? "text-white/90" : "text-rose-500")}>{current}</span>
        <span className="text-[11px] font-bold text-white/10">/ {value}</span>
      </div>
      <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
        <motion.div
          className={cn("h-full", met ? "bg-white/40" : "bg-rose-500/40")}
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(100, (current / value) * 100)}%` }}
          transition={{ type: 'spring', stiffness: 50, damping: 10 }}
        />
      </div>
    </div>
  );
}

function BlueprintModal({ blueprint, onClose, onSave }: any) {
  const [name, setName] = useState(blueprint?.name || '');
  const [desc, setDesc] = useState(blueprint?.desc || '');
  const [cost, setCost] = useState(blueprint?.cost || 500);
  const [shardCost, setShardCost] = useState(blueprint?.ingredients?.neural_shard || 0);
  const [soulCost, setSoulCost] = useState(blueprint?.ingredients?.boss_soul || 0);

  return (
    <div className="fixed inset-0 z-[600] flex items-center justify-center p-6 sm:p-8">
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-3xl"
        onClick={onClose}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 40 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="relative w-full max-w-xl bg-white/[0.03] border border-white/10 rounded-[44px] overflow-hidden shadow-2xl backdrop-blur-2xl p-8 md:p-12"
      >
        <div className="space-y-10">
          <div className="text-center space-y-3">
            <div className="h-16 w-16 rounded-[24px] bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center mx-auto mb-6">
              <Pencil size={32} strokeWidth={1.5} />
            </div>
            <h2 className="text-3xl font-semibold text-white tracking-tight">Blueprint Studio</h2>
            <p className="text-sm text-white/30">Design the requirements for your next custom artifact.</p>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-white/20 uppercase tracking-widest pl-2">Artifact Name</label>
              <input
                value={name} onChange={e => setName(e.target.value)}
                placeholder="Neural Link..."
                className="w-full bg-white/[0.04] border border-white/10 rounded-[20px] py-4 px-6 text-white placeholder:text-white/10 outline-none focus:border-white/30 transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-white/20 uppercase tracking-widest pl-2">System Impact (Description)</label>
              <textarea
                value={desc} onChange={e => setDesc(e.target.value)}
                placeholder="Describe the power of this artifact..."
                className="w-full bg-white/[0.04] border border-white/10 rounded-[24px] py-4 px-6 text-white placeholder:text-white/10 outline-none focus:border-white/30 transition-all h-24 resize-none"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <InputPod label="Gold" value={cost} onChange={setCost} color="text-amber-400" />
              <InputPod label="Shards" value={shardCost} onChange={setShardCost} color="text-blue-400" />
              <InputPod label="Souls" value={soulCost} onChange={setSoulCost} color="text-purple-400" />
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button onClick={onClose} className="flex-1 py-4 rounded-[22px] font-semibold text-white/30 hover:bg-white/5 transition-all">Discard</button>
            <button
              onClick={() => onSave({
                name, desc, cost,
                ingredients: { neural_shard: shardCost, boss_soul: soulCost },
                resultItem: name.toLowerCase().replace(/\s+/g, '_')
              })}
              className="flex-[2] py-4 bg-white text-black rounded-[22px] font-bold shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              Initialize Blueprint
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function InputPod({ label, value, onChange, color }: any) {
  return (
    <div className="bg-white/[0.04] border border-white/5 rounded-[24px] p-4 space-y-2 text-center">
      <span className={cn("text-[9px] font-bold uppercase tracking-widest", color)}>{label}</span>
      <input
        type="number" value={value} onChange={e => onChange(parseInt(e.target.value) || 0)}
        className="w-full bg-transparent text-center text-xl font-semibold text-white outline-none"
      />
    </div>
  );
}
