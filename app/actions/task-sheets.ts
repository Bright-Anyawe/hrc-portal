"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";
import { logAudit } from "@/lib/audit";
import { notify, notifyAdmins } from "@/lib/notify";
import type { ClientProfileData, HrcInternalData } from "@/app/actions/client-profile";
import {
  carryForward,
  formatSheetNo,
  missingForSubmit,
  projectCode,
  type TaskSheetData,
} from "@/lib/task-sheet";

export type ActionResult = { ok: boolean; error?: string };

function revalidateSheet(projectId: string, sheetId: string) {
  revalidatePath("/client/meetings");
  revalidatePath(`/staff/projects/${projectId}`);
  revalidatePath(`/staff/projects/${projectId}/task-sheets/${sheetId}`);
  revalidatePath("/admin/task-sheets");
  revalidatePath(`/admin/task-sheets/${sheetId}`);
}

// Parses consultant-submitted sheet data. The reviewer signature is only
// ever written by reviewTaskSheet, so it is dropped here.
function parseData(raw: string): TaskSheetData | null {
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    const data = parsed as TaskSheetData;
    if (data.certification) delete data.certification.reviewerSignature;
    return data;
  } catch {
    return null;
  }
}

function toDate(value?: string): Date | null {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

async function loadOwnSheet(sheetId: string, consultantId: string) {
  const sheet = await prisma.taskSheet.findUnique({
    where: { id: sheetId },
    select: {
      id: true,
      projectId: true,
      clientId: true,
      sheetNo: true,
      status: true,
      consultantId: true,
      project: { select: { title: true, consultantId: true } },
    },
  });
  if (!sheet || sheet.project.consultantId !== consultantId) return null;
  return sheet;
}

export async function createTaskSheet(projectId: string) {
  const session = await requireRole(["CONSULTANT"]);

  const project = await prisma.project.findFirst({
    where: { id: projectId, consultantId: session.sub },
    select: {
      id: true,
      title: true,
      clientId: true,
      client: {
        select: {
          name: true,
          clientProfile: { select: { profileData: true, hrcData: true } },
        },
      },
    },
  });
  if (!project) return;

  const profile = (project.client.clientProfile?.profileData ??
    {}) as ClientProfileData;
  const hrc = (project.client.clientProfile?.hrcData ?? {}) as HrcInternalData;
  const code = projectCode(project.id);
  const today = new Date().toISOString().slice(0, 10);

  // Retry once if a concurrent create grabbed the same sequence number.
  let sheetId: string | null = null;
  for (let attempt = 0; attempt < 2 && !sheetId; attempt++) {
    const last = await prisma.taskSheet.findFirst({
      where: { projectId },
      orderBy: { sheetNo: "desc" },
      select: { sheetNo: true, data: true },
    });
    const sheetNo = (last?.sheetNo ?? 0) + 1;
    const carried = last ? carryForward((last.data ?? {}) as TaskSheetData) : {};

    const data: TaskSheetData = {
      ...carried,
      // Follow-up sheets start in quick mode; the first sheet is filled in full.
      meta: last
        ? { mode: "quick", carriedFrom: formatSheetNo(last.sheetNo) }
        : { mode: "full" },
      identification: {
        ...carried.identification,
        clientName: profile.organization?.orgName || project.client.name,
        clientCode: hrc.clientId ?? "",
        project: project.title,
        projectCode: code,
        leadConsultant:
          hrc.assignedPrincipal || profile.acquisition?.leadConsultant || "",
        consultantName: session.name,
        contactPerson: profile.primaryContact?.fullName ?? "",
        contactPosition: profile.primaryContact?.position ?? "",
        interactionDate: today,
        interactionNo: String(sheetNo),
      },
      certification: { consultantName: session.name },
      continuity: {
        previousSheetNo: formatSheetNo(sheetNo - 1),
        currentSheetNo: formatSheetNo(sheetNo),
        nextSheetNo: formatSheetNo(sheetNo + 1),
        clientFile: [hrc.clientId, code].filter(Boolean).join(" / "),
      },
    };

    try {
      const sheet = await prisma.taskSheet.create({
        data: {
          projectId,
          clientId: project.clientId,
          consultantId: session.sub,
          sheetNo,
          interactionDate: toDate(today),
          data: data as never,
        },
        select: { id: true },
      });
      sheetId = sheet.id;

      await logAudit({
        actorId: session.sub,
        actorName: session.name,
        action: "TASK_SHEET_CREATED",
        entityType: "TaskSheet",
        entityId: sheet.id,
        details: { projectId, sheetNo, title: project.title },
      });
    } catch (err) {
      if (attempt === 1) throw err;
    }
  }

  revalidatePath(`/staff/projects/${projectId}`);
  redirect(`/staff/projects/${projectId}/task-sheets/${sheetId}`);
}

export async function saveTaskSheet(
  sheetId: string,
  dataRaw: string
): Promise<ActionResult> {
  const session = await requireRole(["CONSULTANT"]);

  const sheet = await loadOwnSheet(sheetId, session.sub);
  if (!sheet) return { ok: false, error: "You do not have access to this task sheet." };
  if (sheet.status !== "DRAFT") {
    return { ok: false, error: "Only draft task sheets can be edited." };
  }

  const data = parseData(dataRaw);
  if (!data) return { ok: false, error: "Invalid data format." };

  await prisma.taskSheet.update({
    where: { id: sheetId },
    data: {
      data: data as never,
      interactionDate: toDate(data.identification?.interactionDate),
    },
  });

  revalidateSheet(sheet.projectId, sheetId);
  return { ok: true };
}

export async function submitTaskSheet(
  sheetId: string,
  dataRaw: string
): Promise<ActionResult> {
  const session = await requireRole(["CONSULTANT"]);

  const sheet = await loadOwnSheet(sheetId, session.sub);
  if (!sheet) return { ok: false, error: "You do not have access to this task sheet." };
  if (sheet.status !== "DRAFT") {
    return { ok: false, error: "This task sheet has already been submitted." };
  }

  const data = parseData(dataRaw);
  if (!data) return { ok: false, error: "Invalid data format." };

  const missing = missingForSubmit(data).map((m) => m.label);
  if (missing.length > 0) {
    return { ok: false, error: `Please complete: ${missing.join(", ")}.` };
  }

  await prisma.taskSheet.update({
    where: { id: sheetId },
    data: {
      data: data as never,
      interactionDate: toDate(data.identification?.interactionDate),
      status: "SUBMITTED",
      submittedAt: new Date(),
    },
  });

  const label = `${formatSheetNo(sheet.sheetNo)} for "${sheet.project.title}"`;

  await logAudit({
    actorId: session.sub,
    actorName: session.name,
    action: "TASK_SHEET_SUBMITTED",
    entityType: "TaskSheet",
    entityId: sheetId,
    details: { projectId: sheet.projectId, sheetNo: sheet.sheetNo },
  });

  await notifyAdmins({
    actorId: session.sub,
    projectId: sheet.projectId,
    type: "TASK_SHEET_SUBMITTED",
    message: `${session.name} submitted task sheet ${label} for review.`,
  });

  await notify(sheet.clientId, {
    actorId: session.sub,
    projectId: sheet.projectId,
    type: "TASK_SHEET_SHARED",
    message: `${session.name} shared the meeting record for "${sheet.project.title}" (${formatSheetNo(sheet.sheetNo)}).`,
  });

  const escalateTo = (data.escalation?.to ?? []).filter((t) => t !== "No");
  if (escalateTo.length > 0) {
    await notifyAdmins({
      actorId: session.sub,
      projectId: sheet.projectId,
      type: "TASK_SHEET_ESCALATION",
      message: `Escalation on task sheet ${label} → ${escalateTo.join(", ")}: ${
        data.escalation?.issue?.trim() || "see task sheet"
      }`,
    });
  }

  revalidateSheet(sheet.projectId, sheetId);
  return { ok: true };
}

// Copy the agreed action plan (section I) into the project's task tracker.
// Titles carry the sheet number, so re-running only adds new actions.
export async function syncActionPlanToTasks(
  sheetId: string
): Promise<ActionResult & { added?: number }> {
  const session = await requireRole(["CONSULTANT"]);

  const sheet = await loadOwnSheet(sheetId, session.sub);
  if (!sheet) return { ok: false, error: "You do not have access to this task sheet." };

  const full = await prisma.taskSheet.findUnique({
    where: { id: sheetId },
    select: { data: true },
  });
  const rows = ((full?.data ?? {}) as TaskSheetData).actionPlan ?? [];
  const prefix = `[${formatSheetNo(sheet.sheetNo)}]`;

  const candidates = rows
    .filter((r) => r.action?.trim() && r.status !== "Cancelled")
    .map((r) => ({
      title: `${prefix} ${r.action!.trim()}${r.responsible?.trim() ? ` — ${r.responsible.trim()}` : ""}`,
      dueDate: toDate(r.dueDate),
      isCompleted: r.status === "Completed",
    }));
  if (candidates.length === 0) {
    return { ok: false, error: "Save at least one action in section I first." };
  }

  const existing = await prisma.task.findMany({
    where: { projectId: sheet.projectId, title: { startsWith: prefix } },
    select: { title: true },
  });
  const seen = new Set(existing.map((t) => t.title));
  const fresh = candidates.filter((c) => !seen.has(c.title));

  if (fresh.length > 0) {
    await prisma.task.createMany({
      data: fresh.map((c) => ({ projectId: sheet.projectId, ...c })),
    });
    await logAudit({
      actorId: session.sub,
      actorName: session.name,
      action: "TASK_SHEET_ACTIONS_SYNCED",
      entityType: "TaskSheet",
      entityId: sheetId,
      details: { projectId: sheet.projectId, added: fresh.length },
    });
  }

  revalidatePath(`/staff/projects/${sheet.projectId}`);
  revalidatePath("/client");
  return { ok: true, added: fresh.length };
}

export async function deleteDraftTaskSheet(sheetId: string): Promise<ActionResult> {
  const session = await requireRole(["CONSULTANT"]);

  const sheet = await loadOwnSheet(sheetId, session.sub);
  if (!sheet) return { ok: false, error: "You do not have access to this task sheet." };
  if (sheet.status !== "DRAFT") {
    return { ok: false, error: "Only draft task sheets can be deleted." };
  }

  // Keep numbering sequential: only the latest sheet may be removed.
  const later = await prisma.taskSheet.count({
    where: { projectId: sheet.projectId, sheetNo: { gt: sheet.sheetNo } },
  });
  if (later > 0) {
    return { ok: false, error: "Only the most recent task sheet can be deleted." };
  }

  await prisma.taskSheet.delete({ where: { id: sheetId } });

  await logAudit({
    actorId: session.sub,
    actorName: session.name,
    action: "TASK_SHEET_DELETED",
    entityType: "TaskSheet",
    entityId: sheetId,
    details: { projectId: sheet.projectId, sheetNo: sheet.sheetNo },
  });

  revalidatePath(`/staff/projects/${sheet.projectId}`);
  revalidatePath("/admin/task-sheets");
  return { ok: true };
}

export async function reviewTaskSheet(
  sheetId: string,
  decision: "REVIEWED" | "RETURNED",
  comments: string,
  signature = ""
): Promise<ActionResult> {
  const session = await requireRole(["ADMIN"]);

  const sheet = await prisma.taskSheet.findUnique({
    where: { id: sheetId },
    select: {
      id: true,
      projectId: true,
      consultantId: true,
      sheetNo: true,
      status: true,
      data: true,
      project: { select: { title: true } },
    },
  });
  if (!sheet) return { ok: false, error: "Task sheet not found." };
  if (sheet.status !== "SUBMITTED") {
    return { ok: false, error: "Only submitted task sheets can be reviewed." };
  }

  const trimmed = comments.trim();
  if (decision === "RETURNED" && !trimmed) {
    return { ok: false, error: "Add a comment explaining what needs revising." };
  }
  const signed = signature.trim();
  if (decision === "REVIEWED" && !signed) {
    return { ok: false, error: "Type your full name as the reviewer signature." };
  }
  const current = (sheet.data ?? {}) as TaskSheetData;

  await prisma.taskSheet.update({
    where: { id: sheetId },
    data:
      decision === "REVIEWED"
        ? {
            status: "REVIEWED",
            reviewedById: session.sub,
            reviewedAt: new Date(),
            reviewComments: trimmed || null,
            data: {
              ...current,
              certification: { ...current.certification, reviewerSignature: signed },
            } as never,
          }
        : {
            status: "DRAFT",
            submittedAt: null,
            reviewComments: trimmed,
          },
  });

  const label = `${formatSheetNo(sheet.sheetNo)} for "${sheet.project.title}"`;

  await logAudit({
    actorId: session.sub,
    actorName: session.name,
    action: decision === "REVIEWED" ? "TASK_SHEET_REVIEWED" : "TASK_SHEET_RETURNED",
    entityType: "TaskSheet",
    entityId: sheetId,
    details: { projectId: sheet.projectId, comments: trimmed },
  });

  await notify(sheet.consultantId, {
    actorId: session.sub,
    projectId: sheet.projectId,
    type: decision === "REVIEWED" ? "TASK_SHEET_REVIEWED" : "TASK_SHEET_RETURNED",
    message:
      decision === "REVIEWED"
        ? `Task sheet ${label} was reviewed by ${session.name}.`
        : `Task sheet ${label} was returned for revision: ${trimmed}`,
  });

  revalidateSheet(sheet.projectId, sheetId);
  return { ok: true };
}
