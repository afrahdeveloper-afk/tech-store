"use client";

import { ClipboardList, X } from "lucide-react";

import type { AdminServiceQuery, AdminServiceRow, PagedResult } from "@/lib/admin-data";
import { deleteService } from "@/app/admin/(dashboard)/services/actions";
import { useAdminListParams } from "@/lib/hooks/use-admin-list-params";
import { useLanguage } from "@/components/providers/language-provider";
import { AdminListHeader } from "@/components/admin/admin-list-header";
import { AdminSearchBox } from "@/components/admin/list/admin-search-box";
import { RowActions } from "@/components/admin/row-actions";
import { EmptyState } from "@/components/shared/empty-state";
import { Pagination } from "@/components/products/pagination";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

export function AdminServicesList({ result, query }: { result: PagedResult<AdminServiceRow>; query: AdminServiceQuery }) {
  const { t, lang } = useLanguage();
  const locale = lang === "ar" ? "ar-SA" : "en-US";
  const { updateParams, buildPageHref } = useAdminListParams();
  const hasActiveFilters = Boolean(query.search || query.status || query.sort !== "newest");
  const countLabel = (result.total === 1 ? t.adminCommon.resultsCountOne : t.adminCommon.resultsCountOther).replace(
    "{count}",
    result.total.toLocaleString(locale)
  );

  return (
    <div className="flex flex-col gap-4 pb-8">
      <AdminListHeader
        heading={t.adminServices.heading}
        description={t.adminServices.description}
        count={countLabel}
        addNew={{ href: "/admin/services/new", label: t.adminForm.addNew }}
      />

      <div className="flex flex-col gap-2 px-4 sm:flex-row sm:flex-wrap sm:items-center sm:px-6 lg:px-8">
        <AdminSearchBox
          value={query.search}
          onCommit={(value) => updateParams({ q: value || null })}
          placeholder={t.adminServices.searchPlaceholder}
          label={t.adminCommon.searchLabel}
        />
        <Select
          aria-label={t.adminServices.statusFilterLabel}
          value={query.status}
          onChange={(event) => updateParams({ status: event.target.value || null })}
          className="w-full sm:w-auto"
        >
          <option value="">{t.adminCommon.allLabel}</option>
          <option value="ACTIVE">{t.adminServices.statusActive}</option>
          <option value="INACTIVE">{t.adminServices.statusInactive}</option>
        </Select>
        <Select
          aria-label={t.adminCommon.sortLabel}
          value={query.sort}
          onChange={(event) => updateParams({ sort: event.target.value === "newest" ? null : event.target.value })}
          className="w-full sm:w-auto"
        >
          <option value="newest">{t.adminCommon.sortNewest}</option>
          <option value="oldest">{t.adminCommon.sortOldest}</option>
          <option value="name-asc">{t.adminCommon.sortNameAsc}</option>
          <option value="price-asc">{t.adminServices.sortPriceAsc}</option>
          <option value="price-desc">{t.adminServices.sortPriceDesc}</option>
        </Select>
        {hasActiveFilters ? (
          <Button type="button" variant="ghost" size="sm" className="w-full justify-center motion-safe:animate-in motion-safe:fade-in motion-safe:duration-150 sm:w-auto" onClick={() => updateParams({ q: null, status: null, sort: null })}>
            <X className="size-3.5" aria-hidden="true" />
            {t.products.clearFilters}
          </Button>
        ) : null}
      </div>

      <div className="px-4 sm:px-6 lg:px-8">
        {result.items.length === 0 ? (
          <EmptyState icon={ClipboardList} title={t.adminServices.emptyTitle} description={t.adminServices.emptyDescription} />
        ) : (
          <>
            {/* Mobile/tablet (<md): one card per service. */}
            <div className="flex flex-col gap-3 md:hidden">
              {result.items.map((service) => (
                <div key={service.id} className="flex flex-col gap-2 rounded-xl border border-border bg-card p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex min-w-0 flex-col gap-0.5">
                      <span className="truncate font-medium text-foreground">{lang === "ar" ? (service.nameAr ?? service.name) : service.name}</span>
                      <span className="truncate text-xs text-muted-foreground">
                        {lang === "ar" ? (service.subserviceNameAr ?? service.subserviceName) : service.subserviceName}
                      </span>
                    </div>
                    <RowActions
                      editHref={`/admin/services/${service.id}/edit`}
                      editLabel={t.adminServices.rowEdit}
                      deleteLabel={t.adminServices.rowDelete}
                      confirmTitle={t.adminForm.deleteConfirmTitle}
                      confirmDescription={t.adminForm.deleteConfirmDescription}
                      successTitle={t.adminForm.deleteSuccessTitle}
                      onDelete={async () => {
                        const deleteResult = await deleteService(service.id);
                        if (deleteResult.success) return deleteResult;
                        return {
                          success: false,
                          error: deleteResult.error === "has-dependents" ? t.adminForm.errorHasDependents : t.adminForm.errorServer,
                        };
                      }}
                    />
                  </div>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-border pt-2">
                    <span className="font-mono text-sm text-foreground">
                      {service.price !== null ? (
                        `${service.price.toLocaleString(locale)} ${service.currency}`
                      ) : (
                        <span className="text-muted-foreground italic">{t.adminServices.noPriceSet}</span>
                      )}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {service.durationMinutes !== null ? `${service.durationMinutes} ${t.adminServices.minutesSuffix}` : "—"}
                    </span>
                    <Badge variant={service.status === "ACTIVE" ? "success" : "neutral"}>
                      {service.status === "ACTIVE" ? t.adminServices.statusActive : t.adminServices.statusInactive}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>

            <div className="hidden overflow-x-auto rounded-xl border border-border bg-card md:block">
              <table className="w-full min-w-[720px] border-collapse text-sm">
                <thead>
                  <tr className="border-b border-border text-xs font-medium text-muted-foreground">
                    <th className="px-4 py-3 text-start font-medium">{t.adminServices.columnService}</th>
                    <th className="px-4 py-3 text-start font-medium">{t.adminServices.columnSubservice}</th>
                    <th className="px-4 py-3 text-start font-medium">{t.adminServices.columnPrice}</th>
                    <th className="px-4 py-3 text-start font-medium">{t.adminServices.columnDuration}</th>
                    <th className="px-4 py-3 text-start font-medium">{t.adminCommon.columnStatus}</th>
                    <th className="px-4 py-3 text-end font-medium">{t.adminCommon.columnActions}</th>
                  </tr>
                </thead>
                <tbody>
                  {result.items.map((service) => (
                    <tr key={service.id} className="border-b border-border transition-colors last:border-0 hover:bg-muted/40">
                      <td className="px-4 py-3 font-medium text-foreground">
                        {lang === "ar" ? (service.nameAr ?? service.name) : service.name}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {lang === "ar" ? (service.subserviceNameAr ?? service.subserviceName) : service.subserviceName}
                      </td>
                      <td className="px-4 py-3 font-mono text-foreground">
                        {service.price !== null ? (
                          `${service.price.toLocaleString(locale)} ${service.currency}`
                        ) : (
                          <span className="text-muted-foreground italic">{t.adminServices.noPriceSet}</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {service.durationMinutes !== null ? `${service.durationMinutes} ${t.adminServices.minutesSuffix}` : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={service.status === "ACTIVE" ? "success" : "neutral"}>
                          {service.status === "ACTIVE" ? t.adminServices.statusActive : t.adminServices.statusInactive}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <RowActions
                          editHref={`/admin/services/${service.id}/edit`}
                          editLabel={t.adminServices.rowEdit}
                          deleteLabel={t.adminServices.rowDelete}
                          confirmTitle={t.adminForm.deleteConfirmTitle}
                          confirmDescription={t.adminForm.deleteConfirmDescription}
                          successTitle={t.adminForm.deleteSuccessTitle}
                          onDelete={async () => {
                            const deleteResult = await deleteService(service.id);
                            if (deleteResult.success) return deleteResult;
                            return {
                              success: false,
                              error: deleteResult.error === "has-dependents" ? t.adminForm.errorHasDependents : t.adminForm.errorServer,
                            };
                          }}
                        />
                      </td>
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
