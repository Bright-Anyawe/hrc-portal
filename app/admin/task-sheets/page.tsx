import Link from "next/link";
import { NotebookPen } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";
import { formatSheetNo, type TaskSheetData } from "@/lib/task-sheet";
import { TaskSheetStatusBadge } from "@/components/task-sheet-status";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type { TaskSheetStatus } from "@/generated/prisma/enums";

const FILTERS: { value: TaskSheetStatus | "ALL"; label: string }[] = [
  { value: "SUBMITTED", label: "Awaiting review" },
  { value: "REVIEWED", label: "Reviewed" },
  { value: "DRAFT", label: "Drafts" },
  { value: "ALL", label: "All" },
];

export default async function AdminTaskSheetsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; client?: string }>;
}) {
  await requireRole(["ADMIN"]);
  const { status: rawStatus, client } = await searchParams;
  const status = FILTERS.some((f) => f.value === rawStatus)
    ? (rawStatus as TaskSheetStatus | "ALL")
    : "SUBMITTED";

  const [sheets, counts] = await Promise.all([
    prisma.taskSheet.findMany({
      where: {
        ...(status === "ALL" ? {} : { status }),
        ...(client ? { clientId: client } : {}),
      },
      orderBy: [{ interactionDate: "desc" }, { createdAt: "desc" }],
      include: {
        project: { select: { title: true } },
        client: { select: { name: true } },
        consultant: { select: { name: true } },
      },
    }),
    prisma.taskSheet.groupBy({
      by: ["status"],
      where: client ? { clientId: client } : undefined,
      _count: true,
    }),
  ]);

  const countFor = (s: TaskSheetStatus | "ALL") =>
    s === "ALL"
      ? counts.reduce((n, c) => n + c._count, 0)
      : (counts.find((c) => c.status === s)?._count ?? 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Task sheets"
        description="Consultant-client interaction records. Review submitted sheets and follow up on escalations."
      />

      <div className="flex flex-wrap gap-1">
        {FILTERS.map((f) => (
          <Link
            key={f.value}
            href={`/admin/task-sheets?status=${f.value}${client ? `&client=${client}` : ""}`}
            className={cn(
              "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
              status === f.value
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            )}
          >
            {f.label} ({countFor(f.value)})
          </Link>
        ))}
      </div>

      <Card>
        <CardContent className="pt-6">
          {sheets.length === 0 ? (
            <EmptyState
              icon={NotebookPen}
              title="No task sheets"
              description="Task sheets matching this filter will appear here."
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>No.</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Project</TableHead>
                  <TableHead>Consultant</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Escalation</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sheets.map((sheet) => {
                  const data = (sheet.data ?? {}) as TaskSheetData;
                  const escalated = (data.escalation?.to ?? []).filter(
                    (t) => t !== "No"
                  );
                  return (
                    <TableRow key={sheet.id}>
                      <TableCell>
                        <Link
                          href={`/admin/task-sheets/${sheet.id}`}
                          className="font-mono text-xs font-semibold text-primary hover:underline"
                        >
                          {formatSheetNo(sheet.sheetNo)}
                        </Link>
                      </TableCell>
                      <TableCell className="font-medium">
                        {sheet.client.name}
                      </TableCell>
                      <TableCell>{sheet.project.title}</TableCell>
                      <TableCell>{sheet.consultant.name}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {sheet.interactionDate?.toLocaleDateString() ?? "—"}
                      </TableCell>
                      <TableCell className="text-xs">
                        {escalated.length > 0 ? (
                          <span className="text-amber-700 dark:text-amber-300">
                            {escalated.join(", ")}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <TaskSheetStatusBadge status={sheet.status} />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
