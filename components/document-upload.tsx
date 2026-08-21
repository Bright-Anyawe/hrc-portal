"use client";

import { useActionState, useState } from "react";
import { FileUp } from "lucide-react";
import { addDocument, type ActionResult } from "@/app/actions/documents";
import { Button } from "@/components/ui/button";
import { FormAlert } from "@/components/ui/form-alert";

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
        <label className="flex flex-1 cursor-pointer items-center gap-2 rounded-md border border-dashed px-3 py-2 text-sm text-muted-foreground transition-colors hover:border-ring/40 hover:bg-muted/50">
          <FileUp className="h-4 w-4 shrink-0" />
          <span className="truncate">
            {fileName || "Choose a file (max 10MB)"}
          </span>
          <input
            type="file"
            name="file"
            required
            className="hidden"
            onChange={(e) => setFileName(e.target.files?.[0]?.name ?? "")}
          />
        </label>
        <Button type="submit" loading={pending} disabled={!fileName}>
          {pending ? "Uploading..." : "Upload"}
        </Button>
      </form>
      {state.ok && (
        <FormAlert variant="success">Document uploaded.</FormAlert>
      )}
      {state.error && <FormAlert variant="error">{state.error}</FormAlert>}
    </div>
  );
}