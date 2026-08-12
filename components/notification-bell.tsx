"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Bell, CheckCheck } from "lucide-react";
import {
  markAllNotificationsRead,
  markNotificationRead,
} from "@/app/actions/notifications";
import { cn } from "@/lib/utils";

export type NotificationItem = {
  id: string;
  message: string;
  readAt: string | null;
  createdAt: string;
  projectId?: string | null;
  type?: string;
};

export function NotificationBell({
  notifications,
  unreadCount,
  role,
}: {
  notifications: NotificationItem[];
  unreadCount: number;
  role: "ADMIN" | "CONSULTANT" | "CLIENT";
}) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const markAll = () => {
    startTransition(async () => {
      await markAllNotificationsRead();
      router.refresh();
    });
  };

  const openNotification = (id: string, projectId?: string | null) => {
    startTransition(async () => {
      await markNotificationRead(id);
      router.refresh();
      setOpen(false);
      if (projectId) {
        const target =
          role === "CONSULTANT"
            ? `/staff/projects/${projectId}`
            : role === "ADMIN"
              ? `/admin/projects`
              : `/client`;
        router.push(target);
      }
    });
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="relative rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-50 mt-2 w-80 rounded-lg border bg-card shadow-lg">
            <div className="flex items-center justify-between border-b px-3 py-2">
              <span className="text-sm font-medium">Notifications</span>
              {unreadCount > 0 && (
                <button
                  type="button"
                  disabled={pending}
                  onClick={markAll}
                  className="flex items-center gap-1 text-xs font-medium text-primary hover:underline disabled:opacity-50"
                >
                  <CheckCheck className="h-3.5 w-3.5" />
                  Mark all read
                </button>
              )}
            </div>
            <ul className="max-h-80 overflow-y-auto py-1">
              {notifications.length === 0 ? (
                <li className="px-3 py-8 text-center text-sm text-muted-foreground">
                  No notifications yet.
                </li>
              ) : (
                notifications.map((n) => (
                  <li key={n.id}>
                    <button
                      type="button"
                      onClick={() => openNotification(n.id, n.projectId)}
                      className={cn(
                        "flex w-full flex-col px-3 py-2 text-left text-sm transition-colors hover:bg-muted",
                        !n.readAt && "bg-muted/60"
                      )}
                    >
                      <span
                        className={cn(
                          "line-clamp-2",
                          !n.readAt && "font-medium"
                        )}
                      >
                        {n.message}
                      </span>
                      <span className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                        {new Date(n.createdAt).toLocaleString()}
                        {n.projectId && " · Open"}
                        {!n.readAt && (
                          <span className="ml-auto h-2 w-2 shrink-0 rounded-full bg-primary" />
                        )}
                      </span>
                    </button>
                  </li>
                ))
              )}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}
