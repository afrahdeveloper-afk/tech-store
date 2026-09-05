"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2 } from "lucide-react";

import type { ServiceCategory, Subservice } from "@/types";
import type { ServiceStatus } from "@/lib/generated/prisma/enums";
import { useLanguage } from "@/components/providers/language-provider";
import { useToast } from "@/components/providers/toast-provider";
import { createService, updateService, type ServiceFormInput, type ServiceMutationErrorCode } from "@/app/admin/(dashboard)/services/actions";
import { FormField } from "@/components/shared/form-field";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";

export interface ServiceFormValues {
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  price: string;
  durationMinutes: string;
  status: ServiceStatus;
  subserviceId: string;
}

const EMPTY_VALUES: ServiceFormValues = {
  name: "",
  nameAr: "",
  description: "",
  descriptionAr: "",
  price: "",
  durationMinutes: "",
  status: "ACTIVE",
  subserviceId: "",
};

export function ServiceForm({
  serviceId,
  initialValues,
  categories,
  subservices,
}: {
  serviceId?: string;
  initialValues?: ServiceFormValues;
  categories: ServiceCategory[];
  subservices: Subservice[];
}) {
  const { t } = useLanguage();
  const router = useRouter();
  const { toast } = useToast();

  const [values, setValues] = React.useState<ServiceFormValues>(initialValues ?? EMPTY_VALUES);
  const [fieldErrors, setFieldErrors] = React.useState<Partial<Record<"name" | "description" | "subserviceId" | "price" | "durationMinutes", string>>>({});
  const [submitting, setSubmitting] = React.useState(false);

  const errorMessage: Record<ServiceMutationErrorCode, string> = {
    unauthorized: t.adminForm.errorUnauthorized,
    "missing-fields": t.adminForm.errorMissingFields,
    "invalid-length": t.adminForm.errorInvalidLength,
    "invalid-price": t.adminForm.errorInvalidPrice,
    "invalid-duration": t.adminForm.errorInvalidStock,
    "invalid-subservice": t.adminForm.errorInvalidSubcategory,
    "not-found": t.adminForm.errorNotFound,
    "server-error": t.adminForm.errorServer,
  };

  function set<K extends keyof ServiceFormValues>(key: K, value: ServiceFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const errors: typeof fieldErrors = {};
    if (!values.name.trim()) errors.name = t.adminForm.errorMissingFields;
    if (!values.description.trim()) errors.description = t.adminForm.errorMissingFields;
    if (!values.subserviceId) errors.subserviceId = t.adminForm.errorInvalidSubcategory;
    if (values.price.trim()) {
      const price = Number(values.price);
      if (!Number.isFinite(price) || price <= 0) errors.price = t.adminForm.errorInvalidPrice;
    }
    if (values.durationMinutes.trim()) {
      const duration = Number(values.durationMinutes);
      if (!Number.isInteger(duration) || duration <= 0) errors.durationMinutes = t.adminForm.errorInvalidStock;
    }
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setSubmitting(true);
    const input: ServiceFormInput = { ...values };
    const result = serviceId ? await updateService(serviceId, input) : await createService(input);
    setSubmitting(false);

    if (result.success) {
      toast({ title: serviceId ? t.adminForm.updateSuccessTitle : t.adminForm.createSuccessTitle, variant: "success" });
      router.push("/admin/services");
      router.refresh();
    } else {
      toast({ title: t.adminForm.mutationErrorTitle, description: errorMessage[result.error], variant: "error" });
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField id="name" label={`${t.adminForm.nameLabel} *`} value={values.name} onChange={(value) => set("name", value)} error={fieldErrors.name} />
        <FormField id="nameAr" label={t.adminForm.nameArLabel} value={values.nameAr} onChange={(value) => set("nameAr", value)} dir="rtl" />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="description">{t.adminForm.descriptionLabel} *</Label>
          <Textarea id="description" value={values.description} onChange={(event) => set("description", event.target.value)} aria-invalid={Boolean(fieldErrors.description)} />
          {fieldErrors.description ? (
            <p role="alert" className="motion-safe:animate-in motion-safe:fade-in motion-safe:duration-150 text-xs text-destructive">
              {fieldErrors.description}
            </p>
          ) : null}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="descriptionAr">{t.adminForm.descriptionArLabel}</Label>
          <Textarea id="descriptionAr" dir="rtl" value={values.descriptionAr} onChange={(event) => set("descriptionAr", event.target.value)} />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="subserviceId">{t.adminSubservices.heading} *</Label>
        <Select id="subserviceId" value={values.subserviceId} onChange={(event) => set("subserviceId", event.target.value)} aria-invalid={Boolean(fieldErrors.subserviceId)}>
          <option value="">{t.adminForm.subcategoryPlaceholder}</option>
          {categories.map((category) => {
            const groupSubservices = subservices.filter((subservice) => subservice.serviceCategoryId === category.id);
            if (groupSubservices.length === 0) return null;
            return (
              <optgroup key={category.id} label={category.name}>
                {groupSubservices.map((subservice) => (
                  <option key={subservice.id} value={subservice.id}>
                    {subservice.name}
                  </option>
                ))}
              </optgroup>
            );
          })}
        </Select>
        {fieldErrors.subserviceId ? (
          <p role="alert" className="motion-safe:animate-in motion-safe:fade-in motion-safe:duration-150 text-xs text-destructive">
            {fieldErrors.subserviceId}
          </p>
        ) : null}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <FormField id="price" label={t.adminForm.priceLabel} type="number" min="0" value={values.price} onChange={(value) => set("price", value)} error={fieldErrors.price} />
        <FormField
          id="durationMinutes"
          label={t.adminForm.durationMinutesLabel}
          type="number"
          min="0"
          value={values.durationMinutes}
          onChange={(value) => set("durationMinutes", value)}
          error={fieldErrors.durationMinutes}
        />
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="status">{t.adminForm.statusLabel}</Label>
          <Select id="status" value={values.status} onChange={(event) => set("status", event.target.value as ServiceStatus)}>
            <option value="ACTIVE">{t.adminServices.statusActive}</option>
            <option value="INACTIVE">{t.adminServices.statusInactive}</option>
          </Select>
        </div>
      </div>

      <div className="flex items-center gap-3 border-t border-border pt-5">
        <Button type="submit" disabled={submitting}>
          {submitting ? (
            <>
              <Loader2 data-icon="inline-start" className="animate-spin" aria-hidden="true" />
              {t.adminForm.saving}
            </>
          ) : (
            t.adminForm.save
          )}
        </Button>
        <Button asChild variant="outline" type="button">
          <Link href="/admin/services">{t.adminForm.cancel}</Link>
        </Button>
      </div>
    </form>
  );
}
