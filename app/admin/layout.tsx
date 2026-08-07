import { requireRole } from "@/lib/rbac";
import { getNotifications } from "@/lib/notifications";
import { PortalNav } from "@/components/portal-nav";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireRole(["ADMIN"]);
  const notifications = await getNotifications(session.sub);

  return (
    <div className="min-h-screen bg-muted/30">
      <PortalNav
        name={session.name}
        role="Administrator"
        notifications={notifications}
        links={[
          { href: "/admin", label: "Overview" },
          { href: "/admin/clients", label: "Clients" },
          { href: "/admin/consultants", label: "Consultants" },
          { href: "/admin/projects", label: "Projects" },
          { href: "/admin/audit", label: "Audit log" },
        ]}
      />
      <main className="mx-auto max-w-6xl px-4 py-8 md:px-6">{children}</main>
    </div>
  );
}
