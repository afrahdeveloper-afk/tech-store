"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2 } from "lucide-react";

import { useLanguage } from "@/components/providers/language-provider";
import { useToast } from "@/components/providers/toast-provider";
import {
  createServiceCategory,
  updateServiceCategory,
  type ServiceCategoryFormInput,
  type ServiceCategoryMutationErrorCode,
} from "@/app/admin/(dashboard)/service-categories/actions";
import { FormField } from "@/components/shared/form-field";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";

export interface ServiceCategoryFormValues {
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  icon: string;
}

const EMPTY_VALUES: ServiceCategoryFormValues = { name: "", nameAr: "", description: "", descriptionAr: "", icon: "" };

export function ServiceCategoryForm({
  categoryId,
  initialValues,
}: {
  categoryId?: string;
  initialValues?: ServiceCategoryFormValues;
}) {
  const { t } = useLanguage();
  const router = useRouter();
  const { toast } = useToast();

  const [values, setValues] = React.useState<ServiceCategoryFormValues>(initialValues ?? EMPTY_VALUES);
  const [fieldErrors, setFieldErrors] = React.useState<Partial<Record<"name" | "description", string>>>({});
  const [submitting, setSubmitting] = React.useState(false);

  const errorMessage: Record<ServiceCategoryMutationErrorCode, string> = {
    unauthorized: t.adminForm.errorUnauthorized,
    "missing-fields": t.adminForm.errorMissingFields,
    "invalid-length": t.adminForm.errorInvalidLength,
    "not-found": t.adminForm.errorNotFound,
    "server-error": t.adminForm.errorServer,
  };

  function set<K extends keyof ServiceCategoryFormValues>(key: K, value: ServiceCategoryFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const errors: Partial<Record<"name" | "description", string>> = {};
    if (!values.name.trim()) errors.name = t.adminForm.errorMissingFields;
    if (!values.description.trim()) errors.description = t.adminForm.errorMissingFields;
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setSubmitting(true);
    const input: ServiceCategoryFormInput = { ...values };
    const result = categoryId ? await updateServiceCategory(categoryId, input) : await createServiceCategory(input);
    setSubmitting(false);

    if (result.success) {
      toast({ title: categoryId ? t.adminForm.updateSuccessTitle : t.adminForm.createSuccessTitle, variant: "success" });
      router.push("/admin/service-categories");
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

      <FormField id="icon" label="Icon" value={values.icon} onChange={(value) => set("icon", value)} placeholder="Laptop" />
      <p className="-mt-3 text-xs text-muted-foreground">A lucide-react icon export name (see lib/icon-map.ts) — optional.</p>

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
          <Link href="/admin/service-categories">{t.adminForm.cancel}</Link>
        </Button>
      </div>
    </form>
  );
}
