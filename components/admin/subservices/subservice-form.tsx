"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2 } from "lucide-react";

import type { ServiceCategory } from "@/types";
import { useLanguage } from "@/components/providers/language-provider";
import { useToast } from "@/components/providers/toast-provider";
import {
  createSubservice,
  updateSubservice,
  type SubserviceFormInput,
  type SubserviceMutationErrorCode,
} from "@/app/admin/(dashboard)/subservices/actions";
import { FormField } from "@/components/shared/form-field";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";

export interface SubserviceFormValues {
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  serviceCategoryId: string;
}

const EMPTY_VALUES: SubserviceFormValues = { name: "", nameAr: "", description: "", descriptionAr: "", serviceCategoryId: "" };

export function SubserviceForm({
  subserviceId,
  initialValues,
  categories,
}: {
  subserviceId?: string;
  initialValues?: SubserviceFormValues;
  categories: ServiceCategory[];
}) {
  const { t } = useLanguage();
  const router = useRouter();
  const { toast } = useToast();

  const [values, setValues] = React.useState<SubserviceFormValues>(initialValues ?? EMPTY_VALUES);
  const [fieldErrors, setFieldErrors] = React.useState<Partial<Record<"name" | "serviceCategoryId", string>>>({});
  const [submitting, setSubmitting] = React.useState(false);

  const errorMessage: Record<SubserviceMutationErrorCode, string> = {
    unauthorized: t.adminForm.errorUnauthorized,
    "missing-fields": t.adminForm.errorMissingFields,
    "invalid-length": t.adminForm.errorInvalidLength,
    "invalid-category": t.adminForm.errorInvalidCategory,
    "not-found": t.adminForm.errorNotFound,
    "server-error": t.adminForm.errorServer,
  };

  function set<K extends keyof SubserviceFormValues>(key: K, value: SubserviceFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const errors: Partial<Record<"name" | "serviceCategoryId", string>> = {};
    if (!values.name.trim()) errors.name = t.adminForm.errorMissingFields;
    if (!values.serviceCategoryId) errors.serviceCategoryId = t.adminForm.errorInvalidCategory;
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setSubmitting(true);
    const input: SubserviceFormInput = { ...values };
    const result = subserviceId ? await updateSubservice(subserviceId, input) : await createSubservice(input);
    setSubmitting(false);

    if (result.success) {
      toast({ title: subserviceId ? t.adminForm.updateSuccessTitle : t.adminForm.createSuccessTitle, variant: "success" });
      router.push("/admin/subservices");
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

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="serviceCategoryId">{t.adminForm.categoryLabel} *</Label>
        <Select
          id="serviceCategoryId"
          value={values.serviceCategoryId}
          onChange={(event) => set("serviceCategoryId", event.target.value)}
          aria-invalid={Boolean(fieldErrors.serviceCategoryId)}
        >
          <option value="">{t.adminForm.categoryPlaceholder}</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </Select>
        {fieldErrors.serviceCategoryId ? (
          <p role="alert" className="motion-safe:animate-in motion-safe:fade-in motion-safe:duration-150 text-xs text-destructive">
            {fieldErrors.serviceCategoryId}
          </p>
        ) : null}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="description">{t.adminForm.descriptionLabel}</Label>
          <Textarea id="description" value={values.description} onChange={(event) => set("description", event.target.value)} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="descriptionAr">{t.adminForm.descriptionArLabel}</Label>
          <Textarea id="descriptionAr" dir="rtl" value={values.descriptionAr} onChange={(event) => set("descriptionAr", event.target.value)} />
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
          <Link href="/admin/subservices">{t.adminForm.cancel}</Link>
        </Button>
      </div>
    </form>
  );
}
