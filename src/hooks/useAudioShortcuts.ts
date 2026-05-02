import { useEffect } from 'react';
import { useAudioStore } from '../store/audioStore';

export const useAudioShortcuts = () => {
  const { togglePlay, nextTrack, prevTrack, setVolume, volume } = useAudioStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;

      if (e.altKey) {
        switch (e.key) {
          case 'p':
            e.preventDefault();
            togglePlay();
            break;
          case '.':
            e.preventDefault();
            nextTrack();
            break;
          case ',':
            e.preventDefault();
            prevTrack();
            break;
          case 'ArrowUp':
            e.preventDefault();
            setVolume(Math.min(1, volume + 0.1));
            break;
          case 'ArrowDown':
            e.preventDefault();
            setVolume(Math.max(0, volume - 0.1));
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlay, nextTrack, prevTrack, volume, setVolume]);
};
