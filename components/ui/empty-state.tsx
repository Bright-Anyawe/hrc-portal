import { type LucideIcon, Inbox } from "lucide-react";
import { cn } from "@/lib/utils";

export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  action,
  className,
}: {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "group flex animate-fade-in-blur flex-col items-center gap-3 rounded-xl border border-dashed bg-muted/30 px-6 py-12 text-center transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:border-ring/30 hover:bg-muted/50 hover:shadow-sm",
        className
      )}
    >
      <div className="animate-pop-in flex h-12 w-12 items-center justify-center rounded-full bg-background shadow-sm ring-1 ring-border/60 transition-all duration-300 ease-out group-hover:scale-110 group-hover:rotate-3 group-hover:shadow-md motion-reduce:group-hover:scale-100 motion-reduce:group-hover:rotate-0">
        <Icon className="h-6 w-6 text-muted-foreground transition-colors duration-200 group-hover:text-foreground" />
      </div>
      <div className="space-y-1">
        <p className="font-medium text-foreground">{title}</p>
        {description && (
          <p className="mx-auto max-w-sm text-sm text-muted-foreground">
            {description}
          </p>
        )}
      </div>
      {action && <div className="mt-1">{action}</div>}
    </div>
  );
}