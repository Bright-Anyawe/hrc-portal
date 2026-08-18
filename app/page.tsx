import { redirect } from "next/navigation";
import { verifySession } from "@/lib/auth";
import { ROLE_HOMES } from "@/lib/rbac";
import { LandingPage } from "@/components/landing-page";

export default async function Home() {
  const session = await verifySession();
  if (session) redirect(ROLE_HOMES[session.role]);
  return <LandingPage />;
}
