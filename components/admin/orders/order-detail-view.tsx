"use client";

import type { AdminOrderDetail } from "@/lib/admin-data";
import type { OrderStatus } from "@/lib/generated/prisma/enums";
import { useLanguage } from "@/components/providers/language-provider";
import { Breadcrumb } from "@/components/shared/breadcrumb";
import { OrderStatusForm } from "@/components/admin/orders/order-status-form";
import { OrderStatusTimeline } from "@/components/admin/orders/order-status-timeline";
import { Small } from "@/components/ui/typography";

export function OrderDetailView({ order }: { order: AdminOrderDetail }) {
  const { t, lang } = useLanguage();
  const locale = lang === "ar" ? "ar-SA" : "en-US";
  const dateFormatter = new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" });

  const statusLabel: Record<OrderStatus, string> = {
    PENDING: t.accountActivity.statusPending,
    CONFIRMED: t.accountActivity.statusConfirmed,
    SHIPPED: t.accountActivity.statusShipped,
    DELIVERED: t.accountActivity.statusDelivered,
    CANCELLED: t.accountActivity.statusCancelled,
  };

  return (
    <div className="flex flex-col gap-6 p-4 pb-10 sm:p-6 lg:p-8">
      <Breadcrumb items={[{ label: t.adminHeader.breadcrumbHome, href: "/admin" }, { label: t.adminOrders.heading, href: "/admin/orders" }, { label: order.orderNumber }]} />

      <div className="flex flex-col gap-1">
        <h1 className="font-display text-2xl font-semibold text-foreground sm:text-3xl">
          {t.adminOrders.detailTitle} <span className="font-mono">{order.orderNumber}</span>
        </h1>
        <Small className="text-muted-foreground">
          {t.adminOrders.placedOnLabel} {dateFormatter.format(order.createdAt)}
        </Small>
      </div>

      {/* Status management — kept as the first, unmissable card right under
          the header (not buried in a sidebar) so "current status" and "next
          action" are the first thing an admin sees on this page. */}
      <section className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5">
        <OrderStatusForm orderId={order.id} status={order.status} />
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          <section className="flex flex-col gap-3 rounded-xl border border-border bg-card p-5">
            <h2 className="text-base font-semibold text-foreground">{t.adminOrders.itemsHeading}</h2>

            {/* Mobile (<sm): one stacked block per line item instead of a
                shrunk 4-column table. */}
            <ul className="flex flex-col divide-y divide-border sm:hidden">
              {order.items.map((item) => (
                <li key={item.id} className="flex flex-col gap-1 py-3 first:pt-0">
                  <div className="flex items-start justify-between gap-3">
                    <span className="text-foreground">{item.productNameSnapshot}</span>
                    <span className="shrink-0 font-mono text-foreground">{item.lineTotal.toLocaleString(locale)}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {t.adminOrders.columnQuantity}: {item.quantity} · {t.adminOrders.columnUnitPrice}: {item.unitPrice.toLocaleString(locale)}
                  </span>
                </li>
              ))}
            </ul>

            <div className="hidden overflow-x-auto sm:block">
              <table className="w-full min-w-[480px] border-collapse text-sm">
                <thead>
                  <tr className="border-b border-border text-xs font-medium text-muted-foreground">
                    <th className="py-2 text-start font-medium">{t.adminOrders.columnProduct}</th>
                    <th className="py-2 text-start font-medium">{t.adminOrders.columnQuantity}</th>
                    <th className="py-2 text-start font-medium">{t.adminOrders.columnUnitPrice}</th>
                    <th className="py-2 text-end font-medium">{t.adminOrders.columnLineTotal}</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item) => (
                    <tr key={item.id} className="border-b border-border last:border-0">
                      <td className="py-2.5 text-foreground">{item.productNameSnapshot}</td>
                      <td className="py-2.5 text-muted-foreground">{item.quantity}</td>
                      <td className="py-2.5 font-mono text-muted-foreground">{item.unitPrice.toLocaleString(locale)}</td>
                      <td className="py-2.5 text-end font-mono text-foreground">{item.lineTotal.toLocaleString(locale)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col gap-1.5 border-t border-border pt-3 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>{t.adminOrders.subtotalLabel}</span>
                <span className="font-mono">
                  {order.subtotal.toLocaleString(locale)} {order.currency}
                </span>
              </div>
              {order.discountTotal > 0 ? (
                <div className="flex justify-between text-muted-foreground">
                  <span>{t.adminOrders.discountLabel}</span>
                  <span className="font-mono">
                    -{order.discountTotal.toLocaleString(locale)} {order.currency}
                  </span>
                </div>
              ) : null}
              <div className="flex justify-between text-base font-semibold text-foreground">
                <span>{t.adminOrders.totalLabel}</span>
                <span className="font-mono text-primary">
                  {order.total.toLocaleString(locale)} {order.currency}
                </span>
              </div>
            </div>
          </section>

          {order.notes ? (
            <section className="flex flex-col gap-2 rounded-xl border border-border bg-card p-5">
              <h2 className="text-base font-semibold text-foreground">{t.adminOrders.notesLabel}</h2>
              <p className="text-sm text-muted-foreground">{order.notes}</p>
            </section>
          ) : null}
        </div>

        <div className="flex flex-col gap-6">
          <section className="flex flex-col gap-3 rounded-xl border border-border bg-card p-5">
            <h2 className="text-base font-semibold text-foreground">{t.adminOrders.timelineHeading}</h2>
            <OrderStatusTimeline
              status={order.status}
              statusLabel={statusLabel}
              createdLabel={t.adminOrders.timelineOrderCreated}
              createdAtLabel={dateFormatter.format(order.createdAt)}
            />
          </section>

          <section className="flex flex-col gap-2 rounded-xl border border-border bg-card p-5">
            <h2 className="text-base font-semibold text-foreground">{t.adminOrders.customerInfoHeading}</h2>
            <p className="text-sm text-foreground">{order.customerName}</p>
            <p className="text-sm text-muted-foreground">{order.customerEmail}</p>
            <p className="font-mono text-sm text-muted-foreground">{order.customerPhone}</p>
          </section>
        </div>
      </div>
    </div>
  );
}
