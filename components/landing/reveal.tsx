"use client";

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ElementType,
  type ReactNode,
} from "react";
import { cn } from "@/lib/utils";

export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => setReduced(mq.matches);
    onChange();
    mq.addEventListener?.("change", onChange);
    return () => mq.removeEventListener?.("change", onChange);
  }, []);
  return reduced;
}

export function useInView<T extends HTMLElement>(options?: {
  threshold?: number;
  rootMargin?: string;
  once?: boolean;
}) {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);
  const { threshold = 0.15, rootMargin = "0px 0px -70px 0px", once = true } =
    options ?? {};

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setInView(true);
            if (once) obs.unobserve(entry.target);
          } else if (!once) {
            setInView(false);
          }
        });
      },
      { threshold, rootMargin }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold, rootMargin, once]);

  return { ref, inView };
}

const VARIANTS = {
  "fade-up": {
    hidden: "translate3d(0, 24px, 0)",
    shown: "translate3d(0, 0, 0)",
    blur: false,
  },
  "fade-down": {
    hidden: "translate3d(0, -24px, 0)",
    shown: "translate3d(0, 0, 0)",
    blur: false,
  },
  "fade-left": {
    hidden: "translate3d(28px, 0, 0)",
    shown: "translate3d(0, 0, 0)",
    blur: false,
  },
  "fade-right": {
    hidden: "translate3d(-28px, 0, 0)",
    shown: "translate3d(0, 0, 0)",
    blur: false,
  },
  scale: {
    hidden: "scale(0.94)",
    shown: "scale(1)",
    blur: false,
  },
  zoom: {
    hidden: "scale(0.9)",
    shown: "scale(1)",
    blur: false,
  },
  fade: {
    hidden: "none",
    shown: "none",
    blur: false,
  },
  blur: {
    hidden: "translate3d(0, 18px, 0)",
    shown: "translate3d(0, 0, 0)",
    blur: true,
  },
} as const;

export type RevealVariant = keyof typeof VARIANTS;

export function Reveal({
  children,
  className,
  style,
  as = "div",
  variant = "fade-up",
  delay = 0,
  duration = 650,
  threshold,
  rootMargin,
  once = true,
}: {
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
  as?: ElementType;
  variant?: RevealVariant;
  delay?: number;
  duration?: number;
  threshold?: number;
  rootMargin?: string;
  once?: boolean;
}) {
  const reduced = useReducedMotion();
  const { ref, inView } = useInView<HTMLElement>({ threshold, rootMargin, once });
  const Tag = (as || "div") as ElementType;
  const v = VARIANTS[variant];
  const shown = inView || reduced;

  const transition = reduced
    ? "none"
    : [
        `opacity ${duration}ms cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms`,
        `transform ${duration}ms cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms`,
        v.blur
          ? `filter ${duration}ms cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms`
          : "",
      ]
        .filter(Boolean)
        .join(", ");

  return (
    <Tag
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ref={ref as any}
      className={cn(className)}
      style={{
        ...style,
        opacity: shown ? 1 : 0,
        transform: shown ? v.shown : v.hidden,
        filter: v.blur ? (shown ? "blur(0)" : "blur(8px)") : undefined,
        transition,
        willChange: shown ? undefined : "opacity, transform",
      }}
    >
      {children}
    </Tag>
  );
}
