"use client";

import { useState } from "react";
import { useActionState } from "react";
import { Plus } from "lucide-react";
import { createProject, type ActionResult } from "@/app/actions/admin";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";

type Option = { id: string; name: string };

function ProjectForm({
  clients,
  consultants,
  onClose,
}: {
  clients: Option[];
  consultants: Option[];
  onClose: () => void;
}) {
  const [state, formAction, pending] = useActionState<ActionResult, FormData>(
    createProject,
    { ok: false }
  );

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="project-title">Project title</Label>
        <Input
          id="project-title"
          name="title"
          placeholder="Annual compliance review"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="project-description">Description</Label>
        <textarea
          id="project-description"
          name="description"
          rows={3}
          placeholder="Short summary of scope and deliverables..."
          className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="project-status">Status</Label>
          <Select id="project-status" name="status" defaultValue="PLANNING">
            <option value="PLANNING">Planning</option>
            <option value="ACTIVE">Active</option>
            <option value="ON_HOLD">On hold</option>
            <option value="COMPLETED">Completed</option>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="project-client">Client</Label>
          <Select id="project-client" name="clientId" required>
            <option value="">Select client</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="project-consultant">Assigned consultant</Label>
        <Select id="project-consultant" name="consultantId">
          <option value="">Unassigned</option>
          {consultants.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>
      </div>
      {state.ok && (
        <p className="rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200">
          Project created.
        </p>
      )}
      {state.error && (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {state.error}
        </p>
      )}
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" disabled={pending}>
          {pending ? "Creating..." : "Create project"}
        </Button>
      </div>
    </form>
  );
}

export function CreateProjectButton({
  clients,
  consultants,
}: {
  clients: Option[];
  consultants: Option[];
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" />
        New project
      </Button>
      <Dialog
        open={open}
        onOpenChange={setOpen}
        title="Create project"
        description="Create a project for a client and optionally assign a consultant."
      >
        {open && (
          <ProjectForm
            key={`project-${open}`}
            clients={clients}
            consultants={consultants}
            onClose={() => setOpen(false)}
          />
        )}
      </Dialog>
    </>
  );
}
