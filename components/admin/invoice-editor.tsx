"use client";

import { useEffect, useState } from "react";
import { useActionState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { updateInvoice, type ActionResult } from "@/app/actions/invoices";
import { formatCents, invoiceTotalCents } from "@/lib/money";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Line = {
  description: string;
  quantity: number;
  unitPriceCents: number;
};

function formatCedis(cents: number): string {
  return (cents / 100).toFixed(2);
}

export function InvoiceEditor({
  invoiceId,
  initialLines,
  initialNote,
  initialDueDate,
}: {
  invoiceId: string;
  initialLines: Line[];
  initialNote: string | null;
  initialDueDate: string | null;
}) {
  const [lines, setLines] = useState<Line[]>(
    initialLines.length > 0
      ? initialLines
      : [{ description: "", quantity: 1, unitPriceCents: 0 }]
  );
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [state, formAction, pending] = useActionState<ActionResult, FormData>(
    updateInvoice,
    { ok: false }
  );

  useEffect(() => {
    if (state.ok) setConfirmOpen(false);
  }, [state.ok]);

  const total = invoiceTotalCents(lines);

  function updateLine(
    index: number,
    patch: Partial<{ description: string; quantity: number; unitPriceCents: number }>
  ) {
    setLines((prev) =>
      prev.map((line, i) => (i === index ? { ...line, ...patch } : line))
    );
  }

  function addLine() {
    setLines((prev) => [
      ...prev,
      { description: "", quantity: 1, unitPriceCents: 0 },
    ]);
  }

  function removeLine(index: number) {
    setLines((prev) =>
      prev.length > 1 ? prev.filter((_, i) => i !== index) : prev
    );
  }

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="id" value={invoiceId} />

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>Line items</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addLine}
            className="gap-1"
          >
            <Plus className="h-3.5 w-3.5" />
            Add line
          </Button>
        </div>
        {lines.map((line, i) => (
          <div key={i} className="grid grid-cols-12 items-center gap-2">
            <Input
              name={`description_${i}`}
              value={line.description}
              onChange={(e) => updateLine(i, { description: e.target.value })}
              placeholder="Description (e.g. Risk assessment)"
              className="col-span-12 sm:col-span-6"
            />
            <Input
              type="number"
              min={1}
              step={1}
              name={`quantity_${i}`}
              value={line.quantity}
              onChange={(e) =>
                updateLine(i, { quantity: Number(e.target.value) })
              }
              className="col-span-3 sm:col-span-2"
              aria-label="Quantity"
            />
            <Input
              type="number"
              min={0}
              step="0.01"
              name={`unitPrice_${i}`}
              value={formatCedis(line.unitPriceCents)}
              onChange={(e) =>
                updateLine(i, {
                  unitPriceCents: Math.round(Number(e.target.value) * 100),
                })
              }
              className="col-span-6 sm:col-span-3"
              aria-label="Unit price (GHS)"
            />
            <div className="col-span-3 flex justify-end sm:col-span-1">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeLine(i)}
                disabled={lines.length === 1}
                aria-label="Remove line"
                className="h-8 w-8 text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="dueDate">Due date</Label>
          <Input
            id="dueDate"
            name="dueDate"
            type="date"
            defaultValue={initialDueDate ?? ""}
          />
        </div>
        <div className="space-y-2">
          <Label>Total</Label>
          <div className="flex h-9 items-center rounded-md border bg-muted/40 px-3 text-sm font-semibold">
            {formatCents(total)}
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Note to client</Label>
        <textarea
          name="note"
          rows={3}
          defaultValue={initialNote ?? ""}
          placeholder="Optional message shown on the invoice"
          className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        />
      </div>

      {state.error && (
        <p className="animate-fade-in-up rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {state.error}
        </p>
      )}

      <div className="flex justify-end gap-2">
        <Button
          type="submit"
          variant="outline"
          loading={pending}
          name="intent"
          value="save"
        >
          {pending ? "Saving..." : "Save draft"}
        </Button>
        <Button
          type="button"
          variant="default"
          onClick={() => setConfirmOpen(true)}
        >
          Approve & send
        </Button>
      </div>

      <Dialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Approve & send invoice"
        description={`This sends the invoice to the client and locks the line items. Total: ${formatCents(total)}.`}
      >
        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => setConfirmOpen(false)}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            loading={pending}
            name="intent"
            value="approve"
          >
            {pending ? "Sending..." : "Approve & send"}
          </Button>
        </div>
      </Dialog>
    </form>
  );
}