import "server-only";
import { redirect } from "next/navigation";
import { verifySession } from "@/lib/auth";
import type { Role } from "@/generated/prisma/enums";

export const ROLE_HOMES: Record<Role, string> = {
  ADMIN: "/admin",
  CONSULTANT: "/staff",
  CLIENT: "/client",
};

export async function requireRole(allowed: Role[]) {
  const session = await verifySession();
  if (!session) redirect("/login");
  if (!allowed.includes(session.role)) redirect(ROLE_HOMES[session.role]);
  return session;
}
