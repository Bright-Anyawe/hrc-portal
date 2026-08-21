import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Download, CheckCircle2, XCircle, FileText, Receipt } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";
import { markInvoicePaid, cancelInvoice } from "@/app/actions/invoices";
import {
  INVOICE_STATUS_LABEL,
  INVOICE_STATUS_VARIANT,
  PAYMENT_STATUS_LABEL,
  PAYMENT_STATUS_VARIANT,
  invoiceTotalCents,
  lineTotalCents,
  formatCents,
} from "@/lib/invoices";
import { InvoiceEditor } from "@/components/admin/invoice-editor";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Button, buttonVariants } from "@/components/ui/button";
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

export default async function AdminInvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireRole(["ADMIN"]);

  const { id } = await params;
  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: {
      project: { select: { title: true, status: true } },
      client: { select: { name: true, email: true } },
      lines: true,
      payments: { orderBy: { createdAt: "desc" } },
    },
  });
  if (!invoice) notFound();

  const total = invoiceTotalCents(invoice.lines);

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/invoices"
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
          <div className="flex gap-2">
            {invoice.status !== "DRAFT" && (
              <a
                href={`/api/invoices/${invoice.id}/pdf`}
                className={buttonVariants({ variant: "outline", size: "sm" })}
              >
                <Download className="h-3.5 w-3.5" />
                Download PDF
              </a>
            )}
            {invoice.status === "SENT" && (
              <>
                <form action={markInvoicePaid.bind(null, invoice.id)}>
                  <Button type="submit" size="sm">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Mark paid
                  </Button>
                </form>
                <form action={cancelInvoice.bind(null, invoice.id)}>
                  <Button type="submit" variant="outline" size="sm">
                    <XCircle className="h-3.5 w-3.5" />
                    Cancel
                  </Button>
                </form>
              </>
            )}
          </div>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          {invoice.project.title} · {invoice.client.name} ·{" "}
          {invoice.client.email}
        </p>
      </div>

      {invoice.status === "DRAFT" ? (
        <Card>
          <CardHeader>
            <CardTitle>Edit & approve</CardTitle>
          </CardHeader>
          <CardContent>
            <InvoiceEditor
              invoiceId={invoice.id}
              initialLines={invoice.lines.map((l) => ({
                description: l.description,
                quantity: l.quantity,
                unitPriceCents: l.unitPriceCents,
              }))}
              initialNote={invoice.note}
              initialDueDate={
                invoice.dueDate
                  ? invoice.dueDate.toISOString().slice(0, 10)
                  : null
              }
            />
          </CardContent>
        </Card>
      ) : (
        <>
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
                        <TableCell className="text-right">
                          {line.quantity}
                        </TableCell>
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

          {(invoice.note || invoice.dueDate) && (
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
                {invoice.sentAt && (
                  <p>
                    <span className="text-muted-foreground">Sent: </span>
                    {invoice.sentAt.toLocaleString()}
                  </p>
                )}
                {invoice.note && <p>{invoice.note}</p>}
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="h-4 w-4 text-muted-foreground" />
                Payments
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              {invoice.payments.length === 0 ? (
                <EmptyState
                  icon={Receipt}
                  title="No payments recorded"
                  description="Online payments made by the client will appear here."
                />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Reference</TableHead>
                      <TableHead>Channel</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invoice.payments.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell>
                          {payment.paidAt?.toLocaleString() ??
                            payment.createdAt.toLocaleString()}
                        </TableCell>
                        <TableCell className="font-mono text-xs">
                          {payment.reference}
                        </TableCell>
                        <TableCell className="capitalize">
                          {payment.channel ?? "—"}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCents(payment.amountCents)}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={PAYMENT_STATUS_VARIANT[payment.status]}
                          >
                            {PAYMENT_STATUS_LABEL[payment.status]}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}