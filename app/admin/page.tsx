import Link from "next/link";
import {
  Users,
  Briefcase,
  FolderKanban,
  CheckCircle2,
  Receipt,
  AlertTriangle,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";
import { formatCents, invoiceTotalCents } from "@/lib/invoices";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, getInitials } from "@/components/ui/avatar";
import { STATUS_LABEL, STATUS_VARIANT } from "@/lib/status";

export default async function AdminOverviewPage() {
  await requireRole(["ADMIN"]);

  const [clientCount, consultantCount, projectCount, activeCount, recentProjects, outstanding, paidInvoices] =
    await Promise.all([
      prisma.user.count({ where: { role: "CLIENT" } }),
      prisma.user.count({ where: { role: "CONSULTANT" } }),
      prisma.project.count(),
      prisma.project.count({ where: { status: "ACTIVE" } }),
      prisma.project.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          client: { select: { name: true } },
          consultant: { select: { name: true } },
        },
      }),
      prisma.invoice.findMany({
        where: { status: "SENT" },
        orderBy: { dueDate: "asc" },
        include: {
          project: { select: { title: true } },
          client: { select: { name: true } },
          lines: true,
        },
      }),
      prisma.invoice.findMany({
        where: { status: "PAID" },
        include: { lines: true },
      }),
    ]);

  const now = new Date();
  const overdue = outstanding.filter(
    (inv) => inv.dueDate && inv.dueDate < now
  );
  const outstandingTotal = invoiceTotalCents(
    outstanding.flatMap((inv) => inv.lines)
  );
  const paidTotal = invoiceTotalCents(paidInvoices.flatMap((i) => i.lines));

  const stats = [
    { label: "Clients", value: clientCount, icon: Users },
    { label: "Consultants", value: consultantCount, icon: Briefcase },
    { label: "Projects", value: projectCount, icon: FolderKanban },
    { label: "Active projects", value: activeCount, icon: CheckCircle2 },
    { label: "Outstanding", value: formatCents(outstandingTotal), icon: Receipt },
    { label: "Overdue", value: overdue.length, icon: AlertTriangle },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Admin overview</h1>
        <p className="text-sm text-muted-foreground">
          Manage consultants, clients, assignments and projects.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.label}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <p className="text-sm text-muted-foreground">
        Collected to date:{" "}
        <span className="font-semibold text-foreground">
          {formatCents(paidTotal)}
        </span>
      </p>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Outstanding invoices</CardTitle>
          <Link
            href="/admin/invoices"
            className="text-sm text-primary hover:underline"
          >
            View all
          </Link>
        </CardHeader>
        <CardContent className="pt-0">
          {outstanding.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No outstanding invoices. All sent invoices have been paid.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice</TableHead>
                  <TableHead>Project</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Due</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {outstanding.map((invoice) => {
                  const isOverdue = invoice.dueDate && invoice.dueDate < now;
                  return (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-medium">
                        <Link
                          href={`/admin/invoices/${invoice.id}`}
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
                      <TableCell>{invoice.client.name}</TableCell>
                      <TableCell>
                        {invoice.dueDate ? (
                          <span
                            className={
                              isOverdue
                                ? "font-medium text-destructive"
                                : undefined
                            }
                          >
                            {invoice.dueDate.toLocaleDateString()}
                            {isOverdue && " (overdue)"}
                          </span>
                        ) : (
                          "—"
                        )}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCents(invoiceTotalCents(invoice.lines))}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent projects</CardTitle>
          <Link
            href="/admin/projects"
            className="text-sm text-primary hover:underline"
          >
            View all
          </Link>
        </CardHeader>
        <CardContent className="pt-0">
          {recentProjects.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No projects yet. Create your first project.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Project</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Consultant</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentProjects.map((project) => (
                  <TableRow key={project.id}>
                    <TableCell className="font-medium">
                      {project.title}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="text-[10px]">
                            {getInitials(project.client.name)}
                          </AvatarFallback>
                        </Avatar>
                        {project.client.name}
                      </div>
                    </TableCell>
                    <TableCell>
                      {project.consultant?.name ?? (
                        <span className="text-muted-foreground">
                          Unassigned
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={STATUS_VARIANT[project.status]}>
                        {STATUS_LABEL[project.status]}
                      </Badge>
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
