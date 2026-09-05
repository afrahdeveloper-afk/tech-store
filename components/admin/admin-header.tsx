"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft, Bell, Languages, LogOut, Search, User } from "lucide-react";

import { useLanguage } from "@/components/providers/language-provider";
import { useAdminNavLinks } from "@/components/admin/use-admin-nav-links";
import { useDebouncedValue } from "@/lib/hooks/use-debounced-value";
import { adminLogout, adminSearchAction } from "@/app/admin/actions";
import { AdminMobileNav } from "@/components/admin/admin-mobile-nav";
import { Container } from "@/components/ui/container";
import { Input } from "@/components/ui/input";

export interface AdminHeaderProps {
  admin: { name: string; email: string };
  pendingOrders: number;
  pendingBookings: number;
}

/**
 * The Admin shell's top bar: breadcrumb, quick search, notifications
 * (real pending-order/booking counts — no fabricated notification feed, see
 * `lib/admin-data.ts`'s Dashboard stats), language toggle, admin profile
 * menu, and (mobile-only) the drawer trigger. One Client Component because
 * every piece of it either needs `useLanguage()` or local interaction state
 * — same reasoning `Navbar` documents for the storefront chrome.
 *
 * The breadcrumb's second segment is derived from `usePathname()` against
 * `useAdminNavLinks()` rather than passed down from each page — every
 * section's own nav label already exists in one place, so re-deriving it
 * here avoids threading a `breadcrumb` string prop through every route.
 *
 * Below `sm` there isn't room for the drawer trigger, a page title, the full
 * search bar, and the notification/profile controls all at once — cramming
 * them in was the original mobile bug. Instead: the current section's name
 * takes the header's middle slot on mobile (so the page you're on is always
 * visible, matching the desktop breadcrumb's job), and the search bar
 * collapses to an icon button that swaps the whole row into a dedicated
 * search mode (icon + input + close) rather than squeezing a live text field
 * in alongside everything else — the same "search takes over the bar"
 * pattern most mobile app headers use. `sm:` and up keeps the original
 * always-visible breadcrumb + inline search bar untouched.
 */
export function AdminHeader({ admin, pendingOrders, pendingBookings }: AdminHeaderProps) {
  const { t, lang, toggleLanguage } = useLanguage();
  const pathname = usePathname();
  const links = useAdminNavLinks();
  const currentSection = links.find((link) => (link.href === "/admin" ? pathname === "/admin" : pathname.startsWith(link.href)));
  const [mobileSearchOpen, setMobileSearchOpen] = React.useState(false);

  // Close mobile search mode on navigation (e.g. tapping a quick-search
  // result) — an "adjusting state during render" comparison, same pattern
  // `admin-mobile-nav.tsx` uses to close the drawer on route change, rather
  // than an effect + setState.
  const [lastPathname, setLastPathname] = React.useState(pathname);
  if (pathname !== lastPathname) {
    setLastPathname(pathname);
    if (mobileSearchOpen) setMobileSearchOpen(false);
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-backdrop-blur:bg-background/80">
      <Container className="flex h-16 items-center gap-2 py-0 sm:gap-3">
        {mobileSearchOpen ? (
          <div className="motion-safe:animate-in motion-safe:fade-in motion-safe:duration-150 flex w-full items-center gap-2 sm:hidden">
            <button
              type="button"
              onClick={() => setMobileSearchOpen(false)}
              aria-label={t.adminHeader.closeSearch}
              className="flex size-9 shrink-0 items-center justify-center rounded-md text-foreground transition hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring motion-safe:active:scale-[0.97]"
            >
              <ArrowLeft className="size-4.5 rtl:rotate-180" aria-hidden="true" />
            </button>
            <div className="min-w-0 flex-1">
              <AdminQuickSearch autoFocus />
            </div>
          </div>
        ) : (
          <>
            <AdminMobileNav />

            <nav aria-label="Breadcrumb" className="flex min-w-0 flex-1 items-center gap-1.5 text-sm font-medium text-muted-foreground sm:hidden">
              <span className="truncate text-foreground">{currentSection?.label ?? t.adminHeader.breadcrumbHome}</span>
            </nav>

            <nav aria-label="Breadcrumb" className="hidden shrink-0 items-center gap-1.5 text-sm font-medium text-muted-foreground sm:flex">
              <span>{t.adminHeader.breadcrumbHome}</span>
              {currentSection && currentSection.href !== "/admin" ? (
                <>
                  <span aria-hidden="true">/</span>
                  <span className="text-foreground">{currentSection.label}</span>
                </>
              ) : null}
            </nav>

            <div className="hidden min-w-0 flex-1 sm:block">
              <AdminQuickSearch />
            </div>

            <button
              type="button"
              onClick={() => setMobileSearchOpen(true)}
              aria-label={t.adminHeader.openSearch}
              className="flex size-9 shrink-0 items-center justify-center rounded-md text-foreground transition hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring motion-safe:active:scale-[0.97] sm:hidden"
            >
              <Search className="size-4.5" aria-hidden="true" />
            </button>

            <div className="flex shrink-0 items-center gap-1">
              <button
                type="button"
                onClick={toggleLanguage}
                aria-label={`${lang === "en" ? "التبديل إلى العربية" : "Switch to English"}`}
                className="hidden items-center gap-1.5 rounded-md px-2.5 py-2 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring motion-safe:active:scale-[0.97] sm:flex"
              >
                <Languages className="size-4" aria-hidden="true" />
                {t.adminHeader.switchLanguageTo}
              </button>

              <AdminNotifications pendingOrders={pendingOrders} pendingBookings={pendingBookings} />
              <AdminProfileMenu admin={admin} />
            </div>
          </>
        )}
      </Container>
    </header>
  );
}

/** Debounced global search over Products/Customers/Orders — see `app/admin/actions.ts`'s `adminSearchAction`. */
function AdminQuickSearch({ autoFocus }: { autoFocus?: boolean }) {
  const { t, lang } = useLanguage();
  const [query, setQuery] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const debounced = useDebouncedValue(query.trim(), 300);
  const [status, setStatus] = React.useState<"idle" | "loading" | "done">("idle");
  const [results, setResults] = React.useState<{
    products: { id: string; slug: string; name: string; nameAr: string | null }[];
    customers: { id: string; name: string; email: string }[];
    orders: { id: string; orderNumber: string }[];
  }>({ products: [], customers: [], orders: [] });
  const containerRef = React.useRef<HTMLDivElement>(null);

  // "loading" is entered during render when `debounced` changes to a
  // non-empty value (React's sanctioned "adjusting state" pattern — same
  // idea as `products-explorer.tsx`'s `lastQueryKey` reset) rather than via
  // `setState` inside the effect below, which `react-hooks/set-state-in-effect`
  // flags as a cascading-render risk. When `debounced` is empty the effect
  // below skips fetching entirely and `status`/`results` are simply left as
  // they were — harmless, since the panel only renders while `query` (the
  // live, undebounced value) is non-empty.
  const [lastDebounced, setLastDebounced] = React.useState(debounced);
  if (debounced !== lastDebounced) {
    setLastDebounced(debounced);
    if (debounced) setStatus("loading");
  }

  React.useEffect(() => {
    if (!debounced) return;
    let cancelled = false;
    adminSearchAction(debounced).then((result) => {
      if (!cancelled) {
        setResults(result);
        setStatus("done");
      }
    });
    return () => {
      cancelled = true;
    };
  }, [debounced]);

  React.useEffect(() => {
    function onClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const hasResults = results.products.length > 0 || results.customers.length > 0 || results.orders.length > 0;
  const showPanel = open && query.trim().length > 0;

  return (
    <div ref={containerRef} className="relative mx-auto w-full max-w-md">
      <div className="relative">
        <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
        <Input
          type="search"
          value={query}
          autoFocus={autoFocus}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              setOpen(false);
              (event.target as HTMLInputElement).blur();
            }
          }}
          placeholder={t.adminHeader.searchPlaceholder}
          aria-label={t.adminHeader.searchLabel}
          className="ps-9"
        />
      </div>

      {showPanel ? (
        <div
          role="listbox"
          aria-label={t.adminHeader.searchLabel}
          className="motion-safe:animate-in motion-safe:fade-in motion-safe:duration-150 absolute top-full z-50 mt-2 w-full max-h-96 overflow-y-auto rounded-lg border border-border bg-card p-2 shadow-xl"
        >
          {status !== "done" ? (
            <p className="px-3 py-4 text-center text-sm text-muted-foreground">{t.adminHeader.searchingLabel}</p>
          ) : !hasResults ? (
            <p className="px-3 py-4 text-center text-sm text-muted-foreground">{t.adminHeader.searchNoResults}</p>
          ) : (
            <div className="flex flex-col gap-3">
              {results.products.length > 0 ? (
                <SearchGroup label={t.adminHeader.searchProductsGroup}>
                  {results.products.map((product) => (
                    <Link
                      key={product.id}
                      href={`/products/${product.slug}`}
                      target="_blank"
                      className="block truncate rounded-md px-3 py-2 text-sm text-foreground hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                    >
                      {lang === "ar" ? (product.nameAr ?? product.name) : product.name}
                    </Link>
                  ))}
                </SearchGroup>
              ) : null}
              {results.customers.length > 0 ? (
                <SearchGroup label={t.adminHeader.searchCustomersGroup}>
                  {results.customers.map((customer) => (
                    <Link
                      key={customer.id}
                      href="/admin/customers"
                      className="block truncate rounded-md px-3 py-2 text-sm text-foreground hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                    >
                      {customer.name} — <span className="text-muted-foreground">{customer.email}</span>
                    </Link>
                  ))}
                </SearchGroup>
              ) : null}
              {results.orders.length > 0 ? (
                <SearchGroup label={t.adminHeader.searchOrdersGroup}>
                  {results.orders.map((order) => (
                    <Link
                      key={order.id}
                      href="/admin/orders"
                      className="block truncate rounded-md px-3 py-2 font-mono text-sm text-foreground hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                    >
                      {order.orderNumber}
                    </Link>
                  ))}
                </SearchGroup>
              ) : null}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}

function SearchGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="px-3 pb-1 text-xs font-semibold tracking-wide text-muted-foreground uppercase">{label}</p>
      <div className="flex flex-col">{children}</div>
    </div>
  );
}

/** Real, data-derived "notifications" — pending order/booking counts, not a fabricated feed. */
function AdminNotifications({ pendingOrders, pendingBookings }: { pendingOrders: number; pendingBookings: number }) {
  const { t } = useLanguage();
  const [open, setOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const total = pendingOrders + pendingBookings;

  React.useEffect(() => {
    function onClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const ordersLabel = (pendingOrders === 1 ? t.adminHeader.pendingOrdersNotificationOne : t.adminHeader.pendingOrdersNotificationOther).replace(
    "{count}",
    String(pendingOrders)
  );
  const bookingsLabel = (pendingBookings === 1
    ? t.adminHeader.pendingBookingsNotificationOne
    : t.adminHeader.pendingBookingsNotificationOther
  ).replace("{count}", String(pendingBookings));

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-label={t.adminHeader.notificationsLabel}
        aria-expanded={open}
        className="relative flex size-9 items-center justify-center rounded-md text-foreground transition hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring motion-safe:active:scale-[0.97]"
      >
        <Bell className="size-4.5" aria-hidden="true" />
        {total > 0 ? (
          <span
            aria-hidden="true"
            className="absolute -end-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 font-mono text-[0.6875rem] leading-none font-semibold text-primary-foreground"
          >
            {total > 99 ? "99+" : total}
          </span>
        ) : null}
      </button>

      {open ? (
        <div className="motion-safe:animate-in motion-safe:fade-in motion-safe:zoom-in-95 motion-safe:duration-150 absolute end-0 top-full z-50 mt-2 w-72 max-w-[calc(100vw-2rem)] origin-top-right rounded-lg border border-border bg-card p-2 shadow-xl rtl:origin-top-left">
          {total === 0 ? (
            <p className="px-3 py-4 text-center text-sm text-muted-foreground">{t.adminHeader.noNotifications}</p>
          ) : (
            <div className="flex flex-col gap-1">
              {pendingOrders > 0 ? (
                <Link
                  href="/admin/orders"
                  className="rounded-md px-3 py-2.5 text-sm text-foreground transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                >
                  {ordersLabel}
                </Link>
              ) : null}
              {pendingBookings > 0 ? (
                <Link
                  href="/admin/bookings"
                  className="rounded-md px-3 py-2.5 text-sm text-foreground transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                >
                  {bookingsLabel}
                </Link>
              ) : null}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}

function AdminProfileMenu({ admin }: { admin: { name: string; email: string } }) {
  const { t } = useLanguage();
  const [open, setOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function onClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-label={t.adminHeader.profileMenuLabel}
        aria-expanded={open}
        className="flex size-9 items-center justify-center rounded-full bg-muted text-foreground transition hover:bg-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring motion-safe:active:scale-[0.97]"
      >
        <User className="size-4.5" aria-hidden="true" />
      </button>

      {open ? (
        <div className="motion-safe:animate-in motion-safe:fade-in motion-safe:zoom-in-95 motion-safe:duration-150 absolute end-0 top-full z-50 mt-2 w-64 max-w-[calc(100vw-2rem)] origin-top-right rounded-lg border border-border bg-card p-2 shadow-xl rtl:origin-top-left">
          <div className="border-b border-border px-3 py-2.5">
            <p className="truncate text-sm font-semibold text-foreground">{admin.name}</p>
            <p className="truncate text-xs text-muted-foreground">{admin.email}</p>
          </div>
          <form action={adminLogout} className="pt-1">
            <button
              type="submit"
              className="flex min-h-10 w-full items-center gap-2.5 rounded-md px-3 text-start text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              <LogOut className="size-4 shrink-0" aria-hidden="true" />
              {t.adminNav.logout}
            </button>
          </form>
        </div>
      ) : null}
    </div>
  );
}
