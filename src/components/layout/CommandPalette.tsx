import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Compass, Terminal, ShieldAlert } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSovereignStore } from '../../store/sovereign';

export const CommandPalette = () => {
  const isOpen = useSovereignStore(state => state.commandPaletteOpen);
  const setIsOpen = useSovereignStore(state => state.setCommandPaletteOpen);
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const setLogModalOpen = useSovereignStore(state => state.setLogModalOpen);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(!isOpen);
      }
      if (e.key === 'Escape') setIsOpen(false);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, setIsOpen]);

  const commands = [
    { id: 'log', name: 'Log Activity', icon: Terminal, action: () => setLogModalOpen(true) },
    { id: 'nav_hq', name: 'Go to Dashboard', icon: Compass, action: () => navigate('/') },
    { id: 'nav_stats', name: 'Go to Capabilities UI', icon: Compass, action: () => navigate('/stats') },
    { id: 'nav_quests', name: 'Go to Quests', icon: Compass, action: () => navigate('/quests') },
    { id: 'nav_jobs', name: 'Go to Job Hunt', icon: Compass, action: () => navigate('/jobs') },
    { id: 'open_vault', name: 'Open Reward Vault', icon: ShieldAlert, action: () => window.dispatchEvent(new Event('sovereign:open-inventory')) },
    { id: 'god_mode', name: 'Engage God Mode', icon: ShieldAlert, action: () => window.dispatchEvent(new Event('sovereign:open-godmode')) },
  ];

  const filteredCommands = commands.filter(c => c.name.toLowerCase().includes(query.toLowerCase()));

  const handleExecute = (action: () => void) => {
    action();
    setIsOpen(false);
    setQuery('');
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[200]"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.15 }}
            className="fixed left-1/2 top-1/4 -translate-x-1/2 w-full max-w-2xl bg-[#0F0F0F] border border-white/10 rounded-2xl shadow-2xl z-[201] overflow-hidden"
          >
            <div className="flex items-center px-4 border-b border-white/10">
              <Search size={20} className="text-gray-500" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Type a command or search..."
                className="w-full bg-transparent text-white font-sans text-lg outline-none p-4 placeholder-gray-600"
              />
              <kbd className="hidden md:inline font-bold text-[10px] text-gray-500 bg-white/5 px-2 py-1 rounded">ESC</kbd>
            </div>

            <div className="max-h-80 overflow-y-auto p-2">
              {filteredCommands.length === 0 ? (
                <div className="p-8 text-center text-gray-500 font-bold text-sm">NO COMMAND FOUND</div>
              ) : (
                filteredCommands.map((cmd) => (
                  <button
                    key={cmd.id}
                    onClick={() => handleExecute(cmd.action)}
                    className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-white/5 text-left group transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <cmd.icon size={16} className="text-gray-500 group-hover:text-white transition-colors" />
                      <span className="text-gray-300 group-hover:text-white font-bold text-sm tracking-wide">{cmd.name}</span>
                    </div>
                  </button>
                ))
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
