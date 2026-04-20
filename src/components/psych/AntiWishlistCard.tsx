import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Lock, Skull, Trash2, Eye } from 'lucide-react';
import { usePsychStore } from '../../store/sovereign-psych';
import { cn } from '../../lib/utils';

export function AntiWishlistCard() {
  const { antiWishlist, antiWishlistLocked, antiWishlistLockedAt, addAntiWishlistItem, removeAntiWishlistItem, lockAntiWishlist } = usePsychStore();
  const [newItem, setNewItem] = useState('');
  const [expanded, setExpanded] = useState(true);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.trim() || antiWishlistLocked) return;
    addAntiWishlistItem(newItem.trim());
    setNewItem('');
  };

  const today = new Date();
  const isWeeklyReviewDay = today.getDay() === 0; // Sunday

  return (
    <div className={cn(
      'relative p-5 rounded-[24px] border transition-all duration-500 overflow-hidden group',
      antiWishlistLocked
        ? 'bg-red-950/20 border-red-500/25 shadow-[0_0_40px_rgba(239,68,68,0.08)]'
        : 'bg-white/[0.02] border-white/[0.06]'
    )}>
      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-full blur-3xl" />
      </div>

      {/* Sunday pulse */}
      {isWeeklyReviewDay && antiWishlistLocked && (
        <div className="absolute top-4 right-4 h-2 w-2 rounded-full bg-red-500 animate-ping" />
      )}

      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between mb-4"
      >
        <div className="flex items-center gap-3">
          <div className={cn(
            'h-8 w-8 rounded-xl flex items-center justify-center',
            antiWishlistLocked ? 'bg-red-500/15 text-red-400' : 'bg-white/5 text-white/40'
          )}>
            <Skull size={16} />
          </div>
          <div className="text-left">
            <h3 className="font-mono text-[9px] font-black tracking-[0.3em] text-red-400 uppercase">
              Threat Model
            </h3>
            <p className="font-mono text-[8px] text-white/20 uppercase tracking-widest">
              {antiWishlistLocked ? 'SEALED — REVIEW WEEKLY' : `${antiWishlist.length} threats logged`}
            </p>
          </div>
        </div>
        <Eye size={14} className="text-white/20 group-hover:text-white/40 transition-colors" />
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
          >
            {/* Item list */}
            <div className="space-y-1.5 mb-4">
              {antiWishlist.length === 0 ? (
                <p className="text-[10px] font-mono text-white/15 text-center py-4">
                  What are you running away from?
                </p>
              ) : (
                antiWishlist.map((item, i) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="flex items-start gap-2.5 group/item py-1"
                  >
                    <div className="h-1.5 w-1.5 rounded-full bg-red-500/60 mt-1.5 shrink-0 group-hover/item:bg-red-400 transition-colors" />
                    <span className="font-mono text-[10px] text-white/50 flex-1 leading-relaxed group-hover/item:text-white/70 transition-colors">
                      {item.text}
                    </span>
                    {!antiWishlistLocked && (
                      <button
                        onClick={() => removeAntiWishlistItem(item.id)}
                        className="opacity-0 group-hover/item:opacity-100 text-white/20 hover:text-red-500 transition-all"
                      >
                        <Trash2 size={10} />
                      </button>
                    )}
                  </motion.div>
                ))
              )}
            </div>

            {/* Add form — only if unlocked */}
            {!antiWishlistLocked && (
              <>
                <form onSubmit={handleAdd} className="flex gap-2 mb-4">
                  <input
                    value={newItem}
                    onChange={e => setNewItem(e.target.value)}
                    placeholder="Adding a fear..."
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-[10px] font-mono text-white/60 outline-none focus:border-red-500/30 transition-all placeholder:text-white/15"
                  />
                  <button
                    type="submit"
                    className="h-8 w-8 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center text-white/40 hover:text-white hover:border-white/30 transition-all"
                  >
                    <Plus size={14} />
                  </button>
                </form>

                {antiWishlist.length >= 5 && (
                  <button
                    onClick={lockAntiWishlist}
                    className="w-full py-2.5 bg-red-500/10 border border-red-500/25 rounded-xl text-red-400 font-mono text-[9px] font-black tracking-[0.2em] uppercase hover:bg-red-500/20 transition-all flex items-center justify-center gap-2"
                  >
                    <Lock size={12} /> Seal Forever
                  </button>
                )}
              </>
            )}

            {/* Locked state footer */}
            {antiWishlistLocked && antiWishlistLockedAt && (
              <div className="flex items-center justify-between pt-3 border-t border-red-500/10 mt-2">
                <span className="font-mono text-[8px] text-red-500/40 uppercase tracking-widest">
                  <Lock size={8} className="inline mr-1" />
                  Sealed {new Date(antiWishlistLockedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' })}
                </span>
                {isWeeklyReviewDay && (
                  <span className="font-mono text-[8px] text-red-400 uppercase tracking-widest animate-pulse">
                    Review Day
                  </span>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
