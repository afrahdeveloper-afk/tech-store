"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

import type { OrderActivityItem } from "@/lib/account-data";
import { useLanguage } from "@/components/providers/language-provider";
import { StatusBadge } from "@/components/account/status-badge";
import { H3, Small } from "@/components/ui/typography";

/** One product order in `/account/orders`'s combined history — Step 4's card. */
export function OrderCard({ order }: { order: OrderActivityItem }) {
  const { t, lang } = useLanguage();
  const locale = lang === "ar" ? "ar-SA" : "en-US";
  const formattedDate = new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(order.createdAt);
  const productNames = order.items.map((item) => item.productNameSnapshot).join(", ");
  const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);
  const itemsLabel = (itemCount === 1 ? t.accountActivity.itemsCountOne : t.accountActivity.itemsCountOther).replace(
    "{count}",
    String(itemCount)
  );

  return (
    <Link
      href={`/account/orders/${order.id}`}
      className="group flex flex-col gap-3 rounded-xl border border-border bg-card p-5 transition-all hover:border-primary/40 hover:shadow-lg hover:shadow-black/30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <Small className="text-muted-foreground">
            {t.accountActivity.orderNumberLabel} · {formattedDate}
          </Small>
          <span className="font-mono text-sm font-semibold text-foreground" dir="ltr">
            {order.number}
          </span>
        </div>
        <StatusBadge status={order.status} />
      </div>

      <H3 as="h3" className="text-base font-semibold leading-snug">
        {productNames}
      </H3>

      <div className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-border pt-3">
        <Small className="text-muted-foreground">{itemsLabel}</Small>
        <div className="flex items-center gap-3">
          <span className="font-mono text-sm font-semibold text-primary">
            {order.total.toLocaleString(locale)} {order.currency}
          </span>
          <span className="flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors group-hover:text-accent">
            {t.services.viewDetailsCta}
            <ArrowRight className="size-3.5 rtl:rotate-180" aria-hidden="true" />
          </span>
        </div>
      </div>
    </Link>
  );
}
