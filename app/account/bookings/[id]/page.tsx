import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { getCurrentCustomer } from "@/lib/auth/current-customer";
import { getCustomerBooking } from "@/lib/account-data";
import { BookingDetailView } from "@/components/account/booking-detail-view";

export const metadata: Metadata = {
  title: "Booking Details — Speed Core",
};

/**
 * `/account/bookings/[id]` — Step 10. Same ownership-scoped-query pattern as
 * `/account/orders/[id]` (see the note there) — `getCustomerBooking` scopes
 * by `customer.id` server-side, so a non-owned id 404s indistinguishably
 * from an unknown one.
 */
export default async function AccountBookingDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const customer = await getCurrentCustomer();
  if (!customer) {
    redirect(`/login?next=/account/bookings/${id}`);
  }

  const booking = await getCustomerBooking(customer.id, id);
  if (!booking) {
    notFound();
  }

  return <BookingDetailView booking={booking} />;
}
