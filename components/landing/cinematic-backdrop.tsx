"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

type Particle = {
  x: number;
  y: number;
  r: number;
  vx: number;
  vy: number;
  a: number;
  tw: number;
  ph: number;
};

function getMotion(): boolean {
  return typeof window !== "undefined"
    ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
    : false;
}

export function CinematicBackdrop({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const parallaxRef = useRef<HTMLDivElement | null>(null);

  /* Parallax — orbs/grid drift against scroll. rAF-throttled, GPU-friendly. */
  useEffect(() => {
    const wrap = parallaxRef.current;
    if (!wrap) return;
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        if (getMotion()) return;
        const y = -Math.min(Math.max(window.scrollY * 0.14, 0), 120);
        wrap.style.setProperty("--parallax", `${y.toFixed(1)}px`);
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  /* Atmospheric light motes (canvas). Paused when off-screen or tab hidden. */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Reduced motion: leave the canvas empty; the CSS layers stay static.
    if (getMotion()) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let width = 0;
    let height = 0;
    let particles: Particle[] = [];
    let raf = 0;
    let running = false;
    let inView = false;

    const spawn = (): Particle => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: 0.6 + Math.random() * 1.9,
      vx: (Math.random() - 0.5) * 0.12,
      vy: -(0.04 + Math.random() * 0.26),
      a: 0.14 + Math.random() * 0.34,
      tw: 0.5 + Math.random() * 1.6,
      ph: Math.random() * Math.PI * 2,
    });

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      width = parent.clientWidth;
      height = parent.clientHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.min(
        64,
        Math.max(18, Math.floor((width * height) / 26000))
      );
      particles = Array.from({ length: count }, spawn);
    };

    const frame = (now: number) => {
      const t = now / 1000;
      ctx.clearRect(0, 0, width, height);
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.y < -12) {
          p.y = height + 12;
          p.x = Math.random() * width;
        }
        if (p.x < -12) p.x = width + 12;
        if (p.x > width + 12) p.x = -12;
        const twinkle = (Math.sin(t * p.tw + p.ph) + 1) / 2;

        ctx.globalAlpha = p.a * (0.35 + 0.65 * twinkle);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(190, 222, 255, 1)";
        ctx.fill();

        ctx.globalAlpha = p.a * twinkle * 0.35;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * 3.4, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(0, 174, 239, 0.28)";
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      if (running) raf = requestAnimationFrame(frame);
    };

    const start = () => {
      if (!running && inView) {
        running = true;
        raf = requestAnimationFrame(frame);
      }
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };

    const io = new IntersectionObserver(([e]) => {
      inView = e.isIntersecting;
      if (inView && !document.hidden) start();
      else stop();
    }, { threshold: 0 });

    const onVis = () => {
      if (document.hidden) stop();
      else if (inView) start();
    };

    io.observe(canvas);
    document.addEventListener("visibilitychange", onVis);
    window.addEventListener("resize", resize);
    resize();
    start();

    return () => {
      stop();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <div
      aria-hidden
      className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
    >
      {/* Animated gradient base (slow camera-less drift) */}
      <div className="animate-gradient-hop absolute inset-0 bg-[linear-gradient(135deg,#071a33_0%,#123a63_42%,#08203c_78%,#0a2540_100%)]" />

      {/* Parallax layer: aurora + grid */}
      <div
        ref={parallaxRef}
        className="absolute inset-0"
        style={{ transform: "translate3d(0, var(--parallax, 0px), 0)" }}
      >
        <div className="animate-camera-zoom absolute -inset-[14%]">
          <div className="animate-aurora absolute -left-24 -top-40 h-[38rem] w-[38rem] rounded-full bg-[radial-gradient(circle,rgba(0,174,239,0.5),transparent_64%)] opacity-70 blur-[90px]" />
          <div className="animate-aurora-2 absolute -right-28 top-1/4 h-[32rem] w-[32rem] rounded-full bg-[radial-gradient(circle,rgba(218,145,0,0.34),transparent_64%)] opacity-55 blur-[104px]" />
          <div className="animate-aurora absolute -bottom-36 left-1/3 h-[30rem] w-[30rem] rounded-full bg-[radial-gradient(circle,rgba(227,27,35,0.38),transparent_64%)] opacity-50 blur-[110px]" />
        </div>
        <div className="bg-hero-grid absolute inset-0 opacity-50" />
      </div>

      {/* Atmospheric particles */}
      <canvas ref={canvasRef} className="absolute inset-0 opacity-80" />

      {/* Vignette for focus + bottom fade into the light section */}
      <div className="absolute inset-0 bg-[radial-gradient(120%_85%_at_50%_0%,transparent_42%,rgba(3,16,35,0.72)_100%)]" />
      <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-b from-transparent to-white" />
    </div>
  );
}
