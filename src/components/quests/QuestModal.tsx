import { useState, useEffect } from 'react';
import { useSovereignStore } from '../../store/sovereign';
import { motion, AnimatePresence } from 'framer-motion';
import { X, RefreshCw, Settings, Plus, Trash2 } from 'lucide-react';
import { STATS } from '../../lib/constants';
import { Select } from '../ui/Select';
import { cn } from '../../lib/utils';

export const QuestModal = () => {
  const isOpen = useSovereignStore(state => state.questModalOpen);
  const setOpen = useSovereignStore(state => state.setQuestModalOpen);
  const addQuest = useSovereignStore(state => state.addQuest);
  const updateQuest = useSovereignStore(state => state.updateQuest);
  const targetQuestId = useSovereignStore(state => state.targetQuestId);
  const setTargetQuestId = useSovereignStore(state => state.setTargetQuestId);
  const quests = useSovereignStore(state => state.dailyQuests);
  const { briefingTemplates, applyDailyTemplate, saveTemplates } = useSovereignStore();

  const [formData, setFormData] = useState({
    title: '',
    statId: 'code',
    type: 'daily' as any,
    difficulty: 'medium' as any,
    xpReward: 50,
    priority: 'P2' as any,
    dueDate: '',
    repeating: true
  });

  const [isEditingTemplates, setIsEditingTemplates] = useState(false);
  const [localTemplates, setLocalTemplates] = useState(briefingTemplates);

  const isEditMode = !!targetQuestId;
  const currentQuest = isEditMode ? quests.find(q => q.id === targetQuestId) : null;
  const isLocked = currentQuest?.completed && !currentQuest?.repeating;

  useEffect(() => {
    if (isEditMode && isOpen) {
      if (currentQuest) {
        setFormData({
          title: currentQuest.title,
          statId: currentQuest.statId,
          type: currentQuest.type,
          difficulty: currentQuest.difficulty || 'medium',
          xpReward: currentQuest.xpReward,
          priority: currentQuest.priority || 'P2',
          dueDate: currentQuest.dueDate || '',
          repeating: currentQuest.repeating !== undefined ? currentQuest.repeating : true
        });
      }
    } else if (isOpen) {
      setFormData({
        title: '',
        statId: 'code',
        type: 'daily',
        difficulty: 'medium',
        xpReward: 50,
        priority: 'P2',
        dueDate: '',
        repeating: true
      });
    }
  }, [targetQuestId, isOpen, quests, isEditMode, currentQuest]);

  if (!isOpen) return null;

  const handleClose = () => {
    setOpen(false);
    setTargetQuestId(null);
  };

  const handleSubmit = async () => {
    if (!formData.title || isLocked) return;

    if (isEditMode) {
      await updateQuest(targetQuestId, formData);
    } else {
      await addQuest(formData);
    }

    handleClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-lg bg-[var(--bg-card)] border border-[var(--border-default)] rounded-3xl p-8 shadow-2xl z-10"
        >
          <div className="flex justify-between items-center mb-6 border-b border-[var(--border-default)] pb-4">
            <h2 className="font-mono text-xl font-bold text-[var(--text-primary)] tracking-widest uppercase">
              {isEditMode ? (isLocked ? 'Protocol Log (Locked)' : 'Modify Protocol') : 'Register Protocol'}
            </h2>
            <button onClick={handleClose} className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
              <X size={20} />
            </button>
          </div>

          {!isEditMode && !isEditingTemplates && (
            <div className="mb-6">
              <div className="flex justify-between items-center mb-3">
                <label className="font-mono text-[10px] uppercase text-[var(--text-muted)] block tracking-widest font-bold">Quick Protocols</label>
                <button
                  onClick={() => setIsEditingTemplates(true)}
                  className="text-[var(--text-muted)] hover:text-white transition-colors"
                >
                  <Settings size={12} />
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {briefingTemplates.map(t => (
                  <button
                    key={t.id}
                    onClick={() => {
                      applyDailyTemplate(t.id);
                      handleClose();
                    }}
                    className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg font-mono text-[9px] uppercase tracking-wider text-white/50 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all"
                  >
                    {t.title}
                  </button>
                ))}
              </div>
            </div>
          )}

          {isEditingTemplates ? (
            <div className="space-y-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-mono text-xs font-bold text-white uppercase tracking-widest">Protocol Bank</h3>
                <button
                  onClick={() => setIsEditingTemplates(false)}
                  className="text-[var(--text-muted)] hover:text-white text-[10px] font-mono uppercase"
                >
                  Back
                </button>
              </div>

              <div className="max-h-[400px] overflow-y-auto pr-2 space-y-6 no-scrollbar">
                {localTemplates.map((t, ti) => (
                  <div key={t.id} className="p-4 bg-white/5 rounded-2xl border border-white/10 space-y-4">
                    <div className="flex gap-2">
                      <input
                        value={t.title}
                        onChange={(e) => {
                          const newTemplates = [...localTemplates];
                          newTemplates[ti].title = e.target.value;
                          setLocalTemplates(newTemplates);
                        }}
                        className="bg-transparent border-b border-white/10 font-mono text-xs text-white outline-none flex-1 pb-1"
                        placeholder="Template Title"
                      />
                      <button
                        onClick={() => {
                          const newTemplates = localTemplates.filter((_, i) => i !== ti);
                          setLocalTemplates(newTemplates);
                        }}
                        className="text-red-500/50 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                    <div className="space-y-2">
                      {t.tasks.map((task, i) => (
                        <div key={i} className="flex gap-2">
                          <input
                            value={task.title}
                            onChange={(e) => {
                              const newTemplates = [...localTemplates];
                              newTemplates[ti].tasks[i].title = e.target.value;
                              setLocalTemplates(newTemplates);
                            }}
                            className="bg-white/5 border-none rounded p-1 text-[10px] text-white flex-1 outline-none"
                            placeholder="Task title"
                          />
                          <button
                            onClick={() => {
                              const newTemplates = [...localTemplates];
                              newTemplates[ti].tasks = newTemplates[ti].tasks.filter((_, j) => j !== i);
                              setLocalTemplates(newTemplates);
                            }}
                            className="text-white/20 hover:text-red-500"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={() => {
                          const newTemplates = [...localTemplates];
                          const newTask = { title: 'New Task', statId: 'mind', xpReward: 20, priority: 'P2' as const };
                          newTemplates[ti] = { ...newTemplates[ti], tasks: [...newTemplates[ti].tasks, newTask] };
                          setLocalTemplates(newTemplates as any);
                        }}
                        className="flex items-center gap-2 text-[9px] font-mono text-white/30 hover:text-white transition-colors pt-1"
                      >
                        <Plus size={10} /> Add Task
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-4 pt-4 border-t border-white/10">
                <button
                  onClick={() => {
                    const newTemplates = [...localTemplates, {
                      id: `custom_${Date.now()}`,
                      title: 'New Template',
                      tasks: [{ title: 'New Task', statId: 'mind', xpReward: 50, priority: 'P2' as const }]
                    }];
                    setLocalTemplates(newTemplates as any);
                  }}
                  className="flex-1 py-3 bg-white/5 border border-white/10 rounded-xl font-mono text-[10px] font-bold text-white/50 uppercase tracking-widest hover:bg-white/10 transition-all"
                >
                  Create New Protocol
                </button>
                <button
                  onClick={() => {
                    saveTemplates(localTemplates);
                    setIsEditingTemplates(false);
                  }}
                  className="flex-1 py-3 bg-white text-black rounded-xl font-mono text-[10px] font-bold uppercase tracking-widest transition-all hover:scale-[1.02]"
                >
                  Save Changes
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              <div>
                <label className="font-mono text-[10px] uppercase text-[var(--text-muted)] mb-2 block tracking-widest font-bold">Protocol Designation</label>
                <input
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-lg p-3 text-[var(--text-primary)] font-sans text-sm focus:border-[var(--text-strong)] outline-none transition-all placeholder:text-[var(--text-muted)]/50 disabled:opacity-50"
                  placeholder="Enter objective details..."
                  autoFocus
                  disabled={isLocked}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-mono text-[10px] uppercase text-[var(--text-muted)] mb-2 block tracking-widest font-bold">Stat Link</label>
                  <Select
                    value={formData.statId}
                    onChange={(val) => setFormData(prev => ({ ...prev, statId: val }))}
                    options={Object.values(STATS).filter(s => s.id !== 'freedom' && s.id !== 'sovereignty').map(s => ({ value: s.id, label: s.name }))}
                    disabled={isLocked}
                  />
                </div>
                <div>
                  <label className="font-mono text-[10px] uppercase text-[var(--text-muted)] mb-2 block tracking-widest font-bold">Cadence</label>
                  <Select
                    value={formData.type}
                    onChange={(val) => setFormData(prev => ({ ...prev, type: val as any }))}
                    options={[
                      { value: 'daily', label: 'Daily / Strategic' },
                      { value: 'weekly', label: 'Weekly / Operational' },
                      { value: 'boss', label: 'Boss / Campaign' }
                    ]}
                    disabled={isLocked}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className={cn(
                  "p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between",
                  formData.repeating ? "bg-[var(--success)]/10 border-[var(--success)]/30" : "bg-white/5 border-white/10"
                )}
                  onClick={() => !isLocked && setFormData(prev => ({ ...prev, repeating: !prev.repeating }))}
                >
                  <div className="flex items-center gap-2">
                    <RefreshCw size={14} className={formData.repeating ? "text-[var(--success)]" : "text-[var(--text-muted)]"} />
                    <span className="font-mono text-[10px] uppercase font-bold tracking-tight">Repeating?</span>
                  </div>
                  <div className={cn(
                    "w-8 h-4 rounded-full relative transition-all",
                    formData.repeating ? "bg-[var(--success)]" : "bg-white/20"
                  )}>
                    <div className={cn(
                      "absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all",
                      formData.repeating ? "left-[18px]" : "left-0.5"
                    )} />
                  </div>
                </div>
                <div>
                  <label className="font-mono text-[10px] uppercase text-[var(--text-muted)] mb-2 block tracking-widest font-bold leading-none">Hard Deadline {!formData.repeating && <span className="text-red-500">*</span>}</label>
                  <input
                    type="datetime-local"
                    value={formData.dueDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                    className={cn(
                      "w-full bg-[var(--bg-elevated)] border rounded-lg p-2.5 text-[var(--text-primary)] font-mono text-xs focus:border-[var(--text-strong)] outline-none transition-all color-scheme-dark disabled:opacity-50",
                      !formData.repeating && !formData.dueDate ? "border-red-500/50 shadow-[0_0_10px_rgba(239,68,68,0.1)]" : "border-[var(--border-default)]"
                    )}
                    disabled={isLocked}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-mono text-[10px] uppercase text-[var(--text-muted)] mb-2 block tracking-widest font-bold">Priority Tier</label>
                  <Select
                    value={formData.priority}
                    onChange={(val) => setFormData(prev => ({ ...prev, priority: val as any }))}
                    options={[
                      { value: 'P0', label: 'P0: CRITICAL' },
                      { value: 'P1', label: 'P1: STRATEGIC' },
                      { value: 'P2', label: 'P2: OPERATIONAL' },
                      { value: 'P3', label: 'P3: ROUTINE' }
                    ]}
                    disabled={isLocked}
                  />
                </div>
                <div>
                  <label className="font-mono text-[10px] uppercase text-[var(--text-muted)] mb-2 block tracking-widest font-bold">XP Yield</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={formData.xpReward || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, xpReward: parseInt(e.target.value) || 0 }))}
                      className="w-full bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-lg p-3 pl-8 text-[var(--success)] font-mono font-bold text-sm focus:border-[var(--text-strong)] outline-none transition-all disabled:opacity-50"
                      disabled={isLocked}
                    />
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-[var(--success)] font-bold text-sm">+</span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleSubmit}
                disabled={!formData.title || (!formData.repeating && !formData.dueDate) || isLocked}
                className="w-full bg-[var(--text-primary)] text-[var(--bg-primary)] font-mono font-bold text-sm tracking-widest p-4 rounded-xl mt-2 hover:opacity-90 transition-all disabled:opacity-30 disabled:cursor-not-allowed group"
              >
                <span className="group-hover:tracking-[0.2em] transition-all">
                  {isEditMode ? (isLocked ? 'LOCKED' : 'UPDATE PROTOCOL') : 'INITIALIZE PROTOCOL'}
                </span>
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
