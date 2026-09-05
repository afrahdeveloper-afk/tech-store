"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Loader2 } from "lucide-react";

import { isValidEmail } from "@/lib/validation";
import { adminLogin, type AdminLoginErrorCode } from "@/app/admin/login/actions";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Caption, Display, Body } from "@/components/ui/typography";
import { FormField } from "@/components/shared/form-field";

interface FieldErrors {
  email?: string;
  password?: string;
}

const ERROR_MESSAGE: Record<AdminLoginErrorCode, string> = {
  "missing-fields": "This field is required.",
  "invalid-email": "Enter a valid email address.",
  "invalid-credentials": "Incorrect email or password.",
  "rate-limited": "Too many attempts. Please wait a few minutes and try again.",
  "server-error": "Something went wrong. Please try again.",
};

/**
 * `/admin/login`'s content. Same Server-Action-driven form shape as
 * `components/auth/login-view.tsx`, but plain, hardcoded English — Admin has
 * no `LanguageProvider` in its tree by design this phase (see
 * `app/admin/layout.tsx`), so this deliberately does not call `useLanguage()`.
 */
export function AdminLoginView() {
  const router = useRouter();

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [fieldErrors, setFieldErrors] = React.useState<FieldErrors>({});
  const [status, setStatus] = React.useState<"idle" | "submitting" | "error">("idle");
  const [errorCode, setErrorCode] = React.useState<AdminLoginErrorCode | null>(null);

  const validate = (): FieldErrors => {
    const errors: FieldErrors = {};
    if (!email.trim()) errors.email = "This field is required.";
    else if (!isValidEmail(email)) errors.email = "Enter a valid email address.";
    if (!password) errors.password = "This field is required.";
    return errors;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const errors = validate();
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setStatus("submitting");
    setErrorCode(null);
    const result = await adminLogin({ email, password });

    if (result.success) {
      router.push("/admin");
      router.refresh();
    } else {
      setErrorCode(result.error);
      setStatus("error");
    }
  };

  return (
    <Container className="flex flex-1 flex-col items-center justify-center gap-8 py-14 sm:py-18 lg:py-20">
      <div className="flex max-w-sm flex-col items-center gap-3 text-center">
        <Caption className="text-accent">Speed Core Admin</Caption>
        <Display as="h1" className="text-3xl sm:text-4xl">
          Admin Sign In
        </Display>
        <Body className="text-muted-foreground">Sign in with your admin account to manage the store.</Body>
      </div>

      <form
        onSubmit={handleSubmit}
        noValidate
        className="flex w-full max-w-sm flex-col gap-5 rounded-xl border border-border bg-card p-6"
      >
        <FormField
          id="admin-email"
          type="email"
          label="Email address"
          placeholder="you@speedcore.example"
          value={email}
          onChange={setEmail}
          error={fieldErrors.email}
          autoComplete="email"
          dir="ltr"
        />
        <FormField
          id="admin-password"
          type="password"
          label="Password"
          placeholder="••••••••"
          value={password}
          onChange={setPassword}
          error={fieldErrors.password}
          autoComplete="current-password"
          dir="ltr"
        />

        {status === "error" && errorCode ? (
          <p role="alert" className="flex items-center gap-2 text-sm text-destructive">
            <AlertTriangle className="size-4 shrink-0" aria-hidden="true" />
            {ERROR_MESSAGE[errorCode]}
          </p>
        ) : null}

        <Button type="submit" size="lg" disabled={status === "submitting"}>
          {status === "submitting" ? (
            <>
              <Loader2 data-icon="inline-start" className="animate-spin" aria-hidden="true" />
              Signing in…
            </>
          ) : (
            "Sign In"
          )}
        </Button>
        <span role="status" className="sr-only">
          {status === "submitting" ? "Signing in…" : ""}
        </span>
      </form>
    </Container>
  );
}
