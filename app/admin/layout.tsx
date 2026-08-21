import { requireRole } from "@/lib/rbac";
import { getNotifications } from "@/lib/notifications";
import { PortalShell } from "@/components/portal-shell";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireRole(["ADMIN"]);
  const notifications = await getNotifications(session.sub);

  return (
    <PortalShell
      name={session.name}
      role="Administrator"
      userRole="ADMIN"
      notifications={notifications}
      links={[
        { href: "/admin", label: "Overview" },
        { href: "/admin/clients", label: "Clients" },
        { href: "/admin/consultants", label: "Consultants" },
        { href: "/admin/projects", label: "Projects" },
        { href: "/admin/invoices", label: "Invoices" },
        { href: "/admin/audit", label: "Audit log" },
        { href: "/settings", label: "Settings" },
      ]}
    >
      {children}
    </PortalShell>
  );
}