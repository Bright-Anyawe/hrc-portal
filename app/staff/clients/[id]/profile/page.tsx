import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";
import { ProfileForm } from "@/components/client/profile-form";
import {
  OnboardingChecklist,
  ProfileStatusBadge,
} from "@/components/client/profile-status";
import { PageHeader } from "@/components/page-header";
import type { ClientProfileData, HrcInternalData } from "@/app/actions/client-profile";

export default async function StaffClientProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireRole(["CONSULTANT"]);
  const { id } = await params;

  // Verify this client is assigned to this consultant
  const assignment = await prisma.clientAssignment.findUnique({
    where: {
      consultantId_clientId: {
        consultantId: session.sub,
        clientId: id,
      },
    },
  });

  if (!assignment) notFound();

  const user = await prisma.user.findUnique({
    where: { id },
    select: { id: true, name: true, email: true },
  });

  if (!user) notFound();

  const profile = await prisma.clientProfile.findUnique({
    where: { userId: id },
  });

  if (!profile) {
    return (
      <div className="space-y-6">
        <Link
          href="/staff"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to my clients
        </Link>
        <PageHeader
          title={`${user.name} — Client Profile`}
          description={user.email}
        />
        <p className="text-muted-foreground">
          No profile has been created for this client yet.
        </p>
      </div>
    );
  }

  const profileData = (profile.profileData as ClientProfileData) ?? {};
  const hrcData = (profile.hrcData as HrcInternalData) ?? {};

  return (
    <div className="space-y-6">
      <Link
        href="/staff"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to my clients
      </Link>

      <PageHeader
        title={`${user.name} — Client Profile`}
        description={
          <span className="flex items-center gap-2">
            {user.email}
            <ProfileStatusBadge status={profile.status as never} />
          </span>
        }
      />

      <ProfileForm
        profileId={profile.id}
        initialData={profileData}
        completionPct={profile.completionPct}
        status={profile.status}
        isReadOnly
      />

      <OnboardingChecklist
        status={profile.status as never}
        completionPct={profile.completionPct}
        hrcData={hrcData as Record<string, unknown>}
        hasConsultant
      />
    </div>
  );
}
