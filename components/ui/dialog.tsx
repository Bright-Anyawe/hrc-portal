"use client";

import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function Dialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  className,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
    }
    if (!open && dialog.open) {
      setClosing(false);
      dialog.close();
    }
  }, [open]);

  const handleClose = () => {
    if (closing) return;
    setClosing(true);
  };

  return (
    <dialog
      ref={ref}
      onClose={() => onOpenChange(false)}
      onAnimationEnd={(e) => {
        if (e.target === ref.current && closing) {
          setClosing(false);
          ref.current?.close();
        }
      }}
      className={cn(
        "m-auto max-h-[calc(100dvh-1.5rem)] w-[calc(100%-1.5rem)] max-w-md overflow-y-auto rounded-xl border bg-background p-0 text-foreground shadow-lifted outline-none backdrop:bg-slate-950/55 backdrop:backdrop-blur-sm transition-shadow duration-300",
        closing ? "animate-dialog-out closing" : "animate-scale-in-soft",
        className
      )}
    >
      <div className="animate-scale-in-soft">
        <div className="flex items-start justify-between gap-4 border-b p-4">
          <div>
            <h2 className="text-base font-semibold tracking-tight">{title}</h2>
            {description && (
              <p className="mt-1 text-sm text-muted-foreground">{description}</p>
            )}
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-7 w-7 shrink-0"
            onClick={handleClose}
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </dialog>
  );
}