import Link from "next/link";
import {
  ArrowLeft,
  ClipboardList,
  FileText,
  Plus,
  FolderOpen,
} from "lucide-react";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";
import { addTask } from "@/app/actions/staff";
import { TaskItem, type TaskItemData } from "@/components/staff/task-item";
import { ProjectStatusSelect } from "@/components/staff/project-status-select";
import { DocumentUpload } from "@/components/document-upload";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

export default async function StaffProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireRole(["CONSULTANT"]);
  const { id } = await params;

  const project = await prisma.project.findFirst({
    where: { id, consultantId: session.sub },
    include: {
      client: { select: { id: true, name: true, email: true } },
      tasks: {
        orderBy: [{ isCompleted: "asc" }, { dueDate: "asc" }],
      },
      documents: {
        orderBy: { createdAt: "desc" },
        select: { id: true, name: true, fileUrl: true, createdAt: true },
      },
    },
  });

  if (!project) notFound();

  const total = project.tasks.length;
  const completed = project.tasks.filter((t) => t.isCompleted).length;
  const progress = total === 0 ? 0 : Math.round((completed / total) * 100);

  const taskItems: TaskItemData[] = project.tasks.map((task) => ({
    id: task.id,
    title: task.title,
    isCompleted: task.isCompleted,
    dueDate: task.dueDate?.toISOString() ?? null,
  }));

  return (
    <div className="space-y-6">
      <Link
        href="/staff"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to my clients
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">
              {project.title}
            </h1>
            <Badge variant={STATUS_VARIANT[project.status]}>
              {STATUS_LABEL[project.status]}
            </Badge>
          </div>
          {project.description && (
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
              {project.description}
            </p>
          )}
          <div className="mt-2 flex items-center gap-2 text-sm">
            <Avatar className="h-6 w-6">
              <AvatarFallback className="text-[10px]">
                {getInitials(project.client.name)}
              </AvatarFallback>
            </Avatar>
            <span className="text-muted-foreground">Client:</span>
            <span className="font-medium">{project.client.name}</span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <span className="text-xs text-muted-foreground">Status</span>
          <ProjectStatusSelect projectId={project.id} current={project.status} />
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Project progress</CardTitle>
          <span className="text-sm font-medium">
            {completed}/{total} tasks
          </span>
        </CardHeader>
        <CardContent>
          <Progress value={progress} />
          <p className="mt-2 text-xs text-muted-foreground">
            {progress}% complete
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5" />
            Task tracker
          </CardTitle>
          <CardDescription>
            Track milestones and deliverables for this project.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {taskItems.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              No tasks yet. Add the first milestone below.
            </p>
          ) : (
            <div className="space-y-2">
              {taskItems.map((task) => (
                <TaskItem key={task.id} task={task} />
              ))}
            </div>
          )}

          <form
            action={addTask.bind(null, project.id)}
            className="flex flex-col gap-2 border-t pt-4 sm:flex-row sm:items-center"
          >
            <Input
              name="title"
              placeholder="Add a task or milestone..."
              required
              className="flex-1"
            />
            <Input name="dueDate" type="date" aria-label="Due date" />
            <Button type="submit" size="sm">
              <Plus className="h-4 w-4" />
              Add task
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FolderOpen className="h-5 w-5" />
            Shared documents
          </CardTitle>
          <CardDescription>
            Upload deliverables — the client sees them instantly on their
            dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <DocumentUpload projectId={project.id} />

          {project.documents.length === 0 ? (
            <p className="rounded-md border border-dashed py-6 text-center text-sm text-muted-foreground">
              No documents shared yet.
            </p>
          ) : (
            <ul className="space-y-1.5">
              {project.documents.map((doc) => (
                <li key={doc.id}>
                  <a
                    href={doc.fileUrl}
                    download
                    className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm transition-colors hover:bg-muted/50"
                  >
                    <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <span className="flex-1 truncate font-medium">
                      {doc.name}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {doc.createdAt.toLocaleDateString()}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
