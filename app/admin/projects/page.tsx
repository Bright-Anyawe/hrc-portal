import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";
import { FolderKanban } from "lucide-react";
import { unassignConsultant, deleteProject } from "@/app/actions/admin";
import { CreateProjectButton } from "@/components/admin/create-project-button";
import { AssignConsultantForm } from "@/components/admin/assign-consultant-form";
import { EditProjectDialog } from "@/components/admin/edit-project-dialog";
import { DeleteDialog } from "@/components/admin/delete-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Card,
  CardContent,
  CardDescription,
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
import { STATUS_LABEL, STATUS_VARIANT } from "@/lib/status";
import { PageHeader } from "@/components/page-header";

export default async function AdminProjectsPage() {
  await requireRole(["ADMIN"]);

  const [clients, consultants, projects, assignments] = await Promise.all([
    prisma.user.findMany({
      where: { role: "CLIENT" },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
    prisma.user.findMany({
      where: { role: "CONSULTANT" },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
    prisma.project.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        client: { select: { id: true, name: true } },
        consultant: { select: { id: true, name: true } },
      },
    }),
    prisma.clientAssignment.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        consultant: { select: { id: true, name: true } },
        client: { select: { id: true, name: true } },
      },
    }),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Projects"
        description="Create projects and manage consultant-to-client assignments."
        actions={
          <CreateProjectButton clients={clients} consultants={consultants} />
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>Consultant assignment</CardTitle>
          <CardDescription>
            Link a consultant to a client so they can access each other.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AssignConsultantForm
            consultants={consultants}
            clients={clients}
          />

          {assignments.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2 border-t pt-4">
              {assignments.map((assignment) => (
                <span
                  key={assignment.id}
                  className="inline-flex items-center gap-1.5 rounded-md border bg-muted px-2.5 py-1 text-sm"
                >
                  <span className="font-medium">{assignment.consultant.name}</span>
                  <span className="text-muted-foreground">→</span>
                  {assignment.client.name}
                  <form
                    action={unassignConsultant.bind(
                      null,
                      assignment.consultantId,
                      assignment.clientId
                    )}
                  >
                    <button
                      type="submit"
                      className="text-muted-foreground hover:text-destructive"
                      aria-label="Remove assignment"
                    >
                      ×
                    </button>
                  </form>
                </span>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>All projects</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {projects.length === 0 ? (
            <EmptyState
              icon={FolderKanban}
              title="No projects yet"
              description="Create your first project for a client."
              action={<CreateProjectButton clients={clients} consultants={consultants} />}
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Project</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Consultant</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {projects.map((project) => (
                  <TableRow key={project.id}>
                    <TableCell className="max-w-xs">
                      <p className="font-medium">{project.title}</p>
                      {project.description && (
                        <p className="line-clamp-1 text-xs text-muted-foreground">
                          {project.description}
                        </p>
                      )}
                    </TableCell>
                    <TableCell>{project.client.name}</TableCell>
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
                    <TableCell>
                      <div className="flex justify-end gap-1">
                        <EditProjectDialog
                          project={{
                            id: project.id,
                            title: project.title,
                            description: project.description,
                            status: project.status,
                            clientId: project.client.id,
                            consultantId: project.consultant?.id ?? null,
                          }}
                          clients={clients}
                          consultants={consultants}
                        />
                        <DeleteDialog
                          entityLabel={`project "${project.title}"`}
                          action={deleteProject.bind(null, project.id)}
                          description="This permanently deletes the project, its tasks, and its documents."
                        />
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
