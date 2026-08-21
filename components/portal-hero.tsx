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
        "relative overflow-hidden rounded-2xl bg-gradient-to-br text-white shadow-lg",
        "animate-fade-in-up",
        accents.gradient,
        className
      )}
    >
      <div className="bg-hero-grid pointer-events-none absolute inset-0" />
      <div
        className={cn(
          "animate-hero-float pointer-events-none absolute -right-14 -top-14 h-52 w-52 rounded-full blur-2xl",
          accents.orb
        )}
      />
      <div
        className={cn(
          "pointer-events-none absolute -bottom-16 left-1/3 h-44 w-44 rounded-full blur-2xl",
          accents.orb2
        )}
      />
      <div
        className={cn(
          "relative flex flex-col gap-4 p-6 md:p-8",
          split && "md:flex-row md:items-center md:justify-between"
        )}
      >
        <div className="min-w-0 max-w-2xl">
          {eyebrow && (
            <p className="text-xs font-semibold uppercase tracking-widest text-white/70">
              {eyebrow}
            </p>
          )}
          <h1 className="mt-1 text-2xl font-bold tracking-tight md:text-3xl">
            {title}
          </h1>
          {description && (
            <p className="mt-2 text-sm leading-relaxed text-white/80">
              {description}
            </p>
          )}
        </div>
        {actions && (
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            {actions}
          </div>
        )}
      </div>
    </section>
  );
}