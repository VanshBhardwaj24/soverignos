import React, { useState, useEffect } from 'react';
import {
  Plus, Search, Book, Code, CreditCard, Activity, Brain, Target, Share2,
  Bold, Italic, AlignLeft,
  List, Quote,
  X, ArrowUpRight, Mic, Tag, Trash2, Smile, History
} from 'lucide-react';
import { useSovereignStore } from '../store/sovereign';
import type { JournalEntry } from '../store/sovereign';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';
import { KnowledgeCard } from '../components/mind/KnowledgeCard';
import { useSearchParams } from 'react-router-dom';
import { GrowthTab } from '../components/mind/GrowthTab';
import { FutureLetters } from '../components/psych/FutureLetters';
import { ModalPortal } from '../components/ui/ModalPortal';
import { DecisionJournal } from '../components/psych/DecisionJournal';

type MindTab = 'journal' | 'vault' | 'archives' | 'nexus' | 'decisions' | 'letters';

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
    { id: 'Archives', icon: <Book size={16} />, count: journalEntries.length, color: 'text-white/60' },
    { id: 'All', icon: <Book size={16} />, count: journalEntries.filter(e => !e.isArchived).length, color: 'text-white/80' },
    { id: 'Development', icon: <Code size={16} />, count: journalEntries.filter(e => e.folder === 'Development' && !e.isArchived).length, color: 'text-blue-400' },
    { id: 'Financials', icon: <CreditCard size={16} />, count: journalEntries.filter(e => e.folder === 'Financials' && !e.isArchived).length, color: 'text-amber-400' },
    { id: 'Vitality', icon: <Activity size={16} />, count: journalEntries.filter(e => e.folder === 'Vitality' && !e.isArchived).length, color: 'text-rose-400' },
    { id: 'Philosophy', icon: <Brain size={16} />, count: journalEntries.filter(e => e.folder === 'Philosophy' && !e.isArchived).length, color: 'text-purple-400' },
    { id: 'Influence', icon: <Target size={16} />, count: journalEntries.filter(e => e.folder === 'Influence' && !e.isArchived).length, color: 'text-orange-400' },
    { id: 'Nexus', icon: <Share2 size={16} />, count: journalEntries.filter(e => e.folder === 'Nexus' && !e.isArchived).length, color: 'text-pink-400' },
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
      energy: 5,
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
    <div className="max-w-[1400px] mx-auto space-y-8 pb-12 px-6 sm:px-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">

      {/* Apple-Style Header & Navigation */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 pt-12 relative z-10">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-bold tracking-[0.25em] text-purple-400/60 uppercase pl-1">Cognitive Command</span>
          </div>
          <h1 className="text-6xl font-semibold tracking-tight text-white leading-none">
            Mind <span className="text-white/20 font-light">Studio</span>
          </h1>
        </div>

        <div className="bg-white/[0.03] border border-white/10 p-1.5 rounded-[22px] backdrop-blur-xl flex items-center relative overflow-hidden">
          <AnimatePresence mode="wait">
            <TabIndicator activeTab={activeTab} tabs={['journal', 'vault', 'nexus', 'decisions', 'letters']} />
          </AnimatePresence>
          <NavTab active={activeTab === 'journal'} onClick={() => setActiveTab('journal')} label="Journal" />
          <NavTab active={activeTab === 'vault'} onClick={() => setActiveTab('vault')} label="Vault" />
          {/* <NavTab active={activeTab === 'archives'} onClick={() => setActiveTab('archives')} label="Archives" /> */}
          <NavTab active={activeTab === 'nexus'} onClick={() => setActiveTab('nexus')} label="Nexus" />
          <NavTab active={activeTab === 'decisions'} onClick={() => setActiveTab('decisions')} label="Decisions" />
          <NavTab active={activeTab === 'letters'} onClick={() => setActiveTab('letters')} label="Letters" />
        </div>
      </div>

      <div className="h-[calc(100vh-220px)] flex bg-white/[0.02] border border-white/10 rounded-[40px] overflow-hidden backdrop-blur-3xl shadow-2xl relative">
        <AnimatePresence mode="wait">
          {activeTab === 'journal' ? (
            <motion.div
              key="journal"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="flex w-full"
            >
              {/* Sidebar: Notebook */}
              <div className="w-80 border-r border-white/5 bg-white/[0.01] flex flex-col shrink-0">
                <div className="p-8 space-y-8">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-medium text-white/80 tracking-tight">Notebook</h3>
                    <button
                      onClick={handleCreate}
                      className="h-10 w-10 rounded-full bg-white text-black flex items-center justify-center shadow-xl hover:scale-105 active:scale-95 transition-all"
                    >
                      <Plus size={20} strokeWidth={3} />
                    </button>
                  </div>

                  <div className="relative group">
                    <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-white/60 transition-colors" />
                    <input
                      placeholder="Search lore..."
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-[18px] py-3 pl-11 pr-4 text-xs text-white placeholder:text-white/20 outline-none focus:bg-white/[0.08] transition-all"
                    />
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto no-scrollbar px-4 space-y-1 pb-10">
                  <div className="px-4 mb-4">
                    <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Taxonomy</span>
                  </div>
                  {folders.map(folder => (
                    <button
                      key={folder.id}
                      onClick={() => setSelectedFolder(folder.id)}
                      className={cn(
                        "w-full flex items-center justify-between px-4 py-3 rounded-[18px] transition-all group",
                        selectedFolder === folder.id ? "bg-white/[0.06] shadow-sm" : "hover:bg-white/[0.03]"
                      )}
                    >
                      <div className="flex items-center gap-4 text-white/40 group-hover:text-white/80 transition-colors">
                        <div className={cn("transition-colors", folder.color)}>
                          {folder.icon}
                        </div>
                        <span className={cn(
                          "text-[13px] font-medium tracking-tight",
                          selectedFolder === folder.id ? "text-white" : ""
                        )}>
                          {folder.id}
                        </span>
                      </div>
                      <span className="text-[11px] font-bold text-white/10 tabular-nums">{folder.count}</span>
                    </button>
                  ))}

                  <div className="px-4 mt-10 mb-4">
                    <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Reflection</span>
                  </div>
                  <button
                    onClick={() => setShowReflection(true)}
                    className="w-full flex items-center gap-4 px-4 py-4 rounded-[18px] bg-purple-500/5 border border-purple-500/10 text-purple-400/60 hover:text-purple-400 hover:bg-purple-500/10 transition-all mb-8"
                  >
                    <Smile size={18} />
                    <span className="text-[13px] font-medium tracking-tight">Log Mood & Gratitude</span>
                  </button>

                  <div className="px-4 mb-4">
                    <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Entries</span>
                  </div>
                  <div className="space-y-2 pb-10">
                    {filteredNotes.length === 0 ? (
                      <div className="p-8 text-center opacity-20">
                        <Book size={24} className="mx-auto mb-2" />
                        <p className="text-[10px] uppercase tracking-widest">Empty Vault</p>
                      </div>
                    ) : (
                      filteredNotes.map(note => (
                        <button
                          key={note.id}
                          onClick={() => setActiveNoteId(note.id)}
                          className={cn(
                            "w-full text-left p-5 rounded-[24px] border border-transparent transition-all",
                            activeNoteId === note.id ? "bg-white/[0.05] border-white/10 shadow-lg" : "hover:bg-white/[0.02]"
                          )}
                        >
                          <h4 className={cn(
                            "text-sm font-semibold tracking-tight line-clamp-1 mb-1",
                            activeNoteId === note.id ? "text-white" : "text-white/40"
                          )}>
                            {note.title || 'Untitled Entry'}
                          </h4>
                          <p className="text-[11px] text-white/20 line-clamp-1 font-medium italic">
                            {note.content || 'Awaiting thought sequence...'}
                          </p>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Main Content Area: Editor */}
              <div className="flex-1 flex flex-col relative bg-white/[0.01]">
                {!activeNoteId ? (
                  <div className="flex-1 flex flex-col items-center justify-center space-y-6 opacity-20">
                    <div className="h-24 w-24 rounded-[48px] border-2 border-dashed border-white flex items-center justify-center">
                      <Book size={36} strokeWidth={1} />
                    </div>
                    <p className="text-[11px] font-bold tracking-[0.4em] uppercase text-center">Select Entry to Open Vault</p>
                  </div>
                ) : (
                  <>
                    <div className="h-16 border-b border-white/5 flex items-center justify-between px-10 shrink-0 bg-white/[0.02] backdrop-blur-md">
                      <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2 border-r border-white/10 pr-6">
                          <ToolIcon icon={<Bold size={16} />} />
                          <ToolIcon icon={<Italic size={16} />} />
                          <ToolIcon icon={<AlignLeft size={16} />} />
                        </div>
                        <div className="flex items-center gap-2">
                          <ToolIcon icon={<List size={16} />} />
                          <ToolIcon icon={<Quote size={16} />} />
                          <ToolIcon icon={<Mic size={16} />} />
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => {
                            activeNote?.isArchived ? unarchiveJournalEntry(activeNoteId) : archiveJournalEntry(activeNoteId);
                            setActiveNoteId(null);
                          }}
                          className="p-3 rounded-full hover:bg-rose-500/10 text-white/20 hover:text-rose-400 transition-all"
                        >
                          <Trash2 size={18} />
                        </button>
                        <button
                          onClick={handleSave}
                          disabled={isSaving}
                          className={cn(
                            "h-10 px-8 rounded-full text-[12px] font-bold tracking-tight transition-all",
                            isSaving ? "bg-emerald-500 text-white" : "bg-white text-black hover:scale-105 active:scale-95 shadow-xl"
                          )}
                        >
                          {isSaving ? 'Synchronized' : 'Save Protocol'}
                        </button>
                      </div>
                    </div>

                    <div className="flex-1 p-16 md:p-24 overflow-y-auto no-scrollbar">
                      <div className="max-w-3xl mx-auto space-y-12">
                        <div className="space-y-4">
                          <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest pl-1">System Entry</span>
                          <input
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            placeholder="Initialize Title..."
                            className="w-full bg-transparent text-5xl font-semibold tracking-tight text-white outline-none border-none placeholder:text-white/5"
                          />
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                          <Tag size={14} className="text-white/20 mr-2" />
                          {tags.map(t => (
                            <span key={t} className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-full text-[10px] font-bold text-white/40 flex items-center gap-2 group">
                              #{t}
                              <button onClick={() => setTags(tags.filter(tag => tag !== t))} className="opacity-0 group-hover:opacity-100 transition-opacity">
                                <X size={12} />
                              </button>
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
                            placeholder="+ Add Metadata Tag..."
                            className="bg-transparent border-none outline-none text-[11px] font-medium text-white/20 focus:text-white/60 min-w-[150px]"
                          />
                        </div>

                        <textarea
                          value={content}
                          onChange={e => setContent(e.target.value)}
                          placeholder="Initialize thought sequence..."
                          className="w-full bg-transparent p-0 text-xl leading-relaxed text-white/70 outline-none border-none resize-none min-h-[500px] placeholder:text-white/5 font-sans"
                        />
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
              <div className="flex items-center justify-between mb-16 px-4">
                <div className="space-y-1">
                  <h3 className="text-3xl font-semibold text-white tracking-tight">Knowledge Vault</h3>
                  <p className="text-[13px] text-white/40 font-medium">Spaced Repetition Engine // {knowledgeCards.length} Units Active</p>
                </div>
                <button
                  onClick={() => setIsAddingCard(true)}
                  className="h-12 px-8 bg-white text-black rounded-full font-bold text-[13px] hover:scale-[1.05] active:scale-95 transition-all shadow-xl"
                >
                  Deploy New Unit
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 px-4">
                {knowledgeCards.map(card => (
                  <div key={card.id} className="bg-white/[0.03] border border-white/10 rounded-[32px] p-8 backdrop-blur-xl hover:bg-white/[0.05] transition-all group">
                    <KnowledgeCard card={card} />
                  </div>
                ))}
                {knowledgeCards.length === 0 && (
                  <div className="col-span-full py-32 border border-dashed border-white/10 rounded-[40px] flex flex-col items-center justify-center opacity-20">
                    <Brain size={64} strokeWidth={1} className="mb-6" />
                    <p className="text-xs font-bold tracking-[0.3em] uppercase">No Cognitive Units Detected</p>
                  </div>
                )}
              </div>
            </motion.div>
          ) : activeTab === 'decisions' ? (
            <motion.div key="decisions" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 p-12 overflow-y-auto no-scrollbar"><DecisionJournal /></motion.div>
          ) : activeTab === 'letters' ? (
            <motion.div key="letters" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 p-12 overflow-y-auto no-scrollbar"><FutureLetters /></motion.div>
          ) : activeTab === 'archives' ? (
            <motion.div
              key="archives"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex-1 p-12 overflow-y-auto no-scrollbar"
            >
              <div className="mb-16 px-4">
                <h3 className="text-3xl font-semibold text-white tracking-tight">Mission Archives</h3>
                <p className="text-[13px] text-white/40 font-medium">Boss Encounter Records // High Command Clearance Only</p>
              </div>
              <div className="space-y-4 px-4">
                {journalEntries.filter(e => e.isArchived).map(entry => (
                  <div key={entry.id} className="bg-white/[0.03] border border-white/10 rounded-[28px] p-8 flex items-center justify-between group hover:bg-white/[0.05] transition-all">
                    <div className="space-y-3">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center">
                          <History size={18} />
                        </div>
                        <span className="text-[11px] font-bold text-white/20 uppercase tracking-widest">{new Date(entry.date).toLocaleDateString()}</span>
                      </div>
                      <h4 className="text-xl font-semibold text-white">{entry.title}</h4>
                      <p className="text-[13px] text-white/40 max-w-xl italic leading-relaxed">{entry.content.substring(0, 150)}...</p>
                    </div>
                    <button className="h-14 w-14 rounded-full border border-white/10 flex items-center justify-center text-white/20 group-hover:text-white group-hover:bg-white group-hover:text-black transition-all">
                      <ArrowUpRight size={24} />
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div key="nexus" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 overflow-hidden"><GrowthTab /></motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Reflection Modal (Apple Sheet) */}
      <ModalPortal>
        <AnimatePresence>
          {showReflection && (
            <div className="fixed inset-0 z-[700] flex items-center justify-center p-6 bg-black/60 backdrop-blur-3xl">
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 40 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 40 }}
                className="w-full max-w-lg bg-white/[0.03] border border-white/10 rounded-[44px] p-12 relative shadow-2xl backdrop-blur-2xl"
              >
                <button onClick={() => setShowReflection(false)} className="absolute top-10 right-10 text-white/20 hover:text-white transition-all"><X size={24} /></button>
                <div className="text-center space-y-3 mb-12">
                  <div className="h-16 w-16 rounded-[24px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center mx-auto mb-6">
                    <Smile size={32} strokeWidth={1.5} />
                  </div>
                  <h3 className="text-3xl font-semibold text-white tracking-tight">System Recalibration</h3>
                  <p className="text-sm text-white/30 italic">Log your cognitive state for tactical analysis.</p>
                </div>

                <div className="space-y-10">
                  <div className="space-y-6">
                    <label className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em] block text-center">Mood Magnitude ({mood})</label>
                    <input type="range" min="1" max="10" value={mood} onChange={e => setMood(Number(e.target.value))} className="w-full accent-white h-1.5 rounded-full bg-white/5 appearance-none" />
                  </div>
                  <div className="space-y-6">
                    <label className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em] block text-center">Cognitive Intensity ({intensity})</label>
                    <input type="range" min="1" max="10" value={intensity} onChange={e => setIntensity(Number(e.target.value))} className="w-full accent-white h-1.5 rounded-full bg-white/5 appearance-none" />
                  </div>
                  <div className="space-y-4">
                    <label className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em] block text-center">Tactical Wins</label>
                    {gratitude.map((g, i) => (
                      <input
                        key={i}
                        value={g}
                        onChange={e => {
                          const newG = [...gratitude];
                          newG[i] = e.target.value;
                          setGratitude(newG);
                        }}
                        placeholder={`Objective Success #${i + 1}...`}
                        className="w-full bg-white/[0.04] border border-white/10 rounded-[20px] py-4 px-6 text-sm text-white placeholder:text-white/10 outline-none focus:border-white/30 transition-all"
                      />
                    ))}
                  </div>
                  <button onClick={handleMoodSubmit} className="w-full py-5 bg-white text-black rounded-[24px] font-bold shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all mt-4">
                    Commit Recalibration
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </ModalPortal>

      {/* Add Card Modal (Apple Sheet) */}
      <ModalPortal>
        <AnimatePresence>
          {isAddingCard && (
            <div className="fixed inset-0 z-[700] flex items-center justify-center p-6 bg-black/60 backdrop-blur-3xl">
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 40 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 40 }}
                className="w-full max-w-xl bg-white/[0.03] border border-white/10 rounded-[44px] p-12 relative shadow-2xl backdrop-blur-2xl"
              >
                <button onClick={() => setIsAddingCard(false)} className="absolute top-10 right-10 text-white/20 hover:text-white transition-all"><X size={24} /></button>
                <div className="text-center space-y-3 mb-10">
                  <div className="h-16 w-16 rounded-[24px] bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center mx-auto mb-6">
                    <Brain size={32} strokeWidth={1.5} />
                  </div>
                  <h3 className="text-3xl font-semibold text-white tracking-tight">Knowledge Unit</h3>
                  <p className="text-sm text-white/30 italic">Initialize a new cognitive shard in the vault.</p>
                </div>

                <form onSubmit={handleAddCard} className="space-y-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-white/20 uppercase tracking-widest pl-2">Unit Prompt</label>
                    <input value={cardQ} onChange={e => setCardQ(e.target.value)} placeholder="Tactical question..." className="w-full bg-white/[0.04] border border-white/10 rounded-[20px] py-4 px-6 text-white placeholder:text-white/10 outline-none focus:border-white/30 transition-all" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-white/20 uppercase tracking-widest pl-2">Unit Resolution</label>
                    <textarea value={cardA} onChange={e => setCardA(e.target.value)} placeholder="High-density answer..." className="w-full bg-white/[0.04] border border-white/10 rounded-[24px] py-4 px-6 text-white placeholder:text-white/10 outline-none focus:border-white/30 transition-all h-32 resize-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-white/20 uppercase tracking-widest pl-2">Taxonomy Class</label>
                    <select value={cardCat} onChange={e => setCardCat(e.target.value)} className="w-full bg-white/[0.04] border border-white/10 rounded-[20px] py-4 px-6 text-white outline-none focus:border-white/30 transition-all appearance-none">
                      <option value="philosophy">Philosophy</option>
                      <option value="code">Code</option>
                      <option value="finance">Finance</option>
                      <option value="vitality">Vitality</option>
                    </select>
                  </div>
                  <button type="submit" className="w-full py-5 bg-white text-black rounded-[24px] font-bold shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all">Commit to Vault</button>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </ModalPortal>
    </div>
  );
}

function NavTab({ active, onClick, label }: { active: boolean, onClick: () => void, label: string }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-28 py-2.5 rounded-[18px] text-[13px] font-medium tracking-tight transition-all relative z-10 flex items-center justify-center",
        active ? "text-black" : "text-white/40 hover:text-white/80"
      )}
    >
      {label}
    </button>
  );
}

function TabIndicator({ activeTab, tabs }: { activeTab: string, tabs: string[] }) {
  const index = tabs.indexOf(activeTab);
  return (
    <motion.div
      className="absolute bg-white rounded-[18px] shadow-lg"
      initial={false}
      animate={{ x: index * 112 + 6, width: 112, height: 38 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    />
  );
}

function ToolIcon({ icon, active = false, onClick }: { icon: React.ReactNode, active?: boolean, onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "h-10 w-10 flex items-center justify-center rounded-full transition-all",
        active ? "bg-white/10 text-white" : "text-white/20 hover:text-white hover:bg-white/5"
      )}
    >
      {icon}
    </button>
  );
}
