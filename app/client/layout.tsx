import { requireRole } from "@/lib/rbac";
import { getNotifications } from "@/lib/notifications";
import { PortalNav } from "@/components/portal-nav";

export default async function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireRole(["CLIENT"]);
  const notifications = await getNotifications(session.sub);

  return (
    <div className="min-h-screen bg-muted/30">
      <PortalNav
        name={session.name}
        role="Client"
        userRole="CLIENT"
        notifications={notifications}
        links={[{
          href: "/client",
          label: "Dashboard",
        },
        { href: "/client/invoices", label: "Invoices" },
        { href: "/settings", label: "Settings" },
      ]}
      />
      <main className="mx-auto max-w-6xl px-4 py-8 md:px-6">{children}</main>
    </div>
  );
}
