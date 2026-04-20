import React, { useState, useEffect } from 'react';
import { useSovereignStore } from '../../store/sovereign';
import { motion, AnimatePresence } from 'framer-motion';
import { STATS, XP_TABLE, SKILL_PERKS } from '../../lib/constants';
import { X, Check } from 'lucide-react';
import { cn } from '../../lib/utils';

type ActivityOption = { id: string; label: string; xp: number };

const getActivities = (statId: string): ActivityOption[] => {
  switch (statId) {
    case 'code':
      return [
        { id: 'leetcode_easy', label: 'LeetCode Easy', xp: XP_TABLE.leetcode_easy },
        { id: 'leetcode_medium', label: 'LeetCode Medium', xp: XP_TABLE.leetcode_medium },
        { id: 'leetcode_hard', label: 'LeetCode Hard', xp: XP_TABLE.leetcode_hard },
        { id: 'github_commit', label: 'GitHub Commit', xp: XP_TABLE.github_commit },
        { id: 'job_application', label: 'Job Application', xp: XP_TABLE.job_application },
      ];
    case 'body':
      return [
        { id: 'gym_session', label: 'Gym Session', xp: XP_TABLE.gym_session },
        { id: 'sleep_logged', label: '7+ Hours Sleep', xp: XP_TABLE.sleep_logged },
      ];
    case 'wealth':
      return [
        { id: 'forex_win', label: 'Forex Win', xp: XP_TABLE.forex_win },
      ];
    case 'mind':
      return [
        { id: 'philosophy_reading', label: 'Philosophy Reading', xp: XP_TABLE.philosophy_reading },
        { id: 'journaling', label: 'Journaling', xp: XP_TABLE.journaling },
      ];
    case 'brand':
      return [
        { id: 'tweet_posted', label: 'Tweet Posted', xp: XP_TABLE.tweet_posted },
        { id: 'linkedin_post', label: 'LinkedIn Post', xp: XP_TABLE.linkedin_post },
      ];
    case 'network':
      return [
        { id: 'cold_outreach', label: 'Cold Outreach', xp: XP_TABLE.cold_outreach },
      ];
    default:
      return [];
  }
}

export const LogModal = () => {
  const isOpen = useSovereignStore(state => state.logModalOpen);
  const setOpen = useSovereignStore(state => state.setLogModalOpen);
  const logActivity = useSovereignStore(state => state.logActivity);

  const [selectedStat, setSelectedStat] = useState<string>('code');
  const [selectedActivity, setSelectedActivity] = useState<string>('');
  const [xp, setXp] = useState<number>(0);
  const [notes, setNotes] = useState('');
  const targetQuestId = useSovereignStore(state => state.targetQuestId);
  const quests = useSovereignStore(state => state.dailyQuests);
  const inventory = useSovereignStore(state => state.inventory);
  const statLevels = useSovereignStore(state => state.statLevels);

  const targetQuest = targetQuestId ? quests.find(q => q.id === targetQuestId) : null;
  const activities = getActivities(selectedStat);

  useEffect(() => {
    if (targetQuest) {
      if (selectedStat !== targetQuest.statId) setSelectedStat(targetQuest.statId);
      if (xp !== targetQuest.xpReward) setXp(targetQuest.xpReward);
      return;
    }

    if (activities.length > 0) {
      const defaultActivity = activities[0];
      if (selectedActivity !== defaultActivity.id) {
        setSelectedActivity(defaultActivity.id);
        setXp(defaultActivity.xp);
      }
    } else {
      setSelectedActivity('');
      setXp(0);
    }
  }, [selectedStat, targetQuest, activities, selectedActivity, xp]);

  const getMultiplierBreakdown = () => {
    let mult = 1;
    const items = [];

    if (inventory.includes('energy_drink')) {
      mult *= 2;
      items.push({ label: 'Adrenaline Surge', value: '2.0x' });
    }
    if (inventory.includes('dev_desk') && selectedStat === 'code') {
      mult *= 1.1;
      items.push({ label: 'Tactical Workspace', value: '1.1x' });
    }

    const level = statLevels[selectedStat] || 1;
    const perks = SKILL_PERKS[selectedStat]?.filter((p: any) => level >= p.level) || [];
    const highestPerk = perks.length > 0 ? perks[perks.length - 1] : null;

    if (highestPerk?.xpBonus) {
      mult *= (1 + highestPerk.xpBonus);
      items.push({ label: `${highestPerk.name} Perk`, value: `${(1 + highestPerk.xpBonus).toFixed(2)}x` });
    }

    return { total: mult, breakdown: items };
  };

  const multiplier = getMultiplierBreakdown();
  const boostedXP = Math.floor(xp * multiplier.total);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStat) return;

    if (targetQuest && notes.trim().length === 0) {
      alert("STRICT ACCOUNTABILITY: Proof/Notes required to clear a mission.");
      return;
    }

    logActivity(selectedStat, xp);
    setOpen(false);
    setNotes('');
  }

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') setOpen(false);
      const num = parseInt(e.key);
      if (!isNaN(num) && num >= 1 && num <= 6) {
        const statsArr = Object.keys(STATS).filter(s => s !== 'freedom');
        setSelectedStat(statsArr[num - 1]);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, setOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100]"
          />
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-6 overflow-y-auto pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-[#0a0a0a] border border-white/10 rounded-[32px] p-8 shadow-[0_0_50px_rgba(0,0,0,0.5)] z-[201] pointer-events-auto"
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-mono text-xl text-white">LOG ACTIVITY</h2>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="text-gray-500 hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <AnimatePresence>
                {targetQuest && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="mb-8 p-4 bg-[var(--stat-brand)]/5 border border-[var(--stat-brand)]/20 rounded-2xl flex flex-col gap-1 overflow-hidden"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex flex-col gap-1">
                        <span className="font-mono text-[9px] text-[var(--stat-brand)] tracking-[0.3em] uppercase font-black">Mission in Progress</span>
                        <div className="text-sm font-bold text-white uppercase tracking-tight">{targetQuest.title}</div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <div className={cn(
                          "px-2 py-0.5 rounded text-[8px] font-mono font-bold border",
                          targetQuest.priority === 'P0' ? "bg-red-500/20 text-red-500 border-red-500/30" :
                          targetQuest.priority === 'P1' ? "bg-orange-500/20 text-orange-500 border-orange-500/30" :
                          "bg-blue-500/20 text-blue-500 border-blue-500/30"
                        )}>
                          {targetQuest.priority}
                        </div>
                        {(targetQuest.dueDate || targetQuest.expiresAt) && (
                          <div className="text-[9px] font-mono text-[var(--text-muted)] flex items-center gap-1">
                            <span className="opacity-50">REMAINING:</span>
                            <span className={cn(
                              "font-black",
                              (() => {
                                const targetDate = targetQuest.dueDate || targetQuest.expiresAt;
                                if (!targetDate) return "";
                                const diff = new Date(targetDate).getTime() - new Date().getTime();
                                if (diff / 3600000 < 1) return "text-red-500 animate-pulse";
                                if (diff / 3600000 < 4) return "text-orange-500";
                                return "text-green-400";
                              })()
                            )}>
                              {(() => {
                                const targetDate = targetQuest.dueDate || targetQuest.expiresAt;
                                if (!targetDate) return "";
                                const diff = new Date(targetDate).getTime() - new Date().getTime();
                                if (diff <= 0) return 'EXPIRED';
                                const h = Math.floor(diff / 3600000);
                                const m = Math.floor((diff % 3600000) / 60000);
                                return h > 0 ? `${h}h ${m}m` : `${m}m`;
                              })()}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <form onSubmit={handleSubmit} className="flex flex-col gap-6">

                <div>
                  <label className="font-mono text-[10px] tracking-[0.3em] text-[var(--text-muted)] mb-4 block uppercase opacity-60 font-bold">SELECT CHANNEL (1-6)</label>
                  <div className="grid grid-cols-6 gap-3">
                    {Object.values(STATS).filter(s => s.id !== 'freedom').map((stat, i) => (
                      <button
                        key={stat.id}
                        type="button"
                        onClick={() => setSelectedStat(stat.id)}
                        className={cn(
                          "h-16 border-2 transition-all flex flex-col items-center justify-center p-2 group relative rounded-xl overflow-hidden shadow-sm",
                          selectedStat === stat.id
                            ? "border-[var(--text-primary)] scale-105"
                            : "border-[var(--border-subtle)] bg-[var(--bg-elevated)]/50 opacity-40 hover:opacity-100 hover:border-[var(--border-default)]"
                        )}
                        style={{
                          boxShadow: selectedStat === stat.id ? `0 0 20px ${stat.colorVar}30` : 'none',
                          backgroundColor: selectedStat === stat.id ? `${stat.colorVar}15` : undefined,
                          borderColor: selectedStat === stat.id ? stat.colorVar : undefined
                        }}
                      >
                        <span className={cn(
                          "font-mono text-xl font-black transition-colors",
                          selectedStat === stat.id ? "text-[var(--text-primary)]" : "text-[var(--text-muted)]"
                        )}>
                          {i + 1}
                        </span>
                        <div className={cn(
                          "text-[7px] uppercase tracking-tighter transition-all font-bold mt-1",
                          selectedStat === stat.id ? "opacity-100" : "opacity-0"
                        )} style={{ color: stat.colorVar }}>
                          {stat.name}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="font-mono text-xs tracking-widest text-[var(--text-muted)] mb-3 block">ACTIVITY</label>
                  <div className="relative">
                    <select
                      value={selectedActivity}
                      onChange={(e) => {
                        setSelectedActivity(e.target.value);
                        const sel = activities.find(a => a.id === e.target.value);
                        if (sel) setXp(sel.xp);
                      }}
                      className="w-full bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-lg p-3 text-[var(--text-primary)] font-sans outline-none focus:border-[var(--text-muted)] appearance-none"
                    >
                      {activities.map(a => (
                        <option key={a.id} value={a.id}>{a.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-3 text-[10px] tracking-widest uppercase font-bold text-[var(--text-muted)] opacity-60">
                    <label className="m-0">XP ALLOCATION</label>
                    <div className="flex items-center gap-2">
                      {multiplier.total > 1 && (
                        <span className="text-[var(--success)] px-1.5 py-0.5 bg-[var(--success)]/10 rounded border border-[var(--success)]/20 animate-pulse">
                          {multiplier.total.toFixed(2)}x
                        </span>
                      )}
                      <span className="font-mono font-black" style={{ color: STATS[selectedStat]?.colorVar }}>
                        +{boostedXP} XP
                      </span>
                    </div>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={xp}
                    onChange={(e) => setXp(parseInt(e.target.value))}
                    className="w-full accent-[var(--text-primary)] h-1.5 rounded-full appearance-none bg-[var(--bg-primary)] cursor-pointer"
                  />

                  {multiplier.breakdown.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {multiplier.breakdown.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-1.5 px-2 py-1 bg-white/5 border border-white/5 rounded-lg">
                          <span className="text-[8px] font-mono text-white/40 uppercase tracking-widest">{item.label}</span>
                          <span className="text-[8px] font-mono text-[var(--success)] font-black">{item.value}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="font-mono text-xs tracking-widest text-[var(--danger)] mb-3 block">
                    NOTES / PROOF {targetQuest ? '(REQUIRED)' : '(OPTIONAL)'}
                  </label>
                  <textarea
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    placeholder={targetQuest ? "Provide strict proof of completion..." : "(Optional) Specific details, problem name, weight lifted..."}
                    className="w-full bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-lg p-3 text-[var(--text-primary)] font-sans tracking-wide text-sm outline-none focus:border-[var(--text-muted)] resize-none min-h-[80px]"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full h-12 mt-2 bg-white text-black font-mono font-bold tracking-widest rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                >
                  <Check size={18} /> CONFIRM [Enter]
                </button>

              </form>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
