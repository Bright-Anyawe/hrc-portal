"use server";

import { requireRole } from "@/lib/rbac";
import {
  beginPaymentForInvoice,
  type InitPaymentResult,
} from "@/lib/payments";

export async function initializeInvoicePayment(
  _prev: InitPaymentResult,
  formData: FormData
): Promise<InitPaymentResult> {
  const session = await requireRole(["CLIENT"]);

  const invoiceId = String(formData.get("invoiceId") ?? "");
  if (!invoiceId) return { ok: false, error: "Invoice is missing." };

  return beginPaymentForInvoice({
    clientId: session.sub,
    invoiceId,
  });
}