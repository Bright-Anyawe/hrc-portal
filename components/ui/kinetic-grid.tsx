"use client";

import { useCallback, useEffect, useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface Point { x: number; y: number }
interface Ripple { x: number; y: number; radius: number; opacity: number; born: number }

const CELL_SIZE = 55;
const INFLUENCE_RADIUS = 260;
const MAX_WARP = 24;
const DOT_SPACING = 28;
const LINE_BASE = { r: 255, g: 255, b: 255, a: 0.13 };

function lerp(a: number, b: number, t: number) { return a + (b - a) * t; }

function color(base: typeof LINE_BASE, active: typeof LINE_BASE, t: number) {
  return `rgba(${Math.round(lerp(base.r, active.r, t))},${Math.round(lerp(base.g, active.g, t))},${Math.round(lerp(base.b, active.b, t))},${lerp(base.a, active.a, t).toFixed(3)})`;
}

export default function KineticGrid({
  children,
  className,
  globalColor = "default",
}: {
  children?: ReactNode;
  className?: string;
  globalColor?: "default" | "monochrome";
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef<Point>({ x: -9999, y: -9999 });
  const targetMouseRef = useRef<Point>({ x: -9999, y: -9999 });
  const ripplesRef = useRef<Ripple[]>([]);
  const sizeRef = useRef({ w: 0, h: 0 });
  const frameRef = useRef<number>(0);
  const ambientRef = useRef(0);

  const draw = useCallback((now: number) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const { w, h } = sizeRef.current;
    const mouse = mouseRef.current;
    const ripples = ripplesRef.current;
    const monochrome = globalColor === "monochrome";
    const active = monochrome ? LINE_BASE : { r: 74, g: 158, b: 255, a: 0.9 };
    const glow = monochrome ? "255,255,255" : "74,158,255";
    const ripple = monochrome ? "255,255,255" : "100,180,255";

    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = monochrome ? "#000000" : "#161618";
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = "rgba(255,255,255,0.05)";
    for (let x = DOT_SPACING / 2; x < w; x += DOT_SPACING) {
      for (let y = DOT_SPACING / 2; y < h; y += DOT_SPACING) {
        ctx.beginPath(); ctx.arc(x, y, 0.7, 0, Math.PI * 2); ctx.fill();
      }
    }

    for (let i = ripples.length - 1; i >= 0; i--) {
      const item = ripples[i];
      const age = (now - item.born) / 1000;
      item.radius = age * 400;
      item.opacity = Math.max(0, 1 - age * 1.2);
      if (!item.opacity) ripples.splice(i, 1);
    }

    const cols = Math.max(2, Math.ceil(w / CELL_SIZE)) + 1;
    const rows = Math.max(2, Math.ceil(h / CELL_SIZE)) + 1;
    const points: Point[][] = [];
    const proximities: number[][] = [];
    for (let row = 0; row < rows; row++) {
      points[row] = []; proximities[row] = [];
      for (let col = 0; col < cols; col++) {
        const gx = (col * w) / (cols - 1);
        const gy = (row * h) / (rows - 1);
        const pin = Math.min(col / 1.5, (cols - 1 - col) / 1.5, row / 1.5, (rows - 1 - row) / 1.5, 1);
        const dx = gx - mouse.x; const dy = gy - mouse.y;
        const distance = Math.hypot(dx, dy);
        const proximity = Math.max(0, 1 - distance / INFLUENCE_RADIUS) * pin * pin;
        let rx = 0; let ry = 0;
        for (const wave of ripples) {
          const rdx = gx - wave.x; const rdy = gy - wave.y;
          const rdist = Math.hypot(rdx, rdy); const diff = rdist - wave.radius;
          if (Math.abs(diff) < 55) {
            const strength = (1 - Math.abs(diff) / 55) * wave.opacity * 18 * pin;
            const angle = Math.atan2(rdy, rdx); const sign = diff < 0 ? -1 : 1;
            rx -= Math.cos(angle) * strength * sign; ry -= Math.sin(angle) * strength * sign;
          }
        }
        const t = distance / INFLUENCE_RADIUS;
        const eased = t < 0.01 ? 0 : (1 - t) ** 2 * Math.min(1, distance / 60);
        const warp = eased * MAX_WARP * pin;
        const angle = Math.atan2(dy, dx);
        points[row][col] = distance < INFLUENCE_RADIUS && distance > 0
          ? { x: gx - Math.cos(angle) * warp + rx, y: gy - Math.sin(angle) * warp + ry }
          : { x: gx + rx, y: gy + ry };
        proximities[row][col] = proximity;
      }
    }

    const segment = (a: Point, b: Point, pa: number, pb: number) => {
      const t = ((pa + pb) / 2) ** 2 * (3 - 2 * ((pa + pb) / 2));
      ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
      ctx.strokeStyle = color(LINE_BASE, active, t); ctx.lineWidth = lerp(0.8, 1.5, t); ctx.stroke();
    };
    ctx.lineCap = "butt";
    for (let row = 0; row < rows; row++) for (let col = 0; col < cols - 1; col++) segment(points[row][col], points[row][col + 1], proximities[row][col], proximities[row][col + 1]);
    for (let col = 0; col < cols; col++) for (let row = 0; row < rows - 1; row++) segment(points[row][col], points[row + 1][col], proximities[row][col], proximities[row + 1][col]);
    for (let row = 0; row < rows; row++) for (let col = 0; col < cols; col++) {
      const point = points[row][col]; const t0 = proximities[row][col];
      const t = t0 ** 2 * (3 - 2 * t0); const radius = lerp(1.8, 3.2, t);
      if (t > 0.3) {
        const glowRadius = radius + lerp(0, 6, (t - 0.3) / 0.7);
        const gradient = ctx.createRadialGradient(point.x, point.y, radius * 0.5, point.x, point.y, glowRadius);
        gradient.addColorStop(0, `rgba(${glow},${(t * 0.3).toFixed(3)})`); gradient.addColorStop(1, `rgba(${glow},0)`);
        ctx.beginPath(); ctx.arc(point.x, point.y, glowRadius, 0, Math.PI * 2); ctx.fillStyle = gradient; ctx.fill();
      }
      ctx.beginPath(); ctx.arc(point.x, point.y, radius, 0, Math.PI * 2);
      ctx.fillStyle = color({ r: 255, g: 255, b: 255, a: 0.2 }, monochrome ? LINE_BASE : { r: 74, g: 158, b: 255, a: 1 }, t); ctx.fill();
    }
    for (const wave of ripples) { ctx.beginPath(); ctx.arc(wave.x, wave.y, Math.max(0, wave.radius), 0, Math.PI * 2); ctx.strokeStyle = `rgba(${ripple},${(wave.opacity * 0.28).toFixed(3)})`; ctx.lineWidth = 1.5; ctx.stroke(); }
  }, [globalColor]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const resize = () => {
      const rect = container.getBoundingClientRect(); const dpr = window.devicePixelRatio || 1;
      sizeRef.current = { w: rect.width, h: rect.height }; canvas.width = rect.width * dpr; canvas.height = rect.height * dpr;
      canvas.getContext("2d")?.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    const move = (event: PointerEvent) => { const rect = container.getBoundingClientRect(); targetMouseRef.current = { x: event.clientX - rect.left, y: event.clientY - rect.top }; };
    const leave = () => { targetMouseRef.current = { x: -9999, y: -9999 }; };
    const click = (event: MouseEvent) => { const rect = container.getBoundingClientRect(); ripplesRef.current.push({ x: event.clientX - rect.left, y: event.clientY - rect.top, radius: 0, opacity: 1, born: performance.now() }); };
    const animate = (now: number) => {
      mouseRef.current.x += (targetMouseRef.current.x - mouseRef.current.x) * 0.08;
      mouseRef.current.y += (targetMouseRef.current.y - mouseRef.current.y) * 0.08;
      if (now - ambientRef.current > 2800 && sizeRef.current.w > 0) {
        const phase = now / 2800;
        ripplesRef.current.push({
          x: sizeRef.current.w * (0.25 + ((Math.sin(phase) + 1) / 2) * 0.5),
          y: sizeRef.current.h * (0.3 + ((Math.cos(phase * 0.8) + 1) / 2) * 0.35),
          radius: 0,
          opacity: 0.55,
          born: now,
        });
        ambientRef.current = now;
      }
      draw(now);
      frameRef.current = requestAnimationFrame(animate);
    };
    resize(); const observer = new ResizeObserver(resize); observer.observe(container); container.addEventListener("pointermove", move); container.addEventListener("pointerleave", leave); container.addEventListener("click", click); frameRef.current = requestAnimationFrame(animate);
    return () => { observer.disconnect(); container.removeEventListener("pointermove", move); container.removeEventListener("pointerleave", leave); container.removeEventListener("click", click); cancelAnimationFrame(frameRef.current); };
  }, [draw]);

  return <div ref={containerRef} className={cn("relative overflow-hidden", className)}><canvas ref={canvasRef} aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full" /> <div className="relative">{children}</div></div>;
}
