"use client";

import { useEffect, useRef } from "react";
import { boatBounds, drawBoat } from "./sea-boat";

const SKY_TOP = "#1b1a18";
const SKY_HAZE = "#201f1c";
// Far water takes on the colour of the sky, so there's no hard horizon.
const SEA_HORIZON = "#1e1e1c";
const SEA_FAR = "#141b1f";
const SEA_NEAR = "#0b1013";
const LIGHT = "240 234 222";
// Where the moon and its reflection sit, as a fraction of the width.
const PATH_X = 0.7;
const SWELLS = 11;

type Glint = {
  p: number; // depth, 0 at the horizon and 1 at the bottom of the screen
  offset: number; // distance from the light path, in path half-widths
  size: number;
  phase: number;
  speed: number;
  cycle: number;
};

function gaussian() {
  let u = 0;
  while (!u) u = Math.random();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * Math.random());
}

function place(g: Glint) {
  g.p = Math.pow(Math.random(), 1.35);
  g.offset = gaussian() * 0.85;
  g.size = 0.6 + Math.random() * 0.8;
}

function createGlint(): Glint {
  const g = {
    p: 0,
    offset: 0,
    size: 0,
    phase: Math.random() * Math.PI * 2,
    speed: 0.7 + Math.random() * 1.5,
    cycle: -1,
  };
  place(g);
  return g;
}

function light(alpha: number) {
  return `rgb(${LIGHT} / ${Math.max(0, alpha).toFixed(3)})`;
}

// Draws the night sea below the element with id `horizonId`: slow swells and
// moonlight glinting on the water. Purely decorative.
export function Sea({ horizonId }: { horizonId: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const parent = canvas?.parentElement;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !parent || !ctx) return;

    // Sky, moon, and water don't move, so they're painted once per layout.
    const backdrop = document.createElement("canvas");
    const bctx = backdrop.getContext("2d");
    if (!bctx) return;

    const motion = window.matchMedia("(prefers-reduced-motion: no-preference)");
    let width = 0;
    let height = 0;
    let dpr = 1;
    let horizon = -1;
    let glints: Glint[] = [];
    let boat: { x: number; y: number; p: number; scale: number } | null = null;
    let raf = 0;
    let last = 0;
    let time = 20 + Math.random() * 100;

    const depthY = (p: number) => horizon + (height - horizon) * Math.pow(p, 1.6);
    // Half-width of the path of moonlight; it widens towards the viewer.
    const pathHalfWidth = (p: number) => 4 + p * Math.max(width, 640) * 0.07;

    const swell = (x: number, p: number, seed: number) => {
      const amp = 0.4 + 6 * p * p;
      const k = 0.01 / (0.3 + p);
      return (
        amp *
        (0.6 * Math.sin(x * k + time * (0.35 + 0.4 * p) + seed * 1.7) +
          0.4 * Math.sin(x * k * 2.1 - time * (0.5 + 0.3 * p) + seed * 0.9))
      );
    };

    const paintBackdrop = () => {
      backdrop.width = canvas.width;
      backdrop.height = canvas.height;
      const b = bctx;
      b.setTransform(dpr, 0, 0, dpr, 0, 0);

      const sky = b.createLinearGradient(0, 0, 0, horizon);
      sky.addColorStop(0, SKY_TOP);
      sky.addColorStop(1, SKY_HAZE);
      b.fillStyle = sky;
      b.fillRect(0, 0, width, horizon);

      const sea = b.createLinearGradient(0, horizon, 0, height);
      sea.addColorStop(0, SEA_HORIZON);
      sea.addColorStop(0.22, SEA_FAR);
      sea.addColorStop(1, SEA_NEAR);
      b.fillStyle = sea;
      b.fillRect(0, horizon, width, height - horizon);

      // A thin band of haze that blurs where sea and sky meet.
      const band = 46;
      const mist = b.createLinearGradient(0, horizon - band, 0, horizon + band);
      mist.addColorStop(0, light(0));
      mist.addColorStop(0.5, light(0.018));
      mist.addColorStop(1, light(0));
      b.fillStyle = mist;
      b.fillRect(0, horizon - band, width, band * 2);

      // Haze where the moonlight meets the horizon.
      const mx = width * PATH_X;
      const rx = Math.max(width * 0.28, 220);
      b.save();
      b.translate(mx, horizon);
      b.scale(1, 0.16);
      const haze = b.createRadialGradient(0, 0, 0, 0, 0, rx);
      haze.addColorStop(0, light(0.07));
      haze.addColorStop(0.4, light(0.025));
      haze.addColorStop(1, light(0));
      b.fillStyle = haze;
      b.fillRect(-rx, -rx, rx * 2, rx * 2);
      b.restore();

      // A faint, steady column of reflected light that the glints sparkle on.
      for (let y = Math.ceil(horizon); y < height; y += 2) {
        const p = Math.pow((y - horizon) / (height - horizon), 1 / 1.6);
        const hw = pathHalfWidth(p) * 1.6;
        const column = b.createLinearGradient(mx - hw, 0, mx + hw, 0);
        const a = 0.045 * (1 - 0.55 * p);
        column.addColorStop(0, light(0));
        column.addColorStop(0.5, light(a));
        column.addColorStop(1, light(0));
        b.fillStyle = column;
        b.fillRect(mx - hw, y, hw * 2, 2);
      }

      // The moon, where there's room for it beside the text.
      if (width >= 640 && horizon > 180) {
        const my = horizon * 0.34;
        const glow = b.createRadialGradient(mx, my, 0, mx, my, 120);
        glow.addColorStop(0, light(0.1));
        glow.addColorStop(0.07, light(0.07));
        glow.addColorStop(0.2, light(0.028));
        glow.addColorStop(0.5, light(0.008));
        glow.addColorStop(1, light(0));
        b.fillStyle = glow;
        b.fillRect(mx - 120, my - 120, 240, 240);

        const disc = b.createRadialGradient(mx - 2, my - 2, 0, mx, my, 7.5);
        disc.addColorStop(0, light(0.98));
        disc.addColorStop(1, light(0.82));
        b.fillStyle = disc;
        b.beginPath();
        b.arc(mx, my, 7.5, 0, Math.PI * 2);
        b.fill();
      }
    };

    // The boat sits on the light path in the open water below the projects,
    // and only where it won't touch anything marked data-sea-avoid.
    const placeBoat = () => {
      boat = null;
      const rail = document.getElementById(horizonId)?.parentElement;
      if (!rail || width < 900) return;

      const origin = parent.getBoundingClientRect().top;
      const railBottom = rail.getBoundingClientRect().bottom - origin;
      const scale = Math.min(Math.max(width / 1440, 0.8), 1.15);
      const x = width * (PATH_X + 0.12);
      const rise = -boatBounds(0, 0, scale).top;
      const free = height - railBottom - rise - 24;
      if (free < 24) return;

      const y = railBottom + 12 + rise + free * 0.15;
      const b = boatBounds(x, y, scale);
      for (const el of document.querySelectorAll("[data-sea-avoid]")) {
        const r = el.getBoundingClientRect();
        if (
          r.left - 32 < b.right &&
          r.right + 32 > b.left &&
          r.top - origin - 16 < b.bottom &&
          r.bottom - origin + 16 > b.top
        ) {
          return;
        }
      }
      const p = Math.pow((y - horizon) / (height - horizon), 1 / 1.6);
      boat = { x, y, p, scale };
    };

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = parent.clientWidth;
      height = parent.clientHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      const count = Math.round(Math.min(Math.max(width * 0.24, 110), 380));
      glints = Array.from({ length: count }, createGlint);
      horizon = -1;
    };

    const draw = () => {
      const anchor = document.getElementById(horizonId);
      const top = anchor
        ? anchor.getBoundingClientRect().top - parent.getBoundingClientRect().top
        : height * 0.55;
      if (Math.abs(top - horizon) > 0.5) {
        horizon = top;
        paintBackdrop();
        placeBoat();
      }

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.drawImage(backdrop, 0, 0);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const mx = width * PATH_X;
      const hair = dpr >= 2 ? 0.75 : 1;

      // Swells: brightest along the light path, almost gone at the edges.
      ctx.lineWidth = hair;
      for (let i = 1; i <= SWELLS; i++) {
        const p = i / (SWELLS + 1);
        const y0 = depthY(p);
        const peak = (0.05 + 0.1 * p) * Math.min(1, p * 4);
        const g = ctx.createLinearGradient(0, 0, width, 0);
        g.addColorStop(0, light(peak * 0.12));
        g.addColorStop(Math.max(0, PATH_X - 0.32), light(peak * 0.35));
        g.addColorStop(PATH_X, light(peak));
        g.addColorStop(Math.min(1, PATH_X + 0.24), light(peak * 0.35));
        g.addColorStop(1, light(peak * 0.15));
        ctx.strokeStyle = g;
        ctx.beginPath();
        for (let x = 0; x <= width + 8; x += 8) {
          const y = y0 + swell(x, p, i);
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      // Glints: short flashes of moonlight that reappear somewhere new each time.
      ctx.lineCap = "round";
      for (const g of glints) {
        const s = time * g.speed + g.phase;
        const cycle = Math.floor(s / (Math.PI * 2));
        if (cycle !== g.cycle) {
          if (g.cycle !== -1) place(g);
          g.cycle = cycle;
        }
        const wave = Math.sin(s);
        if (wave <= 0) continue;

        const x = mx + g.offset * pathHalfWidth(g.p);
        const y = depthY(g.p) + swell(x, g.p, g.phase);
        const len = (1 + g.p * g.p * 14) * g.size;
        const nearPath = Math.exp(-g.offset * g.offset * 0.7);

        const distance = Math.min(1, 0.25 + g.p * 5);
        ctx.strokeStyle = light(Math.pow(wave, 4) * (0.1 + 0.6 * nearPath) * distance);
        ctx.lineWidth = g.p > 0.6 ? 1.1 : hair;
        ctx.beginPath();
        ctx.moveTo(x - len / 2, y);
        ctx.lineTo(x + len / 2, y);
        ctx.stroke();
      }

      // The boat rides the same swell as the water around it.
      if (boat) {
        const { x, y, p, scale } = boat;
        const reach = 26 * scale;
        const lift = 0.8 * swell(x, p, 3) + 1.2 * Math.sin(time * 0.8);
        const slope = (swell(x + reach, p, 3) - swell(x - reach, p, 3)) / (2 * reach);
        const roll = 0.9 * Math.atan(slope) + 0.022 * Math.sin(time * 0.65 + 1);
        drawBoat(ctx, { x, y: y + lift, scale, roll, time });
      }
    };

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      time += Math.min(now - last, 100) / 1000;
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
