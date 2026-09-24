import { requireRole } from "@/lib/rbac";
import { getNotifications } from "@/lib/notifications";
import { PortalShell } from "@/components/portal-shell";
import { NAV_LINKS } from "@/lib/nav";

export default async function StaffLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireRole(["CONSULTANT"]);
  const notifications = await getNotifications(session.sub);

  return (
    <PortalShell
      name={session.name}
      role="Consultant"
      userRole="CONSULTANT"
      notifications={notifications}
      links={NAV_LINKS.CONSULTANT}
    >
      {children}
    </PortalShell>
  );
}