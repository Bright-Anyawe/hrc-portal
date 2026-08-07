"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { LogOut } from "lucide-react";
import { logout } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import {
  NotificationBell,
  type NotificationItem,
} from "@/components/notification-bell";
import { cn } from "@/lib/utils";

export type NavLink = { href: string; label: string };

export function PortalNav({
  name,
  role,
  links,
  notifications = [],
}: {
  name: string;
  role: string;
  links: NavLink[];
  notifications?: NotificationItem[];
}) {
  const pathname = usePathname();
  const unreadCount = notifications.filter((n) => !n.readAt).length;

  return (
    <header className="sticky top-0 z-40 border-b bg-background">
      <div className="flex h-14 items-center gap-2 px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2 font-bold">
          <Image
            src="/images/HRC-logo - Copy.png"
            alt="HRC Portal logo"
            width={32}
            height={32}
            className="h-8 w-8 object-contain"
          />
          <span className="hidden sm:inline">HRC Portal</span>
        </Link>

        <nav className="ml-4 flex items-center gap-1">
          {links.map((link) => {
            const active =
              pathname === link.href || pathname.startsWith(`${link.href}/`);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <NotificationBell
            notifications={notifications}
            unreadCount={unreadCount}
          />
          <div className="hidden text-right sm:block">
            <p className="text-sm font-medium leading-tight">{name}</p>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              {role}
            </p>
          </div>
          <form action={logout}>
            <Button variant="outline" size="sm">
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Sign out</span>
            </Button>
          </form>
        </div>
      </div>
    </header>
  );
}
