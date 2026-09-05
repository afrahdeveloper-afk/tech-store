"use client";

import * as React from "react";
import Link from "next/link";
import { AlertTriangle, CheckCircle2, Loader2, ShoppingCart } from "lucide-react";

import { useLanguage } from "@/components/providers/language-provider";
import { useCart } from "@/components/providers/cart-provider";
import {
  isValidEmail,
  isValidPhone,
  exceedsMaxLength,
  MAX_NAME_LENGTH,
  MAX_EMAIL_LENGTH,
  MAX_PHONE_LENGTH,
} from "@/lib/validation";
import { createOrder, type CheckoutErrorCode } from "@/app/(site)/checkout/actions";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Caption, Display, Body, H2, Small } from "@/components/ui/typography";
import { EmptyState } from "@/components/shared/empty-state";
import { FormField } from "@/components/shared/form-field";

interface FieldErrors {
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
}

/**
 * `/checkout`'s entire content. A Client Component (form state + the cart
 * read from `localStorage`); order creation itself runs server-side via
 * `createOrder` (`app/checkout/actions.ts`), called directly as a Server
 * Action — see the Step 10 note there.
 */
export function CheckoutView() {
  const { t, lang } = useLanguage();
  const { items, subtotal, clear } = useCart();

  const [customerName, setCustomerName] = React.useState("");
  const [customerEmail, setCustomerEmail] = React.useState("");
  const [customerPhone, setCustomerPhone] = React.useState("");
  const [fieldErrors, setFieldErrors] = React.useState<FieldErrors>({});
  const [status, setStatus] = React.useState<"idle" | "submitting" | "error" | "success">("idle");
  const [errorCode, setErrorCode] = React.useState<CheckoutErrorCode | null>(null);
  const [orderNumber, setOrderNumber] = React.useState<string | null>(null);
  const successHeadingRef = React.useRef<HTMLHeadingElement>(null);

  // Move focus to the success heading once it renders, so screen-reader
  // users are told the order succeeded instead of focus staying on the
  // (now-removed) submit button.
  React.useEffect(() => {
    if (status === "success") {
      successHeadingRef.current?.focus();
    }
  }, [status]);

  const formatPrice = (value: number) => value.toLocaleString(lang === "ar" ? "ar-SA" : "en-US");
  const currency = items[0]?.currency;

  const errorMessage: Record<CheckoutErrorCode, string> = {
    "missing-fields": t.checkout.errorRequired,
    "invalid-length": t.checkout.errorTooLong,
    "invalid-email": t.checkout.errorEmail,
    "invalid-phone": t.checkout.errorPhone,
    "empty-cart": t.checkout.emptyCartDescription,
    "invalid-product": t.checkout.submissionErrorDescription,
    "out-of-stock": t.checkout.submissionErrorDescription,
    maintenance: t.checkout.errorMaintenance,
    "server-error": t.checkout.submissionErrorDescription,
  };

  const validate = (): FieldErrors => {
    const errors: FieldErrors = {};
    if (!customerName.trim()) errors.customerName = t.checkout.errorRequired;
    else if (exceedsMaxLength(customerName.trim(), MAX_NAME_LENGTH)) errors.customerName = t.checkout.errorTooLong;
    if (!customerEmail.trim()) errors.customerEmail = t.checkout.errorRequired;
    else if (exceedsMaxLength(customerEmail.trim(), MAX_EMAIL_LENGTH)) errors.customerEmail = t.checkout.errorTooLong;
    else if (!isValidEmail(customerEmail)) errors.customerEmail = t.checkout.errorEmail;
    if (!customerPhone.trim()) errors.customerPhone = t.checkout.errorRequired;
    else if (exceedsMaxLength(customerPhone.trim(), MAX_PHONE_LENGTH)) errors.customerPhone = t.checkout.errorTooLong;
    else if (!isValidPhone(customerPhone)) errors.customerPhone = t.checkout.errorPhone;
    return errors;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const errors = validate();
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setStatus("submitting");
    setErrorCode(null);
    const result = await createOrder({
      customerName,
      customerEmail,
      customerPhone,
      items: items.map((item) => ({ productId: item.productId, quantity: item.quantity })),
    });

    if (result.success) {
      setOrderNumber(result.orderNumber);
      setStatus("success");
      clear();
    } else {
      setErrorCode(result.error);
      setStatus("error");
    }
  };

  if (status === "success" && orderNumber) {
    return (
      <Container className="flex flex-col items-center gap-6 py-16 text-center sm:py-20">
        <span className="flex size-14 items-center justify-center rounded-full bg-success/10 text-success">
          <CheckCircle2 className="size-7" aria-hidden="true" />
        </span>
        <div className="flex flex-col gap-2">
          <H2 as="h1" ref={successHeadingRef} tabIndex={-1}>
            {t.checkout.successTitle}
          </H2>
          <Body className="max-w-md text-muted-foreground">{t.checkout.successDescription}</Body>
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2.5">
          <Small className="text-muted-foreground">{t.checkout.orderNumberLabel}:</Small>
          <span className="font-mono text-sm font-semibold text-primary" dir="ltr">
            {orderNumber}
          </span>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button asChild size="lg">
            <Link href="/products">{t.checkout.continueShopping}</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/">{t.checkout.backToHome}</Link>
          </Button>
        </div>
      </Container>
    );
  }

  if (items.length === 0) {
    return (
      <Container className="py-10 sm:py-12 lg:py-14">
        <EmptyState
          icon={ShoppingCart}
          title={t.checkout.emptyCartTitle}
          description={t.checkout.emptyCartDescription}
          action={{ label: t.cart.browseProducts, href: "/products" }}
        />
      </Container>
    );
  }

  return (
    <Container className="flex flex-col gap-8 py-10 sm:py-12 lg:py-14">
      <div className="flex max-w-2xl flex-col gap-3">
        <Caption className="text-accent">{t.checkout.pageEyebrow}</Caption>
        <Display as="h1" className="text-3xl sm:text-4xl lg:text-5xl">
          {t.checkout.pageHeading}
        </Display>
        <Body className="text-muted-foreground">{t.checkout.pageDescription}</Body>
      </div>

      <form onSubmit={handleSubmit} noValidate className="grid grid-cols-1 gap-8 lg:grid-cols-3 lg:items-start">
        <div className="flex flex-col gap-5 rounded-xl border border-border bg-card p-6 lg:col-span-2">
          <H2 as="h2" className="text-lg">
            {t.checkout.customerInfoHeading}
          </H2>

          <FormField
            id="customerName"
            label={t.checkout.fullNameLabel}
            placeholder={t.checkout.fullNamePlaceholder}
            value={customerName}
            onChange={setCustomerName}
            error={fieldErrors.customerName}
            autoComplete="name"
            maxLength={MAX_NAME_LENGTH}
          />
          <FormField
            id="customerEmail"
            type="email"
            label={t.checkout.emailLabel}
            placeholder={t.checkout.emailPlaceholder}
            value={customerEmail}
            onChange={setCustomerEmail}
            error={fieldErrors.customerEmail}
            autoComplete="email"
            dir="ltr"
            maxLength={MAX_EMAIL_LENGTH}
          />
          <FormField
            id="customerPhone"
            type="tel"
            label={t.checkout.phoneLabel}
            placeholder={t.checkout.phonePlaceholder}
            value={customerPhone}
            onChange={setCustomerPhone}
            error={fieldErrors.customerPhone}
            autoComplete="tel"
            dir="ltr"
            maxLength={MAX_PHONE_LENGTH}
          />

          <div className="flex flex-col gap-1.5 rounded-lg border border-border bg-muted/40 p-4">
            <Small className="font-medium text-foreground">{t.checkout.paymentNoteHeading}</Small>
            <Small className="text-muted-foreground">{t.checkout.paymentNoteDescription}</Small>
          </div>

          {status === "error" && errorCode ? (
            <p role="alert" className="flex items-center gap-2 text-sm text-destructive">
              <AlertTriangle className="size-4 shrink-0" aria-hidden="true" />
              {errorMessage[errorCode]}
            </p>
          ) : null}
        </div>

        <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-6">
          <H2 as="h2" className="text-lg">
            {t.checkout.orderSummaryHeading}
          </H2>
          <ul className="flex flex-col gap-2 border-t border-border pt-4">
            {items.map((item) => (
              <li key={item.productId} className="flex items-center justify-between gap-2 text-sm">
                <span className="text-muted-foreground">
                  {lang === "ar" ? item.nameAr ?? item.name : item.name} × {item.quantity}
                </span>
                <span className="shrink-0 font-mono text-foreground">
                  {formatPrice(item.price * item.quantity)} {item.currency}
                </span>
              </li>
            ))}
          </ul>
          <div className="flex items-center justify-between border-t border-border pt-4">
            <Small className="text-muted-foreground">{t.checkout.subtotalLabel}</Small>
            <span className="font-mono text-base font-semibold text-foreground">
              {formatPrice(subtotal)} {currency}
            </span>
          </div>
          <div className="flex items-center justify-between border-t border-border pt-4">
            <Small className="font-medium text-foreground">{t.checkout.totalLabel}</Small>
            <span className="font-mono text-lg font-semibold text-primary">
              {formatPrice(subtotal)} {currency}
            </span>
          </div>

          <Button type="submit" size="lg" className="mt-1" disabled={status === "submitting"}>
            {status === "submitting" ? (
              <>
                <Loader2 data-icon="inline-start" className="animate-spin" aria-hidden="true" />
                {t.checkout.submitting}
              </>
            ) : (
              t.checkout.submitCta
            )}
          </Button>
          <span role="status" className="sr-only">
            {status === "submitting" ? t.checkout.submitting : ""}
          </span>
          <Button asChild variant="outline">
            <Link href="/cart">{t.checkout.backToCart}</Link>
          </Button>
        </div>
      </form>
    </Container>
  );
}
