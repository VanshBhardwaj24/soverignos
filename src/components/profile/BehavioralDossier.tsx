import { useMemo } from 'react';
import { useSovereignStore } from '../../store/sovereign';
import { Clock, ShieldAlert, TrendingDown, Brain, AlertTriangle } from 'lucide-react';
import { cn } from '../../lib/utils';

export const BehavioralDossier = () => {
  const { activityLog, questHistory, streaks, delusionHistory, punishments } = useSovereignStore();

  // 1. PERFORMANCE WINDOWS (Refined Sliding Window)
  const peakProfile = useMemo(() => {
    const hours = Array(24).fill(0);
    activityLog?.forEach(log => {
      const h = new Date(log.timestamp).getHours();
      hours[h]++;
    });

    // Peak: Find best 3-hour block
    let maxVal = -1;
    let peakStart = 9;
    for (let i = 0; i < 24; i++) {
       const sum = hours[i] + hours[(i+1)%24] + hours[(i+2)%24];
       if (sum > maxVal) {
          maxVal = sum;
          peakStart = i;
       }
    }

    // Worst: Find quietest 4-hour block between 8 AM and 8 PM
    let minVal = Infinity;
    let worstStart = 8;
    for (let i = 8; i <= 16; i++) {
       const sum = hours[i] + hours[i+1] + hours[i+2] + hours[i+3];
       if (sum < minVal) {
          minVal = sum;
          worstStart = i;
       }
    }

    const formatHour = (h: number) => {
      const hh = h % 24;
      return `${hh % 12 || 12} ${hh >= 12 ? 'PM' : 'AM'}`;
    };

    return {
       peak: `${formatHour(peakStart)} – ${formatHour(peakStart + 3)}`,
       worst: `${formatHour(worstStart)} – ${formatHour(worstStart + 4)}`,
       sessions: activityLog?.length || 0
    };
  }, [activityLog]);

  // 2. AVOIDANCE FINGERPRINT
  const avoidance = useMemo(() => {
    const stats = ['code', 'wealth', 'body', 'mind', 'brand', 'network', 'spirit', 'create'];
    const failures: Record<string, { failed: number, total: number }> = {};
    stats.forEach(s => failures[s] = { failed: 0, total: 0 });

    questHistory.forEach(q => {
      if (failures[q.statId]) {
        failures[q.statId].total++;
        if (q.status === 'failed') failures[q.statId].failed++;
      }
    });

    const mostAvoided = Object.entries(failures)
      .filter(([_, data]) => data.total > 0)
      .sort((a, b) => (b[1].failed / b[1].total) - (a[1].failed / a[1].total))[0];

    // Excuse Detection
    const excusePool = [
      ...questHistory.filter(q => q.excuse).map(q => q.excuse!),
      ...punishments.filter(p => p.status === 'active').map(p => p.title)
    ];
    
    const commonExcuses = excusePool.reduce((acc, curr) => {
       const key = curr.toUpperCase();
       acc[key] = (acc[key] || 0) + 1;
       return acc;
    }, {} as Record<string, number>);

    const topExcuse = Object.entries(commonExcuses).sort((a, b) => b[1] - a[1])[0];

    return {
      stat: mostAvoided ? mostAvoided[0].toUpperCase() : 'NONE',
      rate: mostAvoided ? Math.round((mostAvoided[1].failed / mostAvoided[1].total) * 100) : 0,
      excuse: topExcuse ? `"${topExcuse[0]}"` : '"WAS TIRED"',
      excuseCount: topExcuse ? topExcuse[1] : 0
    };
  }, [questHistory, punishments]);

  // 3. STRENGTH FINGERPRINT
  const strength = useMemo(() => {
    const consistency = Object.entries(streaks || {}).map(([id, s]) => ({
      id,
      ratio: s.longest > 0 ? s.current / s.longest : 0,
      current: s.current,
      longest: s.longest
    })).sort((a, b) => b.ratio - a.ratio)[0];

    const bestStreak = Object.values(streaks || {}).reduce((max, s) => Math.max(max, s.longest), 0);
    const bestStat = Object.entries(streaks || {}).find(([_, s]) => s.longest === bestStreak)?.[0] || 'CODE';

    return {
      stat: consistency ? consistency.id.toUpperCase() : 'CODE',
      current: consistency?.current || 0,
      bestStreak,
      bestStat: bestStat.toUpperCase()
    };
  }, [streaks]);

  // 4. DELUSION GAP
  const delusion = useMemo(() => {
    const table = delusionHistory?.slice(0, 4).map(d => ({
      week: d.week,
      perceived: d.perceivedRating,
      actual: d.actualRating,
      gap: d.actualRating - d.perceivedRating,
      msg: (d.actualRating - d.perceivedRating) < -2 ? 'worst delusion week' : 
           (d.actualRating - d.perceivedRating) > -0.5 ? 'best calibrated week' : ''
    })) || [];

    const avgGap = table.length > 0 
      ? table.reduce((acc, curr) => acc + curr.gap, 0) / table.length 
      : 0;

    let insight = "Your confidence is currently calibrated to your actual output. Maintain protocol awareness.";
    let tone: 'calibrated' | 'delusional' | 'psychotic' = 'calibrated';

    if (avgGap <= -3) {
      insight = "CRITICAL REALITY DISCONNECT. You consistently rate yourself 3+ points higher than you perform. Stop negotiating with ghosts.";
      tone = 'psychotic';
    } else if (avgGap <= -1) {
      insight = "Operational delusion detected. Your perceived competence frequently exceeds your logged output. Recalibrate internal sensors.";
      tone = 'delusional';
    }

    return { table, avgGap, insight, tone };
  }, [delusionHistory]);

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3 text-white/20 px-4">
        <div className="w-8 h-px bg-white/10" />
        <h2 className="font-mono text-[10px] font-black tracking-[0.4em] uppercase">Behavioral Dossier — Computed Patterns</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Behavioral Profile */}
        <div className="bg-white/[0.02] border border-white/5 rounded-[40px] p-8 md:p-12 relative overflow-hidden flex flex-col group">
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-white/5 border border-white/10 text-white/60">
                <Brain size={16} />
              </div>
              <h3 className="font-mono text-[10px] tracking-[0.4em] text-cyan-400 uppercase font-black italic">Behavioral Profile</h3>
            </div>
            <span className="font-mono text-[8px] text-white/20 uppercase font-black tracking-widest">Neural Analysis Active</span>
          </div>

          <div className="space-y-8 flex-1">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-1">
                   <div className="flex items-center gap-2 text-emerald-400/60 mb-2">
                      <Clock size={14} />
                      <span className="font-mono text-[9px] font-black tracking-widest uppercase">Peak Performance Window</span>
                   </div>
                   <div className="text-2xl font-black text-white italic uppercase tracking-tighter">{peakProfile.peak}</div>
                   <p className="text-[10px] font-mono text-white/20 uppercase font-black tracking-tighter">(verified, {peakProfile.sessions} sessions)</p>
                </div>
                <div className="space-y-1">
                   <div className="flex items-center gap-2 text-red-400/60 mb-2">
                      <TrendingDown size={14} />
                      <span className="font-mono text-[9px] font-black tracking-widest uppercase">Worst Performance Window</span>
                   </div>
                   <div className="text-2xl font-black text-white italic uppercase tracking-tighter">{peakProfile.worst}</div>
                   <p className="text-[10px] font-mono text-white/20 uppercase font-black tracking-tighter">(prime avoidance hours)</p>
                </div>
             </div>

             <div className="pt-8 border-t border-white/5 grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                   <span className="font-mono text-[10px] text-white/40 uppercase tracking-[0.2em] font-black">Avoidance Fingerprint</span>
                   <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-[10px] font-mono text-white uppercase font-black mb-1">
                          <span>Most Avoided Stat</span>
                          <span className="text-red-500">{avoidance.stat}</span>
                        </div>
                        <div className="font-mono text-[8px] text-white/20">({avoidance.rate}% failure rate)</div>
                      </div>
                      <div>
                        <div className="flex justify-between text-[10px] font-mono text-white uppercase font-black mb-1">
                          <span>Most Common Excuse</span>
                          <span className="text-red-500">{avoidance.excuse}</span>
                        </div>
                        <div className="font-mono text-[8px] text-white/20">(logged {avoidance.excuseCount || (avoidance.excuse === '"WAS TIRED"' ? 0 : 1)} times)</div>
                      </div>
                   </div>
                </div>

                <div className="space-y-6">
                   <span className="font-mono text-[10px] text-white/40 uppercase tracking-[0.2em] font-black">Strength Fingerprint</span>
                   <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-[10px] font-mono text-white uppercase font-black mb-1">
                          <span>Most Consistent Stat</span>
                          <span className="text-emerald-400">{strength.stat}</span>
                        </div>
                        <div className="font-mono text-[8px] text-white/20">({strength.current} day active streak)</div>
                      </div>
                      <div>
                        <div className="flex justify-between text-[10px] font-mono text-white uppercase font-black mb-1">
                          <span>Best Streak Ever</span>
                          <span className="text-emerald-400">{strength.bestStat} {strength.bestStreak} DAYS</span>
                        </div>
                        <div className="font-mono text-[8px] text-white/20">(Lifetime Record)</div>
                      </div>
                   </div>
                </div>
             </div>
          </div>
        </div>

        {/* Delusion Gap Tracker */}
        <div className="bg-white/[0.02] border border-white/5 rounded-[40px] p-8 md:p-12 relative overflow-hidden group">
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-white/5 border border-white/10 text-white/60">
                <ShieldAlert size={16} />
              </div>
              <h3 className="font-mono text-[10px] tracking-[0.4em] text-red-500 uppercase font-black italic">Delusion Gap Tracker</h3>
            </div>
            <AlertTriangle size={14} className="text-red-500/40" />
          </div>

          <div className="overflow-x-auto">
             <table className="w-full font-mono text-[10px] font-black text-white/60 uppercase">
                <thead>
                   <tr className="border-b border-white/10 text-white/20">
                      <th className="py-4 text-left">Week</th>
                      <th className="py-4 text-center">Perceived</th>
                      <th className="py-4 text-center">Actual</th>
                      <th className="py-4 text-right">Gap</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                   {delusion.table.length > 0 ? delusion.table.map((s, i) => (
                      <tr key={i} className="group/row">
                         <td className="py-6 flex flex-col">
                            <span className="text-white">{s.week}</span>
                            {s.msg && <span className="text-[8px] text-white/30 italic group-hover/row:text-white/60 transition-colors">← {s.msg}</span>}
                         </td>
                         <td className="py-6 text-center">{s.perceived.toFixed(1)}/10</td>
                         <td className="py-6 text-center">{s.actual.toFixed(1)}/10</td>
                         <td className={cn(
                           "py-6 text-right font-bold",
                           s.gap < -2 ? "text-red-500" : s.gap < -1 ? "text-orange-400" : "text-emerald-400"
                         )}>
                           {s.gap > 0 ? '+' : ''}{s.gap.toFixed(1)}
                         </td>
                      </tr>
                   )) : (
                     <tr>
                       <td colSpan={4} className="py-12 text-center text-white/20 italic tracking-widest font-black">
                         DATA CALIBRATING... LOG PERFORMANCE IN SUNDAY PROTOCOL
                       </td>
                     </tr>
                   )}
                </tbody>
             </table>
          </div>

          <div className={cn(
            "mt-10 p-6 border rounded-2xl transition-colors duration-500",
            delusion.tone === 'psychotic' ? "bg-red-500/10 border-red-500/40" : 
            delusion.tone === 'delusional' ? "bg-orange-500/5 border-orange-500/20" : 
            "bg-emerald-500/5 border-emerald-500/20"
          )}>
             <div className="flex items-baseline gap-2 mb-2">
                <span className="text-xs text-white/40 uppercase font-black">Average Gap:</span>
                <span className={cn(
                  "text-2xl font-black italic",
                  delusion.tone === 'psychotic' ? "text-red-500" : 
                  delusion.tone === 'delusional' ? "text-orange-400" : 
                  "text-emerald-400"
                )}>
                  {delusion.avgGap > 0 ? '+' : ''}{delusion.avgGap.toFixed(1)}
                </span>
             </div>
             <p className="text-[10px] font-mono text-white/40 uppercase font-black italic leading-tight">
               {delusion.insight}
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};
