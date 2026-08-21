import {
  Briefcase,
  Building2,
  CheckCircle2,
  Download,
  FileText,
  FolderKanban,
  Mail,
  ListTodo,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";
import { RequestForm } from "@/components/client/request-form";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { StatCard } from "@/components/stat-card";
import { EmptyState } from "@/components/ui/empty-state";
import { Avatar, AvatarFallback, getInitials } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { STATUS_LABEL, STATUS_VARIANT } from "@/lib/status";
import { PortalHero } from "@/components/portal-hero";

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export default async function ClientDashboardPage() {
  const session = await requireRole(["CLIENT"]);

  const [assignments, projects] = await Promise.all([
    prisma.clientAssignment.findMany({
      where: { clientId: session.sub },
      include: {
        consultant: { select: { id: true, name: true, email: true } },
      },
    }),
    prisma.project.findMany({
      where: { clientId: session.sub },
      orderBy: { createdAt: "desc" },
      include: {
        consultant: { select: { id: true, name: true, email: true } },
        tasks: { select: { id: true, isCompleted: true } },
        documents: {
          orderBy: { createdAt: "desc" },
          select: { id: true, name: true, fileUrl: true },
        },
      },
    }),
  ]);

  const consultants = assignments.map((a) => a.consultant);
  const activeProjects = projects.filter((p) => p.status === "ACTIVE").length;
  const totalDocuments = projects.reduce((n, p) => n + p.documents.length, 0);
  const openTasks = projects.reduce(
    (n, p) => n + p.tasks.filter((t) => !t.isCompleted).length,
    0
  );

  return (
    <div className="space-y-8">
      <PortalHero
        tone="client"
        eyebrow={greeting()}
        title={session.name}
        description="Your consultant and project updates at a glance."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard
          label="Active projects"
          value={activeProjects}
          icon={FolderKanban}
          iconClassName="bg-brand-sky/15 text-brand-sky"
          footer={`${projects.length} total project${projects.length === 1 ? "" : "s"}`}
          delay={0}
        />
        <StatCard
          label="Shared documents"
          value={totalDocuments}
          icon={FileText}
          iconClassName="bg-brand-gold/15 text-brand-gold"
          footer="Available to download"
          delay={50}
        />
        <StatCard
          label="Open tasks"
          value={openTasks}
          icon={ListTodo}
          iconClassName="bg-brand-red/10 text-brand-red"
          footer="Awaiting completion"
          delay={100}
        />
      </div>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Your consultant
        </h2>
        {consultants.length === 0 ? (
          <EmptyState
            icon={Briefcase}
            title="No consultant assigned yet"
            description="HRC will assign a consultant to your account shortly. You'll be notified here."
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {consultants.map((consultant, i) => (
              <Card
                key={consultant.id}
                className="animate-fade-in-up transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md motion-reduce:hover:translate-y-0"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <CardContent className="flex flex-col items-center gap-3 pt-6 text-center">
                  <div className="relative">
                    <Avatar className="h-16 w-16">
                      <AvatarFallback className="text-lg">
                        {getInitials(consultant.name)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full border-2 border-white bg-emerald-500">
                      <CheckCircle2 className="h-3 w-3 text-white" />
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold">{consultant.name}</p>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                      Senior Consultant
                    </p>
                  </div>
                  <a
                    href={`mailto:${consultant.email}`}
                    className="inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm font-medium text-primary transition-all hover:bg-accent active:scale-95 motion-reduce:active:scale-100"
                  >
                    <Mail className="h-4 w-4" />
                    {consultant.email}
                  </a>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Project progress
        </h2>
        {projects.length === 0 ? (
          <EmptyState
            icon={FolderKanban}
            title="No projects yet"
            description="Once HRC creates a project for you, its progress and documents will appear here."
          />
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {projects.map((project, i) => {
              const completed = project.tasks.filter((t) => t.isCompleted).length;
              const progress =
                project.tasks.length === 0
                  ? 0
                  : Math.round((completed / project.tasks.length) * 100);

              return (
                <Card
                  key={project.id}
                  className="flex animate-fade-in-up flex-col transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md motion-reduce:hover:translate-y-0"
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  <CardHeader>
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <CardTitle className="text-lg">{project.title}</CardTitle>
                      <Badge variant={STATUS_VARIANT[project.status]}>
                        {STATUS_LABEL[project.status]}
                      </Badge>
                    </div>
                    <CardDescription className="flex items-center gap-1.5">
                      <Building2 className="h-3.5 w-3.5" />
                      {project.consultant?.name ?? "Unassigned"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-1 flex-col gap-4">
                    <div>
                      <div className="mb-1.5 flex items-center justify-between text-xs text-muted-foreground">
                        <span>Progress</span>
                        <span className="font-medium">
                          {completed}/{project.tasks.length} tasks
                        </span>
                      </div>
                      <Progress value={progress} />
                    </div>

                    <div>
                      <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Shared documents
                      </p>
                      {project.documents.length === 0 ? (
                        <p className="text-xs text-muted-foreground">
                          No documents shared yet.
                        </p>
                      ) : (
                        <ul className="space-y-1">
                          {project.documents.map((doc) => (
                            <li key={doc.id}>
                              <a
                                href={doc.fileUrl}
                                download
                                className="flex items-center gap-2 rounded-md border px-2.5 py-1.5 text-sm transition-all hover:border-ring/40 hover:bg-muted/50 active:scale-[0.99] motion-reduce:active:scale-100"
                              >
                                <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                                <span className="flex-1 truncate">
                                  {doc.name}
                                </span>
                                <Download className="h-4 w-4 shrink-0 text-muted-foreground" />
                              </a>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    <div className="mt-auto border-t pt-3">
                      <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Submit a request
                      </p>
                      <RequestForm projectId={project.id} />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}