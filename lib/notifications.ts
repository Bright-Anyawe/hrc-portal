import "server-only";
import { prisma } from "@/lib/prisma";
import type { NotificationItem } from "@/components/notification-bell";

export async function getNotifications(
  userId: string
): Promise<NotificationItem[]> {
  const rows = await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 15,
    select: {
      id: true,
      message: true,
      readAt: true,
      createdAt: true,
      projectId: true,
      type: true,
    },
  });

  return rows.map((n) => ({
    id: n.id,
    message: n.message,
    readAt: n.readAt?.toISOString() ?? null,
    createdAt: n.createdAt.toISOString(),
    projectId: n.projectId,
    type: n.type,
  }));
}
