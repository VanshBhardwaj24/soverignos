import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Code, TrendingDown, TrendingUp, DollarSign, Heart, Share2, Users, ExternalLink, Moon, Plus } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useSovereignStore } from '../../store/sovereign';

interface DossierSectionProps {
  title: string;
  icon: any;
  momentum: 'improving' | 'flat' | 'declining';
  children: React.ReactNode;
  isInitiallyExpanded?: boolean;
}

const DossierSection = ({ title, icon: Icon, momentum, children, isInitiallyExpanded }: DossierSectionProps) => {
  const [isExpanded, setIsExpanded] = useState(isInitiallyExpanded || momentum === 'declining');

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-[24px] overflow-hidden transition-all hover:bg-white/[0.04]">
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-6 md:p-8 text-left"
      >
        <div className="flex items-center gap-6">
          <div className={cn(
            "p-3 rounded-2xl bg-white/5 border border-white/10",
            momentum === 'declining' ? "text-red-400" : momentum === 'improving' ? "text-emerald-400" : "text-blue-400"
          )}>
            <Icon size={20} />
          </div>
          <div>
            <h3 className="text-xl font-black text-white uppercase italic tracking-tighter">{title} BREAKDOWN</h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="font-bold text-[8px] text-white/20 uppercase tracking-[0.2em] font-black">Status Intensity:</span>
              {momentum === 'declining' ? (
                <div className="flex items-center gap-1 text-red-500/60 font-bold text-[8px] font-black uppercase">
                  <TrendingDown size={10} /> DECLINING — IMMEDIATE ACTION REQUIRED
                </div>
              ) : momentum === 'improving' ? (
                <div className="flex items-center gap-1 text-emerald-500/60 font-bold text-[8px] font-black uppercase">
                  <TrendingUp size={10} /> IMPROVING — MOMENTUM SECURED
                </div>
              ) : (
                <div className="flex items-center gap-1 text-blue-500/60 font-bold text-[8px] font-black uppercase">
                  STABLE — PROTOCOL NOMINAL
                </div>
              )}
            </div>
          </div>
        </div>
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          className="text-white/20"
        >
          <ChevronDown size={20} />
        </motion.div>
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-white/5 bg-black/20"
          >
            <div className="p-8 md:p-10 space-y-8">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const StatDossier = () => {
  const activityLog = useSovereignStore(state => state.activityLog);
  const questHistory = useSovereignStore(state => state.questHistory);
  const setLogModalOpen = useSovereignStore(state => state.setLogModalOpen);
  
  const bodyMetrics = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    // 1. Gym Data Extraction
    const GYM_KEYWORDS = ['gym', 'workout', 'train', 'session', 'exercise', 'movement', 'physical'];
    
    const gymLogs = activityLog.filter(log => 
      log.metadata?.activityId === 'gym_session' || 
      (log.statId === 'body' && log.metadata?.questId)
    );
    
    const gymQuests = questHistory.filter(q => 
      q.statId === 'body' && 
      q.status === 'completed' && 
      GYM_KEYWORDS.some(k => q.title.toLowerCase().includes(k))
    );
    
    const allGymActivity = [
      ...gymLogs.map(l => new Date(l.timestamp)),
      ...gymQuests.map(q => new Date(q.timestamp))
    ].sort((a, b) => b.getTime() - a.getTime());
    
    const uniqueDays = new Set(allGymActivity.map(d => d.toDateString()));
    
    // Monthly Sessions
    const sessionsMonth = Array.from(uniqueDays).filter(dateStr => {
      const d = new Date(dateStr);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    }).length;
    
    // Streaks
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    
    const sortedUniqueDays = Array.from(uniqueDays)
      .map(d => new Date(d))
      .sort((a, b) => b.getTime() - a.getTime());
      
    if (sortedUniqueDays.length > 0) {
      // Calculate longest
      const ascDays = [...sortedUniqueDays].reverse();
      let lastDate: Date | null = null;
      ascDays.forEach(d => {
        if (!lastDate) {
          tempStreak = 1;
        } else {
          const diff = (d.getTime() - lastDate.getTime()) / (1000 * 3600 * 24);
          if (diff <= 1.1) tempStreak++;
          else tempStreak = 1;
        }
        longestStreak = Math.max(longestStreak, tempStreak);
        lastDate = d;
      });
    }

    // 2. Sleep Data Extraction
    const sleepLogs = activityLog.filter(log => log.metadata?.activityId === 'sleep_logged');
    const sleepDays = new Set(sleepLogs.map(l => new Date(l.timestamp).toDateString()));
    const avgHours = sleepLogs.length > 0 
      ? sleepLogs.reduce((acc, log) => acc + (log.metadata?.hours || 7.5), 0) / sleepLogs.length 
      : 0;

    let sleepCurrentStreak = 0;
    let sleepBestStreak = 0;
    let sTempStreak = 0;
    
    const sortedSleepDays = Array.from(sleepDays)
      .map(d => new Date(d))
      .sort((a, b) => a.getTime() - b.getTime());

    let sLastDate: Date | null = null;
    sortedSleepDays.forEach(d => {
      if (!sLastDate) sTempStreak = 1;
      else {
        const diff = (d.getTime() - sLastDate.getTime()) / (1000 * 3600 * 24);
        if (diff <= 1.1) sTempStreak++;
        else sTempStreak = 1;
      }
      sleepBestStreak = Math.max(sleepBestStreak, sTempStreak);
      sLastDate = d;
    });

    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    
    const lastGym = sortedUniqueDays[0]?.toDateString();
    if (lastGym === today || lastGym === yesterday) {
      let cStreak = 0;
      let checkDate = new Date();
      while (uniqueDays.has(checkDate.toDateString())) {
        cStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      }
      currentStreak = cStreak;
    }

    const lastSleep = sortedSleepDays[sortedSleepDays.length - 1]?.toDateString();
    if (lastSleep === today || lastSleep === yesterday) {
      let cStreak = 0;
      let checkDate = new Date();
      while (sleepDays.has(checkDate.toDateString())) {
        cStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      }
      sleepCurrentStreak = cStreak;
    }

    // 3. Code Data Extraction
    const leetLogs = activityLog.filter(l => l.metadata?.activityId?.startsWith('leetcode_'));
    const easyCount = leetLogs.filter(l => l.metadata?.activityId === 'leetcode_easy').length;
    const medCount = leetLogs.filter(l => l.metadata?.activityId === 'leetcode_medium').length;
    const hardCount = leetLogs.filter(l => l.metadata?.activityId === 'leetcode_hard').length;
    
    const githubLogs = activityLog.filter(l => l.metadata?.activityId === 'github_commit');
    const githubDays = new Set(githubLogs.map(l => new Date(l.timestamp).toDateString()));
    
    let ghCurrentStreak = 0;
    let ghLongestStreak = 0;
    if (githubDays.size > 0) {
      const sortedGH = Array.from(githubDays).map(d => new Date(d)).sort((a, b) => b.getTime() - a.getTime());
      const lastGH = sortedGH[0].toDateString();
      if (lastGH === today || lastGH === yesterday) {
        let dc = 0;
        let d = new Date();
        while (githubDays.has(d.toDateString())) {
          dc++;
          d.setDate(d.getDate() - 1);
        }
        ghCurrentStreak = dc;
      }
      
      let temp = 0;
      let lDate: Date | null = null;
      [...sortedGH].reverse().forEach(d => {
        if (!lDate) temp = 1;
        else {
          const diff = (d.getTime() - lDate.getTime()) / 86400000;
          if (diff <= 1.1) temp++;
          else temp = 1;
        }
        ghLongestStreak = Math.max(ghLongestStreak, temp);
        lDate = d;
      });
    }

    // 4. Wealth Data Extraction
    const totalTransactions = useSovereignStore.getState().transactions;
    const totalIncome = totalTransactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const totalExpense = totalTransactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    const currentEquity = 5000 + (totalIncome - totalExpense);
    
    const tradeWins = activityLog.filter(l => l.metadata?.activityId === 'forex_win').length;
    const incomeSectors = new Set(totalTransactions.filter(t => t.type === 'income').map(t => t.sector));
    const incomeStreams = incomeSectors.size;

    return {
      gym: {
        sessionsMonth,
        currentStreak,
        longestStreak,
        uniqueDays,
        restDays: now.getDate() - sessionsMonth
      },
      sleep: {
        avgHours,
        currentStreak: sleepCurrentStreak,
        bestStreak: sleepBestStreak
      },
      code: {
        easy: easyCount,
        medium: medCount,
        hard: hardCount,
        total: easyCount + medCount + hardCount,
        streak: ghCurrentStreak,
        maxStreak: ghLongestStreak
      },
      wealth: {
        equity: currentEquity,
        winRate: tradeWins > 0 ? 50 + (tradeWins * 2) : 0,
        incomeStreams
      }
    };
  }, [activityLog, questHistory]);

  const codeMomentum = bodyMetrics.code.total > 5 ? "improving" : bodyMetrics.code.total === 0 ? "declining" : "flat";
  const wealthMomentum = bodyMetrics.wealth.incomeStreams > 0 ? "improving" : "declining";

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 text-white/20 px-4">
        <div className="w-8 h-px bg-white/10" />
        <h2 className="font-bold text-[10px] font-black tracking-[0.4em] uppercase">Stat Dossier — Deep Personal Metrics</h2>
      </div>

      <DossierSection title="Code" icon={Code} momentum={codeMomentum} isInitiallyExpanded={true}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-6">
            <h4 className="font-bold text-[10px] text-white/40 uppercase tracking-[0.2em] font-black">LeetCode Analysis</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-6 bg-white/5 rounded-3xl space-y-2">
                 <span className="font-bold text-[8px] text-white/20 uppercase tracking-widest block font-black">Total Solved</span>
                 <div className="text-3xl font-black text-white italic tracking-tighter">{bodyMetrics.code.total}</div>
                 <div className="flex gap-2 text-[8px] font-bold font-black uppercase">
                    <span className="text-emerald-400">E: {bodyMetrics.code.easy}</span> • <span className="text-yellow-400">M: {bodyMetrics.code.medium}</span> • <span className="text-red-400">H: {bodyMetrics.code.hard}</span>
                 </div>
              </div>
              <div className="p-6 bg-white/5 rounded-3xl space-y-2">
                 <span className="font-bold text-[8px] text-white/20 uppercase tracking-widest block font-black">Focus Intensity</span>
                 <div className="text-3xl font-black text-white italic tracking-tighter">{bodyMetrics.code.medium > bodyMetrics.code.easy ? 'Advanced' : 'Core'}</div>
                 <span className={cn(
                   "text-[8px] font-bold font-black uppercase",
                   bodyMetrics.code.total > 0 ? "text-emerald-500/60" : "text-red-500/60"
                 )}>
                   {bodyMetrics.code.total > 0 ? 'Active Deployment' : 'Stalled Operations'}
                 </span>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="font-bold text-[8px] text-white/20 uppercase tracking-widest block font-black w-full mb-2">Category Mastery</span>
              {['Arrays', 'Strings', 'HashMap'].map(c => (
                <span key={c} className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[9px] font-bold text-emerald-400 font-bold">{c}</span>
              ))}
              <span className="font-bold text-[8px] text-white/20 uppercase tracking-widest block font-black w-full my-2">Weak Points</span>
              {['Graphs', 'DP', 'Trees'].map(c => (
                <span key={c} className="px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-[9px] font-bold text-red-400 font-bold">{c}</span>
              ))}
            </div>
            
            <button 
              onClick={() => setLogModalOpen(true, 'code', 'leetcode_medium')}
              className="w-full py-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center gap-3 group hover:bg-emerald-500/20 transition-all mt-4"
            >
              <Plus size={16} className="text-emerald-400 group-hover:rotate-90 transition-transform" />
              <span className="font-bold text-[10px] font-black text-emerald-400 uppercase tracking-widest">Register Code Mission Log</span>
            </button>
          </div>

          <div className="space-y-6">
            <h4 className="font-bold text-[10px] text-white/40 uppercase tracking-[0.2em] font-black">GitHub & Workflow</h4>
            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <span className="font-bold text-[10px] text-white uppercase tracking-widest font-bold">GitHub Streak</span>
                <span className="font-bold text-[10px] text-white/40">Current: {bodyMetrics.code.streak} Days | Longest: {bodyMetrics.code.maxStreak} Days</span>
              </div>
              <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden flex">
                 <div 
                   className="h-full bg-emerald-400 shadow-[0_0_10px_#34d399] transition-all duration-1000" 
                   style={{ width: `${Math.min((bodyMetrics.code.streak / 30) * 100, 100)}%` }} 
                 />
              </div>
              <div className="grid grid-cols-2 gap-4 pt-2">
                 <div className="p-4 bg-white/5 border border-white/5 rounded-2xl">
                    <span className="block font-bold text-[8px] text-white/20 uppercase tracking-widest font-black mb-1">Open Source PRs</span>
                    <div className="font-bold text-xl font-black text-white italic">12 <span className="text-[8px] text-white/20 ml-1">MERGED</span></div>
                 </div>
                 <div className="p-4 bg-white/5 border border-white/5 rounded-2xl">
                    <span className="block font-bold text-[8px] text-white/20 uppercase tracking-widest font-black mb-1">Total Commits</span>
                    <div className="font-bold text-xl font-black text-white italic">340+</div>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </DossierSection>

      <DossierSection title="Wealth" icon={DollarSign} momentum={wealthMomentum}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
           <div className="p-6 bg-white/5 rounded-3xl space-y-4">
              <span className="font-bold text-[10px] text-white/40 uppercase tracking-[0.2em] font-black">Trading Status</span>
              <div className="space-y-1">
                 <div className="text-2xl font-black text-white italic tracking-tighter uppercase">Equity: ${bodyMetrics.wealth.equity.toLocaleString()}</div>
                 <span className="text-[10px] font-bold text-emerald-400 font-black tracking-widest uppercase">
                   {bodyMetrics.wealth.equity > 5000 ? "Capital Growth Secured" : "Protocol Deficit"}
                 </span>
              </div>
              <div className="space-y-2">
                 <span className="font-bold text-[8px] text-white/20 uppercase tracking-widest block font-black">Account P&L</span>
                 <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <div className={cn(
                      "h-full",
                      bodyMetrics.wealth.equity >= 5000 ? "bg-blue-400" : "bg-red-400"
                    )} style={{ width: `${Math.min(Math.max((bodyMetrics.wealth.equity / 10000) * 100, 5), 100)}%` }} />
                 </div>
                 <span className="font-bold text-[8px] text-white/40 uppercase font-black text-right block">Baseline: $5,000</span>
              </div>
           </div>

           <div className="p-6 bg-white/5 rounded-3xl space-y-4">
              <span className="font-bold text-[10px] text-white/40 uppercase tracking-[0.2em] font-black">Performance</span>
              <div className="grid grid-cols-2 gap-4">
                 <div>
                    <span className="block font-bold text-[8px] text-white/20 uppercase tracking-widest font-black mb-1">Win Frequency</span>
                    <div className="font-bold text-xl font-black text-emerald-400 italic">
                      {bodyMetrics.wealth.winRate > 0 ? bodyMetrics.wealth.winRate.toFixed(1) + '%' : 'N/A'}
                    </div>
                 </div>
                 <div>
                    <span className="block font-bold text-[8px] text-white/20 uppercase tracking-widest font-black mb-1">Income Power</span>
                    <div className="font-bold text-xl font-black text-white italic">{bodyMetrics.wealth.incomeStreams} <span className="text-[10px] opacity-20">STREAMS</span></div>
                 </div>
              </div>
              <div className="pt-2 border-t border-white/5">
                 <span className="font-bold text-[8px] text-white/20 uppercase tracking-widest block font-black mb-1">Primary Accents</span>
                 <div className="flex gap-2">
                    <span className="px-2 py-0.5 rounded bg-white/5 font-bold text-[8px] text-white font-bold">XAU/USD</span>
                    <span className="px-2 py-0.5 rounded bg-white/5 font-bold text-[8px] text-white font-bold">ALPHA-TX</span>
                 </div>
              </div>
           </div>

           <div className={cn(
             "p-6 border rounded-3xl space-y-4",
             bodyMetrics.wealth.incomeStreams === 0 ? "bg-red-500/5 border-red-500/10" : "bg-emerald-500/5 border-emerald-500/10"
           )}>
              <span className="font-bold text-[10px] uppercase tracking-[0.2em] font-black opacity-60">Income Diversification</span>
              <div className={cn(
                "text-5xl font-black italic tracking-tighter",
                bodyMetrics.wealth.incomeStreams === 0 ? "text-red-500" : "text-emerald-400 shadow-[0_0_20px_rgba(52,211,153,0.1)]"
              )}>
                {bodyMetrics.wealth.incomeStreams}
              </div>
              <p className="text-[10px] font-bold opacity-40 uppercase font-black leading-tight italic">
                {bodyMetrics.wealth.incomeStreams === 0 
                  ? "Lack of diversity is the primary vulnerability in the current protocol."
                  : "Diversification protocol engaged. Multiple vectors contributing to system equity."}
              </p>
              <div className="pt-2 border-t border-white/10">
                 <span className="font-bold text-[8px] opacity-40 uppercase tracking-widest block font-black mb-1">Status Report</span>
                 <div className="text-xl font-black text-white italic">
                   {bodyMetrics.wealth.incomeStreams > 1 ? "ELITE" : "FRAGILE"} <span className="text-[10px] text-white/20 uppercase ml-1">STANCE</span>
                 </div>
              </div>
           </div>
        </div>

        <button 
          onClick={() => setLogModalOpen(true, 'wealth', 'forex_win')}
          className="w-full py-4 mt-8 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center gap-3 group hover:bg-white/10 transition-all"
        >
          <Plus size={16} className="text-white/40 group-hover:text-[var(--stat-wealth)] group-hover:rotate-90 transition-all" />
          <span className="font-bold text-[10px] font-black text-white/40 group-hover:text-white uppercase tracking-[0.3em]">Register Financial Movement</span>
        </button>
      </DossierSection>

      <DossierSection title="Body" icon={Heart} momentum={bodyMetrics.gym.sessionsMonth > 15 ? "improving" : bodyMetrics.gym.sessionsMonth < 8 ? "declining" : "flat"}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="space-y-6">
                <div className="flex justify-between items-end">
                    <span className="font-bold text-[10px] text-white uppercase tracking-widest font-bold">Gym Consistency / Month</span>
                    <span className="font-bold text-2xl font-black text-white italic">{bodyMetrics.gym.sessionsMonth}/30 <span className="text-xs text-white/20 font-light ml-1">Sessions</span></span>
                </div>
                <div className="h-8 w-full bg-white/5 rounded-2xl overflow-hidden border border-white/10 p-1 flex gap-1">
                    {Array.from({ length: 30 }).map((_, i) => {
                        const date = new Date();
                        date.setDate(date.getDate() - (29 - i));
                        const hasSession = bodyMetrics.gym.uniqueDays.has(date.toDateString());
                        return (
                          <div key={i} className={cn(
                              "flex-1 rounded-sm transition-all",
                              hasSession ? "bg-emerald-400/80 shadow-[0_0_5px_rgba(52,211,153,0.3)]" : "bg-white/5"
                          )} />
                        );
                    })}
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <div className="p-4 bg-white/5 border border-white/5 rounded-2xl group cursor-pointer hover:bg-white/10 transition-all" onClick={() => setLogModalOpen(true, 'body', 'gym_session')}>
                      <div className="flex justify-between items-start mb-1">
                        <span className="block font-bold text-[8px] text-white/20 uppercase tracking-widest font-black">Longest Gym Streak</span>
                        <Plus size={10} className="text-white/20 group-hover:text-emerald-400 group-hover:rotate-90 transition-transform" />
                      </div>
                      <div className="font-bold text-xl font-black text-white italic">{bodyMetrics.gym.longestStreak} <span className="text-[8px] text-white/20 ml-1 uppercase">Days</span></div>
                   </div>
                   <div className="p-4 bg-white/5 border border-white/5 rounded-2xl">
                      <span className="block font-bold text-[8px] text-white/20 uppercase tracking-widest font-black mb-1">Rest Days</span>
                      <div className="font-bold text-xl font-black text-white italic">{bodyMetrics.gym.restDays} <span className="text-[8px] text-white/20 ml-1 uppercase">This Month</span></div>
                   </div>
                </div>
                
                <button 
                  onClick={() => setLogModalOpen(true, 'body', 'gym_session')}
                  className="w-full py-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center gap-3 group hover:bg-emerald-500/20 transition-all"
                >
                  <Plus size={16} className="text-emerald-400 group-hover:rotate-90 transition-transform" />
                  <span className="font-bold text-[10px] font-black text-emerald-400 uppercase tracking-widest">Register Gym Session</span>
                </button>
            </div>

            <div className="space-y-6 p-8 bg-blue-500/5 border border-blue-500/10 rounded-3xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                  <Moon size={120} />
                </div>
                <span className="font-bold text-[10px] text-blue-500/60 uppercase tracking-[0.2em] font-black">Sleep Recovery</span>
                <div className="flex items-center gap-6">
                    <div className="text-5xl font-black text-white italic tracking-tighter">
                      {bodyMetrics.sleep.avgHours.toFixed(1)}
                      <span className="text-xs text-white/20 ml-1 uppercase font-light">HOURS</span>
                    </div>
                    <div className={cn(
                      "flex items-center gap-2 font-bold text-[9px] font-black uppercase",
                      bodyMetrics.sleep.avgHours >= 7.5 ? "text-emerald-500/60" : "text-red-500/60"
                    )}>
                        {bodyMetrics.sleep.avgHours >= 7.5 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                        {bodyMetrics.sleep.avgHours >= 7.5 ? "Optimal Recovery" : "Below Target"}
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-blue-500/20">
                   <div>
                      <span className="block font-bold text-[8px] text-white/20 uppercase tracking-widest font-black mb-1">Current Streak</span>
                      <div className="font-bold text-lg font-black text-white">{bodyMetrics.sleep.currentStreak} <span className="text-[8px] text-white/20 ml-1 lowercase">days</span></div>
                   </div>
                   <div>
                      <span className="block font-bold text-[8px] text-white/20 uppercase tracking-widest font-black mb-1">Best Streak</span>
                      <div className="font-bold text-lg font-black text-white">{bodyMetrics.sleep.bestStreak} <span className="text-[8px] text-white/20 ml-1 lowercase">days</span></div>
                   </div>
                </div>

                <button 
                  onClick={() => setLogModalOpen(true, 'body', 'sleep_logged')}
                  className="w-full py-4 mt-2 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex items-center justify-center gap-3 group hover:bg-blue-500/20 transition-all"
                >
                  <Plus size={16} className="text-blue-400 group-hover:rotate-90 transition-transform" />
                  <span className="font-bold text-[10px] font-black text-blue-400 uppercase tracking-widest">Register Sleep Recovery</span>
                </button>
            </div>
        </div>
      </DossierSection>

      <DossierSection title="Brand" icon={Share2} momentum="declining">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
           <div className="p-6 bg-white/5 rounded-3xl space-y-2">
              <span className="font-bold text-[8px] text-white/20 uppercase tracking-widest block font-black">Twitter/X Followers</span>
              <div className="text-3xl font-black text-white italic tracking-tighter">COMING SOON</div>
           </div>
           <div className="p-6 bg-white/5 rounded-3xl space-y-2">
              <span className="font-bold text-[8px] text-white/20 uppercase tracking-widest block font-black">Posts / Month</span>
              <div className="text-3xl font-black text-white italic tracking-tighter">7</div>
              <div className="flex items-center gap-2 text-red-500/60 font-bold text-[8px] font-black uppercase">
                  Last post: 4 days ago
              </div>
           </div>
           <div className="p-6 bg-white/5 rounded-3xl space-y-2">
              <span className="font-bold text-[8px] text-white/20 uppercase tracking-widest block font-black">Blog Articles</span>
              <div className="text-3xl font-black text-red-500 italic tracking-tighter">0</div>
              <span className="font-bold text-[8px] text-red-500/40 uppercase font-black italic">VISIBLE GAP</span>
           </div>
           <div className="p-6 bg-white/5 rounded-3xl space-y-2">
              <span className="font-bold text-[8px] text-white/20 uppercase tracking-widest block font-black">GitHub Stars</span>
              <div className="text-3xl font-black text-white italic tracking-tighter">COMING SOON</div>
           </div>
        </div>
      </DossierSection>

      <DossierSection title="Network" icon={Users} momentum="declining">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="space-y-6">
               <div className="p-8 bg-white/5 border border-white/5 rounded-3xl space-y-6">
                  <span className="font-bold text-[10px] text-white/40 uppercase tracking-[0.2em] font-black">Outreach Metrics</span>
                  <div className="grid grid-cols-2 gap-8">
                     <div>
                        <span className="block font-bold text-[8px] text-white/20 uppercase tracking-widest font-black mb-1">Cold Messages Total</span>
                        <div className="font-bold text-3xl font-black text-white italic">18</div>
                     </div>
                     <div>
                        <span className="block font-bold text-[8px] text-white/20 uppercase tracking-widest font-black mb-1">Response Rate</span>
                        <div className="font-bold text-3xl font-black text-emerald-400 italic">11%</div>
                     </div>
                  </div>
                  <div className="pt-4 border-t border-white/5 flex gap-8">
                     <div>
                        <span className="block font-bold text-[8px] text-white/20 uppercase tracking-widest font-black mb-1">Referrals Asked</span>
                        <div className="font-bold text-lg font-black text-white italic">1</div>
                     </div>
                     <div>
                        <span className="block font-bold text-[8px] text-white/20 uppercase tracking-widest font-black mb-1">Referrals Received</span>
                        <div className="font-bold text-lg font-black text-white italic opacity-20">0</div>
                     </div>
                  </div>
               </div>
            </div>

            <div className="space-y-6">
               <div className="p-8 bg-red-500/5 border border-red-500/10 rounded-3xl space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-[10px] text-red-500/60 uppercase tracking-[0.2em] font-black">Stale Node Alert</span>
                    <span className="px-2 py-0.5 rounded bg-red-500 text-white font-bold text-[8px] font-black">URGENT</span>
                  </div>
                  <div className="text-4xl font-black text-white italic tracking-tighter">4 <span className="text-xs text-white/20 uppercase font-light ml-1">Contacts approaching cold</span></div>
                  <p className="text-[10px] font-bold text-white/40 uppercase font-black italic">
                    Nodes not contacted in 60+ days are at risk of link decay. Rekindle elite node connections before affinity resets to baseline.
                  </p>
                  <button className="flex items-center gap-2 text-[10px] font-bold font-black text-red-500 uppercase tracking-widest pt-2 group">
                    View Stale Contacts <ExternalLink size={10} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                  </button>
               </div>
            </div>
        </div>
      </DossierSection>
    </div>
  );
};
