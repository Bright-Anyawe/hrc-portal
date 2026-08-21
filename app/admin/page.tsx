import Link from "next/link";
import {
  Users,
  Briefcase,
  FolderKanban,
  CheckCircle2,
  Receipt,
  AlertTriangle,
  UserPlus,
  PlusCircle,
  ArrowUpRight,
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
import { StatCard } from "@/components/stat-card";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, getInitials } from "@/components/ui/avatar";
import { PortalHero } from "@/components/portal-hero";
import { STATUS_LABEL, STATUS_VARIANT } from "@/lib/status";

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export default async function AdminOverviewPage() {
  const session = await requireRole(["ADMIN"]);

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
    {
      label: "Clients",
      value: clientCount,
      icon: Users,
      iconClassName: "bg-brand-sky/15 text-brand-sky",
      footer: "Active client accounts",
    },
    {
      label: "Consultants",
      value: consultantCount,
      icon: Briefcase,
      iconClassName: "bg-brand-navy/10 text-brand-navy",
      footer: "Staff delivering work",
    },
    {
      label: "Projects",
      value: projectCount,
      icon: FolderKanban,
      iconClassName: "bg-brand-red/10 text-brand-red",
      footer: "Across all engagements",
    },
    {
      label: "Active projects",
      value: activeCount,
      icon: CheckCircle2,
      iconClassName: "bg-emerald-600/10 text-emerald-600",
      footer: "Currently in delivery",
    },
    {
      label: "Outstanding",
      value: formatCents(outstandingTotal),
      icon: Receipt,
      iconClassName: "bg-brand-gold/15 text-brand-gold",
      footer: "Sent but unpaid",
    },
    {
      label: "Overdue",
      value: overdue.length,
      icon: AlertTriangle,
      iconClassName: "bg-destructive/10 text-destructive",
      footer: "Past due date",
    },
  ];

  return (
    <div className="space-y-6">
      <PortalHero
        tone="admin"
        eyebrow={greeting()}
        title={session.name}
        description="Manage consultants, clients, projects and invoicing from one place."
        split
        actions={
          <>
            <Link
              href="/admin/clients"
              className="inline-flex items-center gap-1.5 rounded-lg bg-brand-red px-3.5 py-2 text-sm font-medium text-white shadow-md transition-all hover:bg-brand-red/90 hover:shadow-lg active:scale-95 motion-reduce:active:scale-100"
            >
              <UserPlus className="h-4 w-4" />
              Invite client
            </Link>
            <Link
              href="/admin/projects"
              className="inline-flex items-center gap-1.5 rounded-lg bg-white/15 px-3.5 py-2 text-sm font-medium text-white backdrop-blur transition-all hover:bg-white/25 active:scale-95 motion-reduce:active:scale-100"
            >
              <PlusCircle className="h-4 w-4" />
              New project
            </Link>
            <Link
              href="/admin/invoices"
              className="inline-flex items-center gap-1.5 rounded-lg bg-white/15 px-3.5 py-2 text-sm font-medium text-white backdrop-blur transition-all hover:bg-white/25 active:scale-95 motion-reduce:active:scale-100"
            >
              <Receipt className="h-4 w-4" />
              Review invoices
            </Link>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        {stats.map((stat, i) => (
          <StatCard
            key={stat.label}
            label={stat.label}
            value={stat.value}
            icon={stat.icon}
            iconClassName={stat.iconClassName}
            footer={stat.footer}
            delay={i * 50}
          />
        ))}
      </div>

      <div className="flex items-center justify-between rounded-xl border border-brand-gold/30 bg-brand-gold/5 px-4 py-3 text-sm">
        <p className="text-foreground">
          Collected to date:{" "}
          <span className="font-semibold text-brand-navy">
            {formatCents(paidTotal)}
          </span>
        </p>
      </div>

      <Card className="overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Outstanding invoices</CardTitle>
          <Link
            href="/admin/invoices"
            className="inline-flex items-center gap-1 text-sm font-medium text-primary transition-colors hover:underline"
          >
            View all
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </CardHeader>
        <CardContent className="pt-0">
          {outstanding.length === 0 ? (
            <EmptyState
              icon={CheckCircle2}
              title="No outstanding invoices"
              description="All sent invoices have been paid. Great work keeping things on track."
            />
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
                    <TableRow key={invoice.id} className="transition-colors">
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

      <Card className="overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent projects</CardTitle>
          <Link
            href="/admin/projects"
            className="inline-flex items-center gap-1 text-sm font-medium text-primary transition-colors hover:underline"
          >
            View all
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </CardHeader>
        <CardContent className="pt-0">
          {recentProjects.length === 0 ? (
            <EmptyState
              icon={FolderKanban}
              title="No projects yet"
              description="Create your first project to get started."
              action={
                <Link
                  href="/admin/projects"
                  className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90 active:scale-95 motion-reduce:active:scale-100"
                >
                  <PlusCircle className="h-4 w-4" />
                  New project
                </Link>
              }
            />
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
                  <TableRow key={project.id} className="transition-colors">
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