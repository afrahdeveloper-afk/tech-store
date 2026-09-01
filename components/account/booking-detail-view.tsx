"use client";

import type { BookingDetail } from "@/lib/account-data";
import { useLanguage } from "@/components/providers/language-provider";
import { Container } from "@/components/ui/container";
import { Breadcrumb } from "@/components/shared/breadcrumb";
import { StatusBadge } from "@/components/account/status-badge";
import { StatusTimeline } from "@/components/account/status-timeline";
import { Caption, Display, H2, Small, Label } from "@/components/ui/typography";

const TERMINAL_STATUSES = new Set(["COMPLETED", "CANCELLED"]);

/** `/account/bookings/[id]` — Step 10's booking details page. */
export function BookingDetailView({ booking }: { booking: BookingDetail }) {
  const { t, lang } = useLanguage();
  const locale = lang === "ar" ? "ar-SA" : "en-US";
  const createdDate = new Intl.DateTimeFormat(locale, { dateStyle: "long" }).format(booking.createdAt);
  const formattedUpdatedDate = new Intl.DateTimeFormat(locale, { dateStyle: "long" }).format(booking.updatedAt);
  const showLastUpdated = TERMINAL_STATUSES.has(booking.status);

  const serviceName = lang === "ar" ? booking.serviceNameAr ?? booking.serviceName : booking.serviceName;
  const categoryName = lang === "ar" ? booking.categoryNameAr ?? booking.categoryName : booking.categoryName;
  const subserviceName = lang === "ar" ? booking.subserviceNameAr ?? booking.subserviceName : booking.subserviceName;
  const scheduledDate = booking.preferredDate
    ? new Intl.DateTimeFormat(locale, { dateStyle: "long" }).format(booking.preferredDate)
    : null;

  return (
    <Container className="flex flex-col gap-8 py-10 sm:py-12 lg:py-14">
      <div className="flex flex-col gap-4">
        <Breadcrumb
          items={[
            { label: t.productDetails.breadcrumbHome, href: "/" },
            { label: t.accountBookingDetails.breadcrumbAccount, href: "/account" },
            { label: t.accountBookingDetails.breadcrumbBookings, href: "/account/orders" },
            { label: booking.number },
          ]}
        />
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex flex-col gap-2">
            <Caption className="text-accent">{t.accountBookingDetails.heading}</Caption>
            <Display as="h1" className="text-2xl sm:text-3xl" dir="ltr">
              {booking.number}
            </Display>
            <Small className="text-muted-foreground">{createdDate}</Small>
          </div>
          <StatusBadge status={booking.status} />
        </div>
      </div>

      <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-6">
        <StatusTimeline kind="booking" status={booking.status} />
        {showLastUpdated ? (
          <Small className="text-muted-foreground">
            {t.statusTimeline.lastUpdatedLabel}: {formattedUpdatedDate}
          </Small>
        ) : null}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:items-start">
        <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-6 lg:col-span-2">
          <H2 as="h2" className="text-lg">
            {serviceName}
          </H2>
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1">
              <dt>
                <Label>{t.booking.categoryLabel}</Label>
              </dt>
              <dd className="text-sm text-foreground">{categoryName ?? "—"}</dd>
            </div>
            <div className="flex flex-col gap-1">
              <dt>
                <Label>{t.booking.subserviceLabel}</Label>
              </dt>
              <dd className="text-sm text-foreground">{subserviceName ?? "—"}</dd>
            </div>
            <div className="flex flex-col gap-1">
              <dt>
                <Label>{t.accountBookingDetails.scheduledDateLabel}</Label>
              </dt>
              <dd className="text-sm text-foreground">{scheduledDate ?? "—"}</dd>
            </div>
            <div className="flex flex-col gap-1">
              <dt>
                <Label>{t.accountBookingDetails.scheduledTimeLabel}</Label>
              </dt>
              <dd className="text-sm text-foreground" dir="ltr">
                {booking.preferredTime ?? "—"}
              </dd>
            </div>
            {booking.durationMinutes != null ? (
              <div className="flex flex-col gap-1">
                <dt>
                  <Label>{t.booking.durationLabel}</Label>
                </dt>
                <dd className="text-sm text-foreground">
                  {booking.durationMinutes} {t.booking.minutesLabel}
                </dd>
              </div>
            ) : null}
          </dl>
          {booking.notes ? (
            <div className="flex flex-col gap-1 border-t border-border pt-4">
              <Label>{t.accountBookingDetails.notesLabel}</Label>
              <p className="text-sm text-muted-foreground">{booking.notes}</p>
            </div>
          ) : null}
        </div>

        <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-6">
          {booking.price != null ? (
            <div className="flex items-center justify-between border-b border-border pb-4">
              <Small className="font-medium text-foreground">{t.booking.priceLabel}</Small>
              <span className="font-mono text-lg font-semibold text-primary">
                {booking.price.toLocaleString(locale)} {booking.currency}
              </span>
            </div>
          ) : null}
          <div className="flex flex-col gap-2">
            <Label>{t.accountBookingDetails.customerInfoHeading}</Label>
            <Small className="text-foreground">{booking.customerName}</Small>
            <Small className="text-muted-foreground" dir="ltr">
              {booking.customerEmail}
            </Small>
            <Small className="text-muted-foreground" dir="ltr">
              {booking.customerPhone}
            </Small>
          </div>
        </div>
      </div>
    </Container>
  );
}
