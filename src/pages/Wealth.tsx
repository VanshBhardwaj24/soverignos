import { useState, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import {
  Plane, Plus, Calendar, Briefcase, Search, X,
  Settings, Bell, Repeat, Pencil, Trash2, Target,
  Shield, Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSovereignStore } from '../store/sovereign';
import { cn } from '../lib/utils';
import { ModalPortal } from '../components/ui/ModalPortal';

export default function Wealth() {
  const {
    transactions, addTransaction, deleteTransaction,
    updateTransaction, budgetCap, recurringTransactions,
    addRecurringTx, removeRecurringTx, financialGoals, allocateToGoal,
    setBudgetCap
  } = useSovereignStore();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showRecurring, setShowRecurring] = useState(false);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [timeFilter, setTimeFilter] = useState('ALL');

  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    type: 'expense' as 'income' | 'expense',
    category: 'General',
    sector: 'Personal',
    poolId: 'personal' as any
  });

  // Baseline mock initialization
  let currentBalance = 5000;
  let pnl = 0;


  const totalIncome = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const monthlySurplus = (totalIncome - totalExpense) || 0;
  currentBalance = 5000 + (totalIncome - totalExpense);

  const runwayMonths = monthlySurplus > 0 ? 'INF' : (currentBalance / Math.max(1, totalExpense || 1500)).toFixed(1);

  // F18: Projected Freedom Date Calculation
  // Target: $1M or 120 Months Runway
  const targetWealth = 1000000;
  const remaining = Math.max(0, targetWealth - currentBalance);
  const monthsToTarget = monthlySurplus > 0 ? remaining / monthlySurplus : Infinity;

  const getProjectedDate = () => {
    if (monthsToTarget === Infinity) return '---';
    const date = new Date();
    date.setMonth(date.getMonth() + Math.ceil(monthsToTarget));
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }).toUpperCase();
  };

  // F8: Generate chart data based on actual transaction history
  const pnlData = useMemo(() => {
    const data = [];
    const now = new Date();
    let rollingBalance = currentBalance;

    // Sort transactions by date descending to walk backwards

    for (let i = 0; i < 30; i++) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      if (!transactions || !Array.isArray(transactions)) {
        data.unshift({ day: `D-${i}`, balance: rollingBalance, displayBalance: rollingBalance });
        continue;
      }
      const matchesDate = (d1: string, d2: Date) => {
        const dateObj = new Date(d1);
        return dateObj.getFullYear() === d2.getFullYear() &&
          dateObj.getMonth() === d2.getMonth() &&
          dateObj.getDate() === d2.getDate();
      };

      // Day's transactions
      const dayTxs = transactions.filter(t => matchesDate(t.date, date));
      const dayNet = dayTxs.reduce((sum, t) => sum + (t.type === 'income' ? -t.amount : t.amount), 0);

      data.unshift({
        day: `D-${i}`,
        balance: rollingBalance,
        // Add minimal noise for aesthetic quality if no transactions
        displayBalance: rollingBalance + (dayTxs.length === 0 ? (Math.sin(i * 0.8) * 20) : 0)
      });

      rollingBalance += dayNet;
    }
    return data.map((d, i) => ({ ...d, day: `D-${29 - i}` }));
  }, [transactions, currentBalance]);

  pnl = pnlData[pnlData.length - 1].balance - pnlData[0].balance;

  // F8: Monthly Data for Bar Chart
  const last6Months = Array.from({ length: 6 }).map((_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - (5 - i));
    const label = d.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
    const monthStr = d.toISOString().slice(0, 7); // YYYY-MM

    const monthTxs = transactions.filter(t => t.date.startsWith(monthStr));
    const income = monthTxs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const expense = monthTxs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

    return { name: label, income, expense };
  });

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.amount || !formData.description) return;

    if (editingId) {
      await updateTransaction(editingId, {
        amount: parseFloat(formData.amount),
        description: formData.description,
        type: formData.type,
        category: formData.category,
        sector: formData.sector,
        poolId: formData.poolId,
      });
      setEditingId(null);
    } else {
      await addTransaction({
        amount: parseFloat(formData.amount),
        description: formData.description,
        type: formData.type,
        category: formData.category,
        sector: formData.sector,
        poolId: formData.poolId,
        date: new Date().toISOString()
      });
    }
    setIsAdding(false);
    setFormData({ amount: '', description: '', type: 'expense', category: 'General', sector: 'Personal', poolId: 'personal' });
  }

  const handleEdit = (tx: any) => {
    setFormData({
      amount: tx.amount.toString(),
      description: tx.description,
      type: tx.type,
      category: tx.category || 'General',
      sector: tx.sector || 'Personal',
      poolId: tx.poolId,
    });
    setEditingId(tx.id);
    setIsAdding(true);
  };

  const filteredTransactions = useMemo(() => {
    return transactions.filter(tx => {
      const matchesSearch = tx.description.toLowerCase().includes(search.toLowerCase()) ||
        tx.sector.toLowerCase().includes(search.toLowerCase());
      const matchesType = filter === 'all' || tx.type === filter;
      return matchesSearch && matchesType;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, search, filter]);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-7xl mx-auto pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-4 shrink-0">
        <div>
          <h1 className="font-bold text-[11px] tracking-[0.2em] text-[var(--stat-wealth)] opacity-80 uppercase mb-2">TRADEMIND MODULE</h1>
          <h2 className="font-bold text-4xl font-light tracking-tight text-white">ASSET COMMAND</h2>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 bg-white/5 border border-white/10 hover:border-[var(--stat-wealth)] text-white px-6 py-3 rounded-2xl font-bold text-[10px] font-black tracking-widest transition-all shadow-xl hover:scale-[1.02] surface-card"
          >
            <Plus size={16} /> ENTER
          </button>

          <div className="md:text-right p-4 bg-white/5 border border-white/10 rounded-xl shadow-lg">
            <div className={`font-bold text-3xl font-light text-[var(--stat-wealth)] tracking-tighter`}>
              ${currentBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
            <div className="font-bold text-[10px] text-white/20 tracking-widest uppercase mt-1 opacity-50">CURRENT EQUITY</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 shrink-0">
        {/* P&L Chart */}
        <div className="lg:col-span-2 bg-white/[0.03] border border-white/10 rounded-2xl p-6 shadow-xl flex flex-col min-h-[300px]">
          <div className="flex justify-between items-center mb-6 shrink-0">
            <h3 className="font-bold text-xs tracking-[0.1em] text-white/40 uppercase">EQUITY CURVE</h3>
            <span className="font-bold text-[9px] px-2 py-1 bg-black/40 border border-white/10 rounded text-[var(--success)] shadow-[0_0_10px_rgba(0,255,136,0.1)]">{pnl >= 0 ? '+' : ''}{pnl.toFixed(2)} NET 30</span>
          </div>
          <div className="flex-1 w-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={pnlData}>
                <defs>
                  <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--stat-wealth)" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="var(--stat-wealth)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" hide />
                <YAxis domain={['dataMin - 100', 'dataMax + 100']} hide />
                <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontFamily: 'Geist Mono', fontSize: '12px' }} itemStyle={{ color: 'hsl(var(--foreground))' }} formatter={(val: any) => [`$${Number(val).toFixed(2)}`, 'Equity']} />
                <Area type="monotone" dataKey="displayBalance" stroke="var(--stat-wealth)" strokeWidth={2} fillOpacity={1} fill="url(#colorBalance)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* F8: Monthly Yield Chart */}
        <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 shadow-xl flex flex-col min-h-[300px]">
          <h3 className="font-bold text-xs tracking-[0.1em] text-white/40 mb-6 uppercase">Monthly Yield</h3>
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={last6Months}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: 'rgba(255,255,255,0.4)', fontFamily: 'Geist Mono' }} />
                <Tooltip contentStyle={{ backgroundColor: '#111', border: '1px solid #333' }} />
                <Bar dataKey="income" fill="var(--success)" radius={[2, 2, 0, 0]} barSize={12} />
                <Bar dataKey="expense" fill="var(--danger)" radius={[2, 2, 0, 0]} barSize={12} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* F9: Budget Health & Freedom Runway */}
        <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 relative overflow-hidden flex flex-col min-h-[300px]">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="font-bold text-[10px] tracking-[0.1em] text-white/40 uppercase">Budget Health</h3>
              <div className={cn(
                "font-bold text-2xl font-black",
                totalExpense > budgetCap ? "text-[var(--danger)]" : "text-white"
              )}>
                {((totalExpense / budgetCap) * 100).toFixed(0)}%
              </div>
            </div>
            {totalExpense > budgetCap * 0.8 && (
              <div className="p-2 rounded-lg bg-[var(--danger)]/10 text-[var(--danger)] animate-pulse">
                <Bell size={16} />
              </div>
            )}
            <button
              onClick={() => {
                const newCap = prompt('Enter new monthly budget cap:', budgetCap.toString());
                if (newCap && !isNaN(Number(newCap))) {
                  setBudgetCap(Number(newCap));
                }
              }}
              className="p-2 text-white/20 hover:text-white transition-colors"
            >
              <Settings size={14} />
            </button>
          </div>

          <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden mb-8 border border-white/5">
            <div
              className={cn(
                "h-full transition-all duration-1000",
                totalExpense > budgetCap ? "bg-[var(--danger)]" : "bg-[var(--stat-wealth)]"
              )}
              style={{ width: `${Math.min(100, (totalExpense / budgetCap) * 100)}%` }}
            />
          </div>

          <div className="mt-auto pt-4 border-t border-white/5">
            <h3 className="font-bold text-[10px] tracking-[0.1em] text-white/40 mb-1 uppercase">FREEDOM DATE</h3>
            <div className="font-bold text-xl font-black text-[var(--stat-wealth)]">
              {getProjectedDate()}
            </div>
            <p className="text-[9px] font-bold text-white/20 mt-1 uppercase italic tracking-widest">{runwayMonths} MONTHS REMAINING</p>
          </div>
        </div>
      </div>
      {/* F23-F27: Financial Objectives */}
      <div className="mt-8 space-y-6 shrink-0">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-xl font-light text-white uppercase tracking-tight">Financial Objectives</h2>
          <button className="font-bold text-[9px] text-[var(--stat-wealth)] uppercase tracking-widest hover:underline">+ Initialize New Goal</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {(financialGoals || []).map(goal => {
            const progress = (goal.currentAmount / goal.targetAmount) * 100;
            return (
              <div key={goal.id} className="bg-white/[0.03] border border-white/5 rounded-3xl p-6 hover:border-white/10 transition-all group relative overflow-hidden flex flex-col gap-6">
                <div className="flex justify-between items-start">
                  <div className="p-2 rounded-xl bg-white/5 text-white/40 border border-white/10 group-hover:border-[var(--stat-wealth)] transition-colors">
                    {goal.category === 'asset' ? <Shield size={18} /> : goal.category === 'trip' ? <Plane size={18} /> : <Target size={18} />}
                  </div>
                  <div className="text-right">
                    <span className="block font-bold text-[8px] text-white/20 uppercase tracking-widest">Deadline</span>
                    <span className="text-[10px] font-black text-white/40 font-bold italic">{goal.deadline || 'NO LIMIT'}</span>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-black text-white uppercase italic truncate">{goal.name}</h4>
                  <div className="flex justify-between items-end mt-1">
                    <span className="text-xl font-bold font-black text-white">${goal.currentAmount.toLocaleString()}</span>
                    <span className="text-[9px] font-bold text-white/20 uppercase">of ${goal.targetAmount.toLocaleString()}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="h-1.5 w-full bg-foreground/5 rounded-full overflow-hidden border border-foreground/5">
                    <div className="h-full bg-[var(--stat-wealth)] transition-all duration-1000" style={{ width: `${Math.min(100, progress)}%` }} />
                  </div>
                </div>

                <button
                  onClick={() => {
                    const amount = prompt(`Allocate funds to ${goal.name}:`);
                    if (amount && !isNaN(Number(amount))) {
                      allocateToGoal(goal.id, Number(amount));
                    }
                  }}
                  className="w-full py-3 bg-white/5 border border-white/10 rounded-xl text-[9px] font-black font-bold tracking-widest uppercase text-white/40 hover:bg-white hover:text-black transition-all"
                >
                  Quick Allocate
                </button>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-8 flex-1 min-h-0">
        {/* Ledger */}
        <div className="bg-white/[0.03] border border-white/10 rounded-2xl flex flex-col h-full overflow-hidden shadow-xl">
          {/* Transaction Header & Table from Screenshot */}
          <div className="p-6 border-b border-white/5 flex flex-col gap-6 bg-white/[0.01]">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-[var(--stat-wealth)]/10 text-[var(--stat-wealth)] border border-[var(--stat-wealth)]/20 shadow-[0_0_15px_rgba(34,211,238,0.1)]">
                  <Briefcase size={18} />
                </div>
                <h3 className="text-xl font-bold text-white tracking-tight">Transaction Data</h3>
              </div>

              <div className="relative group max-w-xs flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-[var(--stat-wealth)] transition-colors" size={14} />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search ledger..."
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-2 pl-11 pr-4 text-xs text-white outline-none focus:border-[var(--stat-wealth)]/40 hover:bg-white/[0.08] transition-all font-bold tracking-widest uppercase"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {['ALL', 'TODAY', '7D', '30D', 'THIS MONTH', 'THIS YEAR'].map(tf => (
                <button
                  key={tf}
                  onClick={() => setTimeFilter(tf)}
                  className={cn(
                    "px-3 py-1.5 rounded-xl font-bold text-[9px] font-black uppercase tracking-widest transition-all",
                    timeFilter === tf ? "bg-white/10 text-white border border-white/20 shadow-lg" : "text-white/30 hover:text-white/60 hover:bg-white/5"
                  )}
                >
                  {tf}
                </button>
              ))}
              <div className="h-4 w-px bg-foreground/10 mx-1" />
              <button
                onClick={() => setFilter('income')}
                className={cn(
                  "px-3 py-1.5 rounded-xl font-bold text-[9px] font-black uppercase tracking-widest transition-all border",
                  filter === 'income' ? "bg-green-500/10 text-green-500 border-green-500/30" : "text-white/30 border-transparent hover:text-white/60"
                )}
              >
                Income
              </button>
              <button
                onClick={() => setFilter('expense')}
                className={cn(
                  "px-3 py-1.5 rounded-xl font-bold text-[9px] font-black uppercase tracking-widest transition-all border",
                  filter === 'expense' ? "bg-red-500/10 text-red-500 border-red-500/30" : "text-white/30 border-transparent hover:text-white/60"
                )}
              >
                Expense
              </button>
              <button
                onClick={() => setShowRecurring(!showRecurring)}
                className={cn(
                  "px-3 py-1.5 rounded-xl font-bold text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-2 border",
                  showRecurring ? "bg-[var(--stat-wealth)]/10 text-[var(--stat-wealth)] border-[var(--stat-wealth)]/30" : "text-white/30 border-transparent hover:text-white/60"
                )}
              >
                <Repeat size={10} /> Recurring
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-white/5 text-[10px] font-black text-white/30 uppercase tracking-[0.2em] bg-white/[0.02] sticky top-0 z-10 backdrop-blur-sm">
                  <th className="px-6 py-4 text-left">Timestamp</th>
                  <th className="px-6 py-4 text-left">Classification</th>
                  <th className="px-6 py-4 text-left">Sector</th>
                  <th className="px-6 py-4 text-left">Memo</th>
                  <th className="px-6 py-4 text-right">Magnitude</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredTransactions.map(tx => (
                  <tr key={tx.id} className="group hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase">
                        <Calendar size={12} className="opacity-40" />
                        {new Date(tx.date).toISOString().split('T')[0]}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className={cn(
                        "px-3 py-1 rounded-full text-[9px] font-black font-bold tracking-widest uppercase border",
                        tx.type === 'income'
                          ? "bg-green-500/10 text-green-500 border-green-500/20"
                          : "bg-red-500/10 text-red-500 border-red-500/20"
                      )}>
                        {tx.type}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-[11px] text-white font-black uppercase tracking-tight">
                        {tx.sector || 'Main Account'}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-[11px] text-white/40 italic font-medium tracking-tight">
                        {tx.description}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <span className={cn(
                        "text-[14px] font-black tracking-tighter",
                        tx.type === 'income' ? "text-green-500" : "text-white"
                      )}>
                        {tx.type === 'income' ? '+' : '-'}${tx.amount.toLocaleString(undefined, { minimumFractionDigits: tx.amount % 1 === 0 ? 0 : 2 })}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleEdit(tx)}
                          className="p-1.5 rounded bg-white/5 text-white/40 hover:text-white hover:bg-white/10 transition-all border border-white/10"
                        >
                          <Pencil size={12} />
                        </button>
                        <button
                          onClick={() => deleteTransaction(tx.id)}
                          className="p-1.5 rounded bg-red-500/5 text-red-500/40 hover:text-red-500 hover:bg-red-500/10 transition-all border border-red-500/10"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredTransactions.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-24 text-center">
                      <p className="font-bold text-[10px] text-white/20 uppercase tracking-[0.4em]">Empty Registry // Awaiting Data Sync</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Add Modal */}
          <ModalPortal>
            <AnimatePresence>
              {isAdding && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setIsAdding(false)}
                    className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                  />
                  <motion.div
                    initial={{ scale: 0.95, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 20 }}
                    className="relative w-full max-w-lg bg-background border border-foreground/10 rounded-[2.5rem] p-10 shadow-2xl overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                      <Briefcase size={180} />
                    </div>

                    <div className="relative z-10 space-y-8">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-2xl font-black text-foreground tracking-tighter uppercase mb-1 italic">Log Ledger</h3>
                          <p className="font-bold text-[10px] text-foreground/30 uppercase tracking-widest">Register financial movement into system matrix.</p>
                        </div>
                        <button onClick={() => setIsAdding(false)} className="p-2 hover:bg-foreground/5 rounded-xl transition-colors text-foreground/20 hover:text-foreground">
                          <X size={20} />
                        </button>
                      </div>

                      <form onSubmit={handleAdd} className="space-y-6">
                        <div className="flex gap-4">
                          <div className="flex-1 space-y-2">
                            <label className="text-[9px] font-bold font-black uppercase tracking-widest text-foreground/40">Amount ($)</label>
                            <input
                              autoFocus
                              type="number"
                              step="0.01"
                              value={formData.amount}
                              onChange={e => setFormData({ ...formData, amount: e.target.value })}
                              className="w-full bg-foreground/5 border border-foreground/10 rounded-2xl p-4 text-foreground font-bold text-lg outline-none focus:border-[var(--stat-wealth)]/40 transition-all shadow-inner"
                              placeholder="0.00"
                            />
                          </div>
                          <div className="flex-1 space-y-2">
                            <label className="text-[9px] font-bold font-black uppercase tracking-widest text-foreground/40">Direction</label>
                            <div className="flex p-1 bg-foreground/5 rounded-2xl border border-foreground/10 h-[64px]">
                              {(['income', 'expense'] as const).map(t => (
                                <button
                                  key={t}
                                  type="button"
                                  onClick={() => setFormData({ ...formData, type: t })}
                                  className={cn(
                                    "flex-1 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all",
                                    formData.type === t
                                      ? t === 'income' ? "bg-green-500 text-black" : "bg-red-500 text-black"
                                      : "text-foreground/40 hover:text-foreground"
                                  )}
                                >
                                  {t}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-[9px] font-bold font-black uppercase tracking-widest text-foreground/40">Memo / Description</label>
                          <input
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                            className="w-full bg-foreground/5 border border-foreground/10 rounded-2xl p-4 text-foreground font-bold text-sm outline-none focus:border-[var(--stat-wealth)]/40 hover:bg-foreground/10 transition-all"
                            placeholder="What was this for?"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-[9px] font-bold font-black uppercase tracking-widest text-foreground/40">Sector</label>
                            <input
                              value={formData.sector}
                              onChange={e => setFormData({ ...formData, sector: e.target.value })}
                              className="w-full bg-foreground/5 border border-foreground/10 rounded-2xl p-4 text-foreground font-bold text-xs outline-none focus:border-[var(--stat-wealth)]/40"
                              placeholder="Personal/Business"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[9px] font-bold font-black uppercase tracking-widest text-foreground/40">Pool ID</label>
                            <select
                              value={formData.poolId}
                              onChange={e => setFormData({ ...formData, poolId: e.target.value as any })}
                              className="w-full h-[58px] bg-foreground/5 border border-foreground/10 rounded-2xl px-4 text-foreground font-bold text-xs outline-none focus:border-[var(--stat-wealth)]/40 appearance-none uppercase"
                            >
                              <option value="personal">Personal</option>
                              <option value="business">Business</option>
                              <option value="trading">Trading</option>
                              <option value="investment">Investment</option>
                            </select>
                          </div>
                        </div>

                        <button
                          type="submit"
                          disabled={!formData.amount || !formData.description}
                          className="w-full py-5 bg-white text-black rounded-2xl font-bold text-[10px] font-black uppercase tracking-[0.3em] overflow-hidden group relative hover:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100 shadow-[0_20px_40px_rgba(255,255,255,0.1)] mt-4"
                        >
                          <div className="relative z-10 flex items-center justify-center gap-2">
                            <Check size={16} /> ENTER TRANSACTION
                          </div>
                        </button>
                      </form>
                    </div>
                  </motion.div>
                </div>
              )}
              {showRecurring && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setShowRecurring(false)}
                    className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                  />
                  <motion.div
                    initial={{ scale: 0.95, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 20 }}
                    className="relative w-full max-w-lg bg-background border border-foreground/10 rounded-[2.5rem] p-10 shadow-2xl"
                  >
                    <h3 className="text-2xl font-black text-foreground tracking-tighter uppercase mb-6 italic">Recurring Patterns</h3>
                    <div className="space-y-4">
                      {recurringTransactions.map(tx => (
                        <div key={tx.id} className="flex items-center justify-between p-4 bg-foreground/5 rounded-2xl border border-foreground/10">
                          <div>
                            <div className="text-foreground font-bold text-sm">{tx.description}</div>
                            <div className="text-[10px] text-foreground/40 font-bold uppercase">{tx.frequency} • ${tx.amount}</div>
                          </div>
                          <button onClick={() => removeRecurringTx(tx.id)} className="text-red-500/50 hover:text-red-500"><Trash2 size={14} /></button>
                        </div>
                      ))}
                      <button
                        onClick={() => addRecurringTx({
                          amount: 100,
                          description: 'New Automated Entry',
                          type: 'expense',
                          frequency: 'monthly',
                          category: 'Subscription'
                        })}
                        className="w-full p-4 border border-dashed border-foreground/10 rounded-2xl flex items-center justify-center gap-2 text-foreground/20 hover:text-foreground hover:bg-foreground/5 transition-all font-bold text-[9px] uppercase tracking-widest"
                      >
                        <Plus size={14} /> Add Pattern
                      </button>
                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>
          </ModalPortal>
        </div>

      </div>
    </div>
  )
}
