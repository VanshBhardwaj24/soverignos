import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Check, Lock, Zap, Target, Brain } from 'lucide-react';
import { useSovereignStore } from '../../store/sovereign';
import { cn } from '../../lib/utils';

export const ProtocolGate = ({ children }: { children: React.ReactNode }) => {
  useSovereignStore();
  
  // Logic: if today hasn't been "Initialized" via Protocol Gate, show the gate.
  // We'll use a local state tied to whether the user cleared the gate *this session*.
  const [isCleared, setIsCleared] = useState(false);
  
  const [steps, setSteps] = useState([
    { id: 'hydration', label: 'METABOLIC HYDRATION (500ML)', icon: Zap, completed: false },
    { id: 'intel', label: 'INTEL RECON (READ 3 ARTICLES)', icon: Brain, completed: false },
    { id: 'intent', label: 'LOG DAILY INTENT', icon: Target, completed: false },
  ]);

  const allCompleted = steps.every(s => s.completed);

  const toggleStep = (id: string) => {
    setSteps(s => s.map(step => step.id === id ? { ...step, completed: !step.completed } : step));
  };

  const handleUnlock = () => {
    if (allCompleted) {
      setIsCleared(true);
      // Optional: Log completion to store or trigger XP
      console.log('Protocol Cleared');
    }
  };

  // Skip if already cleared or if onboarding not done (though usually onboarding comes first)
  if (isCleared) return <>{children}</>;

  return (
    <div className="relative min-h-screen">
      <AnimatePresence>
        {!isCleared && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[600] bg-[#050505] flex flex-col items-center justify-center p-6 text-center font-mono"
          >
            {/* Background Texture */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none overflow-hidden">
               <Shield size={600} className="absolute -top-40 -left-40 rotate-12" />
               <Lock size={600} className="absolute -bottom-40 -right-40 -rotate-12" />
            </div>

            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="max-w-md w-full relative z-10"
            >
              <div className="h-16 w-16 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center text-white mb-8 mx-auto shadow-2xl">
                <Shield size={32} />
              </div>

              <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase mb-2">Operational Identity</h2>
              <p className="text-[10px] text-white/40 uppercase tracking-[0.3em] mb-12">Confirm protocol adherence to initialize command session.</p>

              <div className="space-y-4 mb-12">
                {steps.map((step) => (
                  <button
                    key={step.id}
                    onClick={() => toggleStep(step.id)}
                    className={cn(
                      "w-full p-6 rounded-2xl border transition-all flex items-center justify-between group",
                      step.completed 
                        ? "bg-green-500/10 border-green-500/30 text-green-500 shadow-[0_0_20px_rgba(34,197,94,0.1)]" 
                        : "bg-white/5 border-white/10 text-white/40 hover:border-white/30 hover:text-white"
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <step.icon size={18} className={cn(step.completed ? "text-green-500" : "text-white/20 group-hover:text-white")} />
                      <span className="text-[10px] font-black tracking-widest uppercase">{step.label}</span>
                    </div>
                    {step.completed ? <Check size={16} /> : <div className="w-4 h-4 rounded border border-white/20" />}
                  </button>
                ))}
              </div>

              <button
                disabled={!allCompleted}
                onClick={handleUnlock}
                className={cn(
                  "w-full h-16 rounded-2xl font-black tracking-[0.4em] uppercase transition-all flex items-center justify-center gap-3",
                  allCompleted 
                    ? "bg-white text-black hover:scale-[1.02] shadow-[0_20px_40px_rgba(255,255,255,0.2)]" 
                    : "bg-white/5 text-white/10 border border-white/5 cursor-not-allowed"
                )}
              >
                {allCompleted ? 'SYS UNLOCK' : 'LOCKED'}
              </button>
              
              <p className="mt-8 text-[8px] text-white/20 uppercase tracking-widest leading-relaxed">
                Failure to comply with initial protocol results in systemic efficiency degradation and stat leakage. Maintain discipline.
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {children}
    </div>
  );
};
