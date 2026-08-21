import "server-only";
import { prisma } from "@/lib/prisma";
import { notifyAdmins } from "@/lib/notify";
import type { InvoiceStatus, PaymentStatus } from "@/generated/prisma/enums";

export const INVOICE_STATUS_LABEL: Record<InvoiceStatus, string> = {
  DRAFT: "Draft",
  SENT: "Sent",
  PAID: "Paid",
  CANCELLED: "Cancelled",
};

export const PAYMENT_STATUS_LABEL: Record<PaymentStatus, string> = {
  PENDING: "Pending",
  SUCCESS: "Successful",
  FAILED: "Failed",
  CANCELLED: "Cancelled",
};

export const PAYMENT_STATUS_VARIANT: Record<
  PaymentStatus,
  "default" | "warning" | "success" | "outline" | "destructive"
> = {
  PENDING: "warning",
  SUCCESS: "success",
  FAILED: "destructive",
  CANCELLED: "outline",
};

export const INVOICE_STATUS_VARIANT: Record<
  InvoiceStatus,
  "default" | "warning" | "success" | "outline"
> = {
  DRAFT: "warning",
  SENT: "default",
  PAID: "success",
  CANCELLED: "outline",
};

export function formatCents(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

export function lineTotalCents(line: {
  quantity: number;
  unitPriceCents: number;
}): number {
  return line.quantity * line.unitPriceCents;
}

export function invoiceTotalCents(lines: {
  quantity: number;
  unitPriceCents: number;
}[]): number {
  return lines.reduce((sum, line) => sum + lineTotalCents(line), 0);
}

export async function nextInvoiceNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const count = await prisma.invoice.count({
    where: { number: { startsWith: `HRC-${year}-` } },
  });
  return `HRC-${year}-${String(count + 1).padStart(4, "0")}`;
}

export async function createDraftInvoiceForCompletedProject(project: {
  id: string;
  clientId: string;
  title: string;
}) {
  const existing = await prisma.invoice.findFirst({
    where: { projectId: project.id },
  });
  if (existing) return existing;

  const invoice = await prisma.invoice.create({
    data: {
      number: await nextInvoiceNumber(),
      projectId: project.id,
      clientId: project.clientId,
    },
  });

  await notifyAdmins({
    projectId: project.id,
    type: "INVOICE_DRAFT",
    message: `Invoice draft ${invoice.number} is ready for review for "${project.title}".`,
  });

  return invoice;
}