"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  CheckCheck,
  CreditCard,
  FileText,
  FolderKanban,
  MessageSquare,
  Receipt,
  Users,
  type LucideIcon,
} from "lucide-react";
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

const TYPE_ICON: Record<string, LucideIcon> = {
  ASSIGNMENT: Users,
  PROJECT_CREATED: FolderKanban,
  PROJECT_STATUS: FolderKanban,
  DOCUMENT_UPLOADED: FileText,
  INVOICE_DRAFT: Receipt,
  INVOICE_PAYMENT: CreditCard,
  REQUEST: MessageSquare,
};

const TYPE_ICON_CLASS: Record<string, string> = {
  ASSIGNMENT: "bg-brand-sky/15 text-brand-sky",
  PROJECT_CREATED: "bg-brand-navy/10 text-brand-navy",
  PROJECT_STATUS: "bg-brand-gold/15 text-brand-gold",
  DOCUMENT_UPLOADED: "bg-brand-sky/15 text-brand-sky",
  INVOICE_DRAFT: "bg-brand-gold/15 text-brand-gold",
  INVOICE_PAYMENT: "bg-emerald-600/10 text-emerald-600",
  REQUEST: "bg-brand-red/10 text-brand-red",
};

function typeIcon(type?: string): LucideIcon {
  return TYPE_ICON[type ?? ""] ?? Bell;
}

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
        className="relative rounded-md p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground active:scale-95 motion-reduce:active:scale-100"
        aria-label="Notifications"
        aria-expanded={open}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span
            key={unreadCount}
            className="animate-pop-in absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-white"
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="animate-slide-down absolute right-0 z-50 mt-2 w-[min(20rem,calc(100vw-1.5rem))] origin-top-right overflow-hidden rounded-xl border bg-card shadow-lifted">
            <div className="flex items-center justify-between border-b px-3 py-2.5">
              <span className="text-sm font-semibold">Notifications</span>
              {unreadCount > 0 && (
                <button
                  type="button"
                  disabled={pending}
                  onClick={markAll}
                  className="flex items-center gap-1 text-xs font-medium text-primary transition-colors hover:underline disabled:opacity-50"
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
                notifications.map((n, i) => (
                  <li
                    key={n.id}
                    className="animate-fade-in-up"
                    style={{ animationDelay: `${i * 30}ms` }}
                  >
                    <button
                      type="button"
                      onClick={() => openNotification(n.id, n.projectId)}
                      className={cn(
                        "flex w-full items-start gap-3 px-3 py-2.5 text-left text-sm transition-colors hover:bg-muted",
                        !n.readAt && "bg-muted/60"
                      )}
                    >
                      <span
                        className={cn(
                          "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                          TYPE_ICON_CLASS[n.type ?? ""] ?? "bg-muted text-muted-foreground"
                        )}
                      >
                        {(() => {
                          const Icon = typeIcon(n.type);
                          return <Icon className="h-4 w-4" />;
                        })()}
                      </span>
                      <span className="min-w-0 flex-1">
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
                        </span>
                      </span>
                      {!n.readAt && (
                        <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />
                      )}
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
