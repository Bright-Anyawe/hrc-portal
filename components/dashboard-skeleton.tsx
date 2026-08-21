import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function DashboardSkeleton({
  statCount = 4,
  hero = true,
  className,
}: {
  statCount?: number;
  hero?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("space-y-6", className)} aria-busy="true">
      {hero && (
        <div className="relative h-44 overflow-hidden rounded-2xl bg-gradient-to-br from-brand-navy via-brand-navy-light to-brand-sky p-6 shadow-lg md:p-8">
          <Skeleton className="h-4 w-28 bg-white/20" />
          <Skeleton className="mt-3 h-8 w-72 max-w-full bg-white/25" />
          <Skeleton className="mt-3 h-4 w-96 max-w-full bg-white/20" />
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: statCount }).map((_, i) => (
          <div key={i} className="rounded-xl border bg-card p-5 shadow-card">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-8 rounded-md" />
            </div>
            <Skeleton className="mt-4 h-7 w-16" />
          </div>
        ))}
      </div>

      <div className="rounded-xl border bg-card shadow-card">
        <div className="border-b p-5">
          <Skeleton className="h-5 w-40" />
        </div>
        <div className="space-y-3 p-5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-4 flex-1" />
              <Skeleton className="h-6 w-16 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}