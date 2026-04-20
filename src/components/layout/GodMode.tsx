import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, Square, Zap } from 'lucide-react';
import { useSovereignStore } from '../../store/sovereign';
import { useLocation } from 'react-router-dom';
import { cn } from '../../lib/utils';

// For simplicity, we just manage deep work state locally right now. 
// Can integrate to Zustand sovereign store `deepWorkActive` later.
export const GodModeTracker = () => {
  const { logActivity } = useSovereignStore();
  const location = useLocation();
  
  const [isOpen, setIsOpen] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(1500); // Default 25m
  const [initialSeconds, setInitialSeconds] = useState(1500);
  const [isCompleted, setIsCompleted] = useState(false);
  const [xpEfficiency, setXpEfficiency] = useState(0);
  const [finalXp, setFinalXp] = useState(0);

  // Listen for a global event to open God Mode
  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener('sovereign:open-godmode', handleOpen);
    return () => window.removeEventListener('sovereign:open-godmode', handleOpen);
  }, []);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isActive && secondsLeft > 0) {
      interval = setInterval(() => setSecondsLeft(s => s - 1), 1000);
    } else if (secondsLeft === 0 && isActive) {
      setIsActive(false);
      handleComplete();
    }
    return () => clearInterval(interval);
  }, [isActive, secondsLeft]);

  const handleComplete = () => {
    // Determine target stat based on current route
    const path = location.pathname.split('/')[1] || 'mind';
    const validStats = ['code', 'wealth', 'body', 'mind', 'network', 'brand'];
    const targetStat = validStats.includes(path) ? path : 'mind';

    // Scale XP: 25m -> 50, 50m -> 120, 90m -> 300
    const xpReward = initialSeconds <= 1500 ? 50 : initialSeconds <= 3000 ? 120 : 300;
    
    // Efficiency: XP / Hours
    const hours = initialSeconds / 3600;
    const efficiency = Math.round(xpReward / hours);
    setXpEfficiency(efficiency);
    setFinalXp(xpReward);

    logActivity(targetStat, xpReward, `God Mode Session (${Math.floor(initialSeconds/60)}m)`, {
      duration_seconds: initialSeconds,
      efficiency_xp_hr: efficiency
    });
    
    setIsCompleted(true);
    
    // Auto-close after 8s to show results
    setTimeout(() => {
      setIsCompleted(false);
      setIsOpen(false);
      setSecondsLeft(25 * 60);
    }, 8000);
  };

  const startSession = (mins: number) => {
    setInitialSeconds(mins * 60);
    setSecondsLeft(mins * 60);
    setIsActive(true);
  };

  const toggleTimer = () => setIsActive(!isActive);
  
  const formattedTime = () => {
    const m = Math.floor(secondsLeft / 60).toString().padStart(2, '0');
    const s = (secondsLeft % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-[#0A0A0A] z-[500] flex flex-col items-center justify-center font-mono selection:bg-white/20"
        >
          {/* Top navigation */}
          <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-center opacity-50 hover:opacity-100 transition-opacity">
            <span className="text-white tracking-[0.2em] text-xs">DIAGNOSTIC: GOD MODE</span>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-white hover:text-[var(--danger)] flex items-center gap-2"
            >
              <X size={20} /> <span className="text-xs">ABORT</span>
            </button>
          </div>

          <motion.div 
            initial={{ scale: 0.9, filter: 'blur(10px)' }}
            animate={{ scale: 1, filter: 'blur(0px)' }}
            className="flex flex-col items-center"
          >
            <div className="text-[120px] md:text-[180px] leading-none font-light tracking-tighter text-white mb-8" style={{ textShadow: isActive ? '0 0 40px rgba(255,255,255,0.4)' : 'none' }}>
              {formattedTime()}
            </div>
            
             <div className="flex items-center gap-6">
              <button 
                onClick={toggleTimer}
                className="w-16 h-16 rounded-full border border-white/20 flex items-center justify-center text-white hover:bg-white hover:text-black transition-all"
              >
                {isActive ? <Square size={24} className="fill-current" /> : <Play size={24} className="fill-current ml-1" />}
              </button>
              
              <div className="flex gap-4">
                 {[25, 50, 90].map(m => (
                   <button 
                    key={m}
                    onClick={() => startSession(m)}
                    className={cn(
                      "text-[10px] font-black tracking-widest px-6 py-2 border rounded-full transition-all",
                      initialSeconds === m * 60 ? "bg-white text-black border-white" : "text-white/40 border-white/10 hover:border-white/30"
                    )}
                   >
                    {m}M
                   </button>
                 ))}
              </div>
            </div>

            <AnimatePresence>
              {isCompleted && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-12 flex flex-col items-center gap-2"
                >
                   <div className="h-12 w-12 rounded-full bg-[var(--success)] flex items-center justify-center text-white shadow-[0_0_20px_var(--success)] mb-2">
                     <Zap size={24} />
                   </div>
                    <span className="text-[var(--success)] font-black tracking-[0.3em] text-xs">OBJECTIVE ACHIEVED</span>
                    
                    <div className="flex gap-8 mt-4 p-4 bg-white/5 border border-white/10 rounded-2xl">
                      <div className="text-center">
                        <span className="block text-[8px] text-white/30 uppercase tracking-[0.2em] mb-1">Magnitude</span>
                        <span className="text-xl font-mono font-black text-white">+{finalXp} XP</span>
                      </div>
                      <div className="w-px h-8 bg-white/10" />
                      <div className="text-center">
                        <span className="block text-[8px] text-white/30 uppercase tracking-[0.2em] mb-1">Efficiency</span>
                        <span className="text-xl font-mono font-black text-[var(--stat-brand)]">{xpEfficiency} <span className="text-[10px] opacity-40">XP/HR</span></span>
                      </div>
                    </div>

                    <span className="text-white/40 text-[10px] uppercase mt-6">Returning to Command...</span>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Minimal distraction warnings */}
          <div className="absolute bottom-10 shrink text-center">
            <p className="text-[#555] text-xs tracking-widest uppercase">All external communications intercepted.</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
