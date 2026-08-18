import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";
import { deleteUser } from "@/app/actions/admin";
import { AddUserModal } from "@/components/admin/add-user-modal";
import { EditUserDialog } from "@/components/admin/edit-user-dialog";
import { DeleteDialog } from "@/components/admin/delete-dialog";
import { ChangeRoleDialog } from "@/components/admin/change-role-dialog";
import { Badge } from "@/components/ui/badge";
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

export default async function AdminConsultantsPage() {
  await requireRole(["ADMIN"]);

  const consultants = await prisma.user.findMany({
    where: { role: "CONSULTANT" },
    orderBy: { createdAt: "desc" },
    include: {
      consultantAssignments: {
        include: { client: { select: { id: true, name: true } } },
      },
      projectsAsConsultant: { select: { id: true } },
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Consultants</h1>
          <p className="text-sm text-muted-foreground">
            Staff accounts who deliver client work.
          </p>
        </div>
        <AddUserModal role="CONSULTANT" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All consultants</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Assigned clients</TableHead>
                <TableHead>Projects</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {consultants.map((consultant) => (
                <TableRow key={consultant.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback>
                          {getInitials(consultant.name)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{consultant.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {consultant.email}
                  </TableCell>
                  <TableCell>
                    {consultant.consultantAssignments.length === 0 ? (
                      <span className="text-xs text-muted-foreground">
                        Unassigned
                      </span>
                    ) : (
                      <div className="flex flex-wrap gap-1.5">
                        {consultant.consultantAssignments.map((assignment) => (
                          <Badge key={assignment.id} variant="secondary">
                            {assignment.client.name}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {consultant.projectsAsConsultant.length}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <ChangeRoleDialog
                        user={{
                          id: consultant.id,
                          name: consultant.name,
                          role: "CONSULTANT",
                        }}
                        role="CONSULTANT"
                      />
                      <EditUserDialog
                        user={{
                          id: consultant.id,
                          name: consultant.name,
                          email: consultant.email,
                        }}
                        role="CONSULTANT"
                      />
                      <DeleteDialog
                        entityLabel={`consultant ${consultant.name}`}
                        action={deleteUser.bind(null, consultant.id)}
                        description={`This removes ${consultant.name} and any projects assigned to them. Other users and audit history are preserved.`}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
