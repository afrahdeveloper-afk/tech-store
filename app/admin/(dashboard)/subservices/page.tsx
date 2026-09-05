import type { Metadata } from "next";
import { parsePageParam } from "@/lib/pagination";

import { queryAdminSubservices, type NameSortOption } from "@/lib/admin-data";
import { getServiceCategories } from "@/lib/services-data";
import { AdminSubservicesList } from "@/components/admin/lists/admin-subservices-list";

export const metadata: Metadata = {
  title: "Subservices",
};

const VALID_SORTS: NameSortOption[] = ["newest", "oldest", "name-asc"];
function readSort(value: string | undefined): NameSortOption {
  return VALID_SORTS.includes(value as NameSortOption) ? (value as NameSortOption) : "newest";
}

export default async function AdminSubservicesPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const params = await searchParams;
  const query = {
    page: parsePageParam(params.page),
    search: params.q ?? "",
    serviceCategoryId: params.category ?? "",
    sort: readSort(params.sort),
  };

  const [result, categories] = await Promise.all([queryAdminSubservices(query), getServiceCategories()]);

  return <AdminSubservicesList result={result} categories={categories} query={query} />;
}
