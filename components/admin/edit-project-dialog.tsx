"use client";

import { useEffect, useState } from "react";
import { useActionState } from "react";
import { Pencil } from "lucide-react";
import { updateProject, type ActionResult } from "@/app/actions/admin";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";

type Option = { id: string; name: string };

export function EditProjectDialog({
  project,
  clients,
  consultants,
}: {
  project: {
    id: string;
    title: string;
    description: string | null;
    status: string;
    clientId: string;
    consultantId: string | null;
  };
  clients: Option[];
  consultants: Option[];
}) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState<ActionResult, FormData>(
    updateProject,
    { ok: false }
  );

  useEffect(() => {
    if (state.ok) setOpen(false);
  }, [state.ok]);

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="text-muted-foreground hover:text-foreground"
        onClick={() => setOpen(true)}
        aria-label={`Edit ${project.title}`}
        title="Edit"
      >
        <Pencil className="h-4 w-4" />
      </Button>
      <Dialog
        open={open}
        onOpenChange={setOpen}
        title="Edit project"
        description={`Update details for ${project.title}.`}
      >
        {open && (
          <form action={formAction} className="space-y-4">
            <input type="hidden" name="id" value={project.id} />
            <div className="space-y-2">
              <Label>Project title</Label>
              <Input name="title" defaultValue={project.title} required />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <textarea
                name="description"
                rows={3}
                defaultValue={project.description ?? ""}
                className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Status</Label>
                <Select name="status" defaultValue={project.status}>
                  <option value="PLANNING">Planning</option>
                  <option value="ACTIVE">Active</option>
                  <option value="ON_HOLD">On hold</option>
                  <option value="COMPLETED">Completed</option>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Client</Label>
                <Select name="clientId" defaultValue={project.clientId} required>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Assigned consultant</Label>
              <Select
                name="consultantId"
                defaultValue={project.consultantId ?? ""}
              >
                <option value="">Unassigned</option>
                {consultants.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </Select>
            </div>
            {state.error && (
              <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {state.error}
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
              <Button type="submit" disabled={pending}>
                {pending ? "Saving..." : "Save changes"}
              </Button>
            </div>
          </form>
        )}
      </Dialog>
    </>
  );
}