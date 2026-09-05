import type { Metadata } from "next";
import { parsePageParam } from "@/lib/pagination";

import { queryAdminServiceCategories, type NameSortOption } from "@/lib/admin-data";
import { AdminServiceCategoriesList } from "@/components/admin/lists/admin-service-categories-list";

export const metadata: Metadata = {
  title: "Service Categories",
};

const VALID_SORTS: NameSortOption[] = ["newest", "oldest", "name-asc"];
function readSort(value: string | undefined): NameSortOption {
  return VALID_SORTS.includes(value as NameSortOption) ? (value as NameSortOption) : "newest";
}

export default async function AdminServiceCategoriesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const query = {
    page: parsePageParam(params.page),
    search: params.q ?? "",
    sort: readSort(params.sort),
  };

  const result = await queryAdminServiceCategories(query);

  return <AdminServiceCategoriesList result={result} query={query} />;
}
