import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Code, TrendingDown, TrendingUp, DollarSign, Heart, Share2, Users, ExternalLink } from 'lucide-react';
import { cn } from '../../lib/utils';

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
              <span className="font-mono text-[8px] text-white/20 uppercase tracking-[0.2em] font-black">Status Intensity:</span>
              {momentum === 'declining' ? (
                <div className="flex items-center gap-1 text-red-500/60 font-mono text-[8px] font-black uppercase">
                  <TrendingDown size={10} /> DECLINING — IMMEDIATE ACTION REQUIRED
                </div>
              ) : momentum === 'improving' ? (
                <div className="flex items-center gap-1 text-emerald-500/60 font-mono text-[8px] font-black uppercase">
                  <TrendingUp size={10} /> IMPROVING — MOMENTUM SECURED
                </div>
              ) : (
                <div className="flex items-center gap-1 text-blue-500/60 font-mono text-[8px] font-black uppercase">
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
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 text-white/20 px-4">
        <div className="w-8 h-px bg-white/10" />
        <h2 className="font-mono text-[10px] font-black tracking-[0.4em] uppercase">Stat Dossier — Deep Personal Metrics</h2>
      </div>

      <DossierSection title="Code" icon={Code} momentum="improving" isInitiallyExpanded={true}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-6">
            <h4 className="font-mono text-[10px] text-white/40 uppercase tracking-[0.2em] font-black">LeetCode Analysis</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-6 bg-white/5 rounded-3xl space-y-2">
                 <span className="font-mono text-[8px] text-white/20 uppercase tracking-widest block font-black">Total Solved</span>
                 <div className="text-3xl font-black text-white italic tracking-tighter">143</div>
                 <div className="flex gap-2 text-[8px] font-mono font-black uppercase">
                    <span className="text-emerald-400">E: 67</span> • <span className="text-yellow-400">M: 58</span> • <span className="text-red-400">H: 18</span>
                 </div>
              </div>
              <div className="p-6 bg-white/5 rounded-3xl space-y-2">
                 <span className="font-mono text-[8px] text-white/20 uppercase tracking-widest block font-black">Avg Time (Medium)</span>
                 <div className="text-3xl font-black text-white italic tracking-tighter">47 <span className="text-xs text-white/20">MIN</span></div>
                 <span className="text-[8px] font-mono text-red-500/60 font-black uppercase">Target: &lt;30 MIN</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="font-mono text-[8px] text-white/20 uppercase tracking-widest block font-black w-full mb-2">Category Mastery</span>
              {['Arrays', 'Strings', 'HashMap'].map(c => (
                <span key={c} className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[9px] font-mono text-emerald-400 font-bold">{c}</span>
              ))}
              <span className="font-mono text-[8px] text-white/20 uppercase tracking-widest block font-black w-full my-2">Weak Points</span>
              {['Graphs', 'DP', 'Trees'].map(c => (
                <span key={c} className="px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-[9px] font-mono text-red-400 font-bold">{c}</span>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <h4 className="font-mono text-[10px] text-white/40 uppercase tracking-[0.2em] font-black">GitHub & Workflow</h4>
            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <span className="font-mono text-[10px] text-white uppercase tracking-widest font-bold">GitHub Streak</span>
                <span className="font-mono text-[10px] text-white/40">Current: 3 Days | Longest: 14 Days</span>
              </div>
              <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden flex">
                 <div className="h-full bg-emerald-400 shadow-[0_0_10px_#34d399]" style={{ width: '21%' }} />
              </div>
              <div className="grid grid-cols-2 gap-4 pt-2">
                 <div className="p-4 bg-white/5 border border-white/5 rounded-2xl">
                    <span className="block font-mono text-[8px] text-white/20 uppercase tracking-widest font-black mb-1">Open Source PRs</span>
                    <div className="font-mono text-xl font-black text-white italic">12 <span className="text-[8px] text-white/20 ml-1">MERGED</span></div>
                 </div>
                 <div className="p-4 bg-white/5 border border-white/5 rounded-2xl">
                    <span className="block font-mono text-[8px] text-white/20 uppercase tracking-widest font-black mb-1">Total Commits</span>
                    <div className="font-mono text-xl font-black text-white italic">340+</div>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </DossierSection>

      <DossierSection title="Wealth" icon={DollarSign} momentum="flat">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
           <div className="p-6 bg-white/5 rounded-3xl space-y-4">
              <span className="font-mono text-[10px] text-white/40 uppercase tracking-[0.2em] font-black">Trading Status</span>
              <div className="space-y-1">
                 <div className="text-2xl font-black text-white italic tracking-tighter uppercase">GFT $5k — Phase 2</div>
                 <span className="text-[10px] font-mono text-emerald-400 font-black tracking-widest uppercase">Target Achieved / Cleared</span>
              </div>
              <div className="space-y-2">
                 <span className="font-mono text-[8px] text-white/20 uppercase tracking-widest block font-black">Current Drawdown</span>
                 <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-400" style={{ width: '15%' }} />
                 </div>
                 <span className="font-mono text-[8px] text-white/40 uppercase font-black text-right block">Limit: 4% Daily</span>
              </div>
           </div>

           <div className="p-6 bg-white/5 rounded-3xl space-y-4">
              <span className="font-mono text-[10px] text-white/40 uppercase tracking-[0.2em] font-black">Performance</span>
              <div className="grid grid-cols-2 gap-4">
                 <div>
                    <span className="block font-mono text-[8px] text-white/20 uppercase tracking-widest font-black mb-1">Win Rate</span>
                    <div className="font-mono text-xl font-black text-emerald-400 italic">56.0%</div>
                 </div>
                 <div>
                    <span className="block font-mono text-[8px] text-white/20 uppercase tracking-widest font-black mb-1">Avg R-Multiple</span>
                    <div className="font-mono text-xl font-black text-white italic">1.41R</div>
                 </div>
              </div>
              <div className="pt-2 border-t border-white/5">
                 <span className="font-mono text-[8px] text-white/20 uppercase tracking-widest block font-black mb-1">Primary Pairs</span>
                 <div className="flex gap-2">
                    <span className="px-2 py-0.5 rounded bg-white/5 font-mono text-[8px] text-white font-bold">XAU/USD</span>
                    <span className="px-2 py-0.5 rounded bg-white/5 font-mono text-[8px] text-white font-bold">USD/JPY</span>
                 </div>
              </div>
           </div>

           <div className="p-6 bg-red-500/5 border border-red-500/10 rounded-3xl space-y-4">
              <span className="font-mono text-[10px] text-red-500/60 uppercase tracking-[0.2em] font-black">Income Streams</span>
              <div className="text-5xl font-black text-red-500 italic tracking-tighter">0</div>
              <p className="text-[10px] font-mono text-red-500/40 uppercase font-black leading-tight italic">
                This number should hurt. Lack of diversity is the primary vulnerability in the current protocol.
              </p>
              <div className="pt-2 border-t border-red-500/20">
                 <span className="font-mono text-[8px] text-red-500/40 uppercase tracking-widest block font-black mb-1">First Target</span>
                 <div className="text-xl font-black text-white italic">₹30,000 <span className="text-[10px] text-white/20 uppercase ml-1">/ MONTH</span></div>
              </div>
           </div>
        </div>
      </DossierSection>

      <DossierSection title="Body" icon={Heart} momentum="declining">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="space-y-6">
                <div className="flex justify-between items-end">
                    <span className="font-mono text-[10px] text-white uppercase tracking-widest font-bold">Gym Consistency / Month</span>
                    <span className="font-mono text-2xl font-black text-white italic">14/30 <span className="text-xs text-white/20 font-light ml-1">Sessions</span></span>
                </div>
                <div className="h-8 w-full bg-white/5 rounded-2xl overflow-hidden border border-white/10 p-1 flex gap-1">
                    {Array.from({ length: 30 }).map((_, i) => (
                        <div key={i} className={cn(
                            "flex-1 rounded-sm transition-all",
                            i < 14 ? "bg-emerald-400/80 shadow-[0_0_5px_rgba(52,211,153,0.3)]" : "bg-white/5"
                        )} />
                    ))}
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <div className="p-4 bg-white/5 border border-white/5 rounded-2xl">
                      <span className="block font-mono text-[8px] text-white/20 uppercase tracking-widest font-black mb-1">Longest Gym Streak</span>
                      <div className="font-mono text-xl font-black text-white italic">21 <span className="text-[8px] text-white/20 ml-1 uppercase">Days</span></div>
                   </div>
                   <div className="p-4 bg-white/5 border border-white/5 rounded-2xl">
                      <span className="block font-mono text-[8px] text-white/20 uppercase tracking-widest font-black mb-1">Rest Days</span>
                      <div className="font-mono text-xl font-black text-white italic">4 <span className="text-[8px] text-white/20 ml-1 uppercase">This Month</span></div>
                   </div>
                </div>
            </div>

            <div className="space-y-6 p-8 bg-blue-500/5 border border-blue-500/10 rounded-3xl">
                <span className="font-mono text-[10px] text-blue-500/60 uppercase tracking-[0.2em] font-black">Sleep Recovery</span>
                <div className="flex items-center gap-6">
                    <div className="text-5xl font-black text-white italic tracking-tighter">6.1<span className="text-xs text-white/20 ml-1 uppercase font-light">HOURS</span></div>
                    <div className="flex items-center gap-2 text-red-500/60 font-mono text-[9px] font-black uppercase">
                        <TrendingDown size={14} /> Below Target
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-blue-500/20">
                   <div>
                      <span className="block font-mono text-[8px] text-white/20 uppercase tracking-widest font-black mb-1">Current Streak</span>
                      <div className="font-mono text-lg font-black text-white">3 <span className="text-[8px] text-white/20 ml-1 lowercase">days</span></div>
                   </div>
                   <div>
                      <span className="block font-mono text-[8px] text-white/20 uppercase tracking-widest font-black mb-1">Best Streak</span>
                      <div className="font-mono text-lg font-black text-white">12 <span className="text-[8px] text-white/20 ml-1 lowercase">days</span></div>
                   </div>
                </div>
            </div>
        </div>
      </DossierSection>

      <DossierSection title="Brand" icon={Share2} momentum="declining">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
           <div className="p-6 bg-white/5 rounded-3xl space-y-2">
              <span className="font-mono text-[8px] text-white/20 uppercase tracking-widest block font-black">Twitter/X Followers</span>
              <div className="text-3xl font-black text-white italic tracking-tighter">COMING SOON</div>
           </div>
           <div className="p-6 bg-white/5 rounded-3xl space-y-2">
              <span className="font-mono text-[8px] text-white/20 uppercase tracking-widest block font-black">Posts / Month</span>
              <div className="text-3xl font-black text-white italic tracking-tighter">7</div>
              <div className="flex items-center gap-2 text-red-500/60 font-mono text-[8px] font-black uppercase">
                  Last post: 4 days ago
              </div>
           </div>
           <div className="p-6 bg-white/5 rounded-3xl space-y-2">
              <span className="font-mono text-[8px] text-white/20 uppercase tracking-widest block font-black">Blog Articles</span>
              <div className="text-3xl font-black text-red-500 italic tracking-tighter">0</div>
              <span className="font-mono text-[8px] text-red-500/40 uppercase font-black italic">VISIBLE GAP</span>
           </div>
           <div className="p-6 bg-white/5 rounded-3xl space-y-2">
              <span className="font-mono text-[8px] text-white/20 uppercase tracking-widest block font-black">GitHub Stars</span>
              <div className="text-3xl font-black text-white italic tracking-tighter">COMING SOON</div>
           </div>
        </div>
      </DossierSection>

      <DossierSection title="Network" icon={Users} momentum="declining">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="space-y-6">
               <div className="p-8 bg-white/5 border border-white/5 rounded-3xl space-y-6">
                  <span className="font-mono text-[10px] text-white/40 uppercase tracking-[0.2em] font-black">Outreach Metrics</span>
                  <div className="grid grid-cols-2 gap-8">
                     <div>
                        <span className="block font-mono text-[8px] text-white/20 uppercase tracking-widest font-black mb-1">Cold Messages Total</span>
                        <div className="font-mono text-3xl font-black text-white italic">18</div>
                     </div>
                     <div>
                        <span className="block font-mono text-[8px] text-white/20 uppercase tracking-widest font-black mb-1">Response Rate</span>
                        <div className="font-mono text-3xl font-black text-emerald-400 italic">11%</div>
                     </div>
                  </div>
                  <div className="pt-4 border-t border-white/5 flex gap-8">
                     <div>
                        <span className="block font-mono text-[8px] text-white/20 uppercase tracking-widest font-black mb-1">Referrals Asked</span>
                        <div className="font-mono text-lg font-black text-white italic">1</div>
                     </div>
                     <div>
                        <span className="block font-mono text-[8px] text-white/20 uppercase tracking-widest font-black mb-1">Referrals Received</span>
                        <div className="font-mono text-lg font-black text-white italic opacity-20">0</div>
                     </div>
                  </div>
               </div>
            </div>

            <div className="space-y-6">
               <div className="p-8 bg-red-500/5 border border-red-500/10 rounded-3xl space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="font-mono text-[10px] text-red-500/60 uppercase tracking-[0.2em] font-black">Stale Node Alert</span>
                    <span className="px-2 py-0.5 rounded bg-red-500 text-white font-mono text-[8px] font-black">URGENT</span>
                  </div>
                  <div className="text-4xl font-black text-white italic tracking-tighter">4 <span className="text-xs text-white/20 uppercase font-light ml-1">Contacts approaching cold</span></div>
                  <p className="text-[10px] font-mono text-white/40 uppercase font-black italic">
                    Nodes not contacted in 60+ days are at risk of link decay. Rekindle elite node connections before affinity resets to baseline.
                  </p>
                  <button className="flex items-center gap-2 text-[10px] font-mono font-black text-red-500 uppercase tracking-widest pt-2 group">
                    View Stale Contacts <ExternalLink size={10} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                  </button>
               </div>
            </div>
        </div>
      </DossierSection>
    </div>
  );
};
