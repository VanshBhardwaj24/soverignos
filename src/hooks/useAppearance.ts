import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useEffect } from 'react';

export type ThemeOptions = 'obsidian' | 'daylight' | 'ethereal' | 'deep-sea' | 'neon' | 'midnight';

export interface AppearanceState {
  theme: ThemeOptions;
  accentColor: string;
  glassOpacity: number;
  setTheme: (theme: ThemeOptions) => void;
  setAccentColor: (color: string) => void;
  setGlassOpacity: (opacity: number) => void;
}

export const useAppearanceStore = create<AppearanceState>()(
  persist(
    (set) => ({
      theme: 'obsidian',
      accentColor: '#E5E5E5', // Default light gray accent
      glassOpacity: 0.8,
      setTheme: (theme) => set({ theme }),
      setAccentColor: (accentColor) => set({ accentColor }),
      setGlassOpacity: (glassOpacity) => set({ glassOpacity }),
    }),
    { name: 'sovereign-appearance' }
  )
);

export function useAppearance() {
  const { theme, accentColor, glassOpacity, setTheme, setAccentColor, setGlassOpacity } = useAppearanceStore();

  useEffect(() => {
    const root = document.documentElement;
    
    // Theme
    root.classList.remove('light', 'ethereal', 'deep-sea', 'neon', 'midnight');
    
    if (theme === 'daylight') {
      root.classList.add('light');
    } else if (theme === 'ethereal') {
      root.classList.add('ethereal');
    } else if (theme === 'deep-sea') {
      root.classList.add('deep-sea');
    } else if (theme === 'neon') {
      root.classList.add('neon');
    } else if (theme === 'midnight') {
      root.classList.add('midnight');
    }
    // 'obsidian' is the default root, so no extra class needed.
    
    // CSS Variables
    root.style.setProperty('--accent-primary', accentColor);
    root.style.setProperty('--glass-opacity', glassOpacity.toString());
    
  }, [theme, accentColor, glassOpacity]);

  return { theme, accentColor, glassOpacity, setTheme, setAccentColor, setGlassOpacity };
}
