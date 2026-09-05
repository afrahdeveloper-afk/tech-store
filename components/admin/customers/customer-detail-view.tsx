"use client";

import Link from "next/link";
import { Inbox } from "lucide-react";

import type { AdminCustomerDetail } from "@/lib/admin-data";
import type { ActivityItem } from "@/lib/account-data";
import { ADMIN_PAGE_SIZE } from "@/lib/admin-pagination";
import { parsePageParam } from "@/lib/pagination";
import { useAdminListParams } from "@/lib/hooks/use-admin-list-params";
import { useLanguage } from "@/components/providers/language-provider";
import { Breadcrumb } from "@/components/shared/breadcrumb";
import { EmptyState } from "@/components/shared/empty-state";
import { Pagination } from "@/components/products/pagination";
import { StatusBadge } from "@/components/account/status-badge";
import { Small } from "@/components/ui/typography";

/**
 * `/admin/customers/[id]` — contact info + full order/booking history.
 * `activity` comes from `lib/account-data.ts`'s `getCustomerActivity`
 * (reused as-is, not duplicated — see `lib/admin-data.ts`'s
 * `getAdminCustomerById` note). Deliberately NOT reusing
 * `components/account/{order-card,booking-card}.tsx`: those link to
 * `/account/orders/[id]`/`/account/bookings/[id]`, which gate on the
 * *signed-in customer* matching the record — wrong route for an admin
 * browsing someone else's history. This view links to the `/admin/orders/
 * [id]`/`/admin/bookings/[id]` equivalents instead.
 *
 * `activity` itself is still fetched unpaginated (one customer's history is
 * small/bounded — same reasoning `components/account/activity-explorer.tsx`
 * documents for the customer-facing equivalent), but a customer with a long
 * history rendered every row in one unbroken list with no way to page
 * through it. Paginated here purely client-side — slicing the array that's
 * already on the client — reusing the same `?page=` URL param + `Pagination`
 * component + `t.products.pagination*` labels every admin list page already
 * uses, rather than adding a new param name, a new `Pagination` variant, or
 * a new set of translation keys for one section.
 */
export function CustomerDetailView({ customer, activity }: { customer: AdminCustomerDetail; activity: ActivityItem[] }) {
  const { t, lang } = useLanguage();
  const locale = lang === "ar" ? "ar-SA" : "en-US";
  const dateFormatter = new Intl.DateTimeFormat(locale, { dateStyle: "medium" });

  const { searchParams, buildPageHref } = useAdminListParams();
  const totalPages = Math.max(1, Math.ceil(activity.length / ADMIN_PAGE_SIZE));
  const page = Math.min(parsePageParam(searchParams.get("page")), totalPages);
  const pageItems = activity.slice((page - 1) * ADMIN_PAGE_SIZE, page * ADMIN_PAGE_SIZE);

  return (
    <div className="flex flex-col gap-6 p-4 pb-10 sm:p-6 lg:p-8">
      <Breadcrumb items={[{ label: t.adminHeader.breadcrumbHome, href: "/admin" }, { label: t.adminCustomers.heading, href: "/admin/customers" }, { label: customer.name }]} />

      <h1 className="font-display text-2xl font-semibold text-foreground sm:text-3xl">{customer.name}</h1>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <section className="flex flex-col gap-2 rounded-xl border border-border bg-card p-5">
          <h2 className="text-base font-semibold text-foreground">{t.adminCustomers.contactHeading}</h2>
          <p className="text-sm text-foreground">{customer.email}</p>
          <p className="font-mono text-sm text-muted-foreground">{customer.phone}</p>
          <Small className="text-muted-foreground">
            {t.adminCustomers.columnJoined}: {dateFormatter.format(customer.createdAt)}
          </Small>
        </section>

        <section className="flex flex-col gap-3 rounded-xl border border-border bg-card p-5 lg:col-span-2">
          <h2 className="text-base font-semibold text-foreground">{t.adminCustomers.activityHeading}</h2>
          {activity.length === 0 ? (
            <EmptyState icon={Inbox} title={t.adminCustomers.noActivity} description={t.adminCustomers.description} />
          ) : (
            <>
              <ul className="flex flex-col divide-y divide-border">
                {pageItems.map((item) =>
                  item.kind === "order" ? (
                    <li key={item.id} className="flex items-center justify-between gap-3 py-3">
                      <Link
                        href={`/admin/orders/${item.id}`}
                        className="min-w-0 rounded-sm font-mono text-sm text-foreground underline-offset-2 transition-colors hover:text-primary hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                      >
                        {item.number}
                      </Link>
                      <div className="flex shrink-0 items-center gap-2">
                        <span className="font-mono text-sm text-muted-foreground">
                          {item.total.toLocaleString(locale)} {item.currency}
                        </span>
                        <StatusBadge status={item.status} />
                      </div>
                    </li>
                  ) : (
                    <li key={item.id} className="flex items-center justify-between gap-3 py-3">
                      <Link
                        href={`/admin/bookings/${item.id}`}
                        className="min-w-0 rounded-sm font-mono text-sm text-foreground underline-offset-2 transition-colors hover:text-primary hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                      >
                        {item.number}
                      </Link>
                      <div className="flex shrink-0 items-center gap-2">
                        <span className="truncate text-sm text-muted-foreground">
                          {lang === "ar" ? (item.serviceNameAr ?? item.serviceName) : item.serviceName}
                        </span>
                        <StatusBadge status={item.status} />
                      </div>
                    </li>
                  )
                )}
              </ul>
              <div className="pt-2">
                <Pagination
                  page={page}
                  totalPages={totalPages}
                  previousHref={page > 1 ? buildPageHref(page - 1) : null}
                  nextHref={page < totalPages ? buildPageHref(page + 1) : null}
                  previousLabel={t.products.paginationPrevious}
                  nextLabel={t.products.paginationNext}
                  pageOfLabel={t.products.paginationPageOf}
                />
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
