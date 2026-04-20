import React, { useState, useEffect } from 'react';
import { 
  Plus, Search, Book, Code, CreditCard, Activity, Brain, Target, Share2, 
  Bold, Italic, Underline, Type, AlignLeft, AlignCenter, AlignRight, 
  List, CheckSquare, Quote, Link as LinkIcon, Image as ImageIcon, 
  Save, X, ArrowUpRight, Mic, Tag, Trash2, Smile, History
} from 'lucide-react';
import { useSovereignStore } from '../store/sovereign';
import type { JournalEntry } from '../store/sovereign';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';
import { KnowledgeCard } from '../components/mind/KnowledgeCard';
import { useSearchParams } from 'react-router-dom';
import { GrowthTab } from '../components/mind/GrowthTab';

type MindTab = 'journal' | 'vault' | 'archives' | 'nexus';

export default function Mind() {
  const { 
    journalEntries, addJournalEntry, updateJournalEntry, 
    knowledgeCards, addKnowledgeCard, addMoodEntry,
    archiveJournalEntry, unarchiveJournalEntry
  } = useSovereignStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = (searchParams.get('tab') as MindTab) || 'journal';
  const [activeTab, setActiveTabState] = useState<MindTab>(initialTab);
  
  const setActiveTab = (tab: MindTab) => {
    setActiveTabState(tab);
    setSearchParams({ tab });
  };
  const [search, setSearch] = useState('');
  const [selectedFolder, setSelectedFolder] = useState('Archives');
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isAddingCard, setIsAddingCard] = useState(false);
  
  // New Card Form
  const [cardQ, setCardQ] = useState('');
  const [cardA, setCardA] = useState('');
  const [cardCat, setCardCat] = useState('philosophy');
  
  // Editor State
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  // Daily Reflection State
  const [showReflection, setShowReflection] = useState(false);
  const [mood, setMood] = useState(5);
  const [intensity, setIntensity] = useState(5);
  const [gratitude, setGratitude] = useState(['', '', '']);

  const folders = [
    { id: 'Archives', icon: <Book size={16} />, count: journalEntries.length, color: 'var(--text-primary)' },
    { id: 'All', icon: <Book size={16} />, count: journalEntries.filter(e => !e.isArchived).length, color: 'var(--text-primary)' },
    { id: 'Development', icon: <Code size={16} />, count: journalEntries.filter(e => e.folder === 'Development' && !e.isArchived).length, color: 'var(--stat-code)' },
    { id: 'Financials', icon: <CreditCard size={16} />, count: journalEntries.filter(e => e.folder === 'Financials' && !e.isArchived).length, color: 'var(--stat-wealth)' },
    { id: 'Vitality', icon: <Activity size={16} />, count: journalEntries.filter(e => e.folder === 'Vitality' && !e.isArchived).length, color: 'var(--stat-body)' },
    { id: 'Philosophy', icon: <Brain size={16} />, count: journalEntries.filter(e => e.folder === 'Philosophy' && !e.isArchived).length, color: 'var(--stat-mind)' },
    { id: 'Influence', icon: <Target size={16} />, count: journalEntries.filter(e => e.folder === 'Influence' && !e.isArchived).length, color: 'var(--stat-brand)' },
    { id: 'Nexus', icon: <Share2 size={16} />, count: journalEntries.filter(e => e.folder === 'Nexus' && !e.isArchived).length, color: 'var(--stat-network)' },
    { id: 'Archives', icon: <History size={16} />, count: journalEntries.filter(e => e.isArchived).length, color: 'var(--text-muted)' },
  ];

  const filteredNotes = journalEntries.filter(e => {
    if (selectedFolder === 'Archives') return e.isArchived;
    if (e.isArchived) return false;
    
    const matchesSearch = e.title.toLowerCase().includes(search.toLowerCase()) || 
                         e.content.toLowerCase().includes(search.toLowerCase()) ||
                         e.tags?.some(t => t.toLowerCase().includes(search.toLowerCase()));
    const matchesFolder = selectedFolder === 'All' || e.folder === selectedFolder;
    return matchesSearch && matchesFolder;
  });

  const activeNote = journalEntries.find(e => e.id === activeNoteId);

  useEffect(() => {
    if (activeNote) {
      setTitle(activeNote.title);
      setContent(activeNote.content);
      setTags(activeNote.tags || []);
    } else {
      setTitle('');
      setContent('');
      setTags([]);
    }
  }, [activeNoteId]);

  const handleCreate = () => {
    const newNote: Omit<JournalEntry, 'id'> = {
      title: 'New Entry',
      content: '',
      folder: selectedFolder === 'All' ? 'Philosophy' : selectedFolder,
      date: new Date().toISOString(),
      isArchived: false
    };
    addJournalEntry(newNote);
  };

  const handleSave = async () => {
    if (!activeNoteId) return;
    setIsSaving(true);
    await updateJournalEntry(activeNoteId, { 
      title: title || 'Untitled Entry', 
      content,
      tags
    });
    setTimeout(() => setIsSaving(false), 800);
  };

  const handleMoodSubmit = () => {
    addMoodEntry({
      mood,
      energy: 5, // Default energy
      intensity,
      notes: '',
      gratitude: gratitude.filter(g => g.trim() !== ''),
      date: new Date().toISOString()
    });
    setShowReflection(false);
  };

  const handleAddCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardQ || !cardA) return;
    addKnowledgeCard({
      question: cardQ,
      answer: cardA,
      folder: cardCat
    });
    setCardQ('');
    setCardA('');
    setIsAddingCard(false);
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-7xl mx-auto space-y-8 pb-12">
      
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
         <div className="flex flex-col">
            <h1 className="font-mono text-[11px] tracking-[0.2em] text-[var(--stat-mind)] uppercase font-semibold mb-2">Cognitive Command</h1>
            <div className="font-mono text-4xl font-light tracking-tight text-white flex items-center gap-3 lowercase">
               MIND <span className="text-white/20">/</span> <span className="text-white/40">{activeTab}</span>
            </div>
         </div>

         <div className="flex items-center gap-2 p-1.5 bg-white/[0.03] border border-white/10 rounded-2xl">
            <TabButton active={activeTab === 'journal'} onClick={() => setActiveTab('journal')} label="Journal" />
            <TabButton active={activeTab === 'vault'} onClick={() => setActiveTab('vault')} label="Vault" />
            <TabButton active={activeTab === 'archives'} onClick={() => setActiveTab('archives')} label="Archives" />
            <TabButton active={activeTab === 'nexus'} onClick={() => setActiveTab('nexus')} label="Nexus" />
         </div>
      </div>

      <div className="h-[calc(100vh-280px)] flex bg-[var(--bg-primary)] border border-white/5 rounded-[40px] overflow-hidden shadow-2xl relative">
        <AnimatePresence mode="wait">
          {activeTab === 'journal' ? (
            <motion.div 
               key="journal"
               initial={{ opacity: 0, x: -20 }}
               animate={{ opacity: 1, x: 0 }}
               exit={{ opacity: 0, x: 20 }}
               className="flex w-full"
            >
      
      {/* Sidebar */}
      <div className="w-80 border-r border-white/5 bg-black/20 flex flex-col shrink-0">
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-xl bg-[var(--stat-mind)]/20 flex items-center justify-center text-[var(--stat-mind)]">
                <Book size={18} />
              </div>
              <h1 className="font-sans font-black text-lg tracking-tight">Notebook</h1>
            </div>
            <button 
              onClick={handleCreate}
              className="h-8 w-8 rounded-xl bg-gradient-to-br from-[#A855F7] to-[#7C3AED] flex items-center justify-center text-white shadow-lg hover:scale-105 active:scale-95 transition-all"
            >
              <Plus size={18} />
            </button>
          </div>

          <div className="relative group">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-[var(--text-primary)] transition-colors" />
            <input 
              placeholder="Search lore..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-white/5 border border-white/5 rounded-xl py-2.5 pl-9 pr-4 text-xs font-medium outline-none focus:border-white/10 focus:bg-white/[0.08] transition-all"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar px-3 space-y-1 pb-6">
          <div className="px-3 mb-2">
            <h3 className="text-[9px] font-mono tracking-[0.3em] text-[var(--text-muted)] uppercase font-black opacity-40">Taxonomy</h3>
          </div>
          {folders.map(folder => (
            <button
              key={folder.id}
              onClick={() => setSelectedFolder(folder.id)}
              className={cn(
                "w-full flex items-center justify-between p-3 rounded-xl transition-all group",
                selectedFolder === folder.id ? "bg-white/10" : "hover:bg-white/5"
              )}
            >
              <div className="flex items-center gap-3 text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors">
                <div style={{ color: folder.color }} className="opacity-80 group-hover:opacity-100 transition-opacity">
                  {folder.icon}
                </div>
                <span className={cn(
                  "text-xs font-bold tracking-tight",
                  selectedFolder === folder.id ? "text-[var(--text-primary)] font-black" : ""
                )}>
                  {folder.id}
                </span>
              </div>
              <span className="text-[10px] text-[var(--text-muted)] font-mono">{folder.count}</span>
            </button>
          ))}

          <div className="px-3 mt-8 mb-2">
            <h3 className="text-[9px] font-mono tracking-[0.3em] text-[var(--text-muted)] uppercase font-black opacity-40">Daily Reflection</h3>
          </div>
          <button 
            onClick={() => setShowReflection(true)}
            className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-all text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          >
            <Smile size={16} />
            <span className="text-xs font-bold">Log Mood & Gratitude</span>
          </button>

          <div className="px-3 mt-8 mb-2">
            <h3 className="text-[9px] font-mono tracking-[0.3em] text-[var(--text-muted)] uppercase font-black opacity-40">Entries</h3>
          </div>
          <div className="space-y-1">
            {filteredNotes.length === 0 ? (
              <div className="p-8 text-center opacity-20">
                <Book size={24} className="mx-auto mb-2" />
                <p className="text-[9px] font-mono uppercase">Vault Empty</p>
              </div>
            ) : (
              filteredNotes.map(note => (
                <button
                  key={note.id}
                  onClick={() => setActiveNoteId(note.id)}
                  className={cn(
                    "w-full text-left p-4 rounded-2xl transition-all border border-transparent animate-in slide-in-from-left-2 duration-300",
                    activeNoteId === note.id ? "bg-[var(--text-primary)]/10 border-[var(--text-primary)]/20" : "hover:bg-white/5"
                  )}
                >
                  <div className="flex items-center justify-between mb-1">
                    <h4 className={cn(
                      "text-[11px] font-black tracking-tight line-clamp-1",
                      activeNoteId === note.id ? "text-[var(--text-primary)]" : "text-[var(--text-secondary)]"
                    )}>
                      {note.title || 'Untitled Entry'}
                    </h4>
                  </div>
                  <p className="text-[10px] text-[var(--text-muted)] line-clamp-1 opacity-60">
                    {note.content || 'Awaiting thought sequence...'}
                  </p>
                </button>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col bg-black/40 relative">
        {!activeNoteId ? (
          <div className="flex-1 flex flex-col items-center justify-center space-y-4 opacity-20 select-none">
             <div className="h-20 w-20 rounded-[40px] border-2 border-dashed border-white flex items-center justify-center">
                <Book size={32} />
             </div>
             <p className="font-mono text-xs tracking-[0.5em] uppercase">Select Entry to Open Vault</p>
          </div>
        ) : (
          <>
            <div className="h-14 border-b border-white/5 bg-white/[0.02] flex items-center justify-between px-6 shrink-0">
              <div className="flex items-center gap-1">
                <div className="flex items-center gap-1 pr-3 mr-3 border-r border-white/10">
                   <ToolbarButton icon={<Bold size={16} />} />
                   <ToolbarButton icon={<Italic size={16} />} />
                   <ToolbarButton icon={<Underline size={16} />} />
                </div>
                <div className="flex items-center gap-1 pr-3 mr-3 border-r border-white/10">
                   <ToolbarButton icon={<Type size={16} />} label="H1" />
                   <ToolbarButton icon={<Type size={14} />} label="H2" active />
                </div>
                <div className="flex items-center gap-1 pr-3 mr-3 border-r border-white/10">
                   <ToolbarButton icon={<AlignLeft size={16} />} />
                   <ToolbarButton icon={<AlignCenter size={16} />} />
                   <ToolbarButton icon={<AlignRight size={16} />} />
                </div>
                <div className="flex items-center gap-1">
                   <ToolbarButton icon={<List size={16} />} />
                   <ToolbarButton icon={<CheckSquare size={16} />} />
                   <ToolbarButton icon={<Quote size={16} />} />
                </div>
              </div>

              <div className="flex items-center gap-3">
                 <div className="flex items-center gap-1 border-r border-white/10 pr-3">
                   <ToolbarButton icon={<LinkIcon size={16} />} />
                   <ToolbarButton icon={<ImageIcon size={16} />} />
                   <ToolbarButton icon={<Mic size={16} />} onClick={() => alert('Voice Protocol Initialized. System listening... (Mock)')} />
                 </div>
                 <div className="flex items-center gap-4">
                    <ToolbarButton icon={<Trash2 size={16} />} onClick={() => {
                      if (activeNoteId) {
                        activeNote?.isArchived ? unarchiveJournalEntry(activeNoteId) : archiveJournalEntry(activeNoteId);
                        setActiveNoteId(null);
                      }
                    }} />
                    <ToolbarButton icon={<Share2 size={16} />} />
                    <button 
                      onClick={handleSave}
                      disabled={isSaving}
                      className={cn(
                        "flex items-center gap-2 px-6 py-2 rounded-xl text-xs font-black tracking-widest transition-all uppercase whitespace-nowrap shadow-lg active:scale-95",
                        isSaving 
                          ? "bg-[var(--success)] text-white" 
                          : "bg-[var(--text-primary)] text-[var(--bg-primary)] hover:opacity-90"
                      )}
                    >
                      {isSaving ? <CheckSquare size={14} /> : <Save size={14} />}
                      {isSaving ? 'Saved' : 'Save Lore'}
                    </button>
                    <button 
                      onClick={() => setActiveNoteId(null)}
                      className="h-8 w-8 flex items-center justify-center text-[var(--text-muted)] hover:text-white transition-colors"
                    >
                      <X size={18} />
                    </button>
                 </div>
              </div>
            </div>

            <div className="flex-1 p-16 overflow-y-auto no-scrollbar">
               <div className="max-w-3xl mx-auto space-y-10 animate-in fade-in zoom-in-95 duration-500">
                  <div className="space-y-4">
                    <h3 className="text-[10px] font-mono tracking-[0.5em] text-[var(--stat-mind)] uppercase font-black opacity-60">System Entry</h3>
                    <input 
                      value={title}
                      onChange={e => setTitle(e.target.value)}
                      placeholder="Protocol Title..."
                      className="w-full bg-transparent text-5xl font-black tracking-tighter text-[var(--text-primary)] outline-none border-none placeholder:opacity-10"
                    />
                  </div>

                  {/* F15: Tags */}
                  <div className="flex flex-wrap items-center gap-2">
                     <Tag size={12} className="text-white/20" />
                     {tags.map(t => (
                       <span key={t} className="px-2 py-1 bg-white/5 border border-white/10 rounded-lg text-[9px] font-mono text-white/40 flex items-center gap-2">
                          #{t}
                          <button onClick={() => setTags(tags.filter(tag => tag !== t))}><X size={10} /></button>
                       </span>
                     ))}
                     <input 
                       value={tagInput}
                       onChange={e => setTagInput(e.target.value)}
                       onKeyDown={e => {
                         if (e.key === 'Enter' && tagInput) {
                           setTags([...tags, tagInput]);
                           setTagInput('');
                         }
                       }}
                       placeholder="+ Add tag..."
                       className="bg-transparent border-none outline-none text-[10px] font-mono text-white/20 focus:text-white/40"
                     />
                  </div>
                  
                  <div className="space-y-6">
                    <textarea 
                      value={content}
                      onChange={e => setContent(e.target.value)}
                      placeholder="Initialize thought sequence..."
                      className="w-full bg-transparent p-0 text-xl leading-relaxed text-[var(--text-secondary)] outline-none border-none resize-none min-h-[600px] placeholder:opacity-5 font-sans"
                    />
                  </div>
               </div>
            </div>
          </>
        )}
      </div>
            </motion.div>
          ) : activeTab === 'vault' ? (
            <motion.div 
              key="vault"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="flex-1 flex flex-col p-12 overflow-y-auto no-scrollbar"
            >
               <div className="flex items-center justify-between mb-12">
                  <div>
                    <h3 className="font-sans text-2xl font-black text-white">KNOWLEDGE VAULT</h3>
                    <p className="text-sm text-white/30 font-mono uppercase tracking-widest mt-1">Spaced Repetition Engine // {knowledgeCards.length} active units</p>
                  </div>
                  <button 
                    onClick={() => setIsAddingCard(true)}
                    className="px-6 py-3 bg-[var(--stat-mind)] text-white rounded-2xl font-mono text-[10px] font-black tracking-widest uppercase hover:brightness-110 transition-all shadow-[0_0_20px_rgba(102,126,234,0.3)]"
                  >
                    Deploy New Unit
                  </button>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                  {knowledgeCards.map(card => (
                    <KnowledgeCard key={card.id} card={card} />
                  ))}
                  {knowledgeCards.length === 0 && (
                    <div className="col-span-full py-24 border border-dashed border-white/10 rounded-[40px] flex flex-col items-center justify-center opacity-20">
                      <Brain size={48} className="mb-4" />
                      <p className="font-mono text-xs uppercase tracking-[0.4em]">Vault Decompressed // No Units Detected</p>
                    </div>
                  )}
               </div>

               <AnimatePresence>
                 {isAddingCard && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="fixed inset-0 z-[600] bg-black/80 backdrop-blur-md flex items-center justify-center p-6"
                    >
                       <form onSubmit={handleAddCard} className="w-full max-w-xl bg-[#111] border border-white/10 rounded-[40px] p-10 shadow-2xl relative">
                          <button onClick={() => setIsAddingCard(false)} className="absolute top-8 right-8 text-white/20 hover:text-white transition-colors">
                            <X size={24} />
                          </button>
                          
                          <h4 className="text-2xl font-black text-white uppercase italic mb-8">Register Knowledge Unit</h4>
                          
                          <div className="space-y-6">
                            <div>
                               <label className="block text-[8px] font-mono text-white/30 uppercase tracking-[0.3em] mb-3">Unit Prompt / Question</label>
                               <input value={cardQ} onChange={e => setCardQ(e.target.value)} placeholder="E.g. The first principle of tactical code architecture?" className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white outline-none focus:border-[var(--stat-mind)]" />
                            </div>
                            <div>
                               <label className="block text-[8px] font-mono text-white/30 uppercase tracking-[0.3em] mb-3">Unit Resolution / Answer</label>
                               <textarea value={cardA} onChange={e => setCardA(e.target.value)} placeholder="Explain the concept in high-density clarity..." className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white outline-none focus:border-[var(--stat-mind)] h-32 resize-none" />
                            </div>
                            <div>
                               <label className="block text-[8px] font-mono text-white/30 uppercase tracking-[0.3em] mb-3">Taxonomy Class</label>
                               <select value={cardCat} onChange={e => setCardCat(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white outline-none focus:border-[var(--stat-mind)] appearance-none font-mono text-xs uppercase">
                                  <option value="philosophy">Philosophy</option>
                                  <option value="code">Code</option>
                                  <option value="finance">Finance</option>
                                  <option value="vitality">Vitality</option>
                               </select>
                            </div>
                            <button type="submit" className="w-full py-5 bg-white text-black font-mono font-black tracking-widest uppercase rounded-2xl hover:brightness-90 transition-all text-xs">Commit to Vault</button>
                          </div>
                       </form>
                    </motion.div>
                 )}
               </AnimatePresence>
            </motion.div>
          ) : activeTab === 'archives' ? (
            <motion.div 
               key="archives"
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, y: -20 }}
               className="flex-1 p-12 overflow-y-auto"
            >
               <div className="mb-12">
                  <h3 className="font-sans text-2xl font-black text-white">MISSION ARCHIVES</h3>
                  <p className="text-sm text-white/30 font-mono uppercase tracking-widest mt-1">Boss Encounter Records // High Command Clearance Only</p>
               </div>
               
               <div className="flex flex-col gap-4">
                  {journalEntries.filter(e => e.folder === 'Archives').length === 0 ? (
                    <div className="py-24 border border-dashed border-white/10 rounded-[40px] flex flex-col items-center justify-center opacity-20">
                      <Target size={48} className="mb-4" />
                      <p className="font-mono text-xs uppercase tracking-[0.4em]">No Encounters Logged in Archives</p>
                    </div>
                  ) : (
                    journalEntries.filter(e => e.folder === 'Archives').map(entry => (
                       <div key={entry.id} className="p-8 bg-white/[0.02] border border-white/10 rounded-3xl hover:border-[var(--stat-mind)] transition-all group flex items-center justify-between">
                          <div>
                             <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 rounded-lg bg-[var(--stat-mind)]/20 text-[var(--stat-mind)]">
                                   <Target size={18} />
                                </div>
                                <span className="font-mono text-[10px] text-white/40 uppercase tracking-widest">{new Date(entry.date).toLocaleDateString()}</span>
                             </div>
                             <h4 className="text-xl font-black text-white uppercase italic group-hover:text-[var(--stat-mind)] transition-colors">{entry.title}</h4>
                             <p className="text-xs text-white/30 mt-2 max-w-xl">{entry.content.substring(0, 120)}...</p>
                          </div>
                          <button className="h-12 w-12 rounded-full border border-white/10 flex items-center justify-center text-white/20 group-hover:text-white group-hover:border-white/30 transition-all">
                             <ArrowUpRight size={20} />
                          </button>
                       </div>
                    ))
                  )}
               </div>
            </motion.div>
          ) : (
            <motion.div 
               key="nexus"
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               className="flex-1 overflow-hidden"
            >
               <GrowthTab />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* F16/17: Reflection Modal */}
      <AnimatePresence>
        {showReflection && (
          <div className="fixed inset-0 z-[700] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
             <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="w-full max-w-lg bg-[#0a0a0a] border border-white/10 rounded-[40px] p-10 relative shadow-2xl">
                <button onClick={() => setShowReflection(false)} className="absolute top-8 right-8 text-white/20 hover:text-white"><X size={24} /></button>
                <h3 className="text-2xl font-black text-white uppercase italic mb-8">System Recalibration</h3>
                
                <div className="space-y-8">
                   <div className="space-y-4">
                      <label className="block text-[8px] font-mono text-white/30 uppercase tracking-widest">Mood Magnitude ({mood}/10)</label>
                      <input type="range" min="1" max="10" value={mood} onChange={e => setMood(Number(e.target.value))} className="w-full" />
                   </div>
                   <div className="space-y-4">
                      <label className="block text-[8px] font-mono text-white/30 uppercase tracking-widest">Cognitive Intensity ({intensity}/10)</label>
                      <input type="range" min="1" max="10" value={intensity} onChange={e => setIntensity(Number(e.target.value))} className="w-full" />
                   </div>
                   <div className="space-y-4">
                      <label className="block text-[8px] font-mono text-white/30 uppercase tracking-widest">Gratitude List (3 Tactical Wins)</label>
                      {gratitude.map((g, i) => (
                        <input 
                          key={i}
                          value={g} 
                          onChange={e => {
                            const newG = [...gratitude];
                            newG[i] = e.target.value;
                            setGratitude(newG);
                          }}
                          placeholder={`Win #${i+1}...`}
                          className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-[11px] text-white outline-none focus:border-[var(--stat-mind)]"
                        />
                      ))}
                   </div>
                   <button onClick={handleMoodSubmit} className="w-full py-5 bg-white text-black font-black font-mono text-[10px] uppercase tracking-widest rounded-2xl hover:scale-[0.98] transition-all">
                      COMMIT RECALIBRATION
                   </button>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function TabButton({ active, onClick, label }: { active: boolean, onClick: () => void, label: string }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "px-6 py-2.5 rounded-xl font-mono text-[10px] font-black tracking-widest uppercase transition-all whitespace-nowrap",
        active ? "bg-white text-black shadow-lg" : "text-white/30 hover:text-white/60"
      )}
    >
      {label}
    </button>
  );
}

function ToolbarButton({ icon, label, active = false, onClick }: { icon: React.ReactNode, label?: string, active?: boolean, onClick?: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
      "h-8 flex items-center gap-1.5 px-2 rounded-lg transition-all hover:bg-white/5",
      active ? "bg-white/10 text-[var(--stat-mind)]" : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
    )}>
      {icon}
      {label && <span className="text-[10px] font-black font-sans">{label}</span>}
    </button>
  );
}
