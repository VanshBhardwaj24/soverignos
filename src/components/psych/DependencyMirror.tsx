import { useState } from 'react';
import { motion } from 'framer-motion';
import { Layers, Plus, Check, ArrowRight, TrendingUp, Minus, X } from 'lucide-react';
import { usePsychStore } from '../../store/sovereign-psych';
import type { DependencyItem } from '../../store/sovereign-psych';
import { cn } from '../../lib/utils';

const STATUS_LABELS = {
  unchanged: { label: 'Unchanged', color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20' },
  improved:  { label: 'Improving', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
  resolved:  { label: 'Resolved',  color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/20' },
};

const STATUS_ICONS = {
  unchanged: Minus,
  improved:  TrendingUp,
  resolved:  Check,
};

export function DependencyMirror() {
  const { dependencyItems, setDependencyItems, updateDependencyStatus } = usePsychStore();
  const [showAdd, setShowAdd] = useState(false);
  const [newArea, setNewArea] = useState('');
  const [newTarget, setNewTarget] = useState('');

  const handleAdd = () => {
    if (!newArea.trim() || !newTarget.trim()) return;
    const newItem: DependencyItem = {
      id: crypto.randomUUID(),
      area: newArea.trim(),
      target: newTarget.trim(),
      status: 'unchanged',
    };
    setDependencyItems([...dependencyItems, newItem]);
    setNewArea(''); setNewTarget(''); setShowAdd(false);
  };

  const handleRemove = (id: string) => {
    setDependencyItems(dependencyItems.filter(d => d.id !== id));
  };

  const resolved  = dependencyItems.filter(d => d.status === 'resolved').length;
  const improved  = dependencyItems.filter(d => d.status === 'improved').length;
  const unchanged = dependencyItems.filter(d => d.status === 'unchanged').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-mono text-[10px] tracking-[0.3em] text-white/30 uppercase font-black mb-1">Freedom Audit</h3>
          <p className="font-mono text-2xl font-light text-white">DEPENDENCY MIRROR</p>
          <p className="font-mono text-[9px] text-white/20 mt-1 uppercase tracking-widest">
            {new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
          </p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl font-mono text-[9px] text-white/40 uppercase hover:text-white hover:border-white/20 transition-all"
        >
          <Plus size={12} /> Add Dependency
        </button>
      </div>

      {/* Score summary */}
      {dependencyItems.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Still Locked',  count: unchanged, color: 'text-red-400',   border: 'border-red-500/20' },
            { label: 'Improving',     count: improved,  color: 'text-amber-400', border: 'border-amber-500/20' },
            { label: 'Resolved',      count: resolved,  color: 'text-green-400', border: 'border-green-500/20' },
          ].map(s => (
            <div key={s.label} className={`p-4 bg-white/[0.02] border ${s.border} rounded-2xl text-center`}>
              <p className={`font-mono text-2xl font-black ${s.color}`}>{s.count}</p>
              <p className="font-mono text-[8px] text-white/20 uppercase tracking-widest mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Dependency list */}
      <div className="space-y-3">
        {dependencyItems.length === 0 ? (
          <div className="py-14 text-center border border-dashed border-white/10 rounded-[24px]">
            <Layers size={32} className="mx-auto mb-3 text-white/10" />
            <p className="font-mono text-[9px] text-white/20 uppercase tracking-[0.3em]">No dependencies logged</p>
            <p className="font-mono text-[8px] text-white/10 mt-1">What are you still dependent on?</p>
          </div>
        ) : (
          dependencyItems.map((item, i) => {
            const s = STATUS_LABELS[item.status];
            const Icon = STATUS_ICONS[item.status];
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="p-5 bg-white/[0.02] border border-white/[0.06] rounded-[20px] flex items-center gap-4 group hover:border-white/10 transition-all"
              >
                <div className={`h-8 w-8 rounded-xl border flex items-center justify-center shrink-0 ${s.bg}`}>
                  <Icon size={14} className={s.color} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-mono text-[10px] font-black text-white">{item.area}</span>
                    <span className={`font-mono text-[7px] uppercase tracking-widest ${s.color} opacity-70`}>{s.label}</span>
                  </div>
                  <div className="flex items-center gap-1 font-mono text-[9px] text-white/30">
                    <ArrowRight size={10} />
                    <span>Target: {item.target}</span>
                  </div>
                </div>

                {/* Status cycle buttons */}
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  {(['unchanged', 'improved', 'resolved'] as DependencyItem['status'][]).map(status => {
                    const sl = STATUS_LABELS[status];
                    return (
                      <button
                        key={status}
                        onClick={() => updateDependencyStatus(item.id, status)}
                        className={cn(
                          'px-3 py-1 rounded-lg border font-mono text-[7px] uppercase tracking-wider transition-all',
                          item.status === status
                            ? `${sl.bg} ${sl.color} opacity-100`
                            : 'bg-white/5 border-white/10 text-white/30 hover:text-white'
                        )}
                      >
                        {sl.label}
                      </button>
                    );
                  })}
                  <button onClick={() => handleRemove(item.id)} className="ml-1 text-white/10 hover:text-red-400 transition-colors">
                    <X size={14} />
                  </button>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Default seeder if empty */}
      {dependencyItems.length === 0 && (
        <div className="space-y-2">
          <p className="font-mono text-[8px] text-white/10 uppercase tracking-widest text-center">Suggested dependencies to track:</p>
          {['Family for accommodation', 'No income stream', 'Zero public presence', 'No savings buffer'].map(s => (
            <button
              key={s}
              onClick={() => { setNewArea(s); setShowAdd(true); }}
              className="w-full text-left px-4 py-3 bg-white/[0.01] border border-white/[0.04] rounded-xl font-mono text-[9px] text-white/20 hover:text-white/40 hover:border-white/10 transition-all flex items-center justify-between group"
            >
              {s}
              <Plus size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          ))}
        </div>
      )}

      {/* Add modal */}
      {showAdd && (
        <div className="fixed inset-0 z-[800] bg-black/80 backdrop-blur-md flex items-center justify-center p-6">
          <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="w-full max-w-md bg-[#0a0a0a] border border-white/10 rounded-[32px] p-8 space-y-5">
            <div className="flex items-center justify-between">
              <h4 className="font-mono text-sm font-black text-white uppercase">Add Dependency</h4>
              <button onClick={() => setShowAdd(false)} className="text-white/20 hover:text-white"><X size={18} /></button>
            </div>
            <div>
              <label className="block font-mono text-[8px] text-white/20 uppercase tracking-widest mb-2">Dependency Area</label>
              <input value={newArea} onChange={e => setNewArea(e.target.value)} placeholder="e.g. Family for accommodation" className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white text-sm font-mono outline-none focus:border-[var(--stat-mind)]" />
            </div>
            <div>
              <label className="block font-mono text-[8px] text-white/20 uppercase tracking-widest mb-2">Freedom Target</label>
              <input value={newTarget} onChange={e => setNewTarget(e.target.value)} placeholder="e.g. When I get first paycheck" className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white text-sm font-mono outline-none focus:border-[var(--stat-mind)]" />
            </div>
            <div className="flex gap-3">
              <button onClick={handleAdd} disabled={!newArea || !newTarget} className="flex-1 py-3 bg-white text-black font-mono font-black text-[9px] uppercase rounded-xl hover:opacity-90 disabled:opacity-30 transition-all">Add</button>
              <button onClick={() => setShowAdd(false)} className="px-6 py-3 bg-white/5 text-white/40 font-mono text-[9px] uppercase rounded-xl hover:text-white transition-all">Cancel</button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
