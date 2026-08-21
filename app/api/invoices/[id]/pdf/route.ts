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
    const doc = new PDFDocument({
      size: "A4",
      margin: 50,
      bufferPages: true,
      autoFirstPage: true,
    });
    const chunks: Buffer[] = [];
    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const LEFT = 50;
    const RIGHT = doc.page.width - 50;
    const BOTTOM = doc.page.height - 50;
    const CONTENT_WIDTH = RIGHT - LEFT;

    // Keep ~5pt right breathing room so right-aligned amount never clips at the edge
    const colDescriptionX = LEFT;
    const colDescriptionW = 260;
    const colQtyX = 325;
    const colQtyW = 40;
    const colPriceX = 375;
    const colPriceW = 75;
    const colAmountX = 460;
    const colAmountW = 80;

    // Right header block — explicit width prevents text starting at RIGHT edge from overflowing
    const HEADER_RIGHT_W = 185;
    const HEADER_RIGHT_X = RIGHT - HEADER_RIGHT_W;

    const FOOTER_RESERVE = 28;

    function bottomLimit() {
      // reserve space for footer + bottom margin
      return doc.page.height - 50 - FOOTER_RESERVE;
    }

    function drawHeader() {
      doc.fontSize(20).font("Helvetica-Bold").fillColor("#111827");
      doc.text("Hedge Resource Centre", LEFT, 50, { width: CONTENT_WIDTH - HEADER_RIGHT_W - 12 });
      doc.fontSize(10).font("Helvetica").fillColor("#6b7280");
      doc.text("Consulting & Risk Advisory", LEFT, 74, { width: CONTENT_WIDTH - HEADER_RIGHT_W - 12 });
      doc.text(`INVOICE`, HEADER_RIGHT_X, 50, { width: HEADER_RIGHT_W, align: "right" });
      doc.fontSize(10).fillColor("#111827");
      doc.text(invoice.number, HEADER_RIGHT_X, 68, { width: HEADER_RIGHT_W, align: "right" });
      doc.fillColor("#6b7280");
      doc.text(`Issued: ${invoice.createdAt.toLocaleDateString()}`, HEADER_RIGHT_X, 84, {
        width: HEADER_RIGHT_W,
        align: "right",
      });
      if (invoice.dueDate) {
        doc.text(`Due: ${invoice.dueDate.toLocaleDateString()}`, HEADER_RIGHT_X, 98, {
          width: HEADER_RIGHT_W,
          align: "right",
        });
      }

      doc.moveTo(LEFT, 116).lineTo(RIGHT, 116).lineWidth(1).strokeColor("#e5e7eb").stroke();

      doc.fontSize(11).fillColor("#111827").font("Helvetica-Bold");
      doc.text("BILLED TO", LEFT, 134);
      doc.font("Helvetica").fontSize(11).fillColor("#374151");
      doc.text(invoice.client.name, LEFT, 152);
      doc.text(invoice.client.email, LEFT, 168);
      doc.fillColor("#6b7280").fontSize(10);
      doc.text(`Project: ${invoice.project.title}`, LEFT, 190, {
        width: CONTENT_WIDTH,
      });

      const statusLabel =
        INVOICE_STATUS_LABEL[invoice.status as keyof typeof INVOICE_STATUS_LABEL] ??
        invoice.status;
      doc.fillColor("#059669").font("Helvetica-Bold");
      doc.text(statusLabel.toUpperCase(), HEADER_RIGHT_X, 134, {
        width: HEADER_RIGHT_W,
        align: "right",
      });

      doc.moveTo(LEFT, 208).lineTo(RIGHT, 208).lineWidth(1).strokeColor("#e5e7eb").stroke();
    }

    function drawTableHeader(y: number) {
      doc.fontSize(9).font("Helvetica-Bold").fillColor("#6b7280");
      doc.text("DESCRIPTION", colDescriptionX, y, { width: colDescriptionW });
      doc.text("QTY", colQtyX, y, { width: colQtyW, align: "right" });
      doc.text("UNIT PRICE", colPriceX, y, { width: colPriceW, align: "right" });
      doc.text("AMOUNT", colAmountX, y, { width: colAmountW, align: "right" });
      const lineY = y + 14;
      doc.moveTo(LEFT, lineY).lineTo(RIGHT, lineY).lineWidth(1).strokeColor("#e5e7eb").stroke();
      return lineY + 8;
    }

    function ensureSpace(y: number, needed: number, withHeader = false) {
      if (y + needed <= bottomLimit()) return y;
      doc.addPage();
      // reset RIGHT/BOTTOM refs stay same (A4)
      if (withHeader) {
        // repeating header is noisy on continuation pages — only repeat column titles
        return drawTableHeader(50);
      }
      return 50;
    }

    drawHeader();
    let y = drawTableHeader(226);

    // Rows — measure height to support wrapped descriptions
    doc.font("Helvetica").fontSize(10).fillColor("#111827");
    for (const line of invoice.lines) {
      const descHeight = doc.heightOfString(line.description || "—", {
        width: colDescriptionW,
      });
      const rowHeight = Math.max(16, Math.ceil(descHeight) + 6);

      // need row + a bit of padding; if next row would overflow, paginate before drawing it
      y = ensureSpace(y, rowHeight + 4, true);

      const rowTop = y;
      doc.font("Helvetica").fontSize(9).fillColor("#111827");
      doc.text(line.description || "—", colDescriptionX, rowTop, {
        width: colDescriptionW,
      });
      doc.text(String(line.quantity), colQtyX, rowTop, {
        width: colQtyW,
        align: "right",
      });
      doc.text(formatCents(line.unitPriceCents), colPriceX, rowTop, {
        width: colPriceW,
        align: "right",
      });
      doc.text(formatCents(lineTotalCents(line)), colAmountX, rowTop, {
        width: colAmountW,
        align: "right",
      });
      y += rowHeight;
      // light row divider
      doc.moveTo(LEFT, y).lineTo(RIGHT, y).lineWidth(0.5).strokeColor("#f3f4f6").stroke();
      y += 6;
    }

    // Total block — keep together
    const totalBlockHeight = 42;
    y = ensureSpace(y, totalBlockHeight, false);
    // strong divider above total
    doc.moveTo(LEFT, y).lineTo(RIGHT, y).lineWidth(1).strokeColor("#e5e7eb").stroke();
    y += 12;
    doc.font("Helvetica-Bold").fontSize(11).fillColor("#111827");
    doc.text("TOTAL", LEFT, y);
    doc.text(formatCents(invoiceTotalCents(invoice.lines)), colAmountX, y, {
      width: colAmountW,
      align: "right",
    });
    y += 28;

    if (invoice.note) {
      doc.font("Helvetica").fontSize(9).fillColor("#6b7280");
      const noteHeight = doc.heightOfString(invoice.note, {
        width: CONTENT_WIDTH,
      });
      y = ensureSpace(y, Math.min(noteHeight, 80), false);
      // heading for note
      doc.font("Helvetica-Bold").fontSize(9).fillColor("#6b7280");
      doc.text("NOTE", LEFT, y);
      y += 12;
      doc.font("Helvetica").fontSize(9).fillColor("#6b7280");
      // height check again for wrapped note
      const remainingNoteHeight = doc.heightOfString(invoice.note, {
        width: CONTENT_WIDTH,
      });
      if (y + remainingNoteHeight > bottomLimit()) {
        // split note: let pdfkit flow it across pages naturally
        doc.text(invoice.note, LEFT, y, {
          width: CONTENT_WIDTH,
          lineBreak: true,
        });
      } else {
        doc.text(invoice.note, LEFT, y, { width: CONTENT_WIDTH, lineBreak: true });
      }
    }

    // Page numbers footer
    const pages = doc.bufferedPageRange();
    for (let i = 0; i < pages.count; i++) {
      doc.switchToPage(i);
      doc.fontSize(8).font("Helvetica").fillColor("#9ca3af");
      doc.text(`Page ${i + 1} of ${pages.count}  •  ${invoice.number}`, LEFT, BOTTOM + 14, {
        width: CONTENT_WIDTH,
        align: "center",
      });
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