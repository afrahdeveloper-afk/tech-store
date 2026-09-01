"use client";

import * as React from "react";
import { Inbox, Package, Search, Wrench } from "lucide-react";

import type { ActivityItem } from "@/lib/account-data";
import { useLanguage } from "@/components/providers/language-provider";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/shared/empty-state";
import { OrderCard } from "@/components/account/order-card";
import { BookingCard } from "@/components/account/booking-card";

type Tab = "all" | "products" | "services";

/**
 * `/account/orders`'s tabs + search over the customer's already-fetched
 * combined history — see CLAUDE.md's Search step: one customer's history is
 * small and bounded, so this filters the in-memory `items` array on every
 * keystroke rather than debouncing a network request (there is no request
 * to make; `items` was fetched once, server-side, by the route).
 */
export function ActivityExplorer({ items }: { items: ActivityItem[] }) {
  const { t, lang, dir } = useLanguage();
  const [tab, setTab] = React.useState<Tab>("all");
  const [query, setQuery] = React.useState("");
  const tabRefs = React.useRef<(HTMLButtonElement | null)[]>([]);

  const statusLabel = React.useCallback(
    (status: ActivityItem["status"]): string => {
      const labels: Record<ActivityItem["status"], string> = {
        PENDING: t.accountActivity.statusPending,
        CONFIRMED: t.accountActivity.statusConfirmed,
        SHIPPED: t.accountActivity.statusShipped,
        DELIVERED: t.accountActivity.statusDelivered,
        COMPLETED: t.accountActivity.statusCompleted,
        CANCELLED: t.accountActivity.statusCancelled,
      };
      return labels[status];
    },
    [t]
  );

  const matchesQuery = React.useCallback(
    (item: ActivityItem, normalizedQuery: string): boolean => {
      if (!normalizedQuery) return true;

      const haystack: (string | null | undefined)[] =
        item.kind === "order"
          ? [
              item.number,
              statusLabel(item.status),
              ...item.items.flatMap((line) => [
                line.productNameSnapshot,
                lang === "ar" ? line.productNameArLive : null,
                lang === "ar" ? line.categoryNameAr : line.categoryName,
              ]),
            ]
          : [
              item.number,
              statusLabel(item.status),
              lang === "ar" ? item.serviceNameAr ?? item.serviceName : item.serviceName,
              lang === "ar" ? item.categoryNameAr ?? item.categoryName : item.categoryName,
              lang === "ar" ? item.subserviceNameAr ?? item.subserviceName : item.subserviceName,
            ];

      return haystack.some((value) => value?.toLowerCase().includes(normalizedQuery));
    },
    [lang, statusLabel]
  );

  const tabFiltered = React.useMemo(() => {
    if (tab === "products") return items.filter((item) => item.kind === "order");
    if (tab === "services") return items.filter((item) => item.kind === "booking");
    return items;
  }, [items, tab]);

  const visibleItems = React.useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return tabFiltered.filter((item) => matchesQuery(item, normalizedQuery));
  }, [tabFiltered, query, matchesQuery]);

  const hasAnyActivity = items.length > 0;
  const isSearching = query.trim().length > 0;

  const tabs: { id: Tab; label: string }[] = [
    { id: "all", label: t.accountActivity.tabAll },
    { id: "products", label: t.accountActivity.tabProducts },
    { id: "services", label: t.accountActivity.tabServices },
  ];

  // WAI-ARIA APG "Tabs" pattern: roving tabindex, arrow keys move focus AND
  // selection (automatic activation — matches the existing click-to-select
  // behavior). Arrow direction follows visual/reading order, so it flips in
  // RTL (ArrowRight moves toward the visually-previous tab there), same
  // reasoning as `rtl:rotate-180` elsewhere in this codebase.
  const focusTab = (index: number) => {
    const wrapped = (index + tabs.length) % tabs.length;
    setTab(tabs[wrapped].id);
    tabRefs.current[wrapped]?.focus();
  };

  const handleTabKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
    const forward = dir === "rtl" ? "ArrowLeft" : "ArrowRight";
    const backward = dir === "rtl" ? "ArrowRight" : "ArrowLeft";

    if (event.key === forward) {
      event.preventDefault();
      focusTab(index + 1);
    } else if (event.key === backward) {
      event.preventDefault();
      focusTab(index - 1);
    } else if (event.key === "Home") {
      event.preventDefault();
      focusTab(0);
    } else if (event.key === "End") {
      event.preventDefault();
      focusTab(tabs.length - 1);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="relative">
        <label htmlFor="activity-search" className="sr-only">
          {t.accountActivity.searchLabel}
        </label>
        <Search
          className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          id="activity-search"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t.accountActivity.searchPlaceholder}
          className="ps-9"
        />
      </div>

      <div role="tablist" aria-label={t.accountActivity.pageHeading} className="flex gap-1 border-b border-border">
        {tabs.map((item, index) => (
          <button
            key={item.id}
            ref={(el) => {
              tabRefs.current[index] = el;
            }}
            type="button"
            role="tab"
            id={`activity-tab-${item.id}`}
            aria-selected={tab === item.id}
            aria-controls="activity-panel"
            tabIndex={tab === item.id ? 0 : -1}
            onClick={() => setTab(item.id)}
            onKeyDown={(event) => handleTabKeyDown(event, index)}
            className={cn(
              "border-b-2 px-3 py-2.5 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
              tab === item.id
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div id="activity-panel" role="tabpanel" aria-labelledby={`activity-tab-${tab}`} className="flex flex-col gap-4">
        {visibleItems.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {visibleItems.map((item) =>
              item.kind === "order" ? <OrderCard key={item.id} order={item} /> : <BookingCard key={item.id} booking={item} />
            )}
          </div>
        ) : isSearching ? (
          <EmptyState
            icon={Search}
            title={t.accountActivity.emptySearchTitle}
            description={t.accountActivity.emptySearchDescription}
          />
        ) : !hasAnyActivity ? (
          <EmptyState icon={Inbox} title={t.accountActivity.emptyAllTitle} description={t.accountActivity.emptyAllDescription} />
        ) : tab === "products" ? (
          <EmptyState
            icon={Package}
            title={t.accountActivity.emptyOrdersTitle}
            description={t.accountActivity.emptyOrdersDescription}
            action={{ label: t.cart.browseProducts, href: "/products" }}
          />
        ) : tab === "services" ? (
          <EmptyState
            icon={Wrench}
            title={t.accountActivity.emptyBookingsTitle}
            description={t.accountActivity.emptyBookingsDescription}
            action={{ label: t.accountActivity.browseServices, href: "/services" }}
          />
        ) : (
          // Unreachable in practice: `hasAnyActivity` true + tab "all" + no
          // search query always leaves at least one visible item. Kept as a
          // defensive fallback rather than assuming that invariant forever.
          <EmptyState icon={Inbox} title={t.accountActivity.emptyAllTitle} description={t.accountActivity.emptyAllDescription} />
        )}
      </div>
    </div>
  );
}
