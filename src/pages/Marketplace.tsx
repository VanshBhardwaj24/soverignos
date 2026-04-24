import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Zap, Shield, Brain, CreditCard,
  Coins, ShoppingBag, Heart, BarChart3,
  Search, Plus, ArrowUpRight, Lock, Edit3, Trash2,
  RefreshCw, Star, Gift
} from 'lucide-react';
import { useSovereignStore } from '../store/sovereign';
import { SHOP_ITEMS } from '../lib/constants';
import type { Rarity, ItemType } from '../lib/constants';
import { cn } from '../lib/utils';
import LoanModal from '../components/shop/LoanModal';
import { ModalPortal } from '../components/ui/ModalPortal';

// --- Types & Constants ---
type Tab = 'market' | 'inventory' | 'rewards' | 'history';

// --- Utility: Rarity Styles ---
const getRarityStyles = (rarity: Rarity) => {
  switch (rarity) {
    case 'common': return 'border-white/10 text-white/60 bg-white/[0.02]';
    case 'uncommon': return 'border-blue-500/40 text-blue-400 bg-blue-500/5 shadow-[0_12px_40px_rgba(59,130,246,0.1)]';
    case 'rare': return 'border-purple-500/50 text-purple-400 bg-purple-500/5 shadow-[0_12px_40px_rgba(168,85,247,0.15)] scale-[1.01]';
    case 'epic': return 'border-amber-500/60 text-amber-400 bg-amber-500/5 shadow-[0_12px_40px_rgba(245,158,11,0.2)] scale-[1.02]';
    case 'legendary': return 'border-red-500/70 text-red-500 bg-red-500/5 shadow-[0_12px_40px_rgba(239,68,68,0.25)] scale-[1.03]';
    default: return 'border-white/10 text-white/60 bg-white/[0.02]';
  }
};

const getIcon = (name: string, size = 20) => {
  switch (name) {
    case 'Shield': return <Shield size={size} />;
    case 'Zap': return <Zap size={size} />;
    case 'Brain': return <Brain size={size} />;
    case 'CreditCard': return <CreditCard size={size} />;
    case 'Coins': return <Coins size={size} />;
    case 'ShoppingBag': return <ShoppingBag size={size} />;
    case 'RefreshCw': return <RefreshCw size={size} />;
    default: return <Star size={size} />;
  }
};

// --- Custom Hook: Booster Timers ---
function useBoosterTimers(activeLoadout: any[]) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  return useMemo(() => {
    return activeLoadout.map(item => {
      const expiry = new Date(item.expiresAt);
      const diff = expiry.getTime() - now.getTime();
      const seconds = Math.max(0, Math.floor(diff / 1000));
      const h = Math.floor(seconds / 3600);
      const m = Math.floor((seconds % 3600) / 60);
      const s = seconds % 60;

      return {
        ...item,
        timeLeft: `${h}h ${m}m ${s}s`,
        progress: (seconds / (3600 * 4)) * 100, // Normalized to 4h for visual context
        isActive: seconds > 0
      };
    }).filter(i => i.isActive);
  }, [activeLoadout, now]);
}

export default function Marketplace() {
  const {
    gold, inventory, wishlist, activeLoadout, customRewards, activeLoans,
    buyItem, deployItem, toggleWishlist, addReward, updateReward, deleteReward
  } = useSovereignStore();

  const [activeTab, setActiveTab] = useState<Tab>('market');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<ItemType | 'all'>('all');
  const [sortBy, setSortBy] = useState<'price' | 'rarity' | 'new'>('new');
  const [showAffordable, setShowAffordable] = useState(false);

  // CRUD State
  const [isRewardModalOpen, setIsRewardModalOpen] = useState(false);
  const [editingReward, setEditingReward] = useState<any>(null);
  const [selectedLoanItem, setSelectedLoanItem] = useState<string | null>(null);

  const timers = useBoosterTimers(activeLoadout);

  // --- Filtered Items ---
  const filteredItems = useMemo(() => {
    let items = [...SHOP_ITEMS, ...customRewards].filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = filterType === 'all' ? true : item.type === filterType;
      const isRewardTab = activeTab === 'rewards';
      const itemIsReward = !!item.isRealWorld;

      return matchesSearch && matchesType && (isRewardTab ? itemIsReward : !itemIsReward);
    });

    if (showAffordable) {
      items = items.filter(item => item.cost <= gold);
    }

    if (sortBy === 'price') items.sort((a, b) => b.cost - a.cost);
    if (sortBy === 'rarity') {
      const weights = { common: 0, uncommon: 1, rare: 2, epic: 3, legendary: 4 };
      items.sort((a, b) => weights[b.rarity] - weights[a.rarity]);
    }

    return items;
  }, [searchQuery, filterType, sortBy, gold, showAffordable, activeTab]);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-[1300px] mx-auto pb-24 px-4 font-sans">

      {/* Header HUD */}
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 mb-12 bg-white/[0.01] border border-white/5 p-8 rounded-[40px] backdrop-blur-3xl shadow-2xl">
        <div className="flex items-center gap-6">
          <div className="h-16 w-16 bg-[var(--stat-wealth)]/20 rounded-3xl flex items-center justify-center text-[var(--stat-wealth)] border border-[var(--stat-wealth)]/30 shadow-[0_0_30px_rgba(0,255,100,0.1)]">
            <ShoppingBag size={32} />
          </div>
          <div>

            <div className="h-display flex items-center gap-3">
              Marketplace <span className="text-white/10 font-thin">|</span> <span className="italic font-light opacity-50">{activeTab}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6">
          {activeLoans.length > 0 && (
            <div className="hidden xl:flex items-center gap-4 px-6 py-4 glass-premium">
              {activeLoans.map(loan => (
                <div key={loan.id} className="flex flex-col items-start min-w-[120px]">
                  <span className="stat-label block">{loan.itemName}</span>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="h-1.5 w-16 bg-white/5 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[var(--stat-wealth)]"
                        style={{ width: `${(loan.amountRepaid / loan.totalRepay) * 100}%` }}
                      />
                    </div>
                    <span className="stat-value text-[10px] text-white">{Math.floor((loan.amountRepaid / loan.totalRepay) * 100)}%</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="px-8 py-4 bg-white/10 border border-white/20 rounded-2xl flex flex-col items-end shadow-xl">
            <span className="font-bold text-[9px] text-white/40 uppercase tracking-widest mb-1 font-black">Current Balance</span>
            <div className="flex items-center gap-3">
              <Coins size={20} className="text-[var(--stat-wealth)] animate-pulse" />
              <span className="stat-value text-4xl">{gold} <span className="text-xs font-bold text-white/40">GC</span></span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Tabs */}
      <nav className="flex items-center justify-center gap-2 mb-12 bg-white/5 p-1.5 rounded-2xl border border-white/5 w-fit mx-auto backdrop-blur-xl relative">
        {(['market', 'inventory', 'rewards', 'history'] as Tab[]).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "px-8 py-3 rounded-xl font-bold text-[11px] font-black tracking-[0.2em] uppercase transition-all relative z-10",
              activeTab === tab ? "text-black" : "text-white/40 hover:text-white"
            )}
          >
            {activeTab === tab && (
              <motion.div
                layoutId="active-tab"
                className="absolute inset-0 bg-white rounded-xl shadow-xl"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
            <span className="relative z-20">{tab}</span>
          </button>
        ))}
      </nav>

      {/* Rewards Creation Trigger */}
      {activeTab === 'rewards' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="flex justify-center mb-12"
        >
          <button
            onClick={() => {
              setEditingReward(null);
              setIsRewardModalOpen(true);
            }}
            className="flex items-center gap-3 px-10 py-5 bg-white text-black rounded-[24px] font-bold text-xs font-black tracking-[0.2em] uppercase hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-white/10"
          >
            <Plus size={18} /> Initialize New Reward Protocol
          </button>
        </motion.div>
      )}

      {/* Active Loadout Overlay (Visible on Market/Inventory) */}
      <AnimatePresence>
        {timers.length > 0 && (activeTab === 'market' || activeTab === 'inventory') && (
          <motion.div
            initial={{ opacity: 0, y: -20, filter: 'blur(10px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -20, filter: 'blur(10px)' }}
            className="mb-12 flex flex-wrap gap-4"
          >
            {timers.map(timer => {
              const item = SHOP_ITEMS.find(i => i.id === timer.itemId);
              return (
                <div key={timer.itemId} className="flex-1 min-w-[280px] p-6 bg-gradient-to-br from-white/10 to-white/[0.02] border border-white/10 rounded-3xl backdrop-blur-2xl shadow-xl overflow-hidden relative group">
                  <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                    {getIcon(item?.iconName || '', 60)}
                  </div>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
                        {item?.name} <span className="text-[var(--stat-brand)] animate-pulse inline-block w-1.5 h-1.5 rounded-full bg-current" />
                      </h4>
                      <p className="font-bold text-[10px] text-white/40 uppercase mt-1">ROI: +{timer.currentROI} XP gained</p>
                    </div>
                    <div className="font-bold text-xs font-black text-white px-2 py-1 bg-white/10 rounded-lg">
                      {timer.timeLeft}
                    </div>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-[var(--stat-brand)] to-purple-500"
                      initial={{ width: 0 }}
                      animate={{ width: `${timer.progress}%` }}
                      transition={{ duration: 1 }}
                    />
                  </div>
                </div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content Area */}
      {activeTab === 'market' || activeTab === 'rewards' ? (
        <>
          {/* Controls Bar */}
          <div className="flex flex-col md:flex-row gap-6 mb-12 items-center">
            <div className="relative flex-1 group w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-white transition-colors" size={18} />
              <input
                type="text"
                placeholder="SEARCH PROTOCOLS..."
                aria-label="Search items"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-6 stat-label text-white outline-none focus:border-[var(--text-primary)]/40 focus:ring-4 focus:ring-[var(--text-primary)]/5 transition-all placeholder:text-white/10"
              />
            </div>

            <div className="flex items-center gap-3 overflow-x-auto pb-2 w-full md:w-auto no-scrollbar">
              <button
                onClick={() => setShowAffordable(!showAffordable)}
                aria-label="Filter by affordable items"
                className={cn(
                  "px-6 py-4 rounded-2xl border stat-label whitespace-nowrap transition-all flex items-center gap-3 outline-none focus-visible:ring-2 focus-visible:ring-[var(--text-primary)]/20",
                  showAffordable ? "bg-[var(--stat-wealth)]/20 border-[var(--stat-wealth)] text-white" : "bg-white/5 border-white/10 text-white/40"
                )}
              >
                <Coins size={14} /> CAN AFFORD
              </button>

              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as any)}
                className="bg-white/5 border border-white/10 rounded-2xl px-6 py-4 stat-label text-white/60 focus:outline-none focus:border-white/30 cursor-pointer"
              >
                <option value="all">ALL TYPES</option>
                <option value="equipment">EQUIPMENT</option>
                <option value="consumable">BOOSTERS</option>
                <option value="special">SPECIAL</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-white/5 border border-white/10 rounded-2xl px-6 py-4 stat-label text-white/60 focus:outline-none focus:border-white/30 cursor-pointer"
              >
                <option value="new">SORT: NEWEST</option>
                <option value="price">SORT: PRICE</option>
                <option value="rarity">SORT: RARITY</option>
              </select>
            </div>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <AnimatePresence mode="popLayout">
              {filteredItems.map((item, idx) => {
                const owned = inventory.includes(item.id) && item.type === 'permanent';
                const isWishlisted = wishlist.includes(item.id);
                const canAfford = gold >= item.cost;
                const progress = Math.min(100, (gold / item.cost) * 100);

                return (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
                    animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                    exit={{ opacity: 0, scale: 0.9, filter: 'blur(10px)' }}
                    transition={{
                      duration: 0.6,
                      delay: idx * 0.05,
                      ease: [0.2, 0.8, 0.2, 1]
                    }}
                    whileHover={{ y: -8, scale: 1.02 }}
                    className={cn(
                      "group relative p-8 surface-card transition-all duration-500 flex flex-col justify-between min-h-[480px] shadow-lg hover-lift overflow-hidden border-glow-professional",
                      getRarityStyles(item.rarity),
                      owned ? "opacity-30 grayscale" : ""
                    )}
                  >
                    {/* Background Shine */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/[0.05] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                    {/* Card Header */}
                    <div className="relative z-10">
                      <div className="flex items-start justify-between mb-8">
                        <div className="h-16 w-16 bg-white/10 rounded-3xl flex items-center justify-center text-white border border-white/10 group-hover:scale-110 transition-transform duration-500">
                          {getIcon(item.iconName, 24)}
                        </div>
                        <button
                          onClick={() => toggleWishlist(item.id)}
                          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                          title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                          className={cn(
                            "h-10 w-10 rounded-full flex items-center justify-center transition-all duration-300 outline-none focus-visible:ring-2 focus-visible:ring-red-500/40",
                            isWishlisted ? "bg-red-500 text-white shadow-lg" : "bg-white/5 text-white/20 hover:bg-white/10 hover:scale-110"
                          )}
                        >
                          <Heart size={18} fill={isWishlisted ? "currentColor" : "none"} />
                        </button>

                        {item.isRealWorld && (item as any).id.startsWith('custom') && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setEditingReward(item);
                                setIsRewardModalOpen(true);
                              }}
                              className="h-10 w-10 rounded-full bg-white/5 text-white/20 hover:bg-white/10 hover:text-white flex items-center justify-center transition-all"
                            >
                              <Edit3 size={16} />
                            </button>
                            <button
                              onClick={() => deleteReward(item.id)}
                              className="h-10 w-10 rounded-full bg-red-500/10 text-red-500/40 hover:bg-red-500 hover:text-white flex items-center justify-center transition-all"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        )}
                      </div>

                      <div className="mb-2 flex items-center gap-2">
                        <span className="font-bold text-[8px] font-black tracking-[0.4em] uppercase opacity-40">{item.rarity}</span>
                        <span className="h-1 w-1 rounded-full bg-white/20" />
                        <span className="font-bold text-[8px] font-black tracking-[0.4em] uppercase opacity-40">{item.type}</span>
                      </div>

                      <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter mb-4 group-hover:translate-x-1 transition-transform duration-500">
                        {item.name}
                      </h3>

                      <p className="text-xs text-white/50 leading-relaxed font-medium mb-6 min-h-[60px]">
                        {item.description}
                      </p>

                      {item.multiplier && (
                        <div className="px-4 py-2 bg-white/5 rounded-xl border border-white/10 w-fit mb-6">
                          <span className="text-[10px] font-black text-[var(--stat-brand)] tracking-widest">+{((item.multiplier - 1) * 100).toFixed(0)}% GAIN</span>
                        </div>
                      )}
                    </div>

                    {/* Card Footer */}
                    <div className="relative z-10 space-y-6 pt-6 border-t border-white/5">
                      {/* Progress Bar (if expensive) */}
                      {!canAfford && !owned && (
                        <div className="space-y-2">
                          <div className="flex justify-between font-bold text-[8px] tracking-widest text-white/30 uppercase font-black">
                            <span>Target Progress</span>
                            <span>{progress.toFixed(0)}%</span>
                          </div>
                          <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                            <motion.div
                              className="h-full bg-white/20"
                              initial={{ width: 0 }}
                              animate={{ width: `${progress}%` }}
                              transition={{ duration: 1, ease: "easeOut" }}
                            />
                          </div>
                          <p className="font-bold text-[8px] text-white/20 uppercase italic mt-1">System Estimating Acquisition...</p>
                        </div>
                      )}

                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-baseline gap-1">
                          <span className={cn(
                            "text-4xl font-black tracking-tighter font-bold transition-colors duration-500",
                            canAfford ? "text-white" : "text-white/20"
                          )}>{item.cost}</span>
                          <span className="text-[10px] font-bold text-white/20">GC</span>
                        </div>

                        <div className="flex-1 flex flex-col gap-2">
                          <button
                            disabled={owned || !canAfford}
                            onClick={() => buyItem(item.id, item.cost)}
                            aria-label={owned ? "Item already owned" : `Acquire for ${item.cost} GC`}
                            className={cn(
                              "w-full py-4 rounded-2xl font-black font-bold text-[10px] tracking-widest uppercase transition-all duration-300 flex items-center justify-center gap-2 outline-none focus-visible:ring-2 focus-visible:ring-[var(--text-primary)]/40",
                              owned ? "bg-white/5 text-white/20 border border-white/5 cursor-default" :
                                canAfford ? "bg-white text-black hover:scale-105 hover:shadow-xl active:scale-95 shadow-lg" :
                                  "bg-white/5 text-white/20 border border-white/5"
                            )}
                          >
                            {owned ? <Lock size={12} /> : canAfford ? <ArrowUpRight size={12} /> : null}
                            {owned ? 'OWNED' : canAfford ? 'ACQUIRE' : 'LOCKED'}
                          </button>

                          {!owned && !canAfford && (
                            <button
                              onClick={() => setSelectedLoanItem(item.id)}
                              aria-label="Request GC loan for this item"
                              className="w-full py-3 rounded-xl font-black font-bold text-[8px] tracking-[0.2em] uppercase bg-[var(--stat-wealth)]/10 text-[var(--stat-wealth)] border border-[var(--stat-wealth)]/20 hover:bg-[var(--stat-wealth)] hover:text-black hover:scale-[1.02] transition-all outline-none focus-visible:ring-2 focus-visible:ring-[var(--stat-wealth)]/40"
                            >
                              Request GC Loan
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {filteredItems.length === 0 && (
              <div className="col-span-full py-40 text-center bg-white/[0.01] border border-dashed border-white/5 rounded-[60px]">
                <Search size={40} className="mx-auto mb-6 text-white/10" />
                <h3 className="font-bold text-xl text-white/20 uppercase tracking-widest">No matching protocols found</h3>
                <p className="text-white/10 text-xs mt-2 uppercase tracking-widest font-bold">adjust your filters to expand the search.</p>
              </div>
            )}
          </div>
        </>
      ) : activeTab === 'inventory' ? (
        <div className="space-y-12">
          {/* Section 1: Boosters & Consumables */}
          <section>
            <h3 className="font-bold text-xs font-black tracking-[0.4em] text-white/30 uppercase mb-8 flex items-center gap-3">
              <BarChart3 size={16} /> Loadout Management
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {inventory.filter(id => SHOP_ITEMS.find(i => i.id === id)?.type === 'consumable').map(itemId => {
                const item = SHOP_ITEMS.find(i => i.id === itemId);
                if (!item) return null;
                const cooldown = useSovereignStore.getState().itemCooldowns[itemId];
                const isOnCooldown = !!(cooldown && new Date(cooldown) > new Date());

                return (
                  <div key={Math.random()} className="p-8 bg-white/[0.02] border border-white/5 rounded-[40px] hover:border-white/20 transition-all flex flex-col justify-between h-[240px]">
                    <div>
                      <h4 className="text-lg font-black text-white italic uppercase tracking-tighter">{item.name}</h4>
                      <p className="text-xs text-white/40 mt-2 line-clamp-2">{item.description}</p>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <div className="font-bold text-[10px] text-white/20 uppercase">{item.duration}h Duration</div>
                      <button
                        disabled={isOnCooldown}
                        onClick={() => deployItem(itemId)}
                        className={cn(
                          "px-6 py-3 rounded-xl font-bold text-[9px] font-black tracking-widest uppercase transition-all",
                          isOnCooldown ? "bg-white/5 text-white/20" : "bg-[var(--stat-brand)] text-white hover:scale-105"
                        )}
                      >
                        {isOnCooldown ? 'ON COOLDOWN' : 'DEPLOY // ACTIVATE'}
                      </button>
                    </div>
                  </div>
                );
              })}
              {inventory.filter(id => SHOP_ITEMS.find(i => i.id === id)?.type === 'consumable').length === 0 && (
                <div className="col-span-full py-20 text-center border border-dashed border-white/5 rounded-[40px]">
                  <p className="font-bold text-[10px] text-white/20 uppercase tracking-[0.4em]">No Consumable Assets Available</p>
                </div>
              )}
            </div>
          </section>

          {/* Section 2: Permanent Equipment */}
          <section>
            <h3 className="font-bold text-xs font-black tracking-[0.4em] text-white/30 uppercase mb-8 flex items-center gap-3">
              <Shield size={16} /> Biological Augmentations
            </h3>
            <div className="space-y-4">
              {inventory.filter(id => SHOP_ITEMS.find(i => i.id === id)?.type === 'permanent').map(itemId => {
                const item = SHOP_ITEMS.find(i => i.id === itemId);
                if (!item) return null;
                return (
                  <div key={itemId} className="p-6 bg-white/[0.01] border border-white/5 rounded-3xl flex items-center justify-between group hover:bg-white/[0.02] transition-all">
                    <div className="flex items-center gap-6">
                      <div className="h-12 w-12 bg-white/5 rounded-xl flex items-center justify-center text-white/40 group-hover:text-white transition-colors">
                        {getIcon(item.iconName, 20)}
                      </div>
                      <div>
                        <h4 className="text-white font-black uppercase text-sm italic">{item.name}</h4>
                        <p className="text-[10px] text-white/30 mt-1 uppercase font-bold tracking-widest">{item.stat} MODULE // PERMANENT EFFECT</p>
                      </div>
                    </div>
                    <div className="px-4 py-2 rounded-lg bg-[var(--stat-brand)]/10 border border-[var(--stat-brand)]/20 text-[var(--stat-brand)] font-bold text-[10px] font-black uppercase tracking-widest">
                      OPERATIONAL
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      ) : (
        <div className="py-40 text-center bg-white/[0.01] border border-dashed border-white/5 rounded-[60px]">
          <Gift size={40} className="mx-auto mb-6 text-white/10" />
          <h3 className="font-bold text-xl text-white/20 uppercase tracking-widest">Archive Content Restricted</h3>
          <p className="text-white/10 text-xs mt-2 uppercase tracking-widest font-bold">deployment history and audit logs are clearing...</p>
        </div>
      )}

      {/* Footer Disclaimer */}
      <footer className="mt-24 p-8 rounded-[40px] bg-white/[0.01] border border-white/5 text-center">
        <p className="font-bold text-[9px] text-white/10 uppercase tracking-[0.6em] max-w-2xl mx-auto leading-relaxed">
          The sovereign exchange is a closed economic loop. Assets acquired are linked to your biometric signature and are non-transferable. ROI metrics are calculated based on physiological consistency.
        </p>
      </footer>

      {/* Reward CRUD Modal */}
      <ModalPortal>
        <AnimatePresence>
          {isRewardModalOpen && (
          <RewardModal
            reward={editingReward}
            onClose={() => setIsRewardModalOpen(false)}
            onSave={async (data) => {
              if (editingReward) {
                await updateReward(editingReward.id, data);
              } else {
                await addReward(data);
              }
              setIsRewardModalOpen(false);
            }}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {selectedLoanItem && (
          <LoanModal
            itemId={selectedLoanItem}
            onClose={() => setSelectedLoanItem(null)}
          />
        )}
      </AnimatePresence>
      </ModalPortal>

    </div>
  );
}

// --- Helper Components ---

function RewardModal({ reward, onClose, onSave }: { reward: any, onClose: () => void, onSave: (data: any) => void }) {
  const [formData, setFormData] = useState({
    name: reward?.name || '',
    description: reward?.description || '',
    cost: reward?.cost || 100,
    rarity: reward?.rarity || 'common',
    type: reward?.type || 'consumable',
    iconName: reward?.iconName || 'Gift'
  });

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/90 backdrop-blur-xl"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative w-full max-w-lg bg-[#0a0a0a] border border-white/10 rounded-[40px] p-10 shadow-2xl overflow-hidden"
      >
        {/* Glow Effect */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/5 rounded-full blur-[100px]" />

        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-10">
            <div className="h-14 w-14 bg-white/5 rounded-2xl flex items-center justify-center text-white border border-white/10">
              <Gift size={28} />
            </div>
            <div>
              <h2 className="font-bold text-[10px] tracking-[0.4em] text-white/30 uppercase font-black mb-1">
                {reward ? 'MODIFY PROTOCOL' : 'INITIALIZE PROTOCOL'}
              </h2>
              <div className="text-2xl font-black text-white tracking-tighter uppercase italic">
                Reward Definition
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <label className="font-bold text-[10px] uppercase text-white/20 mb-3 block tracking-widest font-black">Designation</label>
              <input
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white font-sans text-sm focus:border-white/30 outline-none transition-all"
                placeholder="e.g., THE TRIP FUND DEPOSIT"
              />
            </div>

            <div>
              <label className="font-bold text-[10px] uppercase text-white/20 mb-3 block tracking-widest font-black">Description & Requirements</label>
              <textarea
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white font-sans text-sm h-24 focus:border-white/30 outline-none transition-all resize-none"
                placeholder="What must be achieved to unlock this reward?"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="font-bold text-[10px] uppercase text-white/20 mb-3 block tracking-widest font-black">Cost (GC)</label>
                <input
                  type="number"
                  value={formData.cost}
                  onChange={e => setFormData({ ...formData, cost: parseInt(e.target.value) || 0 })}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white font-bold text-sm focus:border-white/30 outline-none transition-all"
                />
              </div>
              <div>
                <label className="font-bold text-[10px] uppercase text-white/20 mb-3 block tracking-widest font-black">Rarity</label>
                <select
                  value={formData.rarity}
                  onChange={e => setFormData({ ...formData, rarity: e.target.value as any })}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white font-bold text-xs focus:border-white/30 outline-none transition-all appearance-none"
                >
                  <option value="common">COMMON</option>
                  <option value="uncommon">UNCOMMON</option>
                  <option value="rare">RARE</option>
                  <option value="epic">EPIC</option>
                  <option value="legendary">LEGENDARY</option>
                </select>
              </div>
            </div>

            <div className="pt-6 border-t border-white/5 flex gap-4">
              <button
                onClick={onClose}
                className="flex-1 py-4 font-bold text-[10px] font-black tracking-widest text-white/40 uppercase hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => onSave(formData)}
                disabled={!formData.name}
                className="flex-[2] py-4 bg-white text-black rounded-2xl font-bold text-[10px] font-black tracking-widest uppercase hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-30 shadow-xl shadow-white/5"
              >
                Confirm Protocol
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
