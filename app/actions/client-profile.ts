"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";
import { logAudit } from "@/lib/audit";
import { notify, notifyAdmins } from "@/lib/notify";
import type { Prisma } from "@/generated/prisma/client";

export type ActionResult = {
  ok: boolean;
  error?: string;
  profileId?: string;
};

// --- Profile Data Types ---

export type ClientOrganizationData = {
  orgName: string;
  tradingName?: string;
  legalName?: string;
  registrationNo?: string;
  tin?: string;
  yearEstablished?: string;
  website?: string;
  clientType?: string[];
  clientTypeOther?: string;
  sector?: string[];
  sectorOther?: string;
};

export type ClientAddressData = {
  digitalAddress: string;
  houseNo?: string;
  street?: string;
  city?: string;
  district?: string;
  region?: string;
  country?: string;
};

export type ClientContactData = {
  title?: string;
  fullName: string;
  position?: string;
  department?: string;
  mobileNo: string;
  altPhone?: string;
  email: string;
  preferredContact?: string;
  otherContact?: string;
};

export type ClientSecondaryContact = {
  fullName?: string;
  position?: string;
  mobileNo?: string;
  email?: string;
  roleInEngagement?: string;
  otherRole?: string;
};

export type ClientScaleData = {
  employeeCount?: string;
  geographicCoverage?: string;
  annualRevenue?: string;
  mainFundingSource?: string;
  fundingSourceOther?: string;
  briefDescription?: string;
  strategicPriorities?: string;
};

export type ClientServicesData = {
  servicesRequired?: string[];
  servicesOther?: string;
  specificNeed?: string;
};

export type ClientEngagementData = {
  projectTitle?: string;
  expectedStartDate?: string;
  expectedDuration?: string;
  locationOfAssignment?: string;
  estimatedBudget?: string;
  procurementMethod?: string;
  procurementOther?: string;
  fundingApprovalStatus?: string;
};

export type ClientScopeData = {
  expectedScope?: string;
  expectedDeliverables?: string;
  successDefinition?: string;
};

export type ClientCommercialData = {
  billingContact?: string;
  billingEmail?: string;
  purchaseOrderRequired?: string;
  taxWithholding?: string;
  preferredPaymentTerms?: string;
  paymentTermsOther?: string;
  currency?: string;
  currencyOther?: string;
  specialInvoicing?: string;
};

export type ClientComplianceData = {
  formalProcurement?: string;
  confidentialityRequired?: string;
  sensitiveData?: string;
  conflictOfInterest?: string;
  conflictDetails?: string;
  specialRegulatory?: string;
  documentsReceived?: string[];
  documentsOther?: string;
};

export type ClientAcquisitionData = {
  howHeardAbout?: string[];
  heardOther?: string;
  referredBy?: string;
  existingClient?: string;
  previousAssignments?: string;
  relationshipOwner?: string;
  leadConsultant?: string;
};

export type ClientDeclarationData = {
  authorisedRepresentative?: string;
  declarationPosition?: string;
  declarationDate?: string;
};

export type ClientProfileData = {
  organization?: ClientOrganizationData;
  address?: ClientAddressData;
  primaryContact?: ClientContactData;
  secondaryContact?: ClientSecondaryContact;
  scale?: ClientScaleData;
  services?: ClientServicesData;
  engagement?: ClientEngagementData;
  scope?: ClientScopeData;
  commercial?: ClientCommercialData;
  compliance?: ClientComplianceData;
  acquisition?: ClientAcquisitionData;
  declaration?: ClientDeclarationData;
};

export type HrcInternalData = {
  clientId?: string;
  dateProfileCreated?: string;
  clientClassification?: string;
  engagementRiskRating?: string;
  conflictCheckCompleted?: string;
  conflictCheckDate?: string;
  conflictCheckBy?: string;
  dueDiligenceStatus?: string;
  proposalRequired?: string;
  proposalReference?: string;
  assignedPrincipal?: string;
  approvedBy?: string;
  approvalDate?: string;
  internalNotes?: string;
};

// --- Helper: Calculate Completion % ---

function calculateCompletion(data: ClientProfileData): number {
  let total = 0;
  let filled = 0;

  // Organization (A) - 3 required
  total += 3;
  if (data.organization?.orgName) filled++;
  if (data.organization?.clientType && data.organization.clientType.length > 0) filled++;
  if (data.organization?.sector && data.organization.sector.length > 0) filled++;

  // Address (B) - 1 required
  total += 1;
  if (data.address?.digitalAddress) filled++;

  // Primary Contact (C) - 3 required
  total += 3;
  if (data.primaryContact?.fullName) filled++;
  if (data.primaryContact?.mobileNo) filled++;
  if (data.primaryContact?.email) filled++;

  // Scale (E) - 2 recommended
  total += 2;
  if (data.scale?.employeeCount) filled++;
  if (data.scale?.briefDescription) filled++;

  // Services (F) - 1 required
  total += 1;
  if (data.services?.specificNeed) filled++;

  // Scope (H) - 1 required
  total += 1;
  if (data.scope?.expectedScope) filled++;

  // Declaration (L) - 1 required
  total += 1;
  if (data.declaration?.authorisedRepresentative) filled++;

  return total === 0 ? 0 : Math.round((filled / total) * 100);
}

// --- Actions ---

export async function createClientProfile(
  userId: string
): Promise<ActionResult> {
  const session = await requireRole(["ADMIN"]);

  const existing = await prisma.clientProfile.findUnique({ where: { userId } });
  if (existing) return { ok: true, profileId: existing.id };

  const profile = await prisma.clientProfile.create({
    data: {
      userId,
      status: "DRAFT",
      profileData: {},
      hrcData: {},
      completionPct: 0,
    },
  });

  await logAudit({
    actorId: session.sub,
    actorName: session.name,
    action: "CLIENT_PROFILE_CREATED",
    entityType: "ClientProfile",
    entityId: profile.id,
    details: { userId },
  });

  return { ok: true, profileId: profile.id };
}

export async function updateClientProfileSection(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const session = await requireRole(["ADMIN", "CLIENT"]);

  const profileId = String(formData.get("profileId") ?? "");
  const section = String(formData.get("section") ?? "");
  const dataRaw = String(formData.get("data") ?? "{}");

  if (!profileId || !section) {
    return { ok: false, error: "Missing profile ID or section." };
  }

  const profile = await prisma.clientProfile.findUnique({
    where: { id: profileId },
    select: { id: true, userId: true, profileData: true, status: true },
  });

  if (!profile) return { ok: false, error: "Profile not found." };

  // Clients can only edit their own profile
  if (session.role === "CLIENT" && profile.userId !== session.sub) {
    return { ok: false, error: "You can only edit your own profile." };
  }

  // Clients cannot edit if profile is approved
  if (session.role === "CLIENT" && profile.status === "APPROVED") {
    return { ok: false, error: "Profile is already approved. Contact admin to make changes." };
  }

  let sectionData: Record<string, unknown>;
  try {
    sectionData = JSON.parse(dataRaw);
  } catch {
    return { ok: false, error: "Invalid data format." };
  }

  const currentData = (profile.profileData as ClientProfileData) ?? {};
  const updatedData = { ...currentData, [section]: sectionData };
  const completionPct = calculateCompletion(updatedData);

  await prisma.clientProfile.update({
    where: { id: profileId },
    data: {
      profileData: updatedData as never,
      completionPct,
    },
  });

  await logAudit({
    actorId: session.sub,
    actorName: session.name,
    action: "CLIENT_PROFILE_UPDATED",
    entityType: "ClientProfile",
    entityId: profileId,
    details: { section, completionPct },
  });

  revalidatePath("/admin/clients");
  revalidatePath(`/admin/clients/${profile.userId}/profile`);
  revalidatePath("/client/profile");
  return { ok: true };
}

export async function updateHrcSection(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const session = await requireRole(["ADMIN"]);

  const profileId = String(formData.get("profileId") ?? "");
  const dataRaw = String(formData.get("data") ?? "{}");

  if (!profileId) return { ok: false, error: "Missing profile ID." };

  let sectionData: Record<string, unknown>;
  try {
    sectionData = JSON.parse(dataRaw);
  } catch {
    return { ok: false, error: "Invalid data format." };
  }

  const profile = await prisma.clientProfile.findUnique({
    where: { id: profileId },
    select: { id: true, userId: true, hrcData: true },
  });

  if (!profile) return { ok: false, error: "Profile not found." };

  const currentData = (profile.hrcData as HrcInternalData) ?? {};
  const updatedData = { ...currentData, ...sectionData };

  await prisma.clientProfile.update({
    where: { id: profileId },
    data: { hrcData: updatedData as never },
  });

  await logAudit({
    actorId: session.sub,
    actorName: session.name,
    action: "HRC_SECTION_UPDATED",
    entityType: "ClientProfile",
    entityId: profileId,
    details: sectionData as Prisma.InputJsonValue,
  });

  revalidatePath("/admin/clients");
  revalidatePath(`/admin/clients/${profile.userId}/profile`);
  return { ok: true };
}

export async function submitProfileForReview(
  profileId: string
): Promise<ActionResult> {
  const session = await requireRole(["ADMIN", "CLIENT"]);

  const profile = await prisma.clientProfile.findUnique({
    where: { id: profileId },
    select: { id: true, userId: true, status: true },
  });

  if (!profile) return { ok: false, error: "Profile not found." };
  if (session.role === "CLIENT" && profile.userId !== session.sub) {
    return { ok: false, error: "You can only submit your own profile." };
  }
  if (profile.status !== "DRAFT" && profile.status !== "REJECTED") {
    return { ok: false, error: "Only draft or rejected profiles can be submitted for review." };
  }

  await prisma.clientProfile.update({
    where: { id: profileId },
    data: { status: "PENDING_REVIEW", rejectionReason: null },
  });

  await logAudit({
    actorId: session.sub,
    actorName: session.name,
    action: "CLIENT_PROFILE_SUBMITTED",
    entityType: "ClientProfile",
    entityId: profileId,
  });

  await notifyAdmins({
    actorId: session.sub,
    type: "CLIENT_PROFILE_SUBMITTED",
    message: `A client profile has been submitted for review.`,
  });

  revalidatePath("/admin/clients");
  revalidatePath(`/admin/clients/${profile.userId}/profile`);
  revalidatePath("/client/profile");
  return { ok: true };
}

export async function approveProfile(
  profileId: string
): Promise<ActionResult> {
  const session = await requireRole(["ADMIN"]);

  const profile = await prisma.clientProfile.findUnique({
    where: { id: profileId },
    select: { id: true, userId: true, status: true },
  });

  if (!profile) return { ok: false, error: "Profile not found." };
  if (profile.status !== "PENDING_REVIEW") {
    return { ok: false, error: "Only profiles pending review can be approved." };
  }

  await prisma.clientProfile.update({
    where: { id: profileId },
    data: {
      status: "APPROVED",
      reviewedById: session.sub,
      reviewedAt: new Date(),
      completedAt: new Date(),
    },
  });

  await logAudit({
    actorId: session.sub,
    actorName: session.name,
    action: "CLIENT_PROFILE_APPROVED",
    entityType: "ClientProfile",
    entityId: profileId,
  });

  await notify(profile.userId, {
    actorId: session.sub,
    type: "CLIENT_PROFILE_APPROVED",
    message: "Your client profile has been approved.",
  });

  revalidatePath("/admin/clients");
  revalidatePath(`/admin/clients/${profile.userId}/profile`);
  revalidatePath("/client/profile");
  revalidatePath("/staff");
  return { ok: true };
}

export async function rejectProfile(
  profileId: string,
  reason: string
): Promise<ActionResult> {
  const session = await requireRole(["ADMIN"]);

  const profile = await prisma.clientProfile.findUnique({
    where: { id: profileId },
    select: { id: true, userId: true, status: true },
  });

  if (!profile) return { ok: false, error: "Profile not found." };
  if (profile.status !== "PENDING_REVIEW") {
    return { ok: false, error: "Only profiles pending review can be rejected." };
  }

  await prisma.clientProfile.update({
    where: { id: profileId },
    data: {
      status: "REJECTED",
      rejectionReason: reason || null,
    },
  });

  await logAudit({
    actorId: session.sub,
    actorName: session.name,
    action: "CLIENT_PROFILE_REJECTED",
    entityType: "ClientProfile",
    entityId: profileId,
    details: { reason },
  });

  await notify(profile.userId, {
    actorId: session.sub,
    type: "CLIENT_PROFILE_REJECTED",
    message: reason
      ? `Your client profile needs updates: ${reason}`
      : "Your client profile needs updates.",
  });

  revalidatePath("/admin/clients");
  revalidatePath(`/admin/clients/${profile.userId}/profile`);
  revalidatePath("/client/profile");
  return { ok: true };
}

export async function getClientProfile(userId: string) {
  const session = await requireRole(["ADMIN", "CONSULTANT", "CLIENT"]);

  // Clients can only see their own profile
  if (session.role === "CLIENT" && userId !== session.sub) {
    return null;
  }

  const profile = await prisma.clientProfile.findUnique({
    where: { userId },
    include: {
      user: { select: { id: true, name: true, email: true } },
      reviewedBy: { select: { name: true } },
    },
  });

  if (!profile) return null;

  // Consultants can only see profiles of assigned clients
  if (session.role === "CONSULTANT") {
    const assignment = await prisma.clientAssignment.findUnique({
      where: {
        consultantId_clientId: {
          consultantId: session.sub,
          clientId: userId,
        },
      },
    });
    if (!assignment) return null;
  }

  return profile;
}
