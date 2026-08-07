"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";

export async function markAllNotificationsRead() {
  const session = await requireRole(["ADMIN", "CONSULTANT", "CLIENT"]);
  await prisma.notification.updateMany({
    where: { userId: session.sub, readAt: null },
    data: { readAt: new Date() },
  });
  revalidatePath("/", "layout");
}
