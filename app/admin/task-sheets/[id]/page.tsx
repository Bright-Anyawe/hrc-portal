import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, FileText } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";
import { formatSheetNo, type TaskSheetData } from "@/lib/task-sheet";
import { TaskSheetForm } from "@/components/staff/task-sheet-form";
import { TaskSheetReview } from "@/components/admin/task-sheet-review";
import { TaskSheetStatusBadge } from "@/components/task-sheet-status";
import { FormAlert } from "@/components/ui/form-alert";
import { PageHeader } from "@/components/page-header";

export default async function AdminTaskSheetPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireRole(["ADMIN"]);
  const { id } = await params;

  const sheet = await prisma.taskSheet.findUnique({
    where: { id },
    include: {
      project: { select: { title: true } },
      client: { select: { id: true, name: true } },
      consultant: { select: { name: true } },
      reviewedBy: { select: { name: true } },
    },
  });
  if (!sheet) notFound();

  return (
    <div className="space-y-6">
      <Link
        href="/admin/task-sheets"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to task sheets
      </Link>

      <PageHeader
        title={`Task Sheet ${formatSheetNo(sheet.sheetNo)}`}
        description={
          <span className="flex flex-wrap items-center gap-2">
            {sheet.client.name} · {sheet.project.title} · by{" "}
            {sheet.consultant.name}
            <TaskSheetStatusBadge status={sheet.status} />
          </span>
        }
        actions={
          <Link
            href={`/admin/clients/${sheet.client.id}/profile`}
            className="inline-flex items-center gap-1 rounded-md border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <FileText className="h-3.5 w-3.5" />
            Client profile
          </Link>
        }
      />

      {sheet.status === "REVIEWED" && (
        <FormAlert variant="success">
          Reviewed by {sheet.reviewedBy?.name ?? "admin"} on{" "}
          {sheet.reviewedAt?.toLocaleDateString()}
          {sheet.reviewComments ? ` — ${sheet.reviewComments}` : "."}
        </FormAlert>
      )}

      {sheet.status === "SUBMITTED" && <TaskSheetReview sheetId={sheet.id} reviewerName={session.name} />}

      <TaskSheetForm
        sheetId={sheet.id}
        initialData={(sheet.data ?? {}) as TaskSheetData}
        readOnly
        review={{
          reviewerName: sheet.reviewedBy?.name,
          reviewedAt: sheet.reviewedAt?.toISOString(),
          comments: sheet.status === "REVIEWED" ? sheet.reviewComments : null,
        }}
      />
    </div>
  );
}
