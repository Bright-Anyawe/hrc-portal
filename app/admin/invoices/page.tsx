import Link from "next/link";
import { FileText, Download, CheckCircle2 } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";
import { markInvoicePaid } from "@/app/actions/invoices";
import {
  INVOICE_STATUS_LABEL,
  INVOICE_STATUS_VARIANT,
  invoiceTotalCents,
  formatCents,
} from "@/lib/invoices";
import { Badge } from "@/components/ui/badge";
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
import { PageHeader } from "@/components/page-header";

type Filter = "all" | "DRAFT" | "SENT" | "PAID" | "CANCELLED";

const FILTERS: { value: Filter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "DRAFT", label: "Drafts" },
  { value: "SENT", label: "Sent" },
  { value: "PAID", label: "Paid" },
  { value: "CANCELLED", label: "Cancelled" },
];

export default async function AdminInvoicesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  await requireRole(["ADMIN"]);

  const { status } = await searchParams;
  const filter: Filter =
    status && FILTERS.some((f) => f.value === status)
      ? (status as Filter)
      : "all";

  const invoices = await prisma.invoice.findMany({
    where: filter === "all" ? undefined : { status: filter },
    orderBy: { createdAt: "desc" },
    include: {
      project: { select: { title: true } },
      client: { select: { name: true } },
      lines: true,
    },
  });

  const draftCount = await prisma.invoice.count({ where: { status: "DRAFT" } });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Invoices"
        description="Invoices are drafted automatically when a project is completed. Review, price and send them from here."
      />

      <div className="flex flex-wrap items-center gap-2">
        {FILTERS.map((f) => (
          <Link
            key={f.value}
            href={
              f.value === "all"
                ? "/admin/invoices"
                : `/admin/invoices?status=${f.value}`
            }
            className={
              filter === f.value
                ? "inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground"
                : "inline-flex items-center gap-1.5 rounded-md border bg-background px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground"
            }
          >
            {f.label}
            {f.value === "DRAFT" && draftCount > 0 && (
              <Badge variant="destructive" className="px-1.5 py-0 text-[10px]">
                {draftCount}
              </Badge>
            )}
          </Link>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {filter === "all"
              ? "All invoices"
              : `${INVOICE_STATUS_LABEL[filter]} invoices`}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {invoices.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-16 text-center">
              <FileText className="h-10 w-10 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                No invoices here yet. Complete a project and a draft will appear
                automatically.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice</TableHead>
                  <TableHead>Project</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((invoice) => {
                  const total = invoiceTotalCents(invoice.lines);
                  return (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-medium">
                        <Link
                          href={`/admin/invoices/${invoice.id}`}
                          className="text-primary hover:underline"
                        >
                          {invoice.number}
                        </Link>
                        <p className="text-xs text-muted-foreground">
                          {invoice.createdAt.toLocaleDateString()}
                        </p>
                      </TableCell>
                      <TableCell className="max-w-xs">
                        <span className="line-clamp-1">
                          {invoice.project.title}
                        </span>
                      </TableCell>
                      <TableCell>{invoice.client.name}</TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCents(total)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={INVOICE_STATUS_VARIANT[invoice.status]}>
                          {INVOICE_STATUS_LABEL[invoice.status]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-1">
                          {invoice.status === "DRAFT" && (
                            <Link
                              href={`/admin/invoices/${invoice.id}`}
                              className={buttonVariants({
                                variant: "outline",
                                size: "sm",
                              })}
                            >
                              <FileText className="h-3.5 w-3.5" />
                              Review
                            </Link>
                          )}
                          {invoice.status === "SENT" && (
                            <>
                              <form
                                action={markInvoicePaid.bind(null, invoice.id)}
                              >
                                <Button type="submit" size="sm">
                                  <CheckCircle2 className="h-3.5 w-3.5" />
                                  Mark paid
                                </Button>
                              </form>
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
                            </>
                          )}
                          {(invoice.status === "PAID" ||
                            invoice.status === "CANCELLED") && (
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
                          )}
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