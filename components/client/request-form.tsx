"use client";

import { useActionState } from "react";
import { SendHorizonal } from "lucide-react";
import { submitRequest, type ActionResult } from "@/app/actions/client";
import { Button } from "@/components/ui/button";
import { FormAlert } from "@/components/ui/form-alert";

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
        className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-[border-color,box-shadow] duration-150 placeholder:text-muted-foreground hover:border-ring/40 focus-visible:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/25"
      />
      {state.ok && (
        <FormAlert variant="success">
          Request submitted. Your consultant has been notified.
        </FormAlert>
      )}
      {state.error && <FormAlert variant="error">{state.error}</FormAlert>}
      <Button type="submit" loading={pending} size="sm">
        <SendHorizonal className="h-4 w-4" />
        {pending ? "Submitting..." : "Submit request"}
      </Button>
    </form>
  );
}