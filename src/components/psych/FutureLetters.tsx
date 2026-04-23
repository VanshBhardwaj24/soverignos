import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Lock, MailOpen, Calendar, Briefcase, Plus, X, Check } from 'lucide-react';
import { usePsychStore } from '../../store/sovereign-psych';
import { useSovereignStore } from '../../store/sovereign';
import { cn } from '../../lib/utils';
import { toast } from 'sonner';

export function FutureLetters() {
  const { futureLetters, addFutureLetter, checkLetterDelivery, markLetterDelivered } = usePsychStore();
  const { jobApplications, addNotification } = useSovereignStore();
  
  const [isWriting, setIsWriting] = useState(false);
  const [content, setContent] = useState('');
  const [deliveryType, setDeliveryType] = useState<'3months' | '1year' | 'job_offer'>('3months');

  // Check for newly delivered letters on mount
  useEffect(() => {
    const newlyTriggered = checkLetterDelivery(jobApplications);
    if (newlyTriggered.length > 0) {
      newlyTriggered.forEach(letter => {
        markLetterDelivered(letter.id);
        addNotification({
          title: 'TEMPORAL ANOMALY: LETTER RECEIVED',
          description: 'A message from your past self has just been unlocked.',
          status: 'URGENT',
          iconType: 'time'
        });
        toast.message('A sealed letter from your past self is now available to read.', {
          icon: <MailOpen className="text-amber-500" />
        });
      });
    }
  }, [jobApplications, checkLetterDelivery, markLetterDelivered, addNotification]);

  const handleSealLetter = () => {
    if (!content.trim()) return;

    let deliverAt = new Date();
    let trigger: 'job_offer' | undefined = undefined;

    if (deliveryType === 'job_offer') {
      deliverAt.setFullYear(deliverAt.getFullYear() + 5); // Fallback date
      trigger = 'job_offer';
    } else if (deliveryType === '3months') {
      deliverAt.setMonth(deliverAt.getMonth() + 3);
    } else if (deliveryType === '1year') {
      deliverAt.setFullYear(deliverAt.getFullYear() + 1);
    }

    addFutureLetter(content, deliverAt.toISOString(), deliveryType, trigger);
    toast.success('Letter sealed and embedded in the timeline.');
    setContent('');
    setIsWriting(false);
  };

  const sealedLetters = futureLetters.filter(l => !l.delivered);
  const openLetters = futureLetters.filter(l => l.delivered).sort((a, b) => new Date(b.writtenAt).getTime() - new Date(a.writtenAt).getTime());

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div>
          <h2 className="font-bold text-2xl font-black text-white uppercase italic">Temporal Letters</h2>
          <p className="font-bold text-[10px] text-white/40 uppercase tracking-[0.2em] mt-2">Write to the version of you that won.</p>
        </div>
        <button
          onClick={() => setIsWriting(true)}
          className="px-6 py-3 bg-white text-black font-bold text-[10px] uppercase font-black tracking-widest rounded-2xl hover:brightness-90 transition-all flex items-center justify-center gap-2"
        >
          <Plus size={14} /> Draft New Letter
        </button>
      </div>

      <AnimatePresence>
        {isWriting && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-[#111] border border-white/10 rounded-[32px] p-8 mb-12 shadow-2xl relative">
              <button 
                onClick={() => setIsWriting(false)}
                className="absolute top-6 right-6 text-white/20 hover:text-white"
              >
                <X size={20} />
              </button>
              
              <div className="mb-6 flex gap-4">
                <button
                  onClick={() => setDeliveryType('3months')}
                  className={cn(
                    "px-4 py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all flex items-center gap-2",
                    deliveryType === '3months' ? "bg-white/10 text-white" : "bg-white/5 text-white/40 hover:text-white/60"
                  )}
                >
                  <Calendar size={14} /> 3 Months
                </button>
                <button
                  onClick={() => setDeliveryType('1year')}
                  className={cn(
                    "px-4 py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all flex items-center gap-2",
                    deliveryType === '1year' ? "bg-white/10 text-white" : "bg-white/5 text-white/40 hover:text-white/60"
                  )}
                >
                  <Calendar size={14} /> 1 Year
                </button>
                <button
                  onClick={() => setDeliveryType('job_offer')}
                  className={cn(
                    "px-4 py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all flex items-center gap-2",
                    deliveryType === 'job_offer' ? "bg-[var(--stat-wealth)]/20 text-[var(--stat-wealth)]" : "bg-white/5 text-white/40 hover:text-white/60"
                  )}
                >
                  <Briefcase size={14} /> On Job Offer
                </button>
              </div>

              <textarea
                value={content}
                onChange={e => setContent(e.target.value)}
                placeholder="To my future self: Currently I am struggling with... I hope by the time you read this you have achieved..."
                className="w-full h-64 bg-white/5 border border-white/10 rounded-2xl p-6 text-white font-bold text-sm leading-relaxed outline-none focus:border-white/20 resize-none mb-6"
              />

              <button
                onClick={handleSealLetter}
                disabled={!content.trim()}
                className="w-full py-4 bg-white text-black font-bold font-black text-[10px] tracking-[0.2em] uppercase rounded-xl hover:bg-white/90 disabled:opacity-50 flex items-center justify-center gap-2 transition-all"
              >
                <Send size={16} /> Seal & Encrypt
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* SEALED LETTERS */}
        <div>
          <h3 className="font-bold text-[10px] text-amber-500/80 uppercase tracking-[0.3em] font-black mb-6 flex items-center gap-2">
            <Lock size={14} className="text-amber-500" /> Sealed In Time ({sealedLetters.length})
          </h3>
          <div className="space-y-4">
            {sealedLetters.length === 0 ? (
              <div className="p-8 border border-dashed border-white/10 rounded-3xl flex flex-col items-center justify-center opacity-30 text-center">
                <Lock size={24} className="mb-2" />
                <p className="font-bold text-[9px] uppercase tracking-widest">No sealed letters.</p>
              </div>
            ) : (
              sealedLetters.map(letter => (
                <div key={letter.id} className="p-6 bg-amber-500/5 border border-amber-500/20 rounded-3xl relative overflow-hidden group">
                  <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform">
                    <Lock size={100} />
                  </div>
                  <div className="relative z-10 flex items-start justify-between">
                    <div>
                      <p className="font-bold text-[9px] text-amber-500/60 uppercase tracking-widest mb-1">
                        Sealed on {new Date(letter.writtenAt).toLocaleDateString()}
                      </p>
                      <h4 className="font-bold text-sm text-amber-400 uppercase font-bold">
                        {letter.trigger === 'job_offer' 
                          ? 'To be opened upon achieving Job Success' 
                          : `Opens on ${new Date(letter.deliverAt).toLocaleDateString()}`}
                      </h4>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* DELIVERED LETTERS */}
        <div>
          <h3 className="font-bold text-[10px] text-[var(--stat-mind)]/80 uppercase tracking-[0.3em] font-black mb-6 flex items-center gap-2">
            <MailOpen size={14} className="text-[var(--stat-mind)]" /> Read & Unlocked ({openLetters.length})
          </h3>
          <div className="space-y-4">
            {openLetters.length === 0 ? (
              <div className="p-8 border border-dashed border-white/10 rounded-3xl flex flex-col items-center justify-center opacity-30 text-center">
                <MailOpen size={24} className="mb-2" />
                <p className="font-bold text-[9px] uppercase tracking-widest">Timeline intact. No messages received yet.</p>
              </div>
            ) : (
              openLetters.map(letter => (
                <div key={letter.id} className="p-8 bg-white/[0.02] border border-white/10 rounded-3xl group">
                  <div className="flex items-center justify-between mb-6">
                    <span className="font-bold text-[9px] text-white/40 uppercase tracking-widest px-3 py-1 bg-white/5 rounded-full">
                      Written: {new Date(letter.writtenAt).toLocaleDateString()}
                    </span>
                    <span className="font-bold text-[9px] text-[var(--stat-mind)] uppercase tracking-widest flex items-center gap-1">
                      <Check size={12} /> Delivered
                    </span>
                  </div>
                  <div className="prose prose-invert prose-p:font-bold prose-p:text-sm prose-p:text-white/70 prose-p:leading-relaxed max-w-none">
                    <p className="whitespace-pre-wrap">{letter.content}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
