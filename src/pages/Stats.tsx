import { useState, useMemo } from 'react';
import { useSovereignStore } from '../store/sovereign';
import { Zap, Target, TrendingUp, Star, Award, Terminal, DollarSign, Dumbbell, Brain, Users, Megaphone } from 'lucide-react';
import { SKILL_PERKS as CENTRALIZED_PERKS, STATS, getRank } from '../lib/constants';
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis,
  ResponsiveContainer, AreaChart, Area, Tooltip, XAxis, YAxis
} from 'recharts';
import { motion } from 'framer-motion';
import { cn } from '../lib/utils';
import { InteractiveHeatmap } from '../components/stats/InteractiveHeatmap';

const STAT_ICONS: Record<string, any> = {
  code: Terminal,
  wealth: DollarSign,
  body: Dumbbell,
  mind: Brain,
  brand: Megaphone,
  network: Users,
  spirit: Zap
};

export default function Stats() {
  const { statLevels, activityLog } = useSovereignStore();
  const [activeTab, setActiveTab] = useState('code');

  const activeStat = Object.values(STATS).find(s => s.id === activeTab);
  const currentLevel = statLevels[activeTab] || 0;
  const perks = CENTRALIZED_PERKS[activeTab] || [];
  const ActiveIcon = STAT_ICONS[activeTab] || Target;

  const freedomScore = useSovereignStore(state => state.freedomScore || 0);
  const integrity = useSovereignStore(state => state.integrity || 100);

  const currentRank = useMemo(() => {
    return getRank(freedomScore);
  }, [freedomScore]);

  const radarData = useMemo(() => {
    return Object.values(STATS).filter(s => !['freedom', 'sovereignty'].includes(s.id)).map(s => ({
      subject: s.name,
      level: statLevels[s.id] || 0,
      fullMark: 100
    }));
  }, [statLevels]);

  const growthData = useMemo(() => {
    // Group activityLog by day
    const days: Record<string, number> = {};
    const now = new Date();
    for (let i = 14; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      days[d.toISOString().split('T')[0]] = 0;
    }

    if (!activityLog || !Array.isArray(activityLog)) return Object.entries(days).map(([date, xp]) => ({
      date: date.split('-').slice(1).join('/'),
      xp
    }));

    activityLog.forEach(log => {
      const date = log.timestamp.split('T')[0];
      if (days[date] !== undefined) {
        days[date] += log.xp;
      }
    });

    return Object.entries(days).map(([date, xp]) => ({
      date: date.split('-').slice(1).join('/'),
      xp
    }));
  }, [activityLog]);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-7xl mx-auto pb-20">

      {/* F1: Cinematic Header */}
      <div className="mb-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3 mb-3"
            >
              <span className="w-8 h-px bg-[var(--stat-brand)]" />
              <span className="font-mono text-[10px] tracking-[0.4em] text-[var(--stat-brand)] uppercase font-black">Capability Management</span>
            </motion.div>
            <h1 className="font-mono text-5xl font-black tracking-tighter text-white uppercase italic">
              Neural <span className="text-white/20">Progression</span>
            </h1>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="bg-white/5 border border-white/10 rounded-2xl px-6 py-4 backdrop-blur-sm">
              <span className="block font-mono text-[9px] text-white/40 uppercase mb-1 tracking-widest font-black">Freedom Index</span>
              <div className="font-mono text-2xl font-black text-white">{freedomScore.toFixed(1)}<span className="text-xs text-white/20 font-light underline-offset-4 ml-1">SCORE</span></div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl px-6 py-4 backdrop-blur-sm">
              <span className="block font-mono text-[9px] text-white/40 uppercase mb-1 tracking-widest font-black">Integrity Index</span>
              <div className="font-mono text-2xl font-black text-[var(--stat-spirit)]">{integrity}<span className="text-xs text-white/20 font-light ml-1">%</span></div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl px-6 py-4 backdrop-blur-sm">
              <span className="block font-mono text-[9px] text-white/40 uppercase mb-1 tracking-widest font-black">Neural Rank</span>
              <div className="font-mono text-2xl font-black" style={{ color: currentRank.color }}>{currentRank.name.toUpperCase()}</div>
            </div>
          </div>
        </div>
      </div>

      {/* F2: Interactive Capability Ribbon */}
      <div className="flex gap-4 overflow-x-auto pb-8 mb-4 no-scrollbar">
        {Object.values(STATS).filter(s => s.id !== 'freedom').map(stat => {
          const level = statLevels[stat.id] || 1;
          const isActive = activeTab === stat.id;
          const Icon = STAT_ICONS[stat.id] || Target;
          return (
            <button
              key={stat.id}
              onClick={() => setActiveTab(stat.id)}
              className={cn(
                "group relative min-w-[180px] p-5 rounded-3xl border transition-all duration-500 overflow-hidden",
                isActive
                  ? "bg-white border-white scale-105 shadow-[0_20px_40px_rgba(255,255,255,0.1)]"
                  : "bg-white/[0.03] border-white/5 hover:border-white/20"
              )}
            >
              {/* Stat Icon Indicator */}
              <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center mb-6 transition-colors",
                isActive ? "bg-black text-white" : "bg-white/5 text-white/60 group-hover:text-white"
              )}>
                <Icon size={20} />
              </div>

              <div className="relative z-10 text-left">
                <div className={cn(
                  "font-mono text-[9px] uppercase tracking-[0.2em] font-black mb-1 opacity-60",
                  isActive ? "text-black" : "text-white"
                )}>{stat.name}</div>
                <div className={cn(
                  "font-mono text-2xl font-black italic",
                  isActive ? "text-black" : "text-white"
                )}>LVL {level}</div>
              </div>

              {/* Progress Line */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/10">
                <motion.div
                  className="h-full bg-black/40"
                  initial={{ width: 0 }}
                  animate={{ width: isActive ? '100%' : '30%' }}
                />
              </div>

              {isActive && (
                <motion.div
                  layoutId="glow"
                  className="absolute inset-0 bg-white shadow-[0_0_40px_white] -z-10 opacity-30 blur-2xl"
                />
              )}
            </button>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

        {/* F3: Capability Tree (Center-Left) */}
        <div className="lg:col-span-7 space-y-8">
          <div className="bg-white/[0.02] border border-white/5 rounded-[40px] p-8 md:p-12 relative overflow-hidden group">
            {/* Background Decoration */}
            <div className="absolute top-0 right-0 p-12 opacity-[0.02] pointer-events-none group-hover:scale-110 transition-transform duration-1000 rotate-12">
              <div className="scale-[10] opacity-5 translate-x-20 translate-y-20 flex"><ActiveIcon size={40} /></div>
            </div>

            <div className="relative z-10 flex items-center justify-between mb-12">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-2xl bg-white text-black flex items-center justify-center shadow-2xl">
                  <ActiveIcon size={28} />
                </div>
                <div>
                  <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter">{(activeStat as any)?.name} Protocol</h3>
                  <p className="font-mono text-[10px] text-white/40 uppercase tracking-[0.2em] mt-1 font-black">Neural Architecture System A.I-7</p>
                </div>
              </div>
              <div className="text-right">
                <div className="font-mono text-[9px] text-white/20 uppercase tracking-widest font-black mb-1">Efficiency</div>
                <div className="font-mono text-xl font-bold text-[var(--success)]">100%</div>
              </div>
            </div>

            {/* Enhanced Perk Path */}
            <div className="relative space-y-12 pl-6">
              {/* Connection Line */}
              <div className="absolute left-6 top-8 bottom-8 w-px bg-gradient-to-b from-white/20 via-white/5 to-transparent" />

              {perks.map((perk, idx) => {
                const unlocked = currentLevel >= perk.level;
                return (
                  <motion.div
                    key={perk.level}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className={cn(
                      "relative flex gap-10 items-start transition-all duration-300",
                      unlocked ? "opacity-100" : "opacity-30 grayscale blur-[1px] hover:blur-0 hover:opacity-100 hover:grayscale-0"
                    )}
                  >
                    <div className={cn(
                      "mt-1 w-1 w-5 h-5 rounded-full border-2 border-[#111] z-10 flex items-center justify-center transition-all duration-500",
                      unlocked ? "bg-white shadow-[0_0_20px_white]" : "bg-white/5 border-white/20"
                    )}>
                      {unlocked && <div className="w-1.5 h-1.5 bg-black rounded-full" />}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={cn(
                          "font-mono text-[9px] tracking-[0.2em] px-2 py-0.5 rounded border font-black uppercase",
                          unlocked ? "bg-white/10 border-white/20 text-white" : "text-white/20 border-white/5"
                        )}>Level {perk.level} Requirement</span>
                        {unlocked && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="text-[var(--success)]"
                          >
                            <Star size={10} fill="currentColor" />
                          </motion.div>
                        )}
                      </div>
                      <h4 className="text-xl font-black text-white leading-tight uppercase mb-1">{perk.name}</h4>
                      <p className="text-xs text-white/40 leading-relaxed max-w-md font-medium">{perk.desc}</p>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>

          {/* F4: Action Heatmap Integration */}
          <InteractiveHeatmap entries={activityLog} />
        </div>

        {/* F5: Statistics Dashboards (Right) */}
        <div className="lg:col-span-5 space-y-8">

          {/* Radar Capability Snapshot */}
          <div className="bg-white/[0.03] border border-white/10 rounded-[40px] p-8 pb-4 relative overflow-hidden backdrop-blur-md shadow-2xl">
            <div className="flex justify-between items-center mb-8">
              <h3 className="font-mono text-[10px] tracking-[0.3em] text-white/40 uppercase font-black">Capability Radar</h3>
              <Award size={16} className="text-white/20" />
            </div>

            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                  <PolarGrid stroke="white" strokeOpacity={0.05} />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: 'white', fontSize: 9, fontFamily: 'Geist Mono', fontWeight: 'bold', opacity: 0.4 }} />
                  <Radar
                    name="Capabilities"
                    dataKey="level"
                    stroke="white"
                    fill="white"
                    fillOpacity={0.1}
                    animationBegin={400}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-8">
              <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                <span className="block font-mono text-[8px] text-white/20 uppercase mb-1 tracking-widest font-black">System Rating</span>
                <div className="font-mono text-xl font-black text-white">{(Number(freedomScore) * 1.5).toFixed(1)}</div>
              </div>
              <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                <span className="block font-mono text-[8px] text-white/20 uppercase mb-1 tracking-widest font-black">Aggregated XP</span>
                <div className="font-mono text-xl font-black text-white">{(Object.values(statLevels).reduce((a, b) => a + (b as number), 0) * 120).toLocaleString()}</div>
              </div>
            </div>
          </div>

          {/* Growth History Line Chart */}
          <div className="bg-white/[0.03] border border-white/10 rounded-[40px] p-8 relative overflow-hidden backdrop-blur-md shadow-2xl">
            <div className="flex justify-between items-center mb-10">
              <h3 className="font-mono text-[10px] tracking-[0.3em] text-white/40 uppercase font-black">XP Trajectory / 14 Day</h3>
              <TrendingUp size={16} className="text-white/20" />
            </div>

            <div className="h-[200px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={growthData}>
                  <defs>
                    <linearGradient id="growthGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="white" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="white" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" hide />
                  <YAxis hide />
                  <Tooltip contentStyle={{ backgroundColor: '#000', border: '1px solid #333', fontSize: '10px' }} />
                  <Area
                    type="monotone"
                    dataKey="xp"
                    stroke="white"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#growthGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="flex items-center justify-between mt-auto pt-6 border-t border-white/5">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[var(--stat-brand)]" />
                <span className="font-mono text-[9px] text-white uppercase tracking-widest font-bold">Projected Mastery</span>
              </div>
              <span className="font-mono text-[9px] text-white/20 uppercase tracking-widest">Q3 2026_EXPECTED</span>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
