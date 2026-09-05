"use client";

import type { AdminBookingDetail } from "@/lib/admin-data";
import type { BookingStatus } from "@/lib/generated/prisma/enums";
import { useLanguage } from "@/components/providers/language-provider";
import { Breadcrumb } from "@/components/shared/breadcrumb";
import { ImageGalleryGrid } from "@/components/shared/image-gallery-grid";
import { BookingStatusForm } from "@/components/admin/bookings/booking-status-form";
import { BookingStatusTimeline } from "@/components/admin/bookings/booking-status-timeline";
import { Small } from "@/components/ui/typography";

export function BookingDetailView({ booking }: { booking: AdminBookingDetail }) {
  const { t, lang } = useLanguage();
  const locale = lang === "ar" ? "ar-SA" : "en-US";
  const dateFormatter = new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" });
  const scheduledDateFormatter = new Intl.DateTimeFormat(locale, { dateStyle: "medium" });

  const statusLabel: Record<BookingStatus, string> = {
    PENDING: t.accountActivity.statusPending,
    CONFIRMED: t.accountActivity.statusConfirmed,
    COMPLETED: t.accountActivity.statusCompleted,
    CANCELLED: t.accountActivity.statusCancelled,
  };

  return (
    <div className="flex flex-col gap-6 p-4 pb-10 sm:p-6 lg:p-8">
      <Breadcrumb items={[{ label: t.adminHeader.breadcrumbHome, href: "/admin" }, { label: t.adminBookings.heading, href: "/admin/bookings" }, { label: booking.bookingNumber }]} />

      <div className="flex flex-col gap-1">
        <h1 className="font-display text-2xl font-semibold text-foreground sm:text-3xl">
          {t.adminBookings.detailTitle} <span className="font-mono">{booking.bookingNumber}</span>
        </h1>
        <Small className="text-muted-foreground">
          {t.adminBookings.placedOnLabel} {dateFormatter.format(booking.createdAt)}
        </Small>
      </div>

      {/* Status management — kept as the first, unmissable card right under
          the header (not buried in a sidebar) so "current status" and "next
          action" are the first thing an admin sees on this page, matching
          the Order Detail page's layout. */}
      <section className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5">
        <BookingStatusForm bookingId={booking.id} status={booking.status} />
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          <section className="flex flex-col gap-3 rounded-xl border border-border bg-card p-5">
            <h2 className="text-base font-semibold text-foreground">{t.adminBookings.serviceLabel}</h2>
            <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label={t.adminBookings.categoryLabel} value={lang === "ar" ? booking.categoryNameAr ?? booking.categoryName : booking.categoryName} />
              <Field label={t.adminBookings.subserviceLabel} value={lang === "ar" ? booking.subserviceNameAr ?? booking.subserviceName : booking.subserviceName} />
              <Field label={t.adminBookings.serviceLabel} value={lang === "ar" ? booking.serviceNameAr ?? booking.serviceName : booking.serviceName} />
              <Field
                label={t.adminBookings.priceLabel}
                value={booking.priceSnapshot !== null ? `${booking.priceSnapshot.toLocaleString(locale)} ${booking.currency}` : t.adminBookings.noPriceSet}
              />
              <Field
                label={t.adminBookings.durationLabel}
                value={booking.durationMinutes !== null ? `${booking.durationMinutes} ${t.adminBookings.minutesSuffix}` : "—"}
              />
              <Field
                label={t.adminBookings.scheduledDateLabel}
                value={
                  booking.preferredDate
                    ? `${scheduledDateFormatter.format(booking.preferredDate)}${booking.preferredTime ? ` · ${booking.preferredTime}` : ""}`
                    : t.adminBookings.noScheduleSet
                }
              />
            </dl>
          </section>

          {booking.notes ? (
            <section className="flex flex-col gap-2 rounded-xl border border-border bg-card p-5">
              <h2 className="text-base font-semibold text-foreground">{t.adminBookings.notesLabel}</h2>
              <p className="text-sm text-muted-foreground">{booking.notes}</p>
            </section>
          ) : null}

          {booking.images.length > 0 ? (
            <section className="flex flex-col gap-3 rounded-xl border border-border bg-card p-5">
              <h2 className="text-base font-semibold text-foreground">{t.adminBookings.photosHeading}</h2>
              <ImageGalleryGrid images={booking.images} altPrefix={booking.serviceName} groupLabel={t.adminBookings.photosHeading} />
            </section>
          ) : null}
        </div>

        <div className="flex flex-col gap-6">
          <section className="flex flex-col gap-3 rounded-xl border border-border bg-card p-5">
            <h2 className="text-base font-semibold text-foreground">{t.adminBookings.timelineHeading}</h2>
            <BookingStatusTimeline
              status={booking.status}
              statusLabel={statusLabel}
              createdLabel={t.adminBookings.timelineBookingCreated}
              cancelledLabel={t.adminBookings.timelineBookingCancelled}
              createdAtLabel={dateFormatter.format(booking.createdAt)}
            />
          </section>

          <section className="flex flex-col gap-2 rounded-xl border border-border bg-card p-5">
            <h2 className="text-base font-semibold text-foreground">{t.adminBookings.customerInfoHeading}</h2>
            <p className="text-sm text-foreground">{booking.customerName}</p>
            <p className="text-sm text-muted-foreground">{booking.customerEmail}</p>
            <p className="font-mono text-sm text-muted-foreground">{booking.customerPhone}</p>
          </section>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <dt className="text-xs font-medium text-muted-foreground">{label}</dt>
      <dd className="text-sm text-foreground">{value}</dd>
    </div>
  );
}
