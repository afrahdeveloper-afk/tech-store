"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronsLeft, ChevronsRight, Gauge, LogOut } from "lucide-react";

import { useLanguage } from "@/components/providers/language-provider";
import { useAdminNavLinks } from "@/components/admin/use-admin-nav-links";
import { adminLogout } from "@/app/admin/actions";
import { cn } from "@/lib/utils";

const COLLAPSE_STORAGE_KEY = "speedcore-admin-sidebar-collapsed";

/** A nav item is "active" for its own route, or any route nested under it (e.g. a future `/admin/products/[id]`) — except `/admin` itself, which would otherwise match every route. */
function isLinkActive(pathname: string, href: string): boolean {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(`${href}/`);
}

// Module-level pub/sub, same shape as `language-provider.tsx`'s — the
// sanctioned way in this codebase to read a `localStorage`-backed value via
// `useSyncExternalStore` instead of an effect + `setState` on mount (which
// `react-hooks/set-state-in-effect` flags). `getServerSnapshot` returns
// `false` (expanded), matching the collapsed rail's harmless default.
let collapseListeners: Array<() => void> = [];

function subscribeCollapsed(callback: () => void) {
  collapseListeners.push(callback);
  return () => {
    collapseListeners = collapseListeners.filter((listener) => listener !== callback);
  };
}

function getCollapsedSnapshot(): boolean {
  return window.localStorage.getItem(COLLAPSE_STORAGE_KEY) === "1";
}

function getCollapsedServerSnapshot(): boolean {
  return false;
}

function writeCollapsed(next: boolean) {
  window.localStorage.setItem(COLLAPSE_STORAGE_KEY, next ? "1" : "0");
  collapseListeners.forEach((listener) => listener());
}

/**
 * Desktop (≥1024px) admin sidebar — persistent, collapsible to an icon rail.
 * Structurally mirrors `components/account/dashboard-sidebar.tsx` (real
 * `<Link>`s, `aria-current="page"`, Logout as a real form submit) with one
 * addition the Admin brief specifically asks for: a collapse toggle, whose
 * preference persists via the `useSyncExternalStore` pattern above.
 */
export function AdminSidebar() {
  const { t } = useLanguage();
  const pathname = usePathname();
  const links = useAdminNavLinks();
  const collapsed = React.useSyncExternalStore(subscribeCollapsed, getCollapsedSnapshot, getCollapsedServerSnapshot);

  const toggleCollapsed = () => {
    writeCollapsed(!collapsed);
  };

  const itemClassName =
    "flex min-h-11 items-center gap-2.5 rounded-md border-s-2 border-transparent px-3 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring motion-safe:active:scale-[0.98]";

  return (
    <nav
      aria-label={t.adminNav.ariaLabel}
      className={cn(
        "sticky top-0 hidden h-dvh shrink-0 flex-col gap-1 overflow-y-auto border-e border-border bg-card p-3 transition-[width] duration-200 ease-in-out-strong lg:flex",
        collapsed ? "w-[4.5rem]" : "w-64"
      )}
    >
      <Link
        href="/admin"
        className={cn(
          "mb-2 flex h-11 items-center gap-2 rounded-md px-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
          collapsed && "justify-center px-0"
        )}
      >
        <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
          <Gauge className="size-4.5" aria-hidden="true" />
        </span>
        {collapsed ? null : (
          <span className="truncate font-display text-base font-semibold tracking-tight text-foreground">
            Speed Core
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col gap-1">
        {links.map((link) => {
          const isActive = isLinkActive(pathname, link.href);
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              aria-current={isActive ? "page" : undefined}
              title={collapsed ? link.label : undefined}
              className={cn(itemClassName, isActive && "border-primary bg-muted text-foreground", collapsed && "justify-center px-0")}
            >
              <Icon className="size-4.5 shrink-0" aria-hidden="true" />
              {collapsed ? null : <span className="truncate">{link.label}</span>}
            </Link>
          );
        })}
      </div>

      <div className="my-1 border-t border-border" aria-hidden="true" />

      <form action={adminLogout}>
        <button
          type="submit"
          title={collapsed ? t.adminNav.logout : undefined}
          className={cn(itemClassName, "w-full text-start", collapsed && "justify-center px-0")}
        >
          <LogOut className="size-4.5 shrink-0" aria-hidden="true" />
          {collapsed ? null : t.adminNav.logout}
        </button>
      </form>

      <button
        type="button"
        onClick={toggleCollapsed}
        aria-label={collapsed ? t.adminNav.expandSidebar : t.adminNav.collapseSidebar}
        className={cn(itemClassName, "w-full justify-center")}
      >
        {collapsed ? (
          <ChevronsRight className="size-4.5 shrink-0 rtl:rotate-180" aria-hidden="true" />
        ) : (
          <ChevronsLeft className="size-4.5 shrink-0 rtl:rotate-180" aria-hidden="true" />
        )}
      </button>
    </nav>
  );
}
