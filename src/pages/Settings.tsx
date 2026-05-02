import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Shield, LogOut, Bell, Database, 
  Download, Upload, Paintbrush, Droplet, 
  ChevronRight, Lock, Key, Globe, Trash2, Check, ExternalLink,
  Mail, Info, Edit2, Save, X
} from 'lucide-react';
import { useSovereignStore } from '../store/sovereign';
import { useAppearance } from '../hooks/useAppearance';
import { DeadManSwitchConfig } from '../components/psych/DeadManSwitchConfig';
import { cn } from '../lib/utils';

const THEMES = [
  { id: 'daylight', name: 'Daylight', label: 'LIGHT', bg: 'bg-white', text: 'text-black', border: 'border-slate-200' },
  { id: 'obsidian', name: 'Obsidian', label: 'DARK', bg: 'bg-[#0F0F10]', text: 'text-white', border: 'border-white/10' },
  { id: 'ethereal', name: 'Ethereal', label: 'GLASS', bg: 'bg-slate-900/50', text: 'text-white', border: 'border-white/20' },
  { id: 'deep-sea', name: 'Deep Sea', label: 'ABYSS', bg: 'bg-[#020617]', text: 'text-blue-50', border: 'border-blue-900/30' },
  { id: 'neon', name: 'Neon', label: 'CYBER', bg: 'bg-black', text: 'text-green-400', border: 'border-green-900/30' },
  { id: 'midnight', name: 'Midnight', label: 'GOLD', bg: 'bg-[#020205]', text: 'text-amber-50', border: 'border-amber-900/20' },
] as const;

const ACCENT_COLORS = [
  { name: 'Silver', value: '#E5E5E5', class: 'bg-[#E5E5E5]' },
  { name: 'Azure', value: '#3B82F6', class: 'bg-[#3B82F6]' },
  { name: 'Emerald', value: '#10B981', class: 'bg-[#10B981]' },
  { name: 'Amber', value: '#F59E0B', class: 'bg-[#F59E0B]' },
  { name: 'Rose', value: '#F43F5E', class: 'bg-[#F43F5E]' },
  { name: 'Violet', value: '#8B5CF6', class: 'bg-[#8B5CF6]' }
];

type SettingSection = 'profile' | 'appearance' | 'security' | 'data' | 'about';

const EditableField = ({ label, value, onSave, multiline = false }: { label: string, value: string, onSave: (v: string) => void, multiline?: boolean }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [currentValue, setCurrentValue] = useState(value);

  const handleSave = () => {
    onSave(currentValue);
    setIsEditing(false);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-[10px] tracking-widest text-white/40 uppercase font-black">{label}</label>
        {isEditing ? (
          <div className="flex gap-2">
            <button onClick={() => { setIsEditing(false); setCurrentValue(value); }} className="text-white/40 hover:text-white transition-colors">
              <X size={14} />
            </button>
            <button onClick={handleSave} className="text-emerald-400 hover:text-emerald-300 transition-colors">
              <Save size={14} />
            </button>
          </div>
        ) : (
          <button onClick={() => setIsEditing(true)} className="text-white/20 hover:text-white transition-colors">
            <Edit2 size={12} />
          </button>
        )}
      </div>
      {isEditing ? (
        multiline ? (
          <textarea
            value={currentValue}
            onChange={(e) => setCurrentValue(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white focus:border-white/30 outline-none resize-none"
            rows={3}
          />
        ) : (
          <input
            type="text"
            value={currentValue}
            onChange={(e) => setCurrentValue(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white focus:border-white/30 outline-none"
          />
        )
      ) : (
        <div className="text-sm text-white bg-white/[0.02] border border-white/5 rounded-xl p-3">
          {value || <span className="text-white/20 italic">Not set</span>}
        </div>
      )}
    </div>
  );
};

export default function Settings() {
  const [activeSection, setActiveSection] = useState<SettingSection>('profile');
  const { logout, alias, username, bio, dailyGoalXP, updateProfile, setDailyGoalXP, resetOnboarding } = useSovereignStore();
  const { theme, setTheme, accentColor, setAccentColor, glassOpacity, setGlassOpacity } = useAppearance();

  const handleExport = () => {
    const data = localStorage.getItem('sovereign-storage');
    if (!data) return;
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sovereign_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      try {
        JSON.parse(content);
        localStorage.setItem('sovereign-storage', content);
        window.location.reload();
      } catch (err) {
        alert('Invalid backup file');
      }
    };
    reader.readAsText(file);
  };

  const sections: { id: SettingSection; label: string; icon: any }[] = [
    { id: 'profile', label: 'Identity', icon: User },
    { id: 'appearance', label: 'Appearance', icon: Paintbrush },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'data', label: 'Data', icon: Database },
    { id: 'about', label: 'About', icon: Info },
  ];

  return (
    <div className="max-w-[1200px] mx-auto py-12 px-6 min-h-screen">
      {/* Page Header */}
      <header className="mb-16">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 mb-4"
        >
          <div className="h-px w-12 bg-white/10" />
          <span className="text-[10px] font-black tracking-[0.4em] uppercase text-white/40">Configuration Panel</span>
        </motion.div>
        <h1 className="text-6xl font-black tracking-tighter text-white mb-4">SETTINGS</h1>
        <p className="text-white/40 text-lg font-medium max-w-xl">
          Calibrate your OS environment, identity parameters, and neural synchronization protocols.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-16">
        {/* Navigation Sidebar */}
        <aside className="space-y-2">
          {sections.map((s) => (
            <button
              key={s.id}
              onClick={() => setActiveSection(s.id)}
              className={cn(
                "w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 group relative overflow-hidden",
                activeSection === s.id 
                  ? "bg-white text-black shadow-[0_20px_40px_rgba(255,255,255,0.1)]" 
                  : "text-white/40 hover:text-white hover:bg-white/5"
              )}
            >
              {activeSection === s.id && (
                <motion.div 
                  layoutId="active-bg"
                  className="absolute inset-0 bg-white"
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                />
              )}
              <s.icon size={20} className="relative z-10" />
              <span className="text-sm font-bold tracking-tight relative z-10">{s.label}</span>
              <ChevronRight 
                size={16} 
                className={cn(
                  "ml-auto transition-transform duration-300 relative z-10",
                  activeSection === s.id ? "rotate-90" : "opacity-0 group-hover:opacity-100"
                )} 
              />
            </button>
          ))}

          <div className="pt-12 mt-12 border-t border-white/5">
            <button
              onClick={() => logout()}
              className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-rose-500 hover:bg-rose-500/10 transition-all duration-300 group"
            >
              <LogOut size={20} />
              <span className="text-sm font-bold tracking-tight">Terminate Session</span>
            </button>
          </div>
        </aside>

        {/* Content Area */}
        <main className="min-h-[600px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-12"
            >
              {activeSection === 'profile' && (
                <div className="space-y-12">
                  <SectionTitle title="Identity Module" subtitle="Manage your core identity and session parameters." />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <h3 className="text-lg font-bold text-white mb-6">Identity Parameters</h3>
                      <div className="space-y-4">
                        <EditableField label="Operational Alias" value={alias} onSave={(v) => updateProfile({ alias: v })} />
                        <EditableField label="System Username" value={username} onSave={(v) => updateProfile({ username: v })} />
                        <EditableField label="Operational Bio" value={bio} onSave={(v) => updateProfile({ bio: v })} multiline />
                      </div>
                    </Card>

                    <Card>
                      <h3 className="text-lg font-bold text-white mb-6">Daily Quota</h3>
                      <div className="flex items-center gap-6">
                        <span className="text-4xl font-bold text-white">{dailyGoalXP}</span>
                        <span className="text-sm text-white/40">XP / DAY</span>
                      </div>
                      <input
                        type="range" min="50" max="500" step="50"
                        value={dailyGoalXP}
                        onChange={e => setDailyGoalXP(parseInt(e.target.value))}
                        className="w-full mt-4 accent-white"
                      />
                      <div className="flex justify-between text-[10px] text-white/20 mt-2 uppercase tracking-widest">
                        <span>Cadet (50)</span>
                        <span>Elite (500)</span>
                      </div>
                    </Card>

                    <Card>
                      <h3 className="text-lg font-bold text-white mb-6">System Administration</h3>
                      <div className="space-y-4">
                        <button
                          onClick={async () => {
                            await resetOnboarding();
                            window.location.reload();
                          }}
                          className="w-full py-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-amber-400 text-xs font-black tracking-widest uppercase hover:bg-amber-500 hover:text-white transition-all"
                        >
                          Re-run Onboarding Sequence
                        </button>
                      </div>
                    </Card>

                    <Card>
                      <h3 className="text-lg font-bold text-white mb-6">Synchronization</h3>
                      <div className="space-y-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Database size={18} className="text-white/40" />
                            <span className="text-sm font-medium text-white/70">Cloud Backup</span>
                          </div>
                          <Toggle active={true} />
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Bell size={18} className="text-white/40" />
                            <span className="text-sm font-medium text-white/70">Neural Alerts</span>
                          </div>
                          <Toggle active={true} />
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Globe size={18} className="text-white/40" />
                            <span className="text-sm font-medium text-white/70">Auto-Geolocation</span>
                          </div>
                          <Toggle active={false} />
                        </div>
                      </div>
                    </Card>
                  </div>
                </div>
              )}

              {activeSection === 'appearance' && (
                <div className="space-y-12">
                  <SectionTitle title="Visual Environment" subtitle="Calibrate the interface aesthetics and ocular parameters." />
                  
                  <Card>
                    <h3 className="text-lg font-bold text-white mb-8">Immersion Theme</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                      {THEMES.map((t) => (
                        <button
                          key={t.id}
                          onClick={() => setTheme(t.id as any)}
                          className={cn(
                            "group flex flex-col p-4 rounded-2xl border transition-all duration-500",
                            theme === t.id 
                              ? "bg-white/10 border-white/20 shadow-[0_0_30px_rgba(255,255,255,0.05)]" 
                              : "bg-white/[0.02] border-white/5 hover:border-white/10"
                          )}
                        >
                          <div className={cn("aspect-video w-full rounded-xl mb-4 border shadow-2xl relative overflow-hidden", t.bg, t.border)}>
                             <div className="absolute top-2 left-2 right-2 h-2 bg-black/10 rounded" />
                             <div className="absolute top-6 left-2 w-1/3 bottom-2 bg-black/5 rounded" />
                             <div className="absolute top-6 right-2 w-1/2 bottom-2 bg-black/5 rounded" />
                             {theme === t.id && (
                               <motion.div 
                                 layoutId="active-theme" 
                                 className="absolute inset-0 border-2 border-white/40 rounded-xl z-20" 
                               />
                             )}
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="text-left">
                              <p className="text-sm font-bold text-white">{t.name}</p>
                              <p className="text-[10px] font-black tracking-widest text-white/30 uppercase">{t.label}</p>
                            </div>
                            {theme === t.id && (
                              <div className="h-5 w-5 rounded-full bg-white flex items-center justify-center">
                                <Check size={12} className="text-black" />
                              </div>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  </Card>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <h3 className="text-lg font-bold text-white mb-8">Accent Chromatics</h3>
                      <div className="grid grid-cols-6 gap-4">
                        {ACCENT_COLORS.map((color) => (
                          <button
                            key={color.name}
                            onClick={() => setAccentColor(color.value)}
                            className={cn(
                              "h-10 w-10 rounded-full border-2 transition-all hover:scale-110 relative",
                              accentColor === color.value ? "border-white scale-110 shadow-lg" : "border-transparent opacity-60 hover:opacity-100"
                            )}
                            style={{ backgroundColor: color.value }}
                            title={color.name}
                          >
                            {accentColor === color.value && (
                              <motion.div layoutId="active-accent" className="absolute -inset-2 border border-white/20 rounded-full" />
                            )}
                          </button>
                        ))}
                      </div>
                    </Card>

                    <Card>
                      <div className="flex items-center justify-between mb-8">
                        <h3 className="text-lg font-bold text-white">Glass Dynamics</h3>
                        <span className="text-sm font-mono text-white/40">{Math.round(glassOpacity * 100)}%</span>
                      </div>
                      <div className="flex items-center gap-6">
                        <Droplet size={20} className="text-white/20" />
                        <input
                          type="range"
                          min="0.1"
                          max="1"
                          step="0.01"
                          value={glassOpacity}
                          onChange={(e) => setGlassOpacity(parseFloat(e.target.value))}
                          className="flex-1 accent-white h-1.5 bg-white/10 rounded-full cursor-pointer appearance-none"
                        />
                      </div>
                      <p className="mt-6 text-[10px] text-white/20 uppercase tracking-[0.2em] font-bold">Adjust transparency for translucent interface modules.</p>
                    </Card>
                  </div>
                </div>
              )}

              {activeSection === 'security' && (
                <div className="space-y-12">
                  <SectionTitle title="Security Protocols" subtitle="Reinforce system defenses and fail-safe mechanisms." />
                  
                  <Card className="bg-rose-500/[0.02] border-rose-500/10">
                    <DeadManSwitchConfig />
                  </Card>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <div className="flex items-center gap-3 mb-6">
                        <Lock size={18} className="text-blue-400" />
                        <h3 className="text-lg font-bold text-white">Advanced Protection</h3>
                      </div>
                      <p className="text-white/40 text-sm mb-8 leading-relaxed">
                        Enable biometric verification for high-value transactions and protocol modifications.
                      </p>
                      <div className="flex items-center justify-between p-4 bg-white/[0.03] border border-white/5 rounded-2xl">
                        <span className="text-sm font-bold text-white/70">Biometric Authentication</span>
                        <Toggle active={false} />
                      </div>
                    </Card>

                    <Card>
                      <div className="flex items-center gap-3 mb-6">
                        <Key size={18} className="text-amber-400" />
                        <h3 className="text-lg font-bold text-white">API Access</h3>
                      </div>
                      <p className="text-white/40 text-sm mb-8 leading-relaxed">
                        Generate access tokens for external integrations and automated data harvesting.
                      </p>
                      <button className="w-full py-4 bg-white/5 border border-white/10 rounded-2xl text-white text-xs font-black tracking-widest uppercase hover:bg-white/10 transition-all">
                        Generate Token
                      </button>
                    </Card>
                  </div>
                </div>
              )}

              {activeSection === 'data' && (
                <div className="space-y-12">
                  <SectionTitle title="Data Core" subtitle="Archive, restore, and audit your behavioral data streams." />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <div className="flex items-center gap-3 mb-6">
                        <Download size={18} className="text-emerald-400" />
                        <h3 className="text-lg font-bold text-white">System Export</h3>
                      </div>
                      <p className="text-white/40 text-sm mb-8 leading-relaxed">
                        Generate a complete cryptographic backup of your Sovereign OS instance.
                      </p>
                      <button 
                        onClick={handleExport}
                        className="w-full py-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-400 text-xs font-black tracking-widest uppercase hover:bg-emerald-500 hover:text-white transition-all"
                      >
                        Initiate Export
                      </button>
                    </Card>

                    <Card>
                      <div className="flex items-center gap-3 mb-6">
                        <Upload size={18} className="text-blue-400" />
                        <h3 className="text-lg font-bold text-white">Protocol Injection</h3>
                      </div>
                      <p className="text-white/40 text-sm mb-8 leading-relaxed">
                        Restore your system state from a previous backup file (.json).
                      </p>
                      <label className="block w-full py-4 bg-blue-500/10 border border-blue-500/20 rounded-2xl text-blue-400 text-xs font-black tracking-widest uppercase hover:bg-blue-500 hover:text-white text-center cursor-pointer transition-all">
                        Select File
                        <input type="file" className="hidden" onChange={handleImport} accept=".json" />
                      </label>
                    </Card>
                  </div>

                  <Card className="border-rose-500/20 bg-rose-500/[0.01]">
                    <div className="flex items-center gap-3 mb-6">
                      <Trash2 size={18} className="text-rose-500" />
                      <h3 className="text-lg font-bold text-white">Nuclear Option</h3>
                    </div>
                    <p className="text-white/40 text-sm mb-8 leading-relaxed">
                      This will permanently wipe all local and cloud data associated with your entity. This action is irreversible.
                    </p>
                    <button className="px-8 py-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-500 text-xs font-black tracking-widest uppercase hover:bg-rose-500 hover:text-white transition-all">
                      Factory Reset Engine
                    </button>
                  </Card>
                </div>
              )}

              {activeSection === 'about' && (
                <div className="space-y-12">
                  <SectionTitle title="System Intel" subtitle="Version parameters and developer transmission channels." />
                  
                  <Card className="flex flex-col items-center text-center py-16">
                    <div className="h-24 w-24 bg-white text-black rounded-3xl flex items-center justify-center mb-8 shadow-[0_0_50px_rgba(255,255,255,0.2)]">
                      <span className="text-5xl font-black italic">S</span>
                    </div>
                    <h2 className="text-3xl font-black tracking-tighter mb-2 text-white">SOVEREIGN OS</h2>
                    <p className="text-white/40 text-sm font-mono tracking-widest mb-12 uppercase">v1.0.4-alpha // BUILD_BETA_R2</p>
                    
                    <div className="flex gap-6">
                      <SocialLink icon={Globe} href="https://github.com" />
                      <SocialLink icon={Mail} href="mailto:support@sovereignos.ai" />
                      <SocialLink icon={Info} href="#" />
                    </div>
                  </Card>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <h3 className="text-lg font-bold text-white mb-6">Documentation</h3>
                      <p className="text-white/40 text-sm mb-8 leading-relaxed">
                        Access the operational manual for Sovereign OS protocols and behavioral design.
                      </p>
                      <button className="flex items-center gap-2 text-white text-xs font-bold hover:text-blue-400 transition-colors">
                        Read System Manual <ExternalLink size={12} />
                      </button>
                    </Card>
                    <Card>
                      <h3 className="text-lg font-bold text-white mb-6">Feedback Channel</h3>
                      <p className="text-white/40 text-sm mb-8 leading-relaxed">
                        Report anomalies or suggest protocol enhancements to the central intelligence.
                      </p>
                      <button className="flex items-center gap-2 text-white text-xs font-bold hover:text-blue-400 transition-colors">
                        Submit Transmission <ExternalLink size={12} />
                      </button>
                    </Card>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      <footer className="mt-32 pt-12 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6 opacity-30 select-none">
        <p className="text-[10px] font-bold tracking-[0.4em] text-white uppercase">Operational Success Through Total Discipline</p>
        <p className="text-[10px] font-mono text-white">© 2026 SOVEREIGN_PROTOCOLS_INTEL</p>
      </footer>
    </div>
  );
}

function SectionTitle({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="mb-10">
      <h2 className="text-4xl font-bold tracking-tight text-white mb-3 italic">{title}</h2>
      <p className="text-white/40 text-base font-medium">{subtitle}</p>
    </div>
  );
}

function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("surface-card p-8 bg-white/[0.03] border-white/5 rounded-[32px] shadow-2xl relative overflow-hidden group", className)}>
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
      <div className="relative z-10">{children}</div>
    </div>
  );
}


function Toggle({ active }: { active: boolean }) {
  return (
    <div className={cn(
      "h-6 w-11 rounded-full p-1 transition-all duration-300 cursor-pointer flex items-center",
      active ? "bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.4)]" : "bg-white/10"
    )}>
      <motion.div 
        animate={{ x: active ? 20 : 0 }}
        className="h-4 w-4 rounded-full bg-white shadow-sm" 
      />
    </div>
  );
}

function SocialLink({ icon: Icon, href }: { icon: any; href: string }) {
  return (
    <a 
      href={href} 
      target="_blank" 
      rel="noopener noreferrer"
      className="h-12 w-12 rounded-2xl bg-white/5 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 hover:scale-110 transition-all duration-300"
    >
      <Icon size={20} />
    </a>
  );
}
