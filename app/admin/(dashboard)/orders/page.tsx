import type { Metadata } from "next";
import { parsePageParam } from "@/lib/pagination";

import { queryAdminOrders, type AmountSortOption } from "@/lib/admin-data";
import { AdminOrdersList } from "@/components/admin/lists/admin-orders-list";
import type { OrderStatus } from "@/lib/generated/prisma/enums";

export const metadata: Metadata = {
  title: "Orders",
};

const VALID_SORTS: AmountSortOption[] = ["newest", "oldest", "amount-asc", "amount-desc"];
function readSort(value: string | undefined): AmountSortOption {
  return VALID_SORTS.includes(value as AmountSortOption) ? (value as AmountSortOption) : "newest";
}

const VALID_STATUSES: OrderStatus[] = ["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"];
function readStatus(value: string | undefined): OrderStatus | "" {
  return VALID_STATUSES.includes(value as OrderStatus) ? (value as OrderStatus) : "";
}

export default async function AdminOrdersPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const params = await searchParams;
  const query = {
    page: parsePageParam(params.page),
    search: params.q ?? "",
    status: readStatus(params.status),
    dateFrom: params.from ?? "",
    dateTo: params.to ?? "",
    sort: readSort(params.sort),
  };

  const result = await queryAdminOrders(query);

  return <AdminOrdersList result={result} query={query} />;
}
