import { memo } from 'react';
import { useSovereignStore } from '../../store/sovereign';
import { Shield, Target, Zap, Award, Lock } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

export const GrowthTab = memo(function GrowthTab() {
  const { statLevels } = useSovereignStore();

  const skills = [
    { id: 'fe', name: 'Frontend Architect', stat: 'code', level: 10, unlocked: statLevels.code >= 10 },
    { id: 'macro', name: 'Macro Strategist', stat: 'wealth', level: 8, unlocked: statLevels.wealth >= 8 },
    { id: 'bio', name: 'Bio-Optimizer', stat: 'body', level: 5, unlocked: statLevels.body >= 5 },
    { id: 'zen', name: 'Stoic Sage', stat: 'mind', level: 3, unlocked: statLevels.mind >= 3 },
    { id: 'brand', name: 'Viral Catalyst', stat: 'brand', level: 5, unlocked: statLevels.brand >= 5 },
  ];

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 p-8 md:p-12 overflow-y-auto no-scrollbar h-full">
      <div className="mb-12">
        <h1 className="font-bold text-[10px] tracking-[0.4em] text-white/40 uppercase mb-2">SYSTEM EVOLUTION</h1>
        <h2 className="font-bold text-4xl font-black text-white tracking-tighter uppercase">Capabilities Growth</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left Column: Skill Tree */}
        <div className="lg:col-span-8">
           <div className="p-8 rounded-[40px] bg-white/[0.02] border border-white/5 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-5">
                 <Target size={200} />
              </div>

              <div className="flex items-center justify-between mb-8">
                <h3 className="font-bold text-xs font-black tracking-widest text-white uppercase flex items-center gap-2">
                   <Zap size={16} className="text-[#FFB800]" /> Spec Tree [BETA]
                </h3>
                <span className="font-bold text-[10px] text-white/20 uppercase">Skill Points: 0</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 {skills.map(skill => (
                   <div 
                    key={skill.id}
                    className={cn(
                      "p-6 rounded-3xl border transition-all relative overflow-hidden group",
                      skill.unlocked ? "bg-white/[0.04] border-white/10" : "bg-black/20 border-white/5 opacity-40 grayscale"
                    )}
                   >
                      <div className="flex justify-between items-start mb-4">
                         <div className={cn(
                           "h-12 w-12 rounded-2xl flex items-center justify-center",
                           skill.unlocked ? "bg-white/10 text-white" : "bg-white/5 text-white/20"
                         )}>
                            {skill.unlocked ? <Award size={24} /> : <Lock size={20} />}
                         </div>
                         <span className="font-bold text-[9px] text-white/20 uppercase font-black">Req. {skill.stat} Lvl {skill.level}</span>
                      </div>
                      <h4 className="font-bold text-sm font-black text-white uppercase mb-1">{skill.name}</h4>
                      <div className="flex items-center gap-2">
                         <div className="h-1 flex-1 bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full bg-white/40" style={{ width: skill.unlocked ? '100%' : '0%' }} />
                         </div>
                         <span className="font-bold text-[10px] text-white/40 uppercase">{skill.unlocked ? 'Unlocked' : 'Locked'}</span>
                      </div>
                   </div>
                 ))}
              </div>
           </div>
        </div>

        {/* Right Column: Milestone Ledger */}
        <div className="lg:col-span-4 space-y-8">
           <div className="p-8 rounded-[40px] bg-[#111] border border-white/10 shadow-2xl">
              <h3 className="font-bold text-xs font-black tracking-widest text-white uppercase mb-6 flex items-center gap-2">
                 <Shield size={16} className="text-[#00D1FF]" /> Rank History
              </h3>
              
              <div className="space-y-6">
                {[
                  { title: 'Senior Analyst', date: '2024-04-18', score: 40.5 },
                  { title: 'Junior Operative', date: '2024-04-10', score: 22.1 },
                  { title: 'Rookie Initiate', date: '2024-04-01', score: 5.0 },
                ].map((milestone, i) => (
                  <div key={i} className="flex gap-4 relative group">
                    {i !== 2 && <div className="absolute left-[7px] top-5 bottom-[-24px] w-[1px] bg-white/5" />}
                    <div className="h-4 w-4 rounded-full bg-white/10 border border-white/20 shrink-0 mt-1 relative z-10 group-hover:bg-[#00D1FF] transition-colors" />
                    <div>
                      <h4 className="font-bold text-[11px] font-black text-white uppercase mb-1">{milestone.title}</h4>
                      <p className="font-bold text-[9px] text-white/20 uppercase tracking-widest mb-1">{milestone.date}</p>
                      <div className="flex items-center gap-1.5 text-[9px] font-bold text-[#00D1FF] font-black">
                         SCORE ARCHIVED: {milestone.score}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
           </div>

           <div className="p-8 rounded-[40px] bg-gradient-to-br from-[#111] to-[#000] border border-white/5">
              <h3 className="font-bold text-[11px] font-black text-white/40 uppercase mb-4 tracking-widest">Growth Forecast</h3>
              <p className="text-[10px] text-white/30 leading-relaxed font-medium mb-6 uppercase tracking-tighter">
                Based on current trajectory, <span className="text-white">Master Adaptor</span> rank achievable in 14 cycles. Double wealth logging to accelerate.
              </p>
              <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                 <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: '42%' }}
                  className="h-full bg-[#00FFA3]"
                 />
              </div>
           </div>
        </div>
      </div>
    </div>
  );
});
