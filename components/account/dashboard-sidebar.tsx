"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut } from "lucide-react";

import { useLanguage } from "@/components/providers/language-provider";
import { useDashboardNavLinks } from "@/components/account/use-dashboard-nav-links";
import { logout } from "@/app/(site)/account/actions";
import { cn } from "@/lib/utils";

/**
 * Desktop (≥1024px) dashboard sidebar — persistent, real `<Link>`s per
 * destination with `aria-current="page"` on the active one, plus Logout as a
 * real `<button type="submit">` inside the existing `logout` Server Action's
 * `<form>` (same direct-import pattern the old `account-overview.tsx` used —
 * a Client Component can call a `"use server"` action directly). Hidden below
 * 1024px in favor of `DashboardMobileNav`'s horizontal tab strip — no
 * off-canvas drawer (see the Dashboard phase's Navigation rules).
 */
export function DashboardSidebar() {
  const { t } = useLanguage();
  const pathname = usePathname();
  const links = useDashboardNavLinks();

  const itemClassName =
    "flex min-h-11 items-center gap-2.5 rounded-md border-s-2 border-transparent px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";

  return (
    <nav
      aria-label={t.dashboardNav.ariaLabel}
      className="hidden shrink-0 flex-col gap-1 border-e border-border p-4 lg:flex lg:w-60"
    >
      {links.map((link) => {
        const isActive = pathname === link.href;
        const Icon = link.icon;
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={isActive ? "page" : undefined}
            className={cn(itemClassName, isActive && "border-primary bg-muted text-foreground")}
          >
            <Icon className="size-4.5 shrink-0" aria-hidden="true" />
            {link.label}
          </Link>
        );
      })}

      <div className="my-2 border-t border-border" aria-hidden="true" />

      <form action={logout}>
        <button type="submit" className={cn(itemClassName, "w-full text-start")}>
          <LogOut className="size-4.5 shrink-0" aria-hidden="true" />
          {t.dashboardNav.logout}
        </button>
      </form>
    </nav>
  );
}
