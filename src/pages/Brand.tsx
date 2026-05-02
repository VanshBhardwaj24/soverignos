import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Feather, Plus, Layout, Calendar as CalendarIcon, 
  Clock, Repeat, Bell, 
  ChevronRight, Trash2, 
  Play, Share2, Camera, Users,
  Zap
} from 'lucide-react';
import { useSovereignStore, type ContentPiece } from '../store/sovereign';
import { cn } from '../lib/utils';
import { toast } from 'sonner';

const STATUSES = [
  { id: 'idea', label: 'Idea', color: 'bg-white/10' },
  { id: 'research', label: 'Research', color: 'bg-blue-500/20' },
  { id: 'production', label: 'Production', color: 'bg-purple-500/20' },
  { id: 'refinement', label: 'Refinement', color: 'bg-orange-500/20' },
  { id: 'scheduled', label: 'Scheduled', color: 'bg-green-500/20' },
  { id: 'uploaded', label: 'Uploaded', color: 'bg-emerald-500/40' },
] as const;

const PLATFORMS: Record<string, any> = {
  x: { icon: Share2, color: '#1DA1F2' },
  youtube: { icon: Play, color: '#FF0000' },
  instagram: { icon: Camera, color: '#E1306C' },
  linkedin: { icon: Users, color: '#0077B5' },
  other: { icon: Zap, color: '#FFFFFF' }
};

export default function Brand() {
  const { 
    contentPieces = [], 
    socialAccounts = [], 
    addContentPiece, updateContentPiece, deleteContentPiece
  } = useSovereignStore();

  const [viewMode, setViewMode] = useState<'kanban' | 'calendar'>('kanban');
  const [filterAccount, setFilterAccount] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPiece, setEditingPiece] = useState<ContentPiece | null>(null);

  const filteredPieces = useMemo(() => {
    return (contentPieces || []).filter((p: any) => filterAccount === 'all' || p.accountId === filterAccount);
  }, [contentPieces, filterAccount]);

  return (
    <div className="max-w-[1400px] mx-auto pb-24 px-4 sm:px-8 lg:px-12 animate-in fade-in slide-in-from-bottom-6 duration-700">
      
      {/* Header HUD */}
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 mb-16 pt-8">
        <div className="flex items-center gap-6">
          <div className="h-16 w-16 bg-white/[0.03] border border-white/10 rounded-3xl flex items-center justify-center text-white shadow-2xl relative group overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <Feather size={32} strokeWidth={1.5} className="relative z-10" />
          </div>
          <div>
            <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] mb-1">Strategic Influence</p>
            <h1 className="text-6xl font-light text-white tracking-tighter leading-none">
              Brand
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex bg-white/5 border border-white/10 p-1 rounded-2xl">
            <button 
              onClick={() => setViewMode('kanban')}
              className={cn(
                "p-2 rounded-xl transition-all",
                viewMode === 'kanban' ? "bg-white text-black shadow-lg" : "text-white/40 hover:text-white"
              )}
            >
              <Layout size={20} />
            </button>
            <button 
              onClick={() => setViewMode('calendar')}
              className={cn(
                "p-2 rounded-xl transition-all",
                viewMode === 'calendar' ? "bg-white text-black shadow-lg" : "text-white/40 hover:text-white"
              )}
            >
              <CalendarIcon size={20} />
            </button>
          </div>

          <button
            onClick={() => {
              setEditingPiece(null);
              setIsModalOpen(true);
            }}
            className="group flex items-center gap-3 bg-white text-black px-6 py-3 rounded-xl font-black text-[10px] tracking-[0.2em] uppercase hover:scale-105 active:scale-95 transition-all shadow-xl shadow-white/10"
          >
            <Plus size={18} />
            Initialize Content
          </button>
        </div>
      </header>

      {/* Account HUD */}
      <div className="flex gap-4 mb-12 overflow-x-auto no-scrollbar pb-4">
        <button
          onClick={() => setFilterAccount('all')}
          className={cn(
            "flex items-center gap-3 px-6 py-3 rounded-2xl border transition-all whitespace-nowrap",
            filterAccount === 'all' 
              ? "bg-white text-black border-white" 
              : "bg-white/5 border-white/10 text-white/40 hover:text-white"
          )}
        >
          <span className="text-[10px] font-black uppercase tracking-widest">Global Vault</span>
        </button>
        {socialAccounts?.map?.((acc: any) => {
          const PlatformIcon = PLATFORMS[acc.platform]?.icon || Zap;
          return (
            <button
              key={acc.id}
              onClick={() => setFilterAccount(acc.id)}
              className={cn(
                "flex items-center gap-3 px-6 py-3 rounded-2xl border transition-all whitespace-nowrap",
                filterAccount === acc.id 
                  ? "bg-white text-black border-white" 
                  : "bg-white/5 border-white/10 text-white/40 hover:text-white"
              )}
            >
              <PlatformIcon size={16} />
              <span className="text-[10px] font-black uppercase tracking-widest">{acc.handle}</span>
            </button>
          );
        })}
        <button 
          onClick={() => toast.info('Account linkage protocol enabled.')}
          className="flex items-center justify-center w-12 h-12 rounded-2xl bg-white/5 border border-white/10 text-white/20 hover:text-white hover:bg-white/10 transition-all"
        >
          <Plus size={20} />
        </button>
      </div>

      {/* Board/Calendar View */}
      {viewMode === 'kanban' ? (
        <div className="flex gap-6 overflow-x-auto no-scrollbar min-h-[600px]">
          {STATUSES.map(status => (
            <div key={status.id} className="flex-shrink-0 w-80 flex flex-col gap-4">
              <div className="flex items-center justify-between px-4">
                <div className="flex items-center gap-2">
                   <div className={cn("w-2 h-2 rounded-full", status.color.replace('/20', '/100'))} />
                   <h4 className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">{status.label}</h4>
                </div>
                <span className="text-[10px] font-bold text-white/20">{filteredPieces.filter((p: any) => p.status === status.id).length}</span>
              </div>
              
              <div className="flex flex-col gap-4">
                <AnimatePresence mode="popLayout">
                  {filteredPieces?.filter?.((p: any) => p.status === status.id).map((piece: any) => (
                    <ContentCard 
                      key={piece.id} 
                      piece={piece} 
                      onClick={() => {
                        setEditingPiece(piece);
                        setIsModalOpen(true);
                      }}
                    />
                  ))}
                </AnimatePresence>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-12 bg-white/[0.02] border border-white/5 rounded-[48px] flex flex-col items-center justify-center text-white/20">
          <CalendarIcon size={48} className="mb-4 opacity-10" />
          <p className="text-sm font-bold uppercase tracking-widest">Chronological View Calibrating</p>
          <p className="text-[10px] font-medium mt-1">Calendar engine will synchronize in Phase 3.</p>
        </div>
      )}

      {isModalOpen && (
        <ContentPieceModal 
          isOpen={isModalOpen}
          piece={editingPiece}
          accounts={socialAccounts}
          onClose={() => setIsModalOpen(false)}
          onSave={async (data: any) => {
             if (editingPiece) {
               await updateContentPiece(editingPiece.id, data);
             } else {
               await addContentPiece(data);
             }
             setIsModalOpen(false);
          }}
          onDelete={async () => {
             if (editingPiece) {
               await deleteContentPiece(editingPiece.id);
               setIsModalOpen(false);
             }
          }}
        />
      )}
    </div>
  );
}

function ContentCard({ piece, onClick }: { piece: ContentPiece, onClick: () => void }) {
  const account = useSovereignStore(state => (state.socialAccounts || []).find((a: any) => a.id === piece.accountId));
  const PlatformIcon = PLATFORMS[piece.platform]?.icon || Zap;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -4, scale: 1.02 }}
      onClick={onClick}
      className="group p-6 bg-white/[0.03] border border-white/5 rounded-3xl cursor-pointer hover:bg-white/[0.06] hover:border-white/10 transition-all duration-300"
    >
      <div className="flex items-center gap-2 mb-4">
        <div className="p-1.5 bg-white/5 rounded-lg text-white/40 group-hover:text-white transition-colors">
          <PlatformIcon size={14} />
        </div>
        <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">{account?.handle || 'Unknown'}</span>
      </div>

      <h5 className="text-sm font-bold text-white mb-4 line-clamp-2 leading-tight">{piece.title}</h5>

      <div className="flex items-center justify-between pt-4 border-t border-white/5">
        <div className="flex items-center gap-3">
          {piece.scheduledDate && (
            <div className="flex items-center gap-1.5 text-white/20">
              <Clock size={10} />
              <span className="text-[9px] font-bold uppercase">{new Date(piece.scheduledDate).toLocaleDateString()}</span>
            </div>
          )}
          {piece.isRepeating && (
            <Repeat size={10} className="text-[var(--stat-code)]" />
          )}
        </div>
        <ChevronRight size={14} className="text-white/10 group-hover:text-white transition-colors" />
      </div>
    </motion.div>
  );
}

function ContentPieceModal({ piece, accounts, onClose, onSave, onDelete }: any) {
  const [activeTab, setActiveTab] = useState<'core' | 'protocol'>('core');
  const [formData, setFormData] = useState<Partial<ContentPiece>>(piece || {
    title: '',
    accountId: accounts?.[0]?.id || '',
    status: 'idea',
    platform: accounts?.[0]?.platform || 'x',
    isRepeating: false,
    repeatConfig: { frequency: 'weekly' },
    reminderEnabled: false,
    reminderOffset: 60,
    notes: '',
    assets: []
  });

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={onClose} className="absolute inset-0 bg-black/90 backdrop-blur-md" />
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative w-full max-w-2xl bg-[#0a0a0a] border border-white/10 rounded-[48px] overflow-hidden shadow-2xl flex flex-col"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2" />
        
        <header className="p-12 pb-0 relative">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h2 className="text-4xl font-bold text-white tracking-tighter">{piece ? 'Edit Content' : 'New Content'}</h2>
              <p className="text-white/40 text-sm font-medium tracking-tight">Deploy high-leverage assets to the network.</p>
            </div>
            {piece && (
              <button onClick={onDelete} className="p-3 bg-red-500/10 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all">
                <Trash2 size={20} />
              </button>
            )}
          </div>

          <div className="flex gap-8 border-b border-white/5">
            {['core', 'protocol'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={cn(
                  "pb-4 text-[10px] font-black uppercase tracking-[0.2em] transition-all relative",
                  activeTab === tab ? "text-white" : "text-white/20"
                )}
              >
                {tab} Phase
                {activeTab === tab && <motion.div layoutId="tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-white" />}
              </button>
            ))}
          </div>
        </header>

        <div className="p-12 pt-10 overflow-y-auto max-h-[60vh] custom-scrollbar">
          {activeTab === 'core' ? (
            <div className="space-y-8">
              <div className="space-y-4">
                <label className="text-[10px] font-black text-white/40 uppercase tracking-widest block ml-1">Content Anchor / Hook</label>
                <input
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white text-lg font-bold outline-none focus:border-white/30 transition-all"
                  placeholder="Enter high-level hook..."
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-white/40 uppercase tracking-widest block ml-1">Target Identity</label>
                  <select
                    value={formData.accountId}
                    onChange={e => {
                      const acc = (accounts || []).find((a: any) => a.id === e.target.value);
                      setFormData({ ...formData, accountId: e.target.value, platform: acc?.platform || 'other' });
                    }}
                    className="w-full bg-[#1a1a1a] border border-white/10 rounded-2xl py-4 px-6 text-white text-sm font-bold appearance-none outline-none"
                  >
                    {(accounts || []).map((acc: any) => (
                      <option key={acc.id} value={acc.id} className="bg-[#1a1a1a]">{acc.handle} ({acc.platform})</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-white/40 uppercase tracking-widest block ml-1">Pipeline Status</label>
                  <select
                    value={formData.status}
                    onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full bg-[#1a1a1a] border border-white/10 rounded-2xl py-4 px-6 text-white text-sm font-bold appearance-none outline-none"
                  >
                    {STATUSES.map(s => (
                      <option key={s.id} value={s.id} className="bg-[#1a1a1a]">{s.label.toUpperCase()}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black text-white/40 uppercase tracking-widest block ml-1">Production Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white text-sm min-h-[120px] outline-none focus:border-white/30 transition-all"
                  placeholder="Scripting / Research nodes..."
                />
              </div>
            </div>
          ) : (
            <div className="space-y-10">
               <div className="space-y-4">
                <label className="text-[10px] font-black text-white/40 uppercase tracking-widest block ml-1">Deployment Schedule</label>
                <input
                  type="datetime-local"
                  value={formData.scheduledDate ? new Date(formData.scheduledDate).toISOString().slice(0, 16) : ''}
                  onChange={e => setFormData({ ...formData, scheduledDate: e.target.value ? new Date(e.target.value).toISOString() : undefined })}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white text-sm font-bold outline-none focus:border-white/30 transition-all"
                />
              </div>

              <div className="flex items-center justify-between p-6 bg-white/5 rounded-3xl border border-white/5">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-purple-500/10 text-purple-400 rounded-2xl">
                    <Repeat size={20} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Repeating Protocol</h4>
                    <p className="text-[10px] text-white/40">Automatically re-generate in pipeline.</p>
                  </div>
                </div>
                <button 
                  type="button"
                  onClick={() => setFormData({ ...formData, isRepeating: !formData.isRepeating })}
                  className={cn(
                    "w-12 h-6 rounded-full transition-all relative",
                    formData.isRepeating ? "bg-white" : "bg-white/10"
                  )}
                >
                  <div className={cn(
                    "absolute top-1 w-4 h-4 rounded-full transition-all",
                    formData.isRepeating ? "right-1 bg-black" : "left-1 bg-white/20"
                  )} />
                </button>
              </div>

              <div className="flex items-center justify-between p-6 bg-white/5 rounded-3xl border border-white/5">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-500/10 text-blue-400 rounded-2xl">
                    <Bell size={20} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Reminders</h4>
                    <p className="text-[10px] text-white/40">Trigger system notifications.</p>
                  </div>
                </div>
                <button 
                  type="button"
                  onClick={() => setFormData({ ...formData, reminderEnabled: !formData.reminderEnabled })}
                  className={cn(
                    "w-12 h-6 rounded-full transition-all relative",
                    formData.reminderEnabled ? "bg-white" : "bg-white/10"
                  )}
                >
                  <div className={cn(
                    "absolute top-1 w-4 h-4 rounded-full transition-all",
                    formData.reminderEnabled ? "right-1 bg-black" : "left-1 bg-white/20"
                  )} />
                </button>
              </div>
            </div>
          )}
        </div>

        <footer className="p-12 pt-0 flex gap-4 mt-auto">
          <button onClick={onClose} className="flex-1 py-4 bg-white/5 border border-white/10 text-white font-black text-[10px] tracking-[0.2em] uppercase rounded-2xl">Cancel</button>
          <button onClick={() => onSave(formData)} className="flex-1 py-4 bg-white text-black font-black text-[10px] tracking-[0.2em] uppercase rounded-2xl">Confirm Phase</button>
        </footer>
      </motion.div>
    </div>
  );
}
