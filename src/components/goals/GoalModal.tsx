import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, X, Calendar, Star, Zap, Trash2, CheckCircle, Activity, TrendingUp, Shield, Book, Award, ArrowUpCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { useSovereignStore } from '../../store/sovereign';
import { STATS, GOAL_TEMPLATES } from '../../lib/constants';
import { cn } from '../../lib/utils';
import { ModalPortal } from '../ui/ModalPortal';

interface GoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingGoalId?: string | null;
}

export default function GoalModal({ isOpen, onClose, editingGoalId }: GoalModalProps) {
  const { goals, addGoal, updateGoal, deleteGoal, completeGoal } = useSovereignStore();
  const editingGoal = goals.find((g: any) => g.id === editingGoalId);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'weekly' as const,
    statId: 'code',
    deadline: '',
    xpReward: 100,
    gcReward: 50,
    tags: [] as string[],
    progress: 0,
    parentGoalId: '',
    isAutoTracked: false,
    templateId: '',
    targetValue: 0
  });

  const [showTemplates, setShowTemplates] = useState(false);

  useEffect(() => {
    if (editingGoal) {
      setFormData({
        title: editingGoal.title,
        description: editingGoal.description,
        type: editingGoal.type as any,
        statId: editingGoal.statId,
        deadline: editingGoal.deadline.split('T')[0],
        xpReward: editingGoal.xpReward,
        gcReward: editingGoal.gcReward,
        tags: editingGoal.tags,
        progress: editingGoal.progress,
        parentGoalId: editingGoal.parentGoalId || '',
        isAutoTracked: editingGoal.isAutoTracked || false,
        templateId: editingGoal.templateId || '',
        targetValue: editingGoal.targetValue || 0
      });
    } else {
      setFormData({
        title: '',
        description: '',
        type: 'weekly',
        statId: 'code',
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        xpReward: 100,
        gcReward: 50,
        tags: [],
        progress: 0,
        parentGoalId: '',
        isAutoTracked: false,
        templateId: '',
        targetValue: 0
      });
    }
  }, [editingGoal, isOpen]);

  const handleTypeChange = (newType: string) => {
    let daysToAdd = 7;
    if (newType === 'daily') daysToAdd = 1;
    else if (newType === 'weekly') daysToAdd = 7;
    else if (newType === 'monthly') daysToAdd = 30;
    else if (newType === 'yearly') daysToAdd = 365;
    else if (newType === 'life') daysToAdd = 3650;

    const newDeadline = new Date(Date.now() + daysToAdd * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    setFormData(prev => ({ ...prev, type: newType as any, deadline: newDeadline }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingGoalId) {
      await updateGoal(editingGoalId, {
        ...formData,
        deadline: new Date(formData.deadline).toISOString()
      });
    } else {
      await addGoal({
        ...formData,
        deadline: new Date(formData.deadline).toISOString()
      });
    }
    onClose();
  };

  return (
    <ModalPortal>
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-[#0a0a0a]/90 backdrop-blur-2xl border border-white/10 rounded-[48px] overflow-hidden shadow-2xl"
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent" />

              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 bg-white/5 rounded-2xl flex items-center justify-center text-white border border-white/10 shadow-inner">
                      <Target size={24} />
                    </div>
                    <div>
                      <h2 className="text-xl font-black text-white tracking-tighter uppercase italic">
                        {editingGoalId ? 'Recalibrate Objective' : 'Initialize Goal'}
                      </h2>
                      <p className="text-[9px] font-bold text-white/40 uppercase tracking-[0.2em]">
                        Strategic Objective Protocol
                      </p>
                    </div>
                  </div>
                  <button onClick={onClose} className="p-2 text-white/20 hover:text-white transition-colors">
                    <X size={24} />
                  </button>
                </div>

                {!editingGoalId && (
                  <div className="mb-6">
                    <button
                      type="button"
                      onClick={() => setShowTemplates(!showTemplates)}
                      className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-white/40 hover:text-white transition-colors mb-4"
                    >
                      {showTemplates ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      Initialize from Template
                    </button>

                    <AnimatePresence>
                      {showTemplates && (
                        <motion.div 
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="flex gap-3 overflow-x-auto no-scrollbar pb-4">
                            {GOAL_TEMPLATES.map((template: any) => (
                              <button
                                key={template.id}
                                type="button"
                                onClick={() => setFormData({
                                  ...formData,
                                  title: template.title,
                                  type: template.type as any,
                                  statId: template.statId,
                                  targetValue: template.targetValue,
                                  xpReward: template.xpReward,
                                  gcReward: template.gcReward,
                                  isAutoTracked: true,
                                  templateId: template.id
                                })}
                                className={cn(
                                  "flex-shrink-0 p-4 rounded-3xl border transition-all flex flex-col items-start gap-3 w-[180px]",
                                  formData.templateId === template.id 
                                    ? "bg-white text-black border-white shadow-xl shadow-white/10 scale-[1.02]" 
                                    : "bg-white/5 border-white/10 text-white hover:bg-white/10"
                                )}
                              >
                                <div className={cn(
                                  "h-10 w-10 rounded-2xl flex items-center justify-center",
                                  formData.templateId === template.id ? "bg-black/10" : "bg-white/10"
                                )}>
                                  {template.icon === 'Activity' && <Activity size={20} />}
                                  {template.icon === 'Flame' && <Zap size={20} />}
                                  {template.icon === 'Star' && <Star size={20} />}
                                  {template.icon === 'TrendingUp' && <TrendingUp size={20} />}
                                  {template.icon === 'Zap' && <Zap size={20} />}
                                  {template.icon === 'CheckCircle' && <CheckCircle size={20} />}
                                  {template.icon === 'ArrowUpCircle' && <ArrowUpCircle size={20} />}
                                  {template.icon === 'Book' && <Book size={20} />}
                                  {template.icon === 'Shield' && <Shield size={20} />}
                                  {template.icon === 'Award' && <Award size={20} />}
                                </div>
                                <div>
                                  <p className="text-[10px] font-black uppercase tracking-tight leading-tight">{template.title}</p>
                                  <p className="text-[8px] opacity-40 uppercase font-bold mt-1">Template</p>
                                </div>
                              </button>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <AnimatePresence>
                    {(formData.templateId || formData.isAutoTracked) && (
                      <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="flex items-center justify-between px-1 mb-2"
                      >
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "h-8 w-8 rounded-lg flex items-center justify-center transition-all",
                            formData.isAutoTracked ? "bg-white text-black" : "bg-white/5 text-white/40"
                          )}>
                            <Zap size={14} className={formData.isAutoTracked ? "animate-pulse" : ""} />
                          </div>
                          <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-white">Autonomous Protocol</p>
                            <p className="text-[8px] font-bold uppercase tracking-tight text-white/40">Sync with system metrics</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, isAutoTracked: !formData.isAutoTracked })}
                          className={cn(
                            "w-12 h-6 rounded-full relative transition-all duration-300",
                            formData.isAutoTracked ? "bg-[var(--success)]" : "bg-white/10"
                          )}
                        >
                          <motion.div
                            animate={{ x: formData.isAutoTracked ? 24 : 4 }}
                            className="absolute top-1 left-0 w-4 h-4 bg-white rounded-full shadow-lg"
                          />
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-4 md:col-span-2">
                      <label className="text-[10px] font-black text-white/40 uppercase tracking-widest block ml-1">Designation</label>
                      <input
                        required
                        value={formData.title}
                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                        placeholder="e.g., MASTER RUST FUNDAMENTALS"
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-white text-sm outline-none focus:border-white/30 transition-all font-medium placeholder:text-white/10"
                      />
                    </div>


                    <div className="space-y-4">
                      <label className="text-[10px] font-black text-white/40 uppercase tracking-widest block ml-1">Timeline Type</label>
                      <select
                        value={formData.type}
                        onChange={e => handleTypeChange(e.target.value)}
                        className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl py-2.5 px-4 text-white text-sm outline-none focus:border-white/30 transition-all font-bold cursor-pointer appearance-none"
                      >
                        <option value="daily" className="bg-[#1a1a1a] text-white">DAILY TARGET</option>
                        <option value="weekly" className="bg-[#1a1a1a] text-white">WEEKLY MISSION</option>
                        <option value="monthly" className="bg-[#1a1a1a] text-white">MONTHLY MILESTONE</option>
                        <option value="yearly" className="bg-[#1a1a1a] text-white">YEARLY VISION</option>
                        <option value="life" className="bg-[#1a1a1a] text-white">LIFE OBJECTIVE</option>
                      </select>
                    </div>

                    <div className="space-y-4">
                      <label className="text-[10px] font-black text-white/40 uppercase tracking-widest block ml-1">Target Domain</label>
                      <select
                        value={formData.statId}
                        onChange={e => setFormData({ ...formData, statId: e.target.value })}
                        className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl py-2.5 px-4 text-white text-sm outline-none focus:border-white/30 transition-all font-bold cursor-pointer appearance-none"
                      >
                        {Object.values(STATS).map(stat => (
                          <option key={stat.id} value={stat.id} className="bg-[#1a1a1a] text-white">{stat.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-4">
                      <label className="text-[10px] font-black text-white/40 uppercase tracking-widest block ml-1">Deadline Date</label>
                      <div className="relative">
                        <Calendar size={16} className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20" />
                        <input
                          type="date"
                          required
                          value={formData.deadline}
                          onChange={e => setFormData({ ...formData, deadline: e.target.value })}
                          className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-12 pr-4 text-white text-sm outline-none focus:border-white/30 transition-all font-bold"
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <label className="text-[10px] font-black text-white/40 uppercase tracking-widest block ml-1">System Rewards</label>
                      <div className="flex gap-4">
                        <div className="relative flex-1">
                          <Zap size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--stat-code)]" />
                          <input
                            type="number"
                            value={formData.xpReward}
                            onChange={e => setFormData({ ...formData, xpReward: parseInt(e.target.value) || 0 })}
                            className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white text-xs outline-none focus:border-white/30 transition-all font-bold"
                            placeholder="XP"
                          />
                        </div>
                        <div className="relative flex-1">
                          <Star size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--stat-wealth)]" />
                          <input
                            type="number"
                            value={formData.gcReward}
                            onChange={e => setFormData({ ...formData, gcReward: parseInt(e.target.value) || 0 })}
                            className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white text-xs outline-none focus:border-white/30 transition-all font-bold"
                            placeholder="GC"
                          />
                        </div>
                      </div>
                    </div>

                    {!formData.isAutoTracked ? (
                      <div className="space-y-4 md:col-span-2">
                        <div className="flex justify-between items-center ml-1">
                          <label className="text-[10px] font-black text-white/40 uppercase tracking-widest">Protocol Progress</label>
                          <span className="text-xs font-bold text-white">{formData.progress}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={formData.progress}
                          onChange={e => setFormData({ ...formData, progress: parseInt(e.target.value) })}
                          className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer accent-white"
                        />
                      </div>
                    ) : (
                      <div className="space-y-4 md:col-span-2">
                        <label className="text-[10px] font-black text-white/40 uppercase tracking-widest block ml-1">Target Threshold ({GOAL_TEMPLATES.find((t: any) => t.id === formData.templateId)?.unit || 'Value'})</label>
                        <input
                          type="number"
                          value={formData.targetValue}
                          onChange={e => setFormData({ ...formData, targetValue: parseInt(e.target.value) || 0 })}
                          className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-white text-sm outline-none focus:border-white/30 transition-all font-bold placeholder:text-white/10"
                        />
                      </div>
                    )}

                    <div className="space-y-4 md:col-span-2">
                      <label className="text-[10px] font-black text-white/40 uppercase tracking-widest block ml-1">Parent Objective (Hierarchy)</label>
                      <select
                        value={formData.parentGoalId}
                        onChange={e => setFormData({ ...formData, parentGoalId: e.target.value })}
                        className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl py-2.5 px-4 text-white text-sm outline-none focus:border-white/30 transition-all font-bold cursor-pointer appearance-none"
                      >
                        <option value="" className="bg-[#1a1a1a] text-white">INDEPENDENT OBJECTIVE</option>
                        {goals.filter((g: any) => g.id !== editingGoalId && (g.type === 'monthly' || g.type === 'yearly' || g.type === 'life')).map((parent: any) => (
                          <option key={parent.id} value={parent.id} className="bg-[#1a1a1a] text-white">[{parent.type.toUpperCase()}] {parent.title}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-white/5 flex items-center justify-between gap-4 mt-6">
                    {editingGoalId && (
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            completeGoal(editingGoalId);
                            onClose();
                          }}
                          className="px-6 py-4 bg-[var(--success)]/10 text-[var(--success)] border border-[var(--success)]/20 rounded-2xl font-black text-[10px] tracking-widest uppercase hover:bg-[var(--success)] hover:text-black transition-all flex items-center gap-2"
                        >
                          <CheckCircle size={14} /> Complete
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            deleteGoal(editingGoalId);
                            onClose();
                          }}
                          className="p-4 bg-red-500/10 text-red-500 border border-red-500/20 rounded-2xl hover:bg-red-500 hover:text-white transition-all"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    )}

                    <button
                      type="submit"
                      className={cn(
                        "flex-1 py-3 bg-white text-black rounded-xl font-black text-xs tracking-[0.2em] uppercase hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-white/5",
                        !editingGoalId && "w-full"
                      )}
                    >
                      {editingGoalId ? 'Recalibrate Objective' : 'Confirm Protocol'}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </ModalPortal>
  );
}
