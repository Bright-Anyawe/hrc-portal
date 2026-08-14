import { NextRequest, NextResponse } from "next/server";
import PDFDocument from "pdfkit";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/auth";
import {
  INVOICE_STATUS_LABEL,
  formatCents,
  lineTotalCents,
  invoiceTotalCents,
} from "@/lib/invoices";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function buildPdf(
  invoice: {
    number: string;
    status: string;
    note: string | null;
    createdAt: Date;
    sentAt: Date | null;
    dueDate: Date | null;
    project: { title: string };
    client: { name: string; email: string };
    lines: { description: string; quantity: number; unitPriceCents: number }[];
  }
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: 50 });
    const chunks: Buffer[] = [];
    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const right = doc.page.width - 50;
    const tableX = 50;
    const colDescription = 60;
    const colQty = 340;
    const colPrice = 420;
    const colAmount = right;

    doc.fontSize(20).font("Helvetica-Bold").fillColor("#111827");
    doc.text("Hedge Resource Centre", 50, 50);
    doc.fontSize(10).font("Helvetica").fillColor("#6b7280");
    doc.text("Consulting & Risk Advisory", 50, 74);
    doc.text(`INVOICE`, right, 50, { align: "right" });
    doc.fontSize(10).fillColor("#111827");
    doc.text(invoice.number, right, 68, { align: "right" });
    doc.fillColor("#6b7280");
    doc.text(
      `Issued: ${invoice.createdAt.toLocaleDateString()}`,
      right,
      84,
      { align: "right" }
    );
    if (invoice.dueDate) {
      doc.text(`Due: ${invoice.dueDate.toLocaleDateString()}`, right, 98, {
        align: "right",
      });
    }

    doc.moveTo(50, 116).lineTo(right, 116).lineWidth(1).strokeColor("#e5e7eb").stroke();

    doc.fontSize(11).fillColor("#111827").font("Helvetica-Bold");
    doc.text("BILLED TO", 50, 134);
    doc.font("Helvetica").fontSize(11).fillColor("#374151");
    doc.text(invoice.client.name, 50, 152);
    doc.text(invoice.client.email, 50, 168);
    doc.fillColor("#6b7280").fontSize(10);
    doc.text(`Project: ${invoice.project.title}`, 50, 190);

    const statusLabel = INVOICE_STATUS_LABEL[
      invoice.status as keyof typeof INVOICE_STATUS_LABEL
    ];
    doc.fillColor("#059669").font("Helvetica-Bold");
    doc.text(statusLabel.toUpperCase(), right, 134, { align: "right" });

    doc.moveTo(50, 208).lineTo(right, 208).lineWidth(1).strokeColor("#e5e7eb").stroke();

    let y = 226;
    doc.fontSize(10).font("Helvetica-Bold").fillColor("#6b7280");
    doc.text("DESCRIPTION", tableX, y);
    doc.text("QTY", colQty, y);
    doc.text("UNIT PRICE", colPrice, y, { width: 90, align: "right" });
    doc.text("AMOUNT", colAmount, y, { width: 90, align: "right" });
    y += 24;
    doc.moveTo(50, y - 6).lineTo(right, y - 6).lineWidth(1).strokeColor("#e5e7eb").stroke();

    doc.font("Helvetica").fontSize(10).fillColor("#111827");
    for (const line of invoice.lines) {
      doc.text(line.description, tableX, y, { width: 280 });
      doc.text(String(line.quantity), colQty, y, { width: 60, align: "right" });
      doc.text(formatCents(line.unitPriceCents), colPrice, y, {
        width: 90,
        align: "right",
      });
      doc.text(formatCents(lineTotalCents(line)), colAmount, y, {
        width: 90,
        align: "right",
      });
      y += 22;
    }

    y += 6;
    doc.moveTo(50, y).lineTo(right, y).lineWidth(1).strokeColor("#e5e7eb").stroke();
    y += 14;
    doc.font("Helvetica-Bold").fontSize(11).fillColor("#111827");
    doc.text("TOTAL", tableX, y);
    doc.text(formatCents(invoiceTotalCents(invoice.lines)), colAmount, y, {
      width: 90,
      align: "right",
    });
    y += 30;

    if (invoice.note) {
      doc.font("Helvetica").fontSize(9).fillColor("#6b7280");
      doc.text(invoice.note, tableX, y, { width: right - tableX, lineBreak: true });
    }

    doc.end();
  });
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await verifySession();
  if (!session) return new NextResponse("Unauthorized", { status: 401 });
  if (session.role !== "ADMIN" && session.role !== "CLIENT") {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const { id } = await params;
  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: {
      project: { select: { title: true } },
      client: { select: { name: true, email: true } },
      lines: {
        select: {
          description: true,
          quantity: true,
          unitPriceCents: true,
        },
      },
    },
  });
  if (!invoice) return new NextResponse("Not found", { status: 404 });

  if (session.role === "CLIENT") {
    if (invoice.clientId !== session.sub) {
      return new NextResponse("Forbidden", { status: 403 });
    }
    if (invoice.status === "DRAFT" || invoice.status === "CANCELLED") {
      return new NextResponse("Not available", { status: 403 });
    }
  }

  const buffer = await buildPdf(invoice);
  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${invoice.number}.pdf"`,
    },
  });
}