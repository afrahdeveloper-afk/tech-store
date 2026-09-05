import type { Metadata } from "next";
import { parsePageParam } from "@/lib/pagination";

import { queryAdminServices, type ServiceSortOption } from "@/lib/admin-data";
import { AdminServicesList } from "@/components/admin/lists/admin-services-list";
import type { ServiceStatus } from "@/lib/generated/prisma/enums";

export const metadata: Metadata = {
  title: "Services",
};

const VALID_SORTS: ServiceSortOption[] = ["newest", "oldest", "name-asc", "price-asc", "price-desc"];
function readSort(value: string | undefined): ServiceSortOption {
  return VALID_SORTS.includes(value as ServiceSortOption) ? (value as ServiceSortOption) : "newest";
}

const VALID_STATUSES: ServiceStatus[] = ["ACTIVE", "INACTIVE"];
function readStatus(value: string | undefined): ServiceStatus | "" {
  return VALID_STATUSES.includes(value as ServiceStatus) ? (value as ServiceStatus) : "";
}

export default async function AdminServicesPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const params = await searchParams;
  const query = {
    page: parsePageParam(params.page),
    search: params.q ?? "",
    status: readStatus(params.status),
    sort: readSort(params.sort),
  };

  const result = await queryAdminServices(query);

  return <AdminServicesList result={result} query={query} />;
}
