import type { Metadata } from "next";
import { parsePageParam } from "@/lib/pagination";

import { queryAdminProducts, type ProductSortOption } from "@/lib/admin-data";
import { getCategories } from "@/lib/products-data";
import { AdminProductsList } from "@/components/admin/lists/admin-products-list";
import type { ProductStatus } from "@/lib/generated/prisma/enums";

export const metadata: Metadata = {
  title: "Products",
};

const VALID_SORTS: ProductSortOption[] = ["newest", "oldest", "name-asc", "price-asc", "price-desc"];
function readSort(value: string | undefined): ProductSortOption {
  return VALID_SORTS.includes(value as ProductSortOption) ? (value as ProductSortOption) : "newest";
}

const VALID_STATUSES: ProductStatus[] = ["DRAFT", "ACTIVE", "ARCHIVED"];
function readStatus(value: string | undefined): ProductStatus | "" {
  return VALID_STATUSES.includes(value as ProductStatus) ? (value as ProductStatus) : "";
}

export default async function AdminProductsPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const params = await searchParams;
  const query = {
    page: parsePageParam(params.page),
    search: params.q ?? "",
    status: readStatus(params.status),
    categoryId: params.category ?? "",
    sort: readSort(params.sort),
  };

  const [result, categories] = await Promise.all([queryAdminProducts(query), getCategories()]);

  return <AdminProductsList result={result} categories={categories} query={query} />;
}
