import { useSovereignStore } from '../../store/sovereign';
import { Skull, ShieldAlert, Timer, AlertTriangle, ZapOff } from 'lucide-react';

export const SystemHealthRecord = () => {
  const { streakCemetery } = useSovereignStore();

  const burialSamples = streakCemetery.length > 0 ? streakCemetery : [
    { statId: 'CODE', days: 14, diedAt: '2026-03-28', cause: 'stayed up gaming until 4 AM, woke up at 2 PM, day was gone' },
    { statId: 'BODY', days: 21, diedAt: '2026-04-03', cause: 'genuinely sick for 2 days — legitimate' },
    { statId: 'NETWORK', days: 4, diedAt: '2026-03-15', cause: "no real reason. just didn't." },
    { statId: 'BRAND', days: 7, diedAt: '2026-04-10', cause: 'felt like I had nothing worth posting. avoidance disguised as standards.' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3 text-white/20 px-4">
        <div className="w-8 h-px bg-white/10" />
        <h2 className="font-bold text-[10px] font-black tracking-[0.4em] uppercase">System Health — Violation & Mortality</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Violation Hall of Record */}
        <div className="lg:col-span-5 bg-white/[0.02] border border-white/5 rounded-[40px] p-8 md:p-12 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <ShieldAlert size={120} />
          </div>
          
          <div className="relative z-10 space-y-10">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500/60">
                <AlertTriangle size={16} />
              </div>
              <h3 className="font-bold text-[10px] tracking-[0.4em] text-red-500 uppercase font-black italic">Lifetime Violation Record</h3>
            </div>

            <div className="grid grid-cols-2 gap-8">
               <div className="space-y-1">
                  <span className="font-bold text-[8px] text-white/20 uppercase tracking-widest font-black">Total Generated</span>
                  <div className="text-4xl font-black text-white italic tracking-tighter">67</div>
               </div>
               <div className="space-y-1">
                  <span className="font-bold text-[8px] text-white/20 uppercase tracking-widest font-black">Total Resolved</span>
                  <div className="text-4xl font-black text-emerald-400 italic tracking-tighter">51</div>
               </div>
               <div className="space-y-1">
                  <span className="font-bold text-[8px] text-white/20 uppercase tracking-widest font-black">Total Expired</span>
                  <div className="text-4xl font-black text-white/20 italic tracking-tighter">9</div>
               </div>
               <div className="space-y-1">
                  <span className="font-bold text-[8px] text-white/20 uppercase tracking-widest font-black">Active Alerts</span>
                  <div className="text-4xl font-black text-red-500 italic tracking-tighter">7</div>
               </div>
            </div>

            <div className="space-y-4 pt-10 border-t border-white/5">
                <span className="font-bold text-[10px] text-white/40 uppercase tracking-[0.2em] font-black">Repeat Offenders</span>
                <div className="space-y-3">
                   <div className="flex justify-between items-center p-4 bg-white/5 rounded-2xl border border-white/5">
                      <span className="font-bold text-[10px] text-white uppercase font-black">LeetCode Daily</span>
                      <span className="text-red-500 font-bold text-[10px] font-black">14 VIOLATIONS</span>
                   </div>
                   <div className="flex justify-between items-center p-4 bg-white/5 rounded-2xl border border-white/5 opacity-60">
                      <span className="font-bold text-[10px] text-white uppercase font-black">Cold Outreach ×5</span>
                      <span className="text-white/40 font-bold text-[10px] font-black">9 VIOLATIONS</span>
                   </div>
                </div>
            </div>

            <div className="pt-6 font-bold text-[8px] text-white/10 uppercase tracking-widest font-black italic">
               "False certifications: 0 // Integrity protocol stable"
            </div>
          </div>
        </div>

        {/* Streak Cemetery */}
        <div className="lg:col-span-7 bg-white/[0.02] border border-white/5 rounded-[40px] p-8 md:p-12 relative overflow-hidden group">
          <div className="flex items-center gap-3 mb-12">
            <div className="p-2 rounded-lg bg-white/5 border border-white/10 text-white/40">
              <Skull size={16} />
            </div>
            <h3 className="font-bold text-[10px] tracking-[0.4em] text-white/40 uppercase font-black italic">Streak Cemetery</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             {burialSamples.map((dead, i) => (
                <div key={i} className="p-6 bg-black/40 border border-white/5 rounded-3xl relative overflow-hidden group/grave transition-all hover:border-white/20">
                   <div className="absolute top-0 right-0 p-4 opacity-5 group-hover/grave:opacity-10 transition-opacity">
                      <ZapOff size={40} />
                   </div>
                   <div className="space-y-4 relative z-10">
                      <div className="flex justify-between items-baseline">
                         <h4 className="text-xl font-black text-white italic tracking-tighter uppercase">{dead.statId}</h4>
                         <span className="font-bold text-[10px] text-red-500/60 font-black tracking-widest">{dead.days} DAYS</span>
                      </div>
                      <div className="space-y-2">
                        <span className="font-bold text-[8px] text-white/20 uppercase tracking-widest block font-black">Cause of Death:</span>
                        <p className="text-[10px] font-bold text-white/60 lowercase italic leading-relaxed">
                          "{dead.cause}"
                        </p>
                      </div>
                      <div className="pt-2 flex items-center gap-2 text-[8px] font-bold text-white/20 uppercase font-black tracking-widest">
                         <Timer size={10} /> Deceased: {dead.diedAt}
                      </div>
                   </div>
                </div>
             ))}
          </div>

          <div className="mt-10 p-6 bg-white/5 border border-dashed border-white/10 rounded-2xl flex items-center justify-center">
             <span className="font-bold text-[10px] text-white/10 uppercase tracking-[0.3em] font-black italic">Memory Allocation Exhausted</span>
          </div>
        </div>
      </div>
    </div>
  );
};
