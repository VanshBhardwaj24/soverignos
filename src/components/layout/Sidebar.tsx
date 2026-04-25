import { useLocation, useNavigate } from 'react-router-dom';
import {
  Home, BarChart2, Target, Briefcase, Plane, Settings,
  PieChart, Shield, Zap, Brain, AlertTriangle, ChevronLeft,
  ChevronRight, Calendar,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { motion } from 'framer-motion';
import { useSovereignStore } from '../../store/sovereign';

// Sentence-case labels, grouped semantically — Linear/Apple style.
const NAV_GROUPS: Array<{
  heading: string;
  items: Array<{ path: string; label: string; icon: typeof Home }>;
}> = [
    {
      heading: 'CORE',
      items: [
        { path: '/', label: 'Dashboard', icon: Home },
        { path: '/quests', label: 'Missions', icon: Target },
        { path: '/punishments', label: 'Accountability', icon: AlertTriangle },
        { path: '/marketplace', label: 'Rewards', icon: Shield },
      ],
    },
    {
      heading: 'Life domains',
      items: [
        { path: '/wealth', label: 'Wealth', icon: BarChart2 },
        { path: '/jobs', label: 'Opportunities', icon: Briefcase },
        { path: '/forge', label: 'Business forge', icon: Zap },
        { path: '/mind', label: 'Mind vault', icon: Brain },
        { path: '/travel', label: 'Travel log', icon: Plane },
      ],
    },
    {
      heading: 'Insights',
      items: [
        { path: '/stats', label: 'System stats', icon: BarChart2 },
        { path: '/analytics', label: 'Analytics', icon: PieChart },
        { path: '/intelligence', label: 'Intelligence', icon: Zap },
        { path: '/sunday', label: 'Sunday protocol', icon: Calendar },
      ],
    },
    {
      heading: 'System',
      items: [{ path: '/settings', label: 'Settings', icon: Settings }],
    },
  ];

export const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { sidebarCollapsed, setSidebarCollapsed } = useSovereignStore();

  return (
    <motion.aside
      data-testid="app-sidebar"
      initial={false}
      animate={{ width: sidebarCollapsed ? 76 : 256 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      className="hidden md:flex flex-col h-screen fixed left-0 top-0 pt-20 border-r border-[var(--border-default)] bg-[var(--bg-primary)] z-40"
    >
      <div className="absolute top-1/2 -right-3 -translate-y-1/2 z-50">
        <button
          data-testid="sidebar-toggle-btn"
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="flex items-center justify-center w-6 h-12 bg-[var(--surface-3)] border border-[var(--border-default)] rounded-full text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-strong)] transition-colors focus-visible:opacity-100 outline-none"
          style={{ opacity: 'var(--toggle-opacity, 0)' }}
        >
          {sidebarCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </div>
      <style>{`aside:hover { --toggle-opacity: 1; }`}</style>

      <nav className="flex-1 flex flex-col gap-6 px-3 py-4 overflow-y-auto">
        {NAV_GROUPS.map((group) => (
          <div key={group.heading} className="flex flex-col gap-1">
            {!sidebarCollapsed && (
              <div className="px-3 pb-1.5 text-[10px] font-medium tracking-[0.14em] uppercase text-[var(--text-muted)] font-mono">
                {group.heading}
              </div>
            )}
            {group.items.map((item) => {
              const isSundayPath = item.path === '/sunday';
              const isSunday = new Date().getDay() === 0;
              const isLocked = isSundayPath && !isSunday;
              const isActive =
                location.pathname === item.path ||
                (item.path !== '/' && location.pathname.startsWith(item.path));
              const Icon = item.icon;

              return (
                <button
                  key={item.path}
                  data-testid={`sidebar-link-${item.path.replace(/\//g, '') || 'home'}`}
                  onClick={() => navigate(item.path)}
                  aria-label={item.label}
                  aria-current={isActive ? 'page' : undefined}
                  title={sidebarCollapsed ? item.label : ''}
                  className={cn(
                    'group relative flex items-center rounded-lg h-10 overflow-hidden outline-none',
                    'transition-colors duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]',
                    sidebarCollapsed ? 'justify-center px-0' : 'px-3 gap-3',
                    isActive
                      ? 'text-[var(--accent-primary)] bg-[var(--bg-elevated)]'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]',
                    isLocked && 'opacity-50 hover:opacity-90',
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId="sidebar-active"
                      className="absolute left-0 top-1.5 bottom-1.5 w-0.5 rounded-full bg-[var(--accent-primary)]"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                  <Icon
                    size={17}
                    strokeWidth={1.75}
                    className={cn(
                      'shrink-0',
                      isSundayPath && isSunday && !isActive && 'text-[var(--stat-mind)]',
                    )}
                  />
                  {!sidebarCollapsed && (
                    <span className="text-[13px] font-medium truncate whitespace-nowrap tracking-[-0.005em]">
                      {isSundayPath && isSunday ? 'Sunday protocol · Active' : item.label}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      <div
        className={cn(
          'border-t border-[var(--border-default)] px-4 py-4 flex items-center gap-3 text-[var(--text-muted)]',
          sidebarCollapsed && 'justify-center px-0',
        )}
      >
        {/* <div className="h-2 w-2 rounded-full bg-[var(--success)] shadow-[0_0_8px_var(--success)]" /> */}
        {!sidebarCollapsed && (
          <span className="text-[11px] font-medium tracking-wide">
            System secure
          </span>
        )}
      </div>
    </motion.aside>
  );
};
