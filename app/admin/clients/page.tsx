import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";
import { Users } from "lucide-react";
import { unassignConsultant, deleteUser } from "@/app/actions/admin";
import { AddUserModal } from "@/components/admin/add-user-modal";
import { EditUserDialog } from "@/components/admin/edit-user-dialog";
import { DeleteDialog } from "@/components/admin/delete-dialog";
import { ChangeRoleDialog } from "@/components/admin/change-role-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Avatar, AvatarFallback, getInitials } from "@/components/ui/avatar";
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

export default async function AdminClientsPage() {
  await requireRole(["ADMIN"]);

  const clients = await prisma.user.findMany({
    where: { role: "CLIENT" },
    orderBy: { createdAt: "desc" },
    include: {
      clientAssignments: {
        include: { consultant: { select: { id: true, name: true } } },
      },
      projectsAsClient: { select: { id: true } },
    },
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Clients"
        description="Client accounts managed by HRC."
        actions={<AddUserModal role="CLIENT" />}
      />

      <Card>
        <CardHeader>
          <CardTitle>All clients</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {clients.length === 0 ? (
            <EmptyState
              icon={Users}
              title="No clients yet"
              description="Create your first client account to start assigning consultants and projects."
              action={<AddUserModal role="CLIENT" />}
            />
          ) : (
            <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Assigned consultants</TableHead>
                <TableHead>Projects</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clients.map((client) => (
                <TableRow key={client.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback>
                          {getInitials(client.name)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{client.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {client.email}
                  </TableCell>
                  <TableCell>
                    {client.clientAssignments.length === 0 ? (
                      <span className="text-xs text-muted-foreground">
                        Unassigned
                      </span>
                    ) : (
                      <div className="flex flex-wrap items-center gap-1.5">
                        {client.clientAssignments.map((assignment) => (
                          <span
                            key={assignment.id}
                            className="inline-flex items-center gap-1 rounded-md border bg-muted px-2 py-0.5 text-xs"
                          >
                            {assignment.consultant.name}
                            <form
                              action={unassignConsultant.bind(
                                null,
                                assignment.consultantId,
                                assignment.clientId
                              )}
                            >
                              <button
                                type="submit"
                                className="text-muted-foreground hover:text-destructive"
                                aria-label={`Unassign ${assignment.consultant.name}`}
                              >
                                ×
                              </button>
                            </form>
                          </span>
                        ))}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {client.projectsAsClient.length}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <ChangeRoleDialog
                        user={{
                          id: client.id,
                          name: client.name,
                          role: "CLIENT",
                        }}
                        role="CLIENT"
                      />
                      <EditUserDialog
                        user={{
                          id: client.id,
                          name: client.name,
                          email: client.email,
                        }}
                        role="CLIENT"
                      />
                      <DeleteDialog
                        entityLabel={`client ${client.name}`}
                        action={deleteUser.bind(null, client.id)}
                        description={`This removes ${client.name} and any projects linked to them. Other users and audit history are preserved.`}
                      />
                    </div>
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
