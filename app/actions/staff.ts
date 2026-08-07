"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";
import { logAudit } from "@/lib/audit";
import { notify } from "@/lib/notify";
import { STATUS_LABEL } from "@/lib/status";
import type { ProjectStatus } from "@/generated/prisma/enums";

export type ActionResult = { ok: boolean; error?: string };

export async function toggleTask(taskId: string, isCompleted: boolean) {
  const session = await requireRole(["CONSULTANT"]);

  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: { project: { select: { id: true, consultantId: true } } },
  });
  if (!task || task.project.consultantId !== session.sub) {
    return { ok: false, error: "You do not have access to this task." };
  }

  await prisma.task.update({
    where: { id: taskId },
    data: { isCompleted },
  });
  revalidatePath(`/staff/projects/${task.projectId}`);
  return { ok: true };
}

export async function addTask(projectId: string, formData: FormData) {
  const session = await requireRole(["CONSULTANT"]);

  const project = await prisma.project.findFirst({
    where: { id: projectId, consultantId: session.sub },
    select: { id: true },
  });
  if (!project) return;

  const title = String(formData.get("title") ?? "").trim();
  const dueDate = String(formData.get("dueDate") ?? "").trim();
  if (!title) return;

  await prisma.task.create({
    data: {
      projectId,
      title,
      dueDate: dueDate ? new Date(dueDate) : null,
    },
  });
  revalidatePath(`/staff/projects/${projectId}`);
}

export async function updateProjectStatus(
  projectId: string,
  status: ProjectStatus
) {
  const session = await requireRole(["CONSULTANT"]);

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: {
      id: true,
      title: true,
      consultantId: true,
      clientId: true,
      status: true,
    },
  });
  if (!project || project.consultantId !== session.sub) {
    return { ok: false, error: "You do not have access to this project." };
  }
  if (project.status === status) return { ok: true };

  await prisma.project.update({ where: { id: projectId }, data: { status } });

  await logAudit({
    actorId: session.sub,
    actorName: session.name,
    action: "PROJECT_STATUS_CHANGED",
    entityType: "Project",
    entityId: projectId,
    details: { from: project.status, to: status, title: project.title },
  });

  await notify(project.clientId, {
    actorId: session.sub,
    projectId,
    type: "PROJECT_STATUS",
    message: `The status of "${project.title}" changed to ${STATUS_LABEL[status]}.`,
  });

  revalidatePath(`/staff/projects/${projectId}`);
  return { ok: true };
}
