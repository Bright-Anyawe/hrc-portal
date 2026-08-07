"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";
import { notify } from "@/lib/notify";
import { notifyAdmins } from "@/lib/notify";

export type ActionResult = { ok: boolean; error?: string };

export async function submitRequest(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const session = await requireRole(["CLIENT"]);

  const projectId = String(formData.get("projectId") ?? "");
  const message = String(formData.get("message") ?? "").trim();

  if (!projectId || !message) {
    return { ok: false, error: "Message is required." };
  }

  const project = await prisma.project.findFirst({
    where: { id: projectId, clientId: session.sub },
    select: { id: true, title: true, consultantId: true },
  });
  if (!project) {
    return { ok: false, error: "You do not have access to this project." };
  }

  await prisma.task.create({
    data: {
      projectId,
      title: `Client request: ${message}`,
    },
  });

  if (project.consultantId) {
    await notify(project.consultantId, {
      actorId: session.sub,
      projectId,
      type: "CLIENT_REQUEST",
      message: `New request from ${session.name} on "${project.title}".`,
    });
  }
  await notifyAdmins({
    actorId: session.sub,
    projectId,
    type: "CLIENT_REQUEST",
    message: `New request from ${session.name} on "${project.title}".`,
  });

  revalidatePath("/client");
  return { ok: true };
}
