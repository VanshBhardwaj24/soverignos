import { useMemo } from 'react';
import { useSovereignStore } from '../../store/sovereign';
import { Star, Shield, Users, Brain, Box } from 'lucide-react';

export const ProfileProgression = () => {
  const { prestige, unlockedSkills, inventory, nexusContacts, knowledgeCards } = useSovereignStore();

  const prestigeCount = useMemo(() => {
    return Object.values(prestige || {}).reduce((acc, val) => acc + (val as number), 0);
  }, [prestige]);

  const masteredCount = useMemo(() => {
    return knowledgeCards?.filter(c => c.mastered).length || 0;
  }, [knowledgeCards]);

  const eliteContacts = useMemo(() => {
    return nexusContacts?.filter(c => c.affinity === 'elite').length || 0;
  }, [nexusContacts]);

  return (
    <div className="bg-white/[0.03] border border-white/10 rounded-[40px] p-8 space-y-8 relative overflow-hidden backdrop-blur-md shadow-2xl">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-white/5 border border-white/10">
          <Shield size={16} className="text-white/60" />
        </div>
        <h3 className="font-mono text-[10px] tracking-[0.3em] text-white/40 uppercase font-black">System Progression</h3>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Prestige Stars */}
        <div className="p-5 bg-white/5 border border-white/5 rounded-3xl group hover:border-white/20 transition-all">
          <div className="flex items-center gap-3 mb-3">
             <Star size={14} className="text-yellow-400/60" />
             <span className="font-mono text-[8px] text-white/40 uppercase tracking-widest font-black">Prestige</span>
          </div>
          <div className="text-2xl font-black text-white italic tracking-tighter">
             {prestigeCount}<span className="text-[10px] text-white/20 ml-1 font-light uppercase">Stars</span>
          </div>
        </div>

        {/* Unlocked Skills */}
        <div className="p-5 bg-white/5 border border-white/5 rounded-3xl group hover:border-white/20 transition-all">
          <div className="flex items-center gap-3 mb-3">
             <Box size={14} className="text-blue-400/60" />
             <span className="font-mono text-[8px] text-white/40 uppercase tracking-widest font-black">Perks Active</span>
          </div>
          <div className="text-2xl font-black text-white italic tracking-tighter">
             {unlockedSkills.length}<span className="text-[10px] text-white/20 ml-1 font-light uppercase">Units</span>
          </div>
        </div>

        {/* Mind Vault */}
        <div className="p-5 bg-white/5 border border-white/5 rounded-3xl group hover:border-white/20 transition-all">
          <div className="flex items-center gap-3 mb-3">
             <Brain size={14} className="text-purple-400/60" />
             <span className="font-mono text-[8px] text-white/40 uppercase tracking-widest font-black">Neural Cards</span>
          </div>
          <div className="text-2xl font-black text-white italic tracking-tighter">
             {masteredCount}<span className="text-[10px] text-white/20 ml-1 font-light uppercase">Mastered</span>
          </div>
        </div>

        {/* Network Strength */}
        <div className="p-5 bg-white/5 border border-white/5 rounded-3xl group hover:border-white/20 transition-all">
          <div className="flex items-center gap-3 mb-3">
             <Users size={14} className="text-emerald-400/60" />
             <span className="font-mono text-[8px] text-white/40 uppercase tracking-widest font-black">Elite Nodes</span>
          </div>
          <div className="text-2xl font-black text-white italic tracking-tighter">
             {eliteContacts}<span className="text-[10px] text-white/20 ml-1 font-light uppercase">Linkages</span>
          </div>
        </div>
      </div>

      {/* Rare Inventory Summary */}
      <div className="p-6 bg-white/5 border border-white/10 rounded-3xl">
         <div className="flex justify-between items-center mb-4">
            <span className="font-mono text-[9px] text-white/40 uppercase tracking-widest font-black">Rare Artifacts</span>
            <span className="text-[10px] font-mono text-white/20">{inventory.length} TOTAL</span>
         </div>
         <div className="flex flex-wrap gap-2">
            {inventory.length > 0 ? inventory.slice(0, 5).map((_item, idx) => (
                <div key={idx} className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                    <div className="w-2 h-2 rounded bg-white/20" />
                </div>
            )) : (
                <div className="text-[10px] font-mono text-white/10 italic">NO HIGH-TIER ARTIFACTS DEPLOYED</div>
            )}
            {inventory.length > 5 && <div className="text-[10px] font-mono text-white/20 self-center">+{inventory.length - 5}</div>}
         </div>
      </div>
    </div>
  );
};
