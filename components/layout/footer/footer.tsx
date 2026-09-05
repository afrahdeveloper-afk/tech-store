"use client";

import Link from "next/link";
import { Clock, Gauge, Mail, MapPin, Phone } from "lucide-react";

import type { StoreSettingsData } from "@/lib/settings-data";
import { useLanguage } from "@/components/providers/language-provider";
import { Container } from "@/components/ui/container";
import { Small } from "@/components/ui/typography";

/**
 * Global footer (Phase 2). Client Component for the same reason as the
 * navbar — translated copy needs `useLanguage()`.
 *
 * Contact details and the copyright line's store name are read from the
 * real `StoreSettings` singleton row (Admin Settings), passed down from
 * `app/(site)/layout.tsx` — not hardcoded anymore. `StoreSettings`'s schema
 * defaults exactly match what used to be hardcoded here, so a never-touched
 * settings row renders byte-identical content to before. The wordmark/logo
 * lockup below stays a fixed "Speed Core" — that's brand identity, not
 * contact information (see CLAUDE.md's Design System Reference "Logo"
 * note), so it's deliberately not wired to `settings.storeName`.
 */
export function Footer({ settings }: { settings: StoreSettingsData }) {
  const { t, lang } = useLanguage();
  const storeName = lang === "ar" ? settings.storeNameAr ?? settings.storeName : settings.storeName;
  const contactAddress = lang === "ar" ? settings.contactAddressAr ?? settings.contactAddress : settings.contactAddress;

  const shopLinks = [
    { href: "/products", label: t.nav.products },
    { href: "/cart", label: t.nav.cart },
  ];
  const serviceLinks = [
    { href: "/services", label: t.nav.services },
    { href: "/booking", label: t.nav.booking },
  ];
  const companyLinks = [
    { href: "/", label: t.nav.home },
    { href: "/about", label: t.nav.about },
  ];

  return (
    <footer className="border-t border-border bg-card">
      <Container className="grid grid-cols-2 gap-x-6 gap-y-10 py-14 sm:grid-cols-3 lg:grid-cols-5 lg:gap-x-8">
        <div className="col-span-2 flex flex-col gap-3 lg:col-span-2">
          <Link
            href="/"
            className="flex items-center gap-2 rounded-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
          >
            <span className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Gauge className="size-4.5" aria-hidden="true" />
            </span>
            <span className="font-display text-lg font-semibold tracking-tight text-foreground">
              Speed Core
            </span>
          </Link>
          <Small className="max-w-xs text-muted-foreground">{t.footer.tagline}</Small>
        </div>

        <FooterColumn heading={t.footer.shopHeading} links={shopLinks} />
        <FooterColumn heading={t.footer.servicesHeading} links={serviceLinks} />
        <FooterColumn heading={t.footer.companyHeading} links={companyLinks} />

        <div className="col-span-2 flex flex-col gap-3 sm:col-span-3 lg:col-span-1">
          <Small as="span" className="font-medium text-foreground">
            {t.footer.contactHeading}
          </Small>
          <ul className="flex flex-col gap-2.5">
            <li className="flex items-start gap-2 text-muted-foreground">
              <Phone className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              <Small as="span" dir="ltr" className="text-start text-muted-foreground">
                {settings.contactPhone}
              </Small>
            </li>
            <li className="flex items-start gap-2 text-muted-foreground">
              <Mail className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              <Small as="span" dir="ltr" className="text-start text-muted-foreground">
                {settings.contactEmail}
              </Small>
            </li>
            {contactAddress ? (
              <li className="flex items-start gap-2 text-muted-foreground">
                <MapPin className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                <Small as="span" className="text-muted-foreground">
                  {contactAddress}
                </Small>
              </li>
            ) : null}
            <li className="flex items-start gap-2 text-muted-foreground">
              <Clock className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              <Small as="span" className="text-muted-foreground">
                {t.footer.hours}
              </Small>
            </li>
          </ul>
        </div>
      </Container>

      <div className="rule-calibration" aria-hidden="true" />

      <Container className="flex flex-col items-center justify-between gap-2 py-5 sm:flex-row">
        <Small className="text-muted-foreground">
          &copy; {new Date().getFullYear()} {storeName}. {t.footer.rights}
        </Small>
      </Container>
    </footer>
  );
}

function FooterColumn({ heading, links }: { heading: string; links: { href: string; label: string }[] }) {
  return (
    <div className="flex flex-col gap-3">
      <Small as="span" className="font-medium text-foreground">
        {heading}
      </Small>
      <ul className="flex flex-col gap-2.5">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="rounded-sm text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
