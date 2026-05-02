import { useState, memo } from 'react';
import { motion } from 'framer-motion';
import { Check, RotateCcw, HelpCircle, GraduationCap } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useSovereignStore } from '../../store/sovereign';

import type { KnowledgeCard as IKnowledgeCard } from '../../store/sovereign';

interface KnowledgeCardProps {
  card: IKnowledgeCard;
}

export const KnowledgeCard = memo(function KnowledgeCard({ card }: KnowledgeCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const toggleMastered = useSovereignStore(state => state.toggleCardMastered);

  return (
    <div className="perspective-1000 h-[280px] w-full group">
      <motion.div
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
        className="relative w-full h-full preserve-3d"
      >
        {/* Front Side */}
        <div className={cn(
          "absolute inset-0 backface-hidden p-8 rounded-[32px] border transition-all duration-500 flex flex-col items-center justify-center text-center",
          card.mastered 
            ? "bg-[var(--success)]/5 border-[var(--success)]/20 shadow-[0_0_30px_rgba(34,197,94,0.05)]" 
            : "bg-[#0A0A0A] border-white/10 group-hover:border-white/20 shadow-2xl"
        )}>
          <div className="absolute top-6 left-6 flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-[var(--stat-mind)]" />
            <span className="font-bold text-[9px] text-white/20 uppercase tracking-[0.2em]">{card.folder}</span>
          </div>

          <div className="text-white/20 mb-6">
            <HelpCircle size={32} strokeWidth={1.5} />
          </div>
          
          <h3 className="text-lg font-black tracking-tight text-white uppercase leading-tight">
            {card.question}
          </h3>

          <button 
            onClick={() => setIsFlipped(true)}
            className="mt-8 px-6 py-2 bg-white/5 border border-white/10 rounded-full text-[10px] font-bold font-black text-white/40 uppercase tracking-widest hover:text-white hover:border-white/20 transition-all"
          >
            Reveal Protocol
          </button>
        </div>

        {/* Back Side */}
        <div className="absolute inset-0 backface-hidden p-8 rounded-[32px] bg-[#111] border border-white/20 flex flex-col items-center justify-center text-center rotate-y-180 shadow-2xl">
          <div className="text-[var(--success)] mb-6">
            <GraduationCap size={32} strokeWidth={1.5} />
          </div>

          <p className="text-sm font-sans text-white/80 leading-relaxed max-w-[80%]">
            {card.answer}
          </p>

          <div className="mt-8 flex items-center gap-3">
            <button 
              onClick={() => setIsFlipped(false)}
              className="p-3 bg-white/5 border border-white/10 rounded-2xl text-white/60 hover:text-white transition-all"
            >
              <RotateCcw size={16} />
            </button>
            <button 
              onClick={() => toggleMastered(card.id)}
              className={cn(
                "px-6 py-3 rounded-2xl font-bold text-[10px] font-black tracking-widest uppercase transition-all flex items-center gap-2",
                card.mastered 
                  ? "bg-[var(--success)] text-white" 
                  : "bg-white text-black hover:brightness-90"
              )}
            >
              {card.mastered ? <Check size={14} /> : null}
              {card.mastered ? 'Protocol Mastered' : 'Mark as Mastered'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
});
