"use client";

import {
  LayoutDashboard,
  Package,
  Layers,
  Wrench,
  ClipboardList,
  ShoppingBag,
  CalendarCheck,
  Users,
  Settings,
  type LucideIcon,
} from "lucide-react";

import { useLanguage } from "@/components/providers/language-provider";

export interface AdminNavLink {
  href: string;
  label: string;
  icon: LucideIcon;
}

/**
 * The Admin shell's nav destinations — shared between `AdminSidebar`
 * (desktop) and `AdminMobileNav` (drawer) so the section list is defined
 * once, mirroring `components/account/use-dashboard-nav-links.ts`'s pattern.
 * Order matches the approved Admin information architecture (Dashboard →
 * catalog → service hierarchy → transactions → people → configuration).
 */
export function useAdminNavLinks(): AdminNavLink[] {
  const { t } = useLanguage();

  return [
    { href: "/admin", label: t.adminNav.dashboard, icon: LayoutDashboard },
    { href: "/admin/products", label: t.adminNav.products, icon: Package },
    { href: "/admin/service-categories", label: t.adminNav.serviceCategories, icon: Layers },
    { href: "/admin/subservices", label: t.adminNav.subservices, icon: Wrench },
    { href: "/admin/services", label: t.adminNav.services, icon: ClipboardList },
    { href: "/admin/orders", label: t.adminNav.orders, icon: ShoppingBag },
    { href: "/admin/bookings", label: t.adminNav.bookings, icon: CalendarCheck },
    { href: "/admin/customers", label: t.adminNav.customers, icon: Users },
    { href: "/admin/settings", label: t.adminNav.settings, icon: Settings },
  ];
}
