"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertTriangle, Loader2 } from "lucide-react";

import { useLanguage } from "@/components/providers/language-provider";
import { isValidEmail, isValidPhone } from "@/lib/validation";
import { register, type RegisterErrorCode } from "@/app/register/actions";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Caption, Display, Body } from "@/components/ui/typography";
import { FormField } from "@/components/shared/form-field";

interface FieldErrors {
  name?: string;
  email?: string;
  phone?: string;
  password?: string;
}

const MIN_PASSWORD_LENGTH = 8;

/** `/register`'s content — same shape as `LoginView`. */
export function RegisterView() {
  const { t } = useLanguage();
  const router = useRouter();

  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [fieldErrors, setFieldErrors] = React.useState<FieldErrors>({});
  const [status, setStatus] = React.useState<"idle" | "submitting" | "error">("idle");
  const [errorCode, setErrorCode] = React.useState<RegisterErrorCode | null>(null);

  const errorMessage: Record<RegisterErrorCode, string> = {
    "missing-fields": t.auth.errorRequired,
    "invalid-email": t.auth.errorEmail,
    "invalid-phone": t.auth.errorPhone,
    "weak-password": t.auth.errorWeakPassword,
    "email-taken": t.auth.errorEmailTaken,
    "server-error": t.auth.errorServer,
  };

  const validate = (): FieldErrors => {
    const errors: FieldErrors = {};
    if (!name.trim()) errors.name = t.auth.errorRequired;
    if (!email.trim()) errors.email = t.auth.errorRequired;
    else if (!isValidEmail(email)) errors.email = t.auth.errorEmail;
    if (!phone.trim()) errors.phone = t.auth.errorRequired;
    else if (!isValidPhone(phone)) errors.phone = t.auth.errorPhone;
    if (!password) errors.password = t.auth.errorRequired;
    else if (password.length < MIN_PASSWORD_LENGTH) errors.password = t.auth.errorWeakPassword;
    return errors;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const errors = validate();
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setStatus("submitting");
    setErrorCode(null);
    const result = await register({ name, email, phone, password });

    if (result.success) {
      router.push("/account");
      router.refresh();
    } else {
      setErrorCode(result.error);
      setStatus("error");
    }
  };

  return (
    <Container className="flex flex-col items-center gap-8 py-14 sm:py-18 lg:py-20">
      <div className="flex max-w-sm flex-col items-center gap-3 text-center">
        <Caption className="text-accent">{t.auth.registerEyebrow}</Caption>
        <Display as="h1" className="text-3xl sm:text-4xl">
          {t.auth.registerHeading}
        </Display>
        <Body className="text-muted-foreground">{t.auth.registerDescription}</Body>
      </div>

      <form
        onSubmit={handleSubmit}
        noValidate
        className="flex w-full max-w-sm flex-col gap-5 rounded-xl border border-border bg-card p-6"
      >
        <FormField
          id="name"
          label={t.auth.nameLabel}
          placeholder={t.auth.namePlaceholder}
          value={name}
          onChange={setName}
          error={fieldErrors.name}
          autoComplete="name"
        />
        <FormField
          id="email"
          type="email"
          label={t.auth.emailLabel}
          placeholder={t.auth.emailPlaceholder}
          value={email}
          onChange={setEmail}
          error={fieldErrors.email}
          autoComplete="email"
          dir="ltr"
        />
        <FormField
          id="phone"
          type="tel"
          label={t.auth.phoneLabel}
          placeholder={t.auth.phonePlaceholder}
          value={phone}
          onChange={setPhone}
          error={fieldErrors.phone}
          autoComplete="tel"
          dir="ltr"
        />
        <FormField
          id="password"
          type="password"
          label={t.auth.passwordLabel}
          placeholder={t.auth.passwordPlaceholder}
          value={password}
          onChange={setPassword}
          error={fieldErrors.password}
          autoComplete="new-password"
          dir="ltr"
        />

        {status === "error" && errorCode ? (
          <p role="alert" className="flex items-center gap-2 text-sm text-destructive">
            <AlertTriangle className="size-4 shrink-0" aria-hidden="true" />
            {errorMessage[errorCode]}
          </p>
        ) : null}

        <Button type="submit" size="lg" disabled={status === "submitting"}>
          {status === "submitting" ? (
            <>
              <Loader2 data-icon="inline-start" className="animate-spin" aria-hidden="true" />
              {t.auth.registering}
            </>
          ) : (
            t.auth.registerCta
          )}
        </Button>
        <span role="status" className="sr-only">
          {status === "submitting" ? t.auth.registering : ""}
        </span>

        <p className="text-center text-sm text-muted-foreground">
          {t.auth.hasAccountPrompt}{" "}
          <Link href="/login" className="font-medium text-accent hover:underline">
            {t.auth.loginLink}
          </Link>
        </p>
      </form>
    </Container>
  );
}
