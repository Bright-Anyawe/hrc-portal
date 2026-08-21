import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      className={cn(
        "flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-all duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] placeholder:text-muted-foreground hover:border-ring/40 hover:shadow-sm hover:-translate-y-px focus-visible:-translate-y-px focus-visible:border-ring focus-visible:bg-card focus-visible:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/25 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50 motion-reduce:hover:translate-y-0 motion-reduce:focus-visible:translate-y-0",
        className
      )}
      {...props}
    />
  );
}

export { Input };