import Link from "next/link";
import { Clock } from "lucide-react";

import type { Service } from "@/types";
import type { Dictionary, Lang } from "@/lib/i18n/translations";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Body, H3, Small } from "@/components/ui/typography";

/**
 * The actual bookable, priced leaf — reused by the `/services` accordion
 * (Step 5) and the "Related services" section on `/services/[id]` (Step 6),
 * per CLAUDE.md's Component Architecture ("create components when they are
 * reusable"). No `useLanguage()` here — resolved `lang`/`t` are passed down,
 * matching `product-card.tsx`'s pattern so it stays usable from either.
 */
export function ServiceItemCard({ service, lang, t }: { service: Service; lang: Lang; t: Dictionary }) {
  const name = lang === "ar" ? service.nameAr ?? service.name : service.name;
  const description = lang === "ar" ? service.descriptionAr ?? service.description : service.description;

  return (
    <div className="group flex flex-col gap-3 rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/40 hover:shadow-lg hover:shadow-black/30">
      <div className="flex items-start justify-between gap-3">
        <H3 as="h3" className="text-base leading-snug font-semibold">
          <Link
            href={`/services/${service.slug}`}
            className="rounded-sm hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            {name}
          </Link>
        </H3>
        <Badge variant={service.available ? "success" : "error"} className="shrink-0">
          {service.available ? t.services.availableLabel : t.services.unavailableLabel}
        </Badge>
      </div>

      <Body className="line-clamp-2 text-sm text-muted-foreground">{description}</Body>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <Clock className="size-3.5" aria-hidden="true" />
          {service.durationMinutes} {t.services.minutesLabel}
        </span>
        <span className="ms-auto font-mono text-base font-semibold text-primary">
          {service.price.toLocaleString(lang === "ar" ? "ar-SA" : "en-US")} {service.currency}
        </span>
      </div>

      <div className="mt-1 flex items-center gap-2">
        {service.available ? (
          <Button asChild className="flex-1">
            <Link href={`/booking?service=${service.slug}`}>{t.services.bookServiceCta}</Link>
          </Button>
        ) : (
          <Button className="flex-1" disabled>
            {t.services.bookServiceCta}
          </Button>
        )}
        <Button asChild variant="outline">
          <Link href={`/services/${service.slug}`}>
            <Small as="span">{t.services.viewDetailsCta}</Small>
          </Link>
        </Button>
      </div>
    </div>
  );
}
