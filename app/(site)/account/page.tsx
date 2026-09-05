import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { getCurrentCustomer } from "@/lib/auth/current-customer";
import { getCustomerDashboardStats, getRecentCustomerActivity } from "@/lib/account-data";
import { DashboardOverview } from "@/components/account/dashboard-overview";

export const metadata: Metadata = {
  title: "Dashboard — Speed Core",
  description: "Your Speed Core account activity at a glance.",
};

const RECENT_ACTIVITY_LIMIT = 5;

/**
 * `/account` — the Dashboard Overview (see CLAUDE.md's Dashboard phase).
 * `getCurrentCustomer()` gates access (redirect if not signed in — the
 * parent `app/account/layout.tsx` repeats this same guard for its own shell,
 * see the comment there for why). Stats and the recent-activity preview are
 * independent, indexed, `customerId`-scoped queries run in one `Promise.all`
 * (see `lib/account-data.ts`) — never the customer's full order/booking
 * history just to show a handful of numbers and 5 rows.
 */
export default async function AccountPage() {
  const customer = await getCurrentCustomer();
  if (!customer) {
    redirect("/login?next=/account");
  }

  const [stats, recentActivity] = await Promise.all([
    getCustomerDashboardStats(customer.id),
    getRecentCustomerActivity(customer.id, RECENT_ACTIVITY_LIMIT),
  ]);

  return <DashboardOverview stats={stats} recentActivity={recentActivity} />;
}
