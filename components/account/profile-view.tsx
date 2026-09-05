"use client";

import { LogOut } from "lucide-react";

import { useLanguage } from "@/components/providers/language-provider";
import { logout } from "@/app/(site)/account/actions";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Caption, Display, Body, H2, Label } from "@/components/ui/typography";

/**
 * `/account/profile` — read-only account information + logout. Split out of
 * the old `AccountOverview` (now `DashboardOverview`, which owns stats/
 * activity instead — see the Dashboard phase). No edit/password-change form:
 * no such Server Action exists yet (`app/account/actions.ts` only has
 * `logout`) — building one is separate, out-of-scope future work, not a UI
 * reorg. A small Client Component purely for translated copy
 * (`useLanguage()`); `customer` is resolved server-side by the route
 * (`app/account/profile/page.tsx`) and passed down as a prop.
 */
export function ProfileView({
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

      <div className="flex max-w-2xl flex-col gap-5 rounded-xl border border-border bg-card p-6">
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
    </Container>
  );
}
