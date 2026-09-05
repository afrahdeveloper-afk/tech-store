import { Suspense } from "react";
import { redirect } from "next/navigation";

import { getCurrentAdmin, type CurrentAdmin } from "@/lib/auth/current-admin";
import { getAdminDashboardStats } from "@/lib/admin-data";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminHeader } from "@/components/admin/admin-header";

/**
 * Shell for every authenticated `/admin/*` route (everything except
 * `/admin/login`, which lives outside this route group so it isn't gated).
 * Composes the persistent desktop `AdminSidebar` (mobile gets its own
 * drawer, rendered from inside `AdminHeader`) + `AdminHeader` around
 * `{children}` — the full SaaS-style shell (Products, Orders, Bookings,
 * Customers, Services, Settings sections render inside this).
 *
 * `getCurrentAdmin()` is the actual authorization boundary for *rendering*
 * this shell — redirects to `/admin/login` if there's no valid admin
 * session. This does NOT substitute for per-mutation checks: every admin
 * Server Action must independently call `getCurrentAdmin()` again before
 * touching the database (see CLAUDE.md's Phase 12 Security rules) — a
 * Server Action is directly callable and must never assume the page that
 * rendered its trigger was itself gated. `getCurrentAdmin()` is wrapped in
 * React's `cache()`, so repeating the call within one request is free.
 *
 * The header's notification counts (`getAdminDashboardStats`) used to be
 * `await`ed directly in this layout, before returning any JSX — meaning
 * *every* `/admin/*` page waited on that fetch to finish before its own
 * content could even start rendering, on top of its own data fetch(es)
 * right after. That's the real cause of "admin pages feel slow": a
 * sequential DB-round-trip waterfall on every navigation, not query
 * complexity (the actual per-page datasets here are tiny). Badge counts
 * have no business blocking a page's own content, so that fetch now lives
 * in `AdminHeaderStats` below, wrapped in `<Suspense>` — `{children}`
 * (the page) starts rendering immediately, in parallel, rather than
 * waiting for the header's stats to resolve first. The fallback renders
 * the header with no badge counts (not a skeleton) — the header's layout
 * doesn't shift when the real counts arrive a moment later.
 */
export default async function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    redirect("/admin/login");
  }

  return (
    <div className="flex min-h-full flex-1">
      <AdminSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Suspense fallback={<AdminHeader admin={admin} pendingOrders={0} pendingBookings={0} />}>
          <AdminHeaderStats admin={admin} />
        </Suspense>
        <div className="flex-1">{children}</div>
      </div>
    </div>
  );
}

async function AdminHeaderStats({ admin }: { admin: CurrentAdmin }) {
  const stats = await getAdminDashboardStats();
  return <AdminHeader admin={admin} pendingOrders={stats.pendingOrders} pendingBookings={stats.pendingBookings} />;
}
