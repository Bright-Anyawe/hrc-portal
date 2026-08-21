import { ScrollText } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PageHeader } from "@/components/page-header";

const ACTION_LABEL: Record<string, string> = {
  USER_INVITED: "User invited",
  ASSIGNMENT_CREATED: "Assignment created",
  ASSIGNMENT_DELETED: "Assignment removed",
  PROJECT_CREATED: "Project created",
  PROJECT_STATUS_CHANGED: "Project status changed",
  DOCUMENT_UPLOADED: "Document uploaded",
};

const ACTION_VARIANT: Record<
  string,
  "default" | "secondary" | "destructive" | "info" | "success" | "warning"
> = {
  USER_INVITED: "info",
  ASSIGNMENT_CREATED: "success",
  ASSIGNMENT_DELETED: "destructive",
  PROJECT_CREATED: "secondary",
  PROJECT_STATUS_CHANGED: "warning",
  DOCUMENT_UPLOADED: "default",
};

function formatDetails(details: unknown): string {
  if (!details) return "—";
  try {
    return JSON.stringify(details);
  } catch {
    return String(details);
  }
}

export default async function AdminAuditPage() {
  await requireRole(["ADMIN"]);

  const logs = await prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Audit log"
        description="Track administrative and project actions across the portal."
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ScrollText className="h-5 w-5" />
            Recent activity
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {logs.length === 0 ? (
            <EmptyState
              icon={ScrollText}
              title="No recorded activity yet"
              description="Administrative and project actions will be logged here."
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Action</TableHead>
                  <TableHead>Actor</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead>When</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>
                      <Badge variant={ACTION_VARIANT[log.action] ?? "secondary"}>
                        {ACTION_LABEL[log.action] ?? log.action}
                      </Badge>
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {log.actorName}
                    </TableCell>
                    <TableCell className="max-w-md">
                      <code className="break-all text-xs text-muted-foreground">
                        {formatDetails(log.details)}
                      </code>
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-muted-foreground">
                      {log.createdAt.toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
