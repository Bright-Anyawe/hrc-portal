"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { ActionResult } from "@/app/actions/admin";

export function DeleteDialog({
  entityLabel,
  action,
  description,
}: {
  entityLabel: string;
  action: () => Promise<ActionResult>;
  description?: string;
}) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string>();

  const execute = async () => {
    setPending(true);
    setError(undefined);
    const res = await action();
    setPending(false);
    if (!res?.ok) {
      setError(res?.error ?? "Failed to delete.");
      return;
    }
    setOpen(false);
  };

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="text-muted-foreground hover:text-destructive"
        onClick={() => setOpen(true)}
        aria-label={`Delete ${entityLabel}`}
        title={`Delete ${entityLabel}`}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
      <Dialog
        open={open}
        onOpenChange={setOpen}
        title={`Delete ${entityLabel}?`}
        description={
          description ??
          "This permanently removes the record and any related project data. This action cannot be undone."
        }
      >
        {error && (
          <p className="mb-4 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        )}
        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={pending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={execute}
            disabled={pending}
          >
            {pending ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </Dialog>
    </>
  );
}