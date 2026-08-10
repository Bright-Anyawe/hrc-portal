"use client";

import { useState } from "react";
import { ArrowRightLeft } from "lucide-react";
import { changeUserRole, type ActionResult } from "@/app/actions/admin";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export function ChangeRoleDialog({
  user,
  role,
}: {
  user: { id: string; name: string; role: "CLIENT" | "CONSULTANT" };
  role: "CLIENT" | "CONSULTANT";
}) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string>();
  const [ok, setOk] = useState(false);

  const targetRole = role === "CLIENT" ? "CONSULTANT" : "CLIENT";
  const targetLabel = role === "CLIENT" ? "consultant" : "client";

  const execute = async () => {
    setPending(true);
    setError(undefined);
    const res: ActionResult = await changeUserRole(user.id, targetRole);
    setPending(false);
    if (!res?.ok) {
      setError(res?.error ?? "Failed to change role.");
      return;
    }
    setOk(true);
    setTimeout(() => setOpen(false), 1200);
  };

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="text-muted-foreground hover:text-foreground"
        onClick={() => setOpen(true)}
        aria-label={`Make ${user.name} a ${targetLabel}`}
        title={role === "CLIENT" ? "Promote to consultant" : "Demote to client"}
      >
        <ArrowRightLeft className="h-4 w-4" />
      </Button>
      <Dialog
        open={open}
        onOpenChange={setOpen}
        title={role === "CLIENT" ? "Promote to consultant?" : "Demote to client?"}
        description={
          role === "CLIENT"
            ? `${user.name} will become a consultant and lose client-only access.`
            : `${user.name} will become a client and lose consultant access to their projects.`
        }
      >
        {error && (
          <p className="mb-4 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        )}
        {ok && (
          <p className="mb-4 rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200">
            {user.name} is now a {targetLabel}.
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
          <Button type="button" onClick={execute} disabled={pending}>
            {pending ? "Updating..." : `Make ${targetLabel}`}
          </Button>
        </div>
      </Dialog>
    </>
  );
}