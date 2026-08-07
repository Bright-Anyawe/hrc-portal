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
        className="h-full rounded-full bg-primary transition-all"
        style={{ width: `${Math.min(100, Math.max(0, value ?? 0))}%` }}
      />
    </div>
  );
}

export { Progress };
