"use client";

import { Layers, X } from "lucide-react";

import type { AdminServiceCategoryQuery, AdminServiceCategoryRow, PagedResult } from "@/lib/admin-data";
import { deleteServiceCategory } from "@/app/admin/(dashboard)/service-categories/actions";
import { useAdminListParams } from "@/lib/hooks/use-admin-list-params";
import { useLanguage } from "@/components/providers/language-provider";
import { AdminListHeader } from "@/components/admin/admin-list-header";
import { AdminSearchBox } from "@/components/admin/list/admin-search-box";
import { RowActions } from "@/components/admin/row-actions";
import { EmptyState } from "@/components/shared/empty-state";
import { Pagination } from "@/components/products/pagination";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

export function AdminServiceCategoriesList({
  result,
  query,
}: {
  result: PagedResult<AdminServiceCategoryRow>;
  query: AdminServiceCategoryQuery;
}) {
  const { t, lang } = useLanguage();
  const locale = lang === "ar" ? "ar-SA" : "en-US";
  const { updateParams, buildPageHref } = useAdminListParams();
  const hasActiveFilters = Boolean(query.search || query.sort !== "newest");
  const countLabel = (result.total === 1 ? t.adminCommon.resultsCountOne : t.adminCommon.resultsCountOther).replace(
    "{count}",
    result.total.toLocaleString(locale)
  );

  return (
    <div className="flex flex-col gap-4 pb-8">
      <AdminListHeader
        heading={t.adminServiceCategories.heading}
        description={t.adminServiceCategories.description}
        count={countLabel}
        addNew={{ href: "/admin/service-categories/new", label: t.adminForm.addNew }}
      />

      <div className="flex flex-col gap-2 px-4 sm:flex-row sm:flex-wrap sm:items-center sm:px-6 lg:px-8">
        <AdminSearchBox
          value={query.search}
          onCommit={(value) => updateParams({ q: value || null })}
          placeholder={t.adminServiceCategories.searchPlaceholder}
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
          <EmptyState icon={Layers} title={t.adminServiceCategories.emptyTitle} description={t.adminServiceCategories.emptyDescription} />
        ) : (
          <>
            {/* Mobile/tablet (<md): one card per category. */}
            <div className="flex flex-col gap-3 md:hidden">
              {result.items.map((category) => (
                <div key={category.id} className="flex flex-col gap-2 rounded-xl border border-border bg-card p-4">
                  <div className="flex items-start justify-between gap-2">
                    <span className="min-w-0 truncate font-medium text-foreground">
                      {lang === "ar" ? (category.nameAr ?? category.name) : category.name}
                    </span>
                    <RowActions
                      editHref={`/admin/service-categories/${category.id}/edit`}
                      editLabel={t.adminServiceCategories.rowEdit}
                      deleteLabel={t.adminServiceCategories.rowDelete}
                      confirmTitle={t.adminForm.deleteConfirmTitle}
                      confirmDescription={t.adminForm.deleteConfirmDescription}
                      successTitle={t.adminForm.deleteSuccessTitle}
                      onDelete={async () => {
                        const deleteResult = await deleteServiceCategory(category.id);
                        if (deleteResult.success) return deleteResult;
                        return {
                          success: false,
                          error: deleteResult.error === "has-dependents" ? t.adminForm.errorHasDependents : t.adminForm.errorServer,
                        };
                      }}
                    />
                  </div>
                  <p className="line-clamp-2 text-sm text-muted-foreground">
                    {lang === "ar" ? (category.descriptionAr ?? category.description) : category.description}
                  </p>
                  <span className="border-t border-border pt-2 text-xs text-muted-foreground">
                    {t.adminServiceCategories.subserviceCount}: {category.subserviceCount.toLocaleString(locale)}
                  </span>
                </div>
              ))}
            </div>

            <div className="hidden overflow-x-auto rounded-xl border border-border bg-card md:block">
              <table className="w-full min-w-[640px] border-collapse text-sm">
                <thead>
                  <tr className="border-b border-border text-xs font-medium text-muted-foreground">
                    <th className="px-4 py-3 text-start font-medium">{t.adminServiceCategories.columnName}</th>
                    <th className="px-4 py-3 text-start font-medium">{t.adminServiceCategories.columnDescription}</th>
                    <th className="px-4 py-3 text-start font-medium">{t.adminServiceCategories.subserviceCount}</th>
                    <th className="px-4 py-3 text-end font-medium">{t.adminCommon.columnActions}</th>
                  </tr>
                </thead>
                <tbody>
                  {result.items.map((category) => (
                    <tr key={category.id} className="border-b border-border transition-colors last:border-0 hover:bg-muted/40">
                      <td className="px-4 py-3 font-medium text-foreground">
                        {lang === "ar" ? (category.nameAr ?? category.name) : category.name}
                      </td>
                      <td className="max-w-[360px] truncate px-4 py-3 text-muted-foreground">
                        {lang === "ar" ? (category.descriptionAr ?? category.description) : category.description}
                      </td>
                      <td className="px-4 py-3 font-mono text-foreground">{category.subserviceCount.toLocaleString(locale)}</td>
                      <td className="px-4 py-3">
                        <RowActions
                          editHref={`/admin/service-categories/${category.id}/edit`}
                          editLabel={t.adminServiceCategories.rowEdit}
                          deleteLabel={t.adminServiceCategories.rowDelete}
                          confirmTitle={t.adminForm.deleteConfirmTitle}
                          confirmDescription={t.adminForm.deleteConfirmDescription}
                          successTitle={t.adminForm.deleteSuccessTitle}
                          onDelete={async () => {
                            const deleteResult = await deleteServiceCategory(category.id);
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
