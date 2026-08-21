import { requireRole } from "@/lib/rbac";
import { getNotifications } from "@/lib/notifications";
import { PortalShell } from "@/components/portal-shell";

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
      links={[
        { href: "/client", label: "Dashboard" },
        { href: "/client/invoices", label: "Invoices" },
        { href: "/settings", label: "Settings" },
      ]}
    >
      {children}
    </PortalShell>
  );
}