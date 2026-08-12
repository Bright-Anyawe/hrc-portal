import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";
import { PasswordForm } from "@/components/settings/password-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function SettingsPage() {
  const session = await requireRole(["ADMIN", "CONSULTANT", "CLIENT"]);

  const user = await prisma.user.findUnique({
    where: { id: session.sub },
    select: { name: true, email: true, passwordHash: true },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Manage your account and sign-in credentials.
        </p>
      </div>

      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle>Change password</CardTitle>
          <CardDescription>
            {user?.passwordHash
              ? "Verify your current password, then set a new one."
              : "You don't have a password yet. Set one to sign in with email instead of Google."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PasswordForm hasPassword={Boolean(user?.passwordHash)} />
        </CardContent>
      </Card>
    </div>
  );
}