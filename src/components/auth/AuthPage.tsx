import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthHero } from './AuthHero';
import { LoginForm } from './LoginForm';
import { MagicLinkForm } from './MagicLinkForm';
import { AlertCircle } from 'lucide-react';

export const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [authMethod, setAuthMethod] = useState<'credentials' | 'magic-link'>('credentials');
  const [error, setError] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [lockoutUntil, setLockoutUntil] = useState<number | null>(null);

  const handleAuthError = (msg: string) => {
    const newAttempts = attempts + 1;
    setAttempts(newAttempts);
    if (newAttempts >= 5) {
      setLockoutUntil(Date.now() + 30000); // 30s lockout
      setError("SECURITY PROTOCOL ACTIVATED: 30s LOCKOUT IMPOSED.");
    } else {
      setError(msg);
    }
  };

  const handleAuthSuccess = () => {
    setAttempts(0);
    setLockoutUntil(null);
  };

  return (
    <div className="fixed inset-0 bg-[#050505] z-[9999] flex flex-col md:flex-row overflow-hidden selection:bg-[var(--stat-code)]/30">
      {/* Left Panel - Hero */}
      <div className="hidden md:flex md:w-1/2 border-r border-white/5">
        <AuthHero />
      </div>

      {/* Right Panel - Auth Card */}
      <div className="flex-1 md:w-1/2 flex flex-col items-center justify-center p-8 md:p-12 lg:p-20 relative bg-[#0a0a0a]">
        {/* Background Decor */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[var(--stat-code)]/5 blur-[120px] -translate-y-1/2 translate-x-1/2 rounded-full" />

        <div className="w-full max-w-sm relative z-10">
          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex gap-3 items-start"
              >
                <AlertCircle className="text-red-500 shrink-0" size={18} />
                <p className="text-xs text-red-200 leading-relaxed font-medium">
                  {error}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            {authMethod === 'credentials' ? (
              <motion.div
                key="credentials"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <LoginForm
                  isLogin={isLogin}
                  setIsLogin={setIsLogin}
                  onSuccess={handleAuthSuccess}
                  setError={handleAuthError}
                  lockoutUntil={lockoutUntil}
                />

                <div className="mt-6 text-center">
                  <button
                    onClick={() => setAuthMethod('magic-link')}
                    className="text-[10px] tracking-[0.2em] text-[var(--text-muted)] hover:text-white uppercase transition-colors"
                  >
                    Use Magic Link instead
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="magic-link"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <MagicLinkForm
                  onBack={() => setAuthMethod('credentials')}
                  setError={setError}
                />
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-12 pt-8 border-t border-white/5 flex flex-col items-center gap-4">
            <p className="text-[9px] text-[var(--text-muted)] tracking-[0.3em] uppercase">
              Authorized Terminal v4.6.0
            </p>
            <div className="flex gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-[var(--stat-code)] animate-pulse" />
              <div className="w-1.5 h-1.5 rounded-full bg-white/10" />
              <div className="w-1.5 h-1.5 rounded-full bg-white/10" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
