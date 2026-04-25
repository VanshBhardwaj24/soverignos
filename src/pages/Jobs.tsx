import { useState, useMemo } from 'react';
import { useSovereignStore } from '../store/sovereign';
import type { JobApp } from '../store/sovereign';
import {
  Plus, X, Briefcase, LayoutGrid,
  BarChart3, Settings2, Search, Target, Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';
import { JobCard } from '../components/jobs/JobCard';
import { JobAnalytics } from '../components/jobs/JobAnalytics';
import { ModalPortal } from '../components/ui/ModalPortal';

const LANES: JobApp['status'][] = ['RESEARCHING', 'APPLIED', 'INTERVIEWING', 'PENDING OFFER', 'ACCEPTED', 'REJECTED'];

export default function Jobs() {
  const { jobApplications, addJobApp, updateJobStatus, updateJobApp, deleteJobApp } = useSovereignStore();

  const [activeTab, setActiveTab] = useState<'board' | 'analytics'>('board');
  const [isAdding, setIsAdding] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Form State
  const [newCompany, setNewCompany] = useState('');
  const [newRole, setNewRole] = useState('');

  // Edit State
  const [editingJob, setEditingJob] = useState<JobApp | null>(null);

  const filteredJobs = useMemo(() => {
    return jobApplications.filter(job =>
      job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.role.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [jobApplications, searchQuery]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompany || !newRole) return;

    await addJobApp({
      company: newCompany,
      role: newRole,
      status: 'RESEARCHING',
      date: new Date().toISOString()
    });

    setNewCompany('');
    setNewRole('');
    setIsAdding(false);
  };

  const handleMove = async (id: string, currentStatus: JobApp['status'], direction: 1 | -1) => {
    const currentIndex = LANES.indexOf(currentStatus);
    const nextStatus = LANES[currentIndex + direction];
    if (nextStatus) {
      await updateJobStatus(id, nextStatus);
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 h-[calc(100vh-140px)] flex flex-col max-w-[1600px] mx-auto w-full px-4 md:px-8">
      {/* Header Section */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 shrink-0">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <span className="w-8 h-px bg-white/20" />
            <p className="eyebrow text-white/60">Job Hunt Engine</p>
          </div>
          <h1 className="h-display italic">
            Ops <span className="text-white/40">Deployment</span>
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab('board')}
            className={cn(
              "p-3 rounded-2xl border transition-all",
              activeTab === 'board' ? "bg-white text-black border-white" : "bg-white/5 text-white/60 border-white/5 hover:border-white/10"
            )}
          >
            <LayoutGrid size={20} />
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={cn(
              "p-3 rounded-2xl border transition-all",
              activeTab === 'analytics' ? "bg-white text-black border-white" : "bg-white/5 text-white/60 border-white/5 hover:border-white/10"
            )}
          >
            <BarChart3 size={20} />
          </button>
          <div className="w-px h-8 bg-white/10 mx-2" />
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-3 px-6 py-3 bg-[var(--stat-brand)] text-black rounded-2xl font-bold text-[10px] font-black tracking-widest uppercase hover:opacity-90 transition-all shadow-[0_0_20px_rgba(var(--stat-brand-rgb),0.3)]"
          >
            <Plus size={16} /> Add Target
          </button>
        </div>
      </header>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 mb-6 shrink-0">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 group-focus-within:text-white transition-colors" size={16} />
          <input
            placeholder="FILTER COMMANDS..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-4 pl-12 pr-4 stat-label text-white outline-none focus:border-white/40 transition-all"
          />
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          {activeTab === 'board' ? (
            <motion.div
              key="board"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="h-full flex gap-6 overflow-x-auto pb-8 mask-fade-right no-scrollbar"
            >
              {LANES.map(lane => {
                const laneJobs = filteredJobs.filter(j => j.status === lane);
                return (
                  <div key={lane} className="w-64 shrink-0 flex flex-col group/lane">
                    {/* Lane Header */}
                    <div className="flex items-center justify-between mb-4 px-2">
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-white/40 group-focus-within/lane:bg-white transition-colors" />
                        <span className="stat-label text-white/60">{lane}</span>
                      </div>
                      <span className="stat-label text-white/40">{laneJobs.length}</span>
                    </div>

                    {/* Lane Body */}
                    <div className="flex-1 surface-card p-3 flex flex-col gap-3 overflow-y-auto no-scrollbar scroll-smooth">
                      {laneJobs.length === 0 ? (
                        <div className="flex-1 border border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center text-white/30 gap-3 opacity-50">
                          <Briefcase size={24} />
                          <span className="stat-label italic">Empty Sector</span>
                        </div>
                      ) : (
                        laneJobs.map(job => (
                          <JobCard
                            key={job.id}
                            job={job}
                            onMove={(dir) => handleMove(job.id, job.status, dir)}
                            onDelete={() => deleteJobApp(job.id)}
                            onClick={() => setEditingJob(job)}
                            isFirst={lane === LANES[0]}
                            isLast={lane === LANES[LANES.length - 1]}
                          />
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </motion.div>
          ) : (
            <motion.div
              key="analytics"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
            >
              <JobAnalytics jobs={jobApplications} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Modals */}
      <ModalPortal>
        <AnimatePresence>
          {isAdding && (
          <div className="fixed inset-0 z-[600] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md glass-premium p-8 relative shadow-2xl"
            >
              <button onClick={() => setIsAdding(false)} className="absolute top-6 right-6 text-white/20 hover:text-white transition-colors"><X size={20} /></button>
              <div className="flex items-center gap-3 mb-6">
                <Target className="text-[var(--stat-brand)]" size={20} />
                <h2 className="h-section italic">Initialize <span className="text-white/40">Target</span></h2>
              </div>

              <form onSubmit={handleAdd} className="space-y-6">
                <div className="space-y-2">
                  <label className="stat-label opacity-30 mb-3 block">Company Designation</label>
                  <input
                    autoFocus
                    placeholder="E.G. NEURALINK / STARK IND."
                    value={newCompany}
                    onChange={e => setNewCompany(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-sm text-white outline-none focus:border-white/40 transition-all font-bold italic"
                  />
                </div>
                <div className="space-y-2">
                  <label className="stat-label opacity-30 mb-3 block">Mission Role</label>
                  <input
                    placeholder="E.G. SENIOR AI ARCHITECT"
                    value={newRole}
                    onChange={e => setNewRole(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-sm text-white outline-none focus:border-white/40 transition-all font-bold italic"
                  />
                </div>
                <button type="submit" className="btn-primary w-full py-5">
                  Deploy Protocol
                </button>
              </form>
            </motion.div>
          </div>
        )}

        {editingJob && (
          <div className="fixed inset-0 z-[600] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md glass-premium p-8 relative shadow-2xl overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-[var(--stat-brand)] opacity-20" />
              <button onClick={() => setEditingJob(null)} className="absolute top-6 right-6 text-white/20 hover:text-white transition-colors"><X size={20} /></button>

              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                  <Briefcase className="text-white" size={20} />
                </div>
                <div>
                  <h3 className="h-section italic">{editingJob.company}</h3>
                  <p className="stat-label opacity-60">{editingJob.role}</p>
                </div>
              </div>

              <div className="space-y-8">
                <div className="space-y-3">
                  <label className="stat-label opacity-30 mb-3 block flex items-center gap-2">
                    <Settings2 size={12} /> Mission Intelligence
                  </label>
                  <textarea
                    value={editingJob.notes || ''}
                    onChange={e => setEditingJob({ ...editingJob, notes: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-xs text-white outline-none focus:border-white/40 h-32 resize-none font-sans"
                    placeholder="LOG KEY CONTACTS, REQUIREMENTS..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <label className="stat-label opacity-30 mb-3 block">Status Sector</label>
                    <select
                      value={editingJob.status}
                      onChange={e => setEditingJob({ ...editingJob, status: e.target.value as any })}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-[10px] font-bold text-white outline-none focus:border-white/40"
                    >
                      {LANES.map(l => <option key={l} value={l}>{l}</option>)}
                    </select>
                  </div>
                  <div className="space-y-3">
                    <label className="stat-label opacity-30 mb-3 block">Next Follow-up</label>
                    <input
                      type="date"
                      value={editingJob.followUpDate || ''}
                      onChange={e => setEditingJob({ ...editingJob, followUpDate: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-[10px] font-bold text-white outline-none focus:border-white/40 [color-scheme:dark]"
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      updateJobApp(editingJob.id, editingJob);
                      setEditingJob(null);
                    }}
                    className="btn-primary flex-1 py-5"
                  >
                    Commit Changes
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('NEUTRALIZE TARGET PERMANENTLY?')) {
                        deleteJobApp(editingJob.id);
                        setEditingJob(null);
                      }
                    }}
                    className="px-6 py-5 bg-red-500/10 text-red-500 border border-red-500/20 rounded-2xl hover:bg-red-500/20 transition-all"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
        </AnimatePresence>
      </ModalPortal>
    </div>
  );
}

