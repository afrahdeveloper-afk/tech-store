"use client";

import * as React from "react";
import Link from "next/link";
import { AlertTriangle, Ban, CalendarClock, CheckCircle2, Clock, Loader2 } from "lucide-react";

import type { Service, ServiceCategory, Subservice } from "@/types";
import { useLanguage } from "@/components/providers/language-provider";
import { isValidEmail, isValidPhone } from "@/lib/validation";
import { createBooking, type BookingErrorCode } from "@/app/booking/actions";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Caption, Display, Body, H2, Small, Label } from "@/components/ui/typography";
import { EmptyState } from "@/components/shared/empty-state";
import { FormField } from "@/components/shared/form-field";

export type BookingResolution =
  | { status: "none" }
  | { status: "not-found" }
  | { status: "unavailable"; service: Service; subservice: Subservice; category: ServiceCategory }
  | { status: "ok"; service: Service; subservice: Subservice; category: ServiceCategory };

interface FieldErrors {
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  preferredDate?: string;
  preferredTime?: string;
}

function todayIsoDate(): string {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60000;
  return new Date(now.getTime() - offset).toISOString().slice(0, 10);
}

/**
 * `/booking`'s entire content. A Client Component (form state); the
 * requested service is already resolved server-side (`app/booking/page.tsx`)
 * against the same mock data `/services/[id]` uses, so an unknown/
 * unavailable service never reaches a renderable form here — see the Step 7
 * note there. Booking creation itself runs server-side via `createBooking`
 * (`app/booking/actions.ts`).
 */
export function BookingView({ resolution }: { resolution: BookingResolution }) {
  const { t, lang } = useLanguage();

  const [customerName, setCustomerName] = React.useState("");
  const [customerEmail, setCustomerEmail] = React.useState("");
  const [customerPhone, setCustomerPhone] = React.useState("");
  const [preferredDate, setPreferredDate] = React.useState("");
  const [preferredTime, setPreferredTime] = React.useState("");
  const [notes, setNotes] = React.useState("");
  const [fieldErrors, setFieldErrors] = React.useState<FieldErrors>({});
  const [status, setStatus] = React.useState<"idle" | "submitting" | "error" | "success">("idle");
  const [errorCode, setErrorCode] = React.useState<BookingErrorCode | null>(null);
  const [bookingNumber, setBookingNumber] = React.useState<string | null>(null);
  const successHeadingRef = React.useRef<HTMLHeadingElement>(null);

  // Move focus to the success heading once it renders, so screen-reader
  // users are told the booking succeeded instead of focus staying on the
  // (now-removed) submit button.
  React.useEffect(() => {
    if (status === "success") {
      successHeadingRef.current?.focus();
    }
  }, [status]);

  if (resolution.status === "none") {
    return (
      <Container className="py-10 sm:py-12 lg:py-14">
        <EmptyState
          icon={CalendarClock}
          title={t.booking.noServiceTitle}
          description={t.booking.noServiceDescription}
          action={{ label: t.booking.browseServices, href: "/services" }}
        />
      </Container>
    );
  }

  if (resolution.status === "not-found") {
    return (
      <Container className="py-10 sm:py-12 lg:py-14">
        <EmptyState
          icon={AlertTriangle}
          tone="error"
          title={t.booking.notFoundTitle}
          description={t.booking.notFoundDescription}
          action={{ label: t.booking.browseServices, href: "/services" }}
        />
      </Container>
    );
  }

  if (resolution.status === "unavailable") {
    return (
      <Container className="py-10 sm:py-12 lg:py-14">
        <EmptyState
          icon={Ban}
          tone="error"
          title={t.booking.unavailableTitle}
          description={t.booking.unavailableDescription}
          action={{ label: t.booking.browseServices, href: "/services" }}
        />
      </Container>
    );
  }

  const { service, subservice, category } = resolution;
  const serviceName = lang === "ar" ? service.nameAr ?? service.name : service.name;
  const subserviceName = lang === "ar" ? subservice.nameAr ?? subservice.name : subservice.name;
  const categoryName = lang === "ar" ? category.nameAr ?? category.name : category.name;

  const errorMessage: Record<BookingErrorCode, string> = {
    "invalid-service": t.booking.notFoundDescription,
    unavailable: t.booking.unavailableDescription,
    "missing-fields": t.booking.errorRequired,
    "invalid-email": t.booking.errorEmail,
    "invalid-phone": t.booking.errorPhone,
    "invalid-date": t.booking.errorDate,
    "past-date": t.booking.errorPastDate,
    "invalid-time": t.booking.errorTime,
    "server-error": t.booking.submissionErrorDescription,
  };

  const validate = (): FieldErrors => {
    const errors: FieldErrors = {};
    if (!customerName.trim()) errors.customerName = t.booking.errorRequired;
    if (!customerEmail.trim()) errors.customerEmail = t.booking.errorRequired;
    else if (!isValidEmail(customerEmail)) errors.customerEmail = t.booking.errorEmail;
    if (!customerPhone.trim()) errors.customerPhone = t.booking.errorRequired;
    else if (!isValidPhone(customerPhone)) errors.customerPhone = t.booking.errorPhone;
    if (!preferredDate) errors.preferredDate = t.booking.errorDate;
    else if (preferredDate < todayIsoDate()) errors.preferredDate = t.booking.errorPastDate;
    if (!preferredTime) errors.preferredTime = t.booking.errorTime;
    return errors;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const errors = validate();
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setStatus("submitting");
    setErrorCode(null);
    const result = await createBooking({
      serviceId: service.id,
      customerName,
      customerEmail,
      customerPhone,
      preferredDate,
      preferredTime,
      notes: notes.trim() || undefined,
    });

    if (result.success) {
      setBookingNumber(result.bookingNumber);
      setStatus("success");
    } else {
      setErrorCode(result.error);
      setStatus("error");
    }
  };

  if (status === "success" && bookingNumber) {
    return (
      <Container className="flex flex-col items-center gap-6 py-16 text-center sm:py-20">
        <span className="flex size-14 items-center justify-center rounded-full bg-success/10 text-success">
          <CheckCircle2 className="size-7" aria-hidden="true" />
        </span>
        <div className="flex flex-col gap-2">
          <H2 as="h1" ref={successHeadingRef} tabIndex={-1}>
            {t.booking.successTitle}
          </H2>
          <Body className="max-w-md text-muted-foreground">{t.booking.successDescription}</Body>
        </div>
        <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-5 text-start sm:min-w-80">
          <div className="flex items-center justify-between gap-3">
            <Small className="text-muted-foreground">{t.booking.bookingNumberLabel}</Small>
            <span className="font-mono text-sm font-semibold text-primary" dir="ltr">
              {bookingNumber}
            </span>
          </div>
          <div className="flex items-center justify-between gap-3 border-t border-border pt-3">
            <Small className="text-muted-foreground">{serviceName}</Small>
            <span className="text-sm text-foreground">
              {preferredDate} · {preferredTime}
            </span>
          </div>
          <div className="flex items-center justify-between gap-3 border-t border-border pt-3">
            <Small className="text-muted-foreground">{customerName}</Small>
          </div>
        </div>
        <div className="flex flex-col gap-1.5 border-t border-border pt-5 text-start">
          <Small className="font-medium text-foreground">{t.booking.nextStepsHeading}</Small>
          <Small className="max-w-md text-muted-foreground">{t.booking.nextStepsDescription}</Small>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button asChild size="lg">
            <Link href="/services">{t.booking.backToServices}</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/">{t.booking.backToHome}</Link>
          </Button>
        </div>
      </Container>
    );
  }

  return (
    <Container className="flex flex-col gap-8 py-10 sm:py-12 lg:py-14">
      <div className="flex max-w-2xl flex-col gap-3">
        <Caption className="text-accent">{t.booking.pageEyebrow}</Caption>
        <Display as="h1" className="text-3xl sm:text-4xl lg:text-5xl">
          {t.booking.pageHeading}
        </Display>
        <Body className="text-muted-foreground">{t.booking.pageDescription}</Body>
      </div>

      <form onSubmit={handleSubmit} noValidate className="grid grid-cols-1 gap-8 lg:grid-cols-3 lg:items-start">
        <div className="flex flex-col gap-5 rounded-xl border border-border bg-card p-6 lg:col-span-2">
          <H2 as="h2" className="text-lg">
            {t.booking.formHeading}
          </H2>

          <FormField
            id="customerName"
            label={t.booking.fullNameLabel}
            placeholder={t.booking.fullNamePlaceholder}
            value={customerName}
            onChange={setCustomerName}
            error={fieldErrors.customerName}
            autoComplete="name"
          />
          <FormField
            id="customerEmail"
            type="email"
            label={t.booking.emailLabel}
            placeholder={t.booking.emailPlaceholder}
            value={customerEmail}
            onChange={setCustomerEmail}
            error={fieldErrors.customerEmail}
            autoComplete="email"
            dir="ltr"
          />
          <FormField
            id="customerPhone"
            type="tel"
            label={t.booking.phoneLabel}
            placeholder={t.booking.phonePlaceholder}
            value={customerPhone}
            onChange={setCustomerPhone}
            error={fieldErrors.customerPhone}
            autoComplete="tel"
            dir="ltr"
          />

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <FormField
              id="preferredDate"
              type="date"
              label={t.booking.dateLabel}
              value={preferredDate}
              onChange={setPreferredDate}
              error={fieldErrors.preferredDate}
              min={todayIsoDate()}
            />
            <FormField
              id="preferredTime"
              type="time"
              label={t.booking.timeLabel}
              value={preferredTime}
              onChange={setPreferredTime}
              error={fieldErrors.preferredTime}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="notes">{t.booking.notesLabel}</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder={t.booking.notesPlaceholder}
            />
          </div>

          {status === "error" && errorCode ? (
            <p role="alert" className="flex items-center gap-2 text-sm text-destructive">
              <AlertTriangle className="size-4 shrink-0" aria-hidden="true" />
              {errorMessage[errorCode]}
            </p>
          ) : null}

          <Button type="submit" size="lg" className="mt-1" disabled={status === "submitting"}>
            {status === "submitting" ? (
              <>
                <Loader2 data-icon="inline-start" className="animate-spin" aria-hidden="true" />
                {t.booking.submitting}
              </>
            ) : (
              t.booking.submitCta
            )}
          </Button>
          <span role="status" className="sr-only">
            {status === "submitting" ? t.booking.submitting : ""}
          </span>
        </div>

        <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-6">
          <H2 as="h2" className="text-lg">
            {t.booking.serviceSummaryHeading}
          </H2>
          <div className="flex flex-col gap-1">
            <span className="text-base font-semibold text-foreground">{serviceName}</span>
            <Caption className="text-accent">
              {categoryName} • {subserviceName}
            </Caption>
          </div>
          <div className="flex items-center justify-between border-t border-border pt-4">
            <Small className="text-muted-foreground">{t.booking.priceLabel}</Small>
            <span className="font-mono text-base font-semibold text-primary">
              {service.price.toLocaleString(lang === "ar" ? "ar-SA" : "en-US")} {service.currency}
            </span>
          </div>
          <div className="flex items-center justify-between border-t border-border pt-4">
            <Small className="text-muted-foreground">{t.booking.durationLabel}</Small>
            <span className="flex items-center gap-1.5 text-sm font-medium text-foreground">
              <Clock className="size-4" aria-hidden="true" />
              {service.durationMinutes} {t.booking.minutesLabel}
            </span>
          </div>
        </div>
      </form>
    </Container>
  );
}
