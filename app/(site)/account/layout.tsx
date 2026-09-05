import { redirect } from "next/navigation";

import { getCurrentCustomer } from "@/lib/auth/current-customer";
import { DashboardSidebar } from "@/components/account/dashboard-sidebar";
import { DashboardMobileNav } from "@/components/account/dashboard-mobile-nav";

/**
 * Shared shell for every `/account/*` route (the Dashboard) — a persistent
 * sidebar on desktop (`DashboardSidebar`) or a horizontal tab strip on
 * mobile/tablet (`DashboardMobileNav`) around `{children}`. The global
 * `Navbar`/`Footer` from the root layout are untouched — this shell renders
 * inside `<main>`, it doesn't replace the site chrome.
 *
 * This layout independently calls `getCurrentCustomer()` and redirects if
 * signed out, even though every page under it (see `app/account/page.tsx`,
 * `app/account/profile/page.tsx`, `app/account/orders/page.tsx`, and both
 * `[id]` detail routes) already does the exact same guard on its own. That
 * duplication is deliberate, not an oversight — it matches the Customer
 * Account phase's existing reasoning for *not* sharing a layout across these
 * routes (each page must stay correct even reached directly by URL); this
 * layout adds shared visual chrome on top without weakening that guarantee.
 * `getCurrentCustomer()` is wrapped in React's `cache()` (see Phase 11), so
 * the repeated call costs nothing extra within the same request.
 */
export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const customer = await getCurrentCustomer();
  if (!customer) {
    redirect("/login?next=/account");
  }

  return (
    <>
      <DashboardMobileNav />
      <div className="lg:flex">
        <DashboardSidebar />
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </>
  );
}
