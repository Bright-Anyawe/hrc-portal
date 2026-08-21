import "server-only";
import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";
import {
  initializeTransaction,
  verifyTransaction,
  PAYSTACK_CURRENCY,
  PaystackError,
  type PaystackTransaction,
} from "@/lib/paystack";
import { invoiceTotalCents, formatCents } from "@/lib/invoices";
import { notify, notifyAdmins } from "@/lib/notify";
import { logAudit } from "@/lib/audit";
import { sendMail } from "@/lib/mailer";
import type { PaymentStatus } from "@/generated/prisma/enums";

const PORTAL_URL = process.env.PORTAL_URL ?? "http://localhost:3000";

export type InitPaymentResult = {
  ok: boolean;
  error?: string;
  authorizationUrl?: string;
};

export type PaymentConfirmationResult = {
  ok: boolean;
  error?: string;
  status?: PaymentStatus;
  invoiceId?: string;
  amountCents?: number;
};

const paymentInclude = {
  invoice: {
    include: {
      lines: true,
      project: { select: { id: true, title: true } },
      client: { select: { id: true, name: true, email: true } },
    },
  },
} satisfies Prisma.PaymentInclude;

type PaymentWithInvoice = Prisma.PaymentGetPayload<{
  include: typeof paymentInclude;
}>;

export function generatePaymentReference(invoiceNumber: string): string {
  return `${invoiceNumber}-${randomUUID().slice(0, 8)}`;
}

/**
 * Starts a Paystack transaction for a client-owned, payable invoice.
 * Reuses the most recent PENDING attempt's reference so retries map to the
 * same Paystack transaction instead of piling up orphan records.
 */
export async function beginPaymentForInvoice(input: {
  clientId: string;
  invoiceId: string;
}): Promise<InitPaymentResult> {
  const invoice = await prisma.invoice.findUnique({
    where: { id: input.invoiceId },
    include: {
      client: { select: { email: true } },
      lines: true,
    },
  });
  if (!invoice) return { ok: false, error: "Invoice not found." };
  if (invoice.clientId !== input.clientId) {
    return { ok: false, error: "You do not have access to this invoice." };
  }
  if (invoice.status !== "SENT") {
    return { ok: false, error: "This invoice is not payable." };
  }

  const total = invoiceTotalCents(invoice.lines);
  if (total <= 0) {
    return { ok: false, error: "This invoice has no amount due." };
  }

  const paid = await prisma.payment.findFirst({
    where: { invoiceId: invoice.id, status: "SUCCESS" },
  });
  if (paid) {
    return { ok: false, error: "This invoice has already been paid." };
  }

  const pending = await prisma.payment.findFirst({
    where: { invoiceId: invoice.id, status: "PENDING" },
    orderBy: { createdAt: "desc" },
  });
  const reference =
    pending?.reference ?? generatePaymentReference(invoice.number);

  let payment = pending;
  if (!payment) {
    payment = await prisma.payment.create({
      data: {
        invoiceId: invoice.id,
        amountCents: total,
        currency: PAYSTACK_CURRENCY,
        reference,
        metadata: { invoiceNumber: invoice.number },
      },
    });
  }

  const callbackUrl = `${PORTAL_URL}/client/invoices/${invoice.id}/result`;

  try {
    const data = await initializeTransaction({
      email: invoice.client.email,
      amount: total,
      reference,
      callbackUrl,
      metadata: {
        invoiceId: invoice.id,
        invoiceNumber: invoice.number,
        portalUrl: callbackUrl,
      },
    });
    return { ok: true, authorizationUrl: data.authorization_url };
  } catch (e) {
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: "FAILED",
        failureMessage:
          e instanceof Error ? e.message : "Failed to start payment.",
      },
    });
    console.error("Paystack initialize failed:", e);
    return {
      ok: false,
      error:
        e instanceof PaystackError && e.paystackMessage
          ? `Paystack: ${e.paystackMessage}`
          : "Could not start payment. Please try again later.",
    };
  }
}

/**
 * Verifies a Paystack transaction, cross-checks it against the invoice, then
 * records the payment and settles the invoice. Idempotent — safe to call from
 * both the redirect result page and the webhook.
 *
 * `ownerId` (when provided) restricts access to the invoice's client.
 */
export async function confirmPayment(input: {
  reference: string;
  ownerId?: string;
}): Promise<PaymentConfirmationResult> {
  const payment = await prisma.payment.findUnique({
    where: { reference: input.reference },
    include: paymentInclude,
  });
  if (!payment) {
    return { ok: false, error: "Payment reference not found." };
  }
  if (input.ownerId && payment.invoice.clientId !== input.ownerId) {
    return { ok: false, error: "You do not have access to this payment." };
  }

  if (payment.status === "SUCCESS") {
    return {
      ok: true,
      status: "SUCCESS",
      invoiceId: payment.invoiceId,
      amountCents: payment.amountCents,
    };
  }

  let tx: PaystackTransaction;
  try {
    tx = await verifyTransaction(input.reference);
  } catch (e) {
    console.error("Paystack verification failed:", e);
    return {
      ok: false,
      error:
        "We could not verify your payment right now. Please contact support.",
    };
  }

  if (tx.status === "success") {
    const expectedTotal = invoiceTotalCents(payment.invoice.lines);
    const amountMatches =
      Number(tx.amount) === expectedTotal &&
      Number(tx.amount) === payment.amountCents;
    const currencyMatches =
      (tx.currency ?? payment.currency) === payment.currency;

    if (!amountMatches || !currencyMatches) {
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: "FAILED",
          failureMessage: "Payment amount or currency does not match invoice.",
        },
      });
      return {
        ok: false,
        error:
          "The payment amount does not match this invoice. Please contact support.",
      };
    }

    const paidAt = tx.paid_at ? new Date(tx.paid_at) : new Date();

    const result = await prisma.$transaction([
      prisma.payment.updateMany({
        where: { id: payment.id, status: { not: "SUCCESS" } },
        data: {
          status: "SUCCESS",
          paystackId: tx.id,
          channel: tx.channel,
          paidAt,
          failureMessage: null,
        },
      }),
      prisma.invoice.updateMany({
        where: { id: payment.invoiceId, status: "SENT" },
        data: { status: "PAID", sentAt: payment.invoice.sentAt ?? paidAt },
      }),
    ]);

    if (result[0].count === 0) {
      // A concurrent webhook/redirect already settled this payment.
      return {
        ok: true,
        status: "SUCCESS",
        invoiceId: payment.invoiceId,
        amountCents: payment.amountCents,
      };
    }

    await onPaymentRecorded(payment, tx, paidAt);

    revalidatePath("/client/invoices");
    revalidatePath(`/client/invoices/${payment.invoiceId}`);
    revalidatePath("/admin/invoices");
    revalidatePath(`/admin/invoices/${payment.invoiceId}`);

    return {
      ok: true,
      status: "SUCCESS",
      invoiceId: payment.invoiceId,
      amountCents: payment.amountCents,
    };
  }

  if (tx.status === "failed") {
    await prisma.payment.update({
      where: { id: payment.id },
      data: { status: "FAILED", failureMessage: "Payment was declined." },
    });
    return { ok: false, status: "FAILED", error: "Your payment was declined." };
  }

  // abandoned / pending / other non-final states
  return {
    ok: false,
    status: "PENDING",
    error:
      "Your payment was not completed. If you believe this is a mistake, please contact support.",
  };
}

async function onPaymentRecorded(
  payment: PaymentWithInvoice,
  tx: PaystackTransaction,
  paidAt: Date
) {
  const invoice = payment.invoice;
  const amount = formatCents(payment.amountCents);

  await notify(invoice.clientId, {
    projectId: invoice.projectId,
    type: "INVOICE_PAYMENT",
    message: `Your payment of ${amount} for invoice ${invoice.number} was received.`,
  });
  await notifyAdmins({
    projectId: invoice.projectId,
    type: "INVOICE_PAYMENT",
    message: `Payment of ${amount} received for invoice ${invoice.number} ("${invoice.project.title}").`,
  });

  await logAudit({
    actorId: invoice.client.id,
    actorName: invoice.client.name,
    action: "INVOICE_PAID",
    entityType: "Invoice",
    entityId: invoice.id,
    details: {
      number: invoice.number,
      project: invoice.project.title,
      amountCents: payment.amountCents,
      currency: payment.currency,
      reference: payment.reference,
      channel: tx.channel,
      method: "PAYSTACK",
    },
  });

  try {
    await sendMail({
      to: invoice.client.email,
      subject: `Payment received — Invoice ${invoice.number}`,
      text: `Hi ${invoice.client.name},

We've received your payment of ${amount} for invoice ${invoice.number} ("${invoice.project.title}").

  Reference: ${payment.reference}
  Paid on: ${paidAt.toLocaleString()}

Thank you for your business.

— HRC Portal`,
    });
  } catch (e) {
    console.error("Failed to send payment confirmation email:", e);
  }
}