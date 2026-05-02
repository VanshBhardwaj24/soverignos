import { useMemo } from 'react';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar, Tooltip } from 'recharts';
import { useSovereignStore } from '../../store/sovereign';
import { STATS } from '../../lib/constants';
// import { motion } from 'framer-motion';

export const RadarStatChart = () => {
  const statLevels = useSovereignStore(state => state.statLevels);
  const statXP = useSovereignStore(state => state.statXP);

  const data = useMemo(() => {
    return Object.values(STATS)
      .filter(s => s.id !== 'sovereignty')
      .map(stat => {
        const level = statLevels[stat.id] || 1;
        // Logarithmic-style scaling to ensure visibility at low levels
        // Base of 5 + logarithmic growth
        const scaledLevel = 5 + (Math.log10(level + 1) * 20);
        const potential = 45; // Fixed "Peak" boundary

        return {
          subject: stat.name.toUpperCase(),
          current: scaledLevel,
          actualLevel: level,
          potential: potential,
          xp: statXP[stat.id] || 0,
          fullMark: 50,
        };
      });
  }, [statLevels, statXP]);

  const archetype = useMemo(() => {
    const levels = Object.entries(statLevels);
    const sorted = [...levels].sort((a, b) => (b[1] as number) - (a[1] as number));
    const topStat = sorted[0][0];

    const archetypes: Record<string, string> = {
      code: 'The Architect',
      wealth: 'The Tycoon',
      body: 'The Titan',
      mind: 'The Sage',
      brand: 'The Influence',
      network: 'The Connector',
      spirit: 'The Monk',
      create: 'The Artisan'
    };

    return archetypes[topStat] || 'The Initiate';
  }, [statLevels]);

  return (
    <div className="w-full flex flex-col gap-4">
      <div className="w-full h-56 relative flex items-center justify-center p-2 group bg-black/20 rounded-3xl border border-white/5 overflow-hidden">
        <div className="absolute inset-0 bg-noise opacity-5 pointer-events-none" />

        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="75%" data={data}>
            <defs>
              <linearGradient id="radarGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00FFA3" stopOpacity={0.6} />
                <stop offset="95%" stopColor="#00FFA3" stopOpacity={0.1} />
              </linearGradient>
              <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="2" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            <PolarGrid
              stroke="rgba(255,255,255,0.03)"
              radialLines={true}
              gridType="polygon"
            />

            <PolarAngleAxis
              dataKey="subject"
              tick={{ fill: 'rgba(255,255,255,0.2)', fontSize: 6, fontWeight: 900, letterSpacing: '0.2em' }}
            />

            {/* Peak Potential Boundary */}
            <Radar
              name="Peak Potential"
              dataKey="potential"
              stroke="rgba(255,255,255,0.05)"
              strokeWidth={1}
              fill="transparent"
              isAnimationActive={false}
            />

            {/* Current Capability Layer */}
            <Radar
              name="Capability"
              dataKey="current"
              stroke="#00FFA3"
              strokeWidth={1.5}
              fill="url(#radarGradient)"
              fillOpacity={0.4}
              filter="url(#glow)"
              dot={{ r: 2, fill: '#00FFA3', stroke: '#00FFA3', strokeWidth: 1, fillOpacity: 1 }}
              animationBegin={200}
              animationDuration={1200}
              animationEasing="ease-out"
            />

            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-[#0A0A0A]/95 backdrop-blur-md border border-white/10 p-3 rounded-xl shadow-2xl relative z-50">
                      <div className="text-[9px] font-black text-[#00FFA3] mb-1 tracking-[0.2em]">{data.subject}</div>
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center justify-between gap-6">
                          <span className="text-[7px] text-white/40 font-black uppercase">Current Level</span>
                          <span className="text-[10px] text-white font-black">{data.actualLevel}</span>
                        </div>
                        <div className="w-full h-0.5 bg-white/5 rounded-full overflow-hidden">
                          <div className="h-full bg-[#00FFA3]" style={{ width: `${(data.actualLevel / 50) * 100}%` }} />
                        </div>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Archetype & Insights */}
      <div className="flex flex-col gap-1 px-1">
        <div className="flex items-center justify-between">
          <span className="text-[8px] font-black text-white/30 uppercase tracking-[0.2em]">Interest Profile {`\/`} Archtype</span>
          {/* <span className="text-[8px] font-black text-[#00FFA3] uppercase tracking-[0.2em] animate-pulse">Scanning...</span> */}
        </div>
        <div className="text-lg font-black text-white uppercase tracking-tighter leading-none italic">
          {archetype}
        </div>
      </div>
    </div>
  )
}
