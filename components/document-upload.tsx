"use client";

import { useActionState, useState } from "react";
import { Check, FileUp } from "lucide-react";
import { addDocument, type ActionResult } from "@/app/actions/documents";
import { Button } from "@/components/ui/button";

export function DocumentUpload({ projectId }: { projectId: string }) {
  const [state, formAction, pending] = useActionState<ActionResult, FormData>(
    addDocument,
    { ok: false }
  );
  const [fileName, setFileName] = useState("");

  return (
    <div className="space-y-3">
      <form
        action={formAction}
        encType="multipart/form-data"
        className="flex flex-col gap-2 sm:flex-row sm:items-center"
      >
        <input type="hidden" name="projectId" value={projectId} />
        <label className="flex flex-1 cursor-pointer items-center gap-2 rounded-md border border-dashed px-3 py-2 text-sm text-muted-foreground hover:bg-muted/50">
          <FileUp className="h-4 w-4 shrink-0" />
          <span className="truncate">{fileName || "Choose a file (max 10MB)"}</span>
          <input
            type="file"
            name="file"
            required
            className="hidden"
            onChange={(e) => setFileName(e.target.files?.[0]?.name ?? "")}
          />
        </label>
        <Button type="submit" disabled={pending || !fileName}>
          {pending ? "Uploading..." : "Upload"}
        </Button>
      </form>
      {state.ok && (
        <p className="flex items-center gap-1.5 rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200">
          <Check className="h-4 w-4" />
          Document uploaded.
        </p>
      )}
      {state.error && (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {state.error}
        </p>
      )}
    </div>
  );
}
