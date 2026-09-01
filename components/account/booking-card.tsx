"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

import type { BookingActivityItem } from "@/lib/account-data";
import { useLanguage } from "@/components/providers/language-provider";
import { StatusBadge } from "@/components/account/status-badge";
import { H3, Small } from "@/components/ui/typography";

/** One service booking in `/account/orders`'s combined history — Step 5's card. */
export function BookingCard({ booking }: { booking: BookingActivityItem }) {
  const { t, lang } = useLanguage();
  const locale = lang === "ar" ? "ar-SA" : "en-US";
  const createdDate = new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(booking.createdAt);

  const serviceName = lang === "ar" ? booking.serviceNameAr ?? booking.serviceName : booking.serviceName;
  const categoryName = lang === "ar" ? booking.categoryNameAr ?? booking.categoryName : booking.categoryName;
  const subserviceName = lang === "ar" ? booking.subserviceNameAr ?? booking.subserviceName : booking.subserviceName;
  const metaLine = [categoryName, subserviceName].filter(Boolean).join(" · ");

  const scheduled = booking.preferredDate
    ? `${new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(booking.preferredDate)}${
        booking.preferredTime ? ` · ${booking.preferredTime}` : ""
      }`
    : null;

  return (
    <Link
      href={`/account/bookings/${booking.id}`}
      className="group flex flex-col gap-3 rounded-xl border border-border bg-card p-5 transition-all hover:border-primary/40 hover:shadow-lg hover:shadow-black/30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <Small className="text-muted-foreground">
            {t.accountActivity.bookingNumberLabel} · {createdDate}
          </Small>
          <span className="font-mono text-sm font-semibold text-foreground" dir="ltr">
            {booking.number}
          </span>
        </div>
        <StatusBadge status={booking.status} />
      </div>

      <H3 as="h3" className="text-base font-semibold leading-snug">
        {serviceName}
      </H3>
      {metaLine ? <Small className="text-muted-foreground">{metaLine}</Small> : null}

      <div className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-border pt-3">
        <Small className="text-muted-foreground">
          {scheduled ? `${t.accountActivity.scheduledLabel}: ${scheduled}` : "—"}
        </Small>
        <div className="flex items-center gap-3">
          {booking.price != null ? (
            <span className="font-mono text-sm font-semibold text-primary">
              {booking.price.toLocaleString(locale)} {booking.currency}
            </span>
          ) : null}
          <span className="flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors group-hover:text-accent">
            {t.services.viewDetailsCta}
            <ArrowRight className="size-3.5 rtl:rotate-180" aria-hidden="true" />
          </span>
        </div>
      </div>
    </Link>
  );
}
