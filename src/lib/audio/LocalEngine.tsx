import { useEffect, useRef } from 'react';
import { useAudioStore } from '../../store/audioStore';

export const LocalEngine = () => {
  const { isPlaying, currentTrack, volume, setProgress, setIsPlaying } = useAudioStore();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize or Cleanup Audio Object
  useEffect(() => {
    if (currentTrack?.source === 'local') {
      if (!audioRef.current) {
        audioRef.current = new Audio();
        audioRef.current.crossOrigin = "anonymous";
        
        audioRef.current.onplay = () => setIsPlaying(true);
        audioRef.current.onpause = () => setIsPlaying(false);
        audioRef.current.onerror = (e) => {
          if (audioRef.current?.src) {
            console.warn("Local Audio Error:", e);
          }
        };
        audioRef.current.ontimeupdate = () => {
          if (audioRef.current && audioRef.current.duration) {
            setProgress((audioRef.current.currentTime / audioRef.current.duration) * 100);
          }
        };
      }
      
      if (audioRef.current.src !== currentTrack.url) {
        audioRef.current.src = currentTrack.url;
        audioRef.current.load();
      }
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
        audioRef.current = null;
      }
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }
    };
  }, [currentTrack?.id, currentTrack?.source]);

  // Handle Play/Pause
  useEffect(() => {
    if (!audioRef.current || currentTrack?.source !== 'local') return;

    if (isPlaying) {
      audioRef.current.play().catch(() => {});
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying]);

  // Handle Volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  return null;
};
