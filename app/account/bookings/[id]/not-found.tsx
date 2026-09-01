"use client";

import { CalendarX } from "lucide-react";

import { useLanguage } from "@/components/providers/language-provider";
import { Container } from "@/components/ui/container";
import { EmptyState } from "@/components/shared/empty-state";

/**
 * Rendered when `notFound()` is called in `app/account/bookings/[id]/page.tsx`
 * — an unknown booking id, or one that belongs to a different customer (see
 * the ownership note there).
 */
export default function AccountBookingNotFound() {
  const { t } = useLanguage();

  return (
    <Container className="py-16">
      <EmptyState
        icon={CalendarX}
        title={t.accountBookingDetails.notFoundTitle}
        description={t.accountBookingDetails.notFoundDescription}
        action={{ label: t.accountBookingDetails.backToBookings, href: "/account/orders" }}
      />
    </Container>
  );
}
