"use client";

import Link from "next/link";
import { Clock } from "lucide-react";

import type { Service, ServiceCategory, Subservice } from "@/types";
import { useLanguage } from "@/components/providers/language-provider";
import { iconMap } from "@/lib/icon-map";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Body, Caption, Display, H2, Small } from "@/components/ui/typography";
import { Breadcrumb } from "@/components/shared/breadcrumb";
import { ServiceItemCard } from "@/components/services/service-item-card";

/**
 * `/services/[id]`'s content. A Client Component because every piece of
 * text here is bilingual, mirroring `product-detail-view.tsx`'s split
 * between a Server route shell (resolves the data) and this Client view.
 * No hero image (unlike products, no mock service carries one yet) — the
 * category icon plus a price/duration "spec sheet" panel fills that role.
 */
export function ServiceDetailView({
  service,
  subservice,
  category,
  relatedServices,
}: {
  service: Service;
  subservice: Subservice;
  category: ServiceCategory;
  relatedServices: Service[];
}) {
  const { t, lang } = useLanguage();

  const name = lang === "ar" ? service.nameAr ?? service.name : service.name;
  const description = lang === "ar" ? service.descriptionAr ?? service.description : service.description;
  const subserviceName = lang === "ar" ? subservice.nameAr ?? subservice.name : subservice.name;
  const categoryName = lang === "ar" ? category.nameAr ?? category.name : category.name;
  const Icon = category.icon ? iconMap[category.icon] : undefined;

  return (
    <Container className="flex flex-col gap-12 py-10 sm:py-12 lg:py-14">
      <Breadcrumb
        items={[
          { label: t.serviceDetails.breadcrumbHome, href: "/" },
          { label: t.serviceDetails.breadcrumbServices, href: "/services" },
          { label: name },
        ]}
      />

      <div className="flex flex-col gap-8 lg:flex-row lg:gap-12">
        <div className="flex flex-1 flex-col gap-5">
          <div className="flex items-center gap-3">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-muted text-primary">
              {Icon ? <Icon className="size-6" aria-hidden="true" /> : null}
            </span>
            <Caption className="text-accent">
              {categoryName} • {subserviceName}
            </Caption>
          </div>

          <Display as="h1" className="text-2xl sm:text-3xl lg:text-4xl">
            {name}
          </Display>

          <Badge variant={service.available ? "success" : "error"} className="w-fit">
            {service.available ? t.services.availableLabel : t.services.unavailableLabel}
          </Badge>

          <Body className="text-muted-foreground">{description}</Body>
        </div>

        <div className="flex w-full flex-col gap-4 rounded-xl border border-border bg-card p-6 lg:w-80 lg:shrink-0">
          <div className="flex items-center justify-between">
            <Small className="text-muted-foreground">{t.services.priceLabel}</Small>
            <span className="font-mono text-xl font-semibold text-primary">
              {service.price.toLocaleString(lang === "ar" ? "ar-SA" : "en-US")} {service.currency}
            </span>
          </div>
          {service.durationMinutes != null ? (
            <div className="flex items-center justify-between border-t border-border pt-4">
              <Small className="text-muted-foreground">{t.services.durationLabel}</Small>
              <span className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                <Clock className="size-4" aria-hidden="true" />
                {service.durationMinutes} {t.services.minutesLabel}
              </span>
            </div>
          ) : null}

          {service.available ? (
            <Button asChild size="lg" className="mt-1">
              <Link href={`/booking?service=${service.slug}`}>{t.services.bookServiceCta}</Link>
            </Button>
          ) : (
            <Button size="lg" className="mt-1" disabled>
              {t.services.bookServiceCta}
            </Button>
          )}
        </div>
      </div>

      {relatedServices.length > 0 ? (
        <div className="flex flex-col gap-6 border-t border-border pt-10">
          <H2>{t.serviceDetails.relatedHeading}</H2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {relatedServices.map((related) => (
              <ServiceItemCard key={related.id} service={related} lang={lang} t={t} />
            ))}
          </div>
        </div>
      ) : null}
    </Container>
  );
}
