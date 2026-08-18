import {
  Briefcase,
  Building2,
  Download,
  FileText,
  FolderKanban,
  Mail,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";
import { RequestForm } from "@/components/client/request-form";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, getInitials } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { STATUS_LABEL, STATUS_VARIANT } from "@/lib/status";

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

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Welcome, {session.name}
        </h1>
        <p className="text-sm text-muted-foreground">
          Your assigned consultant and project updates.
        </p>
      </div>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Your consultant
        </h2>
        {consultants.length === 0 ? (
          <Card>
            <CardContent className="flex items-center gap-3 py-8">
              <Briefcase className="h-8 w-8 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">No consultant assigned yet</p>
                <p className="text-xs text-muted-foreground">
                  HRC will assign a consultant to your account shortly.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {consultants.map((consultant) => (
              <Card key={consultant.id}>
                <CardContent className="flex flex-col items-center gap-3 pt-6 text-center">
                  <Avatar className="h-16 w-16">
                    <AvatarFallback className="text-lg">
                      {getInitials(consultant.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">{consultant.name}</p>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                      Senior Consultant
                    </p>
                  </div>
                  <a
                    href={`mailto:${consultant.email}`}
                    className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
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
          <Card>
            <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
              <FolderKanban className="h-10 w-10 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                No projects yet. Check back soon.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {projects.map((project) => {
              const completed = project.tasks.filter((t) => t.isCompleted).length;
              const progress =
                project.tasks.length === 0
                  ? 0
                  : Math.round((completed / project.tasks.length) * 100);

              return (
                <Card key={project.id} className="flex flex-col">
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
                                className="flex items-center gap-2 rounded-md border px-2.5 py-1.5 text-sm transition-colors hover:bg-muted/50"
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
