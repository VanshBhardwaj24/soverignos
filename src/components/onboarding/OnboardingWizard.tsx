import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSovereignStore } from '../../store/sovereign';
import { User, Target, Zap, Shield, ChevronRight, ChevronLeft, Check } from 'lucide-react';
import { STATS } from '../../lib/constants';

const steps = [
  { id: 'identity', title: 'ESTABLISH IDENTITY', icon: User },
  { id: 'priorities', title: 'SET PRIORITIES', icon: Target },
  { id: 'goal', title: 'DAILY QUOTA', icon: Zap },
  { id: 'deploy', title: 'DEPLOYMENT', icon: Shield },
];

export const OnboardingWizard = () => {
  const { 
    alias, username, 
    dailyGoalXP, setDailyGoalXP,
    updateProfile,
    setOnboardingComplete,
    addQuest
  } = useSovereignStore();

  const [currentStep, setCurrentStep] = useState(0);
  const [selectedStats, setSelectedStats] = useState<string[]>([]);
  const [localAlias, setLocalAlias] = useState(alias || '');
  const [localUsername, setLocalUsername] = useState(username || '');
  const [localGoal, setLocalGoal] = useState(dailyGoalXP || 100);

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 0));

  const handleComplete = async () => {
    await updateProfile({ alias: localAlias, username: localUsername });
    setDailyGoalXP(localGoal);
    
    // Create starter quests based on priorities
    for (const statId of selectedStats) {
      addQuest({
        title: `Initialize ${STATS[statId as keyof typeof STATS].name} growth`,
        statId,
        xpReward: 50,
        priority: 'P1',
        type: 'daily'
      });
    }

    setOnboardingComplete();
  };

  const stepVariants = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  };

  return (
    <div className="fixed inset-0 bg-[#050505] z-[10000] flex items-center justify-center p-6 backdrop-blur-xl">
      <div className="w-full max-w-2xl bg-[#0a0a0a] border border-white/5 rounded-3xl overflow-hidden shadow-2xl relative">
        {/* Progress Bar */}
        <div className="absolute top-0 left-0 right-0 h-1 flex">
          {steps.map((_, idx) => (
            <div 
              key={idx}
              className={`flex-1 transition-all duration-500 ${idx <= currentStep ? 'bg-[var(--stat-code)]' : 'bg-white/5'}`}
            />
          ))}
        </div>

        <div className="p-12">
          {/* Header */}
          <div className="flex items-center gap-4 mb-12">
            <div className="w-12 h-12 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-center">
              {(() => {
                const Icon = steps[currentStep].icon;
                return <Icon size={24} className="text-[var(--stat-code)]" />;
              })()}
            </div>
            <div>
              <div className="text-[10px] tracking-[0.3em] text-[var(--text-muted)] uppercase mb-1">
                Step {currentStep + 1} of {steps.length}
              </div>
              <h2 className="text-xl font-bold text-white tracking-widest">{steps[currentStep].title}</h2>
            </div>
          </div>

          {/* Content */}
          <div className="min-h-[300px]">
            <AnimatePresence mode="wait">
              {currentStep === 0 && (
                <motion.div key="s0" {...stepVariants} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] tracking-widest text-[var(--text-muted)] uppercase ml-1">Operational Alias</label>
                    <input 
                      type="text" 
                      value={localAlias}
                      onChange={e => setLocalAlias(e.target.value)}
                      placeholder="e.g. Commander Alpha"
                      className="w-full bg-white/[0.03] border border-white/10 rounded-xl p-4 text-white outline-none focus:border-[var(--stat-code)]/50 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] tracking-widest text-[var(--text-muted)] uppercase ml-1">System Username</label>
                    <input 
                      type="text" 
                      value={localUsername}
                      onChange={e => setLocalUsername(e.target.value)}
                      placeholder="e.g. agent_01"
                      className="w-full bg-white/[0.03] border border-white/10 rounded-xl p-4 text-white outline-none focus:border-[var(--stat-code)]/50 transition-all"
                    />
                  </div>
                </motion.div>
              )}

              {currentStep === 1 && (
                <motion.div key="s1" {...stepVariants}>
                  <p className="text-sm text-[var(--text-muted)] mb-6">Select 3 primary stats to focus your initial development.</p>
                  <div className="grid grid-cols-2 gap-3">
                    {Object.entries(STATS).map(([id, stat]) => (
                      <button
                        key={id}
                        onClick={() => {
                          if (selectedStats.includes(id)) {
                            setSelectedStats(selectedStats.filter(s => s !== id));
                          } else if (selectedStats.length < 3) {
                            setSelectedStats([...selectedStats, id]);
                          }
                        }}
                        className={`p-4 rounded-xl border transition-all text-left group ${
                          selectedStats.includes(id) 
                            ? 'bg-[var(--stat-code)]/10 border-[var(--stat-code)]/50' 
                            : 'bg-white/[0.02] border-white/5 hover:border-white/10'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className={`text-xs font-bold tracking-widest ${selectedStats.includes(id) ? 'text-white' : 'text-[var(--text-muted)]'}`}>
                            {stat.name.toUpperCase()}
                          </span>
                          {selectedStats.includes(id) && <Check size={14} className="text-[var(--stat-code)]" />}
                        </div>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {currentStep === 2 && (
                <motion.div key="s2" {...stepVariants} className="flex flex-col items-center justify-center py-8">
                  <div className="text-6xl font-bold text-white mb-4">{localGoal} <span className="text-sm text-[var(--text-muted)]">XP</span></div>
                  <input 
                    type="range" 
                    min="50" 
                    max="500" 
                    step="50"
                    value={localGoal}
                    onChange={e => setLocalGoal(parseInt(e.target.value))}
                    className="w-full h-1.5 bg-white/5 rounded-lg appearance-none cursor-pointer accent-[var(--stat-code)]"
                  />
                  <div className="flex justify-between w-full mt-4 text-[10px] tracking-widest text-[var(--text-muted)]">
                    <span>CADET (50)</span>
                    <span>ELITE (500)</span>
                  </div>
                  <p className="mt-8 text-center text-xs text-[var(--text-muted)] leading-relaxed">
                    This is your minimum daily performance requirement. <br/>Failure to meet this quota may trigger system sanctions.
                  </p>
                </motion.div>
              )}

              {currentStep === 3 && (
                <motion.div key="s3" {...stepVariants} className="text-center py-12">
                  <div className="w-20 h-20 bg-[var(--stat-code)]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Shield size={40} className="text-[var(--stat-code)]" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4">READY FOR DEPLOYMENT</h3>
                  <p className="text-sm text-[var(--text-muted)] leading-relaxed max-w-sm mx-auto">
                    Identity verified. Priorities set. Daily quota established. <br/>Click below to initialize your Sovereign OS interface.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer Nav */}
          <div className="mt-12 flex items-center justify-between">
            <button 
              onClick={prevStep}
              disabled={currentStep === 0}
              className="flex items-center gap-2 text-xs text-[var(--text-muted)] hover:text-white disabled:opacity-0 transition-all uppercase tracking-widest"
            >
              <ChevronLeft size={16} />
              Back
            </button>

            {currentStep < steps.length - 1 ? (
              <button 
                onClick={nextStep}
                disabled={currentStep === 0 && (!localAlias || !localUsername)}
                className="bg-white text-black font-bold py-3 px-8 rounded-xl flex items-center gap-2 hover:bg-gray-200 transition-all disabled:opacity-50"
              >
                <span>CONTINUE</span>
                <ChevronRight size={16} />
              </button>
            ) : (
              <button 
                onClick={handleComplete}
                className="bg-[var(--stat-code)] text-black font-bold py-3 px-8 rounded-xl flex items-center gap-2 hover:bg-[var(--stat-code)]/80 transition-all"
              >
                <span>INITIALIZE SYSTEM</span>
                <Check size={16} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
