"use client";

import { useActionState } from "react";
import { Link2 } from "lucide-react";
import { assignConsultant, type ActionResult } from "@/app/actions/admin";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";

type Option = { id: string; name: string };

export function AssignConsultantForm({
  consultants,
  clients,
}: {
  consultants: Option[];
  clients: Option[];
}) {
  const [state, formAction, pending] = useActionState<ActionResult, FormData>(
    assignConsultant,
    { ok: false }
  );

  return (
    <form action={formAction} className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label
            htmlFor="assign-consultant"
            className="text-sm font-medium"
          >
            Consultant
          </label>
          <Select id="assign-consultant" name="consultantId" required>
            <option value="">Select consultant</option>
            {consultants.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
        </div>
        <div className="space-y-1.5">
          <label htmlFor="assign-client" className="text-sm font-medium">
            Client
          </label>
          <Select id="assign-client" name="clientId" required>
            <option value="">Select client</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
        </div>
      </div>
      {state.ok && (
        <p className="rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200">
          Consultant assigned to client.
        </p>
      )}
      {state.error && (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {state.error}
        </p>
      )}
      <Button type="submit" disabled={pending}>
        <Link2 className="h-4 w-4" />
        {pending ? "Assigning..." : "Assign consultant"}
      </Button>
    </form>
  );
}
