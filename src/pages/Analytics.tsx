import { useState, useMemo } from 'react';
import { useSovereignStore } from '../store/sovereign';
import { 
  TrendingUp, Target, 
  Brain, Users, Zap, Coins,
  Shield
} from 'lucide-react';
import { 
  AreaChart, Area, BarChart, Bar, 
  XAxis, YAxis, Tooltip, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, Radar,
  PieChart as RePieChart, Pie, Cell,
  LineChart, Line
} from 'recharts';
import { cn } from '../lib/utils';
import { STATS, xpForLevel } from '../lib/constants';
import { motion, AnimatePresence } from 'framer-motion';
import { ParallelLifeCalculator } from '../components/psych/ParallelLifeCalculator';

const TABS = [
  { id: 'overview', label: 'EXECUTIVE OVERVIEW', icon: Shield },
  { id: 'progression', label: 'XP & PROGRESSION', icon: TrendingUp },
  { id: 'financial', label: 'FINANCIAL INTEL', icon: Coins },
  { id: 'missions', label: 'MISSION INTEL', icon: Target },
  { id: 'wellness', label: 'MIND & WELLNESS', icon: Brain },
  { id: 'network', label: 'NETWORK & OPS', icon: Users },
];

export default function Analytics() {
  const [activeTab, setActiveTab] = useState('overview');
  const store = useSovereignStore();

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-7xl mx-auto pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <div className="flex items-center gap-3 mb-3">
             <span className="w-8 h-px bg-[var(--stat-brand)]" />
             <span className="font-mono text-[10px] tracking-[0.4em] text-[var(--stat-brand)] uppercase font-black">Central Intelligence</span>
          </div>
          <h1 className="font-mono text-5xl font-black tracking-tighter text-white uppercase italic">
            Command <span className="text-white/20">Analytics</span>
          </h1>
        </div>
      </div>

      {/* Tab Ribbon */}
      <div className="flex gap-2 overflow-x-auto pb-8 mb-4 no-scrollbar">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
               "flex items-center gap-3 px-6 py-3 rounded-2xl font-mono text-[10px] tracking-widest uppercase transition-all whitespace-nowrap border",
               activeTab === tab.id 
                 ? "bg-white text-black border-white shadow-[0_0_20px_rgba(255,255,255,0.2)]" 
                 : "bg-white/5 text-white/40 border-white/5 hover:border-white/10"
            )}
          >
            <tab.icon size={14} />
            {tab.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'overview' && <OverviewTab store={store} />}
          {activeTab === 'progression' && <ProgressionTab store={store} />}
          {activeTab === 'missions' && <MissionTab store={store} />}
          {activeTab === 'financial' && <FinancialTab store={store} />}
          {activeTab === 'wellness' && <MindTab store={store} />}
          {activeTab === 'network' && <NetworkTab store={store} />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function OverviewTab({ store }: { store: any }) {
  const { freedomScore, gold, activityLog, statLevels, snapshotHistory, accountabilityScore } = store;

  const radarData = useMemo(() => {
    return Object.values(STATS).filter((s: any) => s.id !== 'freedom').map((s: any) => ({
      subject: s.name,
      level: statLevels[s.id] || 0,
    }));
  }, [statLevels]);

  const trajectoryData = useMemo(() => {
    return (snapshotHistory || []).slice(-30).map((s: any) => ({
      date: s.date ? s.date.split('-').slice(1).join('/') : '--/--',
      score: s.freedomScore || 0
    }));
  }, [snapshotHistory]);

  const weeklyData = useMemo(() => {
    const last7Days = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return d.toISOString().split('T')[0];
    });

    return last7Days.map(date => {
      const xp = activityLog
        .filter((l: any) => l.timestamp.startsWith(date))
        .reduce((sum: number, l: any) => sum + l.xp, 0);
      return { name: date.split('-')[2], xp };
    });
  }, [activityLog]);

  const todayXP = activityLog
    .filter((log: any) => log.timestamp.startsWith(new Date().toISOString().split('T')[0]))
    .reduce((sum: number, log: any) => sum + log.xp, 0);

  return (
    <div className="space-y-8">
      {/* Top Summaries */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         <MetricCard label="Freedom Index" value={freedomScore.toFixed(1)} sub="Global Capability" icon={Shield} color="var(--stat-brand)" />
         <MetricCard label="Daily Yield" value={`${todayXP}`} sub="XP Volume" icon={Zap} color="var(--success)" />
         <MetricCard label="Market Capital" value={`${gold.toLocaleString()}`} sub="Current Balance" icon={Coins} color="var(--stat-wealth)" />
      </div>

      {/* Phase 3: Divergence Audit */}
      <ParallelLifeCalculator />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Trajectory */}
        <div className="lg:col-span-8 bg-white/[0.03] border border-white/10 rounded-[40px] p-8 relative overflow-hidden backdrop-blur-md">
           <div className="flex justify-between items-center mb-8">
              <h3 className="font-mono text-[9px] tracking-[0.3em] text-white/40 uppercase font-black">Freedom Trajectory / 30D</h3>
              <div className="flex items-center gap-2">
                 <span className="w-2 h-2 rounded-full bg-[var(--stat-brand)]" />
                 <span className="font-mono text-[10px] text-white/60">ACTIVE PROTOCOL</span>
              </div>
           </div>
           <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                 <AreaChart data={trajectoryData}>
                    <defs>
                       <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="var(--stat-brand)" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="var(--stat-brand)" stopOpacity={0}/>
                       </linearGradient>
                    </defs>
                    <XAxis dataKey="date" hide />
                    <YAxis domain={['dataMin - 5', 'dataMax + 5']} hide />
                    <Tooltip contentStyle={{ backgroundColor: '#000', border: '1px solid #333', fontSize: '10px' }} />
                    <Area type="monotone" dataKey="score" stroke="var(--stat-brand)" strokeWidth={3} fillOpacity={1} fill="url(#scoreGradient)" />
                 </AreaChart>
              </ResponsiveContainer>
           </div>
        </div>

        {/* Radar and accountability */}
        <div className="lg:col-span-4 space-y-8">
           <div className="bg-white/[0.03] border border-white/10 rounded-[40px] p-8 flex flex-col items-center justify-center relative overflow-hidden backdrop-blur-md">
              <h3 className="absolute top-8 left-8 font-mono text-[9px] tracking-[0.3em] text-white/40 uppercase font-black">Stability Radar</h3>
              <div className="h-[220px] w-full mt-4">
                 <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                       <PolarGrid stroke="white" strokeOpacity={0.05} />
                       <PolarAngleAxis dataKey="subject" tick={{ fill: 'white', fontSize: 8, opacity: 0.3 }} />
                       <Radar name="Status" dataKey="level" stroke="white" fill="white" fillOpacity={0.1} />
                    </RadarChart>
                 </ResponsiveContainer>
              </div>
           </div>

           <div className="bg-white/[0.03] border border-white/10 rounded-[40px] p-6">
              <div className="flex justify-between items-center mb-4">
                 <span className="font-mono text-[9px] text-white/40 uppercase font-black tracking-widest">Accountability</span>
                 <span className={cn("font-mono text-xs font-bold", accountabilityScore > 70 ? "text-[var(--success)]" : "text-[var(--danger)]")}>{accountabilityScore}%</span>
              </div>
              <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                 <motion.div 
                   className="h-full bg-white/40"
                   initial={{ width: 0 }}
                   animate={{ width: `${accountabilityScore}%` }}
                 />
              </div>
           </div>
        </div>

        {/* Weekly Histogram */}
        <div className="lg:col-span-12 bg-white/[0.03] border border-white/10 rounded-[40px] p-8">
           <div className="flex justify-between items-center mb-8">
              <h3 className="font-mono text-[9px] tracking-[0.3em] text-white/40 uppercase font-black">Weekly Engagement / XP Vol</h3>
           </div>
           <div className="h-[150px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                 <BarChart data={weeklyData}>
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#666', fontFamily: 'Geist Mono' }} />
                    <Tooltip contentStyle={{ backgroundColor: '#111', border: '1px solid #222' }} cursor={{ fill: 'white', opacity: 0.05 }} />
                    <Bar dataKey="xp" fill="white" fillOpacity={0.1} radius={[4, 4, 0, 0]} />
                 </BarChart>
              </ResponsiveContainer>
           </div>
        </div>
      </div>
    </div>
  );
}

function ProgressionTab({ store }: { store: any }) {
  const { activityLog, statLevels, statXP } = store;

  const stackData = useMemo(() => {
    const last30Days = Array.from({ length: 30 }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (29 - i));
      return d.toISOString().split('T')[0];
    });

    return last30Days.map(date => {
      const dayLogs = activityLog.filter((l: any) => l.timestamp.startsWith(date));
      const entry: any = { date: date.split('-').slice(1).join('/') };
      Object.keys(STATS).filter(id => id !== 'freedom').forEach(id => {
        entry[id] = dayLogs.filter((l: any) => l.statId === id).reduce((sum: number, l: any) => sum + l.xp, 0);
      });
      return entry;
    });
  }, [activityLog]);

  return (
    <div className="space-y-8">
      <div className="bg-white/[0.03] border border-white/10 rounded-[40px] p-8">
         <h3 className="font-mono text-[9px] tracking-[0.3em] text-white/40 uppercase font-black mb-8">Skill Accumulation / Cumulative Growth</h3>
         <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
               <AreaChart data={stackData}>
                  <XAxis dataKey="date" tick={{ fontSize: 9, opacity: 0.3 }} axisLine={false} tickLine={false} />
                  <YAxis hide />
                  <Tooltip contentStyle={{ backgroundColor: '#111', border: '1px solid #333', fontSize: '10px' }} />
                  {Object.keys(STATS).filter(id => id !== 'freedom').map(id => (
                    <Area 
                      key={id} 
                      type="monotone" 
                      dataKey={id} 
                      stackId="1" 
                      stroke={STATS[id].colorVar} 
                      fill={STATS[id].colorVar} 
                      fillOpacity={0.1} 
                    />
                  ))}
               </AreaChart>
            </ResponsiveContainer>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         {Object.values(STATS).filter((s: any) => s.id !== 'freedom').map((stat: any) => {
           const currentLevel = statLevels[stat.id] || 1;
           const currentLevelXP = xpForLevel(currentLevel);
           const nextXP = xpForLevel(currentLevel + 1);
           const currentXP = statXP[stat.id] || 0;
           const progressXP = Math.max(0, currentXP - currentLevelXP);
           const totalNeeded = Math.max(1, nextXP - currentLevelXP);
           const progress = (progressXP / totalNeeded) * 100;
           
           return (
             <div key={stat.id} className="bg-white/[0.03] border border-white/10 rounded-3xl p-6">
                <div className="flex justify-between items-center mb-4">
                   <span className="font-mono text-[9px] text-white/40 uppercase tracking-widest font-black">{stat.name} Progress</span>
                   <span className="font-mono text-[10px] text-white">LV. {currentLevel}</span>
                </div>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                   <div 
                     className="h-full bg-white/40" 
                     style={{ width: `${Math.min(progress, 100)}%` }}
                   />
                </div>
                <div className="mt-2 text-right">
                   <span className="font-mono text-[8px] text-white/20 uppercase">{Math.floor(progressXP).toLocaleString()} / {totalNeeded.toLocaleString()} XP</span>
                </div>
             </div>
           );
         })}
      </div>
    </div>
  );
}

function MissionTab({ store }: { store: any }) {
  const { dailyQuests } = store;

  const questStats = useMemo(() => {
    const completed = (dailyQuests || []).filter((q: any) => q.completed).length;
    const total = (dailyQuests || []).length;
    return { completed, total, rate: total > 0 ? (completed / total) * 100 : 0 };
  }, [dailyQuests]);

  const difficultyData = useMemo(() => {
    const counts: any = { easy: 0, medium: 0, hard: 0, legendary: 0 };
    (dailyQuests || []).forEach((q: any) => { counts[q.difficulty || 'medium']++; });
    return Object.entries(counts).map(([name, value]) => ({ name: name.toUpperCase(), value }));
  }, [dailyQuests]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
       <div className="lg:col-span-4 bg-white/[0.03] border border-white/10 rounded-[40px] p-8 flex flex-col items-center justify-center">
          <h3 className="font-mono text-[9px] tracking-[0.3em] text-white/40 uppercase font-black mb-8">Daily Completion</h3>
          <div className="relative w-48 h-48 flex items-center justify-center">
             <div className="text-4xl font-black font-mono text-white">{questStats.completed}<span className="text-sm text-white/20">/{questStats.total}</span></div>
             <svg className="absolute inset-0 w-full h-full -rotate-90">
                <circle cx="96" cy="96" r="80" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-white/5" />
                <circle 
                  cx="96" cy="96" r="80" stroke="currentColor" strokeWidth="8" fill="transparent" 
                  strokeDasharray={2 * Math.PI * 80} 
                  strokeDashoffset={2 * Math.PI * 80 * (1 - questStats.rate / 100)}
                  className="text-white transition-all duration-1000" 
                />
             </svg>
          </div>
       </div>

       <div className="lg:col-span-8 bg-white/[0.03] border border-white/10 rounded-[40px] p-8">
          <h3 className="font-mono text-[9px] tracking-[0.3em] text-white/40 uppercase font-black mb-8">Difficulty Distribution</h3>
          <div className="h-[250px] w-full">
             <ResponsiveContainer width="100%" height="100%">
                <RePieChart>
                   <Pie
                     data={difficultyData}
                     cx="50%" cy="50%"
                     innerRadius={60}
                     outerRadius={80}
                     paddingAngle={5}
                     dataKey="value"
                   >
                      <Cell fill="var(--success)" opacity={0.3} />
                      <Cell fill="var(--stat-brand)" opacity={0.5} />
                      <Cell fill="var(--danger)" opacity={0.7} />
                      <Cell fill="white" opacity={0.9} />
                   </Pie>
                   <Tooltip />
                </RePieChart>
             </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-6 mt-4">
             {difficultyData.map((d, i) => (
               <div key={d.name} className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: i === 0 ? 'var(--success)' : i === 1 ? 'var(--stat-brand)' : i === 2 ? 'var(--danger)' : 'white' }} />
                  <span className="font-mono text-[8px] text-white/40">{d.name}</span>
               </div>
             ))}
          </div>
       </div>
    </div>
  );
}

function FinancialTab({ store }: { store: any }) {
  const { transactions, portfolios, financialGoals } = store;

  const netWorthData = useMemo(() => {
    let balance = portfolios.reduce((sum: number, p: any) => sum + (p.balance || 0), 0);
    const last30Days = Array.from({ length: 30 }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (29 - i));
      return d.toISOString().split('T')[0];
    });

    const data = [];
    const sortedTxs = [...transactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    for (const date of last30Days) {
      const dayTxs = sortedTxs.filter(t => t.date.startsWith(date));
      const net = dayTxs.reduce((sum, t) => sum + (t.type === 'income' ? -t.amount : t.amount), 0);
      balance -= net;
      data.push({ date: date.split('-').slice(1).join('/'), balance });
    }
    return data;
  }, [transactions, portfolios]);

  const incomeVsExpense = useMemo(() => {
    const months = Array.from({ length: 6 }).map((_, i) => {
      const d = new Date();
      d.setMonth(d.getMonth() - (5 - i));
      return d.toISOString().slice(0, 7);
    });

    return months.map(m => {
      const monthTxs = transactions.filter((t: any) => t.date.startsWith(m));
      const income = monthTxs.filter((t: any) => t.type === 'income').reduce((sum: number, t: any) => sum + t.amount, 0);
      const expense = monthTxs.filter((t: any) => t.type === 'expense').reduce((sum: number, t: any) => sum + t.amount, 0);
      return { name: m, income, expense };
    });
  }, [transactions]);

  return (
    <div className="space-y-8">
       <div className="bg-white/[0.03] border border-white/10 rounded-[40px] p-8">
          <h3 className="font-mono text-[9px] tracking-[0.3em] text-white/40 uppercase font-black mb-8">Net Worth Trajectory / Global Liquidity</h3>
          <div className="h-[300px] w-full">
             <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={netWorthData}>
                   <defs>
                      <linearGradient id="netWorthGradient" x1="0" y1="0" x2="0" y2="1">
                         <stop offset="5%" stopColor="var(--stat-wealth)" stopOpacity={0.2}/>
                         <stop offset="95%" stopColor="var(--stat-wealth)" stopOpacity={0}/>
                      </linearGradient>
                   </defs>
                   <XAxis dataKey="date" hide />
                   <YAxis hide />
                   <Tooltip />
                   <Area type="monotone" dataKey="balance" stroke="var(--stat-wealth)" strokeWidth={2} fillOpacity={1} fill="url(#netWorthGradient)" />
                </AreaChart>
             </ResponsiveContainer>
          </div>
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white/[0.03] border border-white/10 rounded-[40px] p-8">
             <h3 className="font-mono text-[9px] tracking-[0.3em] text-white/40 uppercase font-black mb-8">Cash Flow / Monthly Yield</h3>
             <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                   <BarChart data={incomeVsExpense}>
                      <XAxis dataKey="name" tick={{ fontSize: 9, opacity: 0.3 }} />
                      <Tooltip />
                      <Bar dataKey="income" fill="var(--success)" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="expense" fill="var(--danger)" radius={[4, 4, 0, 0]} />
                   </BarChart>
                </ResponsiveContainer>
             </div>
          </div>

          <div className="bg-white/[0.03] border border-white/10 rounded-[40px] p-8">
             <h3 className="font-mono text-[9px] tracking-[0.3em] text-white/40 uppercase font-black mb-8">Financial Objectives</h3>
             <div className="space-y-6">
                {(financialGoals || []).map((goal: any) => (
                  <div key={goal.id} className="space-y-2">
                     <div className="flex justify-between items-center text-[10px] font-mono">
                        <span className="text-white font-bold">{goal.name.toUpperCase()}</span>
                        <span className="text-white/40">{((goal.currentAmount / goal.targetAmount) * 100).toFixed(0)}%</span>
                     </div>
                     <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-[var(--stat-wealth)]" 
                          style={{ width: `${Math.min((goal.currentAmount / goal.targetAmount) * 100, 100)}%` }}
                        />
                     </div>
                  </div>
                ))}
             </div>
          </div>
       </div>
    </div>
  );
}

function MindTab({ store }: { store: any }) {
  const { moodHistory, journalEntries, knowledgeCards } = store;

  const moodData = useMemo(() => {
    return (moodHistory || []).slice(-14).map((m: any) => ({
      date: m.timestamp ? m.timestamp.split('T')[0].split('-').slice(1).join('/') : '--/--',
      intensity: m.intensity || 5
    }));
  }, [moodHistory]);

  const journalData = useMemo(() => {
    const last30Days = Array.from({ length: 30 }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (29 - i));
      return d.toISOString().split('T')[0];
    });

    return last30Days.map(date => ({
      date: date.split('-')[2],
      count: (journalEntries || []).filter((e: any) => e.date === date).length
    }));
  }, [journalEntries]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
       <div className="lg:col-span-8 bg-white/[0.03] border border-white/10 rounded-[40px] p-8">
          <h3 className="font-mono text-[9px] tracking-[0.3em] text-white/40 uppercase font-black mb-8">Psychological Flux / Mood Variance</h3>
          <div className="h-[250px] w-full">
             <ResponsiveContainer width="100%" height="100%">
                <LineChart data={moodData}>
                   <XAxis dataKey="date" tick={{ fontSize: 9, opacity: 0.3 }} />
                   <Tooltip />
                   <Line type="monotone" dataKey="intensity" stroke="var(--stat-mind)" strokeWidth={3} dot={{ fill: 'var(--stat-mind)', r: 4 }} />
                </LineChart>
             </ResponsiveContainer>
          </div>
       </div>

       <div className="lg:col-span-4 bg-white/[0.03] border border-white/10 rounded-[40px] p-8">
          <h3 className="font-mono text-[9px] tracking-[0.3em] text-white/40 uppercase font-black mb-8">Mastery Status</h3>
          <div className="space-y-4">
             <div className="flex justify-between items-center font-mono text-[10px]">
                <span className="text-white/40 uppercase">Cognitive Units</span>
                <span className="text-white">{(knowledgeCards || []).length}</span>
             </div>
             <div className="flex justify-between items-center font-mono text-[10px]">
                <span className="text-white/40 uppercase">Journal Entries</span>
                <span className="text-white">{(journalEntries || []).length}</span>
             </div>
          </div>
       </div>

       <div className="lg:col-span-12 bg-white/[0.03] border border-white/10 rounded-[40px] p-8">
          <h3 className="font-mono text-[9px] tracking-[0.3em] text-white/40 uppercase font-black mb-8">Journal Frequency / Activity</h3>
          <div className="h-[120px] w-full">
             <ResponsiveContainer width="100%" height="100%">
                <BarChart data={journalData}>
                   <Bar dataKey="count" fill="var(--stat-mind)" fillOpacity={0.2} radius={[4, 4, 0, 0]} />
                </BarChart>
             </ResponsiveContainer>
          </div>
       </div>
    </div>
  );
}

function NetworkTab({ store }: { store: any }) {
  const { jobApplications, ventures, nexusContacts } = store;

  const funnelData = useMemo(() => {
    const stages = ['applied', 'interviewing', 'offer', 'rejected'];
    return stages.map(stage => ({
      name: stage.toUpperCase(),
      count: (jobApplications || []).filter((a: any) => a.status === stage).length
    }));
  }, [jobApplications]);

  return (
    <div className="space-y-8">
       <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white/[0.03] border border-white/10 rounded-[40px] p-8">
             <h3 className="font-mono text-[9px] tracking-[0.3em] text-white/40 uppercase font-black mb-8">Recruitment Funnel / Pipeline</h3>
             <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                   <BarChart data={funnelData} layout="vertical">
                      <XAxis type="number" hide />
                      <YAxis type="category" dataKey="name" tick={{ fontSize: 9, fill: 'white', opacity: 0.4 }} width={100} axisLine={false} tickLine={false} />
                      <Tooltip />
                      <Bar dataKey="count" fill="white" fillOpacity={0.1} radius={[0, 4, 4, 0]} />
                   </BarChart>
                </ResponsiveContainer>
             </div>
          </div>

          <div className="bg-white/[0.03] border border-white/10 rounded-[40px] p-8">
             <h3 className="font-mono text-[9px] tracking-[0.3em] text-white/40 uppercase font-black mb-8">Venture Performance</h3>
             <div className="space-y-4">
                {(ventures || []).map((v: any) => (
                   <div key={v.id} className="flex justify-between items-center p-4 bg-white/5 rounded-2xl border border-white/5">
                      <div className="flex flex-col">
                         <span className="font-mono text-[10px] text-white font-bold">{v.name.toUpperCase()}</span>
                         <span className="font-mono text-[8px] text-white/20 uppercase">{v.category}</span>
                      </div>
                      <div className="font-mono text-xs text-[var(--success)] font-black italic">
                         +{(v.revenue || 0).toLocaleString()} <span className="text-[10px] opacity-40">GOLD</span>
                      </div>
                   </div>
                ))}
                {(!ventures || ventures.length === 0) && (
                  <div className="h-40 flex items-center justify-center opacity-20 font-mono text-[9px] uppercase italic tracking-[0.4em]">No Live Ventures</div>
                )}
             </div>
          </div>
       </div>

       <div className="bg-white/[0.03] border border-white/10 rounded-[40px] p-8">
          <h3 className="font-mono text-[9px] tracking-[0.3em] text-white/40 uppercase font-black mb-8">Nexus Connectivity / Audience Growth</h3>
          <div className="flex items-center gap-12">
             <div>
                <div className="font-mono text-4xl font-black text-white">{(nexusContacts || []).length}</div>
                <div className="font-mono text-[9px] text-white/40 uppercase tracking-widest">Active nodes</div>
             </div>
             <div className="flex-1 h-px bg-white/10" />
             <div className="text-right">
                <div className="font-mono text-xs text-white/40 uppercase">Integration Integrity</div>
                <div className="font-mono text-sm text-[var(--stat-brand)] font-black">STABLE</div>
             </div>
          </div>
       </div>
    </div>
  );
}

function MetricCard({ label, value, sub, icon: Icon, color }: any) {
  return (
    <div className="bg-white/[0.03] border border-white/10 rounded-[32px] p-8 relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-6 opacity-5 rotate-12 group-hover:scale-110 transition-transform">
        <Icon size={80} />
      </div>
      <div className="relative z-10">
        <span className="block font-mono text-[9px] text-white/40 uppercase tracking-[0.3em] mb-4 font-black">{label}</span>
        <div className="font-mono text-4xl font-black text-white mb-2">{value}</div>
        <div className="flex items-center gap-2">
           <span className="font-mono text-[9px] uppercase tracking-widest font-bold" style={{ color }}>{sub}</span>
        </div>
      </div>
    </div>
  );
}
