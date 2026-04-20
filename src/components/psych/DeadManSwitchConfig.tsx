import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, AlertTriangle, Clock, Check, Mail, User, Timer } from 'lucide-react';
import { usePsychStore } from '../../store/sovereign-psych';
import { cn } from '../../lib/utils';

export function DeadManSwitchConfig() {
  const { deadManConfig, configureDeadMan, checkInDeadMan } = usePsychStore();
  const [editing, setEditing] = useState(false);
  const [email, setEmail] = useState(deadManConfig.contactEmail);
  const [name, setName] = useState(deadManConfig.contactName);
  const [hours, setHours] = useState(deadManConfig.hoursBeforeTrigger);

  const hoursSinceCheckIn = deadManConfig.lastCheckIn
    ? (Date.now() - new Date(deadManConfig.lastCheckIn).getTime()) / 3600000
    : 0;

  const status: 'ok' | 'warn' | 'critical' = hoursSinceCheckIn > 36 ? 'critical' : hoursSinceCheckIn > 24 ? 'warn' : 'ok';

  const handleSave = () => {
    configureDeadMan({ contactEmail: email, contactName: name, hoursBeforeTrigger: hours });
    setEditing(false);
  };

  const handleEnable = () => {
    configureDeadMan({ enabled: !deadManConfig.enabled });
    if (!deadManConfig.enabled) checkInDeadMan();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className={cn(
            'h-12 w-12 rounded-2xl flex items-center justify-center',
            deadManConfig.enabled ? 'bg-green-500/10 text-green-400' : 'bg-white/5 text-white/20'
          )}>
            <Shield size={24} />
          </div>
          <div>
            <h3 className="font-mono text-[10px] tracking-[0.3em] text-white/30 uppercase font-black">Accountability Protocol</h3>
            <p className="font-mono text-xl font-light text-white">DEAD MAN'S SWITCH</p>
          </div>
        </div>

        <button
          onClick={handleEnable}
          className={cn(
            'relative h-8 w-16 rounded-full transition-all border',
            deadManConfig.enabled ? 'bg-green-500/20 border-green-500/40' : 'bg-white/5 border-white/10'
          )}
        >
          <div className={cn(
            'absolute top-1 h-6 w-6 rounded-full transition-all',
            deadManConfig.enabled ? 'left-9 bg-green-400' : 'left-1 bg-white/20'
          )} />
        </button>
      </div>

      <p className="font-mono text-[10px] text-white/25 leading-relaxed">
        If you go dark — no check-ins for {deadManConfig.hoursBeforeTrigger}h — SOVEREIGN alerts <strong className="text-white/40">{deadManConfig.contactName || 'your contact'}</strong>. 
        The last resort accountability system.
      </p>

      {/* Status */}
      {deadManConfig.enabled && (
        <div className={cn(
          'p-5 rounded-[24px] border flex items-center justify-between',
          status === 'ok' ? 'bg-green-500/5 border-green-500/20' :
          status === 'warn' ? 'bg-amber-500/5 border-amber-500/20' :
          'bg-red-500/5 border-red-500/20 animate-pulse'
        )}>
          <div className="flex items-center gap-3">
            {status === 'ok' ? <Check size={18} className="text-green-400" /> :
             status === 'warn' ? <AlertTriangle size={18} className="text-amber-400" /> :
             <AlertTriangle size={18} className="text-red-400" />}
            <div>
              <p className={cn(
                'font-mono text-[10px] font-black uppercase tracking-widest',
                status === 'ok' ? 'text-green-400' : status === 'warn' ? 'text-amber-400' : 'text-red-400'
              )}>
                {status === 'ok' ? 'Active — System Normal' :
                 status === 'warn' ? 'Warning — Check In Soon' :
                 'CRITICAL — Contact May Be Notified'}
              </p>
              <p className="font-mono text-[8px] text-white/20 mt-0.5">
                Last check-in: {deadManConfig.lastCheckIn
                  ? new Date(deadManConfig.lastCheckIn).toLocaleString('en-IN')
                  : 'Never'}
              </p>
            </div>
          </div>
          <button
            onClick={checkInDeadMan}
            className="px-5 py-2.5 bg-white text-black rounded-xl font-mono text-[9px] font-black tracking-widest uppercase hover:opacity-90 transition-all flex items-center gap-2"
          >
            <Clock size={12} /> CHECK IN
          </button>
        </div>
      )}

      {/* Config card */}
      <div className="p-6 bg-white/[0.02] border border-white/[0.06] rounded-[24px] space-y-4">
        <div className="flex items-center justify-between mb-4">
          <p className="font-mono text-[9px] text-white/30 uppercase tracking-widest">Contact Configuration</p>
          <button onClick={() => setEditing(!editing)} className="font-mono text-[9px] text-white/30 hover:text-white transition-colors uppercase">
            {editing ? 'Cancel' : 'Edit'}
          </button>
        </div>

        <AnimatePresence mode="wait">
          {editing ? (
            <motion.div key="edit" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
              <div>
                <label className="block font-mono text-[8px] text-white/20 uppercase tracking-widest mb-2">Contact Name</label>
                <div className="relative">
                  <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" />
                  <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Mom, Best Friend" className="w-full pl-9 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl font-mono text-sm text-white outline-none focus:border-[var(--stat-mind)]" />
                </div>
              </div>
              <div>
                <label className="block font-mono text-[8px] text-white/20 uppercase tracking-widest mb-2">Contact Email</label>
                <div className="relative">
                  <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" />
                  <input value={email} onChange={e => setEmail(e.target.value)} placeholder="contact@example.com" type="email" className="w-full pl-9 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl font-mono text-sm text-white outline-none focus:border-[var(--stat-mind)]" />
                </div>
              </div>
              <div>
                <label className="block font-mono text-[8px] text-white/20 uppercase tracking-widest mb-2">
                  Hours before trigger: {hours}h
                </label>
                <div className="relative">
                  <Timer size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" />
                  <input
                    type="range" min={12} max={96} step={12} value={hours}
                    onChange={e => setHours(Number(e.target.value))}
                    className="w-full mt-2 accent-[var(--stat-mind)]"
                  />
                  <div className="flex justify-between font-mono text-[7px] text-white/20 mt-1"><span>12h</span><span>96h</span></div>
                </div>
              </div>
              <button onClick={handleSave} className="w-full py-3 bg-white text-black font-mono font-black text-[9px] uppercase tracking-widest rounded-xl hover:opacity-90 transition-all flex items-center justify-center gap-2">
                <Check size={14} /> Save Configuration
              </button>
            </motion.div>
          ) : (
            <motion.div key="view" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
              {[
                { label: 'Contact', value: deadManConfig.contactName || '—' },
                { label: 'Email', value: deadManConfig.contactEmail || '—' },
                { label: 'Trigger after', value: `${deadManConfig.hoursBeforeTrigger}h` },
              ].map(row => (
                <div key={row.label} className="flex items-center justify-between">
                  <span className="font-mono text-[9px] text-white/20 uppercase tracking-widest">{row.label}</span>
                  <span className="font-mono text-[10px] text-white/60">{row.value}</span>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="p-4 bg-white/[0.01] border border-white/[0.04] rounded-2xl">
        <p className="font-mono text-[8px] text-white/15 leading-relaxed">
          <strong className="text-white/25">Email delivery:</strong> Requires Supabase Edge Function + Resend API. UI-only until configured.
          Check documentation for setup guide.
        </p>
      </div>
    </div>
  );
}
