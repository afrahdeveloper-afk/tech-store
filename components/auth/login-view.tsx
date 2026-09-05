"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertTriangle, Loader2 } from "lucide-react";

import { useLanguage } from "@/components/providers/language-provider";
import { isValidEmail, MAX_EMAIL_LENGTH, MAX_PASSWORD_LENGTH } from "@/lib/validation";
import { login, type LoginErrorCode } from "@/app/(site)/login/actions";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Caption, Display, Body } from "@/components/ui/typography";
import { FormField } from "@/components/shared/form-field";

interface FieldErrors {
  email?: string;
  password?: string;
}

/**
 * `/login`'s content. Same shape as `CheckoutView`/`BookingView`: a Client
 * Component owning form state, calling the `login` Server Action directly
 * (`app/login/actions.ts`) rather than a fetch/API route.
 */
export function LoginView({ next = "/account" }: { next?: string }) {
  const { t } = useLanguage();
  const router = useRouter();

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [fieldErrors, setFieldErrors] = React.useState<FieldErrors>({});
  const [status, setStatus] = React.useState<"idle" | "submitting" | "error">("idle");
  const [errorCode, setErrorCode] = React.useState<LoginErrorCode | null>(null);

  const errorMessage: Record<LoginErrorCode, string> = {
    "missing-fields": t.auth.errorRequired,
    "invalid-email": t.auth.errorEmail,
    "invalid-credentials": t.auth.errorInvalidCredentials,
    "rate-limited": t.auth.errorRateLimited,
    "server-error": t.auth.errorServer,
  };

  const validate = (): FieldErrors => {
    const errors: FieldErrors = {};
    if (!email.trim()) errors.email = t.auth.errorRequired;
    else if (!isValidEmail(email)) errors.email = t.auth.errorEmail;
    if (!password) errors.password = t.auth.errorRequired;
    return errors;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const errors = validate();
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setStatus("submitting");
    setErrorCode(null);
    const result = await login({ email, password });

    if (result.success) {
      router.push(next);
      router.refresh();
    } else {
      setErrorCode(result.error);
      setStatus("error");
    }
  };

  return (
    <Container className="flex flex-col items-center gap-8 py-14 sm:py-18 lg:py-20">
      <div className="flex max-w-sm flex-col items-center gap-3 text-center">
        <Caption className="text-accent">{t.auth.loginEyebrow}</Caption>
        <Display as="h1" className="text-3xl sm:text-4xl">
          {t.auth.loginHeading}
        </Display>
        <Body className="text-muted-foreground">{t.auth.loginDescription}</Body>
      </div>

      <form
        onSubmit={handleSubmit}
        noValidate
        className="flex w-full max-w-sm flex-col gap-5 rounded-xl border border-border bg-card p-6"
      >
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
          maxLength={MAX_EMAIL_LENGTH}
        />
        <FormField
          id="password"
          type="password"
          label={t.auth.passwordLabel}
          placeholder={t.auth.passwordPlaceholder}
          value={password}
          onChange={setPassword}
          error={fieldErrors.password}
          autoComplete="current-password"
          dir="ltr"
          maxLength={MAX_PASSWORD_LENGTH}
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
              {t.auth.loggingIn}
            </>
          ) : (
            t.auth.loginCta
          )}
        </Button>
        <span role="status" className="sr-only">
          {status === "submitting" ? t.auth.loggingIn : ""}
        </span>

        <p className="text-center text-sm text-muted-foreground">
          {t.auth.noAccountPrompt}{" "}
          <Link href="/register" className="font-medium text-accent hover:underline">
            {t.auth.registerLink}
          </Link>
        </p>
      </form>
    </Container>
  );
}
