"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";

export async function markAllNotificationsRead() {
  const session = await requireRole(["ADMIN", "CONSULTANT", "CLIENT"]);
  const { count } = await prisma.notification.updateMany({
    where: { userId: session.sub, readAt: null },
    data: { readAt: new Date() },
  });
  revalidatePath("/", "layout");
  return { count };
}

export async function markNotificationRead(id: string) {
  const session = await requireRole(["ADMIN", "CONSULTANT", "CLIENT"]);
  await prisma.notification.updateMany({
    where: { id, userId: session.sub },
    data: { readAt: new Date() },
  });
  revalidatePath("/", "layout");
}
