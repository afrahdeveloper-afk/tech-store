"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { mockServiceCategories } from "@/lib/mock/services";
import { useLanguage } from "@/components/providers/language-provider";
import { iconMap } from "@/lib/icon-map";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/shared/section-heading";
import { Reveal } from "@/components/shared/reveal";
import { Button } from "@/components/ui/button";

/**
 * Connects the About page to the real `/services` catalog without
 * duplicating it — reuses `mockServiceCategories` (the same domain data
 * `ServicesOverview` renders as full cards on the homepage) as a compact,
 * name-only chip list, plus one CTA to the actual services page. Deliberately
 * lighter-weight than `ServiceCard`'s full description cards so this reads
 * as a summary, not a second copy of the homepage section.
 */
export function AboutCapabilities() {
  const { t, lang } = useLanguage();

  return (
    <section className="py-14 sm:py-18 lg:py-20">
      <Container className="flex flex-col gap-10">
        <SectionHeading
          eyebrow={t.aboutPage.capabilitiesEyebrow}
          heading={t.aboutPage.capabilitiesHeading}
          description={t.aboutPage.capabilitiesDescription}
          align="center"
          className="mx-auto"
        />

        <Reveal className="flex flex-wrap justify-center gap-3">
          {mockServiceCategories.map((category) => {
            const Icon = category.icon ? iconMap[category.icon] : undefined;
            const name = lang === "ar" ? category.nameAr ?? category.name : category.name;
            return (
              <span
                key={category.id}
                className="flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-foreground"
              >
                {Icon ? <Icon className="size-4 text-primary" aria-hidden="true" /> : null}
                {name}
              </span>
            );
          })}
        </Reveal>

        <Button asChild size="lg" className="mx-auto h-11 px-5 text-sm">
          <Link href="/services">
            {t.aboutPage.capabilitiesCta}
            <ArrowRight className="rtl:rotate-180" data-icon="inline-end" aria-hidden="true" />
          </Link>
        </Button>
      </Container>
    </section>
  );
}
