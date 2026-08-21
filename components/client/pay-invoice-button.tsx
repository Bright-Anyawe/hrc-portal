"use client";

import { useEffect } from "react";
import { useActionState } from "react";
import { CreditCard } from "lucide-react";
import { initializeInvoicePayment } from "@/app/actions/payments";
import type { InitPaymentResult } from "@/lib/payments";
import { Button } from "@/components/ui/button";
import { FormAlert } from "@/components/ui/form-alert";

export function PayInvoiceButton({
  invoiceId,
  size = "default",
}: {
  invoiceId: string;
  size?: "default" | "sm" | "lg";
}) {
  const [state, formAction, pending] = useActionState<
    InitPaymentResult,
    FormData
  >(initializeInvoicePayment, { ok: false });

  useEffect(() => {
    if (state.ok && state.authorizationUrl) {
      window.location.assign(state.authorizationUrl);
    }
  }, [state]);

  return (
    <div className="space-y-2">
      <form action={formAction}>
        <input type="hidden" name="invoiceId" value={invoiceId} />
        <Button type="submit" size={size} loading={pending}>
          <CreditCard className="h-4 w-4" />
          {pending ? "Contacting Paystack..." : "Pay Now"}
        </Button>
      </form>
      {state.error && <FormAlert variant="error">{state.error}</FormAlert>}
    </div>
  );
}