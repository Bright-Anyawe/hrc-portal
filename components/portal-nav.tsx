"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { LogOut, Menu, X } from "lucide-react";
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
  userRole,
}: {
  name: string;
  role: string;
  links: NavLink[];
  notifications?: NotificationItem[];
  userRole?: "ADMIN" | "CONSULTANT" | "CLIENT";
}) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const unreadCount = notifications.filter((n) => !n.readAt).length;
  const resolvedRole =
    userRole ??
    (role === "Administrator"
      ? "ADMIN"
      : role === "Consultant"
        ? "CONSULTANT"
        : "CLIENT");

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header className="sticky top-0 z-40 border-b bg-white/95 backdrop-blur">
      <div className="flex h-14 items-center gap-2 px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2 font-bold text-brand-navy">
          <Image
            src="/images/HRC-logo - Copy.png"
            alt="HRC Portal logo"
            width={32}
            height={32}
            className="h-8 w-8 object-contain"
          />
          <span className="hidden sm:inline">HRC Portal</span>
        </Link>

        <nav className="ml-4 hidden items-center gap-1 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                isActive(link.href)
                  ? "bg-brand-sky/10 text-brand-navy"
                  : "text-muted-foreground hover:bg-muted hover:text-brand-navy"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <NotificationBell
            notifications={notifications}
            unreadCount={unreadCount}
            role={resolvedRole}
          />
          <div className="hidden text-right sm:block">
            <p className="text-sm font-medium leading-tight">{name}</p>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              {role}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
          <form action={logout} className="hidden sm:block">
            <Button variant="outline" size="sm">
              <LogOut className="h-4 w-4" />
              <span className="hidden lg:inline">Sign out</span>
            </Button>
          </form>
        </div>
      </div>

      {menuOpen && (
        <div className="border-t bg-white md:hidden">
          <nav className="flex flex-col gap-1 px-4 py-3">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className={cn(
                  "rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive(link.href)
                    ? "bg-brand-sky/10 text-brand-navy"
                    : "text-muted-foreground hover:bg-muted hover:text-brand-navy"
                )}
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-2 flex items-center justify-between border-t pt-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{name}</p>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  {role}
                </p>
              </div>
              <form action={logout}>
                <Button variant="outline" size="sm">
                  <LogOut className="h-4 w-4" />
                  Sign out
                </Button>
              </form>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
