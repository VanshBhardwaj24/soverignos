import { useMemo } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import { useSovereignStore } from '../../store/sovereign';
import { STATS } from '../../lib/constants';

export const ThroughputAnalysis = () => {
  const { surveillanceMetrics } = useSovereignStore();
  const breakdown = surveillanceMetrics.breakdown || { byStat: {}, byHour: {}, byDay: {} };

  const statData = useMemo(() => {
    return Object.entries(breakdown.byStat).map(([id, xp]) => ({
      name: STATS[id]?.name || id,
      xp,
      color: STATS[id]?.colorVar || '#fff'
    })).sort((a, b) => (b.xp as number) - (a.xp as number));
  }, [breakdown.byStat]);

  const dayData = useMemo(() => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days.map((name, i) => ({
      name,
      xp: breakdown.byDay[i] || 0
    }));
  }, [breakdown.byDay]);

  return (
    <section className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* By Stat */}
        <div className="p-8 rounded-3xl border border-[var(--border-default)] bg-white/[0.02] backdrop-blur-xl">
          <h3 className="font-mono text-[10px] tracking-widest text-[var(--text-secondary)] uppercase mb-8">Throughput by Stat</h3>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statData} layout="vertical">
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  stroke="rgba(255,255,255,0.3)" 
                  fontSize={10} 
                  width={80}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                  contentStyle={{ backgroundColor: '#000', border: '1px solid #333', borderRadius: '12px', fontSize: '10px' }}
                />
                <Bar dataKey="xp" radius={[0, 4, 4, 0]}>
                  {statData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} fillOpacity={0.6} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* By Day of Week */}
        <div className="p-8 rounded-3xl border border-[var(--border-default)] bg-white/[0.02] backdrop-blur-xl">
          <h3 className="font-mono text-[10px] tracking-widest text-[var(--text-secondary)] uppercase mb-8">Weekly Collapse Analysis</h3>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dayData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" fontSize={10} axisLine={false} tickLine={false} />
                <YAxis stroke="rgba(255,255,255,0.2)" fontSize={10} axisLine={false} tickLine={false} />
                <Tooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                  contentStyle={{ backgroundColor: '#000', border: '1px solid #333', borderRadius: '12px', fontSize: '10px' }}
                />
                <Bar dataKey="xp" fill="#3b82f6" radius={[4, 4, 0, 0]}>
                  {dayData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.xp < 50 ? '#ef4444' : '#3b82f6'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Cognitive Load Heatmap */}
      <div className="p-8 rounded-3xl border border-[var(--border-default)] bg-white/[0.02] backdrop-blur-xl">
        <h3 className="font-mono text-[10px] tracking-widest text-[var(--text-secondary)] uppercase mb-8">Cognitive Load Heatmap (Hourly)</h3>
        <div className="grid grid-cols-24 gap-1 h-12">
          {Array.from({ length: 24 }).map((_, i) => {
            const xp = breakdown.byHour[i] || 0;
            const opacity = Math.min(1, xp / 300);
            return (
              <div 
                key={i} 
                className="group relative h-full rounded-sm bg-blue-500 transition-all hover:scale-110"
                style={{ opacity: 0.05 + (opacity * 0.9) }}
              >
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 p-2 bg-black border border-white/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none font-mono text-[9px]">
                  {i}:00 — {Math.round(xp)} XP
                </div>
              </div>
            );
          })}
        </div>
        <div className="flex justify-between mt-2 font-mono text-[8px] text-white/20 uppercase tracking-widest">
          <span>12 AM</span>
          <span>6 AM</span>
          <span>12 PM</span>
          <span>6 PM</span>
          <span>11 PM</span>
        </div>
      </div>
    </section>
  );
};
