import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getAdminBookingById } from "@/lib/admin-data";
import { BookingDetailView } from "@/components/admin/bookings/booking-detail-view";

export const metadata: Metadata = {
  title: "Booking Detail",
};

export default async function AdminBookingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const booking = await getAdminBookingById(id);
  if (!booking) notFound();

  return <BookingDetailView booking={booking} />;
}
