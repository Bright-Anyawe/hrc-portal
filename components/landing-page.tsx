"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  ArrowRight,
  Bell,
  Briefcase,
  Building2,
  CheckCircle2,
  FileText,
  FolderKanban,
  Lock,
  Menu,
  ShieldCheck,
  Sparkles,
  Users,
  X,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { CinematicBackdrop } from "@/components/landing/cinematic-backdrop";
import { Reveal } from "@/components/landing/reveal";
import { cn } from "@/lib/utils";

const NAV_SECTIONS = [
  { id: "services", label: "Services" },
  { id: "how-it-works", label: "How it works" },
  { id: "about", label: "About" },
];

const services = [
  {
    title: "Client Portal",
    tagline: "For clients and partners",
    description:
      "Track your projects in real time, download shared documents, submit requests and view invoices — all in one place.",
    icon: FolderKanban,
    features: [
      { icon: FolderKanban, text: "Live project progress" },
      { icon: FileText, text: "Document downloads" },
      { icon: Bell, text: "Status & new-document alerts" },
      { icon: Lock, text: "Secure, private workspace" },
    ],
    accent: "from-brand-sky to-brand-navy",
    tint: "bg-brand-sky/10 text-brand-sky",
  },
  {
    title: "Consultant Portal",
    tagline: "For HRC consultants",
    description:
      "Manage your assigned clients, update project statuses, tick off tasks and share deliverables with your clients.",
    icon: Users,
    features: [
      { icon: Users, text: "Assigned client list" },
      { icon: CheckCircle2, text: "Task & milestone tracking" },
      { icon: FileText, text: "Document uploads (10 MB)" },
      { icon: Bell, text: "Client request alerts" },
    ],
    accent: "from-brand-red to-brand-navy",
    tint: "bg-brand-red/10 text-brand-red",
  },
  {
    title: "Admin Portal",
    tagline: "For HRC management",
    description:
      "Invite consultants, onboard clients, assign engagements, create projects and review a full audit trail.",
    icon: Briefcase,
    features: [
      { icon: Briefcase, text: "Staff & client management" },
      { icon: Building2, text: "Consultant-to-client assignments" },
      { icon: FolderKanban, text: "Project & invoice oversight" },
      { icon: ShieldCheck, text: "Immutable audit log" },
    ],
    accent: "from-brand-gold to-brand-navy",
    tint: "bg-brand-gold/10 text-brand-gold",
  },
];

const steps = [
  {
    number: "01",
    title: "Sign in",
    description:
      "Use the credentials emailed to you by HRC, or continue with Google.",
  },
  {
    number: "02",
    title: "Explore your workspace",
    description:
      "Land on the dashboard for your role — client, consultant or administrator.",
  },
  {
    number: "03",
    title: "Collaborate",
    description:
      "Track projects, share documents and stay updated on every change.",
  },
  {
    number: "04",
    title: "Get notified",
    description:
      "Receive alerts for status changes, new documents and client requests.",
  },
];

function useScrolled(threshold = 12) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > threshold);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold]);
  return scrolled;
}

function useScrollProgress() {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const max = document.documentElement.scrollHeight - window.innerHeight;
        setProgress(max > 0 ? Math.min(window.scrollY / max, 1) : 0);
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);
  return progress;
}

function useActiveSection() {
  const [active, setActive] = useState("");
  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id);
        });
      },
      { rootMargin: "0px 0px -55% 0px", threshold: 0 }
    );
    NAV_SECTIONS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
  }, []);
  return active;
}

function CtaLink({
  href,
  variant = "primary",
  children,
  className,
}: {
  href: string;
  variant?: "primary" | "glass";
  children: ReactNode;
  className?: string;
}) {
  const base = buttonVariants({ size: "lg" });
  const styles =
    variant === "primary"
      ? "bg-brand-red text-white shadow-lg shadow-brand-red/25 hover:shadow-xl hover:shadow-brand-red/40 hover:brightness-[1.06] hover:-translate-y-0.5 active:translate-y-0"
      : "border border-white/35 bg-white/10 text-white backdrop-blur hover:bg-white/20 hover:-translate-y-0.5 active:translate-y-0";
  return (
    <a href={href} className={cn(base, styles, className)}>
      {children}
    </a>
  );
}

export function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const scrolled = useScrolled();
  const progress = useScrollProgress();
  const active = useActiveSection();
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  const linkClass = scrolled
    ? "text-muted-foreground hover:text-brand-navy"
    : "text-white/70 hover:text-white";

  return (
    <div className="flex min-h-screen flex-col bg-white">
      {/* Scroll progress indicator */}
      <div className="fixed inset-x-0 top-0 z-[60] h-1 origin-left bg-gradient-to-r from-brand-red via-brand-navy to-brand-sky" style={{ transform: `scaleX(${progress})` }} />

      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-all duration-300",
          scrolled
            ? "border-b border-border/60 bg-white/85 backdrop-blur-xl shadow-sm"
            : "border-b border-transparent bg-transparent"
        )}
      >
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-2 px-4 md:px-6">
          <a href="#top" className="flex items-center gap-3" aria-label="HRC Portal home">
            <Image
              src="/images/HRC-logo - Copy.png"
              alt="HRC Portal logo"
              width={38}
              height={38}
              className="h-9 w-9 rounded-lg object-contain"
            />
            <span className="leading-tight">
              <span
                className={cn(
                  "block text-base font-extrabold tracking-tight transition-colors",
                  scrolled ? "text-brand-navy" : "text-white"
                )}
              >
                HRC Portal
              </span>
              <span
                className={cn(
                  "block text-[11px] transition-colors",
                  scrolled ? "text-muted-foreground" : "text-white/60"
                )}
              >
                Hedge Resource Centre
              </span>
            </span>
          </a>

          <nav className="ml-auto hidden items-center gap-7 md:flex" aria-label="Primary">
            {NAV_SECTIONS.map(({ id, label }) => {
              const isActive = active === id;
              return (
                <a
                  key={id}
                  href={`#${id}`}
                  className={cn(
                    "relative text-sm font-medium transition-colors",
                    linkClass,
                    isActive && (scrolled ? "text-brand-navy" : "text-white")
                  )}
                >
                  {label}
                  <span
                    className={cn(
                      "absolute -bottom-1.5 left-0 h-0.5 w-full origin-left rounded-full bg-brand-red transition-transform duration-300",
                      isActive ? "scale-x-100" : "scale-x-0"
                    )}
                  />
                </a>
              );
            })}
          </nav>

          <div className="ml-auto flex items-center gap-2 md:ml-2">
            <button
              type="button"
              onClick={() => setMenuOpen((o) => !o)}
              className={cn(
                "rounded-md p-2 transition-colors hover:bg-white/10 md:hidden",
                scrolled ? "text-brand-navy" : "text-white"
              )}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <CtaLink href="/login" className="h-10 px-4 text-sm">
              Sign in
              <ArrowRight className="h-4 w-4" />
            </CtaLink>
          </div>
        </div>

        {menuOpen && (
          <div className="animate-slide-down border-t bg-white md:hidden" ref={menuRef}>
            <nav className="flex flex-col gap-1 px-4 py-3" aria-label="Mobile">
              {NAV_SECTIONS.map(({ id, label }) => (
                <a
                  key={id}
                  href={`#${id}`}
                  onClick={() => setMenuOpen(false)}
                  className={cn(
                    "rounded-md px-3 py-2.5 text-sm font-medium transition-colors hover:bg-muted",
                    active === id ? "text-brand-navy" : "text-muted-foreground"
                  )}
                >
                  {label}
                </a>
              ))}
            </nav>
          </div>
        )}
      </header>

      <section id="top" className="relative grid min-h-[92vh] overflow-hidden text-white">
        <CinematicBackdrop />
        <div className="relative z-10 mx-auto grid w-full max-w-6xl gap-12 px-4 pb-24 pt-32 md:px-6 lg:grid-cols-[1.15fr_1fr] lg:items-center">
          <div className="space-y-6">
            <Reveal variant="fade-down" duration={600}>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3.5 py-1.5 text-xs font-semibold tracking-wide text-white backdrop-blur">
                <ShieldCheck className="h-3.5 w-3.5 text-brand-sky" />
                Welcome to the HRC Portal
              </span>
            </Reveal>
            <Reveal variant="blur" delay={90}>
              <h1 className="text-4xl font-extrabold leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl">
                Your projects,{" "}
                <span className="text-gradient">documents</span> and{" "}
                <span className="text-gradient-gold">collaboration</span> — in
                one secure portal
              </h1>
            </Reveal>
            <Reveal variant="fade-up" delay={180}>
              <p className="max-w-xl text-lg leading-relaxed text-white/80">
                Hedge Resource Centre&apos;s client &amp; staff portal brings
                clients, consultants and management together. Track projects,
                share files, manage engagements and stay notified.
              </p>
            </Reveal>
            <Reveal variant="fade-up" delay={280}>
              <div className="flex flex-wrap items-center gap-3">
                <CtaLink href="/login" variant="primary">
                  Sign in to your portal
                  <ArrowRight className="h-4 w-4" />
                </CtaLink>
                <CtaLink href="#services" variant="glass">
                  Explore services
                </CtaLink>
              </div>
            </Reveal>

            <Reveal variant="fade-up" delay={380}>
              <div className="grid max-w-lg grid-cols-3 gap-4 pt-4">
                {[
                  { value: "3", label: "Audiences" },
                  { value: "1", label: "Secure portal" },
                  { value: "24/7", label: "Access" },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-xl border border-white/15 bg-white/5 px-4 py-3.5 text-center backdrop-blur transition-colors hover:bg-white/10"
                  >
                    <p className="text-2xl font-bold text-white">{stat.value}</p>
                    <p className="text-xs text-white/70">{stat.label}</p>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>

          <Reveal variant="fade-left" delay={360} className="relative hidden lg:block">
            <div className="animate-bob relative">
              <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-white/15 to-transparent blur-2xl" />
              <div className="relative rounded-3xl border border-white/25 bg-white/[0.97] p-6 text-brand-navy shadow-2xl backdrop-blur">
                <div className="mb-5 flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-sky/15 text-brand-sky">
                    <Briefcase className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold">Active engagement</p>
                    <p className="text-xs text-muted-foreground">
                      Hedge Fund Risk Dashboard
                    </p>
                  </div>
                  <span className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-brand-sky/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-brand-sky">
                    <span className="h-1.5 w-1.5 rounded-full bg-brand-sky animate-pulse-soft" />
                    Live
                  </span>
                </div>
                <div className="space-y-4">
                  {[
                    { label: "Data feeds", done: true },
                    { label: "Risk exposure charts", done: false },
                    { label: "Client review session", done: false },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center gap-3">
                      <span
                        className={cn(
                          "flex h-5 w-5 shrink-0 items-center justify-center rounded-full",
                          item.done
                            ? "bg-brand-sky text-white"
                            : "border-2 border-muted"
                        )}
                      >
                        {item.done && <CheckCircle2 className="h-3.5 w-3.5" />}
                      </span>
                      <span className={cn("text-sm", item.done ? "" : "text-muted-foreground")}>
                        {item.label}
                      </span>
                      <span className="ml-auto text-[10px] font-semibold uppercase tracking-wide text-brand-gold">
                        {item.done ? "Done" : "Pending"}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="mt-5 border-t pt-4">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Overall progress</span>
                    <span className="font-semibold text-brand-navy">33%</span>
                  </div>
                  <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div className="h-full w-1/3 animate-gradient-hop rounded-full bg-gradient-to-r from-brand-sky to-brand-navy" />
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section id="services" className="relative scroll-mt-20 py-16 md:py-24">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <Reveal className="mb-12 max-w-2xl">
            <p className="mb-2 inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-brand-red">
              <Sparkles className="h-4 w-4" />
              Quick access
            </p>
            <h2 className="text-3xl font-extrabold tracking-tight text-brand-navy md:text-4xl">
              One portal for every audience
            </h2>
            <p className="mt-3 text-muted-foreground">
              Sign in with your role-specific account to reach the workspace
              built for you.
            </p>
          </Reveal>

          <div className="grid gap-6 md:grid-cols-3">
            {services.map((service, i) => (
              <Reveal key={service.title} variant="fade-up" delay={i * 110}>
                <div className="group sheen card-interactive flex h-full flex-col overflow-hidden rounded-2xl border bg-card shadow-card">
                  <div className={cn("h-1.5 w-full bg-gradient-to-r", service.accent)} />
                  <div className="flex flex-1 flex-col p-6">
                    <div className="mb-4 flex items-center gap-3">
                      <span className={cn("flex h-11 w-11 items-center justify-center rounded-xl", service.tint)}>
                        <service.icon className="h-5 w-5" />
                      </span>
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        {service.tagline}
                      </p>
                    </div>
                    <h3 className="text-xl font-bold tracking-tight text-brand-navy">
                      {service.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {service.description}
                    </p>
                    <ul className="mt-5 space-y-2.5">
                      {service.features.map((feature) => (
                        <li key={feature.text} className="flex items-center gap-2.5 text-sm">
                          <feature.icon className="h-4 w-4 shrink-0 text-brand-sky" />
                          {feature.text}
                        </li>
                      ))}
                    </ul>
                    <a
                      href="/login"
                      className={cn(
                        "mt-auto inline-flex items-center gap-1.5 pt-6 text-sm font-semibold transition-colors hover:underline",
                        service.title === "Admin Portal"
                          ? "text-brand-gold"
                          : "text-brand-red"
                      )}
                    >
                      Sign in
                      <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                    </a>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section
        id="how-it-works"
        className="relative scroll-mt-20 overflow-hidden bg-gradient-to-b from-muted/60 to-white py-16 md:py-24"
      >
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <Reveal className="mb-12 max-w-2xl">
            <p className="mb-2 text-sm font-bold uppercase tracking-wider text-brand-red">
              How it works
            </p>
            <h2 className="text-3xl font-extrabold tracking-tight text-brand-navy md:text-4xl">
              Get started in minutes
            </h2>
          </Reveal>

          <div className="grid gap-6 md:grid-cols-4">
            {steps.map((step, i) => (
              <Reveal
                key={step.number}
                variant="fade-up"
                delay={i * 120}
                className="relative"
              >
                <div className="group card-interactive relative h-full rounded-2xl border bg-card p-6 shadow-card">
                  <span className="text-3xl font-extrabold text-brand-sky/30 transition-colors duration-300 group-hover:text-brand-sky/60">
                    {step.number}
                  </span>
                  <h3 className="mt-2 font-bold text-brand-navy">{step.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                    {step.description}
                  </p>
                  {i < steps.length - 1 && (
                    <ArrowRight className="absolute -right-4 top-1/2 hidden h-4 w-4 -translate-y-1/2 text-brand-sky md:block" />
                  )}
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal variant="scale" delay={120} className="mt-12">
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-brand-navy via-brand-navy-light to-brand-sky px-6 py-10 text-center text-white md:flex md:flex-row md:justify-between md:text-left">
              <div className="bg-hero-grid pointer-events-none absolute inset-0 opacity-40" />
              <div className="relative">
                <h3 className="text-2xl font-bold">Ready to get started?</h3>
                <p className="mt-1 text-white/80">
                  Sign in with the credentials provided by Hedge Resource Centre.
                </p>
              </div>
              <CtaLink href="/login" variant="primary" className="mt-6 md:mt-0">
                Sign in now
                <ArrowRight className="h-4 w-4" />
              </CtaLink>
            </div>
          </Reveal>
        </div>
      </section>

      <footer id="about" className="relative scroll-mt-20 overflow-hidden border-t bg-brand-navy text-white">
        <div className="bg-gradient-to-b from-brand-navy-light/40 to-transparent absolute inset-0" />
        <div className="relative mx-auto max-w-6xl px-4 py-14 md:px-6">
          <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
            <Reveal className="max-w-sm space-y-3" variant="fade-right">
              <div className="flex items-center gap-3">
                <Image
                  src="/images/HRC-logo - Copy.png"
                  alt="HRC Portal logo"
                  width={36}
                  height={36}
                  className="h-9 w-9 rounded-lg bg-white/90 object-contain"
                />
                <div>
                  <p className="font-bold">HRC Portal</p>
                  <p className="text-xs text-white/60">Hedge Resource Centre</p>
                </div>
              </div>
              <p className="text-sm leading-relaxed text-white/70">
                A secure multi-tenant portal connecting HRC management,
                consultants and clients through shared projects, documents and
                invoicing.
              </p>
            </Reveal>

            <Reveal variant="fade-left" delay={120}>
              <div className="grid grid-cols-2 gap-10 text-sm sm:grid-cols-3">
                <div className="space-y-2.5">
                  <p className="font-semibold text-white/90">Portal</p>
                  <a href="/login" className="block text-white/60 transition-colors hover:text-white">
                    Sign in
                  </a>
                  <a href="#services" className="block text-white/60 transition-colors hover:text-white">
                    Services
                  </a>
                  <a href="#how-it-works" className="block text-white/60 transition-colors hover:text-white">
                    How it works
                  </a>
                </div>
                <div className="space-y-2.5">
                  <p className="font-semibold text-white/90">Support</p>
                  <a
                    href="mailto:support@hrc.com"
                    className="block text-white/60 transition-colors hover:text-white"
                  >
                    support@hrc.com
                  </a>
                  <a href="/login" className="block text-white/60 transition-colors hover:text-white">
                    Account help
                  </a>
                </div>
                <div className="space-y-2.5">
                  <p className="font-semibold text-white/90">Legal</p>
                  <span className="block cursor-default text-white/60">Privacy policy</span>
                  <span className="block cursor-default text-white/60">Terms of service</span>
                </div>
              </div>
            </Reveal>
          </div>

          <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 text-xs text-white/50 md:flex-row">
            <p>&copy; {new Date().getFullYear()} Hedge Resource Centre. All rights reserved.</p>
            <p className="flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5" />
              Secure portal · JWT-authenticated sessions
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
