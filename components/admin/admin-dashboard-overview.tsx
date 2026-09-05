"use client";

import Link from "next/link";
import {
  ArrowRight,
  Banknote,
  CalendarCheck,
  ClipboardList,
  Inbox,
  Package,
  ShoppingBag,
  Users,
  Wrench,
} from "lucide-react";

import type { AdminDashboardStats, AdminRecentOrder, AdminRecentBooking, DailyActivityPoint } from "@/lib/admin-data";
import { useLanguage } from "@/components/providers/language-provider";
import { StatusBadge } from "@/components/account/status-badge";
import { KpiCard } from "@/components/admin/kpi-card";
import { OrdersChart } from "@/components/admin/orders-chart";
import { EmptyState } from "@/components/shared/empty-state";
import { Reveal } from "@/components/shared/reveal";
import { H2, Small } from "@/components/ui/typography";

export interface AdminDashboardOverviewProps {
  stats: AdminDashboardStats;
  timeSeries: DailyActivityPoint[];
  recentOrders: AdminRecentOrder[];
  recentBookings: AdminRecentBooking[];
}

/**
 * `/admin` — the Dashboard Overview. All data is fetched server-side in
 * `app/admin/(dashboard)/page.tsx` (one `Promise.all` over `lib/admin-data.ts`)
 * and passed down as props; this stays a Client Component only for
 * `useLanguage()`, same reasoning as every other translated section in this
 * app (see `components/account/dashboard-overview.tsx`, its structural twin
 * on the customer side).
 */
export function AdminDashboardOverview({ stats, timeSeries, recentOrders, recentBookings }: AdminDashboardOverviewProps) {
  const { t, lang } = useLanguage();
  const locale = lang === "ar" ? "ar-SA" : "en-US";
  const dateFormatter = new Intl.DateTimeFormat(locale, { dateStyle: "medium" });

  return (
    <div className="flex flex-col gap-8 p-4 sm:p-6 lg:p-8">
      <div className="flex max-w-2xl flex-col gap-2">
        <Small className="font-semibold text-accent uppercase tracking-wide">{t.adminDashboard.eyebrow}</Small>
        <h1 className="font-display text-2xl font-semibold text-foreground sm:text-3xl">{t.adminDashboard.heading}</h1>
        <p className="text-sm text-muted-foreground">{t.adminDashboard.description}</p>
      </div>

      <Reveal>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <KpiCard
            icon={Banknote}
            label={t.adminDashboard.statRevenue}
            value={`${stats.totalRevenue.toLocaleString(locale)} ${stats.currency}`}
            href="/admin/orders"
            accessibleLabel={`${t.adminDashboard.statRevenue}: ${stats.totalRevenue.toLocaleString(locale)} ${stats.currency}`}
          />
          <KpiCard
            icon={ShoppingBag}
            label={t.adminDashboard.statOrders}
            value={stats.totalOrders}
            href="/admin/orders"
            accessibleLabel={`${t.adminDashboard.statOrders}: ${stats.totalOrders}`}
          />
          <KpiCard
            icon={Wrench}
            label={t.adminDashboard.statBookings}
            value={stats.totalBookings}
            href="/admin/bookings"
            accessibleLabel={`${t.adminDashboard.statBookings}: ${stats.totalBookings}`}
          />
          <KpiCard
            icon={Users}
            label={t.adminDashboard.statCustomers}
            value={stats.totalCustomers}
            href="/admin/customers"
            accessibleLabel={`${t.adminDashboard.statCustomers}: ${stats.totalCustomers}`}
          />
          <KpiCard
            icon={Package}
            label={t.adminDashboard.statProducts}
            value={stats.activeProducts}
            href="/admin/products"
            accessibleLabel={`${t.adminDashboard.statProducts}: ${stats.activeProducts}`}
          />
          <KpiCard
            icon={ClipboardList}
            label={t.adminDashboard.statPendingOrders}
            value={stats.pendingOrders}
            href="/admin/orders"
            accessibleLabel={`${t.adminDashboard.statPendingOrders}: ${stats.pendingOrders}`}
          />
          <KpiCard
            icon={CalendarCheck}
            label={t.adminDashboard.statPendingBookings}
            value={stats.pendingBookings}
            href="/admin/bookings"
            accessibleLabel={`${t.adminDashboard.statPendingBookings}: ${stats.pendingBookings}`}
          />
        </div>
      </Reveal>

      <Reveal delayMs={60} className="rounded-xl border border-border bg-card p-5">
        <div className="mb-4 flex flex-col gap-1">
          <H2 as="h2" className="text-base">
            {t.adminDashboard.chartHeading}
          </H2>
          <Small className="text-muted-foreground">{t.adminDashboard.chartDescription}</Small>
        </div>
        <OrdersChart data={timeSeries} />
      </Reveal>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <Reveal delayMs={100} className="flex flex-col gap-3 rounded-xl border border-border bg-card p-5">
          <div className="flex items-center justify-between gap-3">
            <H2 as="h2" className="text-base">
              {t.adminDashboard.recentOrdersHeading}
            </H2>
            <Link
              href="/admin/orders"
              className="flex items-center gap-1 rounded-sm text-sm font-medium text-muted-foreground transition-colors hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              {t.adminDashboard.viewAll}
              <ArrowRight className="size-3.5 rtl:rotate-180" aria-hidden="true" />
            </Link>
          </div>
          {recentOrders.length === 0 ? (
            <EmptyState icon={Inbox} title={t.adminDashboard.emptyOrdersTitle} description={t.adminDashboard.emptyOrdersDescription} />
          ) : (
            <ul className="flex flex-col divide-y divide-border">
              {recentOrders.map((order) => (
                <li key={order.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="flex min-w-0 flex-col gap-0.5">
                    <span className="truncate font-mono text-sm text-foreground">{order.orderNumber}</span>
                    <span className="truncate text-xs text-muted-foreground">{order.customerName}</span>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <span className="font-mono text-sm text-foreground">
                      {order.total.toLocaleString(locale)} {order.currency}
                    </span>
                    <StatusBadge status={order.status} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Reveal>

        <Reveal delayMs={140} className="flex flex-col gap-3 rounded-xl border border-border bg-card p-5">
          <div className="flex items-center justify-between gap-3">
            <H2 as="h2" className="text-base">
              {t.adminDashboard.recentBookingsHeading}
            </H2>
            <Link
              href="/admin/bookings"
              className="flex items-center gap-1 rounded-sm text-sm font-medium text-muted-foreground transition-colors hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              {t.adminDashboard.viewAll}
              <ArrowRight className="size-3.5 rtl:rotate-180" aria-hidden="true" />
            </Link>
          </div>
          {recentBookings.length === 0 ? (
            <EmptyState icon={Inbox} title={t.adminDashboard.emptyBookingsTitle} description={t.adminDashboard.emptyBookingsDescription} />
          ) : (
            <ul className="flex flex-col divide-y divide-border">
              {recentBookings.map((booking) => (
                <li key={booking.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="flex min-w-0 flex-col gap-0.5">
                    <span className="truncate font-mono text-sm text-foreground">{booking.bookingNumber}</span>
                    <span className="truncate text-xs text-muted-foreground">
                      {booking.customerName} · {lang === "ar" ? (booking.serviceNameAr ?? booking.serviceName) : booking.serviceName}
                    </span>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <span className="text-xs text-muted-foreground">{dateFormatter.format(booking.createdAt)}</span>
                    <StatusBadge status={booking.status} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Reveal>
      </div>

      <Reveal delayMs={180} className="flex flex-col gap-3 rounded-xl border border-border bg-card p-5">
        <H2 as="h2" className="text-base">
          {t.adminDashboard.quickActionsHeading}
        </H2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <QuickAction href="/admin/products" icon={Package} label={t.adminDashboard.quickActionProducts} />
          <QuickAction href="/admin/orders" icon={ShoppingBag} label={t.adminDashboard.quickActionOrders} />
          <QuickAction href="/admin/bookings" icon={CalendarCheck} label={t.adminDashboard.quickActionBookings} />
          <QuickAction href="/admin/customers" icon={Users} label={t.adminDashboard.quickActionCustomers} />
        </div>
      </Reveal>
    </div>
  );
}

function QuickAction({ href, icon: Icon, label }: { href: string; icon: typeof Package; label: string }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-2.5 rounded-lg border border-border px-4 py-3 text-sm font-medium text-foreground transition hover:border-primary/40 hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring motion-safe:active:scale-[0.98]"
    >
      <Icon className="size-4.5 shrink-0 text-primary" aria-hidden="true" />
      {label}
    </Link>
  );
}
