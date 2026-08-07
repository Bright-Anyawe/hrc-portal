"use client";

import { useState } from "react";
import { Check, Copy, KeyRound, UserPlus } from "lucide-react";
import { useActionState } from "react";
import {
  createClient,
  createConsultant,
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

function CopyField({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <div className="flex items-center gap-2">
        <code className="flex-1 rounded-md border bg-muted px-3 py-2 text-sm break-all">
          {value}
        </code>
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={copy}
          aria-label={`Copy ${label}`}
        >
          {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
}

function UserForm({
  action,
  roleLabel,
  onClose,
}: {
  action: UserAction;
  roleLabel: string;
  onClose: () => void;
}) {
  const [state, formAction, pending] = useActionState<ActionResult, FormData>(
    action,
    { ok: false }
  );

  if (state.ok && state.email && state.password) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200">
          <KeyRound className="h-4 w-4 shrink-0" />
          {roleLabel} created. Share these sign-in credentials.
        </div>
        <CopyField label="Email" value={state.email} />
        <CopyField label="Temporary password" value={state.password} />
        <div className="flex justify-end">
          <Button onClick={onClose}>Done</Button>
        </div>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor={`${roleLabel}-name`}>Name</Label>
        <Input
          id={`${roleLabel}-name`}
          name="name"
          placeholder={
            roleLabel === "Client" ? "Acme Capital LLC" : "Jane Doe"
          }
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor={`${roleLabel}-email`}>Email</Label>
        <Input
          id={`${roleLabel}-email`}
          name="email"
          type="email"
          placeholder="contact@company.com"
          required
        />
      </div>
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
          {pending ? "Creating..." : `Create ${roleLabel}`}
        </Button>
      </div>
    </form>
  );
}

export function AddUserModal({
  role,
}: {
  role: "CLIENT" | "CONSULTANT";
}) {
  const [open, setOpen] = useState(false);
  const roleLabel = role === "CLIENT" ? "Client" : "Consultant";
  const action = role === "CLIENT" ? createClient : createConsultant;

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <UserPlus className="h-4 w-4" />
        Add {roleLabel}
      </Button>
      <Dialog
        open={open}
        onOpenChange={setOpen}
        title={`Add ${roleLabel}`}
        description={`Create a ${roleLabel.toLowerCase()} account and receive temporary credentials.`}
      >
        {open && (
          <UserForm
            key={`${role}-${open}`}
            action={action}
            roleLabel={roleLabel}
            onClose={() => setOpen(false)}
          />
        )}
      </Dialog>
    </>
  );
}
