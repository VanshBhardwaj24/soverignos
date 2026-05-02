import { useEffect, useRef } from 'react';
import { useAudioStore } from '../../store/audioStore';

declare global {
  interface Window {
    onYouTubeIframeAPIReady: () => void;
    YT: any;
  }
}

export const YouTubeEngine = () => {
  const { currentTrack, isPlaying, volume, setIsPlaying, setProgress, togglePlay, nextTrack } = useAudioStore();
  const playerRef = useRef<any>(null);
  const intervalRef = useRef<any>(null);

  // Background Playback & Media Controls
  const updateMediaSession = () => {
    if ('mediaSession' in navigator && currentTrack) {
      const videoId = extractVideoId(currentTrack.url);
      navigator.mediaSession.metadata = new MediaMetadata({
        title: currentTrack.title,
        artist: currentTrack.artist,
        artwork: [
          { 
            src: currentTrack.artwork || `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`, 
            sizes: '512x512', 
            type: 'image/jpeg' 
          }
        ]
      });

      navigator.mediaSession.setActionHandler('play', () => {
        togglePlay();
        if (playerRef.current) playerRef.current.playVideo();
      });
      navigator.mediaSession.setActionHandler('pause', () => {
        togglePlay();
        if (playerRef.current) playerRef.current.pauseVideo();
      });
      navigator.mediaSession.setActionHandler('nexttrack', () => {
        nextTrack();
      });
    }
  };

  useEffect(() => {
    let isMounted = true;
    
    const loadAPI = () => {
      if (window.YT && window.YT.Player) {
        initPlayer();
        return;
      }

      const existing = document.querySelector('script[src*="iframe_api"]');
      if (existing) existing.remove();

      const tag = document.createElement('script');
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

      window.onYouTubeIframeAPIReady = () => {
        if (isMounted) initPlayer();
      };
    };

    function initPlayer() {
      if (playerRef.current || !isMounted) return;
      
      const container = document.getElementById('youtube-player-container');
      if (!container) return;

      try {
        playerRef.current = new window.YT.Player('youtube-player-container', {
          height: '200',
          width: '200',
          playerVars: {
            playsinline: 1,
            controls: 0,
            disablekb: 1,
            autoplay: 0,
            origin: window.location.origin,
            enablejsapi: 1,
            rel: 0
          },
          events: {
            onReady: (event: any) => {
              if (!isMounted) return;
              event.target.setVolume(useAudioStore.getState().volume * 100);
              updateMediaSession();
              const { isPlaying, currentTrack } = useAudioStore.getState();
              if (isPlaying && currentTrack?.source === 'youtube') {
                event.target.playVideo();
              }
            },
            onStateChange: (event: any) => {
              if (!isMounted) return;
              if (event.data === 1) {
                setIsPlaying(true);
                navigator.mediaSession.playbackState = 'playing';
              }
              if (event.data === 2) {
                setIsPlaying(false);
                navigator.mediaSession.playbackState = 'paused';
              }
            },
            onError: (e: any) => {
              if (e.data !== 153) {
                console.warn("YouTube Player Event:", e.data);
              }
            }
          }
        });
      } catch (e) {
        console.warn("YouTube Player Init Failed:", e);
      }
    }

    loadAPI();

    return () => {
      isMounted = false;
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  // Handle Play/Pause
  useEffect(() => {
    if (!playerRef.current || currentTrack?.source !== 'youtube') return;
    try {
      if (isPlaying) {
        playerRef.current.playVideo();
        navigator.mediaSession.playbackState = 'playing';
      } else {
        playerRef.current.pauseVideo();
        navigator.mediaSession.playbackState = 'paused';
      }
    } catch (e) {
      console.warn("YouTube play/pause failed:", e);
    }
  }, [isPlaying, currentTrack]);

  // Handle Volume
  useEffect(() => {
    if (!playerRef.current || typeof playerRef.current.setVolume !== 'function') return;
    playerRef.current.setVolume(volume * 100);
  }, [volume]);

  // Handle Track Change
  useEffect(() => {
    if (!playerRef.current || !currentTrack) return;

    if (currentTrack.source === 'youtube') {
      const videoId = extractVideoId(currentTrack.url);
      if (videoId && typeof playerRef.current.loadVideoById === 'function') {
        playerRef.current.loadVideoById(videoId);
        updateMediaSession();
        if (!isPlaying) playerRef.current.pauseVideo();
      }
    } else if (currentTrack.source === 'youtube_search') {
      // Use YouTube's native search-to-play feature
      if (typeof playerRef.current.loadPlaylist === 'function') {
        playerRef.current.loadPlaylist({
          listType: 'search',
          list: currentTrack.url, // URL field contains the "Artist Track" search string
          index: 0,
          suggestedQuality: 'default'
        });
        updateMediaSession();
      }
    }
  }, [currentTrack?.id]);

  // Sync Progress
  useEffect(() => {
    if (isPlaying && currentTrack?.source === 'youtube') {
      intervalRef.current = setInterval(() => {
        if (playerRef.current && typeof playerRef.current.getCurrentTime === 'function') {
          const currentTime = playerRef.current.getCurrentTime();
          const duration = playerRef.current.getDuration();
          if (duration > 0) {
            setProgress((currentTime / duration) * 100);
          }
        }
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPlaying, currentTrack]);

  return (
    <div className="fixed -bottom-64 -right-64 w-[200px] h-[200px] pointer-events-none opacity-0 -z-50 overflow-hidden">
      <div id="youtube-player-container" />
    </div>
  );
};

function extractVideoId(url: string) {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}
