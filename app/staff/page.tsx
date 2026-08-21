import Link from "next/link";
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  FolderKanban,
  ListTodo,
  Users,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { StatCard } from "@/components/stat-card";
import { EmptyState } from "@/components/ui/empty-state";
import { Avatar, AvatarFallback, getInitials } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { STATUS_LABEL, STATUS_VARIANT } from "@/lib/status";
import { PortalHero } from "@/components/portal-hero";

type ProjectWithProgress = {
  id: string;
  title: string;
  status: string;
  clientId: string;
  clientName: string;
  completed: number;
  total: number;
};

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

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

  const clientCount = grouped.size;
  const activeCount = projects.filter((p) => p.status === "ACTIVE").length;
  const completedTasks = projects.reduce(
    (n, p) => n + p.tasks.filter((t) => t.isCompleted).length,
    0
  );
  const openTasks = projects.reduce(
    (n, p) => n + p.tasks.filter((t) => !t.isCompleted).length,
    0
  );

  return (
    <div className="space-y-6">
      <PortalHero
        tone="consultant"
        eyebrow={greeting()}
        title={session.name}
        description="Projects you are actively delivering for your clients."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Assigned clients"
          value={clientCount}
          icon={Users}
          iconClassName="bg-brand-sky/15 text-brand-sky"
          footer="Active engagements"
          delay={0}
        />
        <StatCard
          label="Active projects"
          value={activeCount}
          icon={FolderKanban}
          iconClassName="bg-brand-navy/10 text-brand-navy"
          footer={`${projects.length} total project${projects.length === 1 ? "" : "s"}`}
          delay={50}
        />
        <StatCard
          label="Tasks completed"
          value={completedTasks}
          icon={CheckCircle2}
          iconClassName="bg-emerald-600/10 text-emerald-600"
          footer="Deliverables done"
          delay={100}
        />
        <StatCard
          label="Open tasks"
          value={openTasks}
          icon={ListTodo}
          iconClassName="bg-brand-gold/15 text-brand-gold"
          footer="Awaiting completion"
          delay={150}
        />
      </div>

      {projects.length === 0 ? (
        <EmptyState
          icon={FolderKanban}
          title="No clients assigned yet"
          description="An administrator needs to assign you a client. Projects you deliver will appear here."
        />
      ) : (
        <div className="space-y-6">
          {[...grouped.entries()].map(([clientId, clientProjects], groupIdx) => {
            const client = clientProjects[0];
            return (
              <Card
                key={clientId}
                className="animate-fade-in-up transition-all duration-200 hover:shadow-md"
                style={{ animationDelay: `${groupIdx * 60}ms` }}
              >
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
                        className="group block rounded-lg border p-4 transition-all duration-200 hover:border-ring/40 hover:bg-muted/40 hover:shadow-sm active:scale-[0.99] motion-reduce:active:scale-100"
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
                            <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform duration-200 group-hover:translate-x-0.5" />
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