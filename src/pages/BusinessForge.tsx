import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Box, ArrowUpRight,
  Cpu, LineChart, Layout, Sparkles, Plus, X,
  DollarSign, Filter, Wallet, Target
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useSovereignStore, type Venture } from '../store/sovereign';
import { ModalPortal } from '../components/ui/ModalPortal';

export default function BusinessForge() {
  const {
    ventures, addVenture, addVentureRevenue,
    portfolios
  } = useSovereignStore();
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newType, setNewType] = useState<Venture['type']>('SAAS');

  const aggregateRevenue = ventures.reduce((sum, v) => sum + v.revenue, 0) || 12450;
  const activeCount = ventures.length || 4;

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName) return;
    addVenture({
      name: newName,
      description: newDesc,
      type: newType,
      revenue: 0,
      expenses: 100, // Default seed expense for ROI calculation
      status: 'active'
    });
    setIsAdding(false);
    setNewName('');
    setNewDesc('');
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-[1400px] mx-auto pb-12">

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <p className="eyebrow text-[var(--stat-brand)] mb-2">Venture Foundry</p>
          <h1 className="h-display italic">
            Business Command <span className="text-white/20">/</span> <span className="text-white/40">Forge</span>
          </h1>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsAdding(true)}
            className="h-14 px-6 bg-[var(--stat-brand)] text-white rounded-2xl flex items-center gap-3 font-bold text-xs font-black tracking-widest hover:brightness-110 transition-all shadow-[0_0_20px_rgba(236,72,153,0.2)]"
          >
            <Plus size={18} /> INITIALIZE VENTURE
          </button>

          <div className="surface-card p-4 flex items-center gap-8 shadow-2xl">
            <div className="text-right">
              <span className="block stat-label text-white/30">Aggregate Revenue</span>
              <span className="text-xl font-bold font-black text-[var(--stat-wealth)]">${aggregateRevenue.toLocaleString()}</span>
            </div>
            <div className="h-10 w-px bg-white/10" />
            <div className="text-right">
              <span className="block stat-label text-white/30">Active Ventures</span>
              <span className="text-xl font-bold font-black text-white">{activeCount.toString().padStart(2, '0')}</span>
            </div>
          </div>
        </div>
      </div>

      <ModalPortal>
        <AnimatePresence>
          {isAdding && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <form onSubmit={handleAdd} className="w-full max-w-lg surface-card p-8 shadow-2xl relative">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="absolute top-6 right-6 text-white/20 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>

              <h3 className="h-section text-white mb-8 border-b border-white/5 pb-4 italic">Initialize venture protocol</h3>

              <div className="space-y-6">
                <div>
                  <label className="block text-[8px] font-bold text-white/30 uppercase tracking-widest mb-2">Venture Name</label>
                  <input
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                    placeholder="E.g. Nexus Multi-Agent Swarm"
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white outline-none focus:border-[var(--stat-brand)]"
                  />
                </div>

                <div>
                  <label className="block text-[8px] font-bold text-white/30 uppercase tracking-widest mb-2">Classification</label>
                  <select
                    value={newType}
                    onChange={e => setNewType(e.target.value as any)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white outline-none focus:border-[var(--stat-brand)] appearance-none"
                  >
                    <option value="SAAS">SOFTWARE AS A SERVICE</option>
                    <option value="E-COMM">E-COMMERCE</option>
                    <option value="TRADING">TACTICAL TRADING</option>
                    <option value="CONTENT">CONTENT / BRAND</option>
                    <option value="SERVICE">SERVICE / AGENCY</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[8px] font-bold text-white/30 uppercase tracking-widest mb-2">Tactical Summary</label>
                  <textarea
                    value={newDesc}
                    onChange={e => setNewDesc(e.target.value)}
                    placeholder="Define objective and mission scope..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white outline-none focus:border-[var(--stat-brand)] h-24 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="btn-primary w-full py-4"
                >
                  DEPLOY TO FORGE
                </button>
              </div>
            </form>
          </motion.div>
        )}
        </AnimatePresence>
      </ModalPortal>

      <div className="mb-12">
        <VenturePnL />
      </div>

      <div className="space-y-12">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {ventures.map(v => {
            const expense = v.expenses || 100;
            const roi = ((v.revenue - expense) / expense) * 100;

            return (
              <VentureCard
                key={v.id}
                title={v.name}
                tag={v.type.toUpperCase()}
                icon={v.type === 'SAAS' ? <Cpu size={24} /> : v.type === 'SERVICE' ? <Layout size={24} /> : v.type === 'TRADING' ? <LineChart size={24} /> : <Sparkles size={24} />}
                color={v.type === 'SAAS' ? 'var(--stat-code)' : v.type === 'SERVICE' ? 'var(--stat-brand)' : v.type === 'TRADING' ? 'var(--stat-wealth)' : '#A855F7'}
                description={v.description}
              >
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                  <StatBox label="Operational Status" value={v.status.toUpperCase()} color={v.status === 'active' ? 'text-[var(--success)]' : 'text-white'} />
                  <StatBox label="Net Revenue" value={`$${v.revenue.toLocaleString()}`} />
                  <StatBox label="Effective ROI" value={`${roi.toFixed(0)}%`} color={roi >= 0 ? 'text-[var(--success)]' : 'text-[var(--danger)]'} />
                  <StatBox label="Burn Rate" value={`$${expense.toLocaleString()}`} />
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      const amount = prompt(`Log Revenue for ${v.name}:`);
                      if (amount && !isNaN(Number(amount))) {
                        addVentureRevenue(v.id, Number(amount), 'Manual revenue log');
                      }
                    }}
                    className="btn-secondary flex-1 py-3"
                  >
                    <DollarSign size={14} /> Log Revenue
                  </button>
                  <button className="btn-secondary px-4 py-3">
                    View Nexus
                  </button>
                </div>
              </VentureCard>
            );
          })}
        </div>

        {/* Financial Nexus & Portfolio Grid */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="h-section text-white italic">Financial Nexus</h2>
              <p className="stat-label text-white/20 mt-1 italic">Cross-portfolio liquidity and asset deployment status.</p>
            </div>
            <button className="flex items-center gap-2 font-bold text-[10px] text-white/40 hover:text-white uppercase tracking-widest">
              <Filter size={12} /> Filter Pools
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {portfolios.filter(p => p.type === 'business' || p.type === 'trading').map(p => (
              <div key={p.id} className="surface-card p-6 hover-lift group relative overflow-hidden">
                <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
                  <Wallet size={60} />
                </div>
                <div className="relative z-10 flex flex-col gap-8">
                  <div className="flex justify-between items-start">
                    <div className="px-3 py-1 bg-white/5 border border-white/10 rounded-full stat-label text-white/40">
                      {p.type}
                    </div>
                    <TrendingUp size={16} className="text-[var(--success)] opacity-40" />
                  </div>
                  <div>
                    <span className="block stat-label text-white/20 mb-1">{p.name}</span>
                    <span className="stat-value text-3xl text-white">${p.balance.toLocaleString()}</span>
                  </div>
                  <div className="h-px w-full bg-white/5" />
                  <div className="flex items-center justify-between opacity-40 group-hover:opacity-100 transition-opacity">
                    <span className="stat-label">Operational Efficiency</span>
                    <span className="stat-label text-[var(--success)]">MAXIMAL</span>
                  </div>
                </div>
              </div>
            ))}

            <div className="surface-card p-6 flex flex-col items-center justify-center text-center gap-4 group cursor-pointer hover-lift">
              <div className="h-12 w-12 rounded-full bg-white/5 flex items-center justify-center text-white/20 group-hover:text-white transition-colors">
                <Target size={24} />
              </div>
              <div>
                <h4 className="h-card text-white/40">Initialize New Pool</h4>
                <p className="stat-label text-white/20 mt-1 italic">Expand liquidity infrastructure.</p>
              </div>
            </div>
          </div>
        </div>


        {/* Default / Reference Grids (Original content remains for visual density if empty) */}
        {ventures.length === 0 && (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">

            {/* AIAA - AI Automation Agency */}
            <VentureCard
              title="AI Automation Agency"
              tag="AIAA"
              icon={<Cpu size={24} />}
              color="var(--stat-code)"
              description="Design, deploy, and scale autonomous multi-agent systems for enterprise client workflows."
            >
              <div className="grid grid-cols-2 gap-4">
                <StatBox label="Active Pipelines" value="12" />
                <StatBox label="Efficiency Gain" value="+40%" color="text-[var(--success)]" />
                <StatBox label="Pending Leads" value="08" />
                <StatBox label="Success Rate" value="96%" />
              </div>
            </VentureCard>

            {/* AIWA - AI Website Building Agency */}
            <VentureCard
              title="AI Website Foundry"
              tag="AIWA"
              icon={<Layout size={24} />}
              color="var(--stat-brand)"
              description="Rapid deployment of high-conversion, AI-optimized digital experiences and custom SaaS interfaces."
            >
              <div className="space-y-4">
                <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
                  <span className="text-white/40">Current Pipeline</span>
                  <span className="text-white/80">3/5 slots active</span>
                </div>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                  <div className="h-full bg-[var(--stat-brand)] w-[60%] shadow-[0_0_15px_var(--stat-brand)]" />
                </div>
                <div className="grid grid-cols-3 gap-2 pt-2">
                  <div className="bg-white/5 p-2 rounded-lg border border-white/5 text-center">
                    <span className="block text-[8px] text-white/20 mb-1">DESIGN</span>
                    <span className="text-xs font-bold text-white">02</span>
                  </div>
                  <div className="bg-white/5 p-2 rounded-lg border border-white/5 text-center">
                    <span className="block text-[8px] text-white/20 mb-1">BUILD</span>
                    <span className="text-xs font-bold text-white">01</span>
                  </div>
                  <div className="bg-white/5 p-2 rounded-lg border border-white/5 text-center">
                    <span className="block text-[8px] text-white/20 mb-1">LIVE</span>
                    <span className="text-xs font-bold text-white">14</span>
                  </div>
                </div>
              </div>
            </VentureCard>

            {/* Trademin - Tactical Trading */}
            <VentureCard
              title="Trademin"
              tag="FINANCE"
              icon={<LineChart size={24} />}
              color="var(--stat-wealth)"
              description="High-frequency algorithmic trading desk focusing on XAU/USD and digital asset liquidity pools."
            >
              <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-2xl">
                  <div>
                    <span className="block text-[9px] text-white/40 uppercase tracking-widest mb-1">Account Equity</span>
                    <span className="text-2xl font-bold font-black text-white">$8,240.50</span>
                  </div>
                  <div className="h-12 w-12 rounded-xl bg-[var(--success)]/10 flex items-center justify-center text-[var(--success)] border border-[var(--success)]/20 shadow-[0_0_15px_rgba(34,197,94,0.1)]">
                    <TrendingUp size={20} />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <Metric label="Drawdown" value="2.4%" color="text-[var(--danger)]" />
                  <Metric label="Sharpe" value="1.82" />
                  <Metric label="Trades/W" value="48" />
                </div>
              </div>
            </VentureCard>

            {/* Dimensional Forge - 3D/Three.js */}
            <VentureCard
              title="Dimensional Forge"
              tag="CREATIVE"
              icon={<Box size={24} />}
              color="#A855F7"
              description="Strategic 3D web experiences, immersive WebGL environments, and generative spatial concepts."
            >
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 p-3 bg-white/5 border border-dashed border-white/20 rounded-xl flex items-center justify-between group cursor-pointer hover:bg-white/10 transition-colors">
                  <div className="flex items-center gap-3">
                    <Sparkles size={16} className="text-[#A855F7]" />
                    <span className="text-[10px] font-bold text-white/80 tracking-widest uppercase italic">New 3D Portfolio Concept</span>
                  </div>
                  <ArrowUpRight size={14} className="text-white/20 group-hover:text-white transition-colors" />
                </div>
                <div className="space-y-4 pt-2">
                  <ListEntry label="Three.js R&D" />
                  <ListEntry label="Shader Lab" />
                  <ListEntry label="GSAP Anim" />
                </div>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col justify-center items-center text-center">
                  <span className="text-2xl font-black text-white">09</span>
                  <span className="text-[8px] text-white/30 uppercase tracking-widest mt-1">Prototypes</span>
                </div>
              </div>
            </VentureCard>
          </div>
        )}
      </div>
    </div>
  );
}

function VentureCard({ title, tag, icon, color, description, children }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="surface-card p-8 hover-lift group relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none" style={{ color }}>
        {React.cloneElement(icon, { size: 120 })}
      </div>

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-8">
          <div
            className="h-14 w-14 rounded-2xl flex items-center justify-center border shadow-xl transition-transform group-hover:scale-110"
            style={{ backgroundColor: `${color}10`, color, borderColor: `${color}30` }}
          >
            {icon}
          </div>
          <span className="stat-label px-3 py-1 rounded-full border border-white/10 bg-white/5 text-white/40">
            {tag}
          </span>
        </div>

        <h3 className="h-section text-white mb-2 italic">{title}</h3>
        <p className="stat-label text-white/30 mb-10 max-w-[80%] italic leading-relaxed">
          {description}
        </p>

        {children}
      </div>
    </motion.div>
  );
}

function StatBox({ label, value, color = "text-white" }: any) {
  return (
    <div className="surface-elevated p-4 flex flex-col gap-1">
      <span className="stat-label text-white/20">{label}</span>
      <span className={cn("stat-value text-xl", color)}>{value}</span>
    </div>
  );
}

function Metric({ label, value, color = "text-white" }: any) {
  return (
    <div className="text-center">
      <span className="block text-[8px] font-bold text-white/20 uppercase tracking-widest mb-1">{label}</span>
      <span className={cn("text-sm font-bold font-black", color)}>{value}</span>
    </div>
  );
}

function ListEntry({ label }: any) {
  return (
    <div className="flex items-center gap-2">
      <div className="h-1 w-1 rounded-full bg-white/20" />
      <span className="text-[9px] font-bold text-white/40 uppercase tracking-[0.2em]">{label}</span>
    </div>
  );
}

function TrendingUp(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </svg>
  );
}
function VenturePnL() {
  return (
    <div className="surface-card p-8 flex items-center justify-center min-h-[300px]">
      <div className="text-center">
        <LineChart size={48} className="text-[var(--stat-brand)] opacity-20 mx-auto mb-4" />
        <p className="eyebrow text-white/20">Aggregate PnL Matrix // Awaiting More Data</p>
      </div>
    </div>
  );
}
