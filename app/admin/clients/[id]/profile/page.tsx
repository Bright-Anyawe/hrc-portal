import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, NotebookPen } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";
import { ProfileForm } from "@/components/client/profile-form";
import { HrcSectionForm } from "@/components/admin/hrc-section-form";
import {
  OnboardingChecklist,
  ProfileStatusBadge,
} from "@/components/client/profile-status";
import { PageHeader } from "@/components/page-header";
import type { ClientProfileData, HrcInternalData } from "@/app/actions/client-profile";

export default async function AdminClientProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireRole(["ADMIN"]);
  const { id } = await params;

  const user = await prisma.user.findUnique({
    where: { id },
    select: { id: true, name: true, email: true, role: true },
  });

  if (!user || user.role !== "CLIENT") notFound();

  let profile = await prisma.clientProfile.findUnique({
    where: { userId: id },
    include: {
      reviewedBy: { select: { name: true } },
    },
  });

  // Auto-create profile if missing
  if (!profile) {
    profile = await prisma.clientProfile.create({
      data: {
        userId: id,
        status: "DRAFT",
        profileData: { organization: { orgName: user.name } },
        hrcData: {},
        completionPct: 0,
      },
      include: {
        reviewedBy: { select: { name: true } },
      },
    });
  }

  const assignment = await prisma.clientAssignment.findFirst({
    where: { clientId: id },
    include: { consultant: { select: { name: true } } },
  });

  const profileData = (profile.profileData as ClientProfileData) ?? {};
  const hrcData = (profile.hrcData as HrcInternalData) ?? {};

  return (
    <div className="space-y-6">
      <Link
        href="/admin/clients"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to clients
      </Link>

      <PageHeader
        title={`${user.name} — Client Profile`}
        description={
          <span className="flex items-center gap-2">
            {user.email}
            <ProfileStatusBadge status={profile.status as never} />
            {profile.reviewedBy && (
              <span className="text-xs text-muted-foreground">
                Reviewed by {profile.reviewedBy.name}
              </span>
            )}
          </span>
        }
        actions={
          <Link
            href={`/admin/task-sheets?status=ALL&client=${user.id}`}
            className="inline-flex items-center gap-1 rounded-md border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <NotebookPen className="h-3.5 w-3.5" />
            Task sheets
          </Link>
        }
      />

      {assignment && (
        <p className="text-sm text-muted-foreground">
          Assigned consultant:{" "}
          <span className="font-medium text-foreground">
            {assignment.consultant.name}
          </span>
        </p>
      )}

      <ProfileForm
        profileId={profile.id}
        initialData={profileData}
        completionPct={profile.completionPct}
        status={profile.status}
      />

      <HrcSectionForm
        profileId={profile.id}
        initialData={hrcData}
        profileStatus={profile.status}
      />

      <OnboardingChecklist
        status={profile.status as never}
        completionPct={profile.completionPct}
        hrcData={hrcData as Record<string, unknown>}
        hasConsultant={!!assignment}
      />
    </div>
  );
}
