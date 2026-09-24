import { requireRole } from "@/lib/rbac";
import { getNotifications } from "@/lib/notifications";
import { PortalShell } from "@/components/portal-shell";
import { NAV_LINKS } from "@/lib/nav";

export default async function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireRole(["CLIENT"]);
  const notifications = await getNotifications(session.sub);

  return (
    <PortalShell
      name={session.name}
      role="Client"
      userRole="CLIENT"
      notifications={notifications}
      links={NAV_LINKS.CLIENT}
    >
      {children}
    </PortalShell>
  );
}