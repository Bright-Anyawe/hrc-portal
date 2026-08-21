"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import {
  Briefcase,
  ChevronDown,
  ChevronsLeft,
  ChevronsRight,
  CircleDot,
  FolderKanban,
  LayoutDashboard,
  LogOut,
  Menu,
  Receipt,
  ScrollText,
  Settings,
  ShieldCheck,
  Users,
  X,
  type LucideIcon,
} from "lucide-react";
import { logout } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import {
  NotificationBell,
  type NotificationItem,
} from "@/components/notification-bell";
import { cn } from "@/lib/utils";

export type NavLink = { href: string; label: string };

type Role = "ADMIN" | "CONSULTANT" | "CLIENT";

const NAV_ICONS: Record<string, LucideIcon> = {
  "/admin": LayoutDashboard,
  "/admin/clients": Users,
  "/admin/consultants": Briefcase,
  "/admin/projects": FolderKanban,
  "/admin/invoices": Receipt,
  "/admin/audit": ScrollText,
  "/client": LayoutDashboard,
  "/client/invoices": Receipt,
  "/staff": FolderKanban,
  "/settings": Settings,
};

const ROLE_ACCENT: Record<Role, string> = {
  ADMIN: "from-brand-red to-brand-red",
  CONSULTANT: "from-brand-sky to-brand-navy",
  CLIENT: "from-brand-gold to-brand-navy",
};

const ROLE_INITIALS_BG: Record<Role, string> = {
  ADMIN: "bg-brand-red/10 text-brand-red",
  CONSULTANT: "bg-brand-sky/15 text-brand-sky",
  CLIENT: "bg-brand-gold/15 text-brand-gold",
};

function getNavIcon(href: string): LucideIcon {
  return NAV_ICONS[href] ?? CircleDot;
}

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

export function PortalShell({
  name,
  role,
  userRole,
  notifications = [],
  links,
  children,
}: {
  name: string;
  role: string;
  userRole: Role;
  notifications?: NotificationItem[];
  links: NavLink[];
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const unreadCount = notifications.filter((n) => !n.readAt).length;

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  const NavList = ({ onNavigate }: { onNavigate?: () => void }) => (
    <nav className="flex flex-1 flex-col gap-1 px-3 py-3">
      {links.map((link, i) => {
        const Icon = getNavIcon(link.href);
        const active = isActive(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            onClick={onNavigate}
            title={collapsed ? link.label : undefined}
            aria-current={active ? "page" : undefined}
            style={{ animationDelay: `${i * 28}ms` }}
            className={cn(
              "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] animate-fade-in-up",
              active
                ? "bg-brand-sky/10 text-brand-navy shadow-sm"
                : "text-muted-foreground hover:translate-x-1 hover:bg-muted hover:text-brand-navy hover:shadow-sm",
              collapsed && "justify-center px-2"
            )}
          >
            {active && (
              <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-brand-red animate-[nav-indicator_0.32s_cubic-bezier(0.22,1,0.36,1)_both]" />
            )}
            <Icon
              className={cn(
                "h-[18px] w-[18px] shrink-0 transition-all duration-200 ease-out group-hover:scale-110 group-active:scale-95",
                active
                  ? "text-brand-sky"
                  : "text-muted-foreground group-hover:text-brand-navy"
              )}
            />
            {!collapsed && <span className="transition-transform duration-200 group-hover:translate-x-px">{link.label}</span>}
            {!collapsed && active && (
              <span className="ml-auto h-1.5 w-1.5 rounded-full bg-brand-red animate-pulse-soft" />
            )}
          </Link>
        );
      })}
    </nav>
  );

  const UserCard = ({ compact = false }: { compact?: boolean }) => (
    <div className="border-t p-3">
      <div
        className={cn(
          "flex items-center gap-3 rounded-lg px-2 py-2",
          compact && "justify-center px-0"
        )}
      >
        <div
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold ring-2 ring-border/50",
            ROLE_INITIALS_BG[userRole]
          )}
        >
          {getInitials(name)}
        </div>
        {!compact && (
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{name}</p>
            <p className="truncate text-xs uppercase tracking-wide text-muted-foreground">
              {role}
            </p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-muted/30">
      <div
        className={cn(
          "hidden h-px bg-gradient-to-r md:block",
          ROLE_ACCENT[userRole]
        )}
      />

      <div className="flex min-h-[calc(100vh-1px)]">
        {/* Desktop sidebar */}
        <aside
          className={cn(
            "sticky top-0 hidden h-screen shrink-0 flex-col border-r bg-white shadow-sm transition-[width,box-shadow] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none md:flex",
            collapsed ? "w-[68px]" : "w-64"
          )}
        >
          <div
            className={cn(
              "flex h-16 items-center gap-2 border-b px-4",
              collapsed && "justify-center px-2"
            )}
          >
            <Image
              src="/images/HRC-logo - Copy.png"
              alt="HRC Portal logo"
              width={34}
              height={34}
              className="h-8 w-8 shrink-0 object-contain"
            />
            {!collapsed && (
              <div className="min-w-0">
                <p className="truncate text-sm font-bold leading-tight text-brand-navy">
                  HRC Portal
                </p>
                <p className="truncate text-[11px] text-muted-foreground">
                  Hedge Resource Centre
                </p>
              </div>
            )}
          </div>

          <div className="flex flex-1 flex-col overflow-y-auto">
            <NavList />
          </div>

          <UserCard compact={collapsed} />

          <button
            type="button"
            onClick={() => setCollapsed((c) => !c)}
            className="flex h-9 items-center justify-center gap-2 border-t text-xs font-medium text-muted-foreground transition-all duration-200 ease-out hover:bg-muted hover:text-brand-navy active:bg-muted/70"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <ChevronsRight className="h-4 w-4" />
            ) : (
              <>
                <ChevronsLeft className="h-4 w-4" />
                <span>Collapse</span>
              </>
            )}
          </button>
        </aside>

        {/* Mobile drawer */}
        {mobileOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            <div
              className="animate-fade-in absolute inset-0 bg-slate-950/50 backdrop-blur-sm"
              onClick={() => setMobileOpen(false)}
            />
            <aside className="animate-slide-in-left absolute inset-y-0 left-0 flex w-72 flex-col border-r bg-white shadow-2xl">
              <div
                className={cn(
                  "flex h-16 items-center justify-between border-b px-4",
                  "bg-gradient-to-r",
                  ROLE_ACCENT[userRole]
                )}
              >
                <div className="flex items-center gap-2 text-white">
                  <Image
                    src="/images/HRC-logo - Copy.png"
                    alt="HRC Portal logo"
                    width={34}
                    height={34}
                    className="h-8 w-8 rounded-md bg-white object-contain p-0.5"
                  />
                  <div>
                    <p className="text-sm font-bold leading-tight">HRC Portal</p>
                    <p className="text-[11px] text-white/75">
                      Hedge Resource Centre
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/10 hover:text-white"
                  onClick={() => setMobileOpen(false)}
                  aria-label="Close menu"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <NavList onNavigate={() => setMobileOpen(false)} />
              <UserCard />
            </aside>
          </div>
        )}

        {/* Main column */}
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 border-b bg-white/80 backdrop-blur-xl supports-[backdrop-filter]:bg-white/70 transition-[background-color,backdrop-filter,box-shadow] duration-300 ease-out">
            <div className="flex h-16 items-center gap-2 px-4 md:px-6">
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setMobileOpen(true)}
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" />
              </Button>

              <div className="hidden items-center gap-2 md:flex">
                <ShieldCheck className="h-4 w-4 text-brand-sky" />
                <span className="text-sm font-medium text-muted-foreground">
                  {role} Portal
                </span>
              </div>

              <div className="ml-auto flex items-center gap-2">
                <NotificationBell
                  notifications={notifications}
                  unreadCount={unreadCount}
                  role={userRole}
                />
                <div className="relative" ref={menuRef}>
                  <button
                    type="button"
                    onClick={() => setMenuOpen((o) => !o)}
                    className="flex items-center gap-2 rounded-full p-1 pr-2 transition-colors hover:bg-muted"
                    aria-expanded={menuOpen}
                    aria-haspopup="menu"
                  >
                    <div
                      className={cn(
                        "flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold ring-2 ring-border/50",
                        ROLE_INITIALS_BG[userRole]
                      )}
                    >
                      {getInitials(name)}
                    </div>
                    <div className="hidden text-left sm:block">
                      <p className="text-sm font-medium leading-tight">{name}</p>
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">
                        {role}
                      </p>
                    </div>
                    <ChevronDown
                      className={cn(
                        "hidden h-4 w-4 text-muted-foreground transition-transform duration-150 sm:block",
                        menuOpen && "rotate-180"
                      )}
                    />
                  </button>

                  {menuOpen && (
                    <div
                      role="menu"
                      className="animate-slide-down absolute right-0 top-full mt-2 w-56 overflow-hidden rounded-xl border bg-white shadow-lifted"
                    >
                      <div className="border-b px-4 py-3">
                        <p className="truncate text-sm font-semibold">{name}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          {role}
                        </p>
                      </div>
                      <Link
                        href="/settings"
                        role="menuitem"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                      >
                        <Settings className="h-4 w-4" />
                        Settings
                      </Link>
                      <form action={logout} className="border-t">
                        <button
                          type="submit"
                          role="menuitem"
                          className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-destructive transition-colors hover:bg-destructive/5"
                        >
                          <LogOut className="h-4 w-4" />
                          Sign out
                        </button>
                      </form>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </header>

          <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 md:px-6 md:py-8">
            <div key={pathname} className="animate-fade-in-blur">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}