import type { Metadata } from "next";

import { getAdminDashboardStats, getActivityTimeSeries, getRecentOrders, getRecentBookings } from "@/lib/admin-data";
import { AdminDashboardOverview } from "@/components/admin/admin-dashboard-overview";

export const metadata: Metadata = {
  title: "Dashboard",
};

const RECENT_LIMIT = 5;
const CHART_DAYS = 14;

/**
 * `/admin` — the Dashboard Overview. Authentication is already gated by the
 * parent `(dashboard)/layout.tsx`; this page just fetches its own data.
 * `getAdminDashboardStats` is `cache()`-wrapped (see `lib/admin-data.ts`), so
 * this call and the layout's own call to it dedupe into one query per
 * request rather than running twice. Every other query here is independent
 * and runs in one `Promise.all`.
 */
export default async function AdminDashboardPage() {
  const [stats, timeSeries, recentOrders, recentBookings] = await Promise.all([
    getAdminDashboardStats(),
    getActivityTimeSeries(CHART_DAYS),
    getRecentOrders(RECENT_LIMIT),
    getRecentBookings(RECENT_LIMIT),
  ]);

  return (
    <AdminDashboardOverview stats={stats} timeSeries={timeSeries} recentOrders={recentOrders} recentBookings={recentBookings} />
  );
}
