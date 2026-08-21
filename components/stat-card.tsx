import { type LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  icon: Icon,
  iconClassName,
  delay = 0,
  footer,
}: {
  label: string;
  value: React.ReactNode;
  icon: LucideIcon;
  iconClassName?: string;
  delay?: number;
  footer?: React.ReactNode;
}) {
  return (
    <Card
      className="group animate-card-enter card-interactive overflow-hidden"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-center justify-between p-5 pb-2">
        <p className="text-sm font-medium text-muted-foreground transition-colors duration-200 group-hover:text-foreground">
          {label}
        </p>
        <div
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-lg bg-muted transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-110 group-hover:-rotate-3 group-hover:shadow-md group-active:scale-100 group-active:rotate-0",
            iconClassName
          )}
        >
          <Icon className="h-[18px] w-[18px] transition-transform duration-300 group-hover:scale-105" />
        </div>
      </div>
      <div className="px-5 pb-5">
        <p className="text-2xl font-bold tracking-tight tabular-nums transition-transform duration-300 group-hover:translate-x-px">
          {value}
        </p>
        {footer && (
          <div className="mt-1 text-xs text-muted-foreground transition-colors duration-200 group-hover:text-muted-foreground/90">
            {footer}
          </div>
        )}
      </div>
      <div className="h-px w-full scale-x-0 bg-gradient-to-r from-transparent via-brand-sky/20 to-transparent opacity-0 transition-all duration-500 ease-out group-hover:scale-x-100 group-hover:opacity-100" />
    </Card>
  );
}