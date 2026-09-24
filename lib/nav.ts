import type { Role } from "@/generated/prisma/enums";
import type { NavLink } from "@/components/portal-shell";

// Single source for each portal's navigation, shared by the role layouts
// and the cross-role /settings page.
export const NAV_LINKS: Record<Role, NavLink[]> = {
  ADMIN: [
    { href: "/admin", label: "Overview" },
    { href: "/admin/clients", label: "Clients" },
    { href: "/admin/consultants", label: "Consultants" },
    { href: "/admin/projects", label: "Projects" },
    { href: "/admin/task-sheets", label: "Task sheets" },
    { href: "/admin/invoices", label: "Invoices" },
    { href: "/admin/audit", label: "Audit log" },
    { href: "/settings", label: "Settings" },
  ],
  CONSULTANT: [
    { href: "/staff", label: "My Clients" },
    { href: "/settings", label: "Settings" },
  ],
  CLIENT: [
    { href: "/client", label: "Dashboard" },
    { href: "/client/profile", label: "My Profile" },
    { href: "/client/meetings", label: "Meetings" },
    { href: "/client/invoices", label: "Invoices" },
    { href: "/settings", label: "Settings" },
  ],
};

export const ROLE_LABEL: Record<Role, string> = {
  ADMIN: "Administrator",
  CONSULTANT: "Consultant",
  CLIENT: "Client",
};
