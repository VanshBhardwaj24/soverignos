import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Sparkles, Loader2, ArrowLeft } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface MagicLinkFormProps {
  onBack: () => void;
  setError: (msg: string) => void;
}

export const MagicLinkForm = ({ onBack, setError }: MagicLinkFormProps) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: window.location.origin,
        },
      });
      if (error) throw error;
      setSent(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto">
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-xs text-[var(--text-muted)] hover:text-white transition-colors mb-8 uppercase tracking-widest"
      >
        <ArrowLeft size={14} />
        Back to Credentials
      </button>

      <div className="mb-8">
        <h3 className="text-2xl font-bold text-white mb-2">Magic Link</h3>
        <p className="text-sm text-[var(--text-muted)] font-medium">
          Receive a one-time secure link to access your identity.
        </p>
      </div>

      {!sent ? (
        <form onSubmit={handleMagicLink} className="space-y-4">
          <div className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-[var(--stat-code)] transition-colors">
              <Mail size={18} />
            </div>
            <input
              type="email"
              placeholder="IDENTITY (EMAIL)"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-white/[0.03] border border-white/10 rounded-xl py-3.5 pl-12 pr-4 text-sm text-white placeholder:text-[var(--text-muted)] outline-none focus:border-[var(--stat-code)]/50 focus:bg-white/[0.05] transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-white text-black font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 hover:bg-gray-200 transition-all disabled:opacity-50 mt-6"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <>
                <Sparkles size={18} />
                <span>SEND MAGIC LINK</span>
              </>
            )}
          </button>
        </form>
      ) : (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-6 rounded-2xl bg-[var(--stat-code)]/10 border border-[var(--stat-code)]/20 text-center"
        >
          <div className="w-12 h-12 bg-[var(--stat-code)]/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="text-[var(--stat-code)]" size={24} />
          </div>
          <h4 className="text-white font-bold mb-2">Check your Identity Mail</h4>
          <p className="text-xs text-[var(--text-muted)] leading-relaxed">
            We've sent a secure access link to <span className="text-white font-medium">{email}</span>. Use it to bypass credentials.
          </p>
          <button 
            onClick={() => setSent(false)}
            className="mt-6 text-[10px] text-[var(--stat-code)] hover:underline uppercase tracking-[0.2em]"
          >
            Resend Link
          </button>
        </motion.div>
      )}
    </div>
  );
};
