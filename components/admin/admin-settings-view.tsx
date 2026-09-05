"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { KeyRound, Loader2, Settings2 } from "lucide-react";

import type { StoreSettingsData } from "@/lib/settings-data";
import {
  updateStoreSettings,
  type StoreSettingsFormInput,
  type StoreSettingsMutationErrorCode,
  updateAdminPassword,
  type AdminPasswordFormInput,
  type AdminPasswordMutationErrorCode,
} from "@/app/admin/(dashboard)/settings/actions";
import { useLanguage } from "@/components/providers/language-provider";
import { useToast } from "@/components/providers/toast-provider";
import { FormField } from "@/components/shared/form-field";
import { Label, Small } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";

export function AdminSettingsView({ admin, settings }: { admin: { name: string; email: string }; settings: StoreSettingsData }) {
  const { t, lang } = useLanguage();
  const router = useRouter();
  const { toast } = useToast();
  const locale = lang === "ar" ? "ar-SA" : "en-US";
  const dateFormatter = new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" });

  const [values, setValues] = React.useState<StoreSettingsFormInput>({
    storeName: settings.storeName,
    storeNameAr: settings.storeNameAr ?? "",
    contactEmail: settings.contactEmail,
    contactPhone: settings.contactPhone,
    contactAddress: settings.contactAddress ?? "",
    contactAddressAr: settings.contactAddressAr ?? "",
    currency: settings.currency,
    maintenanceMode: settings.maintenanceMode,
  });
  const [fieldErrors, setFieldErrors] = React.useState<Partial<Record<"storeName" | "contactEmail" | "contactPhone" | "currency", string>>>({});
  const [submitting, setSubmitting] = React.useState(false);

  const errorMessage: Record<StoreSettingsMutationErrorCode, string> = {
    unauthorized: t.adminForm.errorUnauthorized,
    "missing-fields": t.adminForm.errorMissingFields,
    "invalid-length": t.adminForm.errorInvalidLength,
    "invalid-email": t.adminForm.errorInvalidEmail,
    "invalid-phone": t.adminForm.errorInvalidPhone,
    "server-error": t.adminForm.errorServer,
  };

  function set<K extends keyof StoreSettingsFormInput>(key: K, value: StoreSettingsFormInput[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const errors: typeof fieldErrors = {};
    if (!values.storeName.trim()) errors.storeName = t.adminForm.errorMissingFields;
    if (!values.contactEmail.trim()) errors.contactEmail = t.adminForm.errorMissingFields;
    if (!values.contactPhone.trim()) errors.contactPhone = t.adminForm.errorMissingFields;
    if (!values.currency.trim()) errors.currency = t.adminForm.errorMissingFields;
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setSubmitting(true);
    const result = await updateStoreSettings(values);
    setSubmitting(false);

    if (result.success) {
      toast({ title: t.adminSettings.saveSuccessTitle, variant: "success" });
      router.refresh();
    } else {
      toast({ title: t.adminForm.mutationErrorTitle, description: errorMessage[result.error], variant: "error" });
    }
  }

  // --- Change Password (separate form/state — a distinct mutation from Store Settings above) ---
  const [passwordValues, setPasswordValues] = React.useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [passwordFieldErrors, setPasswordFieldErrors] = React.useState<Partial<Record<"currentPassword" | "newPassword" | "confirmPassword", string>>>({});
  const [passwordSubmitting, setPasswordSubmitting] = React.useState(false);

  const passwordErrorMessage: Record<AdminPasswordMutationErrorCode, string> = {
    unauthorized: t.adminForm.errorUnauthorized,
    "missing-fields": t.adminForm.errorMissingFields,
    "invalid-length": t.adminForm.errorInvalidLength,
    "weak-password": t.auth.errorWeakPassword,
    "incorrect-current-password": t.adminSettings.errorIncorrectCurrentPassword,
    "server-error": t.adminForm.errorServer,
  };

  async function handlePasswordSubmit(event: React.FormEvent) {
    event.preventDefault();
    const errors: typeof passwordFieldErrors = {};
    if (!passwordValues.currentPassword) errors.currentPassword = t.adminForm.errorMissingFields;
    if (!passwordValues.newPassword) errors.newPassword = t.adminForm.errorMissingFields;
    else if (passwordValues.newPassword.length < 8) errors.newPassword = t.auth.errorWeakPassword;
    if (passwordValues.newPassword && passwordValues.confirmPassword !== passwordValues.newPassword) {
      errors.confirmPassword = t.adminSettings.errorPasswordMismatch;
    }
    setPasswordFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    const input: AdminPasswordFormInput = { currentPassword: passwordValues.currentPassword, newPassword: passwordValues.newPassword };
    setPasswordSubmitting(true);
    const result = await updateAdminPassword(input);
    setPasswordSubmitting(false);

    if (result.success) {
      toast({ title: t.adminSettings.changePasswordSuccessTitle, variant: "success" });
      setPasswordValues({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setPasswordFieldErrors({});
    } else {
      toast({ title: t.adminForm.mutationErrorTitle, description: passwordErrorMessage[result.error], variant: "error" });
    }
  }

  return (
    <div className="flex flex-col gap-6 p-4 pb-10 sm:p-6 lg:p-8">
      <div className="flex flex-col gap-2">
        <h1 className="font-display text-2xl font-semibold text-foreground sm:text-3xl">{t.adminSettings.heading}</h1>
        <p className="text-sm text-muted-foreground">{t.adminSettings.description}</p>
      </div>

      <section className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5">
        <div>
          <h2 className="text-base font-semibold text-foreground">{t.adminSettings.profileHeading}</h2>
          <Small className="text-muted-foreground">{t.adminSettings.profileDescription}</Small>
        </div>
        <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1">
            <dt className="text-xs font-medium text-muted-foreground">{t.adminSettings.nameLabel}</dt>
            <dd className="text-sm text-foreground">{admin.name}</dd>
          </div>
          <div className="flex flex-col gap-1">
            <dt className="text-xs font-medium text-muted-foreground">{t.adminSettings.emailLabel}</dt>
            <dd className="text-sm text-foreground">{admin.email}</dd>
          </div>
        </dl>
      </section>

      <section className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="flex items-start gap-2.5">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-primary">
              <Settings2 className="size-4.5" aria-hidden="true" />
            </span>
            <div>
              <h2 className="text-base font-semibold text-foreground">{t.adminSettings.storeHeading}</h2>
              <Small className="text-muted-foreground">{t.adminSettings.storeDescription}</Small>
            </div>
          </div>
          <Small className="text-muted-foreground">
            {t.adminSettings.lastUpdatedLabel}: {dateFormatter.format(settings.updatedAt)}
          </Small>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField
              id="storeName"
              label={`${t.adminSettings.storeNameLabel} *`}
              value={values.storeName}
              onChange={(value) => set("storeName", value)}
              error={fieldErrors.storeName}
            />
            <FormField id="storeNameAr" label={t.adminSettings.storeNameArLabel} value={values.storeNameAr} onChange={(value) => set("storeNameAr", value)} dir="rtl" />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField
              id="contactEmail"
              label={`${t.adminSettings.contactEmailLabel} *`}
              type="email"
              value={values.contactEmail}
              onChange={(value) => set("contactEmail", value)}
              error={fieldErrors.contactEmail}
              dir="ltr"
            />
            <FormField
              id="contactPhone"
              label={`${t.adminSettings.contactPhoneLabel} *`}
              type="tel"
              value={values.contactPhone}
              onChange={(value) => set("contactPhone", value)}
              error={fieldErrors.contactPhone}
              dir="ltr"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField id="contactAddress" label={t.adminSettings.contactAddressLabel} value={values.contactAddress} onChange={(value) => set("contactAddress", value)} />
            <FormField
              id="contactAddressAr"
              label={t.adminSettings.contactAddressArLabel}
              value={values.contactAddressAr}
              onChange={(value) => set("contactAddressAr", value)}
              dir="rtl"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:items-end">
            <FormField
              id="currency"
              label={`${t.adminSettings.currencyLabel} *`}
              value={values.currency}
              onChange={(value) => set("currency", value.toUpperCase())}
              error={fieldErrors.currency}
              dir="ltr"
            />
            <label htmlFor="maintenanceMode" className="flex items-center gap-2.5 pb-1.5">
              <input
                id="maintenanceMode"
                type="checkbox"
                checked={values.maintenanceMode}
                onChange={(event) => set("maintenanceMode", event.target.checked)}
                className="size-4 rounded border-border accent-primary"
              />
              <span className="flex flex-col">
                <Label htmlFor="maintenanceMode" className="cursor-pointer">
                  {t.adminSettings.maintenanceModeLabel}
                </Label>
                <Small className="text-muted-foreground">{t.adminSettings.maintenanceModeHint}</Small>
              </span>
            </label>
          </div>

          <div className="border-t border-border pt-5">
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
          </div>
        </form>
      </section>

      <section className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5">
        <div className="flex items-start gap-2.5">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-primary">
            <KeyRound className="size-4.5" aria-hidden="true" />
          </span>
          <div>
            <h2 className="text-base font-semibold text-foreground">{t.adminSettings.changePasswordHeading}</h2>
            <Small className="text-muted-foreground">{t.adminSettings.changePasswordDescription}</Small>
          </div>
        </div>

        <form onSubmit={handlePasswordSubmit} className="flex flex-col gap-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <FormField
              id="currentPassword"
              label={t.adminSettings.currentPasswordLabel}
              type="password"
              autoComplete="current-password"
              value={passwordValues.currentPassword}
              onChange={(value) => setPasswordValues((prev) => ({ ...prev, currentPassword: value }))}
              error={passwordFieldErrors.currentPassword}
              dir="ltr"
            />
            <FormField
              id="newPassword"
              label={t.adminSettings.newPasswordLabel}
              type="password"
              autoComplete="new-password"
              value={passwordValues.newPassword}
              onChange={(value) => setPasswordValues((prev) => ({ ...prev, newPassword: value }))}
              error={passwordFieldErrors.newPassword}
              dir="ltr"
            />
            <FormField
              id="confirmPassword"
              label={t.adminSettings.confirmPasswordLabel}
              type="password"
              autoComplete="new-password"
              value={passwordValues.confirmPassword}
              onChange={(value) => setPasswordValues((prev) => ({ ...prev, confirmPassword: value }))}
              error={passwordFieldErrors.confirmPassword}
              dir="ltr"
            />
          </div>

          <div className="border-t border-border pt-5">
            <Button type="submit" disabled={passwordSubmitting}>
              {passwordSubmitting ? (
                <>
                  <Loader2 data-icon="inline-start" className="animate-spin" aria-hidden="true" />
                  {t.adminForm.saving}
                </>
              ) : (
                t.adminSettings.changePasswordButton
              )}
            </Button>
          </div>
        </form>
      </section>
    </div>
  );
}
