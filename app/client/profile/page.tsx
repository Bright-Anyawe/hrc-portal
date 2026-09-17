import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";
import { ProfileForm } from "@/components/client/profile-form";
import { ProfileStatusBadge } from "@/components/client/profile-status";
import { PageHeader } from "@/components/page-header";
import type { ClientProfileData } from "@/app/actions/client-profile";

export default async function ClientProfilePage() {
  const session = await requireRole(["CLIENT"]);

  let profile = await prisma.clientProfile.findUnique({
    where: { userId: session.sub },
  });

  // Auto-create profile if missing (handles pre-existing users)
  if (!profile) {
    profile = await prisma.clientProfile.create({
      data: {
        userId: session.sub,
        status: "DRAFT",
        profileData: { organization: { orgName: session.name } },
        hrcData: {},
        completionPct: 0,
      },
    });
  }

  const profileData = (profile.profileData as ClientProfileData) ?? {};

  return (
    <div className="space-y-6">
      <PageHeader
        title="Client Profile"
        description="Complete your organisation profile for HRC onboarding."
        actions={<ProfileStatusBadge status={profile.status as never} />}
      />

      {profile.status === "REJECTED" && profile.rejectionReason && (
        <div className="rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <p className="font-medium">Profile needs updates</p>
          <p className="mt-1">{profile.rejectionReason}</p>
        </div>
      )}

      {profile.status === "APPROVED" && (
        <div className="rounded-md bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200">
          Your client profile has been approved. Thank you for completing it.
        </div>
      )}

      <ProfileForm
        profileId={profile.id}
        initialData={profileData}
        completionPct={profile.completionPct}
        status={profile.status}
        isReadOnly={profile.status === "APPROVED"}
      />
    </div>
  );
}
