import { useState, useEffect } from 'react';
import { useSovereignStore } from '../../store/sovereign';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, AlertTriangle, ShieldAlert } from 'lucide-react';
import { cn } from '../../lib/utils';

interface PostponeModalProps {
  questId: string | null;
  onClose: () => void;
}

export const PostponeModal = ({ questId, onClose }: PostponeModalProps) => {
  const quest = useSovereignStore(state => state.dailyQuests.find(q => q.id === questId));
  const postponeQuest = useSovereignStore(state => state.postponeQuest);
  
  const [reason, setReason] = useState('');
  const [newDate, setNewDate] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (quest && quest.dueDate) {
      // Default to next day
      const current = new Date(quest.dueDate);
      current.setDate(current.getDate() + 1);
      setNewDate(current.toISOString().slice(0, 16));
    }
  }, [quest]);

  if (!quest) return null;

  const isWeekly = quest.type === 'weekly';
  const isBoss = quest.type === 'boss';
  const strikes = quest.postponeCount || 0;

  const handleSubmit = async () => {
    if (!reason || !newDate) return;

    // Weekly enforcement: max 1 day
    if (isWeekly) {
      const original = new Date(quest.dueDate || quest.expiresAt || '');
      const selected = new Date(newDate);
      const diffHours = (selected.getTime() - original.getTime()) / (1000 * 3600);
      
      if (diffHours > 24) {
        setError("Weekly extensions are strictly limited to 24 hours.");
        return;
      }
    }

    await postponeQuest(quest.id, newDate, reason);
    onClose();
  };

  const getPenaltyInfo = () => {
    if (isWeekly) return "50% FAILURE PENALTY (Accountability Loss & Gold Deduction)";
    if (isBoss) {
      if (strikes === 0) return "10% GOLD DEDUCTION";
      if (strikes === 1) return "20% GOLD DEDUCTION";
      if (strikes === 2) return "40% GOLD DEDUCTION";
      return "CRITICAL: 100% FAILURE (Final Strike)";
    }
    return "Soft penalty applied.";
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
        <motion.div
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           exit={{ opacity: 0 }}
           onClick={onClose}
           className="absolute inset-0 bg-black/90 backdrop-blur-md"
        />
        <motion.div
           initial={{ opacity: 0, scale: 0.95, y: 20 }}
           animate={{ opacity: 1, scale: 1, y: 0 }}
           exit={{ opacity: 0, scale: 0.95, y: 20 }}
           className="relative w-full max-w-md bg-[#0A0A0A] border border-white/10 rounded-2xl p-6 shadow-2xl z-10"
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-mono text-xs font-black tracking-[0.3em] text-white uppercase flex items-center gap-2">
              <ShieldAlert size={14} className="text-orange-500" />
              Reschedule Protocol
            </h2>
            <button onClick={onClose} className="text-white/20 hover:text-white transition-colors">
              <X size={18} />
            </button>
          </div>

          <div className="space-y-6">
            <div className="p-4 bg-orange-500/5 border border-orange-500/10 rounded-xl">
               <span className="font-mono text-[9px] text-orange-500/60 uppercase block mb-1">Current Status: {quest.type.toUpperCase()}</span>
               <span className="font-mono text-xs text-white font-bold block mb-2">{quest.title}</span>
               <div className="flex items-center gap-2">
                  <span className="font-mono text-[9px] text-white/40 uppercase">Pressure Level:</span>
                  <span className="font-mono text-[9px] text-orange-500 font-bold uppercase">
                    {isWeekly ? `Extension (0/1)` : `Strike (${strikes}/3)`}
                  </span>
               </div>
            </div>

            <div>
              <label className="font-mono text-[9px] uppercase text-white/30 mb-2 block tracking-widest">Extension Reason (Required)</label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Tactical explanation for protocol delay..."
                className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-xs font-mono text-white outline-none focus:border-white/30 min-h-[80px]"
              />
            </div>

            <div>
              <label className="font-mono text-[9px] uppercase text-white/30 mb-2 block tracking-widest">New Hard Deadline</label>
              <div className="relative">
                <input
                  type="datetime-local"
                  value={newDate}
                  onChange={(e) => {
                    setNewDate(e.target.value);
                    setError(null);
                  }}
                  className={cn(
                    "w-full bg-white/5 border rounded-lg p-3 text-xs font-mono text-white outline-none focus:border-white/30 color-scheme-dark",
                    error ? "border-red-500" : "border-white/10"
                  )}
                />
                <Calendar size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/20 pointer-events-none" />
              </div>
              {error && <p className="text-[10px] text-red-500 font-mono mt-1 uppercase tracking-tight">{error}</p>}
            </div>

            <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl flex items-start gap-3">
               <AlertTriangle size={16} className="text-red-500 shrink-0 mt-0.5" />
               <div className="space-y-1">
                  <span className="font-mono text-[10px] font-black text-red-500 uppercase tracking-widest block">Immediate Penalty Weight</span>
                  <p className="font-mono text-[9px] font-bold text-white/60 uppercase">{getPenaltyInfo()}</p>
               </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={!reason || !newDate || !!error}
              className="w-full bg-white text-black font-mono font-black text-xs tracking-widest p-4 rounded-xl hover:opacity-90 transition-all disabled:opacity-20"
            >
              EXECUTE RESCHEDULE
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
