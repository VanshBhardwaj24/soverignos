import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Fingerprint, Loader2 } from 'lucide-react';
import { useSovereignStore } from '../../store/sovereign';

export const AuthOverlay = ({ children }: { children: React.ReactNode }) => {
  const { user, setUser } = useSovereignStore();
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [setUser]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-[#0a0a0a] z-[9999] flex items-center justify-center">
         <Loader2 size={32} className="animate-spin text-[var(--stat-code)] opacity-50" />
      </div>
    );
  }

  if (user) {
    return <>{children}</>;
  }

  return (
    <div className="fixed inset-0 bg-[#0a0a0a] z-[9999] flex items-center justify-center font-bold selection:bg-white/20">
      <div className="w-full max-w-sm p-8 border border-[var(--border-default)] bg-[var(--bg-card)] rounded-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--stat-code)] opacity-5 blur-3xl rounded-full" />
        
        <div className="flex flex-col items-center justify-center mb-8">
           <Fingerprint size={48} className="text-[var(--text-primary)] mb-4 opacity-80" />
           <h1 className="text-xl tracking-[0.2em] text-[var(--text-primary)] mb-1">SOVEREIGN</h1>
           <p className="text-[10px] text-[var(--text-muted)] tracking-widest">IDENTITY VERIFICATION</p>
        </div>

        <form onSubmit={handleAuth} className="flex flex-col gap-4 relative z-10">
           {error && <div className="text-[10px] text-[var(--danger)] bg-[var(--danger)]/10 border border-[var(--danger)]/20 p-3 rounded">{error}</div>}
           <input 
             type="email" 
             placeholder="IDENTITY (EMAIL)" 
             value={email} onChange={e=>setEmail(e.target.value)}
             className="w-full bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-3 rounded text-sm text-[var(--text-primary)] outline-none focus:border-[var(--stat-code)]"
           />
           <input 
             type="password" 
             placeholder="PASSPHRASE" 
             value={password} onChange={e=>setPassword(e.target.value)}
             className="w-full bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-3 rounded text-sm text-[var(--text-primary)] outline-none focus:border-[var(--stat-code)]"
           />
           
           <button type="submit" disabled={loading} className="w-full bg-white text-black font-bold tracking-widest text-xs py-3 rounded mt-2 hover:bg-gray-200 transition-colors disabled:opacity-50">
             {isLogin ? 'AUTHENTICATE' : 'INITIALIZE PROTOCOL'}
           </button>
           
           <button type="button" onClick={() => setIsLogin(!isLogin)} className="text-[10px] text-[var(--text-muted)] hover:text-[var(--text-primary)] tracking-widest uppercase mt-4">
             {isLogin ? 'Switch to Initialization' : 'Switch to Authentication'}
           </button>
        </form>
      </div>
    </div>
  );
}
