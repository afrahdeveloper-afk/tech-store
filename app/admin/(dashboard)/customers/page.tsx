import type { Metadata } from "next";
import { parsePageParam } from "@/lib/pagination";

import { queryAdminCustomers, type NameSortOption } from "@/lib/admin-data";
import { AdminCustomersList } from "@/components/admin/lists/admin-customers-list";

export const metadata: Metadata = {
  title: "Customers",
};

const VALID_SORTS: NameSortOption[] = ["newest", "oldest", "name-asc"];
function readSort(value: string | undefined): NameSortOption {
  return VALID_SORTS.includes(value as NameSortOption) ? (value as NameSortOption) : "newest";
}

export default async function AdminCustomersPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const params = await searchParams;
  const query = {
    page: parsePageParam(params.page),
    search: params.q ?? "",
    sort: readSort(params.sort),
  };

  const result = await queryAdminCustomers(query);

  return <AdminCustomersList result={result} query={query} />;
}
