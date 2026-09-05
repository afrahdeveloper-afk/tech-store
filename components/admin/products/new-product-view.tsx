"use client";

import type { Category, Subcategory } from "@/types";
import { useLanguage } from "@/components/providers/language-provider";
import { AdminFormPageHeader } from "@/components/admin/admin-form-page-header";
import { ProductForm } from "@/components/admin/products/product-form";

export function NewProductView({ categories, subcategories }: { categories: Category[]; subcategories: Subcategory[] }) {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col gap-6 p-4 pb-10 sm:p-6 lg:p-8">
      <AdminFormPageHeader backHref="/admin/products" title={t.adminProducts.formAddTitle} />
      <div className="max-w-3xl rounded-xl border border-border bg-card p-5 sm:p-6">
        <ProductForm categories={categories} subcategories={subcategories} />
      </div>
    </div>
  );
}
