"use client";

import type { ServiceCategory, Subservice } from "@/types";
import type { AdminServiceDetail } from "@/lib/admin-data";
import { useLanguage } from "@/components/providers/language-provider";
import { AdminFormPageHeader } from "@/components/admin/admin-form-page-header";
import { ServiceForm } from "@/components/admin/services/service-form";

export function EditServiceView({
  service,
  categories,
  subservices,
}: {
  service: AdminServiceDetail;
  categories: ServiceCategory[];
  subservices: Subservice[];
}) {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col gap-6 p-4 pb-10 sm:p-6 lg:p-8">
      <AdminFormPageHeader backHref="/admin/services" title={t.adminServices.formEditTitle} />
      <div className="max-w-3xl rounded-xl border border-border bg-card p-5 sm:p-6">
        <ServiceForm
          serviceId={service.id}
          categories={categories}
          subservices={subservices}
          initialValues={{
            name: service.name,
            nameAr: service.nameAr ?? "",
            description: service.description,
            descriptionAr: service.descriptionAr ?? "",
            price: service.price !== null ? String(service.price) : "",
            durationMinutes: service.durationMinutes !== null ? String(service.durationMinutes) : "",
            status: service.status,
            subserviceId: service.subserviceId,
          }}
        />
      </div>
    </div>
  );
}
