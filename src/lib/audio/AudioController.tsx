import { useEffect } from 'react';
import { YouTubeEngine } from './YouTubeEngine';
import { LocalEngine } from './LocalEngine';
import { BinauralEngine } from './BinauralEngine';

export const AudioController = () => {
  // Global interaction listener to unlock audio
  useEffect(() => {
    const unlock = () => {
      // Create a dummy AudioContext and resume it
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      if (ctx.state === 'suspended') ctx.resume();
      window.removeEventListener('click', unlock);
      window.removeEventListener('keydown', unlock);
    };
    window.addEventListener('click', unlock);
    window.addEventListener('keydown', unlock);
    return () => {
      window.removeEventListener('click', unlock);
      window.removeEventListener('keydown', unlock);
    };
  }, []);

  return (
    <>
      <YouTubeEngine />
      <LocalEngine />
      <BinauralEngine />
    </>
  );
};
