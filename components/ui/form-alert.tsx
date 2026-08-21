import { AlertCircle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function FormAlert({
  variant = "error",
  children,
}: {
  variant?: "success" | "error";
  children: React.ReactNode;
}) {
  return (
    <p
      role={variant === "error" ? "alert" : "status"}
      className={cn(
        "animate-slide-down flex items-start gap-2 rounded-lg border px-3 py-2.5 text-sm",
        variant === "success"
          ? "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-800/50 dark:bg-emerald-900/30 dark:text-emerald-200"
          : "border-destructive/20 bg-destructive/10 text-destructive"
      )}
    >
      {variant === "success" ? (
        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
      ) : (
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
      )}
      <span>{children}</span>
    </p>
  );
}