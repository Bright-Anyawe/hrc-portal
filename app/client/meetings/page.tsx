import { CalendarClock, CheckSquare, Handshake, NotebookPen } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";
import {
  clientSummary,
  formatSheetNo,
  type TaskSheetData,
} from "@/lib/task-sheet";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

function formatDate(value?: string | Date | null) {
  if (!value) return null;
  const d = typeof value === "string" ? new Date(value) : value;
  return Number.isNaN(d.getTime()) ? null : d.toLocaleDateString();
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {title}
      </p>
      {children}
    </div>
  );
}

export default async function ClientMeetingsPage() {
  const session = await requireRole(["CLIENT"]);

  // Only submitted/reviewed sheets are shared, and only through clientSummary.
  const sheets = await prisma.taskSheet.findMany({
    where: { clientId: session.sub, status: { in: ["SUBMITTED", "REVIEWED"] } },
    orderBy: [{ interactionDate: "desc" }, { sheetNo: "desc" }],
    select: {
      id: true,
      sheetNo: true,
      interactionDate: true,
      data: true,
      project: { select: { title: true } },
      consultant: { select: { name: true } },
    },
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Meeting records"
        description="Summaries of your interactions with HRC: what was agreed, who does what, and what happens next."
      />

      {sheets.length === 0 ? (
        <EmptyState
          icon={NotebookPen}
          title="No meeting records yet"
          description="After each meeting, your consultant's summary of decisions and next steps will appear here."
        />
      ) : (
        <div className="space-y-4">
          {sheets.map((sheet) => {
            const s = clientSummary((sheet.data ?? {}) as TaskSheetData);
            return (
              <Card key={sheet.id}>
                <CardHeader>
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <CardTitle className="text-base">
                      {sheet.project.title}
                    </CardTitle>
                    <span className="font-mono text-xs text-muted-foreground">
                      {formatSheetNo(sheet.sheetNo)}
                    </span>
                  </div>
                  <CardDescription className="flex flex-wrap items-center gap-2">
                    {formatDate(sheet.interactionDate) ?? "Date not recorded"}
                    {" · "}
                    {sheet.consultant.name}
                    {s.location ? ` · ${s.location}` : ""}
                    {s.interactionType.map((t) => (
                      <Badge key={t} variant="secondary">
                        {t}
                      </Badge>
                    ))}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 text-sm">
                  {s.purpose && (
                    <Block title="Purpose">
                      <p className="whitespace-pre-line">{s.purpose}</p>
                    </Block>
                  )}

                  {(s.decisions.length > 0 || s.scopeChange) && (
                    <Block title="Decisions & agreements">
                      <ul className="list-inside list-decimal space-y-1">
                        {s.decisions.map((d, i) => (
                          <li key={i}>{d}</li>
                        ))}
                      </ul>
                      {s.scopeChange && (
                        <p className="mt-2 rounded-md bg-amber-50 px-3 py-2 text-amber-900 dark:bg-amber-900/30 dark:text-amber-200">
                          Scope change: {s.scopeChange}
                        </p>
                      )}
                    </Block>
                  )}

                  {s.actionPlan.length > 0 && (
                    <Block title="Agreed action plan">
                      <ul className="space-y-1.5">
                        {s.actionPlan.map((a, i) => (
                          <li
                            key={i}
                            className="flex flex-wrap items-center gap-2 rounded-md border px-3 py-2"
                          >
                            <CheckSquare className="h-4 w-4 shrink-0 text-muted-foreground" />
                            <span className="min-w-0 flex-1">{a.action}</span>
                            {a.responsible && (
                              <span className="text-xs text-muted-foreground">
                                {a.responsible}
                              </span>
                            )}
                            {formatDate(a.dueDate) && (
                              <span className="text-xs text-muted-foreground">
                                Due {formatDate(a.dueDate)}
                              </span>
                            )}
                            {a.status && <Badge variant="outline">{a.status}</Badge>}
                          </li>
                        ))}
                      </ul>
                    </Block>
                  )}

                  <div className="grid gap-4 sm:grid-cols-2">
                    {s.clientCommitments.length > 0 && (
                      <Block title="What we need from you">
                        <dl className="space-y-2">
                          {s.clientCommitments.map((c) => (
                            <div key={c.label}>
                              <dt className="text-xs text-muted-foreground">{c.label}</dt>
                              <dd className="whitespace-pre-line">{c.value}</dd>
                            </div>
                          ))}
                        </dl>
                      </Block>
                    )}
                    {(s.consultantCommitments.work || s.consultantCommitments.deliverables) && (
                      <Block title="What HRC will deliver">
                        <div className="flex gap-2">
                          <Handshake className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                          <div className="space-y-1">
                            {s.consultantCommitments.work && (
                              <p className="whitespace-pre-line">{s.consultantCommitments.work}</p>
                            )}
                            {s.consultantCommitments.deliverables && (
                              <p className="whitespace-pre-line text-muted-foreground">
                                Deliverables: {s.consultantCommitments.deliverables}
                              </p>
                            )}
                            {formatDate(s.consultantCommitments.dueDate) && (
                              <p className="text-xs text-muted-foreground">
                                Due {formatDate(s.consultantCommitments.dueDate)}
                              </p>
                            )}
                          </div>
                        </div>
                      </Block>
                    )}
                  </div>

                  {s.nextInteraction && (
                    <div className="flex items-start gap-2 rounded-md bg-muted/50 px-3 py-2">
                      <CalendarClock className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      <p>
                        <span className="font-medium">Next: </span>
                        {[
                          formatDate(s.nextInteraction.date),
                          s.nextInteraction.purpose,
                          s.nextInteraction.nextAction,
                        ]
                          .filter(Boolean)
                          .join(" — ")}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
