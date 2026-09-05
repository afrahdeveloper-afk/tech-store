"use client";

import type { Category, Subcategory } from "@/types";
import type { AdminProductDetail } from "@/lib/admin-data";
import { useLanguage } from "@/components/providers/language-provider";
import { AdminFormPageHeader } from "@/components/admin/admin-form-page-header";
import { ProductForm, type ProductFormValues } from "@/components/admin/products/product-form";
import { ProductImageManager } from "@/components/admin/products/product-image-manager";

function toFormValues(product: AdminProductDetail): ProductFormValues {
  return {
    name: product.name,
    nameAr: product.nameAr ?? "",
    description: product.description,
    descriptionAr: product.descriptionAr ?? "",
    price: String(product.price),
    discountPrice: product.discountPrice !== null ? String(product.discountPrice) : "",
    stockQuantity: String(product.stockQuantity),
    status: product.status,
    categoryId: product.categoryId,
    subcategoryId: product.subcategoryId ?? "",
  };
}

export function EditProductView({
  product,
  categories,
  subcategories,
}: {
  product: AdminProductDetail;
  categories: Category[];
  subcategories: Subcategory[];
}) {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col gap-6 p-4 pb-10 sm:p-6 lg:p-8">
      <AdminFormPageHeader backHref="/admin/products" title={t.adminProducts.formEditTitle} />
      <div className="max-w-3xl rounded-xl border border-border bg-card p-5 sm:p-6">
        <ProductImageManager productId={product.id} initialImages={product.images} />
      </div>
      <div className="max-w-3xl rounded-xl border border-border bg-card p-5 sm:p-6">
        <ProductForm productId={product.id} initialValues={toFormValues(product)} categories={categories} subcategories={subcategories} />
      </div>
    </div>
  );
}
