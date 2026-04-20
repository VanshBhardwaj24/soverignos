import { useMemo } from 'react';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar, Tooltip } from 'recharts';
import { useSovereignStore } from '../../store/sovereign';
import { STATS } from '../../lib/constants';

export const RadarStatChart = () => {
  const statLevels = useSovereignStore(state => state.statLevels);
  
  const data = useMemo(() => {
    return Object.values(STATS)
      .filter(s => s.id !== 'freedom')
      .map(stat => ({
        subject: stat.name,
        A: statLevels[stat.id] || 0,
        fullMark: 50,
      }));
  }, [statLevels]);

  return (
    <div className="w-full h-64 bg-[#111] border border-white/10 rounded-2xl relative flex items-center justify-center p-4">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
          <PolarGrid stroke="rgba(255,255,255,0.1)" />
          <PolarAngleAxis dataKey="subject" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 10, fontFamily: 'Geist Mono' }} />
          <Radar
            name="Level"
            dataKey="A"
            stroke="#ffffff"
            strokeWidth={1}
            fill="rgba(255,255,255,0.2)"
            fillOpacity={0.6}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: '#0A0A0A', border: '1px solid rgba(255,255,255,0.1)', fontFamily: 'Geist Mono', borderRadius: '8px' }}
            itemStyle={{ color: '#fff' }}
            formatter={(value: any) => [`${value}`, 'Level']}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  )
}
