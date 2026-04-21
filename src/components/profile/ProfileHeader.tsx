import { useState, useMemo } from 'react';
import { useSovereignStore } from '../../store/sovereign';
import { computeSovereigntyLevel, getSovereigntyRank } from '../../lib/constants';
import { Check, ShieldCheck, Calendar, Zap, Globe } from 'lucide-react';
import { toast } from 'sonner';

export const ProfileHeader = () => {
  const {
    user, alias, username, joinedAt, obituaryTest,
    statXP, globalStreak, integrity, delusionHistory,
    activityLog, dailyQuests, freedomRoadmap,
    updateProfile
  } = useSovereignStore();

  const [isEditingInfo, setIsEditingInfo] = useState(false);
  const [tempAlias, setTempAlias] = useState(alias);
  const [tempUsername, setTempUsername] = useState(username);

  // Derived Metrics
  const totalXP = useMemo(() => Object.values(statXP).reduce((a, b) => a + b, 0), [statXP]);
  const sovereigntyLevel = useMemo(() => computeSovereigntyLevel(totalXP), [totalXP]);
  const rank = useMemo(() => getSovereigntyRank(sovereigntyLevel), [sovereigntyLevel]);

  const joinedDate = new Date(joinedAt || user?.created_at || new Date());
  const daysMember = Math.max(0, Math.floor((new Date().getTime() - joinedDate.getTime()) / (1000 * 60 * 60 * 24)));

  const missionSuccess = useMemo(() => {
    const total = dailyQuests.length;
    if (total === 0) return 100;
    const completed = dailyQuests.filter(q => q.completed).length;
    return Math.floor((completed / total) * 100);
  }, [dailyQuests]);

  const freedomProgress = useMemo(() => {
    const total = freedomRoadmap.length;
    if (total === 0) return 0;
    const unlocked = freedomRoadmap.filter(m => m.isUnlocked).length;
    return Math.floor((unlocked / total) * 100);
  }, [freedomRoadmap]);

  const delusionGap = useMemo(() => {
    if (delusionHistory.length === 0) return -2.1; // Default/Mock value
    const latest = delusionHistory[delusionHistory.length - 1];
    return (latest.actualRating - latest.perceivedRating).toFixed(1);
  }, [delusionHistory]);

  const momentum = useMemo(() => {
    // Simplified momentum: log count in last 7 days vs previous 7 days
    const now = new Date().getTime();
    const week = 7 * 24 * 60 * 60 * 1000;
    const currentWeekLogs = activityLog.filter(l => now - new Date(l.timestamp).getTime() < week).length;
    const prevWeekLogs = activityLog.filter(l => {
      const diff = now - new Date(l.timestamp).getTime();
      return diff >= week && diff < 2 * week;
    }).length;

    if (prevWeekLogs === 0) return currentWeekLogs > 0 ? '+100%' : '0%';
    const change = ((currentWeekLogs - prevWeekLogs) / prevWeekLogs) * 100;
    return `${change > 0 ? '+' : ''}${change.toFixed(0)}%`;
  }, [activityLog]);

  const handleSaveInfo = async () => {
    try {
      await updateProfile({ alias: tempAlias, username: tempUsername });
      setIsEditingInfo(false);
      toast.success('PROFILE UPDATED', {
        description: 'Profile updates persisted to cloud archives.'
      });
    } catch (error) {
      toast.error('SYNC_FAILURE', {
        description: 'Failed to update remote profile records.'
      });
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Top Profile Card (Redesigned based on reference image) */}
      <div className="bg-white/[0.02] border border-white/5 rounded-[32px] p-8 md:p-12 relative overflow-hidden backdrop-blur-3xl shadow-2xl">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-white/[0.02] to-transparent pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row gap-12 items-center">
          {/* Avatar Area */}
          <div className="relative group">
            <div className="w-32 h-32 rounded-full bg-blue-600 flex items-center justify-center text-5xl font-black text-white relative shadow-[0_0_40px_rgba(37,99,235,0.4)]">
              {alias.charAt(0).toUpperCase()}
              <div className="absolute bottom-1 right-1 w-8 h-8 rounded-full bg-blue-500 border-4 border-black flex items-center justify-center">
                <Check size={14} strokeWidth={4} className="text-white" />
              </div>
            </div>
            <button className="mt-4 w-full py-2 rounded-xl bg-white/5 border border-white/10 text-[10px] font-mono font-black tracking-widest text-white/40 hover:bg-white/10 transition-all uppercase">
              Choose Photo
            </button>
            <p className="mt-2 text-[8px] font-mono text-white/20 text-center uppercase tracking-tighter">Recommended: Square image, max 2MB</p>
          </div>

          {/* User Info & Stats Row */}
          <div className="flex-1 space-y-10">
            <div className="space-y-1">
              <h1 className="text-5xl font-black text-white italic uppercase tracking-tighter flex items-center gap-4">
                {alias}
              </h1>
              <div className="flex gap-4 text-[10px] font-mono text-white/40 uppercase tracking-widest">
                <span>@{username || 'agent'}</span>
                <span>•</span>
                <span>{user?.email || 'OFFLINE'}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-white/20 mb-2">
                  <Calendar size={14} />
                  <span className="font-mono text-[9px] font-black tracking-widest">MEMBER FOR</span>
                </div>
                <div className="text-xl font-black text-white uppercase italic">{daysMember} Days</div>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-white/20 mb-2">
                  <Zap size={14} />
                  <span className="font-mono text-[9px] font-black tracking-widest uppercase">Sovereignty</span>
                </div>
                <div className="text-xl font-black text-white uppercase italic">LVL {sovereigntyLevel} {rank.name}</div>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-white/20 mb-2">
                  <Globe size={14} />
                  <span className="font-mono text-[9px] font-black tracking-widest uppercase">Streak</span>
                </div>
                <div className="text-xl font-black text-white uppercase italic">{globalStreak.current} Days</div>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-white/20 mb-2">
                  <ShieldCheck size={14} />
                  <span className="font-mono text-[9px] font-black tracking-widest uppercase">Integrity</span>
                </div>
                <div className="text-xl font-black text-white uppercase italic">{integrity}% Score</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Numerical Stat Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'PROTOCOL MOMENTUM', val: momentum, color: 'text-emerald-400', icon: '⚡' },
          { label: 'DELUSION GAP', val: `${Number(delusionGap) > 0 ? '+' : ''}${delusionGap}`, color: 'text-red-400', icon: '⚠️' },
          { label: 'MISSION SUCCESS', val: `${missionSuccess}%`, color: 'text-blue-400', icon: '🎯' },
          { label: 'FREEDOM PROGRESS', val: `${freedomProgress}%`, color: 'text-yellow-400', icon: '🔓' }
        ].map((s, i) => (
          <div key={i} className="bg-white/[0.02] border border-white/5 p-8 rounded-[24px] space-y-4 hover:bg-white/[0.04] transition-all group">
            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-lg grayscale group-hover:grayscale-0 transition-all">
              {s.icon}
            </div>
            <div className="space-y-1">
              <span className="block font-mono text-[9px] text-white/40 uppercase tracking-widest font-black leading-none">{s.label}</span>
              <div className="text-4xl font-black text-white italic tracking-tighter">{s.val}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Obituary Test Section (As requested) */}
      <div className="bg-white/[0.02] border border-white/5 rounded-[32px] p-10 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-2 h-full bg-red-500/20" />
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ShieldCheck className="text-red-500/40" size={20} />
              <h2 className="font-mono text-xs font-black tracking-[0.4em] text-white uppercase">The Obituary Test</h2>
            </div>
            <span className="font-mono text-[8px] text-white/20 uppercase tracking-widest">Uneditable after initialization</span>
          </div>

          <p className="text-2xl font-black text-white/80 uppercase italic leading-tight tracking-tighter max-w-4xl opacity-60">
            {obituaryTest || '"If I never took a risk: a mid-level developer at a services company, grinding the same features for clients I\'ll never meet, taking the metro to an office someone else owns, saving slowly toward a life that feels like a delayed version of my parents\' life. Safe. Predictable. Not mine."'}
          </p>

          <div className="pt-4 flex items-center gap-4">
            <div className="px-4 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
              <span className="font-mono text-[9px] text-red-500 uppercase tracking-widest font-black uppercase">Default Life Protocol</span>
            </div>
          </div>
        </div>
      </div>

      {/* General Information Section */}
      <div className="space-y-6">
        <div className="flex items-center gap-3 text-emerald-400">
          <Zap size={14} fill="currentColor" />
          <h3 className="font-mono text-xs font-black tracking-widest uppercase">General Information</h3>
        </div>

        <div className="bg-white/[0.02] border border-white/5 rounded-[24px] overflow-hidden">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.01]">
                <th className="px-6 py-4 text-left font-mono text-[9px] text-white/20 uppercase tracking-[0.2em] font-black border-r border-white/5">Property</th>
                <th className="px-6 py-4 text-left font-mono text-[9px] text-white/20 uppercase tracking-[0.2em] font-black">Authentication Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              <tr>
                <td className="px-6 py-5 font-mono text-[10px] text-white/40 uppercase font-bold border-r border-white/5 bg-white/[0.01]">Display Name</td>
                <td className="px-6 py-5">
                  {isEditingInfo ? (
                    <input
                      value={tempAlias}
                      onChange={(e) => setTempAlias(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white font-bold focus:border-white/20 focus:outline-none transition-all"
                    />
                  ) : (
                    <span className="text-white font-bold">{alias}</span>
                  )}
                </td>
              </tr>
              <tr>
                <td className="px-6 py-5 font-mono text-[10px] text-white/40 uppercase font-bold border-r border-white/5 bg-white/[0.01]">Username</td>
                <td className="px-6 py-5">
                  {isEditingInfo ? (
                    <div className="flex items-center gap-2">
                      <span className="text-white/20 font-mono">@</span>
                      <input
                        value={tempUsername}
                        onChange={(e) => setTempUsername(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white font-bold focus:border-white/20 focus:outline-none transition-all"
                      />
                    </div>
                  ) : (
                    <span className="text-white font-bold">@{username}</span>
                  )}
                </td>
              </tr>
              <tr>
                <td className="px-6 py-5 font-mono text-[10px] text-white/40 uppercase font-bold border-r border-white/5 bg-white/[0.01]">Email Protocol</td>
                <td className="px-6 py-5 text-white/40 italic font-mono text-[10px]">{user?.email}</td>
              </tr>
              <tr>
                <td className="px-6 py-5 font-mono text-[10px] text-white/40 uppercase font-bold border-r border-white/5 bg-white/[0.01]">Status</td>
                <td className="px-6 py-5">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                    <span className="font-mono text-[9px] text-emerald-500 uppercase font-black">Authorized</span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="flex gap-4">
          {!isEditingInfo ? (
            <button
              onClick={() => setIsEditingInfo(true)}
              className="px-8 py-3 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-xl font-black text-[10px] tracking-widest uppercase transition-all"
            >
              Modify Identity
            </button>
          ) : (
            <>
              <button onClick={handleSaveInfo} className="px-8 py-3 bg-white text-black rounded-xl font-black text-[10px] tracking-widest uppercase hover:scale-105 active:scale-95 transition-all shadow-xl">
                Encrypt & Save
              </button>
              <button onClick={() => setIsEditingInfo(false)} className="px-8 py-3 bg-white/5 text-white/40 rounded-xl font-black text-[10px] tracking-widest uppercase hover:text-white transition-all">
                Discard
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
