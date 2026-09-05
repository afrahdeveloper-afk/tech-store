"use client";

import Image from "next/image";
import Link from "next/link";
import { Package, X } from "lucide-react";

import type { AdminProductQuery, AdminProductRow, PagedResult } from "@/lib/admin-data";
import type { Category } from "@/types";
import { deleteProduct } from "@/app/admin/(dashboard)/products/actions";
import { useAdminListParams } from "@/lib/hooks/use-admin-list-params";
import { useLanguage } from "@/components/providers/language-provider";
import { AdminListHeader } from "@/components/admin/admin-list-header";
import { AdminSearchBox } from "@/components/admin/list/admin-search-box";
import { RowActions } from "@/components/admin/row-actions";
import { EmptyState } from "@/components/shared/empty-state";
import { ImagePlaceholder } from "@/components/shared/image-placeholder";
import { Pagination } from "@/components/products/pagination";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

const STATUS_VARIANT = {
  DRAFT: "neutral",
  ACTIVE: "success",
  ARCHIVED: "neutral",
} as const;

export function AdminProductsList({
  result,
  categories,
  query,
}: {
  result: PagedResult<AdminProductRow>;
  categories: Category[];
  query: AdminProductQuery;
}) {
  const { t, lang } = useLanguage();
  const locale = lang === "ar" ? "ar-SA" : "en-US";
  const { updateParams, buildPageHref } = useAdminListParams();
  const statusLabel = { DRAFT: t.adminProducts.statusDraft, ACTIVE: t.adminProducts.statusActive, ARCHIVED: t.adminProducts.statusArchived };

  const hasActiveFilters = Boolean(query.search || query.status || query.categoryId || query.sort !== "newest");
  const countLabel = (result.total === 1 ? t.adminCommon.resultsCountOne : t.adminCommon.resultsCountOther).replace(
    "{count}",
    result.total.toLocaleString(locale)
  );

  return (
    <div className="flex flex-col gap-4 pb-8">
      <AdminListHeader
        heading={t.adminProducts.heading}
        description={t.adminProducts.description}
        count={countLabel}
        addNew={{ href: "/admin/products/new", label: t.adminForm.addNew }}
      />

      <div className="flex flex-col gap-2 px-4 sm:flex-row sm:flex-wrap sm:items-center sm:px-6 lg:px-8">
        <AdminSearchBox
          value={query.search}
          onCommit={(value) => updateParams({ q: value || null })}
          placeholder={t.adminProducts.searchPlaceholder}
          label={t.adminCommon.searchLabel}
        />
        <Select
          aria-label={t.adminProducts.statusFilterLabel}
          value={query.status}
          onChange={(event) => updateParams({ status: event.target.value || null })}
          className="w-full sm:w-auto"
        >
          <option value="">{t.adminCommon.allLabel}</option>
          <option value="DRAFT">{t.adminProducts.statusDraft}</option>
          <option value="ACTIVE">{t.adminProducts.statusActive}</option>
          <option value="ARCHIVED">{t.adminProducts.statusArchived}</option>
        </Select>
        <Select
          aria-label={t.adminForm.categoryLabel}
          value={query.categoryId}
          onChange={(event) => updateParams({ category: event.target.value || null })}
          className="w-full sm:w-auto"
        >
          <option value="">{t.adminCommon.allLabel}</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
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
          <option value="price-asc">{t.adminProducts.sortPriceAsc}</option>
          <option value="price-desc">{t.adminProducts.sortPriceDesc}</option>
        </Select>
        {hasActiveFilters ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="w-full justify-center motion-safe:animate-in motion-safe:fade-in motion-safe:duration-150 sm:w-auto"
            onClick={() => updateParams({ q: null, status: null, category: null, sort: null })}
          >
            <X className="size-3.5" aria-hidden="true" />
            {t.products.clearFilters}
          </Button>
        ) : null}
      </div>

      <div className="px-4 sm:px-6 lg:px-8">
        {result.items.length === 0 ? (
          <EmptyState icon={Package} title={t.adminProducts.emptyTitle} description={t.adminProducts.emptyDescription} />
        ) : (
          <>
            {/* Mobile/tablet (<md): one card per product — the dense table
                below md is genuinely unreadable shrunk to a phone width, so
                this is a different layout, not a scroll fallback. */}
            <div className="flex flex-col gap-3 md:hidden">
              {result.items.map((product) => (
                <div key={product.id} className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4">
                  <div className="flex items-start gap-3">
                    <span className="relative flex size-14 shrink-0 overflow-hidden rounded-md bg-muted">
                      {product.image ? (
                        <Image src={product.image} alt="" fill sizes="56px" className="object-contain p-1.5" />
                      ) : (
                        <ImagePlaceholder iconClassName="size-4" />
                      )}
                    </span>
                    <div className="flex min-w-0 flex-1 flex-col gap-1">
                      <Link
                        href={`/admin/products/${product.id}/edit`}
                        className="truncate rounded-sm font-medium text-foreground transition-colors hover:text-primary hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                      >
                        {lang === "ar" ? (product.nameAr ?? product.name) : product.name}
                      </Link>
                      <span className="truncate text-xs text-muted-foreground">
                        {lang === "ar" ? (product.categoryNameAr ?? product.categoryName) : product.categoryName}
                      </span>
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 pt-0.5">
                        <Badge variant={STATUS_VARIANT[product.status]}>{statusLabel[product.status]}</Badge>
                        <span className="text-xs text-muted-foreground">
                          {t.adminProducts.columnStock}: {product.stockQuantity.toLocaleString(locale)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-3 border-t border-border pt-3">
                    <span className="font-mono text-sm text-foreground">
                      {product.discountPrice ? (
                        <span className="flex flex-col">
                          <span>
                            {product.discountPrice.toLocaleString(locale)} {product.currency}
                          </span>
                          <span className="text-xs text-muted-foreground line-through">{product.price.toLocaleString(locale)}</span>
                        </span>
                      ) : (
                        <span>
                          {product.price.toLocaleString(locale)} {product.currency}
                        </span>
                      )}
                    </span>
                    <RowActions
                      editHref={`/admin/products/${product.id}/edit`}
                      editLabel={t.adminProducts.rowEdit}
                      deleteLabel={t.adminProducts.rowDelete}
                      confirmTitle={t.adminForm.deleteConfirmTitle}
                      confirmDescription={t.adminForm.deleteConfirmDescription}
                      successTitle={t.adminForm.deleteSuccessTitle}
                      onDelete={async () => {
                        const deleteResult = await deleteProduct(product.id);
                        if (deleteResult.success) return deleteResult;
                        return {
                          success: false,
                          error: deleteResult.error === "not-found" ? t.adminForm.errorNotFound : t.adminForm.errorServer,
                        };
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="hidden overflow-x-auto rounded-xl border border-border bg-card md:block">
              <table className="w-full min-w-[720px] border-collapse text-sm">
                <thead>
                  <tr className="border-b border-border text-start text-xs font-medium text-muted-foreground">
                    <th className="px-4 py-3 text-start font-medium">{t.adminProducts.columnProduct}</th>
                    <th className="px-4 py-3 text-start font-medium">{t.adminProducts.columnCategory}</th>
                    <th className="px-4 py-3 text-start font-medium">{t.adminProducts.columnPrice}</th>
                    <th className="px-4 py-3 text-start font-medium">{t.adminProducts.columnStock}</th>
                    <th className="px-4 py-3 text-start font-medium">{t.adminCommon.columnStatus}</th>
                    <th className="px-4 py-3 text-end font-medium">{t.adminCommon.columnActions}</th>
                  </tr>
                </thead>
                <tbody>
                  {result.items.map((product) => (
                    <tr key={product.id} className="border-b border-border transition-colors last:border-0 hover:bg-muted/40">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <span className="relative flex size-10 shrink-0 overflow-hidden rounded-md bg-muted">
                            {product.image ? (
                              <Image src={product.image} alt="" fill sizes="40px" className="object-contain p-1" />
                            ) : (
                              <ImagePlaceholder iconClassName="size-3.5" />
                            )}
                          </span>
                          <Link
                            href={`/admin/products/${product.id}/edit`}
                            className="max-w-[220px] truncate rounded-sm font-medium text-foreground transition-colors hover:text-primary hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                          >
                            {lang === "ar" ? (product.nameAr ?? product.name) : product.name}
                          </Link>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {lang === "ar" ? (product.categoryNameAr ?? product.categoryName) : product.categoryName}
                      </td>
                      <td className="px-4 py-3 font-mono text-foreground">
                        {product.discountPrice ? (
                          <span className="flex flex-col">
                            <span>
                              {product.discountPrice.toLocaleString(locale)} {product.currency}
                            </span>
                            <span className="text-xs text-muted-foreground line-through">
                              {product.price.toLocaleString(locale)}
                            </span>
                          </span>
                        ) : (
                          <span>
                            {product.price.toLocaleString(locale)} {product.currency}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{product.stockQuantity.toLocaleString(locale)}</td>
                      <td className="px-4 py-3">
                        <Badge variant={STATUS_VARIANT[product.status]}>{statusLabel[product.status]}</Badge>
                      </td>
                      <td className="px-4 py-3">
                        <RowActions
                          editHref={`/admin/products/${product.id}/edit`}
                          editLabel={t.adminProducts.rowEdit}
                          deleteLabel={t.adminProducts.rowDelete}
                          confirmTitle={t.adminForm.deleteConfirmTitle}
                          confirmDescription={t.adminForm.deleteConfirmDescription}
                          successTitle={t.adminForm.deleteSuccessTitle}
                          onDelete={async () => {
                            const deleteResult = await deleteProduct(product.id);
                            if (deleteResult.success) return deleteResult;
                            return {
                              success: false,
                              error: deleteResult.error === "not-found" ? t.adminForm.errorNotFound : t.adminForm.errorServer,
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
