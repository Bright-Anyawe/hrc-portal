"use client";

import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

function Select({
  className,
  children,
  ...props
}: React.ComponentProps<"select">) {
  return (
    <div className={cn("relative", className)}>
      <select
        className="h-9 w-full appearance-none rounded-md border border-input bg-background pl-3 pr-9 text-sm shadow-sm transition-all duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] hover:border-ring/40 hover:shadow-sm hover:-translate-y-px focus-visible:translate-y-px focus-visible:border-ring focus-visible:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/25 disabled:cursor-not-allowed disabled:opacity-50 motion-reduce:hover:translate-y-0 motion-reduce:focus-visible:translate-y-0"
        {...props}
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground transition-transform duration-200 group-has-[select:focus]:rotate-180 motion-reduce:transition-none" />
    </div>
  );
}

export { Select };