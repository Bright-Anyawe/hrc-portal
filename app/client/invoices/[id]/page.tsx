import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Download,
  FileText,
  Receipt,
  CheckCircle2,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";
import {
  INVOICE_STATUS_LABEL,
  INVOICE_STATUS_VARIANT,
  PAYMENT_STATUS_LABEL,
  PAYMENT_STATUS_VARIANT,
  invoiceTotalCents,
  lineTotalCents,
  formatCents,
} from "@/lib/invoices";
import { PayInvoiceButton } from "@/components/client/pay-invoice-button";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default async function ClientInvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireRole(["CLIENT"]);

  const { id } = await params;
  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: {
      project: { select: { title: true, status: true } },
      lines: true,
      payments: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!invoice || invoice.clientId !== session.sub) notFound();
  if (invoice.status === "DRAFT" || invoice.status === "CANCELLED") notFound();

  const total = invoiceTotalCents(invoice.lines);
  const payable = invoice.status === "SENT" && total > 0;

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/client/invoices"
          className="mb-2 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to invoices
        </Link>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">
              {invoice.number}
            </h1>
            <Badge variant={INVOICE_STATUS_VARIANT[invoice.status]}>
              {INVOICE_STATUS_LABEL[invoice.status]}
            </Badge>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {payable && <PayInvoiceButton invoiceId={invoice.id} />}
            <a
              href={`/api/invoices/${invoice.id}/pdf`}
              className={buttonVariants({ variant: "outline", size: "default" })}
            >
              <Download className="h-4 w-4" />
              Download PDF
            </a>
          </div>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          {invoice.project.title}
        </p>
      </div>

      {payable && (
        <Card className="border-brand-gold/40 bg-gradient-to-br from-brand-navy to-brand-navy-light text-white">
          <CardContent className="flex flex-wrap items-center justify-between gap-4 pt-6">
            <div>
              <p className="text-sm font-medium text-white/70">Amount due</p>
              <p className="text-2xl font-bold">{formatCents(total)}</p>
            </div>
            <PayInvoiceButton invoiceId={invoice.id} size="lg" />
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Line items</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {invoice.lines.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="No line items on this invoice"
              description="This invoice has no priced line items yet."
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Qty</TableHead>
                  <TableHead className="text-right">Unit price</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoice.lines.map((line) => (
                  <TableRow key={line.id}>
                    <TableCell>{line.description}</TableCell>
                    <TableCell className="text-right">{line.quantity}</TableCell>
                    <TableCell className="text-right">
                      {formatCents(line.unitPriceCents)}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCents(lineTotalCents(line))}
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell colSpan={3} className="text-right font-semibold">
                    Total
                  </TableCell>
                  <TableCell className="text-right font-bold">
                    {formatCents(total)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {(invoice.dueDate || invoice.note) && (
        <Card>
          <CardHeader>
            <CardTitle>Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
            {invoice.dueDate && (
              <p>
                <span className="text-muted-foreground">Due: </span>
                {invoice.dueDate.toLocaleDateString()}
              </p>
            )}
            {invoice.note && <p>{invoice.note}</p>}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Payments</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {invoice.payments.length === 0 ? (
            <EmptyState
              icon={Receipt}
              title="No payments yet"
              description={
                payable
                  ? "Payments you make for this invoice will appear here."
                  : "This invoice has no recorded payments."
              }
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Reference</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoice.payments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>
                      {payment.paidAt?.toLocaleDateString() ??
                        payment.createdAt.toLocaleDateString()}
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {payment.reference}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCents(payment.amountCents)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={PAYMENT_STATUS_VARIANT[payment.status]}>
                        {PAYMENT_STATUS_LABEL[payment.status]}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {invoice.status === "PAID" && (
            <p className="mt-4 flex items-center gap-1.5 text-sm font-medium text-emerald-600">
              <CheckCircle2 className="h-4 w-4" />
              This invoice is paid in full.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}