"use client";

import { LayoutDashboard, Package, User, type LucideIcon } from "lucide-react";

import { useLanguage } from "@/components/providers/language-provider";

export interface DashboardNavLink {
  href: string;
  label: string;
  icon: LucideIcon;
}

/**
 * The Dashboard shell's nav destinations — shared between `DashboardSidebar`
 * (desktop) and `DashboardMobileNav` (mobile tab strip) so the list of
 * routes/labels/icons is defined once. Logout is deliberately not included
 * here: it's a `<form>` action, not a navigable route, and each nav surface
 * renders it separately (see the Desktop/Mobile split in CLAUDE.md's
 * Dashboard phase — only the desktop sidebar lists it explicitly).
 */
export function useDashboardNavLinks(): DashboardNavLink[] {
  const { t } = useLanguage();

  return [
    { href: "/account", label: t.dashboardNav.overview, icon: LayoutDashboard },
    { href: "/account/orders", label: t.dashboardNav.ordersBookings, icon: Package },
    { href: "/account/profile", label: t.dashboardNav.profile, icon: User },
  ];
}
