"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

import type { ServiceCategory } from "@/types";
import { useLanguage } from "@/components/providers/language-provider";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/shared/section-heading";
import { Reveal } from "@/components/shared/reveal";
import { ServiceCard } from "./service-card";

/** `serviceCategories` is fetched server-side (real Prisma query, Phase 12b) by `app/(site)/page.tsx` and passed down — this is a Client Component (translated copy via `useLanguage()`). */
export function ServicesOverview({ serviceCategories }: { serviceCategories: ServiceCategory[] }) {
  const { t, lang } = useLanguage();

  return (
    <section className="py-14 sm:py-18 lg:py-20">
      <Container className="flex flex-col gap-10">
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
          <SectionHeading
            eyebrow={t.services.eyebrow}
            heading={t.services.heading}
            description={t.services.description}
          />
          <Link
            href="/services"
            className="flex shrink-0 items-center gap-1.5 text-sm font-medium text-accent hover:underline"
          >
            {t.services.viewAll}
            <ArrowRight className="size-4 rtl:rotate-180" aria-hidden="true" />
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {serviceCategories.map((service, index) => (
            <Reveal key={service.id} delayMs={index * 40}>
              <ServiceCard
                service={service}
                name={lang === "ar" ? service.nameAr ?? service.name : service.name}
                description={lang === "ar" ? service.descriptionAr ?? service.description : service.description}
                learnMoreLabel={t.services.learnMore}
              />
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
