import Link from "next/link";
import { Users, Briefcase, FolderKanban, CheckCircle2 } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";
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

  const [clientCount, consultantCount, projectCount, activeCount, recentProjects] =
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
    ]);

  const stats = [
    { label: "Clients", value: clientCount, icon: Users },
    { label: "Consultants", value: consultantCount, icon: Briefcase },
    { label: "Projects", value: projectCount, icon: FolderKanban },
    { label: "Active projects", value: activeCount, icon: CheckCircle2 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Admin overview</h1>
        <p className="text-sm text-muted-foreground">
          Manage consultants, clients, assignments and projects.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
