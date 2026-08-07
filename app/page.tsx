import { redirect } from "next/navigation";
import { verifySession } from "@/lib/auth";
import { ROLE_HOMES } from "@/lib/rbac";

export default async function Home() {
  const session = await verifySession();
  redirect(session ? ROLE_HOMES[session.role] : "/login");
}
