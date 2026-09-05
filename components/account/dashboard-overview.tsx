"use client";

import Link from "next/link";
import { Activity, ArrowRight, CalendarClock, Inbox, Package, Wrench } from "lucide-react";

import type { ActivityItem, DashboardStats } from "@/lib/account-data";
import { useLanguage } from "@/components/providers/language-provider";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/shared/reveal";
import { EmptyState } from "@/components/shared/empty-state";
import { StatCard } from "@/components/account/stat-card";
import { OrderCard } from "@/components/account/order-card";
import { BookingCard } from "@/components/account/booking-card";
import { Caption, Display, Body, H2 } from "@/components/ui/typography";

/**
 * `/account` — the Dashboard Overview. `stats`/`recentActivity` are fetched
 * server-side in one `Promise.all` (see `app/account/page.tsx` and
 * `lib/account-data.ts`'s `getCustomerDashboardStats`/
 * `getRecentCustomerActivity`) — no client-side fetching here. Stays a
 * Client Component only for translated copy (`useLanguage()`), same
 * reasoning as every other account component.
 *
 * Stat cards stay visible with zero values (a brand-new customer sees
 * "0 / 0 / 0 / No upcoming appointment", not a missing section) — only the
 * Recent Activity block below switches to an `EmptyState`.
 */
export function DashboardOverview({
  stats,
  recentActivity,
}: {
  stats: DashboardStats;
  recentActivity: ActivityItem[];
}) {
  const { t, lang } = useLanguage();
  const locale = lang === "ar" ? "ar-SA" : "en-US";
  const hasAnyActivity = stats.totalOrders > 0 || stats.totalBookings > 0;

  const nextAppointmentValue = stats.nextAppointment
    ? new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(stats.nextAppointment.preferredDate)
    : t.dashboard.noUpcomingAppointment;
  const nextAppointmentServiceName = stats.nextAppointment
    ? lang === "ar"
      ? (stats.nextAppointment.serviceNameAr ?? stats.nextAppointment.serviceName)
      : stats.nextAppointment.serviceName
    : null;

  return (
    <Container className="flex flex-col gap-8 py-10 sm:py-12 lg:py-14">
      <div className="flex max-w-2xl flex-col gap-3">
        <Caption className="text-accent">{t.dashboard.pageEyebrow}</Caption>
        <Display as="h1" className="text-3xl sm:text-4xl">
          {t.dashboard.pageHeading}
        </Display>
        <Body className="text-muted-foreground">{t.dashboard.pageDescription}</Body>
      </div>

      <Reveal>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={Package}
            label={t.dashboard.statTotalOrders}
            value={stats.totalOrders}
            href="/account/orders"
            accessibleLabel={`${t.dashboard.statTotalOrders}: ${stats.totalOrders}`}
          />
          <StatCard
            icon={Wrench}
            label={t.dashboard.statTotalBookings}
            value={stats.totalBookings}
            href="/account/orders"
            accessibleLabel={`${t.dashboard.statTotalBookings}: ${stats.totalBookings}`}
          />
          <StatCard
            icon={Activity}
            label={t.dashboard.statActive}
            value={stats.activeCount}
            href="/account/orders"
            accessibleLabel={`${t.dashboard.statActive}: ${stats.activeCount}`}
          />
          <StatCard
            icon={CalendarClock}
            label={t.dashboard.statNextAppointment}
            value={nextAppointmentValue}
            href={stats.nextAppointment ? `/account/bookings/${stats.nextAppointment.id}` : undefined}
            accessibleLabel={
              stats.nextAppointment
                ? `${t.dashboard.statNextAppointment}: ${nextAppointmentServiceName} — ${nextAppointmentValue}`
                : `${t.dashboard.statNextAppointment}: ${t.dashboard.noUpcomingAppointment}`
            }
          />
        </div>
      </Reveal>

      <Reveal delayMs={80} className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <H2 as="h2" className="text-lg">
            {t.dashboard.recentActivityHeading}
          </H2>
          {hasAnyActivity ? (
            <Link
              href="/account/orders"
              className="flex items-center gap-1 rounded-sm text-sm font-medium text-muted-foreground transition-colors hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              {t.dashboard.viewAllCta}
              <ArrowRight className="size-3.5 rtl:rotate-180" aria-hidden="true" />
            </Link>
          ) : null}
        </div>

        {recentActivity.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {recentActivity.map((item) =>
              item.kind === "order" ? (
                <OrderCard key={item.id} order={item} />
              ) : (
                <BookingCard key={item.id} booking={item} />
              )
            )}
          </div>
        ) : (
          <EmptyState
            icon={Inbox}
            title={t.accountActivity.emptyAllTitle}
            description={t.accountActivity.emptyAllDescription}
            action={{ label: t.cart.browseProducts, href: "/products" }}
          />
        )}
      </Reveal>
    </Container>
  );
}
