"use client";

import { useActionState } from "react";
import { SendHorizonal } from "lucide-react";
import { submitRequest, type ActionResult } from "@/app/actions/client";
import { Button } from "@/components/ui/button";

export function RequestForm({ projectId }: { projectId: string }) {
  const [state, formAction, pending] = useActionState<ActionResult, FormData>(
    submitRequest,
    { ok: false }
  );

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="projectId" value={projectId} />
      <textarea
        name="message"
        rows={3}
        required
        placeholder="Describe the request or deliverable you need..."
        className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
      />
      {state.ok && (
        <p className="rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200">
          Request submitted. Your consultant has been notified.
        </p>
      )}
      {state.error && (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {state.error}
        </p>
      )}
      <Button type="submit" disabled={pending} size="sm">
        <SendHorizonal className="h-4 w-4" />
        {pending ? "Submitting..." : "Submit request"}
      </Button>
    </form>
  );
}
