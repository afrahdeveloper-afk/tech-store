"use client";

import { useLanguage } from "@/components/providers/language-provider";
import { Container } from "@/components/ui/container";
import { Caption, Display, Body } from "@/components/ui/typography";

/**
 * `/about`'s page hero — a small Client Component purely for translated copy
 * (see `language-provider.tsx`), mirroring `services-page-header.tsx`'s
 * eyebrow/Display-as-h1/description pattern rather than the homepage
 * `Hero`'s two-column image layout — this page has no dedicated hero image
 * (see the audit note in the About page component set).
 */
export function AboutHero() {
  const { t } = useLanguage();

  return (
    <section className="py-14 sm:py-18 lg:py-20">
      <Container className="flex flex-col items-start gap-4">
        <Caption className="text-accent">{t.aboutPage.heroEyebrow}</Caption>
        <Display as="h1" className="max-w-3xl text-start">
          {t.aboutPage.heroHeading}
        </Display>
        <Body className="max-w-2xl text-muted-foreground">{t.aboutPage.heroDescription}</Body>
      </Container>
    </section>
  );
}
