"use client";

import Link from "next/link";
import { Users, X } from "lucide-react";

import type { AdminCustomerQuery, AdminCustomerRow, PagedResult } from "@/lib/admin-data";
import { useAdminListParams } from "@/lib/hooks/use-admin-list-params";
import { useLanguage } from "@/components/providers/language-provider";
import { AdminListHeader } from "@/components/admin/admin-list-header";
import { AdminSearchBox } from "@/components/admin/list/admin-search-box";
import { EmptyState } from "@/components/shared/empty-state";
import { Pagination } from "@/components/products/pagination";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

export function AdminCustomersList({ result, query }: { result: PagedResult<AdminCustomerRow>; query: AdminCustomerQuery }) {
  const { t, lang } = useLanguage();
  const locale = lang === "ar" ? "ar-SA" : "en-US";
  const dateFormatter = new Intl.DateTimeFormat(locale, { dateStyle: "medium" });
  const { updateParams, buildPageHref } = useAdminListParams();
  const hasActiveFilters = Boolean(query.search || query.sort !== "newest");
  const countLabel = (result.total === 1 ? t.adminCommon.resultsCountOne : t.adminCommon.resultsCountOther).replace(
    "{count}",
    result.total.toLocaleString(locale)
  );

  return (
    <div className="flex flex-col gap-4 pb-8">
      <AdminListHeader heading={t.adminCustomers.heading} description={t.adminCustomers.description} count={countLabel} />

      <div className="flex flex-col gap-2 px-4 sm:flex-row sm:flex-wrap sm:items-center sm:px-6 lg:px-8">
        <AdminSearchBox
          value={query.search}
          onCommit={(value) => updateParams({ q: value || null })}
          placeholder={t.adminCustomers.searchPlaceholder}
          label={t.adminCommon.searchLabel}
        />
        <Select
          aria-label={t.adminCommon.sortLabel}
          value={query.sort}
          onChange={(event) => updateParams({ sort: event.target.value === "newest" ? null : event.target.value })}
          className="w-full sm:w-auto"
        >
          <option value="newest">{t.adminCommon.sortNewest}</option>
          <option value="oldest">{t.adminCommon.sortOldest}</option>
          <option value="name-asc">{t.adminCommon.sortNameAsc}</option>
        </Select>
        {hasActiveFilters ? (
          <Button type="button" variant="ghost" size="sm" className="w-full justify-center motion-safe:animate-in motion-safe:fade-in motion-safe:duration-150 sm:w-auto" onClick={() => updateParams({ q: null, sort: null })}>
            <X className="size-3.5" aria-hidden="true" />
            {t.products.clearFilters}
          </Button>
        ) : null}
      </div>

      <div className="px-4 sm:px-6 lg:px-8">
        {result.items.length === 0 ? (
          <EmptyState icon={Users} title={t.adminCustomers.emptyTitle} description={t.adminCustomers.emptyDescription} />
        ) : (
          <>
            {/* Mobile/tablet (<md): one tappable card per customer. */}
            <div className="flex flex-col gap-3 md:hidden">
              {result.items.map((customer) => (
                <Link
                  key={customer.id}
                  href={`/admin/customers/${customer.id}`}
                  className="flex flex-col gap-2 rounded-xl border border-border bg-card p-4 transition hover:border-primary/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring motion-safe:active:scale-[0.98]"
                >
                  <span className="truncate font-medium text-foreground">{customer.name}</span>
                  <span className="truncate text-xs text-muted-foreground">{customer.email}</span>
                  <span className="font-mono text-xs text-muted-foreground">{customer.phone}</span>
                  <div className="flex items-center justify-between gap-2 border-t border-border pt-2 text-xs text-muted-foreground">
                    <span>
                      {t.adminCustomers.columnOrders}: {customer.orderCount.toLocaleString(locale)} · {t.adminCustomers.columnBookings}:{" "}
                      {customer.bookingCount.toLocaleString(locale)}
                    </span>
                    <span className="shrink-0">{dateFormatter.format(customer.createdAt)}</span>
                  </div>
                </Link>
              ))}
            </div>

            <div className="hidden overflow-x-auto rounded-xl border border-border bg-card md:block">
              <table className="w-full min-w-[640px] border-collapse text-sm">
                <thead>
                  <tr className="border-b border-border text-xs font-medium text-muted-foreground">
                    <th className="px-4 py-3 text-start font-medium">{t.adminCustomers.columnName}</th>
                    <th className="px-4 py-3 text-start font-medium">{t.adminCustomers.columnContact}</th>
                    <th className="px-4 py-3 text-start font-medium">{t.adminCustomers.columnOrders}</th>
                    <th className="px-4 py-3 text-start font-medium">{t.adminCustomers.columnBookings}</th>
                    <th className="px-4 py-3 text-start font-medium">{t.adminCustomers.columnJoined}</th>
                  </tr>
                </thead>
                <tbody>
                  {result.items.map((customer) => (
                    <tr key={customer.id} className="border-b border-border transition-colors last:border-0 hover:bg-muted/40">
                      <td className="px-4 py-3">
                        <Link
                          href={`/admin/customers/${customer.id}`}
                          aria-label={t.adminCustomers.rowView}
                          className="rounded-sm font-medium text-foreground underline-offset-2 transition-colors hover:text-primary hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                        >
                          {customer.name}
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col">
                          <span className="text-muted-foreground">{customer.email}</span>
                          <span className="font-mono text-xs text-muted-foreground">{customer.phone}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-mono text-foreground">{customer.orderCount.toLocaleString(locale)}</td>
                      <td className="px-4 py-3 font-mono text-foreground">{customer.bookingCount.toLocaleString(locale)}</td>
                      <td className="px-4 py-3 text-muted-foreground">{dateFormatter.format(customer.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4">
              <Pagination
                page={result.page}
                totalPages={result.totalPages}
                previousHref={result.page > 1 ? buildPageHref(result.page - 1) : null}
                nextHref={result.page < result.totalPages ? buildPageHref(result.page + 1) : null}
                previousLabel={t.products.paginationPrevious}
                nextLabel={t.products.paginationNext}
                pageOfLabel={t.products.paginationPageOf}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
