"use client";

import { useEffect, useRef } from "react";

const SEA = "#0f1518";
const LINES = 18;
const STEP = 6;
const FRAME_MS = 1000 / 30;

function wave(alpha: number) {
  return `rgb(206 220 216 / ${alpha.toFixed(3)})`;
}

// Draws the sea below the element with id `horizonId`: slow wave lines in
// perspective, brighter along a path of moonlight. Purely decorative.
export function Sea({ horizonId }: { horizonId: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const parent = canvas?.parentElement;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !parent || !ctx) return;

    const motion = window.matchMedia("(prefers-reduced-motion: no-preference)");
    let width = 0;
    let height = 0;
    let raf = 0;
    let last = 0;
    let time = Math.random() * 100;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = parent.clientWidth;
      height = parent.clientHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const horizonY = () => {
      const anchor = document.getElementById(horizonId);
      if (!anchor) return height * 0.55;
      const a = anchor.getBoundingClientRect();
      return a.top - parent.getBoundingClientRect().top;
    };

    const draw = () => {
      const horizon = horizonY();
      const depth = height - horizon;
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = SEA;
      ctx.fillRect(0, horizon, width, depth);
      ctx.lineWidth = 1;

      const glint = 0.7;

      // A small moon above the light path, where there's room for it.
      if (width >= 640 && horizon > 160) {
        const mx = width * glint;
        const my = horizon * 0.34;
        const halo = ctx.createRadialGradient(mx, my, 0, mx, my, 64);
        halo.addColorStop(0, "rgb(236 230 218 / 0.06)");
        halo.addColorStop(1, "rgb(236 230 218 / 0)");
        ctx.fillStyle = halo;
        ctx.fillRect(mx - 64, my - 64, 128, 128);
        ctx.fillStyle = "rgb(236 230 218 / 0.85)";
        ctx.beginPath();
        ctx.arc(mx, my, 9, 0, Math.PI * 2);
        ctx.fill();
      }

      for (let i = 1; i <= LINES; i++) {
        const p = i / LINES;
        const y0 = horizon + depth * Math.pow(p, 1.65);
        const amp = 0.5 + 8 * p * p;
        const k = 0.011 / (0.3 + p);
        const alpha = 0.04 + 0.11 * p;
        const spread = 0.03 + 0.14 * p;

        const g = ctx.createLinearGradient(0, 0, width, 0);
        g.addColorStop(0, wave(alpha * 0.5));
        g.addColorStop(Math.max(0, glint - spread * 2.5), wave(alpha));
        g.addColorStop(glint, wave(Math.min(alpha * 2.8, 0.42)));
        g.addColorStop(Math.min(1, glint + spread * 2.5), wave(alpha));
        g.addColorStop(1, wave(alpha * 0.6));
        ctx.strokeStyle = g;

        ctx.beginPath();
        for (let x = 0; x <= width + STEP; x += STEP) {
          const y =
            y0 +
            amp *
              (0.62 * Math.sin(x * k + time * (0.5 + p * 0.6) + i * 1.7) +
                0.38 * Math.sin(x * k * 2.3 - time * (0.8 + p * 0.4) + i * 0.9));
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
    };

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      const elapsed = now - last;
      if (elapsed < FRAME_MS) return;
      time += Math.min(elapsed, 100) / 1000 * 0.4;
      last = now;
      draw();
    };

    const start = () => {
      cancelAnimationFrame(raf);
      if (motion.matches && !document.hidden) {
        last = performance.now();
        raf = requestAnimationFrame(frame);
      } else {
        draw();
      }
    };

    resize();
    draw();
    canvas.dataset.ready = "";
    start();

    // The horizon moves whenever the layout around it does.
    const observer = new ResizeObserver(() => {
      resize();
      draw();
    });
    observer.observe(parent);
    for (const child of parent.children) observer.observe(child);
    document.fonts?.ready.then(draw);

    document.addEventListener("visibilitychange", start);
    motion.addEventListener("change", start);
    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
      document.removeEventListener("visibilitychange", start);
      motion.removeEventListener("change", start);
    };
  }, [horizonId]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none absolute inset-0 -z-10 h-full w-full opacity-0 transition-opacity duration-[1600ms] ease-out data-ready:opacity-100"
    />
  );
}
