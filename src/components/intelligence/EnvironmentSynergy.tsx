import { MapPin, Music, Smartphone, Zap } from 'lucide-react';
import { useSovereignStore } from '../../store/sovereign';
import { cn } from '../../lib/utils';

export const EnvironmentSynergy = () => {
  const { surveillanceMetrics } = useSovereignStore();
  const synergy = surveillanceMetrics.environmentSynergy || {};

  const icons: Record<string, any> = {
    Location: MapPin,
    Audio: Music,
    Device: Smartphone
  };

  return (
    <section className="p-8 rounded-3xl border border-[var(--border-default)] bg-white/[0.02] backdrop-blur-xl h-full">
      <div className="flex items-center gap-2 mb-8">
        <Zap size={18} className="text-pink-400" />
        <h2 className="font-bold text-xs tracking-[0.2em] uppercase text-[var(--text-secondary)]">Environment Synergy</h2>
      </div>

      <div className="space-y-8">
        {Object.entries(synergy).map(([group, data]: [string, any], i) => {
          const Icon = icons[group] || Zap;
          return (
            <div key={i} className="space-y-4">
              <div className="flex items-center gap-2 font-bold text-[9px] uppercase tracking-[0.2em] text-white/30">
                <Icon size={12} />
                {group}
              </div>
              <div className="space-y-3">
                {data.map((item: any, j: number) => (
                  <div key={j} className="flex items-center justify-between group">
                    <span className={cn(
                      "font-bold text-xs transition-colors",
                      item.best ? "text-white" : "text-white/40"
                    )}>
                      {item.label}
                    </span>
                    <div className="flex items-center gap-3">
                      <div className="w-24 h-1 bg-white/5 rounded-full overflow-hidden">
                        <div 
                          className={cn("h-full rounded-full", item.best ? "bg-pink-500" : "bg-white/10")} 
                          style={{ width: `${(item.quality / 5) * 100}%` }} 
                        />
                      </div>
                      <span className={cn(
                        "font-bold text-[10px] font-bold min-w-[40px] text-right",
                        item.best ? "text-pink-400" : "text-white/20"
                      )}>
                        {item.quality}/5
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 pt-8 border-t border-white/5 bg-pink-500/5 p-6 rounded-2xl border border-pink-500/10">
        <h4 className="font-bold text-[10px] text-pink-400 uppercase tracking-widest mb-3 font-black">Detected Optimal Formula</h4>
        <p className="text-xs text-white/70 leading-relaxed font-bold">
          Desk + Lo-fi + Gym same day 
          <br/>
          <span className="text-pink-400 font-bold mt-2 inline-block">System Confidence: 84%</span>
        </p>
      </div>
    </section>
  );
};
