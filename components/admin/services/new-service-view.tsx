"use client";

import type { ServiceCategory, Subservice } from "@/types";
import { useLanguage } from "@/components/providers/language-provider";
import { AdminFormPageHeader } from "@/components/admin/admin-form-page-header";
import { ServiceForm } from "@/components/admin/services/service-form";

export function NewServiceView({ categories, subservices }: { categories: ServiceCategory[]; subservices: Subservice[] }) {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col gap-6 p-4 pb-10 sm:p-6 lg:p-8">
      <AdminFormPageHeader backHref="/admin/services" title={t.adminServices.formAddTitle} />
      <div className="max-w-3xl rounded-xl border border-border bg-card p-5 sm:p-6">
        <ServiceForm categories={categories} subservices={subservices} />
      </div>
    </div>
  );
}
