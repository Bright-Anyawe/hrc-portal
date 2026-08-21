import { cn } from "@/lib/utils";

export function PageHeader({
  title,
  description,
  actions,
  className,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex animate-fade-in-blur flex-col gap-3 sm:flex-row sm:items-center sm:justify-between",
        className
      )}
    >
      <div className="min-w-0">
        <h1 className="animate-fade-in-up text-2xl font-bold tracking-tight">{title}</h1>
        {description && (
          <p className="animate-fade-in-up anim-delay-75 mt-1 text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {actions && (
        <div className="animate-fade-in-up anim-delay-75 flex flex-wrap items-center gap-2">{actions}</div>
      )}
    </div>
  );
}