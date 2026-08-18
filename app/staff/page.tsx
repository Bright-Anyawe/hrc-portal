import Link from "next/link";
import { ArrowRight, Building2, FolderKanban } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, getInitials } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { STATUS_LABEL, STATUS_VARIANT } from "@/lib/status";

type ProjectWithProgress = {
  id: string;
  title: string;
  status: string;
  clientId: string;
  clientName: string;
  completed: number;
  total: number;
};

export default async function StaffPage() {
  const session = await requireRole(["CONSULTANT"]);

  const projects = await prisma.project.findMany({
    where: { consultantId: session.sub },
    orderBy: { updatedAt: "desc" },
    include: {
      client: { select: { id: true, name: true, email: true } },
      tasks: { select: { id: true, isCompleted: true } },
    },
  });

  const grouped = projects.reduce<Map<string, ProjectWithProgress[]>>(
    (map, project) => {
      const entry = {
        id: project.id,
        title: project.title,
        status: project.status,
        clientId: project.client.id,
        clientName: project.client.name,
        completed: project.tasks.filter((t) => t.isCompleted).length,
        total: project.tasks.length,
      };
      const list = map.get(project.client.id) ?? [];
      list.push(entry);
      map.set(project.client.id, list);
      return map;
    },
    new Map()
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">My clients</h1>
        <p className="text-sm text-muted-foreground">
          Projects you are actively delivering.
        </p>
      </div>

      {projects.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
            <FolderKanban className="h-10 w-10 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              No clients assigned yet. An administrator needs to assign you a
              client.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {[...grouped.entries()].map(([clientId, clientProjects]) => {
            const client = clientProjects[0];
            return (
              <Card key={clientId}>
                <CardHeader className="flex flex-row items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>
                      {getInitials(client.clientName)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      {client.clientName}
                    </CardTitle>
                    <p className="text-xs text-muted-foreground">
                      {clientProjects.length} project
                      {clientProjects.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 pt-0">
                  {clientProjects.map((project) => {
                    const progress =
                      project.total === 0
                        ? 0
                        : Math.round((project.completed / project.total) * 100);
                    return (
                      <Link
                        key={project.id}
                        href={`/staff/projects/${project.id}`}
                        className="group block rounded-lg border p-4 transition-colors hover:bg-muted/40"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <p className="truncate font-medium group-hover:text-primary">
                              {project.title}
                            </p>
                            <p className="mt-0.5 text-xs text-muted-foreground">
                              {project.completed} of {project.total} tasks done
                            </p>
                          </div>
                          <div className="flex shrink-0 items-center gap-3">
                            <Badge variant={STATUS_VARIANT[project.status as keyof typeof STATUS_VARIANT]}>
                              {STATUS_LABEL[project.status as keyof typeof STATUS_LABEL]}
                            </Badge>
                            <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                          </div>
                        </div>
                        <Progress value={progress} className="mt-3" />
                      </Link>
                    );
                  })}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
