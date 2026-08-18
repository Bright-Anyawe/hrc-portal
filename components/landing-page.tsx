"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
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
  Users,
  X,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const services = [
  {
    title: "Client Portal",
    tagline: "For clients and partners",
    description:
      "Track your projects in real time, download shared documents, submit requests and view invoices — all in one place.",
    features: [
      { icon: FolderKanban, text: "Live project progress" },
      { icon: FileText, text: "Document downloads" },
      { icon: Bell, text: "Status & new-document alerts" },
      { icon: Lock, text: "Secure, private workspace" },
    ],
    accent: "from-brand-sky to-brand-navy",
  },
  {
    title: "Consultant Portal",
    tagline: "For HRC consultants",
    description:
      "Manage your assigned clients, update project statuses, tick off tasks and share deliverables with your clients.",
    features: [
      { icon: Users, text: "Assigned client list" },
      { icon: CheckCircle2, text: "Task & milestone tracking" },
      { icon: FileText, text: "Document uploads (10 MB)" },
      { icon: Bell, text: "Client request alerts" },
    ],
    accent: "from-brand-red to-brand-navy",
  },
  {
    title: "Admin Portal",
    tagline: "For HRC management",
    description:
      "Invite consultants, onboard clients, assign engagements, create projects and review a full audit trail.",
    features: [
      { icon: Briefcase, text: "Staff & client management" },
      { icon: Building2, text: "Consultant-to-client assignments" },
      { icon: FolderKanban, text: "Project & invoice oversight" },
      { icon: ShieldCheck, text: "Immutable audit log" },
    ],
    accent: "from-brand-gold to-brand-navy",
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

export function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-2 px-4 md:px-6">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/images/HRC-logo - Copy.png"
              alt="HRC Portal logo"
              width={38}
              height={38}
              className="h-9 w-9 object-contain"
            />
            <span className="leading-tight">
              <span className="block text-base font-extrabold tracking-tight text-brand-navy">
                HRC Portal
              </span>
              <span className="block text-[11px] text-muted-foreground">
                Hedge Resource Centre
              </span>
            </span>
          </Link>

          <nav className="ml-auto hidden items-center gap-6 text-sm font-medium text-muted-foreground md:flex">
            <a href="#services" className="hover:text-brand-navy">
              Services
            </a>
            <a href="#about" className="hover:text-brand-navy">
              About
            </a>
            <a href="#how-it-works" className="hover:text-brand-navy">
              How it works
            </a>
          </nav>

          <div className="ml-auto flex items-center gap-2 md:ml-2">
            <button
              type="button"
              onClick={() => setMenuOpen((o) => !o)}
              className="rounded-md p-2 text-brand-navy hover:bg-muted md:hidden"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <a
              href="/login"
              className={cnButton(
                "bg-brand-red text-white shadow-sm hover:bg-brand-red/90"
              )}
            >
              Sign in
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>

        {menuOpen && (
          <div className="border-t bg-white md:hidden">
            <nav className="flex flex-col gap-1 px-4 py-3">
              {[
                { href: "#services", label: "Services" },
                { href: "#about", label: "About" },
                { href: "#how-it-works", label: "How it works" },
              ].map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className="rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-brand-navy"
                >
                  {item.label}
                </a>
              ))}
            </nav>
          </div>
        )}
      </header>

      <section className="relative overflow-hidden bg-gradient-to-br from-brand-sky via-brand-navy-light to-brand-navy text-white">
        <div className="pointer-events-none absolute -left-24 -top-24 h-80 w-80 rounded-full bg-brand-sky/30 blur-3xl" />
        <div className="pointer-events-none absolute -right-16 bottom-0 h-72 w-72 rounded-full bg-brand-red/25 blur-3xl" />

        <div className="relative mx-auto grid max-w-6xl gap-12 px-4 py-20 md:px-6 lg:grid-cols-[1.2fr_1fr] lg:items-center lg:py-28">
          <div className="space-y-6">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3 py-1 text-xs font-semibold tracking-wide text-white backdrop-blur">
              <ShieldCheck className="h-3.5 w-3.5 text-brand-sky" />
              Welcome to the HRC Portal
            </span>
            <h1 className="text-4xl font-extrabold leading-tight tracking-tight md:text-5xl">
              Your projects,{" "}
              <span className="text-brand-sky">documents</span> and{" "}
              <span className="text-brand-sky">collaboration</span> — in one
              secure portal
            </h1>
            <p className="max-w-xl text-lg text-white/85">
              Hedge Resource Centre&apos;s client &amp; staff portal brings
              clients, consultants and management together. Track projects,
              share files, manage engagements and stay notified.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <a
                href="/login"
                className={cnButton(
                  "bg-brand-red text-white shadow-lg hover:bg-brand-red/90"
                )}
              >
                Sign in to your portal
                <ArrowRight className="h-4 w-4" />
              </a>
              <a
                href="#services"
                className={cnButton(
                  "border border-white/40 bg-white/10 text-white backdrop-blur hover:bg-white/20"
                )}
              >
                Explore services
              </a>
            </div>

            <div className="grid max-w-lg grid-cols-3 gap-4 pt-4">
              {[
                { value: "3", label: "Audiences" },
                { value: "1", label: "Secure portal" },
                { value: "24/7", label: "Access" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-center backdrop-blur"
                >
                  <p className="text-xl font-bold text-white">{stat.value}</p>
                  <p className="text-xs text-white/70">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative hidden lg:block">
            <div className="absolute -inset-4 rounded-3xl bg-white/10 blur-2xl" />
            <div className="relative rounded-3xl border border-white/20 bg-white p-6 text-brand-navy shadow-2xl">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-sky/15 text-brand-sky">
                  <Briefcase className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-bold">Active engagement</p>
                  <p className="text-xs text-muted-foreground">
                    Hedge Fund Risk Dashboard
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                {[
                  { label: "Data feeds", done: true },
                  { label: "Risk exposure charts", done: false },
                  { label: "Client review session", done: false },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-3">
                    <span
                      className={`flex h-5 w-5 items-center justify-center rounded-full ${
                        item.done
                          ? "bg-brand-sky text-white"
                          : "border-2 border-muted"
                      }`}
                    >
                      {item.done && <CheckCircle2 className="h-3.5 w-3.5" />}
                    </span>
                    <span
                      className={`text-sm ${
                        item.done ? "" : "text-muted-foreground"
                      }`}
                    >
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
                  <div className="h-full w-1/3 rounded-full bg-gradient-to-r from-brand-sky to-brand-navy" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="services" className="scroll-mt-20 py-16 md:py-24">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <div className="mb-10 max-w-2xl">
            <p className="mb-2 text-sm font-bold uppercase tracking-wider text-brand-red">
              Quick access
            </p>
            <h2 className="text-3xl font-extrabold tracking-tight text-brand-navy md:text-4xl">
              One portal for every audience
            </h2>
            <p className="mt-3 text-muted-foreground">
              Sign in with your role-specific account to reach the workspace
              built for you.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {services.map((service) => (
              <div
                key={service.title}
                className="group flex flex-col overflow-hidden rounded-2xl border bg-white shadow-sm transition-shadow hover:shadow-lg"
              >
                <div
                  className={`h-1.5 w-full bg-gradient-to-r ${service.accent}`}
                />
                <div className="flex flex-1 flex-col p-6">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {service.tagline}
                  </p>
                  <h3 className="mt-1 text-xl font-bold text-brand-navy">
                    {service.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {service.description}
                  </p>
                  <ul className="mt-4 space-y-2.5">
                    {service.features.map((feature) => (
                      <li
                        key={feature.text}
                        className="flex items-center gap-2.5 text-sm"
                      >
                        <feature.icon className="h-4 w-4 shrink-0 text-brand-sky" />
                        {feature.text}
                      </li>
                    ))}
                  </ul>
                  <a
                    href="/login"
                    className={`mt-auto inline-flex items-center gap-1.5 pt-6 text-sm font-semibold text-brand-red hover:underline ${
                      service.title === "Admin Portal" ? "text-brand-gold" : ""
                    }`}
                  >
                    Sign in
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        id="how-it-works"
        className="scroll-mt-20 bg-gradient-to-b from-muted/60 to-white py-16 md:py-24"
      >
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <div className="mb-10 max-w-2xl">
            <p className="mb-2 text-sm font-bold uppercase tracking-wider text-brand-red">
              How it works
            </p>
            <h2 className="text-3xl font-extrabold tracking-tight text-brand-navy md:text-4xl">
              Get started in minutes
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-4">
            {steps.map((step, i) => (
              <div key={step.number} className="relative rounded-2xl border bg-white p-6 shadow-sm">
                <span className="text-3xl font-extrabold text-brand-sky/30">
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
            ))}
          </div>

          <div className="mt-12 flex flex-col items-center gap-3 rounded-2xl bg-gradient-to-r from-brand-sky to-brand-navy px-6 py-10 text-center text-white md:flex-row md:justify-between md:text-left">
            <div>
              <h3 className="text-2xl font-bold">Ready to get started?</h3>
              <p className="mt-1 text-white/80">
                Sign in with the credentials provided by Hedge Resource Centre.
              </p>
            </div>
            <a
              href="/login"
              className={cnButton(
                "bg-brand-red text-white shadow-lg hover:bg-brand-red/90"
              )}
            >
              Sign in now
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </section>

      <footer id="about" className="border-t bg-brand-navy text-white">
        <div className="mx-auto max-w-6xl px-4 py-12 md:px-6">
          <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
            <div className="max-w-sm space-y-3">
              <div className="flex items-center gap-3">
                <Image
                  src="/images/HRC-logo - Copy.png"
                  alt="HRC Portal logo"
                  width={36}
                  height={36}
                  className="h-9 w-9 rounded-lg object-contain bg-white/90"
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
            </div>
            <div className="grid grid-cols-2 gap-10 text-sm sm:grid-cols-3">
              <div className="space-y-2.5">
                <p className="font-semibold text-white/90">Portal</p>
                <a href="/login" className="block text-white/60 hover:text-white">
                  Sign in
                </a>
                <a href="#services" className="block text-white/60 hover:text-white">
                  Services
                </a>
                <a href="#how-it-works" className="block text-white/60 hover:text-white">
                  How it works
                </a>
              </div>
              <div className="space-y-2.5">
                <p className="font-semibold text-white/90">Support</p>
                <a href="mailto:support@hrc.com" className="block text-white/60 hover:text-white">
                  support@hrc.com
                </a>
                <a href="/login" className="block text-white/60 hover:text-white">
                  Account help
                </a>
              </div>
              <div className="space-y-2.5">
                <p className="font-semibold text-white/90">Legal</p>
                <span className="block cursor-default text-white/60">
                  Privacy policy
                </span>
                <span className="block cursor-default text-white/60">
                  Terms of service
                </span>
              </div>
            </div>
          </div>
          <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 text-xs text-white/50 md:flex-row">
            <p>
              &copy; {new Date().getFullYear()} Hedge Resource Centre. All
              rights reserved.
            </p>
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

function cnButton(className: string) {
  return cn(buttonVariants({ size: "lg" }), className);
}
