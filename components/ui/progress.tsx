"use client";

import { cn } from "@/lib/utils";

function Progress({
  value,
  className,
  ...props
}: React.ComponentProps<"div"> & { value?: number }) {
  return (
    <div
      className={cn(
        "h-2 w-full overflow-hidden rounded-full bg-muted transition-colors duration-200",
        className
      )}
      {...props}
    >
      <div
        className="relative h-full overflow-hidden rounded-full bg-gradient-to-r from-brand-sky to-brand-navy shadow-sm transition-[width] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none"
        style={{ width: `${Math.min(100, Math.max(0, value ?? 0))}%` }}
      >
        <span className="absolute inset-0 animate-progress-stripes rounded-full opacity-60 motion-reduce:hidden" />
        <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/15 to-white/0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      </div>
    </div>
  );
}

export { Progress };
