// src/components/hero-graphic.tsx
"use client";

import { useEffect, useRef } from "react";

export function HeroGraphic() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.parentElement?.getBoundingClientRect();
    const w = rect?.width || 600;
    const h = rect?.height || 450;

    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + "px";
    canvas.style.height = h + "px";
    ctx.scale(dpr, dpr);

    let time = 0;

    const draw = () => {
      ctx.clearRect(0, 0, w, h);

      // Background gradient
      const grad = ctx.createRadialGradient(w/2, h/2, 0, w/2, h/2, w/2);
      grad.addColorStop(0, "#0a0a1a");
      grad.addColorStop(1, "#05050f");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // Grid lines (subtle)
      ctx.strokeStyle = "rgba(16,242,140,0.05)";
      ctx.lineWidth = 0.5;
      for (let i = 0; i < w; i += 30) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, h);
        ctx.stroke();
      }
      for (let i = 0; i < h; i += 30) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(w, i);
        ctx.stroke();
      }

      const cx = w/2, cy = h/2;
      const maxR = Math.min(w, h) * 0.38;

      // Outer ring (slow rotation)
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(time * 0.2);
      ctx.beginPath();
      ctx.arc(0, 0, maxR * 0.95, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(16,242,140,0.15)";
      ctx.lineWidth = 2;
      ctx.setLineDash([8, 12]);
      ctx.stroke();
      ctx.restore();

      // Middle ring (counter rotation)
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(-time * 0.3);
      ctx.beginPath();
      ctx.arc(0, 0, maxR * 0.75, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(20,200,245,0.2)";
      ctx.lineWidth = 1.5;
      ctx.setLineDash([6, 16]);
      ctx.stroke();
      ctx.restore();

      // Inner ring
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(time * 0.5);
      ctx.beginPath();
      ctx.arc(0, 0, maxR * 0.5, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(167,139,250,0.25)";
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 20]);
      ctx.stroke();
      ctx.restore();

      // Central CPU / Chip
      const cpuSize = maxR * 0.3;
      const gradCpu = ctx.createRadialGradient(cx, cy, 0, cx, cy, cpuSize);
      gradCpu.addColorStop(0, "#10f28c");
      gradCpu.addColorStop(0.4, "#0d8a5c");
      gradCpu.addColorStop(1, "#0a0a1a");
      ctx.shadowColor = "#10f28c";
      ctx.shadowBlur = 30;
      ctx.beginPath();
      ctx.roundRect(cx - cpuSize/2, cy - cpuSize/2, cpuSize, cpuSize, 12);
      ctx.fillStyle = gradCpu;
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.strokeStyle = "#10f28c";
      ctx.lineWidth = 2;
      ctx.stroke();

      // CPU inner lines
      ctx.strokeStyle = "rgba(255,255,255,0.2)";
      ctx.lineWidth = 1;
      for (let i = 0; i < 4; i++) {
        const angle = time * 0.8 + i * Math.PI/2;
        const x1 = cx + Math.cos(angle) * cpuSize * 0.4;
        const y1 = cy + Math.sin(angle) * cpuSize * 0.4;
        const x2 = cx + Math.cos(angle) * cpuSize * 0.7;
        const y2 = cy + Math.sin(angle) * cpuSize * 0.7;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }

      // Pulsing dots around rings
      const dotCount = 12;
      for (let i = 0; i < dotCount; i++) {
        const angle = (i / dotCount) * Math.PI * 2 + time * 0.3;
        const r = maxR * 0.88 + Math.sin(time * 2 + i) * 6;
        const x = cx + Math.cos(angle) * r;
        const y = cy + Math.sin(angle) * r;
        const size = 3 + Math.sin(time * 3 + i*1.2) * 1.5 + 1.5;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${140 + i * 10}, 80%, 60%, ${0.5 + 0.4 * Math.sin(time * 2 + i)})`;
        ctx.shadowColor = "#10f28c";
        ctx.shadowBlur = 15;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // Floating data particles
      for (let i = 0; i < 16; i++) {
        const seed = i * 137.5;
        const x = (Math.sin(seed + time * 0.2) * 0.5 + 0.5) * w;
        const y = (Math.cos(seed * 1.3 + time * 0.15) * 0.5 + 0.5) * h;
        const size = 1.5 + Math.sin(seed + time) * 0.8 + 0.8;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(16,242,140, ${0.2 + 0.2 * Math.sin(seed + time * 1.5)})`;
        ctx.fill();
      }

      // Hash rate text (bottom)
      ctx.fillStyle = "rgba(16,242,140,0.4)";
      ctx.font = "12px monospace";
      ctx.textAlign = "center";
      ctx.fillText("⚡ 842.5 TH/s", cx, h - 25);

      // Small label
      ctx.fillStyle = "rgba(255,255,255,0.3)";
      ctx.font = "10px sans-serif";
      ctx.fillText("LIVE NETWORK HASH", cx, h - 8);

      time += 0.016;
      requestAnimationFrame(draw);
    };

    draw();

    return () => {
      // cleanup
    };
  }, []);

  return (
    <div className="relative w-full max-w-lg mx-auto aspect-[4/3] rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
      <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  );
}