"use client";

import { cn } from "@/lib/utils";

function Progress({
  value,
  className,
  ...props
}: React.ComponentProps<"div"> & { value?: number }) {
  return (
    <div
      className={cn("h-2 w-full overflow-hidden rounded-full bg-muted", className)}
      {...props}
    >
      <div
        className="relative h-full overflow-hidden rounded-full bg-gradient-to-r from-brand-sky to-brand-navy transition-[width] duration-700 ease-out motion-reduce:transition-none"
        style={{ width: `${Math.min(100, Math.max(0, value ?? 0))}%` }}
      >
        <span className="absolute inset-0 animate-progress-stripes rounded-full opacity-60 motion-reduce:hidden" />
      </div>
    </div>
  );
}

export { Progress };
