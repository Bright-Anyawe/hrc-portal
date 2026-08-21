import { cn } from "@/lib/utils";

type HeroTone = "admin" | "consultant" | "client";

const HERO_ACCENTS: Record<
  HeroTone,
  { gradient: string; orb: string; orb2: string }
> = {
  admin: {
    gradient: "from-brand-navy via-brand-navy-light to-brand-sky",
    orb: "bg-brand-sky/30",
    orb2: "bg-brand-red/25",
  },
  consultant: {
    gradient: "from-brand-navy via-brand-navy-light to-brand-sky",
    orb: "bg-brand-sky/25",
    orb2: "bg-brand-sky/20",
  },
  client: {
    gradient: "from-brand-navy via-brand-navy-light to-brand-sky",
    orb: "bg-brand-sky/25",
    orb2: "bg-brand-gold/25",
  },
};

export function PortalHero({
  tone = "admin",
  eyebrow,
  title,
  description,
  actions,
  split = false,
  className,
}: {
  tone?: HeroTone;
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
  split?: boolean;
  className?: string;
}) {
  const accents = HERO_ACCENTS[tone];
  return (
    <section
      className={cn(
        "group relative overflow-hidden rounded-2xl bg-gradient-to-br text-white shadow-lg transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:shadow-xl hover:shadow-brand-navy/20",
        "animate-fade-in-blur",
        "animate-gradient-shift",
        accents.gradient,
        className
      )}
    >
      <div className="bg-hero-grid pointer-events-none absolute inset-0 opacity-90 transition-opacity duration-500 group-hover:opacity-100" />
      <div
        className={cn(
          "animate-hero-float pointer-events-none absolute -right-14 -top-14 h-52 w-52 rounded-full blur-2xl transition-transform duration-700 ease-out group-hover:scale-[1.08]",
          accents.orb
        )}
      />
      <div
        className={cn(
          "animate-hero-float-2 pointer-events-none absolute -bottom-16 left-1/3 h-44 w-44 rounded-full blur-2xl transition-transform duration-700 ease-out group-hover:scale-105",
          accents.orb2
        )}
      />
      {/* subtle sheen sweep on hover */}
      <div className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/[0.07] to-transparent opacity-0 transition-all duration-1000 ease-out group-hover:translate-x-full group-hover:opacity-100" />
      <div
        className={cn(
          "relative flex flex-col gap-4 p-6 md:p-8",
          split && "md:flex-row md:items-center md:justify-between"
        )}
      >
        <div className="min-w-0 max-w-2xl">
          {eyebrow && (
            <p className="animate-fade-in-up text-xs font-semibold uppercase tracking-widest text-white/70">
              {eyebrow}
            </p>
          )}
          <h1 className="animate-fade-in-up anim-delay-75 mt-1 text-2xl font-bold tracking-tight md:text-3xl">
            {title}
          </h1>
          {description && (
            <p className="animate-fade-in-up anim-delay-150 mt-2 text-sm leading-relaxed text-white/80">
              {description}
            </p>
          )}
        </div>
        {actions && (
          <div className="animate-fade-in-up anim-delay-150 flex shrink-0 flex-wrap items-center gap-2">
            {actions}
          </div>
        )}
      </div>
    </section>
  );
}