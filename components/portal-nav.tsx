"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const unreadCount = notifications.filter((n) => !n.readAt).length;

  // Auto-close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-40 border-b bg-background">
      <div className="flex h-14 items-center justify-between gap-2 px-4 md:px-6">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2 font-bold shrink-0">
            <Image
              src="/images/HRC-logo - Copy.png"
              alt="HRC Portal logo"
              width={32}
              height={32}
              className="h-8 w-8 object-contain"
            />
            <span className="inline">HRC Portal</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="ml-2 hidden md:flex items-center gap-1">
            {links.map((link) => {
              const active =
                pathname === link.href || pathname.startsWith(`${link.href}/`);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "rounded-md px-3 py-1.5 text-sm font-medium transition-colors whitespace-nowrap",
                    active
                      ? "bg-muted text-foreground font-semibold"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-2">
          <NotificationBell
            notifications={notifications}
            unreadCount={unreadCount}
            role={userRole ?? (role === "Administrator" ? "ADMIN" : role === "Consultant" ? "CONSULTANT" : "CLIENT")}
          />

          {/* User info on desktop */}
          <div className="hidden text-right md:block">
            <p className="text-sm font-medium leading-tight">{name}</p>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              {role}
            </p>
          </div>

          {/* Desktop Sign out */}
          <form action={logout} className="hidden md:block">
            <Button variant="outline" size="sm" type="submit">
              <LogOut className="h-4 w-4" />
              <span>Sign out</span>
            </Button>
          </form>

          {/* Mobile direct signout icon */}
          <form action={logout} className="flex md:hidden">
            <Button
              variant="outline"
              size="sm"
              type="submit"
              aria-label="Sign out"
              title="Sign out"
              className="h-9 w-9 p-0"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </form>

          {/* Mobile menu toggle */}
          <Button
            variant="ghost"
            size="sm"
            type="button"
            className="h-9 w-9 p-0 md:hidden"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu Dropdown & Drawer */}
      {mobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 top-14 z-40 bg-black/50 md:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="fixed inset-x-0 top-14 z-50 border-b bg-background p-4 shadow-lg md:hidden">
            {/* User Profile info */}
            <div className="mb-3 rounded-md bg-muted/60 p-3">
              <p className="text-sm font-semibold leading-tight">{name}</p>
              <p className="text-xs uppercase tracking-wide text-muted-foreground mt-0.5">
                {role}
              </p>
            </div>

            {/* Mobile Nav Links */}
            <nav className="flex flex-col gap-1">
              {links.map((link) => {
                const active =
                  pathname === link.href || pathname.startsWith(`${link.href}/`);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                      active
                        ? "bg-muted text-foreground font-semibold"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            {/* Mobile Menu Sign out button */}
            <div className="mt-4 pt-3 border-t">
              <form action={logout}>
                <Button
                  variant="outline"
                  size="default"
                  type="submit"
                  className="w-full justify-center gap-2 text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/20"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sign out</span>
                </Button>
              </form>
            </div>
          </div>
        </>
      )}
    </header>
  );
}
