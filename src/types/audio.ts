export type AudioSource = 'local' | 'youtube' | 'soundcloud' | 'stream' | 'youtube_search';

export type Track = {
  id: string;
  title: string;
  artist: string;
  artwork?: string;
  url: string;
  source: AudioSource;
  duration?: number;
};
