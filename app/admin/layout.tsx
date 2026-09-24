import { requireRole } from "@/lib/rbac";
import { getNotifications } from "@/lib/notifications";
import { PortalShell } from "@/components/portal-shell";
import { NAV_LINKS } from "@/lib/nav";

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
      links={NAV_LINKS.ADMIN}
    >
      {children}
    </PortalShell>
  );
}