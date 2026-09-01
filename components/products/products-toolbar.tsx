"use client";

import { Search, X } from "lucide-react";

import type { Category, Subcategory } from "@/types";
import type { Dictionary, Lang } from "@/lib/i18n/translations";
import type { ProductSort } from "@/lib/mock/fetch-products";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/typography";

/**
 * Search + category/subcategory filters + sort for `/products`. Purely
 * controlled — `ProductsExplorer` owns the actual filter state (synced to
 * the URL) so it can drive the query and the grid from one place.
 */
export function ProductsToolbar({
  t,
  lang,
  categories,
  subcategories,
  searchValue,
  onSearchChange,
  categoryValue,
  onCategoryChange,
  subcategoryValue,
  onSubcategoryChange,
  sortValue,
  onSortChange,
  hasActiveFilters,
  onClearFilters,
}: {
  t: Dictionary;
  lang: Lang;
  categories: Category[];
  subcategories: Subcategory[];
  searchValue: string;
  onSearchChange: (value: string) => void;
  categoryValue: string;
  onCategoryChange: (value: string) => void;
  subcategoryValue: string;
  onSubcategoryChange: (value: string) => void;
  sortValue: ProductSort;
  onSortChange: (value: ProductSort) => void;
  hasActiveFilters: boolean;
  onClearFilters: () => void;
}) {
  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-4 sm:p-5">
      <div className="relative">
        <label htmlFor="products-search" className="sr-only">
          {t.products.searchLabel}
        </label>
        <Search
          className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          id="products-search"
          type="search"
          value={searchValue}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder={t.products.searchPlaceholder}
          className="ps-9"
        />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="products-category">{t.products.categoryLabel}</Label>
          <Select
            id="products-category"
            value={categoryValue}
            onChange={(event) => onCategoryChange(event.target.value)}
          >
            <option value="">{t.products.allCategories}</option>
            {categories.map((category) => (
              <option key={category.id} value={category.slug}>
                {lang === "ar" ? category.nameAr ?? category.name : category.name}
              </option>
            ))}
          </Select>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="products-subcategory">{t.products.subcategoryLabel}</Label>
          <Select
            id="products-subcategory"
            value={subcategoryValue}
            onChange={(event) => onSubcategoryChange(event.target.value)}
            disabled={subcategories.length === 0}
          >
            <option value="">{t.products.allSubcategories}</option>
            {subcategories.map((subcategory) => (
              <option key={subcategory.id} value={subcategory.slug}>
                {lang === "ar" ? subcategory.nameAr ?? subcategory.name : subcategory.name}
              </option>
            ))}
          </Select>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="products-sort">{t.products.sortLabel}</Label>
          <Select
            id="products-sort"
            value={sortValue}
            onChange={(event) => onSortChange(event.target.value as ProductSort)}
          >
            <option value="featured">{t.products.sortFeatured}</option>
            <option value="price-asc">{t.products.sortPriceAsc}</option>
            <option value="price-desc">{t.products.sortPriceDesc}</option>
            <option value="name-asc">{t.products.sortNameAsc}</option>
          </Select>
        </div>

        <div className="flex items-end">
          <Button
            variant="ghost"
            onClick={onClearFilters}
            disabled={!hasActiveFilters}
            className="w-full sm:w-auto"
          >
            <X data-icon="inline-start" aria-hidden="true" />
            {t.products.clearFilters}
          </Button>
        </div>
      </div>
    </div>
  );
}
