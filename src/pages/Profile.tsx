import { useSovereignStore } from '../store/sovereign';
import { ProfileHeader } from '../components/profile/ProfileHeader';
import { StatDossier } from '../components/profile/StatDossier';
import { LifeTimeline } from '../components/profile/LifeTimeline';
import { BehavioralDossier } from '../components/profile/BehavioralDossier';
import { SystemHealthRecord } from '../components/profile/SystemHealthRecord';
import { VisionBoard } from '../components/profile/VisionBoard';
import { IntegrationPanel } from '../components/profile/IntegrationPanel';
import { SovereigntyBar } from '../components/profile/SovereigntyBar';
import { IdentityGrid } from '../components/profile/IdentityGrid';
import { Shield, Share2, Search } from 'lucide-react';
import { toast } from 'sonner';

export default function Profile() {
  const { alias, statXP } = useSovereignStore();

  const totalXP = Object.values(statXP).reduce((acc, curr) => acc + curr, 0);

  const handleExport = () => {
    toast.info('INITIALIZING EXPORT PROTOCOL', {
      description: 'Generating high-fidelity glassmorphic passport card...',
      duration: 3000
    });
    setTimeout(() => {
      toast.success('EXPORT COMPLETE', {
        description: `Sovereign Passport for ${alias.toUpperCase()} archived to system.`
      });
    }, 3500);
  };

  return (
    <div className="max-w-7xl mx-auto pb-32 animate-in fade-in duration-1000 space-y-20">
      {/* Top Navigation / Breadcrumb */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-white/5 border border-white/10">
            <Shield size={20} className="text-white/60" />
          </div>
          <div>
            <h1 className="text-4xl font-black text-white italic uppercase tracking-tighter">
              The <span className="text-white/20">Dossier</span>
            </h1>
            <p className="font-mono text-[10px] text-white/40 uppercase tracking-[0.3em] font-black mt-1">
              Operator Signature: {alias.toUpperCase()} // Alpha-9
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-3 px-4 py-2 rounded-xl bg-white/5 border border-white/10">
            <Search size={14} className="text-white/20" />
            <span className="font-mono text-[9px] text-white/20 uppercase font-black tracking-widest">Search Profile Archives...</span>
          </div>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-white text-black font-black font-mono text-[10px] tracking-widest hover:scale-105 active:scale-95 transition-all shadow-2xl"
          >
            <Share2 size={14} strokeWidth={3} />
            EXPORT DOSSIER
          </button>
        </div>
      </div>

      {/* Main Sections Stack */}
      <div className="space-y-32">


        {/* Core Identity & Obituary Test (Section 1) */}
        <section id="identity" className="space-y-12">
          <ProfileHeader />
          <IdentityGrid />
          {/* Overall Progression Bar */}
          <section id="sovereignty">
            <SovereigntyBar totalXP={totalXP} />
          </section>
        </section>

        {/* Stat Breakdown (Section 2) */}
        <section id="stats">
          <StatDossier />
        </section>

        {/* Life History (Section 3) */}
        <section id="timeline">
          <LifeTimeline />
        </section>

        {/* Behavioral Analysis (Section 4) */}
        <section id="behavior">
          <BehavioralDossier />
        </section>

        {/* System Health (Section 5) */}
        <section id="health">
          <SystemHealthRecord />
        </section>

        {/* Vision & Goals (Section 6) */}
        <section id="vision">
          <VisionBoard />
        </section>

        {/* External Connectivity (Section 7) */}
        <section id="integrations">
          <IntegrationPanel />
        </section>
      </div>

      {/* Decorative System Footer */}
      <div className="pt-16 border-t border-white/5 flex flex-col md:flex-row justify-between gap-8">
        <div className="flex flex-wrap gap-8">
          <div className="flex flex-col">
            <span className="font-mono text-[8px] text-white/20 uppercase tracking-widest font-black">Authentication Status</span>
            <span className="font-mono text-[10px] text-emerald-400 font-bold uppercase">SECURED (LEVEL 4)</span>
          </div>
          <div className="flex flex-col">
            <span className="font-mono text-[8px] text-white/20 uppercase tracking-widest font-black">Data Latency</span>
            <span className="font-mono text-[10px] text-white/60 font-bold uppercase">0.4ms // Global Sync</span>
          </div>
          <div className="flex flex-col">
            <span className="font-mono text-[8px] text-white/20 uppercase tracking-widest font-black">Behavioral Confidence</span>
            <span className="font-mono text-[10px] text-white/40 font-bold uppercase">87.4% (CALIBRATING)</span>
          </div>
        </div>
        <div className="space-y-1 text-right">
          <div className="font-mono text-[8px] text-white/10 uppercase tracking-[0.4em] font-black">
            Sovereign Operating System // v2.4.0_EXPANDED
          </div>
          <div className="font-mono text-[8px] text-white/5 uppercase tracking-widest italic">
            This dossier is an accurate reflection of your actual output. Self-delusion is the only error.
          </div>
        </div>
      </div>
    </div>
  );
}
