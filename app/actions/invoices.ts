"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";
import { logAudit } from "@/lib/audit";
import { notify } from "@/lib/notify";
import { sendMail } from "@/lib/mailer";
import { formatCents, invoiceTotalCents } from "@/lib/invoices";
import type { InvoiceStatus } from "@/generated/prisma/enums";

const PORTAL_URL = process.env.PORTAL_URL ?? "http://localhost:3000";

export type ActionResult = { ok: boolean; error?: string };

type LineInput = {
  description: string;
  quantity: number;
  unitPriceCents: number;
};

function parseLines(formData: FormData): LineInput[] {
  const lines: LineInput[] = [];
  for (let i = 0; i < 100; i++) {
    if (!formData.has(`description_${i}`)) break;
    const description = String(formData.get(`description_${i}`) ?? "").trim();
    const quantity = Math.max(
      1,
      Math.round(Number(formData.get(`quantity_${i}`) ?? 1)) || 1
    );
    const unitPriceCents = Math.max(
      0,
      Math.round(Number(formData.get(`unitPrice_${i}`) ?? 0) * 100)
    );
    if (description) {
      lines.push({ description, quantity, unitPriceCents });
    }
  }
  return lines;
}

export async function updateInvoice(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const session = await requireRole(["ADMIN"]);

  const id = String(formData.get("id") ?? "");
  const intent = String(formData.get("intent") ?? "save");
  const note = String(formData.get("note") ?? "").trim();
  const dueDateRaw = String(formData.get("dueDate") ?? "").trim();
  const newDueDate = dueDateRaw ? new Date(dueDateRaw) : null;
  const lines = parseLines(formData);

  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: {
      project: { select: { title: true } },
      client: { select: { name: true, email: true } },
    },
  });
  if (!invoice) return { ok: false, error: "Invoice not found." };
  if (invoice.status !== "DRAFT") {
    return { ok: false, error: "Only draft invoices can be edited." };
  }

  if (intent === "approve") {
    if (lines.length === 0) {
      return { ok: false, error: "Add at least one line item before sending." };
    }
    if (!lines.some((l) => l.unitPriceCents > 0)) {
      return { ok: false, error: "Add a price to at least one line item." };
    }
  }

  await prisma.$transaction([
    prisma.invoiceLineItem.deleteMany({ where: { invoiceId: id } }),
    prisma.invoiceLineItem.createMany({
      data: lines.map((l) => ({ invoiceId: id, ...l })),
    }),
    prisma.invoice.update({
      where: { id },
      data: {
        note: note || null,
        dueDate: newDueDate,
        status: intent === "approve" ? "SENT" : "DRAFT",
        sentAt: intent === "approve" ? new Date() : null,
      },
    }),
  ]);

  const action = intent === "approve" ? "INVOICE_SENT" : "INVOICE_UPDATED";
  await logAudit({
    actorId: session.sub,
    actorName: session.name,
    action,
    entityType: "Invoice",
    entityId: id,
    details: {
      number: invoice.number,
      project: invoice.project.title,
      lineItems: lines.length,
    },
  });

  if (intent === "approve") {
    await notify(invoice.clientId, {
      actorId: session.sub,
      projectId: invoice.projectId,
      type: "INVOICE",
      message: `Invoice ${invoice.number} for "${invoice.project.title}" is ready to view.`,
    });

    const total = invoiceTotalCents(lines);
    try {
      await sendMail({
        to: invoice.client.email,
        subject: `Invoice ${invoice.number} from Hedge Resource Centre`,
        text: `Hi ${invoice.client.name},

Invoice ${invoice.number} for project "${invoice.project.title}" is ready.

  Total: ${formatCents(total)}${newDueDate ? `\n  Due date: ${newDueDate.toLocaleDateString()}` : ""}

View and download the PDF at ${PORTAL_URL}/client/invoices

— HRC Portal`,
      });
    } catch (e) {
      console.error("Failed to send invoice email:", e);
    }
  }

  revalidatePath("/admin/invoices");
  revalidatePath(`/admin/invoices/${id}`);
  revalidatePath("/client/invoices");
  return { ok: true };
}

export async function markInvoicePaid(invoiceId: string) {
  const session = await requireRole(["ADMIN"]);

  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: {
      project: { select: { id: true, title: true } },
    },
  });
  if (!invoice) return;
  if (invoice.status !== "SENT") return;

  await prisma.invoice.update({
    where: { id: invoiceId },
    data: { status: "PAID", sentAt: invoice.sentAt ?? new Date() },
  });

  await logAudit({
    actorId: session.sub,
    actorName: session.name,
    action: "INVOICE_PAID",
    entityType: "Invoice",
    entityId: invoiceId,
    details: { number: invoice.number, project: invoice.project.title },
  });

  await notify(invoice.clientId, {
    actorId: session.sub,
    projectId: invoice.projectId,
    type: "INVOICE",
    message: `Invoice ${invoice.number} for "${invoice.project.title}" has been marked as paid.`,
  });

  revalidatePath("/admin/invoices");
  revalidatePath(`/admin/invoices/${invoiceId}`);
  revalidatePath("/client/invoices");
}

export async function cancelInvoice(invoiceId: string) {
  const session = await requireRole(["ADMIN"]);

  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: {
      project: { select: { id: true, title: true } },
    },
  });
  if (!invoice) return;
  if (invoice.status !== "DRAFT" && invoice.status !== "SENT") return;

  const next: InvoiceStatus = "CANCELLED";
  await prisma.invoice.update({
    where: { id: invoiceId },
    data: { status: next },
  });

  await logAudit({
    actorId: session.sub,
    actorName: session.name,
    action: "INVOICE_CANCELLED",
    entityType: "Invoice",
    entityId: invoiceId,
    details: { number: invoice.number, project: invoice.project.title },
  });

  revalidatePath("/admin/invoices");
  revalidatePath(`/admin/invoices/${invoiceId}`);
  revalidatePath("/client/invoices");
}