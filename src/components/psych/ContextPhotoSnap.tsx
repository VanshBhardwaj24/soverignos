import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Camera, Upload, Check, X, RefreshCw, Eye } from 'lucide-react';
import { usePsychStore } from '../../store/sovereign-psych';
import { toast } from 'sonner';

interface ContextPhotoSnapProps {
  onComplete?: () => void;
}

export function ContextPhotoSnap({ onComplete }: ContextPhotoSnapProps) {
  const { addContextPhoto } = usePsychStore();
  const [mode, setMode] = useState<'selection' | 'camera' | 'preview'>('selection');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setMode('camera');
      }
    } catch (err) {
      toast.error('Camera access denied. Please use upload mode.');
    }
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(videoRef.current, 0, 0);
      const dataUrl = canvas.toDataURL('image/webp');
      
      // Stop camera
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      
      setPreviewUrl(dataUrl);
      setMode('preview');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
        setMode('preview');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFinalize = () => {
    if (previewUrl) {
      addContextPhoto(previewUrl, note);
      toast.success('Environmental Audit Snapshot committed to the timeline.');
      onComplete?.();
    }
  };

  return (
    <div className="space-y-8 py-8 px-4">
      <div className="text-center mb-8">
        <h3 className="font-mono text-2xl font-black text-white uppercase italic">System Context Capture</h3>
        <p className="font-mono text-[10px] text-white/40 uppercase tracking-[0.2em] mt-2">Document your physical reality. No filter. No lies.</p>
      </div>

      <div className="max-w-xl mx-auto">
        {mode === 'selection' && (
          <div className="grid grid-cols-2 gap-6">
            <button 
              onClick={startCamera}
              className="group p-10 bg-white/5 border border-white/10 rounded-[32px] hover:border-[var(--stat-mind)] transition-all flex flex-col items-center gap-4"
            >
              <div className="h-16 w-16 rounded-2xl bg-[var(--stat-mind)]/10 flex items-center justify-center text-[var(--stat-mind)] group-hover:scale-110 transition-transform">
                <Camera size={32} />
              </div>
              <span className="font-mono text-[10px] uppercase font-black tracking-widest text-white/60 group-hover:text-white">Active Lens</span>
            </button>
            <label className="cursor-pointer group p-10 bg-white/5 border border-white/10 rounded-[32px] hover:border-[var(--stat-mind)] transition-all flex flex-col items-center gap-4 text-center">
              <div className="h-16 w-16 rounded-2xl bg-white/10 flex items-center justify-center text-white/40 group-hover:scale-110 transition-transform">
                <Upload size={32} />
              </div>
              <span className="font-mono text-[10px] uppercase font-black tracking-widest text-white/60 group-hover:text-white">External Feed</span>
              <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
            </label>
          </div>
        )}

        {mode === 'camera' && (
          <div className="relative rounded-[40px] overflow-hidden border border-white/10 bg-black aspect-square max-w-sm mx-auto shadow-2xl">
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              className="w-full h-full object-cover scale-x-[-1]"
            />
            <div className="absolute inset-0 flex items-end justify-center p-8 bg-gradient-to-t from-black/60 to-transparent">
              <button 
                onClick={capturePhoto}
                className="h-16 w-16 rounded-full bg-white flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-all text-black"
              >
                <div className="h-12 w-12 rounded-full border-2 border-black" />
              </button>
            </div>
            <button 
              onClick={() => setMode('selection')}
              className="absolute top-4 left-4 p-3 bg-black/40 backdrop-blur-md rounded-full text-white/60 hover:text-white transition-all"
            >
              <X size={20} />
            </button>
          </div>
        )}

        {mode === 'preview' && previewUrl && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-8"
          >
            <div className="relative rounded-[40px] overflow-hidden border border-white/10 shadow-2xl max-w-sm mx-auto aspect-square">
              <img src={previewUrl} alt="Audit Context" className="w-full h-full object-cover" />
              <div className="absolute top-0 right-0 p-4">
                 <div className="p-3 bg-black/40 backdrop-blur-md rounded-full text-white/60 font-mono text-[8px] uppercase tracking-widest flex items-center gap-2">
                    <Eye size={12} /> Visual Recorded
                 </div>
              </div>
            </div>

            <div className="space-y-4">
              <label className="block font-mono text-[8px] text-white/30 uppercase tracking-[0.3em]">Snapshot Memo (Optional)</label>
              <textarea 
                value={note}
                onChange={e => setNote(e.target.value)}
                placeholder="Environment state: Decluttered workspace, ready for high-output week..."
                className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 text-white font-mono text-sm leading-relaxed outline-none focus:border-white/20 h-24 resize-none"
              />
            </div>

            <div className="flex gap-4">
              <button 
                onClick={() => setMode('selection')}
                className="flex-1 py-4 bg-white/5 border border-white/10 rounded-2xl font-mono text-[10px] uppercase font-black tracking-widest text-white/40 hover:text-white transition-all flex items-center justify-center gap-2"
              >
                <RefreshCw size={14} /> Recalibrate
              </button>
              <button 
                onClick={handleFinalize}
                className="flex-1 py-4 bg-white text-black rounded-2xl font-mono text-[10px] uppercase font-black tracking-widest hover:brightness-90 transition-all flex items-center justify-center gap-2"
              >
                <Check size={14} /> Commit Context
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
