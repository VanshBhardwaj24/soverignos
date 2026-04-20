import { useLocation, useNavigate } from 'react-router-dom';
import { Home, BarChart2, Target, Briefcase, Plane, Settings, PieChart, Shield, Zap, Brain, AlertTriangle, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useSovereignStore } from '../../store/sovereign';

const NAV_ITEMS = [
  { path: '/', label: 'DASHBOARD', icon: Home },
  { path: '/quests', label: 'MISSIONS', icon: Target },
  { path: '/punishments', label: 'ACCOUNTABILITY', icon: AlertTriangle },
  { path: '/wealth', label: 'WEALTH', icon: BarChart2 },
  { path: '/jobs', label: 'OPPORTUNITIES', icon: Briefcase },
  { path: '/forge', label: 'BUSINESS FORGE', icon: Zap },
  { path: '/mind', label: 'MIND VAULT', icon: Brain },
  { path: '/travel', label: 'TRAVEL LOG', icon: Plane },
  { path: '/marketplace', label: 'BLACK MARKET', icon: Shield },
  { path: '/stats', label: 'SYSTEM STATS', icon: BarChart2 },
  { path: '/analytics', label: 'ANALYTICS', icon: PieChart },
  { path: '/settings', label: 'CONFIG', icon: Settings },
];

export const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { sidebarCollapsed, setSidebarCollapsed } = useSovereignStore();

  return (
    <motion.aside
      initial={false}
      animate={{ width: sidebarCollapsed ? 80 : 256 }}
      className="hidden md:flex flex-col h-screen fixed left-0 top-0 pt-20 border-r border-[var(--border-default)] bg-[var(--bg-primary)] z-40 transition-colors duration-300"
    >
      {/* Toggle Button Container */}
      <div className="absolute top-1/2 -right-3 -translate-y-1/2 z-50">
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="group relative flex items-center justify-center w-6 h-12 bg-[var(--bg-primary)] border border-[var(--border-default)] rounded-full text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--text-primary)]/40 transition-all opacity-0 group-hover/sidebar:opacity-100 group-focus-within/sidebar:opacity-100"
          style={{ opacity: 'var(--toggle-opacity, 0)' }}
        >
          {sidebarCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </div>

      {/* CSS Hack for hover state if framer-motion group-hover isn't enough */}
      <style>{`
        aside:hover { --toggle-opacity: 1; }
      `}</style>

      <nav className="flex-1 flex flex-col gap-4 px-3 py-3 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
          const Icon = item.icon;

          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={cn(
                "flex items-center rounded-xl transition-all relative group overflow-hidden h-12",
                sidebarCollapsed ? "justify-center px-0" : "px-4 gap-4",
                isActive ? "text-[var(--text-primary)] bg-[var(--text-primary)]/5" : "text-[var(--text-secondary)] hover:bg-[var(--text-primary)]/5 hover:text-[var(--text-primary)]"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="sidebar-active"
                  className="absolute left-0 top-0 bottom-0 w-1 bg-[var(--text-primary)]"
                />
              )}
              <Icon size={18} className={cn("shrink-0 transition-colors", isActive ? "text-[var(--text-primary)]" : "group-hover:text-[var(--text-primary)]")} />

              {!sidebarCollapsed && (
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="font-mono text-xs tracking-widest uppercase mt-0.5 truncate whitespace-nowrap"
                >
                  {item.label}
                </motion.span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="p-6 border-t border-[var(--border-default)] opacity-50 flex items-center gap-3">
        <Shield size={16} />
        <span className="font-mono text-[10px] tracking-widest uppercase">System Encrypted</span>
      </div>
    </motion.aside>
  );
};
