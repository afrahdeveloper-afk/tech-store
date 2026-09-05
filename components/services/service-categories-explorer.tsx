"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";

import type { Service, ServiceCategory, Subservice } from "@/types";
import { useLanguage } from "@/components/providers/language-provider";
import { iconMap } from "@/lib/icon-map";
import { cn } from "@/lib/utils";
import { Body } from "@/components/ui/typography";
import { SubserviceList } from "./subservice-list";

/**
 * `/services`' main content — Steps 3–5 combined into one page: the first
 * screen shows every `ServiceCategory` (Step 3); clicking one expands it
 * in place to reveal its `Subservice`s, each of which further expands to
 * reveal its bookable `Service`s (Steps 4–5), via `SubserviceList`.
 *
 * Kept as a single-page accordion rather than a `/services/[category]`
 * route: Next.js requires sibling dynamic segments at the same URL depth to
 * share one param name, so a `[category]` route here would collide with
 * `/services/[id]` (the flat details route Step 6 calls for, mirroring
 * `/products/[id]`) — this sidesteps that without adding a route CLAUDE.md's
 * "Main Routes" doesn't list.
 *
 * `categories`/`subservices`/`services` are fetched server-side (real
 * Prisma queries, Phase 12b) by `app/(site)/services/(list)/page.tsx` and
 * passed down — this component can't call Prisma itself (Client Component).
 */
export function ServiceCategoriesExplorer({
  categories,
  subservices,
  services,
}: {
  categories: ServiceCategory[];
  subservices: Subservice[];
  services: Service[];
}) {
  const { lang, t } = useLanguage();
  const [expandedCategoryId, setExpandedCategoryId] = React.useState<string | null>(null);

  return (
    <div className="flex flex-col gap-4">
      {categories.map((category) => {
        const Icon = category.icon ? iconMap[category.icon] : undefined;
        const name = lang === "ar" ? category.nameAr ?? category.name : category.name;
        const description = lang === "ar" ? category.descriptionAr ?? category.description : category.description;
        const isOpen = expandedCategoryId === category.id;
        const categorySubservices = subservices.filter((s) => s.serviceCategoryId === category.id);
        const panelId = `category-panel-${category.id}`;

        return (
          <div key={category.id} className="overflow-hidden rounded-xl border border-border bg-card">
            {/* Heading wraps the trigger button (WAI-ARIA APG accordion
                pattern) rather than nesting a heading inside the button —
                a button's content model only permits phrasing content, and
                headings aren't phrasing content. `contents` keeps this
                wrapper from affecting layout. */}
            <h2 className="contents">
              <button
                type="button"
                onClick={() => setExpandedCategoryId(isOpen ? null : category.id)}
                aria-expanded={isOpen}
                aria-controls={panelId}
                className="flex w-full items-center gap-4 p-5 text-start transition-colors hover:bg-muted/50 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring"
              >
                <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-muted text-primary">
                  {Icon ? <Icon className="size-5" aria-hidden="true" /> : null}
                </span>
                <span className="flex flex-1 flex-col gap-0.5">
                  <span className="font-display text-base font-semibold leading-[1.2] tracking-tight text-foreground sm:text-lg">
                    {name}
                  </span>
                  <Body className="line-clamp-1 text-sm text-muted-foreground">{description}</Body>
                </span>
                <ChevronDown
                  className={cn("size-5 shrink-0 text-muted-foreground transition-transform", isOpen && "rotate-180")}
                  aria-hidden="true"
                />
              </button>
            </h2>

            {isOpen ? (
              <div id={panelId} className="border-t border-border bg-background/40 p-4 sm:p-5">
                <SubserviceList subservices={categorySubservices} services={services} lang={lang} t={t} />
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
