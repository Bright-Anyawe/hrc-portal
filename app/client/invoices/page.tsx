import { FileText, Download } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";
import {
  INVOICE_STATUS_LABEL,
  INVOICE_STATUS_VARIANT,
  invoiceTotalCents,
  formatCents,
} from "@/lib/invoices";
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
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Invoices</h1>
        <p className="text-sm text-muted-foreground">
          Invoices for your projects with Hedge Resource Centre.
        </p>
      </div>

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
                  <TableHead className="text-right">Download</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-medium">
                      {invoice.number}
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <span className="line-clamp-1">
                        {invoice.project.title}
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCents(invoiceTotalCents(invoice.lines))}
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
                      <div className="flex justify-end">
                        <a
                          href={`/api/invoices/${invoice.id}/pdf`}
                          className={buttonVariants({
                            variant: "outline",
                            size: "sm",
                          })}
                        >
                          <Download className="h-3.5 w-3.5" />
                          PDF
                        </a>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}