import { useSovereignStore } from '../store/sovereign';
import { User, Shield, LogOut, Bell, Eye, Database, Download, Upload, Flame } from 'lucide-react';

export default function Settings() {
  const { user, logout, theme, setTheme } = useSovereignStore();

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
        <h1 className="font-mono text-[11px] tracking-[0.2em] text-[var(--text-secondary)] opacity-80 uppercase mb-2">SYSTEM PREFERENCES</h1>
        <h2 className="font-mono text-4xl font-light tracking-tight text-[var(--text-primary)]">CORE SETTINGS</h2>
      </div>

      <div className="space-y-8">
        {/* Profile Section */}
        <section className="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-2xl overflow-hidden shadow-xl">
          <div className="p-6 border-b border-[var(--border-default)] flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-[var(--text-primary)]/10 flex items-center justify-center text-[var(--text-primary)]">
              <User size={24} />
            </div>
            <div>
              <h3 className="font-mono text-sm tracking-widest text-[var(--text-primary)] uppercase">Identity Module</h3>
              <p className="text-xs text-[var(--text-muted)] font-mono">{user?.email || 'Unauthorized session'}</p>
            </div>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between py-2 border-b border-[var(--border-subtle)]/50">
              <div className="flex items-center gap-3">
                <Shield size={16} className="text-[var(--text-secondary)]" />
                <span className="text-sm text-[var(--text-secondary)]">Security Level</span>
              </div>
              <span className="font-mono text-[10px] px-2 py-1 rounded bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[var(--success)]">ENCRYPTED</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-[var(--border-subtle)]/50">
              <div className="flex items-center gap-3">
                <Database size={16} className="text-[var(--text-secondary)]" />
                <span className="text-sm text-[var(--text-secondary)]">Cloud Synchronization</span>
              </div>
              <span className="font-mono text-[10px] px-2 py-1 rounded bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[var(--success)]">ACTIVE</span>
            </div>
          </div>
        </section>

        {/* Preferences Section */}
        <section className="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-2xl p-8 shadow-xl space-y-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Eye size={20} className="text-[var(--text-secondary)]" />
              <div>
                <h4 className="text-sm font-bold text-[var(--text-primary)]">Immersion Theme</h4>
                <p className="text-xs text-[var(--text-muted)]">Select operational environment palette.</p>
              </div>
            </div>
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="px-4 py-2 bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-lg font-mono text-[10px] tracking-widest uppercase hover:text-[var(--text-primary)] transition-colors"
            >
              {theme} mode
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Bell size={20} className="text-[var(--text-secondary)]" />
              <div>
                <h4 className="text-sm font-bold text-[var(--text-primary)]">Neural Alerts</h4>
                <p className="text-xs text-[var(--text-muted)]">System-wide notifications for quest timers.</p>
              </div>
            </div>
            <div className="flex h-5 w-10 items-center rounded-full bg-[var(--bg-elevated)] p-1 cursor-pointer">
              <div className="h-3 w-3 rounded-full bg-[var(--text-primary)] shadow-sm" />
            </div>
          </div>

          <div className="pt-8 border-t border-[var(--border-subtle)]/50 space-y-4">
            <h4 className="font-mono text-[10px] tracking-widest text-[var(--text-muted)] uppercase">Data Management</h4>
            <div className="flex gap-4">
              <button
                onClick={handleExport}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-xl font-mono text-[10px] tracking-widest uppercase hover:text-[var(--text-primary)] transition-colors"
              >
                <Download size={14} /> Export Backup
              </button>
              <label className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-xl font-mono text-[10px] tracking-widest uppercase hover:text-[var(--text-primary)] transition-colors cursor-pointer">
                <Upload size={14} /> Import Backup
                <input type="file" className="hidden" onChange={handleImport} accept=".json" />
              </label>
            </div>
          </div>
        </section>

        {/* Danger Zone */}
        <section className="border border-[var(--danger)]/30 rounded-2xl p-8 bg-[var(--danger)]/[0.02] space-y-4">
          <div className="flex items-center gap-4 text-[var(--danger)]">
            <LogOut size={20} />
            <div>
              <h4 className="text-sm font-bold">TERMINATE PROTOCOL</h4>
              <p className="text-xs text-[var(--danger)]/70">Disconnect identity and clear neural cache.</p>
            </div>
          </div>
          <button
            onClick={() => logout()}
            className="w-full bg-[var(--danger)]/10 hover:bg-[var(--danger)]/20 border border-[var(--danger)]/30 text-[var(--danger)] font-mono text-xs tracking-[0.2em] py-4 rounded-xl transition-all uppercase font-bold"
          >
            Log Out from Hub
          </button>
        </section>
      </div>

      <div className="mt-12 text-center opacity-30 select-none">
        <span className="font-mono text-[9px] tracking-[0.5em] text-[var(--text-muted)] uppercase">Sovereign OS · v1.0.4-alpha</span>
      </div>
    </div>
  );
}
