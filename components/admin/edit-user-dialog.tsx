"use client";

import { useEffect, useState } from "react";
import { useActionState } from "react";
import { Pencil } from "lucide-react";
import {
  updateClient,
  updateConsultant,
  type ActionResult,
} from "@/app/actions/admin";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type UserAction = (
  prev: ActionResult,
  formData: FormData
) => Promise<ActionResult>;

export function EditUserDialog({
  user,
  role,
}: {
  user: { id: string; name: string; email: string };
  role: "CLIENT" | "CONSULTANT";
}) {
  const [open, setOpen] = useState(false);
  const action: UserAction =
    role === "CLIENT" ? updateClient : updateConsultant;
  const roleLabel = role === "CLIENT" ? "Client" : "Consultant";

  const [state, formAction, pending] = useActionState<ActionResult, FormData>(
    action,
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
        aria-label={`Edit ${user.name}`}
        title="Edit"
      >
        <Pencil className="h-4 w-4" />
      </Button>
      <Dialog
        open={open}
        onOpenChange={setOpen}
        title={`Edit ${roleLabel.toLowerCase()}`}
        description={`Update details for ${user.name}.`}
      >
        {open && (
          <form action={formAction} className="space-y-4">
            <input type="hidden" name="id" value={user.id} />
            <div className="space-y-2">
              <Label htmlFor="edit-user-name">Name</Label>
              <Input
                id="edit-user-name"
                name="name"
                defaultValue={user.name}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-user-email">Email</Label>
              <Input
                id="edit-user-email"
                name="email"
                type="email"
                defaultValue={user.email}
                required
              />
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