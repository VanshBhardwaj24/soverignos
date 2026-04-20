import { useRef, useEffect } from 'react';
import { useSovereignStore } from '../../store/sovereign';
import { STATS } from '../../lib/constants';

export const ParticleBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const statLevels = useSovereignStore(state => state.statLevels);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let highestStatId = 'code';
    let maxLevel = 0;
    Object.entries(statLevels).forEach(([id, level]) => {
      if (level > maxLevel) {
        maxLevel = level;
        highestStatId = id;
      }
    });
    
    // Fallback if freedom or custom
    const activeColor = STATS[highestStatId]?.colorVar || 'var(--bg-primary)';

    const setCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    setCanvasSize();
    window.addEventListener('resize', setCanvasSize);

    // Simple particle system
    const particles: {x: number, y: number, speed: number, radius: number, alpha: number}[] = [];
    for (let i = 0; i < 40; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            speed: 0.1 + Math.random() * 0.3,
            radius: Math.random() * 2,
            alpha: Math.random() * 0.5
        });
    }

    let animationFrameId: number;

    const tempEl = document.createElement('div');
    tempEl.style.color = activeColor;
    document.body.appendChild(tempEl);
    const resolvedColor = getComputedStyle(tempEl).color; // rgb format
    document.body.removeChild(tempEl);

    // parse RGB to use alpha
    const rgbMatch = resolvedColor.match(/\d+/g);
    const r = rgbMatch ? rgbMatch[0] : 255;
    const g = rgbMatch ? rgbMatch[1] : 255;
    const b = rgbMatch ? rgbMatch[2] : 255;

    const render = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        particles.forEach(p => {
            p.y -= p.speed;
            if (p.y < 0) {
                p.y = canvas.height;
                p.x = Math.random() * canvas.width;
            }
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${p.alpha * (maxLevel > 0 ? 1 : 0.2)})`;
            ctx.fill();
        });

        animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', setCanvasSize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [statLevels]);

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0 opacity-40 mix-blend-screen" />;
}
