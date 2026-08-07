import { redirect } from "next/navigation";
import { verifySession } from "@/lib/auth";
import { ROLE_HOMES } from "@/lib/rbac";
import { LoginForm } from "@/components/login-form";

export default async function LoginPage() {
  const session = await verifySession();
  if (session) redirect(ROLE_HOMES[session.role]);

  return <LoginForm />;
}
