import Link from "next/link";
import { FileText, Download, Eye } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";
import {
  INVOICE_STATUS_LABEL,
  INVOICE_STATUS_VARIANT,
  invoiceTotalCents,
  formatCents,
} from "@/lib/invoices";
import { PayInvoiceButton } from "@/components/client/pay-invoice-button";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
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
import { PageHeader } from "@/components/page-header";

export default async function ClientInvoicesPage() {
  const session = await requireRole(["CLIENT"]);

  const invoices = await prisma.invoice.findMany({
    where: { clientId: session.sub, status: { in: ["SENT", "PAID"] } },
    orderBy: { createdAt: "desc" },
    include: {
      project: { select: { title: true } },
      lines: true,
    },
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Invoices"
        description="Invoices for your projects with Hedge Resource Centre."
      />

      <Card>
        <CardHeader>
          <CardTitle>Your invoices</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {invoices.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-16 text-center">
              <FileText className="h-10 w-10 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                You have no invoices yet. Invoices appear here once a project is
                completed and sent.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice</TableHead>
                  <TableHead>Project</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Due date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((invoice) => {
                  const total = invoiceTotalCents(invoice.lines);
                  const payable = invoice.status === "SENT" && total > 0;
                  return (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-medium">
                        <Link
                          href={`/client/invoices/${invoice.id}`}
                          className="text-primary hover:underline"
                        >
                          {invoice.number}
                        </Link>
                      </TableCell>
                      <TableCell className="max-w-xs">
                        <span className="line-clamp-1">
                          {invoice.project.title}
                        </span>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCents(total)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={INVOICE_STATUS_VARIANT[invoice.status]}>
                          {INVOICE_STATUS_LABEL[invoice.status]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {invoice.dueDate
                          ? invoice.dueDate.toLocaleDateString()
                          : "—"}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-1">
                          {payable && (
                            <PayInvoiceButton
                              invoiceId={invoice.id}
                              size="sm"
                            />
                          )}
                          <Link
                            href={`/client/invoices/${invoice.id}`}
                            className={buttonVariants({
                              variant: "outline",
                              size: "sm",
                            })}
                            aria-label={`View invoice ${invoice.number}`}
                          >
                            <Eye className="h-3.5 w-3.5" />
                            View
                          </Link>
                          <a
                            href={`/api/invoices/${invoice.id}/pdf`}
                            className={buttonVariants({
                              variant: "outline",
                              size: "sm",
                            })}
                            aria-label={`Download invoice ${invoice.number} PDF`}
                          >
                            <Download className="h-3.5 w-3.5" />
                            PDF
                          </a>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}