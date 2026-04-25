import { User, Shield, LogOut, Bell, Eye, Database, Download, Upload, Paintbrush, Droplet } from 'lucide-react';
import { useSovereignStore } from '../store/sovereign';
import { useAppearance } from '../hooks/useAppearance';
import { DeadManSwitchConfig } from '../components/psych/DeadManSwitchConfig';

const ACCENT_COLORS = [
  { name: 'Silver', value: '#E5E5E5' },
  { name: 'Cobalt', value: '#3B82F6' },
  { name: 'Emerald', value: '#10B981' },
  { name: 'Amber', value: '#F59E0B' },
  { name: 'Rose', value: '#F43F5E' },
  { name: 'Violet', value: '#8B5CF6' }
];

const THEMES = [
  { id: 'daylight', name: 'Daylight', label: 'LIGHT', bg1: '#E2E8F0', bg2: '#F8FAFC' },
  { id: 'obsidian', name: 'Obsidian', label: 'DARK', bg1: '#0F0F10', bg2: '#1D1D20' },
  { id: 'ethereal', name: 'Ethereal', label: 'GLASS', bg1: '#1e293b', bg2: '#334155' },
  { id: 'deep-sea', name: 'Deep Sea', label: 'ABYSS', bg1: '#020617', bg2: '#0f172a' },
  { id: 'neon', name: 'Neon', label: 'CYBER', bg1: '#09090b', bg2: '#18181b' },
  { id: 'midnight', name: 'Midnight', label: 'GOLD', bg1: '#020205', bg2: '#08080c' },
] as const;

export default function Settings() {
  const { user, logout } = useSovereignStore();
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
        JSON.parse(content); // Type check
        localStorage.setItem('sovereign-storage', content);
        window.location.reload();
      } catch (err) {
        alert('Invalid backup file');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto pb-12">
      <div className="mb-12">
        <p className="eyebrow text-white/40 mb-2">System Preferences</p>
        <h1 className="h-display">Core Settings</h1>
      </div>

      <div className="space-y-8">
        {/* Profile Section */}
        <section className="surface-card overflow-hidden shadow-xl border-glow-professional">
          <div className="p-6 border-b border-white/5 flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-white/5 flex items-center justify-center text-white">
              <User size={24} />
            </div>
            <div>
              <h3 className="h-card text-white">Identity Module</h3>
              <p className="stat-label text-white/40">{user?.email || 'Unauthorized session'}</p>
            </div>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between py-2 border-b border-white/5">
              <div className="flex items-center gap-3">
                <Shield size={16} className="text-white/40" />
                <span className="stat-label text-white/60">Security Level</span>
              </div>
              <span className="stat-label px-2 py-1 rounded bg-white/5 border border-white/10 text-[var(--success)]">ENCRYPTED</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-white/5">
              <div className="flex items-center gap-3">
                <Database size={16} className="text-white/40" />
                <span className="stat-label text-white/60">Cloud Synchronization</span>
              </div>
              <span className="stat-label px-2 py-1 rounded bg-white/5 border border-white/10 text-[var(--success)]">ACTIVE</span>
            </div>
          </div>
        </section>

        {/* Preferences Section */}
        <section className="surface-card p-8 shadow-xl space-y-8 border-glow-professional">
          <div className="space-y-6">
            <div className="flex items-center gap-4 mb-4">
              <Eye size={20} className="text-white/40" />
              <div>
                <h4 className="h-card text-white">Immersion Theme</h4>
                <p className="stat-label text-white/40 italic">Select operational environment palette.</p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
              {THEMES.map(t => (
                <button
                  key={t.id}
                  onClick={() => setTheme(t.id as any)}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    theme === t.id 
                      ? 'border-[var(--accent-primary)] bg-[var(--accent-primary)]/5 shadow-[0_0_15px_var(--accent-primary)] shadow-opacity-20' 
                      : 'border-white/10 hover:border-white/30 bg-white/[0.02]'
                  }`}
                >
                  <div className="h-16 w-full rounded-xl mb-3 border border-white/10 overflow-hidden flex flex-col" style={{ backgroundColor: t.bg1 }}>
                    <div className="h-4 w-full bg-black/20" />
                    <div className="flex-1 flex p-1.5 gap-1.5">
                      <div className="w-1/3 rounded bg-white/10 shadow-sm" style={{ backgroundColor: t.bg2 }} />
                      <div className="w-2/3 rounded bg-white/10 shadow-sm" style={{ backgroundColor: t.bg2 }} />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-bold text-xs text-white">{t.name}</div>
                      <div className="text-[9px] font-black tracking-widest text-white/40">{t.label}</div>
                    </div>
                    {theme === t.id && (
                      <div className="h-4 w-4 rounded-full bg-[var(--accent-primary)] flex items-center justify-center">
                        <div className="h-1.5 w-1.5 rounded-full bg-black" />
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Bell size={20} className="text-white/40" />
              <div>
                <h4 className="h-card text-white">Neural Alerts</h4>
                <p className="stat-label text-white/40 italic">System-wide notifications for quest timers.</p>
              </div>
            </div>
            <div className="flex h-5 w-10 items-center rounded-full bg-white/5 p-1 cursor-pointer">
              <div className="h-3 w-3 rounded-full bg-white shadow-sm" />
            </div>
          </div>

          <div className="pt-8 border-t border-white/5 space-y-6">
            <div className="flex items-center gap-4 mb-4">
              <Paintbrush size={20} className="text-white/40" />
              <div>
                <h4 className="h-card text-white">Visual Preferences</h4>
                <p className="stat-label text-white/40 italic">Customize system accent color and glassmorphism.</p>
              </div>
            </div>

            <div className="space-y-4">
              <h5 className="eyebrow text-white/40">Accent Color</h5>
              <div className="flex gap-3">
                {ACCENT_COLORS.map(color => (
                  <button
                    key={color.name}
                    onClick={() => setAccentColor(color.value)}
                    className="h-8 w-8 rounded-full border-2 transition-all flex items-center justify-center"
                    style={{ 
                      backgroundColor: color.value,
                      borderColor: accentColor === color.value ? 'white' : 'transparent',
                      transform: accentColor === color.value ? 'scale(1.1)' : 'scale(1)',
                      opacity: accentColor === color.value ? 1 : 0.6
                    }}
                    title={color.name}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h5 className="eyebrow text-white/40">Glass Opacity: {Math.round(glassOpacity * 100)}%</h5>
              <div className="flex items-center gap-4">
                <Droplet size={16} className="text-white/40" />
                <input 
                  type="range" 
                  min="0.1" 
                  max="1" 
                  step="0.05"
                  value={glassOpacity}
                  onChange={(e) => setGlassOpacity(parseFloat(e.target.value))}
                  className="flex-1 accent-white"
                />
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-white/5 space-y-4">
            <h4 className="eyebrow text-white/20">Data Management</h4>
            <div className="flex gap-4">
              <button
                onClick={handleExport}
                className="btn-secondary flex-1 py-3"
              >
                <Download size={14} /> Export Backup
              </button>
              <label className="btn-secondary flex-1 py-3 cursor-pointer">
                <Upload size={14} /> Import Backup
                <input type="file" className="hidden" onChange={handleImport} accept=".json" />
              </label>
            </div>
          </div>
        </section>

        {/* Dead Man's Switch Section */}
        <section className="surface-card p-8 shadow-xl">
          <DeadManSwitchConfig />
        </section>

        {/* Danger Zone */}
        <section className="border border-[var(--danger)]/30 rounded-2xl p-8 bg-[var(--danger)]/[0.02] space-y-4">
          <div className="flex items-center gap-4 text-[var(--danger)]">
            <LogOut size={20} />
            <div>
              <h4 className="h-card">Terminate Protocol</h4>
              <p className="stat-label italic text-[var(--danger)]/70">Disconnect identity and clear neural cache.</p>
            </div>
          </div>
          <button
            onClick={() => logout()}
            className="w-full bg-[var(--danger)]/10 hover:bg-[var(--danger)]/20 border border-[var(--danger)]/30 text-[var(--danger)] stat-label py-4 italic"
          >
            Log Out from Hub
          </button>
        </section>
      </div>

      <div className="mt-12 text-center opacity-30 select-none">
        <span className="font-bold text-[9px] tracking-[0.5em] text-[var(--text-muted)] uppercase">Sovereign OS · v1.0.4-alpha</span>
      </div>
    </div>
  );
}
