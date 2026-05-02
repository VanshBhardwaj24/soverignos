import { useEffect, useRef } from 'react';
import { useAudioStore } from '../../store/audioStore';

export const BinauralEngine = () => {
  const { binauralEnabled, binauralFrequency, isPlaying, volume } = useAudioStore();
  const audioCtxRef = useRef<AudioContext | null>(null);
  const leftOscRef = useRef<OscillatorNode | null>(null);
  const rightOscRef = useRef<OscillatorNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const pannerLeftRef = useRef<StereoPannerNode | null>(null);
  const pannerRightRef = useRef<StereoPannerNode | null>(null);

  useEffect(() => {
    return () => {
      stopBinaural();
    };
  }, []);

  useEffect(() => {
    if (binauralEnabled && isPlaying) {
      startBinaural();
    } else {
      stopBinaural();
    }
  }, [binauralEnabled, isPlaying]);

  useEffect(() => {
    if (gainRef.current) {
      // Binaural should be subtle, so we scale it down relative to main volume
      gainRef.current.gain.setTargetAtTime(volume * 0.1, audioCtxRef.current?.currentTime || 0, 0.1);
    }
  }, [volume]);

  useEffect(() => {
    if (leftOscRef.current && rightOscRef.current) {
      const baseFreq = 200; // Comfortable base frequency
      leftOscRef.current.frequency.setTargetAtTime(baseFreq, audioCtxRef.current?.currentTime || 0, 0.1);
      rightOscRef.current.frequency.setTargetAtTime(baseFreq + binauralFrequency, audioCtxRef.current?.currentTime || 0, 0.1);
    }
  }, [binauralFrequency]);

  const startBinaural = async () => {
    if (audioCtxRef.current) return;

    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    if (ctx.state === 'suspended') {
      await ctx.resume();
    }
    audioCtxRef.current = ctx;

    const gain = ctx.createGain();
    gain.gain.value = volume * 0.1;
    gain.connect(ctx.destination);
    gainRef.current = gain;

    const leftOsc = ctx.createOscillator();
    const rightOsc = ctx.createOscillator();
    leftOsc.type = 'sine';
    rightOsc.type = 'sine';

    const pannerLeft = ctx.createStereoPanner();
    const pannerRight = ctx.createStereoPanner();
    pannerLeft.pan.value = -1;
    pannerRight.pan.value = 1;

    leftOsc.connect(pannerLeft);
    pannerLeft.connect(gain);
    
    rightOsc.connect(pannerRight);
    pannerRight.connect(gain);

    const baseFreq = 200;
    leftOsc.frequency.value = baseFreq;
    rightOsc.frequency.value = baseFreq + binauralFrequency;

    leftOsc.start();
    rightOsc.start();

    leftOscRef.current = leftOsc;
    rightOscRef.current = rightOsc;
    pannerLeftRef.current = pannerLeft;
    pannerRightRef.current = pannerRight;
  };

  const stopBinaural = () => {
    if (leftOscRef.current) {
      leftOscRef.current.stop();
      leftOscRef.current.disconnect();
    }
    if (rightOscRef.current) {
      rightOscRef.current.stop();
      rightOscRef.current.disconnect();
    }
    if (audioCtxRef.current) {
      audioCtxRef.current.close();
    }
    audioCtxRef.current = null;
    leftOscRef.current = null;
    rightOscRef.current = null;
    gainRef.current = null;
  };

  return null;
};
