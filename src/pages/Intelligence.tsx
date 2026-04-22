import { 
  Eye, 
  RefreshCw,
  Target
} from 'lucide-react';
import { useSovereignStore } from '../store/sovereign';
import { cn } from '../lib/utils';

// Phase 3 Components
import { IntelligenceChart } from '../components/intelligence/IntelligenceChart';
import { SurveillanceMatrix } from '../components/intelligence/SurveillanceMatrix';
import { ThroughputAnalysis } from '../components/intelligence/ThroughputAnalysis';
import { TrajectoryIntelligence } from '../components/intelligence/TrajectoryIntelligence';
import { CausalGraph } from '../components/intelligence/CausalGraph';
import { ComparativeIntelligence } from '../components/intelligence/ComparativeIntelligence';
import { AttentionAudit } from '../components/intelligence/AttentionAudit';
import { PredictionEngine } from '../components/intelligence/PredictionEngine';
import { EnvironmentSynergy } from '../components/intelligence/EnvironmentSynergy';
import { FlywheelVisualizer } from '../components/intelligence/FlywheelVisualizer';
import { IntelligenceLogs } from '../components/intelligence/IntelligenceLogs';
import { DecaySimulator } from '../components/intelligence/DecaySimulator';

const Intelligence = () => {
  const { 
    updateSurveillance, 
    runCausalityAnalysis,
  } = useSovereignStore();

  const handleRecalibrate = () => {
    updateSurveillance();
    runCausalityAnalysis(true);
  };

  return (
    <div className="p-8 pt-24 min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
      {/* Header */}
      <div className="flex justify-between items-end mb-12">
        <div>
          <h1 className="text-5xl font-black tracking-tighter flex items-center gap-4">
            <Eye className="text-blue-500 animate-pulse" size={48} />
            INTELLIGENCE
          </h1>
          <p className="text-[var(--text-secondary)] font-mono text-xs mt-2 tracking-[0.3em] uppercase">
            Command Center // Behavioral Stream: Active
          </p>
        </div>
        <button 
          onClick={handleRecalibrate}
          className="flex items-center gap-2 px-8 py-4 rounded-2xl border border-[var(--border-default)] bg-white/5 hover:bg-white/10 active:scale-95 transition-all font-mono text-xs tracking-widest uppercase group"
        >
          <RefreshCw size={14} className="group-active:rotate-180 transition-transform duration-500" />
          Recalibrate System
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Row 1: The Main Chart & Surveillance Matrix */}
        <div className="lg:col-span-8">
          <IntelligenceChart />
        </div>
        <div className="lg:col-span-4 h-full">
          <IntelligenceLogs />
        </div>

        {/* Row 2: Metrics Matrix */}
        <div className="lg:col-span-12">
          <SurveillanceMatrix />
        </div>

        {/* Row 3: Trajectory & Focus */}
        <div className="lg:col-span-7">
          <TrajectoryIntelligence />
        </div>
        <div className="lg:col-span-5">
           <FocusBalanceVisualizer />
        </div>

        {/* Row 4: Throughput & Comparative */}
        <div className="lg:col-span-8">
          <ThroughputAnalysis />
        </div>
        <div className="lg:col-span-4">
          <ComparativeIntelligence />
        </div>

        {/* Row 5: Flywheels & Predictions */}
        <div className="lg:col-span-6">
          <FlywheelVisualizer />
        </div>
        <div className="lg:col-span-6">
          <PredictionEngine />
        </div>

        {/* Row 6: Causal Graph & Attention Audit */}
        <div className="lg:col-span-5">
          <CausalGraph />
        </div>
        <div className="lg:col-span-7">
          <AttentionAudit />
        </div>

        {/* Row 7: Environment & Decay */}
        <div className="lg:col-span-5">
          <EnvironmentSynergy />
        </div>
        <div className="lg:col-span-7">
          <DecaySimulator />
        </div>
      </div>
    </div>
  );
};

const FocusBalanceVisualizer = () => {
  const { surveillanceMetrics } = useSovereignStore();
  const balance = surveillanceMetrics.focusBalance || 0;

  const stats = [
    { name: 'CODE', actual: 52, optimal: 25, status: 'OVER-INDEXED', color: 'bg-blue-400' },
    { name: 'BODY', actual: 25, optimal: 20, status: 'BALANCED', color: 'bg-emerald-400' },
    { name: 'MIND', actual: 12, optimal: 15, status: 'DEFICIT', color: 'bg-purple-400' },
    { name: 'WEALTH', actual: 6, optimal: 15, status: 'UNDER-INDEXED', color: 'bg-orange-400' },
    { name: 'BRAND', actual: 3, optimal: 15, status: 'CRITICAL', color: 'bg-pink-400' },
    { name: 'NETWORK', actual: 1, optimal: 10, status: 'CRITICAL', color: 'bg-red-400' },
  ];

  return (
    <section className="p-8 rounded-3xl border border-[var(--border-default)] bg-white/[0.02] backdrop-blur-xl h-full">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-2">
          <Target size={18} className="text-pink-400" />
          <h2 className="font-mono text-xs tracking-[0.2em] uppercase text-[var(--text-secondary)]">Focus Balance: {balance}%</h2>
        </div>
        <span className={cn(
          "font-mono text-[9px] px-2 py-1 rounded-full uppercase tracking-widest",
          balance > 60 ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"
        )}>
          {balance > 60 ? "Balanced" : "Imbalanced ⚠"}
        </span>
      </div>

      <div className="space-y-4">
        {stats.map((stat, i) => (
          <div key={i} className="space-y-1">
            <div className="flex justify-between items-end text-[9px] font-mono uppercase">
              <span className="text-white/60">{stat.name}</span>
              <span className={cn(
                "font-black",
                stat.status === 'BALANCED' ? 'text-emerald-400' : 'text-red-400'
              )}>{stat.status}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden flex">
                <div className={cn("h-full", stat.color)} style={{ width: `${stat.actual}%` }} />
              </div>
              <span className="font-mono text-[10px] text-white w-8 text-right font-bold">{stat.actual}%</span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 rounded-xl bg-pink-500/5 border border-pink-500/10">
        <p className="text-[10px] text-pink-300 font-mono leading-tight">
          IMBALANCE COST: Over-indexing CODE by 27% creates a distribution bottleneck. BRAND and NETWORK atrophy will stall your Freedom Score.
        </p>
      </div>
    </section>
  );
};

export default Intelligence;
