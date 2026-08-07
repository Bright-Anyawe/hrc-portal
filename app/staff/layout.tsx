import { requireRole } from "@/lib/rbac";
import { getNotifications } from "@/lib/notifications";
import { PortalNav } from "@/components/portal-nav";

export default async function StaffLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireRole(["CONSULTANT"]);
  const notifications = await getNotifications(session.sub);

  return (
    <div className="min-h-screen bg-muted/30">
      <PortalNav
        name={session.name}
        role="Consultant"
        notifications={notifications}
        links={[{ href: "/staff", label: "My Clients" }]}
      />
      <main className="mx-auto max-w-6xl px-4 py-8 md:px-6">{children}</main>
    </div>
  );
}
