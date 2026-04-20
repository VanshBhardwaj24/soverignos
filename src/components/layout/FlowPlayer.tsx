import { useState } from 'react';
import { Play, Pause, FastForward, Music } from 'lucide-react';

export const FlowPlayer = () => {
  const [playing, setPlaying] = useState(false);

  return (
    <div className="fixed bottom-6 left-6 md:left-[280px] bg-[var(--bg-elevated)]/80 backdrop-blur-xl border border-[var(--border-strong)] rounded-2xl p-2.5 flex items-center gap-4 z-40 shadow-2xl transition-all hover:bg-[var(--bg-hover)]">
      <div className="w-10 h-10 rounded-lg bg-[var(--bg-primary)] flex items-center justify-center border border-[var(--border-default)] overflow-hidden relative">
        <Music size={16} className="text-[var(--text-muted)] z-10" />
        {playing && <div className="absolute inset-x-0 bottom-0 bg-[var(--stat-mind)]/20 animate-pulse h-1/2" />}
      </div>
      
      <div className="flex flex-col pr-2 min-w-[100px]">
        <span className="font-mono text-[8px] tracking-[0.2em] text-[var(--text-secondary)]">FLOW STATE</span>
        <span className="font-sans text-xs font-medium text-[var(--text-primary)] shadow-sm">White Noise 40Hz</span>
      </div>

      <div className="flex items-center gap-2 pl-2 border-l border-[var(--border-default)]">
        <button 
          onClick={() => setPlaying(!playing)}
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[var(--bg-primary)] text-[var(--text-primary)] transition-colors"
        >
          {playing ? <Pause size={14} className="fill-current" /> : <Play size={14} className="fill-current ml-0.5" />}
        </button>
        <button className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[var(--bg-primary)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors hidden md:flex">
          <FastForward size={14} className="fill-current" />
        </button>
      </div>
    </div>
  );
}
