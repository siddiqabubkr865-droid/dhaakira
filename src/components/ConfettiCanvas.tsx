import React, { useEffect, useRef } from 'react';

interface ConfettiCanvasProps {
  burstKey: number;
  big: boolean;
}

export const ConfettiCanvas: React.FC<ConfettiCanvasProps> = ({ burstKey, big }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (burstKey === 0) return;
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const cv = canvasRef.current;
    if (!cv) return;
    const ctx = cv.getContext('2d');
    if (!ctx) return;

    cv.width = window.innerWidth;
    cv.height = window.innerHeight;
    const cols = ['#ff5c7a', '#ffb703', '#2fbf71', '#4cc9f0', '#a55eea', '#ff9f43', '#f368e0'];
    const n = big ? 170 : 90;
    const parts = Array.from({ length: n }, (_, i) => ({
      x: cv.width / 2 + (Math.random() - 0.5) * cv.width * 0.5,
      y: cv.height * 0.28 + (Math.random() - 0.5) * 60,
      vx: (Math.random() - 0.5) * 11,
      vy: -(4 + Math.random() * 8),
      w: 5 + Math.random() * 6,
      h: 8 + Math.random() * 8,
      c: cols[i % cols.length],
      rot: Math.random() * Math.PI,
      vr: (Math.random() - 0.5) * 0.3,
      life: 1,
    }));

    let frames = 0;
    let raf = 0;
    const tick = () => {
      ctx.clearRect(0, 0, cv.width, cv.height);
      frames++;
      parts.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.22;
        p.vx *= 0.99;
        p.rot += p.vr;
        if (frames > 55) p.life -= 0.03;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.fillStyle = p.c;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      });
      if (frames < 130) {
        raf = requestAnimationFrame(tick);
      } else {
        ctx.clearRect(0, 0, cv.width, cv.height);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      ctx.clearRect(0, 0, cv.width, cv.height);
    };
  }, [burstKey, big]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[120] h-full w-full"
    />
  );
};
