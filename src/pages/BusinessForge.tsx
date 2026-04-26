import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Box,
  Cpu, LineChart, Layout, Sparkles, Plus,
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
      expenses: 100,
      status: 'active'
    });
    setIsAdding(false);
    setNewName('');
    setNewDesc('');
  };

  return (
    <div className="max-w-[1200px] mx-auto pb-32 px-6 sm:px-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
      
      {/* Apple-Style Header & Command Dashboard */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12 mb-20 pt-16 relative z-10">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-bold tracking-[0.25em] text-pink-400/60 uppercase pl-1">Venture Foundry</span>
          </div>
          <h1 className="text-6xl font-semibold tracking-tight text-white leading-none">
            Business <span className="text-white/20 font-light">Command</span>
          </h1>
          <p className="text-sm text-white/40 max-w-md leading-relaxed">
            Architect, monitor, and scale your autonomous revenue streams through the strategic foundry.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <button
            onClick={() => setIsAdding(true)}
            className="h-14 px-8 bg-white text-black rounded-full flex items-center gap-3 font-bold text-[13px] hover:scale-[1.05] active:scale-[0.95] transition-all shadow-2xl"
          >
            <Plus size={18} strokeWidth={3} /> Initialize Venture
          </button>

          <div className="flex items-center gap-3">
            <MetricPod 
              label="Aggregate Revenue" 
              value={`$${aggregateRevenue.toLocaleString()}`} 
              color="text-emerald-400" 
              glow="bg-emerald-400/20"
            />
            <MetricPod 
              label="Active Ventures" 
              value={activeCount.toString().padStart(2, '0')} 
              color="text-white" 
              glow="bg-white/10"
            />
          </div>
        </div>
      </div>

      <div className="space-y-24">
        {/* Analytics Section */}
        <section className="space-y-8">
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <h2 className="text-xl font-medium text-white/80 tracking-tight">Performance Matrix</h2>
            <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest italic">Live Feed</span>
          </div>
          <VenturePnL />
        </section>

        {/* Active Ventures Grid */}
        <section className="space-y-10">
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <h2 className="text-xl font-medium text-white/80 tracking-tight">Active Ventures</h2>
            <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">{ventures.length} Active</span>
          </div>
          
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {ventures.map(v => (
              <VentureModule 
                key={v.id} 
                venture={v} 
                onLogRevenue={() => {
                  const amount = prompt(`Log Revenue for ${v.name}:`);
                  if (amount && !isNaN(Number(amount))) {
                    addVentureRevenue(v.id, Number(amount), 'Manual revenue log');
                  }
                }}
              />
            ))}
          </div>
        </section>

        {/* Financial Nexus Section */}
        <section className="space-y-10">
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-medium text-white/80 tracking-tight">Financial Nexus</h2>
              <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[9px] font-bold text-white/40 uppercase tracking-widest">Liquidity Matrix</span>
            </div>
            <button className="flex items-center gap-2 font-bold text-[11px] text-white/40 hover:text-white transition-colors uppercase tracking-widest">
              <Filter size={14} /> Filter Pools
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {portfolios.filter(p => p.type === 'business' || p.type === 'trading').map(p => (
              <PoolCard key={p.id} portfolio={p} />
            ))}

            <div className="bg-white/[0.01] border border-dashed border-white/10 rounded-[32px] p-10 flex flex-col items-center justify-center text-center gap-5 opacity-40 hover:opacity-100 transition-all cursor-pointer group">
              <div className="h-16 w-16 rounded-full bg-white/5 flex items-center justify-center text-white/20 group-hover:bg-white group-hover:text-black transition-all">
                <Target size={28} />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">Initialize New Pool</h4>
                <p className="text-[11px] text-white/40 mt-1">Expand liquidity infrastructure.</p>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Initialization Modal (Apple Sheet) */}
      <ModalPortal>
        <AnimatePresence>
          {isAdding && (
            <VentureCreator 
              onClose={() => setIsAdding(false)} 
              onSubmit={handleAdd}
              name={newName} setName={setNewName}
              desc={newDesc} setDesc={setNewDesc}
              type={newType} setType={setNewType}
            />
          )}
        </AnimatePresence>
      </ModalPortal>
    </div>
  );
}

function MetricPod({ label, value, color, glow }: any) {
  return (
    <div className="bg-white/[0.03] border border-white/5 rounded-[24px] px-7 py-4 min-w-[150px] backdrop-blur-xl relative overflow-hidden group">
      <div className={cn("absolute -top-8 -right-8 h-16 w-16 rounded-full blur-2xl opacity-10 transition-opacity group-hover:opacity-20", glow)} />
      <span className="block text-[9px] font-bold text-white/20 uppercase tracking-widest mb-1">{label}</span>
      <span className={cn("text-2xl font-semibold tracking-tighter tabular-nums", color)}>{value}</span>
    </div>
  );
}

function VentureModule({ venture, onLogRevenue }: { venture: Venture, onLogRevenue: () => void }) {
  const expense = venture.expenses || 100;
  const roi = ((venture.revenue - expense) / expense) * 100;
  
  const typeIcons: any = {
    SAAS: <Cpu size={24} />,
    SERVICE: <Layout size={24} />,
    TRADING: <LineChart size={24} />,
    CONTENT: <Sparkles size={24} />,
    'E-COMM': <Box size={24} />
  };

  const typeColors: any = {
    SAAS: 'text-blue-400',
    SERVICE: 'text-pink-400',
    TRADING: 'text-emerald-400',
    CONTENT: 'text-purple-400',
    'E-COMM': 'text-orange-400'
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="bg-white/[0.03] border border-white/10 rounded-[32px] p-8 backdrop-blur-xl group hover:bg-white/[0.05] transition-all duration-500 shadow-lg"
    >
      <div className="flex justify-between items-start mb-8">
        <div className="flex items-center gap-5">
          <div className={cn("h-16 w-16 rounded-[22px] flex items-center justify-center border border-white/10 shadow-inner", typeColors[venture.type] || 'text-white')}>
            {typeIcons[venture.type] || <Sparkles size={24} />}
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h3 className="text-2xl font-semibold text-white tracking-tight">{venture.name}</h3>
              <span className="px-2.5 py-0.5 bg-white/5 border border-white/10 rounded-full text-[9px] font-bold text-white/40 uppercase tracking-widest">
                {venture.type}
              </span>
            </div>
            <p className="text-sm text-white/40 mt-1 max-w-[300px] leading-relaxed">{venture.description}</p>
          </div>
        </div>
        <div className={cn("px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-2", 
          venture.status === 'active' ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-white/5 text-white/40 border border-white/10"
        )}>
          <div className={cn("h-1.5 w-1.5 rounded-full", venture.status === 'active' ? "bg-emerald-400 animate-pulse" : "bg-white/40")} />
          {venture.status}
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <MiniStat label="Net Revenue" value={`$${venture.revenue.toLocaleString()}`} color="text-white" />
        <MiniStat label="Effective ROI" value={`${roi.toFixed(0)}%`} color={roi >= 0 ? 'text-emerald-400' : 'text-rose-500'} />
        <MiniStat label="Operational Burn" value={`$${expense.toLocaleString()}`} />
        <MiniStat label="Efficiency" value="Maximal" color="text-emerald-400" />
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={onLogRevenue}
          className="flex-1 h-14 bg-white text-black rounded-[20px] flex items-center justify-center gap-2 font-bold text-xs uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl"
        >
          <DollarSign size={16} /> Log Revenue
        </button>
        <button className="px-8 h-14 bg-white/5 text-white/60 hover:text-white rounded-[20px] font-bold text-xs uppercase tracking-widest transition-all">
          View Nexus
        </button>
      </div>
    </motion.div>
  );
}

function MiniStat({ label, value, color = "text-white/80" }: any) {
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-[22px] p-5 space-y-1">
      <span className="text-[9px] font-bold text-white/20 uppercase tracking-[0.15em] block">{label}</span>
      <span className={cn("text-xl font-semibold tracking-tighter tabular-nums", color)}>{value}</span>
    </div>
  );
}

function PoolCard({ portfolio }: any) {
  return (
    <motion.div 
      whileHover={{ scale: 1.02 }}
      className="bg-white/[0.03] border border-white/10 rounded-[32px] p-8 backdrop-blur-xl relative overflow-hidden group"
    >
      <div className="absolute -top-12 -right-12 p-8 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity pointer-events-none">
        <Wallet size={160} />
      </div>
      
      <div className="relative z-10 flex flex-col gap-10">
        <div className="flex justify-between items-center">
          <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[9px] font-bold text-white/30 uppercase tracking-widest">
            {portfolio.type} Pool
          </span>
          <TrendingUp size={18} className="text-emerald-400 opacity-40" />
        </div>
        
        <div>
          <span className="block text-[11px] font-bold text-white/20 mb-1 uppercase tracking-widest">{portfolio.name}</span>
          <span className="text-4xl font-semibold text-white tracking-tighter tabular-nums">${portfolio.balance.toLocaleString()}</span>
        </div>
        
        <div className="h-px w-full bg-white/5" />
        
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Operational Efficiency</span>
          <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Maximal</span>
        </div>
      </div>
    </motion.div>
  );
}

function VentureCreator({ onClose, onSubmit, name, setName, desc, setDesc, type, setType }: any) {
  return (
    <div className="fixed inset-0 z-[600] flex items-center justify-center p-6 sm:p-8">
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-3xl" 
        onClick={onClose} 
      />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 40 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="relative w-full max-w-xl bg-white/[0.03] border border-white/10 rounded-[44px] shadow-2xl backdrop-blur-2xl p-8 md:p-12 overflow-hidden"
      >
        <form onSubmit={onSubmit} className="space-y-10">
          <div className="text-center space-y-3">
            <div className="h-16 w-16 rounded-[24px] bg-pink-500/10 text-pink-400 border border-pink-500/20 flex items-center justify-center mx-auto mb-6">
              <Plus size={32} strokeWidth={1.5} />
            </div>
            <h2 className="text-3xl font-semibold text-white tracking-tight">Venture Protocol</h2>
            <p className="text-sm text-white/30 italic">Initialize new revenue infrastructure.</p>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-white/20 uppercase tracking-widest pl-2">Venture Name</label>
              <input 
                value={name} onChange={e => setName(e.target.value)}
                placeholder="E.g. Nexus Multi-Agent Swarm"
                className="w-full bg-white/[0.04] border border-white/10 rounded-[20px] py-4 px-6 text-white placeholder:text-white/10 outline-none focus:border-white/30 transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-white/20 uppercase tracking-widest pl-2">Classification</label>
              <select 
                value={type} onChange={e => setType(e.target.value)}
                className="w-full bg-white/[0.04] border border-white/10 rounded-[20px] py-4 px-6 text-white outline-none focus:border-white/30 transition-all appearance-none"
              >
                <option value="SAAS">Software as a Service</option>
                <option value="E-COMM">E-Commerce</option>
                <option value="TRADING">Tactical Trading</option>
                <option value="CONTENT">Content / Brand</option>
                <option value="SERVICE">Service / Agency</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-white/20 uppercase tracking-widest pl-2">Tactical Summary</label>
              <textarea 
                value={desc} onChange={e => setDesc(e.target.value)}
                placeholder="Define objective and mission scope..."
                className="w-full bg-white/[0.04] border border-white/10 rounded-[24px] py-4 px-6 text-white placeholder:text-white/10 outline-none focus:border-white/30 transition-all h-24 resize-none"
              />
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button type="button" onClick={onClose} className="flex-1 py-4 rounded-[22px] font-semibold text-white/30 hover:bg-white/5 transition-all">Discard</button>
            <button type="submit" className="flex-[2] py-4 bg-white text-black rounded-[22px] font-bold shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all">Deploy to Foundry</button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

function TrendingUp(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </svg>
  );
}

function VenturePnL() {
  return (
    <div className="bg-white/[0.03] border border-white/10 rounded-[32px] p-12 flex items-center justify-center min-h-[300px] backdrop-blur-xl relative overflow-hidden group">
      <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 to-transparent pointer-events-none" />
      <div className="text-center relative z-10 space-y-4">
        <LineChart size={64} strokeWidth={1} className="text-pink-500/20 mx-auto" />
        <div>
          <p className="text-sm font-medium text-white/40">Aggregate PnL Matrix</p>
          <p className="text-[11px] text-white/20 uppercase tracking-[0.2em] mt-1">Awaiting More Data // Foundry Live</p>
        </div>
      </div>
    </div>
  );
}
