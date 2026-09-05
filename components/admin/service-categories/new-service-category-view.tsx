"use client";

import { useLanguage } from "@/components/providers/language-provider";
import { AdminFormPageHeader } from "@/components/admin/admin-form-page-header";
import { ServiceCategoryForm } from "@/components/admin/service-categories/service-category-form";

export function NewServiceCategoryView() {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col gap-6 p-4 pb-10 sm:p-6 lg:p-8">
      <AdminFormPageHeader backHref="/admin/service-categories" title={t.adminServiceCategories.formAddTitle} />
      <div className="max-w-3xl rounded-xl border border-border bg-card p-5 sm:p-6">
        <ServiceCategoryForm />
      </div>
    </div>
  );
}
