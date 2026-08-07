import "server-only";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";

export async function logAudit(input: {
  actorId: string;
  actorName: string;
  action: string;
  entityType: string;
  entityId: string;
  details?: Prisma.InputJsonValue;
}) {
  await prisma.auditLog.create({
    data: {
      actorId: input.actorId,
      actorName: input.actorName,
      action: input.action,
      entityType: input.entityType,
      entityId: input.entityId,
      details: input.details,
    },
  });
}
