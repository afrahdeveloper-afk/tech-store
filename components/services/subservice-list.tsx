"use client";

import * as React from "react";
import { ChevronDown, Wrench } from "lucide-react";

import type { Service, Subservice } from "@/types";
import type { Dictionary, Lang } from "@/lib/i18n/translations";
import { cn } from "@/lib/utils";
import { EmptyState } from "@/components/shared/empty-state";
import { ServiceItemCard } from "./service-item-card";

/**
 * Step 5 — the second accordion level, nested inside an expanded category
 * from `service-categories-explorer.tsx`: each Subservice row expands to
 * reveal its actual bookable `Service`s (`ServiceItemCard`). One subservice
 * open at a time within a category, matching CLAUDE.md's "avoid unnecessary
 * animations… subtle transitions only where they improve usability".
 *
 * `services` (the full flat list, fetched server-side — real Prisma query,
 * Phase 12b) is passed down from `ServiceCategoriesExplorer`, same as
 * `subservices` — this component filters it client-side exactly like it
 * used to filter `mockServiceItems`.
 */
export function SubserviceList({
  subservices,
  services,
  lang,
  t,
}: {
  subservices: Subservice[];
  services: Service[];
  lang: Lang;
  t: Dictionary;
}) {
  const [expandedId, setExpandedId] = React.useState<string | null>(null);

  return (
    <div className="flex flex-col gap-3">
      {subservices.map((subservice) => {
        const name = lang === "ar" ? subservice.nameAr ?? subservice.name : subservice.name;
        const items = services.filter((service) => service.subserviceId === subservice.id);
        const isOpen = expandedId === subservice.id;
        const panelId = `subservice-panel-${subservice.id}`;

        return (
          <div key={subservice.id} className="overflow-hidden rounded-lg border border-border bg-card">
            <button
              type="button"
              onClick={() => setExpandedId(isOpen ? null : subservice.id)}
              aria-expanded={isOpen}
              aria-controls={panelId}
              className="flex w-full items-center justify-between gap-3 px-4 py-3 text-start transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring"
            >
              <span className="text-sm font-medium text-foreground">{name}</span>
              <span className="flex shrink-0 items-center gap-2 text-xs font-medium text-muted-foreground">
                {t.services.viewServicesCta}
                <ChevronDown
                  className={cn("size-4 transition-transform", isOpen && "rotate-180")}
                  aria-hidden="true"
                />
              </span>
            </button>

            {isOpen ? (
              <div id={panelId} className="border-t border-border p-4">
                {items.length > 0 ? (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {items.map((service) => (
                      <ServiceItemCard key={service.id} service={service} lang={lang} t={t} />
                    ))}
                  </div>
                ) : (
                  <EmptyState icon={Wrench} title={t.services.emptyTitle} description={t.services.emptyDescription} />
                )}
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
