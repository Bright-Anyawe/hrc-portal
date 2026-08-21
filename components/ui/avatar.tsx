import { cn } from "@/lib/utils";

function Avatar({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full ring-1 ring-border/60",
        className
      )}
      {...props}
    />
  );
}

const TONES = {
  default: "bg-muted text-foreground",
  red: "bg-brand-red/10 text-brand-red",
  sky: "bg-brand-sky/15 text-brand-sky",
  navy: "bg-brand-navy/10 text-brand-navy",
  gold: "bg-brand-gold/15 text-brand-gold",
  emerald: "bg-emerald-600/10 text-emerald-700 dark:text-emerald-400",
  violet: "bg-violet-600/10 text-violet-700 dark:text-violet-400",
} as const;

function AvatarFallback({
  className,
  tone = "default",
  ...props
}: React.ComponentProps<"div"> & {
  tone?: keyof typeof TONES;
}) {
  return (
    <div
      className={cn(
        "flex h-full w-full items-center justify-center text-sm font-semibold",
        TONES[tone],
        className
      )}
      {...props}
    />
  );
}

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export { Avatar, AvatarFallback, getInitials };