import { useSovereignStore } from '../../store/sovereign';
import { GitBranch, Code, Share2, Link2, Mail, MessageSquare, ShieldCheck, RefreshCw } from 'lucide-react';
import { cn } from '../../lib/utils';

export const IntegrationPanel = () => {
  const { integrationStatus } = useSovereignStore();

  const integrations = [
    { 
      id: 'github', 
      name: 'GitHub', 
      icon: GitBranch, 
      status: integrationStatus.github.connected, 
      details: `@vansh_lc | Commits this week: ${integrationStatus.github.commitsWeek}`, 
      sync: integrationStatus.github.lastSync 
    },
    { 
      id: 'leetcode', 
      name: 'LeetCode', 
      icon: Code, 
      status: integrationStatus.leetcode.connected, 
      details: `@vansh_lc | Streak: 3 days | Solved: ${integrationStatus.leetcode.solvedTotal}`, 
      sync: integrationStatus.leetcode.lastSync 
    },
    { 
      id: 'twitter', 
      name: 'Twitter/X', 
      icon: Share2, 
      status: integrationStatus.twitter.connected, 
      details: `Followers: [live] | Posts this month: ${integrationStatus.twitter.postsMonth}`, 
      sync: 'LIVE' 
    },
    { 
      id: 'trademind', 
      name: 'TradeMind', 
      icon: Link2, 
      status: integrationStatus.trademind.connected, 
      details: `Linked (fxjournal.live) | Manual Sync`, 
      sync: integrationStatus.trademind.lastSync 
    },
    { 
      id: 'resend', 
      name: 'Resend', 
      icon: Mail, 
      status: true, 
      details: `Active — daily digest sending`, 
      sync: '09:02 AM' 
    },
    { 
      id: 'whatsapp', 
      name: 'WhatsApp', 
      icon: MessageSquare, 
      status: true, 
      details: `+91XXXXXXXXXX | Messages: 34 sent`, 
      sync: 'YESTERDAY 8:00 PM' 
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3 text-white/20 px-4">
        <div className="w-8 h-px bg-white/10" />
        <h2 className="font-mono text-[10px] font-black tracking-[0.4em] uppercase">Data Integrations — Connected Systems</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {integrations.map((item, i) => (
          <div key={i} className={cn(
            "p-6 border rounded-[32px] transition-all flex flex-col gap-6",
            item.status ? "bg-white/[0.02] border-white/5" : "bg-white/[0.01] border-white/[0.02] opacity-40 grayscale"
          )}>
            <div className="flex items-center justify-between">
               <div className="flex items-center gap-4">
                  <div className={cn(
                    "p-3 rounded-2xl bg-white/5 border border-white/10",
                    item.status ? "text-white" : "text-white/20"
                  )}>
                    <item.icon size={20} />
                  </div>
                  <div>
                    <h4 className="font-black text-white uppercase italic tracking-tighter">{item.name}</h4>
                    <div className="flex items-center gap-1.5 mt-0.5">
                       <div className={cn("w-1 h-1 rounded-full", item.status ? "bg-emerald-400" : "bg-white/20")} />
                       <span className="font-mono text-[8px] text-white/20 uppercase font-black tracking-widest">{item.status ? 'Connected' : 'Not Connected'}</span>
                    </div>
                  </div>
               </div>
               {item.status && <button className="text-white/10 hover:text-white/40 transition-colors"><RefreshCw size={14} /></button>}
            </div>

            <div className="space-y-1">
               <p className="font-mono text-[10px] text-white/60 lowercase italic h-8 line-clamp-2">
                 {item.details}
               </p>
               <div className="pt-4 border-t border-white/5 flex items-center justify-between font-mono text-[8px] text-white/20 uppercase font-black tracking-widest">
                  <span>Last Sync: {item.sync}</span>
                  {item.status && <ShieldCheck size={10} className="text-emerald-500/40" />}
               </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-blue-600/10 border border-blue-600/20 rounded-[32px] p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8 group">
         <div className="space-y-4 text-center md:text-left">
            <h3 className="text-3xl font-black text-white italic uppercase tracking-tighter">Initialize Vault Feature</h3>
            <p className="text-[10px] font-mono text-blue-400/60 uppercase font-black italic max-w-xl">
               Razorpay node currently inactive. Connect your merchant gateway to expand the WEALTH DOSSIER with live liquidity tracking and venture revenue automation.
            </p>
         </div>
         <button className="px-10 py-4 bg-white text-black rounded-2xl font-black text-[12px] tracking-widest uppercase hover:scale-105 active:scale-95 transition-all shadow-2xl">
            Connect Gateway
         </button>
      </div>
    </div>
  );
};
