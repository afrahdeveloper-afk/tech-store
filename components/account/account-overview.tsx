"use client";

import Link from "next/link";
import { ArrowRight, LogOut, Package } from "lucide-react";

import { useLanguage } from "@/components/providers/language-provider";
import { logout } from "@/app/account/actions";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Caption, Display, Body, H2, H3, Label } from "@/components/ui/typography";

/**
 * `/account`'s content — profile info + logout + the entry point into
 * `/account/orders`. A small Client Component purely for translated copy
 * (see `language-provider.tsx`); `customer` itself is resolved server-side
 * by the route (`app/account/page.tsx`, via `getCurrentCustomer()`) and
 * passed down as a prop — this component never queries the database.
 */
export function AccountOverview({
  customer,
}: {
  customer: { name: string; email: string; phone: string };
}) {
  const { t } = useLanguage();

  return (
    <Container className="flex flex-col gap-8 py-10 sm:py-12 lg:py-14">
      <div className="flex max-w-2xl flex-col gap-3">
        <Caption className="text-accent">{t.account.pageEyebrow}</Caption>
        <Display as="h1" className="text-3xl sm:text-4xl">
          {t.account.pageHeading}
        </Display>
        <Body className="text-muted-foreground">{t.account.pageDescription}</Body>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:items-start">
        <div className="flex flex-col gap-5 rounded-xl border border-border bg-card p-6 lg:col-span-2">
          <H2 as="h2" className="text-lg">
            {t.account.accountInfoHeading}
          </H2>

          <dl className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <dt>
                <Label>{t.account.nameLabel}</Label>
              </dt>
              <dd className="text-sm text-foreground">{customer.name}</dd>
            </div>
            <div className="flex flex-col gap-1">
              <dt>
                <Label>{t.account.emailLabel}</Label>
              </dt>
              <dd className="text-sm text-foreground" dir="ltr">
                {customer.email}
              </dd>
            </div>
            <div className="flex flex-col gap-1">
              <dt>
                <Label>{t.account.phoneLabel}</Label>
              </dt>
              <dd className="text-sm text-foreground" dir="ltr">
                {customer.phone}
              </dd>
            </div>
          </dl>

          <form action={logout} className="pt-2">
            <Button type="submit" variant="outline" size="lg">
              <LogOut data-icon="inline-start" aria-hidden="true" />
              {t.account.logoutCta}
            </Button>
          </form>
        </div>

        <Link
          href="/account/orders"
          className="group flex flex-col gap-3 rounded-xl border border-border bg-card p-6 transition-all hover:border-primary/40 hover:shadow-lg hover:shadow-black/30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          <span className="flex size-11 items-center justify-center rounded-lg bg-muted text-primary transition-colors group-hover:bg-accent/10 group-hover:text-accent">
            <Package className="size-5" aria-hidden="true" />
          </span>
          <H3 as="h3" className="text-base font-semibold">
            {t.account.activityCardTitle}
          </H3>
          <p className="text-sm text-muted-foreground">{t.account.activityCardDescription}</p>
          <span className="mt-auto flex items-center gap-1 pt-1 text-sm font-medium text-muted-foreground transition-colors group-hover:text-accent">
            {t.account.viewActivityCta}
            <ArrowRight className="size-3.5 rtl:rotate-180" aria-hidden="true" />
          </span>
        </Link>
      </div>
    </Container>
  );
}
