import "server-only";
import { prisma } from "@/lib/prisma";

type NotifyInput = {
  actorId?: string;
  projectId?: string;
  type: string;
  message: string;
};

export async function notify(userId: string, data: NotifyInput) {
  await prisma.notification.create({ data: { userId, ...data } });
}

export async function notifyMany(userIds: string[], data: NotifyInput) {
  if (userIds.length === 0) return;
  await prisma.notification.createMany({
    data: userIds.map((userId) => ({ userId, ...data })),
  });
}

export async function notifyAdmins(data: NotifyInput) {
  const admins = await prisma.user.findMany({
    where: { role: "ADMIN" },
    select: { id: true },
  });
  await notifyMany(admins.map((a) => a.id), data);
}
