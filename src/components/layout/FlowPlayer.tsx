import { useState, useMemo } from 'react';
import { Play, Pause, FastForward, Music, Search, Brain, Star } from 'lucide-react';
import { useAudioStore } from '../../store/audioStore';
import { Visualizer } from './Visualizer';
import { LOFI_STREAMS } from '../../lib/audio/LofiStreams';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export const FlowPlayer = () => {
  const { 
    currentTrack, 
    isPlaying, 
    togglePlay, 
    nextTrack, 
    setCurrentTrack, 
    binauralEnabled, 
    setBinauralEnabled,
    favorites,
    toggleFavorite
  } = useAudioStore();
  
  const [showSources, setShowSources] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [activeTab, setActiveTab] = useState<'curated' | 'search'>('curated');

  // Priority Sort: Favorites first
  const sortedCurated = useMemo(() => {
    return [...LOFI_STREAMS].sort((a, b) => {
      const aFav = favorites.includes(a.id);
      const bFav = favorites.includes(b.id);
      if (aFav && !bFav) return -1;
      if (!aFav && bFav) return 1;
      return 0;
    });
  }, [favorites]);

  const handleSearch = async (e: React.FormEvent) => {
// ... existing handleSearch logic
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setActiveTab('search');
    
    try {
      const response = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(searchQuery)}&media=music&limit=15`);
      if (response.ok) {
        const data = await response.json();
        if (data.results) {
          setSearchResults(data.results.map((item: any) => ({
            id: item.trackId.toString(),
            title: item.trackName,
            artist: item.artistName,
            artwork: item.artworkUrl100.replace('100x100bb', '600x600bb'),
            url: `${item.trackName} ${item.artistName}`,
            source: 'youtube_search'
          })));
        }
      }
    } catch (err) {
      console.error("iTunes search failed:", err);
    }
    setIsSearching(false);
  };

  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  const handleImageError = (id: string) => {
    setImageErrors(prev => ({ ...prev, [id]: true }));
  };

  const displayTrack = currentTrack || LOFI_STREAMS[0];

  return (
    <div className="fixed bottom-6 left-6 md:left-[280px] z-40 flex flex-col gap-2">
      <AnimatePresence>
        {showSources && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="bg-[var(--bg-elevated)]/95 backdrop-blur-2xl border border-[var(--border-strong)] rounded-2xl p-2 w-72 shadow-2xl overflow-hidden mb-2 flex flex-col gap-2 max-h-[450px]"
          >
            {/* Tabs */}
            <div className="flex p-1 bg-[var(--bg-primary)] rounded-xl gap-1">
              <button 
                onClick={() => setActiveTab('curated')}
                className={cn(
                  "flex-1 py-1.5 text-[10px] font-bold rounded-lg transition-all",
                  activeTab === 'curated' ? "bg-[var(--accent-primary)] text-white" : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                )}
              >
                CURATED
              </button>
              <button 
                onClick={() => setActiveTab('search')}
                className={cn(
                  "flex-1 py-1.5 text-[10px] font-bold rounded-lg transition-all",
                  activeTab === 'search' ? "bg-[var(--accent-primary)] text-white" : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                )}
              >
                SEARCH
              </button>
            </div>

            {/* Search Input (Only in search tab) */}
            {activeTab === 'search' && (
              <form onSubmit={handleSearch} className="relative px-1">
                <Search size={12} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                <input 
                  type="text"
                  placeholder="Find music on YouTube..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[var(--bg-primary)] border border-[var(--border-default)] rounded-xl py-2 pl-9 pr-8 text-[11px] outline-none focus:border-[var(--accent-primary)] transition-all"
                />
                {isSearching && (
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2 animate-spin w-3 h-3 border-2 border-[var(--accent-primary)] border-t-transparent rounded-full" />
                )}
              </form>
            )}

            <div className="overflow-y-auto custom-scrollbar pr-1 pb-2 min-h-[100px]">
              {activeTab === 'curated' ? (
                <div className="flex flex-col gap-1">
                  {sortedCurated.map(track => (
                    <div key={track.id} className="relative group">
                      <button
                        onClick={() => { setCurrentTrack(track); setShowSources(false); }}
                        className={cn(
                          "flex items-center gap-3 p-2 rounded-xl transition-all text-left w-full",
                          currentTrack?.id === track.id ? "bg-[var(--accent-primary)]/10 text-[var(--accent-primary)]" : "hover:bg-[var(--bg-hover)] text-[var(--text-secondary)]"
                        )}
                      >
                        <div className="w-10 h-10 rounded-lg bg-[var(--bg-primary)] overflow-hidden shrink-0 relative border border-[var(--border-default)] flex items-center justify-center">
                          {track.artwork && !imageErrors[track.id] ? (
                            <img 
                              src={track.artwork} 
                              className="w-full h-full object-cover" 
                              alt="" 
                              onError={() => handleImageError(track.id)}
                            />
                          ) : (
                            <Music size={14} className="text-[var(--text-muted)]" />
                          )}
                        </div>
                        <div className="flex flex-col min-w-0 pr-6">
                          <span className="text-[11px] font-medium truncate">{track.title}</span>
                          <span className="text-[9px] opacity-60 truncate">{track.artist}</span>
                        </div>
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(track.id);
                        }}
                        className={cn(
                          "absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg transition-all opacity-0 group-hover:opacity-100",
                          favorites.includes(track.id) ? "opacity-100 text-yellow-500" : "text-[var(--text-muted)] hover:bg-[var(--bg-primary)]"
                        )}
                      >
                        <Star size={12} className={cn(favorites.includes(track.id) && "fill-current")} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col gap-1">
                  {searchResults.length > 0 ? (
                    searchResults.map(track => (
                      <div key={track.id} className="relative group">
                        <button
                          onClick={() => { setCurrentTrack(track); setShowSources(false); }}
                          className="flex items-center gap-3 p-2 rounded-xl hover:bg-[var(--bg-hover)] transition-all text-left group w-full"
                        >
                          <div className="w-10 h-10 rounded-lg bg-[var(--bg-primary)] overflow-hidden shrink-0 relative border border-[var(--border-default)] flex items-center justify-center">
                            {track.artwork && !imageErrors[track.id] ? (
                              <img 
                                src={track.artwork} 
                                className="w-full h-full object-cover" 
                                alt="" 
                                onError={() => handleImageError(track.id)}
                              />
                            ) : (
                              <Music size={14} className="text-[var(--text-muted)]" />
                            )}
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10">
                              <Play size={12} className="text-white fill-white" />
                            </div>
                          </div>
                          <div className="flex flex-col min-w-0 pr-6">
                            <span className="text-[11px] font-medium truncate text-[var(--text-primary)]">{track.title}</span>
                            <span className="text-[9px] text-[var(--text-muted)] truncate">{track.artist}</span>
                          </div>
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(track.id);
                          }}
                          className={cn(
                            "absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg transition-all opacity-0 group-hover:opacity-100",
                            favorites.includes(track.id) ? "opacity-100 text-yellow-500" : "text-[var(--text-muted)] hover:bg-[var(--bg-primary)]"
                          )}
                        >
                          <Star size={12} className={cn(favorites.includes(track.id) && "fill-current")} />
                        </button>
                      </div>
                    ))
                  ) : !isSearching && (
                    <div className="flex flex-col items-center justify-center py-8 text-[var(--text-muted)] gap-2">
                      <Search size={24} className="opacity-20" />
                      <span className="text-[10px]">No results found. Try a different query.</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Tools Section */}
            <div className="border-t border-[var(--border-default)] mt-auto pt-2 px-1">
              <button 
                onClick={() => setBinauralEnabled(!binauralEnabled)}
                className={cn(
                  "flex items-center justify-between w-full p-2 rounded-xl text-[10px] font-medium transition-all",
                  binauralEnabled ? "bg-[var(--stat-mind)]/10 text-[var(--stat-mind)]" : "hover:bg-[var(--bg-hover)] text-[var(--text-muted)]"
                )}
              >
                <div className="flex items-center gap-2">
                  <Brain size={12} />
                  <span>40Hz Binaural Overlay</span>
                </div>
                <div className={cn("w-1.5 h-1.5 rounded-full", binauralEnabled ? "bg-[var(--stat-mind)] animate-pulse" : "bg-[var(--text-muted)]")} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mini Player Bar */}
      <div className="bg-[var(--bg-elevated)]/80 backdrop-blur-xl border border-[var(--border-strong)] rounded-2xl p-2.5 flex items-center gap-4 shadow-2xl transition-all hover:bg-[var(--bg-hover)]">
        <button 
          onClick={() => setShowSources(!showSources)}
          className="w-10 h-10 rounded-lg bg-[var(--bg-primary)] flex items-center justify-center border border-[var(--border-default)] overflow-hidden relative group shrink-0"
        >
          {displayTrack.artwork && !imageErrors[displayTrack.id] ? (
            <img 
              src={displayTrack.artwork} 
              className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity z-10 relative" 
              alt="" 
              onError={() => handleImageError(displayTrack.id)}
            />
          ) : (
            <Music size={16} className="text-[var(--text-muted)] z-20 relative" />
          )}
          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors z-10" />
          {isPlaying && <div className="absolute inset-x-0 bottom-0 bg-[var(--accent-primary)]/20 animate-pulse h-1/2 z-10" />}
        </button>
        
        <div className="flex flex-col pr-2 min-w-[120px] max-w-[160px]">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[8px] tracking-[0.2em] text-[var(--text-secondary)] uppercase">Flow State</span>
            {isPlaying && <Visualizer isPlaying={isPlaying} />}
          </div>
          <span className="font-sans text-xs font-medium text-[var(--text-primary)] truncate">{displayTrack.title}</span>
        </div>

        <div className="flex items-center gap-1 pl-2 border-l border-[var(--border-default)]">
          <button 
            onClick={togglePlay}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[var(--bg-primary)] text-[var(--text-primary)] transition-colors"
          >
            {isPlaying ? <Pause size={14} className="fill-current" /> : <Play size={14} className="fill-current ml-0.5" />}
          </button>
          <button 
            onClick={nextTrack}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[var(--bg-primary)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors hidden md:flex"
          >
            <FastForward size={14} className="fill-current" />
          </button>
        </div>
      </div>
    </div>
  );
};
