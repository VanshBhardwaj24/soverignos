import { useState } from 'react';
import { useAppearance } from '../../hooks/useAppearance';
import { Mail, Lock, Eye, EyeOff, Award, Loader2, Sun, Moon } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { ForgotPasswordModal } from './ForgotPasswordModal';

interface LoginFormProps {
  isLogin: boolean;
  setIsLogin: (val: boolean) => void;
  onSuccess: () => void;
  setError: (msg: string) => void;
  lockoutUntil: number | null;
}

export const LoginForm = ({ isLogin, setIsLogin, onSuccess, setError, lockoutUntil }: LoginFormProps) => {
  const { theme, setTheme } = useAppearance();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);

  const isDarkMode = theme !== 'daylight';

  const toggleTheme = () => {
    setTheme(isDarkMode ? 'daylight' : 'obsidian');
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (lockoutUntil && Date.now() < lockoutUntil) {
      const remaining = Math.ceil((lockoutUntil - Date.now()) / 1000);
      setError(`OVERRIDE BLOCKED. SYSTEM LOCKED FOR ${remaining}s.`);
      return;
    }

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
      onSuccess();
    } catch (err: any) {
      setError(err.message.toUpperCase());
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      });
      if (error) throw error;
    } catch (err: any) {
      setError(err.message.toUpperCase());
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto relative">
      {/* Theme Toggle */}
      <button
        onClick={toggleTheme}
        type="button"
        className="absolute -top-12 right-0 p-2 rounded-lg bg-white/[0.03] border border-white/5 hover:bg-white/[0.05] transition-colors"
      >
        {isDarkMode ? <Sun size={18} className="text-white/60" /> : <Moon size={18} className="text-black/60" />}
      </button>

      <div className="mb-10 text-center">
        <h2 className="text-3xl font-bold text-white mb-2">
          {isLogin ? 'Welcome back' : 'Get started'}
        </h2>
        <p className="text-xs text-white/40">
          {isLogin ? 'Welcome back! Please sign in to continue' : 'Register your identity to begin.'}
        </p>
      </div>

      <form onSubmit={handleAuth} className="space-y-4">
        <div className="relative group">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-blue-500 transition-colors">
            <Mail size={18} />
          </div>
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full bg-[#f0f4ff]/[0.03] border border-white/5 rounded-xl py-3.5 pl-12 pr-4 text-sm text-white placeholder:text-white/20 outline-none focus:bg-[#f0f4ff]/[0.05] focus:border-blue-500/30 transition-all"
          />
        </div>

        <div className="relative group">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-blue-500 transition-colors">
            <Lock size={18} />
          </div>
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full bg-[#f0f4ff]/[0.03] border border-white/5 rounded-xl py-3.5 pl-12 pr-12 text-sm text-white placeholder:text-white/20 outline-none focus:bg-[#f0f4ff]/[0.05] focus:border-blue-500/30 transition-all"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 hover:text-white transition-colors"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => setShowForgotModal(true)}
            className="text-xs text-white/40 hover:text-white transition-colors"
          >
            Forgot your password?
          </button>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#f5f5f5] text-black font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 hover:bg-white transition-all disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="animate-spin" size={20} />
          ) : (
            <span className="text-sm">{isLogin ? 'Sign in' : 'Create account'}</span>
          )}
        </button>
      </form>

      <div className="my-8 flex items-center gap-4 text-[10px] text-white/10 uppercase font-bold tracking-widest">
        <div className="flex-1 h-[1px] bg-white/5" />
        or continue with
        <div className="flex-1 h-[1px] bg-white/5" />
      </div>

      <button
        onClick={handleGoogleLogin}
        className="w-full bg-white/[0.02] border border-white/5 text-white font-medium py-3 rounded-xl flex items-center justify-center gap-3 hover:bg-white/[0.04] transition-all"
      >
        <Award size={18} className="text-blue-500" />
        <span className="text-sm">Continue with Google</span>
      </button>

      <div className="mt-10 text-center space-y-8">
        <p className="text-sm text-white/40">
          {isLogin ? "Don't have an account? " : 'Already have an account? '}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-white font-bold hover:underline"
          >
            {isLogin ? 'Sign up' : 'Sign in'}
          </button>
        </p>

        <div className="space-y-4">

          {/* <p className="text-[10px] text-white/20 leading-loose">
            By continuing, you agree to our <button className="underline hover:text-white">Terms</button> and <button className="underline hover:text-white">Privacy Policy</button>
          </p> */}
        </div>
      </div>

      <ForgotPasswordModal
        isOpen={showForgotModal}
        onClose={() => setShowForgotModal(false)}
        setError={setError}
      />
    </div>
  );
};
