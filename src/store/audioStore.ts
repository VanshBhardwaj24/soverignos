import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Track } from '../types/audio';

interface AudioState {
  isPlaying: boolean;
  currentTrack: Track | null;
  volume: number;
  progress: number;
  queue: Track[];
  isMuted: boolean;
  binauralEnabled: boolean;
  binauralFrequency: number;
  favorites: string[]; // Store track IDs
  
  // Actions
  setIsPlaying: (isPlaying: boolean) => void;
  setCurrentTrack: (track: Track | null) => void;
  setVolume: (volume: number) => void;
  setProgress: (progress: number) => void;
  togglePlay: () => void;
  nextTrack: () => void;
  prevTrack: () => void;
  setBinauralEnabled: (enabled: boolean) => void;
  setBinauralFrequency: (freq: number) => void;
  toggleFavorite: (trackId: string) => void;
}

export const useAudioStore = create<AudioState>()(
  persist(
    (set, get) => ({
      isPlaying: false,
      currentTrack: null,
      volume: 0.7,
      progress: 0,
      queue: [],
      isMuted: false,
      binauralEnabled: false,
      binauralFrequency: 40,

      setIsPlaying: (isPlaying) => set({ isPlaying }),
      setCurrentTrack: (track) => set({ currentTrack: track, isPlaying: !!track, progress: 0 }),
      setVolume: (volume) => set({ volume }),
      setProgress: (progress) => set({ progress }),
      togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),
      
      nextTrack: () => {
        const { queue, currentTrack } = get();
        if (queue.length === 0) return;
        const currentIndex = queue.findIndex(t => t.id === currentTrack?.id);
        const nextIndex = (currentIndex + 1) % queue.length;
        set({ currentTrack: queue[nextIndex], progress: 0, isPlaying: true });
      },

      prevTrack: () => {
        const { queue, currentTrack } = get();
        if (queue.length === 0) return;
        const currentIndex = queue.findIndex(t => t.id === currentTrack?.id);
        const prevIndex = (currentIndex - 1 + queue.length) % queue.length;
        set({ currentTrack: queue[prevIndex], progress: 0, isPlaying: true });
      },

      setBinauralEnabled: (enabled) => set({ binauralEnabled: enabled }),
      setBinauralFrequency: (freq) => set({ binauralFrequency: freq }),
      favorites: [],
      toggleFavorite: (trackId) => set((state) => ({
        favorites: state.favorites.includes(trackId)
          ? state.favorites.filter(id => id !== trackId)
          : [...state.favorites, trackId]
      })),
    }),
    {
      name: 'sovereign-audio-storage',
      partialize: (state) => ({ 
        volume: state.volume, 
        binauralEnabled: state.binauralEnabled,
        binauralFrequency: state.binauralFrequency,
        favorites: state.favorites
      }),
    }
  )
);
