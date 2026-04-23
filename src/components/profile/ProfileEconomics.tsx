import { useMemo } from 'react';
import { useSovereignStore } from '../../store/sovereign';
import { DollarSign, Briefcase, BarChart3, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

export const ProfileEconomics = () => {
  const { gold, budgetCap, portfolios, ventures } = useSovereignStore();

  const totalPortfolioValue = useMemo(() => {
    return portfolios.reduce((acc, p) => acc + (p.balance || 0), 0);
  }, [portfolios]);

  const activeVentureCount = useMemo(() => {
    return ventures.filter(v => v.status === 'active').length;
  }, [ventures]);

  const progressPercent = Math.min(100, (gold / (budgetCap || 1)) * 100);

  return (
    <div className="bg-white/[0.03] border border-white/10 rounded-[40px] p-8 space-y-8 relative overflow-hidden backdrop-blur-md shadow-2xl">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-white/5 border border-white/10">
          <DollarSign size={16} className="text-white/60" />
        </div>
        <h3 className="font-bold text-[10px] tracking-[0.3em] text-white/40 uppercase font-black">Economic Command</h3>
      </div>

      {/* Liquidity Meter */}
      <div className="space-y-4">
        <div className="flex justify-between items-end">
          <span className="font-bold text-[9px] text-white/40 uppercase tracking-widest font-black">Liquidity Index</span>
          <span className="font-bold text-sm text-white font-black italic">{progressPercent.toFixed(1)}%</span>
        </div>
        <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            className="h-full bg-white transition-all shadow-[0_0_10px_white]" 
          />
        </div>
        <div className="flex justify-between font-bold text-[9px] text-white/20 font-black">
          <span>{gold.toLocaleString()} GC</span>
          <span>CAP / {budgetCap.toLocaleString()}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {/* Total Net Worth */}
        <div className="p-6 bg-white/5 border border-white/5 rounded-3xl group hover:bg-white/[0.07] transition-all">
          <div className="flex justify-between items-start mb-4">
            <BarChart3 size={18} className="text-white/20 group-hover:text-white/60 transition-colors" />
            <span className="font-bold text-[8px] text-emerald-400 font-bold uppercase tracking-widest">Aggregated</span>
          </div>
          <div className="space-y-1">
            <span className="block font-bold text-[9px] text-white/20 uppercase tracking-widest font-black">Net Worth Overview</span>
            <div className="text-2xl font-black text-white italic tracking-tighter">
              ${totalPortfolioValue.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Venture Capital */}
        <div className="p-6 bg-white/5 border border-white/5 rounded-3xl group hover:bg-white/[0.07] transition-all">
          <div className="flex justify-between items-start mb-4">
            <Briefcase size={18} className="text-white/20 group-hover:text-white/60 transition-colors" />
            <TrendingUp size={18} className="text-blue-400/60" />
          </div>
          <div className="space-y-1">
            <span className="block font-bold text-[9px] text-white/20 uppercase tracking-widest font-black">Venture Ecosystem</span>
            <div className="text-2xl font-black text-white italic tracking-tighter">
              {activeVentureCount} <span className="text-xs text-white/20 font-light ml-1 uppercase">Active Sectors</span>
            </div>
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-white/5">
         <div className="flex justify-between items-center text-[9px] font-bold font-black tracking-widest text-white/20">
            <span>FINANCIAL AUDIT</span>
            <span>01:14:02 UNTIL UPDATE</span>
         </div>
      </div>
    </div>
  );
};
