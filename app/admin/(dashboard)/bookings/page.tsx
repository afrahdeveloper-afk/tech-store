import type { Metadata } from "next";
import { parsePageParam } from "@/lib/pagination";

import { queryAdminBookings, type DateSortOption } from "@/lib/admin-data";
import { AdminBookingsList } from "@/components/admin/lists/admin-bookings-list";
import type { BookingStatus } from "@/lib/generated/prisma/enums";

export const metadata: Metadata = {
  title: "Bookings",
};

const VALID_SORTS: DateSortOption[] = ["newest", "oldest"];
function readSort(value: string | undefined): DateSortOption {
  return VALID_SORTS.includes(value as DateSortOption) ? (value as DateSortOption) : "newest";
}

const VALID_STATUSES: BookingStatus[] = ["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"];
function readStatus(value: string | undefined): BookingStatus | "" {
  return VALID_STATUSES.includes(value as BookingStatus) ? (value as BookingStatus) : "";
}

export default async function AdminBookingsPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const params = await searchParams;
  const query = {
    page: parsePageParam(params.page),
    search: params.q ?? "",
    status: readStatus(params.status),
    dateFrom: params.from ?? "",
    dateTo: params.to ?? "",
    sort: readSort(params.sort),
  };

  const result = await queryAdminBookings(query);

  return <AdminBookingsList result={result} query={query} />;
}
