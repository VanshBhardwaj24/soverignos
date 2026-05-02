import { useState, memo, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, CheckSquare, Plus, Zap, AlertTriangle, ToggleLeft, ToggleRight, List } from 'lucide-react';
import { cn } from '../../lib/utils';
import type { Quest } from '../../store/sovereign';

interface SubtaskPanelProps {
  quest: Quest;
  onUpdateNotes: (notes: string, subtasks: Quest['subtasks'], subtasksEnabled: boolean) => void;
  onCompleteSubtask?: (subtaskId: string) => void;
  isArchived?: boolean;
}

function distributeXP(subtasks: NonNullable<Quest['subtasks']>, parentXP: number): NonNullable<Quest['subtasks']> {
  if (!subtasks || subtasks.length === 0) return [];
  const weights = { P0: 4, P1: 3, P2: 2, P3: 1 };
  const totalWeight = subtasks.reduce((sum, st) => sum + weights[st.priority], 0);
  
  if (totalWeight === 0) return subtasks;

  const targetParentPenalty = Math.floor(parentXP / 2);

  const withFloats = subtasks.map(st => {
    const weight = weights[st.priority];
    return {
      ...st,
      exactXp: (weight / totalWeight) * parentXP,
      exactPenalty: (weight / totalWeight) * targetParentPenalty,
      xpReward: Math.floor((weight / totalWeight) * parentXP),
      penaltyXP: Math.floor((weight / totalWeight) * targetParentPenalty)
    };
  });

  let remainingXP = parentXP - withFloats.reduce((sum, st) => sum + st.xpReward, 0);
  let remainingPenalty = targetParentPenalty - withFloats.reduce((sum, st) => sum + st.penaltyXP, 0);

  const sortedByXpRemainder = [...withFloats].sort((a, b) => (b.exactXp - b.xpReward) - (a.exactXp - a.xpReward));
  for (let i = 0; i < remainingXP; i++) {
    sortedByXpRemainder[i].xpReward += 1;
  }

  const sortedByPenaltyRemainder = [...withFloats].sort((a, b) => (b.exactPenalty - b.penaltyXP) - (a.exactPenalty - a.penaltyXP));
  for (let i = 0; i < remainingPenalty; i++) {
    sortedByPenaltyRemainder[i].penaltyXP += 1;
  }

  return subtasks.map(st => {
    const finalStXp = sortedByXpRemainder.find(s => s.id === st.id)!;
    const finalStPenalty = sortedByPenaltyRemainder.find(s => s.id === st.id)!;
    return {
      ...st,
      xpReward: finalStXp.xpReward,
      penaltyXP: finalStPenalty.penaltyXP
    };
  });
}

export const SubtaskPanel = memo(function SubtaskPanel({ quest, onUpdateNotes, onCompleteSubtask, isArchived }: SubtaskPanelProps) {
  const [notes, setNotes] = useState(quest.notes || '');
  const subtasks = quest.subtasks || [];
  const subtasksEnabled = quest.subtasksEnabled ?? false;

  const handleNotesChange = (val: string) => {
    setNotes(val);
  };

  const handleNotesBlur = () => {
    onUpdateNotes(notes, subtasks, subtasksEnabled);
  };

  const handleToggleSubtasks = () => {
    if (isArchived) return;
    onUpdateNotes(notes, subtasks, !subtasksEnabled);
  };

  const completedCount = useMemo(() => subtasks.filter(st => st.completed).length, [subtasks]);
  const totalXPAllocated = useMemo(() => subtasks.reduce((sum, st) => sum + (st.xpReward || 0), 0), [subtasks]);
  const totalPenalty = useMemo(() => subtasks.reduce((sum, st) => sum + (st.penaltyXP || 0), 0), [subtasks]);

  const addSubtask = () => {
    if (isArchived || subtasks.length >= 10) return;
    const newId = Math.random().toString(36).substr(2, 9);
    const newSt = {
      id: newId,
      text: '',
      completed: false,
      priority: 'P2' as const,
      xpReward: 0,
      penaltyXP: 0
    };
    const newSubtasks = distributeXP([...subtasks, newSt], quest.xpReward);
    onUpdateNotes(notes, newSubtasks, subtasksEnabled);
  };

  const updateSubtask = (id: string, updates: Partial<NonNullable<Quest['subtasks']>[0]>) => {
    if (isArchived) return;
    const updatedArray = subtasks.map(st => st.id === id ? { ...st, ...updates } : st);
    
    // Recalculate distribution if priority changed
    const newSubtasks = updates.priority 
      ? distributeXP(updatedArray, quest.xpReward)
      : updatedArray;
      
    onUpdateNotes(notes, newSubtasks, subtasksEnabled);
  };

  const toggleSubtask = (id: string) => {
    if (isArchived) return;
    const st = subtasks.find(s => s.id === id);
    if (!st) return;

    if (!st.completed && onCompleteSubtask) {
      // Allow completing subtasks individually via store to trigger XP award
      onCompleteSubtask(id);
    } else {
      // Revert completion
      updateSubtask(id, { completed: !st.completed });
    }
  };

  const deleteSubtask = (id: string) => {
    if (isArchived) return;
    const newSubtasks = distributeXP(subtasks.filter(st => st.id !== id), quest.xpReward);
    onUpdateNotes(notes, newSubtasks, subtasksEnabled);
  };

  return (
    <div className="border-t border-white/5 bg-black/20 p-4">
      <textarea
        value={notes}
        onChange={(e) => handleNotesChange(e.target.value)}
        onBlur={handleNotesBlur}
        readOnly={isArchived}
        placeholder="Operational notes, tactical subtasks, or mission logs..."
        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-[11px] font-bold text-white/60 min-h-[80px] outline-none focus:border-white/20 transition-all resize-none"
      />

      <div className="mt-6">
        {/* Header / Toggle */}
        <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-4">
          <div className="flex items-center gap-3">
            <List size={14} className={subtasksEnabled ? "text-white" : "text-white/20"} />
            <div>
              <h4 className="text-[10px] font-black tracking-widest uppercase text-white/80">Subtask Protocols</h4>
              {subtasksEnabled && subtasks.length > 0 && (
                <div className="flex items-center gap-2 mt-1.5">
                  <div className="h-1.5 w-24 bg-white/10 rounded-full overflow-hidden relative">
                    <motion.div 
                      className="absolute inset-y-0 left-0 bg-[var(--success)]"
                      initial={{ width: 0 }}
                      animate={{ width: `${(completedCount / subtasks.length) * 100}%` }}
                    />
                  </div>
                  <span className="text-[9px] font-bold text-white/40">{completedCount}/{subtasks.length}</span>
                  <div className="w-px h-3 bg-white/10 mx-1" />
                  <span className="text-[9px] font-bold text-white/40">{totalXPAllocated} XP Allocated</span>
                  {totalPenalty > 0 && (
                    <>
                      <div className="w-px h-3 bg-white/10 mx-1" />
                      <span className="text-[9px] font-bold text-red-400 font-black">{totalPenalty} XP Risk</span>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
          
          <button 
            onClick={handleToggleSubtasks}
            disabled={isArchived}
            className={cn(
              "flex items-center gap-2 text-[10px] font-bold tracking-widest uppercase transition-all px-3 py-1.5 rounded border",
              subtasksEnabled 
                ? "bg-[var(--success)]/10 text-[var(--success)] border-[var(--success)]/20 shadow-[0_0_10px_var(--success)]" 
                : "bg-white/5 text-white/40 border-white/10 hover:text-white"
            )}
          >
            {subtasksEnabled ? 'ENABLED' : 'DISABLED'}
            {subtasksEnabled ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
          </button>
        </div>

        {/* Legacy Checkpoint Mode */}
        {!subtasksEnabled && (
          <div className="space-y-2 opacity-60 grayscale">
            {subtasks.map(st => (
              <div key={st.id} className="flex items-center gap-3 bg-white/[0.02] p-2 rounded-lg border border-white/5">
                <button
                  onClick={() => toggleSubtask(st.id)}
                  className={cn(
                    "h-4 w-4 rounded border flex items-center justify-center transition-all",
                    st.completed ? "bg-[var(--success)] border-[var(--success)] text-white" : "border-white/20"
                  )}
                >
                  {st.completed && <CheckSquare size={10} />}
                </button>
                <input
                  value={st.text}
                  onChange={(e) => updateSubtask(st.id, { text: e.target.value })}
                  readOnly={isArchived}
                  className={cn(
                    "bg-transparent border-none outline-none text-[10px] font-bold text-white/50 w-full",
                    st.completed && "line-through opacity-30"
                  )}
                />
                {!isArchived && (
                  <button onClick={() => deleteSubtask(st.id)} className="text-white/10 hover:text-[var(--danger)] transition-colors">
                    <Trash2 size={10} />
                  </button>
                )}
              </div>
            ))}
            {!isArchived && (
              <button onClick={addSubtask} className="text-[9px] font-bold text-white/40 hover:text-white uppercase tracking-widest mt-2 block">
                + Add Legacy Checkpoint
              </button>
            )}
          </div>
        )}

        {/* New Advanced Subtask Mode */}
        {subtasksEnabled && (
          <div className="space-y-3">
            <AnimatePresence>
              {subtasks.map((st, i) => (
                <motion.div 
                  key={st.id}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={cn(
                    "flex items-center gap-3 bg-white/[0.03] p-2.5 rounded-xl border transition-all",
                    st.completed ? "border-[var(--success)]/20 shadow-[0_0_15px_rgba(16,185,129,0.05)] opacity-70" : "border-white/10 hover:border-white/20"
                  )}
                >
                  <button
                    onClick={() => toggleSubtask(st.id)}
                    className={cn(
                      "h-5 w-5 rounded-md border flex items-center justify-center transition-all flex-shrink-0",
                      st.completed ? "bg-[var(--success)] border-[var(--success)] text-white shadow-[0_0_10px_var(--success)]" : "border-white/20 hover:border-white/40"
                    )}
                  >
                    {st.completed && <CheckSquare size={12} />}
                  </button>
                  
                  <select 
                    value={st.priority}
                    onChange={(e) => updateSubtask(st.id, { priority: e.target.value as any })}
                    disabled={isArchived || st.completed}
                    className={cn(
                      "bg-transparent border-none outline-none text-[9px] font-black uppercase tracking-widest cursor-pointer w-14 appearance-none text-center",
                      st.priority === 'P0' ? "text-red-400 drop-shadow-[0_0_5px_rgba(239,68,68,0.5)]" :
                      st.priority === 'P1' ? "text-orange-400" :
                      st.priority === 'P2' ? "text-blue-400" : "text-white/30"
                    )}
                  >
                    <option value="P0" className="bg-[#111] text-red-400">P0</option>
                    <option value="P1" className="bg-[#111] text-orange-400">P1</option>
                    <option value="P2" className="bg-[#111] text-blue-400">P2</option>
                    <option value="P3" className="bg-[#111] text-white/30">P3</option>
                  </select>

                  <input
                    value={st.text}
                    onChange={(e) => updateSubtask(st.id, { text: e.target.value })}
                    readOnly={isArchived || st.completed}
                    placeholder="Subtask description..."
                    className={cn(
                      "bg-transparent border-none outline-none text-[11px] font-bold w-full transition-all text-white",
                      st.completed && "line-through text-white/30"
                    )}
                  />

                  <div className="flex items-center gap-4 border-l border-white/10 pl-4 flex-shrink-0">
                    <div className="flex items-center gap-1" title="XP Reward (Auto-Distributed)">
                      <Zap size={10} className={st.xpReward > 0 ? "text-[var(--stat-code)]" : "text-white/20"} />
                      <input 
                        type="number" 
                        value={st.xpReward || 0}
                        readOnly
                        className="w-8 bg-transparent border-none outline-none text-[10px] font-bold text-center text-[var(--stat-code)]/80 pointer-events-none"
                      />
                    </div>
                    <div className="flex items-center gap-1" title="Failure Penalty (Auto-Distributed)">
                      <AlertTriangle size={10} className={st.penaltyXP > 0 ? "text-red-400" : "text-white/20"} />
                      <input 
                        type="number" 
                        value={st.penaltyXP || 0}
                        readOnly
                        className="w-8 bg-transparent border-none outline-none text-[10px] font-bold text-center text-red-400/80 pointer-events-none"
                      />
                    </div>
                    {!isArchived && !st.completed && (
                      <button onClick={() => deleteSubtask(st.id)} className="text-white/20 hover:text-red-400 transition-colors ml-2">
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {!isArchived && subtasks.length < 10 && (
              <button 
                onClick={addSubtask} 
                className="flex items-center gap-2 text-[9px] font-bold text-white/40 hover:text-white hover:bg-white/5 uppercase tracking-widest mt-4 px-3 py-2 rounded-lg border border-transparent hover:border-white/10 transition-all w-full justify-center border-dashed"
              >
                <Plus size={12} /> INITIALIZE SUBTASK
              </button>
            )}
            {subtasks.length >= 10 && (
              <p className="text-[9px] text-center text-white/30 uppercase tracking-widest mt-4">Max subtasks reached</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
});
