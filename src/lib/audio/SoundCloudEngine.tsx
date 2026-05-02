import { useEffect, useRef } from 'react';
import { useAudioStore } from '../../store/audioStore';

declare global {
  interface Window {
    SC: any;
  }
}

export const SoundCloudEngine = () => {
  const { currentTrack, isPlaying, volume, setIsPlaying, setProgress, togglePlay, nextTrack } = useAudioStore();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const widgetRef = useRef<any>(null);

  useEffect(() => {
    // Load SoundCloud Widget API
    if (!window.SC) {
      const script = document.createElement('script');
      script.src = "https://w.soundcloud.com/player/api.js";
      script.async = true;
      document.body.appendChild(script);
      script.onload = initWidget;
    } else {
      initWidget();
    }

    function initWidget() {
      if (!iframeRef.current || widgetRef.current) return;
      
      widgetRef.current = window.SC.Widget(iframeRef.current);
      
      widgetRef.current.bind(window.SC.Widget.Events.READY, () => {
        widgetRef.current.setVolume(volume * 100);
        updateMediaSession();
      });

      widgetRef.current.bind(window.SC.Widget.Events.PLAY, () => {
        setIsPlaying(true);
        updateMediaSession();
        if ('mediaSession' in navigator) navigator.mediaSession.playbackState = 'playing';
      });

      widgetRef.current.bind(window.SC.Widget.Events.PAUSE, () => {
        setIsPlaying(false);
        if ('mediaSession' in navigator) navigator.mediaSession.playbackState = 'paused';
      });

      widgetRef.current.bind(window.SC.Widget.Events.FINISH, () => {
        nextTrack();
      });

      widgetRef.current.bind(window.SC.Widget.Events.PLAY_PROGRESS, (progress: any) => {
        setProgress(progress.relativePosition * 100);
      });
    }
  }, []);

  const updateMediaSession = () => {
    if ('mediaSession' in navigator && currentTrack) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: currentTrack.title,
        artist: currentTrack.artist,
        artwork: [{ src: currentTrack.artwork || '', sizes: '512x512', type: 'image/jpeg' }]
      });

      navigator.mediaSession.setActionHandler('play', () => { togglePlay(); widgetRef.current?.play(); });
      navigator.mediaSession.setActionHandler('pause', () => { togglePlay(); widgetRef.current?.pause(); });
      navigator.mediaSession.setActionHandler('nexttrack', () => { nextTrack(); });
    }
  };

  // Handle Play/Pause
  useEffect(() => {
    if (!widgetRef.current || currentTrack?.source !== 'soundcloud') return;
    if (isPlaying) {
      widgetRef.current.play();
    } else {
      widgetRef.current.pause();
    }
  }, [isPlaying, currentTrack]);

  // Handle Volume
  useEffect(() => {
    if (widgetRef.current) {
      widgetRef.current.setVolume(volume * 100);
    }
  }, [volume]);

  // Handle Track Change
  useEffect(() => {
    if (!widgetRef.current || currentTrack?.source !== 'soundcloud') return;
    
    widgetRef.current.load(currentTrack.url, {
      auto_play: isPlaying,
      show_artwork: true,
      callback: () => {
        updateMediaSession();
      }
    });
  }, [currentTrack?.id]);

  return (
    <iframe
      ref={iframeRef}
      id="soundcloud-player"
      className="fixed -bottom-64 -right-64 w-[200px] h-[200px] opacity-0 pointer-events-none"
      allow="autoplay"
      src={`https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/293&show_artwork=false`}
    />
  );
};
