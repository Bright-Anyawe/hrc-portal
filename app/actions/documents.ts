"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";
import { saveUpload } from "@/lib/uploads";
import { logAudit } from "@/lib/audit";
import { notify } from "@/lib/notify";

export type ActionResult = { ok: boolean; error?: string };

export async function addDocument(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const session = await requireRole(["ADMIN", "CONSULTANT"]);

  const projectId = String(formData.get("projectId") ?? "");
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { id: true, title: true, consultantId: true, clientId: true },
  });
  if (!project) return { ok: false, error: "Project not found." };
  if (session.role === "CONSULTANT" && project.consultantId !== session.sub) {
    return { ok: false, error: "You do not have access to this project." };
  }

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, error: "Choose a file to upload." };
  }

  let saved: { name: string; fileUrl: string };
  try {
    saved = await saveUpload(file);
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }

  await prisma.document.create({
    data: {
      projectId,
      name: saved.name,
      fileUrl: saved.fileUrl,
      uploadedById: session.sub,
    },
  });

  await logAudit({
    actorId: session.sub,
    actorName: session.name,
    action: "DOCUMENT_UPLOADED",
    entityType: "Project",
    entityId: projectId,
    details: { fileName: saved.name, fileUrl: saved.fileUrl },
  });

  await notify(project.clientId, {
    actorId: session.sub,
    projectId,
    type: "DOCUMENT_UPLOADED",
    message: `A new document "${saved.name}" was uploaded to "${project.title}".`,
  });

  revalidatePath("/");
  return { ok: true };
}
