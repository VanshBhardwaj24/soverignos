import React, { useMemo } from 'react';
import { 
  ComposedChart, 
  Area, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  ReferenceDot
} from 'recharts';
import { useSovereignStore } from '../../store/sovereign';
import { cn } from '../../lib/utils';

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const actual = payload.find((p: any) => p.dataKey === 'xp')?.value || 0;
    const projection = payload.find((p: any) => p.dataKey === 'projection')?.value || 0;
    const gap = projection - actual;

    return (
      <div className="p-4 bg-black/90 border border-white/10 rounded-2xl backdrop-blur-xl shadow-2xl">
        <p className="font-bold text-[10px] text-white/40 uppercase mb-2">Day {label}</p>
        <div className="space-y-1">
          <div className="flex justify-between gap-8">
            <span className="text-blue-400 font-bold text-xs">ACTUAL</span>
            <span className="text-white font-bold">{actual} XP</span>
          </div>
          <div className="flex justify-between gap-8">
            <span className="text-purple-400 font-bold text-xs">CONSISTENT YOU</span>
            <span className="text-white font-bold">{projection} XP</span>
          </div>
          <div className="pt-2 mt-2 border-t border-white/5 flex justify-between gap-8">
            <span className="text-[var(--text-secondary)] font-bold text-xs">THE GAP</span>
            <span className={cn("font-bold", gap > 0 ? "text-red-400" : "text-emerald-400")}>
              {gap > 0 ? `-${gap}` : `+${Math.abs(gap)}`} XP
            </span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export const IntelligenceChart = () => {
  const { activityLog, projections } = useSovereignStore();
  const [range, setRange] = React.useState(30);

  const chartData = useMemo(() => {
    const data = activityLog.slice(-range).map((log, i) => {
      const projection = projections?.[i]?.xp || 0;
      return {
        name: i,
        xp: log?.xp || 0,
        projection: projection,
        trajectory: projection * 0.9,
        isAnomaly: (log?.xp || 0) < 50 || (log?.xp || 0) > 300,
      };
    });
    return data;
  }, [activityLog, projections, range]);

  const gapStats = useMemo(() => {
    if (chartData.length === 0) return { percentage: 0, actual: 0, target: 0 };
    const totalActual = chartData.reduce((sum, d) => sum + d.xp, 0);
    const totalTarget = chartData.reduce((sum, d) => sum + d.projection, 0);
    const percentage = totalTarget > 0 ? Math.round(((totalTarget - totalActual) / totalTarget) * 100) : 0;
    return { percentage, actual: totalActual, target: totalTarget };
  }, [chartData]);

  return (
    <section className="p-8 rounded-3xl border border-[var(--border-default)] bg-white/[0.02] backdrop-blur-xl relative overflow-hidden group h-full">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h2 className="font-bold text-xs tracking-[0.2em] uppercase text-[var(--text-secondary)] mb-1">Intelligence Visualization</h2>
          <div className="flex items-center gap-4 mt-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-0.5 bg-blue-500" />
              <span className="text-[10px] font-bold text-white/60">ACTUAL XP</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-0.5 border-t border-dashed border-purple-500" />
              <span className="text-[10px] font-bold text-white/60">CONSISTENT YOU</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-0.5 border-t border-dashed border-orange-500" />
              <span className="text-[10px] font-bold text-white/60">TRAJECTORY</span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          {[7, 14, 30, 90].map(r => (
            <button 
              key={r} 
              onClick={() => setRange(r)}
              className={cn(
                "px-3 py-1 rounded-lg border font-bold text-[9px] transition-all",
                range === r ? "bg-blue-500/20 border-blue-500 text-blue-400" : "bg-white/5 border-white/10 text-white/40 hover:bg-white/10"
              )}
            >
              {r}D
            </button>
          ))}
        </div>
      </div>

      <div className="h-[400px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData}>
            <defs>
              <linearGradient id="actualXpGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
            <XAxis dataKey="name" hide />
            <YAxis 
              stroke="rgba(255,255,255,0.2)" 
              fontSize={10} 
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `${v}XP`}
            />
            <Tooltip content={<CustomTooltip />} />
            
            <Area type="monotone" dataKey="xp" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#actualXpGradient)" />
            <Line type="monotone" dataKey="projection" stroke="#a855f7" strokeWidth={2} strokeDasharray="5 5" dot={false} />
            <Line type="monotone" dataKey="trajectory" stroke="#f59e0b" strokeWidth={1.5} strokeDasharray="3 3" dot={false} />

            {chartData.map((entry, index) => (
              entry.isAnomaly && (
                <ReferenceDot
                  key={index}
                  x={entry.name}
                  y={entry.xp}
                  r={4}
                  fill={entry.xp > 200 ? "#10b981" : "#ef4444"}
                  stroke="none"
                  className="cursor-pointer hover:scale-150 transition-transform"
                />
              )
            ))}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-6 p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
            <span className="text-[10px] font-black font-bold tracking-widest uppercase">The Gap</span>
          </div>
          <p className="text-[10px] font-bold text-[var(--text-secondary)]">
            You are currently <span className={cn("font-bold", gapStats.percentage > 0 ? "text-red-400" : "text-emerald-400")}>
              {Math.abs(gapStats.percentage)}% {gapStats.percentage > 0 ? "below" : "above"}
            </span> your projected consistency baseline.
          </p>
        </div>
        <button className="text-[10px] font-bold text-blue-400 underline hover:text-blue-300 transition-colors uppercase tracking-widest font-black">
          Gap Mitigation Plan
        </button>
      </div>
    </section>
  );
};
