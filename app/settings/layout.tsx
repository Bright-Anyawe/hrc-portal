import { requireRole } from "@/lib/rbac";
import { getNotifications } from "@/lib/notifications";
import { NAV_LINKS, ROLE_LABEL } from "@/lib/nav";
import { PortalShell } from "@/components/portal-shell";

// Settings is shared by every role, so render it inside the signed-in
// user's own portal shell (nav, notifications, sign-out).
export default async function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireRole(["ADMIN", "CONSULTANT", "CLIENT"]);
  const notifications = await getNotifications(session.sub);

  return (
    <PortalShell
      name={session.name}
      role={ROLE_LABEL[session.role]}
      userRole={session.role}
      notifications={notifications}
      links={NAV_LINKS[session.role]}
    >
      {children}
    </PortalShell>
  );
}
