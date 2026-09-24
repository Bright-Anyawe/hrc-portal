import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";
import { formatSheetNo, type TaskSheetData } from "@/lib/task-sheet";
import { TaskSheetForm } from "@/components/staff/task-sheet-form";
import { SyncActionPlanButton } from "@/components/staff/sync-action-plan-button";
import { TaskSheetStatusBadge } from "@/components/task-sheet-status";
import { FormAlert } from "@/components/ui/form-alert";
import { PageHeader } from "@/components/page-header";

export default async function StaffTaskSheetPage({
  params,
}: {
  params: Promise<{ id: string; sheetId: string }>;
}) {
  const session = await requireRole(["CONSULTANT"]);
  const { id, sheetId } = await params;

  const sheet = await prisma.taskSheet.findFirst({
    where: { id: sheetId, projectId: id, project: { consultantId: session.sub } },
    include: {
      project: { select: { title: true, client: { select: { name: true } } } },
      reviewedBy: { select: { name: true } },
    },
  });
  if (!sheet) notFound();

  const latest = await prisma.taskSheet.findFirst({
    where: { projectId: id },
    orderBy: { sheetNo: "desc" },
    select: { id: true },
  });

  const isDraft = sheet.status === "DRAFT";
  const backHref = `/staff/projects/${id}`;

  return (
    <div className="space-y-6">
      <Link
        href={backHref}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to {sheet.project.title}
      </Link>

      <PageHeader
        title={`Task Sheet ${formatSheetNo(sheet.sheetNo)}`}
        description={
          <span className="flex flex-wrap items-center gap-2">
            {sheet.project.client.name} · {sheet.project.title}
            <TaskSheetStatusBadge status={sheet.status} />
          </span>
        }
      />

      {sheet.reviewComments && (
        <FormAlert variant={sheet.status === "REVIEWED" ? "success" : "error"}>
          {sheet.status === "REVIEWED"
            ? `Reviewed by ${sheet.reviewedBy?.name ?? "admin"}: `
            : "Returned for revision: "}
          {sheet.reviewComments}
        </FormAlert>
      )}

      {(sheet.data as TaskSheetData).actionPlan?.some((r) => r.action?.trim()) && (
        <SyncActionPlanButton sheetId={sheet.id} />
      )}

      <TaskSheetForm
        sheetId={sheet.id}
        initialData={(sheet.data ?? {}) as TaskSheetData}
        readOnly={!isDraft}
        canDelete={isDraft && latest?.id === sheet.id}
        backHref={backHref}
        review={{
          reviewerName: sheet.reviewedBy?.name,
          reviewedAt: sheet.reviewedAt?.toISOString(),
          comments: sheet.status === "REVIEWED" ? sheet.reviewComments : null,
        }}
      />
    </div>
  );
}
