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
      className="group animate-fade-in-up transition-all duration-200 hover:-translate-y-1 hover:shadow-lifted motion-reduce:hover:translate-y-0"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-center justify-between p-5 pb-2">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <div
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-lg bg-muted transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3",
            iconClassName
          )}
        >
          <Icon className="h-[18px] w-[18px]" />
        </div>
      </div>
      <div className="px-5 pb-5">
        <p className="text-2xl font-bold tracking-tight tabular-nums">{value}</p>
        {footer && (
          <div className="mt-1 text-xs text-muted-foreground">{footer}</div>
        )}
      </div>
    </Card>
  );
}