import { AlertTriangle } from 'lucide-react';
import { useSovereignStore } from '../../store/sovereign';

export const BurnoutSensor = () => {
  const statLevels = useSovereignStore(state => state.statLevels);
  
  const codeLevel = statLevels['code'] || 0;
  const bodyLevel = statLevels['body'] || 0;

  // Simple intelligence logic: If Grinding CODE excessively harder than Rest/Body
  const isBurnoutWarning = codeLevel > (bodyLevel * 1.5) && codeLevel > 5;

  if (!isBurnoutWarning) {
    return (
      <div className="p-4 rounded-xl border border-white/5 bg-[#111] font-bold text-xs text-gray-500 flex items-center justify-between">
        <span>SYSTEM DIAGNOSTIC: STABLE</span>
        <div className="w-2 h-2 rounded-full bg-[var(--success)] animate-pulse shadow-[0_0_8px_var(--success)]" />
      </div>
    );
  }

  return (
    <div className="p-4 rounded-xl border border-[var(--danger)] bg-[var(--danger)]/10 animate-pulse-slow">
      <div className="flex items-center gap-2 mb-2">
        <AlertTriangle size={16} className="text-[var(--danger)]" />
        <span className="font-bold text-sm text-[var(--danger)] tracking-wide font-bold">BURNOUT SENSOR TRIGGERED</span>
      </div>
      <p className="font-bold text-[10px] text-[var(--danger)]/80 leading-relaxed">
        CODE metric is heavily outpacing BODY restitution (Lv.{codeLevel} vs Lv.{bodyLevel}). Physical system failure probability increasing. Recommend minimum 8hrs sleep log to stabilize warning.
      </p>
    </div>
  )
}
