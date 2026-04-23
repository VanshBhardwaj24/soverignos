import { useSovereignStore } from '../../store/sovereign';
import { Target, ShieldX, Compass, Lock } from 'lucide-react';
import { cn } from '../../lib/utils';

export const VisionBoard = () => {
  const { antiWishlist, freedomRoadmap, destinationBoard } = useSovereignStore();

  const antiWishlistSamples = antiWishlist.length > 0 ? antiWishlist : [
    "Taking a job I hate just to pay rent.",
    "TradeMind dying with zero users.",
    "Being 27 with the same skills as today.",
    "Still dependent on family for accommodation.",
    "Never leaving this city on my own terms.",
    "Needing to borrow money when I want to do something.",
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3 text-white/20 px-4">
        <div className="w-8 h-px bg-white/10" />
        <h2 className="font-bold text-[10px] font-black tracking-[0.4em] uppercase">Goals & Vision — The North Star</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Anti-Wishlist */}
        <div className="lg:col-span-5 bg-white/[0.02] border border-white/5 rounded-[40px] p-8 md:p-12 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <ShieldX size={120} />
          </div>
          
          <div className="relative z-10 space-y-8">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500/60">
                <ShieldX size={16} />
              </div>
              <h3 className="font-bold text-[10px] tracking-[0.4em] text-white uppercase font-black italic">What I'm Running From</h3>
            </div>

            <div className="space-y-6">
               {antiWishlistSamples.map((item, i) => (
                  <div key={i} className="flex gap-4 group/item">
                     <span className="font-bold text-[10px] text-red-500/40 mt-1 font-black shrink-0">{String(i + 1).padStart(2, '0')}</span>
                     <p className="text-lg font-black text-white/80 uppercase italic leading-tight tracking-tighter group-hover/item:text-red-500/80 transition-colors">
                        {item}
                     </p>
                  </div>
               ))}
            </div>

            <div className="pt-10 border-t border-white/5 font-bold text-[8px] text-white/10 uppercase tracking-widest font-black italic flex items-center gap-2">
               <Lock size={10} /> Written: February 2026 — Uneditable protocol enabled
            </div>
          </div>
        </div>

        {/* Freedom Roadmap & Destinations */}
        <div className="lg:col-span-7 space-y-8">
          {/* Freedom Roadmap */}
          <div className="bg-white/[0.02] border border-white/5 rounded-[40px] p-8 md:p-12 relative overflow-hidden backdrop-blur-md shadow-2xl">
             <div className="flex items-center gap-3 mb-10">
                <div className="p-2 rounded-lg bg-white/5 border border-white/10 text-white/60">
                  <Target size={16} />
                </div>
                <h3 className="font-bold text-[10px] tracking-[0.4em] text-white/40 uppercase font-black italic">Freedom Roadmap</h3>
             </div>

             <div className="relative pt-8 pb-12">
                {/* Horizontal Track */}
                <div className="absolute left-0 right-0 top-1/2 h-px bg-white/10 -translate-y-1/2" />
                
                <div className="relative flex justify-between gap-4">
                   {freedomRoadmap.map((m, i) => (
                      <div key={i} className="flex flex-col items-center gap-6 relative z-10">
                         <div className={cn(
                           "w-10 h-10 rounded-full border-2 bg-black flex items-center justify-center transition-all",
                           m.isUnlocked ? "border-white shadow-[0_0_20px_white]" : "border-white/10"
                         )}>
                            {m.isUnlocked ? <div className="w-2 h-2 rounded-full bg-white animate-pulse" /> : <div className="w-1.5 h-1.5 rounded-full bg-white/10" />}
                         </div>
                         <div className="flex flex-col items-center text-center gap-1">
                            <span className={cn(
                              "font-bold text-[8px] font-black uppercase tracking-widest transition-opacity",
                              m.isUnlocked ? "text-white" : "text-white/20"
                            )}>[{m.timeframe}]</span>
                            <h4 className={cn(
                              "text-xs font-black uppercase italic tracking-tighter whitespace-nowrap",
                              m.isUnlocked ? "text-white" : "text-white/20"
                            )}>{m.label}</h4>
                            <span className="font-bold text-[8px] text-white/10 uppercase font-black lowercase">{m.dependencyStatus}</span>
                         </div>
                      </div>
                   ))}
                </div>
             </div>
          </div>

          {/* Destinations */}
          <div className="bg-white/[0.02] border border-white/5 rounded-[40px] p-8 md:p-12 relative overflow-hidden">
             <div className="flex items-center gap-3 mb-8">
                <div className="p-2 rounded-lg bg-white/5 border border-white/10 text-white/60">
                  <Compass size={16} />
                </div>
                <h3 className="font-bold text-[10px] tracking-[0.4em] text-white/40 uppercase font-black italic">Destination Board — Places I'm Building Toward</h3>
             </div>

             <div className="space-y-4">
                <table className="w-full font-bold text-[10px] font-black text-white/60 uppercase">
                   <tbody className="divide-y divide-white/5">
                      {destinationBoard.map((d, i) => (
                         <tr key={i} className="group hover:bg-white/[0.02] transition-all">
                            <td className="py-6 pr-4">
                               <div className="flex flex-col">
                                  <span className="text-white text-lg italic tracking-tighter">{d.name}</span>
                                  <span className="text-[8px] text-white/20">{d.country}</span>
                               </div>
                            </td>
                            <td className="py-6 px-4 text-white/40 font-bold italic">"{d.context}"</td>
                            <td className="py-6 pl-4 text-right">
                               <div className="inline-flex flex-col items-end gap-1">
                                  <span className={cn(
                                    "px-2 py-0.5 rounded text-[8px] font-black tracking-widest",
                                    d.status === 'visited' ? "bg-emerald-500 text-black" : d.status === 'planned' ? "bg-blue-500 text-white" : "bg-white/5 text-white/20"
                                  )}>{d.status}</span>
                                  <span className="text-[7px] text-white/10">Requirement: {d.unlockRequirement}</span>
                               </div>
                            </td>
                         </tr>
                      ))}
                   </tbody>
                </table>
             </div>

             <div className="pt-8 border-t border-white/5 flex items-center justify-between font-bold text-[8px] text-white/10 uppercase tracking-widest font-black italic">
                <span>Not a bucket list. A consequence of the work.</span>
                <span>Traversing Alpha-9 nodes</span>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};
