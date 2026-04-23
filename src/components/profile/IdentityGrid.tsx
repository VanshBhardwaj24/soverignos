import { useMemo } from 'react';
import { useSovereignStore } from '../../store/sovereign';
import { STATS } from '../../lib/constants';
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis,
  ResponsiveContainer, AreaChart, Area, Tooltip, XAxis, YAxis
} from 'recharts';
import { InteractiveHeatmap } from '../stats/InteractiveHeatmap';
import { Award, TrendingUp, Grid } from 'lucide-react';

export const IdentityGrid = () => {
  const { statLevels, activityLog, freedomScore } = useSovereignStore();

  const radarData = useMemo(() => {
    return Object.values(STATS).filter(s => !['freedom', 'sovereignty'].includes(s.id)).map(s => ({
      subject: s.name,
      level: statLevels[s.id] || 0,
      fullMark: 100
    }));
  }, [statLevels]);

  const growthData = useMemo(() => {
    const days: Record<string, number> = {};
    const now = new Date();
    for (let i = 14; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      days[d.toISOString().split('T')[0]] = 0;
    }

    if (activityLog && Array.isArray(activityLog)) {
      activityLog.forEach(log => {
        const date = log.timestamp.split('T')[0];
        if (days[date] !== undefined) {
          days[date] += log.xp;
        }
      });
    }

    return Object.entries(days).map(([date, xp]) => ({
      date: date.split('-').slice(1).join('/'),
      xp
    }));
  }, [activityLog]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Stat Radar */}
      <div className="bg-white/[0.03] border border-white/10 rounded-[40px] p-8 relative overflow-hidden backdrop-blur-md shadow-2xl">
        <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-white/5 border border-white/10">
                    <Grid size={16} className="text-white/60" />
                </div>
                <h3 className="font-bold text-[10px] tracking-[0.3em] text-white/40 uppercase font-black">Capability Radar</h3>
            </div>
            <Award size={16} className="text-white/20" />
        </div>

        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
              <PolarGrid stroke="white" strokeOpacity={0.05} />
              <PolarAngleAxis 
                dataKey="subject" 
                tick={{ fill: 'white', fontSize: 9, fontFamily: 'Geist Mono', fontWeight: 'bold', opacity: 0.4 }} 
              />
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
                <span className="block font-bold text-[8px] text-white/20 uppercase mb-1 tracking-widest font-black">Freedom Rating</span>
                <div className="font-bold text-xl font-black text-white">{freedomScore.toFixed(1)}</div>
            </div>
            <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                <span className="block font-bold text-[8px] text-white/20 uppercase mb-1 tracking-widest font-black">Domain Count</span>
                <div className="font-bold text-xl font-black text-white">8<span className="text-xs text-white/20 font-light ml-1">UNITS</span></div>
            </div>
        </div>
      </div>

      {/* Growth History */}
      <div className="bg-white/[0.03] border border-white/10 rounded-[40px] p-8 relative overflow-hidden backdrop-blur-md shadow-2xl flex flex-col">
        <div className="flex justify-between items-center mb-10">
            <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-white/5 border border-white/10">
                    <TrendingUp size={16} className="text-white/60" />
                </div>
                <h3 className="font-bold text-[10px] tracking-[0.3em] text-white/40 uppercase font-black">XP Trajectory / 14 Day</h3>
            </div>
            <TrendingUp size={16} className="text-white/20" />
        </div>

        <div className="h-[200px] w-full mt-4 flex-1">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={growthData}>
              <defs>
                <linearGradient id="growthGradientProfile" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="white" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="white" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" hide />
              <YAxis hide />
              <Tooltip 
                contentStyle={{ backgroundColor: '#000', border: '1px solid #333', borderRadius: '12px', fontSize: '10px', fontFamily: 'Geist Mono' }} 
              />
              <Area
                type="monotone"
                dataKey="xp"
                stroke="white"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#growthGradientProfile)"
                animationDuration={1500}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="flex items-center justify-between mt-auto pt-6 border-t border-white/5">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-400" />
            <span className="font-bold text-[9px] text-white uppercase tracking-widest font-bold">Neural Growth</span>
          </div>
          <span className="font-bold text-[10px] text-white/20 uppercase tracking-widest font-black italic">Projecting Apex Status</span>
        </div>
      </div>

      {/* Heatmap Full Width */}
      <div className="md:col-span-2">
         <InteractiveHeatmap entries={activityLog} />
      </div>
    </div>
  );
};
