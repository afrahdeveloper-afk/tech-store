"use client";

import type { OrderDetail } from "@/lib/account-data";
import { useLanguage } from "@/components/providers/language-provider";
import { Container } from "@/components/ui/container";
import { Breadcrumb } from "@/components/shared/breadcrumb";
import { StatusBadge } from "@/components/account/status-badge";
import { StatusTimeline } from "@/components/account/status-timeline";
import { Caption, Display, H2, Small, Label } from "@/components/ui/typography";

const TERMINAL_STATUSES = new Set(["DELIVERED", "CANCELLED"]);

/** `/account/orders/[id]` — Step 9's order details page. */
export function OrderDetailView({ order }: { order: OrderDetail }) {
  const { t, lang } = useLanguage();
  const locale = lang === "ar" ? "ar-SA" : "en-US";
  const formattedDate = new Intl.DateTimeFormat(locale, { dateStyle: "long" }).format(order.createdAt);
  const formattedUpdatedDate = new Intl.DateTimeFormat(locale, { dateStyle: "long" }).format(order.updatedAt);
  const formatPrice = (value: number) => value.toLocaleString(locale);
  const showLastUpdated = TERMINAL_STATUSES.has(order.status);

  return (
    <Container className="flex flex-col gap-8 py-10 sm:py-12 lg:py-14">
      <div className="flex flex-col gap-4">
        <Breadcrumb
          items={[
            { label: t.productDetails.breadcrumbHome, href: "/" },
            { label: t.accountOrderDetails.breadcrumbAccount, href: "/account" },
            { label: t.accountOrderDetails.breadcrumbOrders, href: "/account/orders" },
            { label: order.number },
          ]}
        />
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex flex-col gap-2">
            <Caption className="text-accent">{t.accountOrderDetails.heading}</Caption>
            <Display as="h1" className="text-2xl sm:text-3xl" dir="ltr">
              {order.number}
            </Display>
            <Small className="text-muted-foreground">{formattedDate}</Small>
          </div>
          <StatusBadge status={order.status} />
        </div>
      </div>

      <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-6">
        <StatusTimeline kind="order" status={order.status} />
        {showLastUpdated ? (
          <Small className="text-muted-foreground">
            {t.statusTimeline.lastUpdatedLabel}: {formattedUpdatedDate}
          </Small>
        ) : null}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:items-start">
        <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-6 lg:col-span-2">
          <H2 as="h2" className="text-lg">
            {t.accountOrderDetails.productLabel}
          </H2>
          <ul className="flex flex-col">
            {order.items.map((item) => (
              <li
                key={item.id}
                className="flex flex-col gap-1 border-b border-border py-3 last:border-0 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
              >
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm text-foreground">{item.productNameSnapshot}</span>
                  <Small className="text-muted-foreground">
                    {t.cart.quantityLabel}: {item.quantity} · {t.accountOrderDetails.unitPriceLabel}: {formatPrice(item.unitPrice)}{" "}
                    {order.currency}
                  </Small>
                </div>
                <span className="shrink-0 font-mono text-sm font-semibold text-foreground">
                  {formatPrice(item.lineTotal)} {order.currency}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-6">
          <div className="flex items-center justify-between">
            <Small className="text-muted-foreground">{t.checkout.subtotalLabel}</Small>
            <span className="font-mono text-sm text-foreground">
              {formatPrice(order.subtotal)} {order.currency}
            </span>
          </div>
          <div className="flex items-center justify-between border-t border-border pt-4">
            <Small className="font-medium text-foreground">{t.checkout.totalLabel}</Small>
            <span className="font-mono text-lg font-semibold text-primary">
              {formatPrice(order.total)} {order.currency}
            </span>
          </div>

          <div className="flex flex-col gap-2 border-t border-border pt-4">
            <Label>{t.accountOrderDetails.customerInfoHeading}</Label>
            <Small className="text-foreground">{order.customerName}</Small>
            <Small className="text-muted-foreground" dir="ltr">
              {order.customerEmail}
            </Small>
            <Small className="text-muted-foreground" dir="ltr">
              {order.customerPhone}
            </Small>
          </div>
        </div>
      </div>
    </Container>
  );
}
