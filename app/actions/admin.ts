"use server";

import { randomBytes } from "crypto";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";
import { sendMail } from "@/lib/mailer";
import { logAudit } from "@/lib/audit";
import { notify } from "@/lib/notify";
import type { Role, ProjectStatus } from "@/generated/prisma/enums";

export type ActionResult = {
  ok: boolean;
  error?: string;
  email?: string;
  password?: string;
  name?: string;
};

const PORTAL_URL = process.env.PORTAL_URL ?? "http://localhost:3000";

async function inviteUser(
  formData: FormData,
  role: Role
): Promise<ActionResult> {
  const session = await requireRole(["ADMIN"]);

  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();

  if (!name || !email) {
    return { ok: false, error: "Name and email are required." };
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { ok: false, error: "A user with that email already exists." };
  }

  const password = randomBytes(6).toString("base64url").slice(0, 10);
  const user = await prisma.user.create({
    data: {
      name,
      email,
      role,
      passwordHash: await bcrypt.hash(password, 10),
    },
  });

  await logAudit({
    actorId: session.sub,
    actorName: session.name,
    action: "USER_INVITED",
    entityType: "User",
    entityId: user.id,
    details: { email, name, role },
  });

  try {
    await sendMail({
      to: email,
      subject: `You've been invited to the HRC Portal`,
      text: `Hi ${name},

You've been invited to the Hedge Resource Centre portal as a ${role.toLowerCase()}.

Sign in at ${PORTAL_URL} with:
  Email: ${email}
  Temporary password: ${password}

Please change your password after signing in (not yet implemented).

— HRC Portal`,
    });
  } catch (e) {
    console.error("Failed to send invitation email:", e);
  }

  revalidatePath("/admin");
  return { ok: true, email: user.email, password, name: user.name };
}

export async function createClient(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  return inviteUser(formData, "CLIENT");
}

async function updateUserData(
  _prev: ActionResult,
  formData: FormData,
  role: Role
): Promise<ActionResult> {
  const session = await requireRole(["ADMIN"]);

  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();

  if (!id || !name || !email) {
    return { ok: false, error: "Name and email are required." };
  }

  const duplicate = await prisma.user.findUnique({ where: { email } });
  if (duplicate && duplicate.id !== id) {
    return { ok: false, error: "A user with that email already exists." };
  }

  const updated = await prisma.user.update({
    where: { id },
    data: { name, email },
  });

  if (updated.role !== role) {
    return { ok: false, error: "Could not update that account." };
  }

  await logAudit({
    actorId: session.sub,
    actorName: session.name,
    action: "USER_UPDATED",
    entityType: "User",
    entityId: updated.id,
    details: { name, email, role },
  });

  revalidatePath("/admin");
  revalidatePath("/admin/clients");
  revalidatePath("/admin/consultants");
  return { ok: true };
}

export async function updateClient(
  prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  return updateUserData(prev, formData, "CLIENT");
}

export async function updateConsultant(
  prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  return updateUserData(prev, formData, "CONSULTANT");
}

export async function deleteUser(userId: string): Promise<ActionResult> {
  const session = await requireRole(["ADMIN"]);

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true, role: true },
  });
  if (!user) return { ok: false, error: "User not found." };
  if (user.role === "ADMIN") {
    return { ok: false, error: "Admin accounts cannot be deleted here." };
  }

  await prisma.$transaction([
    prisma.clientAssignment.deleteMany({
      where: { OR: [{ consultantId: userId }, { clientId: userId }] },
    }),
    prisma.document.deleteMany({ where: { uploadedById: userId } }),
    prisma.project.deleteMany({
      where: {
        OR: [{ createdById: userId }, { clientId: userId }, { consultantId: userId }],
      },
    }),
  ]);

  await prisma.user.delete({ where: { id: userId } });

  await logAudit({
    actorId: session.sub,
    actorName: session.name,
    action: "USER_DELETED",
    entityType: "User",
    entityId: userId,
    details: { name: user.name, email: user.email, role: user.role },
  });

  revalidatePath("/admin");
  revalidatePath("/admin/clients");
  revalidatePath("/admin/consultants");
  revalidatePath("/admin/projects");
  return { ok: true };
}

export async function createConsultant(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  return inviteUser(formData, "CONSULTANT");
}

export async function assignConsultant(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const session = await requireRole(["ADMIN"]);

  const consultantId = String(formData.get("consultantId") ?? "");
  const clientId = String(formData.get("clientId") ?? "");
  if (!consultantId || !clientId) {
    return { ok: false, error: "Select both a consultant and a client." };
  }

  try {
    await prisma.clientAssignment.create({ data: { consultantId, clientId } });
  } catch {
    return {
      ok: false,
      error: "That consultant is already assigned to this client.",
    };
  }

  const [consultant, client] = await Promise.all([
    prisma.user.findUnique({
      where: { id: consultantId },
      select: { name: true },
    }),
    prisma.user.findUnique({
      where: { id: clientId },
      select: { name: true },
    }),
  ]);

  await logAudit({
    actorId: session.sub,
    actorName: session.name,
    action: "ASSIGNMENT_CREATED",
    entityType: "ClientAssignment",
    entityId: `${consultantId}:${clientId}`,
    details: {
      consultantId,
      consultantName: consultant?.name,
      clientId,
      clientName: client?.name,
    },
  });

  if (consultant) {
    await notify(consultantId, {
      actorId: session.sub,
      type: "ASSIGNMENT",
      message: `You have been assigned to client "${client?.name ?? "Unknown"}".`,
    });
  }

  revalidatePath("/admin");
  return { ok: true };
}

export async function unassignConsultant(consultantId: string, clientId: string) {
  const session = await requireRole(["ADMIN"]);

  await prisma.clientAssignment.delete({
    where: { consultantId_clientId: { consultantId, clientId } },
  });

  await logAudit({
    actorId: session.sub,
    actorName: session.name,
    action: "ASSIGNMENT_DELETED",
    entityType: "ClientAssignment",
    entityId: `${consultantId}:${clientId}`,
  });

  revalidatePath("/admin");
}

export async function createProject(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const session = await requireRole(["ADMIN"]);

  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const status = String(formData.get("status") ?? "PLANNING") as ProjectStatus;
  const clientId = String(formData.get("clientId") ?? "");
  const consultantId = String(formData.get("consultantId") ?? "") || null;

  if (!title || !clientId) {
    return { ok: false, error: "Title and client are required." };
  }

  const project = await prisma.project.create({
    data: {
      title,
      description,
      status,
      createdById: session.sub,
      clientId,
      consultantId,
    },
  });

  await logAudit({
    actorId: session.sub,
    actorName: session.name,
    action: "PROJECT_CREATED",
    entityType: "Project",
    entityId: project.id,
    details: { title, status, clientId, consultantId },
  });

  const client = await prisma.user.findUnique({
    where: { id: clientId },
    select: { name: true },
  });

  await notify(clientId, {
    actorId: session.sub,
    projectId: project.id,
    type: "PROJECT_CREATED",
    message: `A new project "${title}" was created for ${client?.name ?? "you"}.`,
  });

  if (consultantId) {
    await notify(consultantId, {
      actorId: session.sub,
      projectId: project.id,
      type: "PROJECT_CREATED",
      message: `You have been assigned to a new project "${title}".`,
    });
  }

  revalidatePath("/admin");
  return { ok: true };
}

export async function updateProject(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const session = await requireRole(["ADMIN"]);

  const id = String(formData.get("id") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const status = String(formData.get("status") ?? "PLANNING") as ProjectStatus;
  const clientId = String(formData.get("clientId") ?? "");
  const consultantId = String(formData.get("consultantId") ?? "") || null;

  if (!id || !title || !clientId) {
    return { ok: false, error: "Title and client are required." };
  }

  const updated = await prisma.project.update({
    where: { id },
    data: {
      title,
      description: description || null,
      status,
      clientId,
      consultantId,
    },
  });

  await logAudit({
    actorId: session.sub,
    actorName: session.name,
    action: "PROJECT_UPDATED",
    entityType: "Project",
    entityId: id,
    details: { title, status, clientId, consultantId },
  });

  revalidatePath("/admin");
  revalidatePath("/admin/projects");
  return { ok: true };
}

export async function deleteProject(projectId: string): Promise<ActionResult> {
  const session = await requireRole(["ADMIN"]);

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { id: true, title: true },
  });
  if (!project) return { ok: false, error: "Project not found." };

  await prisma.project.delete({ where: { id: projectId } });

  await logAudit({
    actorId: session.sub,
    actorName: session.name,
    action: "PROJECT_DELETED",
    entityType: "Project",
    entityId: projectId,
    details: { title: project.title },
  });

  revalidatePath("/admin");
  revalidatePath("/admin/projects");
  return { ok: true };
}
