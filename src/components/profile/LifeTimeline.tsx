import { useMemo } from 'react';
import { useSovereignStore } from '../../store/sovereign';
import { motion } from 'framer-motion';
import { History, Calendar, GraduationCap, AlertCircle } from 'lucide-react';
import { cn } from '../../lib/utils';

export const LifeTimeline = () => {
  const { graduationDate, lifeEvents } = useSovereignStore();

  const daysSinceGrad = useMemo(() => {
    if (!graduationDate) return 47; // Default/Sample from user request
    const grad = new Date(graduationDate);
    const now = new Date();
    return Math.floor((now.getTime() - grad.getTime()) / (1000 * 60 * 60 * 24));
  }, [graduationDate]);

  // Sample data if none exists
  const events = lifeEvents.length > 0 ? lifeEvents : [
    { date: 'Feb 2026', title: 'SOVEREIGN INITIALIZED', description: '', type: 'past' },
    { date: 'Feb 2026', title: 'GFT Phase 2 cleared', description: '', type: 'past' },
    { date: 'Feb 2026', title: 'TradeMind launched (fxjournal.live)', description: '', type: 'past' },
    { date: 'Mar 2026', title: 'First open source PR merged (TradeMind)', description: '', type: 'past' },
    { date: 'Mar 2026', title: '100 LeetCode problems milestone', description: '', type: 'past' },
    { date: 'Mar 2026', title: 'Job hunt started', description: '', type: 'past' },
    { date: 'Apr 2026', title: '47 days active on SOVEREIGN', description: '', type: 'past' },
    { date: 'Apr 2026', title: 'Best CODE week ever (Week 14)', description: '', type: 'past' },
    { date: 'Future', title: 'First job offer', description: '', type: 'future' },
    { date: 'Future', title: 'TradeMind first paying user', description: '', type: 'future' },
    { date: 'Future', title: 'First international trip', description: '', type: 'future' },
    { date: 'Future', title: 'Financial independence day', description: '', type: 'future' },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Timeline Section */}
      <div className="lg:col-span-8 bg-white/[0.02] border border-white/5 rounded-[40px] p-8 md:p-12 relative overflow-hidden backdrop-blur-md shadow-2xl">
        <div className="flex items-center gap-3 mb-10">
          <div className="p-2 rounded-lg bg-white/5 border border-white/10 text-white/60">
            <History size={16} />
          </div>
          <h3 className="font-bold text-[10px] tracking-[0.4em] text-white/40 uppercase font-black italic">Operator Timeline</h3>
        </div>

        <div className="relative space-y-0">
          {/* Vertical Line */}
          <div className="absolute left-[7px] top-2 bottom-2 w-px bg-white/10" />

          {events.map((event, i) => (
            <motion.div 
              key={i} 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
              className="relative pl-10 pb-10 group"
            >
              {/* Event Marker */}
              <div className={cn(
                "absolute left-0 top-1.5 w-4 h-4 rounded-full border-2 bg-black z-10 transition-all group-hover:scale-125",
                event.type === 'past' ? "border-white shadow-[0_0_10px_white]" : "border-white/20"
              )} />

              <div className="flex flex-col md:flex-row md:items-baseline gap-2 md:gap-6">
                <span className={cn(
                  "font-bold text-[10px] uppercase font-black tracking-widest shrink-0 w-24",
                  event.type === 'past' ? "text-white/40" : "text-white/10"
                )}>
                  {event.date}
                </span>
                <div className="space-y-1">
                  <h4 className={cn(
                    "text-lg font-black uppercase italic tracking-tighter",
                    event.type === 'past' ? "text-white" : "text-white/20"
                  )}>
                    {event.type === 'past' ? event.title : <span>{event.title} <span className="text-[8px] font-bold not-italic lowercase tracking-normal ml-2 opacity-40">[PENDING]</span></span>}
                  </h4>
                  {event.description && <p className="text-[10px] text-white/40 uppercase font-black italic">{event.description}</p>}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Graduation Counter Section */}
      <div className="lg:col-span-4 flex flex-col gap-6">
        <div className="bg-red-500/5 border border-red-500/10 rounded-[32px] p-8 md:p-10 space-y-6 flex-1 flex flex-col justify-center relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <GraduationCap size={80} />
           </div>
           
           <div className="space-y-1">
              <span className="font-bold text-[9px] text-red-500/60 uppercase tracking-[0.4em] font-black">Days Since Graduation</span>
              <div className="text-7xl font-black text-white italic tracking-tighter">
                {daysSinceGrad}
              </div>
           </div>

           <div className="space-y-1">
              <span className="font-bold text-[9px] text-red-500/60 uppercase tracking-[0.4em] font-black">Days Without Income</span>
              <div className="text-7xl font-black text-white italic tracking-tighter">
                {daysSinceGrad}
              </div>
           </div>

           <div className="pt-6 border-t border-red-500/20 flex items-start gap-3">
              <AlertCircle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-[10px] font-bold text-red-500/60 uppercase font-black leading-tight italic">
                This number should be decreasing in meaning, not increasing. Visible. Honest. Uncomfortable. Exactly right.
              </p>
           </div>
        </div>

        <div className="bg-white/[0.02] border border-white/5 rounded-[32px] p-8 flex items-center justify-between group">
           <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-white/5 border border-white/10 text-white/40">
                <Calendar size={14} />
              </div>
              <span className="font-bold text-[9px] text-white/40 uppercase tracking-widest font-black">Set Graduation Date</span>
           </div>
           <button className="text-[9px] font-bold font-black text-white/20 uppercase hover:text-white transition-all">EDIT</button>
        </div>
      </div>
    </div>
  );
};
