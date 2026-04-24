import { useState, useMemo } from 'react';
import { useSovereignStore } from '../store/sovereign';
import { Zap, Target, TrendingUp, Star, Award, Terminal, DollarSign, Dumbbell, Brain, Users, Megaphone } from 'lucide-react';
import { SKILL_PERKS as CENTRALIZED_PERKS, STATS, getRank, IDENTITY_FRAMES } from '../lib/constants';
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
  const activeColor = activeStat?.colorVar || 'var(--text-primary)';

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
              <span className="w-8 h-px bg-white/20" />
              <p className="eyebrow text-white/40">Capability Management</p>
            </motion.div>
            <h1 className="h-display italic">
              Neural <span className="text-white/20">Progression</span>
            </h1>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="surface-card px-6 py-4 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-mesh opacity-10" />
              <p className="stat-label mb-1 relative z-10">Freedom Index</p>
              <div className="stat-value text-2xl relative z-10">{freedomScore.toFixed(1)}<span className="stat-label ml-1">SCORE</span></div>
            </div>
            <div className="surface-card px-6 py-4 relative overflow-hidden group">
              <div className="absolute inset-0 bg-noise opacity-5" />
              <p className="stat-label mb-1 relative z-10">Integrity Index</p>
              <div className="stat-value text-2xl text-[var(--stat-spirit)] relative z-10">{integrity}<span className="stat-label text-[var(--stat-spirit)]/50 ml-1">%</span></div>
            </div>
            <div className="surface-card px-6 py-4 relative overflow-hidden group">
              <div className="absolute inset-0 bg-noise opacity-5" />
              <p className="stat-label mb-1 relative z-10">Neural Rank</p>
              <div className="stat-value text-2xl relative z-10" style={{ color: currentRank.color }}>{currentRank.name.toUpperCase()}</div>
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
              aria-label={`View ${stat.name} stats`}
              className={cn(
                "group relative min-w-[180px] p-5 surface-card hover-lift transition-all duration-500 overflow-hidden",
                isActive ? "border-white/30 scale-105" : ""
              )}
            >
              {/* Stat Icon Indicator */}
              <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center mb-6 transition-colors shadow-inner",
                isActive ? "text-white shadow-[0_0_15px_rgba(255,255,255,0.3)]" : "bg-white/5 text-white/60 group-hover:text-white group-hover:bg-white/10"
              )} style={isActive ? { backgroundColor: stat.colorVar, boxShadow: `0 0 20px ${stat.colorVar}` } : {}}>
                <Icon size={20} />
              </div>

              <div className="relative z-10 text-left">
                <p className={cn(
                  "eyebrow mb-1 opacity-60",
                  isActive ? "text-white" : "text-white/60"
                )} style={isActive ? { color: stat.colorVar } : {}}>{stat.name}</p>
                <div className={cn(
                  "stat-value text-2xl italic",
                  isActive ? "text-white" : "text-white/80"
                )}>LVL {level}</div>
              </div>

              {/* Progress Line */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/5">
                <motion.div
                  className="h-full"
                  initial={{ width: 0 }}
                  animate={{ width: isActive ? '100%' : '30%' }}
                  style={{ backgroundColor: isActive ? stat.colorVar : 'rgba(255,255,255,0.2)', boxShadow: isActive ? `0 0 10px ${stat.colorVar}` : 'none' }}
                />
              </div>

              {isActive && (
                <motion.div
                  layoutId="glow"
                  className="absolute inset-0 shadow-[0_0_40px_white] -z-10 opacity-10 blur-2xl pointer-events-none"
                  style={{ backgroundColor: stat.colorVar }}
                />
              )}
            </button>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

        {/* F3: Capability Tree (Center-Left) */}
        <div className="lg:col-span-7 space-y-8">
          <div className="surface-card p-8 md:p-12 relative overflow-hidden group shadow-2xl">
            {/* Background Decoration */}
            <div className="absolute inset-0 bg-noise opacity-5 pointer-events-none" />
            <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none group-hover:scale-110 transition-transform duration-1000 rotate-12">
              <div className="scale-[10] opacity-10 translate-x-20 translate-y-20 flex"><ActiveIcon size={40} /></div>
            </div>

            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-2xl flex items-center justify-center shadow-2xl" style={{ backgroundColor: `color-mix(in srgb, ${activeColor} 20%, transparent)`, color: activeColor, border: `1px solid ${activeColor}` }}>
                  <ActiveIcon size={28} />
                </div>
                <div>
                  <h3 className="h-section text-white italic">{(activeStat as any)?.name} Protocol</h3>
                  <p className="eyebrow mt-1" style={{ color: activeColor }}>
                    {IDENTITY_FRAMES[activeTab]?.identity || "Neural Architecture System A.I-7"}
                  </p>
                </div>
              </div>
              <div className="text-left md:text-right">
                <p className="stat-label mb-1">Efficiency</p>
                <div className="stat-value text-xl" style={{ color: activeColor }}>100%</div>
              </div>
            </div>

            {/* Enhanced Perk Path */}
            <div className="relative space-y-12 pl-6">
              {/* Connection Line */}
              <div className="absolute left-6 top-8 bottom-8 w-1 bg-gradient-to-b from-white/10 via-white/5 to-transparent rounded-full shadow-inner" />

              {perks.map((perk, idx) => {
                const unlocked = currentLevel >= perk.level;
                return (
                  <motion.div
                    key={perk.level}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className={cn(
                      "relative flex gap-10 items-start transition-all duration-300 group",
                      unlocked ? "opacity-100" : "opacity-40 grayscale-[0.8] hover:grayscale-0 hover:opacity-80"
                    )}
                  >
                    <div className={cn(
                      "mt-1 w-5 h-5 rounded-full border-2 z-10 flex items-center justify-center transition-all duration-500 shadow-md",
                      unlocked ? "bg-white" : "bg-[#111] border-white/20"
                    )} style={unlocked ? { backgroundColor: activeColor, borderColor: activeColor, boxShadow: `0 0 20px ${activeColor}` } : {}}>
                      {unlocked && <div className="w-2 h-2 bg-black rounded-full" />}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={cn(
                          "stat-label px-2 py-0.5 rounded border shadow-sm",
                          unlocked ? "bg-white/10 text-white" : "text-white/30 border-white/10 bg-white/5"
                        )} style={unlocked ? { borderColor: activeColor, color: activeColor, backgroundColor: `color-mix(in srgb, ${activeColor} 10%, transparent)` } : {}}>
                          Level {perk.level} requirement
                        </span>
                        {unlocked && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            style={{ color: activeColor }}
                            className="drop-shadow-glow"
                          >
                            <Star size={12} fill="currentColor" />
                          </motion.div>
                        )}
                      </div>
                      <h4 className="h-card text-white leading-tight mb-1 drop-shadow-sm">{perk.name}</h4>
                      <p className="text-xs text-white/50 leading-relaxed max-w-md font-medium">{perk.desc}</p>
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
          <div className="surface-card rounded-[40px] p-8 pb-4 relative overflow-hidden shadow-2xl">
            <div className="absolute inset-0 bg-noise opacity-5 pointer-events-none" />

            <div className="flex justify-between items-center mb-8 relative z-10">
              <div className="flex flex-col gap-1">
                <span className="eyebrow text-[var(--stat-brand)]">{IDENTITY_FRAMES[activeTab]?.identity || 'SYSTEM ANALYSIS'}</span>
                <h3 className="stat-label text-white/80">Capability Radar</h3>
              </div>
              <Award size={16} className="text-white/40" />
            </div>

            <div className="h-[300px] w-full relative z-10">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                  <PolarGrid stroke="rgba(255,255,255,0.1)" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: 'rgba(255,255,255,0.8)', fontSize: 9, fontFamily: 'Geist Mono', fontWeight: 'bold' }} />
                  <Radar
                    name="Capabilities"
                    dataKey="level"
                    stroke={activeColor}
                    fill={activeColor}
                    fillOpacity={0.2}
                    animationBegin={400}
                    style={{ filter: `drop-shadow(0 0 10px ${activeColor})` }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-8 relative z-10">
              <div className="p-4 surface-elevated shadow-inner">
                <span className="stat-label mb-1">System Rating</span>
                <div className="stat-value text-xl text-white drop-shadow-glow">{(Number(freedomScore) * 1.5).toFixed(1)}</div>
              </div>
              <div className="p-4 surface-elevated shadow-inner">
                <span className="stat-label mb-1">Aggregated XP</span>
                <div className="stat-value text-xl text-white drop-shadow-glow">{(Object.values(statLevels).reduce((a, b) => a + (b as number), 0) * 120).toLocaleString()}</div>
              </div>
            </div>
          </div>

          {/* Growth History Line Chart */}
          <div className="surface-card rounded-[40px] p-8 relative overflow-hidden shadow-2xl">
            <div className="absolute inset-0 bg-noise opacity-5 pointer-events-none" />
            <div className="flex justify-between items-center mb-10 relative z-10">
              <h3 className="stat-label text-white/80">XP Trajectory / 14 Day</h3>
              <TrendingUp size={16} className="text-white/40" />
            </div>

            <div className="h-[200px] w-full mt-4 relative z-10">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={growthData}>
                  <defs>
                    <linearGradient id="growthGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={activeColor} stopOpacity={0.4} />
                      <stop offset="95%" stopColor={activeColor} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" hide />
                  <YAxis hide />
                  <Tooltip contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.1)', fontSize: '10px', borderRadius: '8px' }} />
                  <Area
                    type="monotone"
                    dataKey="xp"
                    stroke={activeColor}
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#growthGradient)"
                    style={{ filter: `drop-shadow(0 0 8px ${activeColor})` }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="flex items-center justify-between mt-auto pt-6 border-t border-white/5 relative z-10">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: activeColor, boxShadow: `0 0 5px ${activeColor}` }} />
                <span className="stat-label text-white">Projected Mastery</span>
              </div>
              <span className="stat-label">Q3 2026_EXPECTED</span>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
