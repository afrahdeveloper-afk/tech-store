"use client";

import type { ServiceCategory } from "@/types";
import type { AdminSubserviceDetail } from "@/lib/admin-data";
import { useLanguage } from "@/components/providers/language-provider";
import { AdminFormPageHeader } from "@/components/admin/admin-form-page-header";
import { SubserviceForm } from "@/components/admin/subservices/subservice-form";

export function EditSubserviceView({ subservice, categories }: { subservice: AdminSubserviceDetail; categories: ServiceCategory[] }) {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col gap-6 p-4 pb-10 sm:p-6 lg:p-8">
      <AdminFormPageHeader backHref="/admin/subservices" title={t.adminSubservices.formEditTitle} />
      <div className="max-w-3xl rounded-xl border border-border bg-card p-5 sm:p-6">
        <SubserviceForm
          subserviceId={subservice.id}
          categories={categories}
          initialValues={{
            name: subservice.name,
            nameAr: subservice.nameAr ?? "",
            description: subservice.description ?? "",
            descriptionAr: subservice.descriptionAr ?? "",
            serviceCategoryId: subservice.serviceCategoryId,
          }}
        />
      </div>
    </div>
  );
}
