"use client";

import Link from "next/link";
import { CalendarCheck, X } from "lucide-react";

import type { AdminBookingQuery, AdminBookingRow, PagedResult } from "@/lib/admin-data";
import { useAdminListParams } from "@/lib/hooks/use-admin-list-params";
import { useLanguage } from "@/components/providers/language-provider";
import { StatusBadge } from "@/components/account/status-badge";
import { AdminListHeader } from "@/components/admin/admin-list-header";
import { AdminSearchBox } from "@/components/admin/list/admin-search-box";
import { EmptyState } from "@/components/shared/empty-state";
import { Pagination } from "@/components/products/pagination";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function AdminBookingsList({ result, query }: { result: PagedResult<AdminBookingRow>; query: AdminBookingQuery }) {
  const { t, lang } = useLanguage();
  const locale = lang === "ar" ? "ar-SA" : "en-US";
  const dateFormatter = new Intl.DateTimeFormat(locale, { dateStyle: "medium" });
  const { updateParams, buildPageHref } = useAdminListParams();
  const hasActiveFilters = Boolean(query.search || query.status || query.dateFrom || query.dateTo || query.sort !== "newest");
  const countLabel = (result.total === 1 ? t.adminCommon.resultsCountOne : t.adminCommon.resultsCountOther).replace(
    "{count}",
    result.total.toLocaleString(locale)
  );

  return (
    <div className="flex flex-col gap-4 pb-8">
      <AdminListHeader heading={t.adminBookings.heading} description={t.adminBookings.description} count={countLabel} />

      <div className="flex flex-col gap-2 px-4 sm:flex-row sm:flex-wrap sm:items-end sm:px-6 lg:px-8">
        <AdminSearchBox
          value={query.search}
          onCommit={(value) => updateParams({ q: value || null })}
          placeholder={t.adminBookings.searchPlaceholder}
          label={t.adminCommon.searchLabel}
        />
        <Select
          aria-label={t.adminBookings.statusFilterLabel}
          value={query.status}
          onChange={(event) => updateParams({ status: event.target.value || null })}
          className="w-full sm:w-auto"
        >
          <option value="">{t.adminCommon.allLabel}</option>
          <option value="PENDING">{t.accountActivity.statusPending}</option>
          <option value="CONFIRMED">{t.accountActivity.statusConfirmed}</option>
          <option value="COMPLETED">{t.accountActivity.statusCompleted}</option>
          <option value="CANCELLED">{t.accountActivity.statusCancelled}</option>
        </Select>
        <div className="grid grid-cols-2 gap-2 sm:flex sm:w-auto sm:gap-2">
          <label className="flex flex-col gap-1 text-xs font-medium text-muted-foreground">
            {t.adminBookings.dateFromLabel}
            <Input type="date" value={query.dateFrom} onChange={(event) => updateParams({ from: event.target.value || null })} className="w-full sm:w-auto" />
          </label>
          <label className="flex flex-col gap-1 text-xs font-medium text-muted-foreground">
            {t.adminBookings.dateToLabel}
            <Input type="date" value={query.dateTo} onChange={(event) => updateParams({ to: event.target.value || null })} className="w-full sm:w-auto" />
          </label>
        </div>
        <Select
          aria-label={t.adminCommon.sortLabel}
          value={query.sort}
          onChange={(event) => updateParams({ sort: event.target.value === "newest" ? null : event.target.value })}
          className="w-full sm:w-auto"
        >
          <option value="newest">{t.adminCommon.sortNewest}</option>
          <option value="oldest">{t.adminCommon.sortOldest}</option>
        </Select>
        {hasActiveFilters ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="w-full justify-center motion-safe:animate-in motion-safe:fade-in motion-safe:duration-150 sm:w-auto"
            onClick={() => updateParams({ q: null, status: null, from: null, to: null, sort: null })}
          >
            <X className="size-3.5" aria-hidden="true" />
            {t.products.clearFilters}
          </Button>
        ) : null}
      </div>

      <div className="px-4 sm:px-6 lg:px-8">
        {result.items.length === 0 ? (
          <EmptyState icon={CalendarCheck} title={t.adminBookings.emptyTitle} description={t.adminBookings.emptyDescription} />
        ) : (
          <>
            {/* Mobile/tablet (<md): one tappable card per booking. */}
            <div className="flex flex-col gap-3 md:hidden">
              {result.items.map((booking) => (
                <Link
                  key={booking.id}
                  href={`/admin/bookings/${booking.id}`}
                  className="flex flex-col gap-2 rounded-xl border border-border bg-card p-4 transition hover:border-primary/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring motion-safe:active:scale-[0.98]"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-sm text-foreground">{booking.bookingNumber}</span>
                    <StatusBadge status={booking.status} />
                  </div>
                  <div className="flex flex-col">
                    <span className="truncate text-sm text-foreground">{booking.customerName}</span>
                    <span className="truncate text-xs text-muted-foreground">{booking.customerEmail}</span>
                  </div>
                  <div className="flex items-center justify-between gap-2 border-t border-border pt-2">
                    <span className="truncate text-xs text-muted-foreground">
                      {lang === "ar" ? (booking.serviceNameAr ?? booking.serviceName) : booking.serviceName}
                    </span>
                    <span className="shrink-0 text-xs text-muted-foreground">{dateFormatter.format(booking.createdAt)}</span>
                  </div>
                </Link>
              ))}
            </div>

            <div className="hidden overflow-x-auto rounded-xl border border-border bg-card md:block">
              <table className="w-full min-w-[640px] border-collapse text-sm">
                <thead>
                  <tr className="border-b border-border text-xs font-medium text-muted-foreground">
                    <th className="px-4 py-3 text-start font-medium">{t.adminBookings.columnNumber}</th>
                    <th className="px-4 py-3 text-start font-medium">{t.adminBookings.columnCustomer}</th>
                    <th className="px-4 py-3 text-start font-medium">{t.adminBookings.columnService}</th>
                    <th className="px-4 py-3 text-start font-medium">{t.adminCommon.columnStatus}</th>
                    <th className="px-4 py-3 text-start font-medium">{t.adminCommon.columnDate}</th>
                  </tr>
                </thead>
                <tbody>
                  {result.items.map((booking) => (
                    <tr key={booking.id} className="border-b border-border transition-colors last:border-0 hover:bg-muted/40">
                      <td className="px-4 py-3">
                        <Link
                          href={`/admin/bookings/${booking.id}`}
                          className="rounded-sm font-mono text-foreground underline-offset-2 transition-colors hover:text-primary hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                        >
                          {booking.bookingNumber}
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col">
                          <span className="text-foreground">{booking.customerName}</span>
                          <span className="text-xs text-muted-foreground">{booking.customerEmail}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-foreground">
                        {lang === "ar" ? (booking.serviceNameAr ?? booking.serviceName) : booking.serviceName}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={booking.status} />
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{dateFormatter.format(booking.createdAt)}</td>
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
