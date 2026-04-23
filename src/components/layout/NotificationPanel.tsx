import { useSovereignStore } from '../../store/sovereign';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Trophy, AlertCircle, Trash2, X } from 'lucide-react';

export const NotificationPanel = () => {
  const isOpen = useSovereignStore(state => state.notificationsOpen);
  const toggle = useSovereignStore(state => state.toggleNotifications);
  const notifications = useSovereignStore(state => state.notifications);
  const clear = useSovereignStore(state => state.clearNotifications);

  const getIcon = (type: string) => {
    switch(type) {
      case 'time': return <Clock size={16} className="text-[var(--success)]" />;
      case 'milestone': return <Trophy size={16} className="text-[#FFB800]" />;
      default: return <AlertCircle size={16} className="text-[var(--danger)]" />;
    }
  };

  const getIconBg = (type: string) => {
    switch(type) {
      case 'time': return 'bg-[var(--success)]/10 border-[var(--success)]/20';
      case 'milestone': return 'bg-[#FFB800]/10 border-[#FFB800]/20';
      default: return 'bg-[var(--danger)]/10 border-[var(--danger)]/20';
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => toggle(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]"
          />
          <motion.div 
            initial={{ opacity: 0, x: 20, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.95 }}
            className="fixed right-4 top-20 w-full max-w-[380px] bg-[var(--bg-card)]/95 backdrop-blur-xl border border-[var(--border-strong)] rounded-3xl shadow-2xl z-[61] overflow-hidden"
          >
            <div className="p-5 border-b border-[var(--border-subtle)] flex items-center justify-between bg-black/20">
               <h3 className="font-sans font-bold text-lg text-[var(--text-primary)]">Notifications</h3>
               <div className="flex items-center gap-2">
                 <button 
                  onClick={clear}
                  className="p-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-white/5 rounded-lg transition-all"
                 >
                   <Trash2 size={18} />
                 </button>
                 <button 
                  onClick={() => toggle(false)}
                  className="p-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-white/5 rounded-lg transition-all"
                 >
                   <X size={18} />
                 </button>
               </div>
            </div>

            <div className="max-h-[60vh] overflow-y-auto no-scrollbar p-1">
               {notifications.length === 0 ? (
                 <div className="py-12 px-6 text-center">
                    <div className="h-12 w-12 rounded-full bg-[var(--bg-elevated)] flex items-center justify-center mx-auto mb-4 opacity-50">
                       <Clock size={20} className="text-[var(--text-muted)]" />
                    </div>
                    <p className="font-bold text-[10px] tracking-widest text-[var(--text-muted)] uppercase">No system alerts active</p>
                 </div>
               ) : (
                 notifications.map((n, i) => (
                    <motion.div 
                      key={n.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="p-5 flex gap-4 hover:bg-white/[0.02] transition-colors border-b border-white/[0.03] last:border-0"
                    >
                       <div className={`h-10 w-10 shrink-0 rounded-full flex items-center justify-center border ${getIconBg(n.iconType)}`}>
                          {getIcon(n.iconType)}
                       </div>
                       <div className="flex-1 space-y-1">
                          <h4 className="font-sans font-bold text-sm text-[var(--text-primary)] leading-tight">{n.title}</h4>
                          <p className="font-sans text-xs text-[var(--text-secondary)] leading-relaxed opacity-80">{n.description}</p>
                          <p className="font-bold text-[9px] tracking-widest text-[var(--text-muted)] font-bold pt-1">{n.status}</p>
                       </div>
                    </motion.div>
                 ))
               )}
            </div>

            {notifications.length > 0 && (
              <div className="p-4 bg-black/20 border-t border-[var(--border-subtle)] text-center">
                 <button className="text-[10px] font-bold tracking-widest text-[var(--text-muted)] hover:text-[var(--text-primary)] uppercase transition-colors">
                    Archive all alerts
                 </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
