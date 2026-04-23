import { useSovereignStore } from '../../store/sovereign';
import { cn } from '../../lib/utils';
import { Database, Zap, AlertTriangle, TrendingUp, TrendingDown, Clock } from 'lucide-react';

export const IntelligenceLogs = () => {
  const { intelligenceLogs } = useSovereignStore();

  const getIcon = (event: string) => {
    const e = event.toLowerCase();
    if (e.includes('pattern') || e.includes('collapse')) return <AlertTriangle size={12} className="text-red-400" />;
    if (e.includes('alert') || e.includes('below')) return <AlertTriangle size={12} className="text-orange-400" />;
    if (e.includes('streak') || e.includes('extended')) return <TrendingUp size={12} className="text-emerald-400" />;
    if (e.includes('causality') || e.includes('discovery')) return <Zap size={12} className="text-blue-400" />;
    if (e.includes('decay')) return <TrendingDown size={12} className="text-red-500" />;
    return <Clock size={12} className="text-white/20" />;
  };

  return (
    <section className="p-8 rounded-3xl border border-[var(--border-default)] bg-[var(--bg-secondary)] flex flex-col h-full">
      <div className="flex items-center gap-2 mb-6">
        <Database size={18} className="text-blue-400" />
        <h2 className="font-bold text-xs tracking-[0.2em] uppercase text-[var(--text-secondary)]">Intelligence Logs</h2>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto pr-4 custom-scrollbar">
        {intelligenceLogs.length > 0 ? (
          intelligenceLogs.slice(0, 6).map((log, i) => (
            <div key={i} className="flex gap-4 p-3 rounded-xl hover:bg-white/[0.02] transition-colors group">
              <div className="mt-0.5 shrink-0">
                {getIcon(log.event)}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[9px] text-white/20">
                    {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  {log.impact > 0 && (
                    <span className={cn(
                      "px-1.5 py-0.5 rounded-[4px] font-bold text-[8px] font-black uppercase",
                      log.impact > 70 ? "bg-emerald-500/20 text-emerald-400" : "bg-blue-500/20 text-blue-400"
                    )}>
                      Impact: {log.impact}
                    </span>
                  )}
                </div>
                <p className={cn(
                  "font-bold text-[11px] leading-relaxed",
                  log.event.toLowerCase().includes('collapse') ? "text-red-400" : "text-white/70"
                )}>
                  {log.event}
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-20 py-12">
            <Clock size={32} className="mb-4" />
            <p className="font-bold text-[10px] uppercase tracking-widest italic">Monitoring behavioral stream...</p>
          </div>
        )}
      </div>
    </section>
  );
};
