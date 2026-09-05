"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Gauge, Languages, LogOut, Menu, X } from "lucide-react";

import { useLanguage } from "@/components/providers/language-provider";
import { useAdminNavLinks } from "@/components/admin/use-admin-nav-links";
import { adminLogout } from "@/app/admin/actions";
import { cn } from "@/lib/utils";

/**
 * Mobile/tablet (<1024px) admin navigation drawer — an off-canvas panel
 * (not `AdminSidebar`'s persistent rail, not `DashboardMobileNav`'s
 * horizontal tab strip: the Admin brief specifically asks for a drawer).
 * Owns its own trigger + open state, same self-contained shape as
 * `Navbar`'s mobile menu — rendered by `AdminHeader`, visible only `lg:hidden`.
 * Slides from the inline-start edge so it opens from the correct side in
 * both LTR and RTL without separate positioning logic (`start-0` + a
 * `-translate-x-full`/`rtl:translate-x-full` closed state).
 */
export function AdminMobileNav() {
  const { t, toggleLanguage } = useLanguage();
  const pathname = usePathname();
  const links = useAdminNavLinks();
  const [open, setOpen] = React.useState(false);
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const firstLinkRef = React.useRef<HTMLAnchorElement>(null);

  const [lastPathname, setLastPathname] = React.useState(pathname);
  if (pathname !== lastPathname) {
    setLastPathname(pathname);
    setOpen(false);
  }

  // The overlay/panel below is portaled to `document.body` (see the render
  // below) rather than left in place under `AdminHeader`'s `backdrop-blur`.
  // `backdrop-filter` establishes a new containing block for `position:
  // fixed` descendants in Chromium/Firefox — with the drawer nested inside
  // it, `fixed inset-0` resolved against the header's own 64px box instead
  // of the viewport, collapsing the "full-screen" overlay/panel to a 64px
  // sliver (found via a real-browser check while auditing the drawer, not
  // caught by the `scrollWidth` overflow check since nothing here scrolls
  // the page). Portaling to `body` sidesteps the containing-block issue
  // entirely rather than depending on no ancestor ever using a filter/
  // transform. `mounted` guards `createPortal` against the SSR pass, where
  // `document` doesn't exist yet — harmless to skip pre-hydration since the
  // drawer always starts closed. `useSyncExternalStore` with a no-op
  // subscribe (there's no real store — just "has this client mounted yet")
  // is this codebase's established way to get a one-time, post-hydration-only
  // client value without `setState` inside an effect, which the project's
  // `react-hooks/set-state-in-effect` lint rule flags (see
  // `language-provider.tsx`/`admin-sidebar.tsx`'s own collapse state).
  const mounted = React.useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  React.useEffect(() => {
    if (open) firstLinkRef.current?.focus();
  }, [open]);

  const close = React.useCallback(() => {
    setOpen(false);
    triggerRef.current?.focus();
  }, []);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(true)}
        aria-label={t.adminHeader.openMenu}
        aria-expanded={open}
        aria-controls="admin-mobile-nav-panel"
        className="flex size-9 items-center justify-center rounded-md text-foreground transition hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring motion-safe:active:scale-[0.97] lg:hidden"
      >
        <Menu className="size-5" aria-hidden="true" />
      </button>

      {mounted
        ? createPortal(
            <div
              className={cn("fixed inset-0 z-50 lg:hidden", open ? "pointer-events-auto" : "pointer-events-none")}
              aria-hidden={!open}
            >
              <div
                onClick={close}
                className={cn(
                  "absolute inset-0 bg-background/80 backdrop-blur-sm transition-opacity duration-300",
                  open ? "opacity-100" : "opacity-0"
                )}
              />
              <div
                id="admin-mobile-nav-panel"
                role="dialog"
                aria-modal="true"
                aria-label={t.adminNav.ariaLabel}
                onKeyDown={(event) => {
                  if (event.key === "Escape") close();
                }}
                className={cn(
                  "absolute start-0 top-0 flex h-full w-72 max-w-[85vw] flex-col gap-1 border-e border-border bg-card p-3 shadow-xl transition-transform duration-300 ease-drawer motion-reduce:transition-none",
                  open ? "translate-x-0" : "-translate-x-full rtl:translate-x-full"
                )}
              >
                <div className="mb-2 flex h-11 items-center justify-between gap-2 px-2">
                  <Link href="/admin" className="flex items-center gap-2 rounded-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">
                    <span className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
                      <Gauge className="size-4.5" aria-hidden="true" />
                    </span>
                    <span className="font-display text-base font-semibold tracking-tight text-foreground">Speed Core</span>
                  </Link>
                  <button
                    type="button"
                    onClick={close}
                    aria-label={t.adminHeader.closeMenu}
                    className="flex size-9 items-center justify-center rounded-md text-foreground transition hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring motion-safe:active:scale-[0.97]"
                  >
                    <X className="size-5" aria-hidden="true" />
                  </button>
                </div>

                <div className="flex flex-1 flex-col gap-1 overflow-y-auto">
                  {links.map((link, index) => {
                    const isActive = link.href === "/admin" ? pathname === "/admin" : pathname.startsWith(link.href);
                    const Icon = link.icon;
                    return (
                      <Link
                        key={link.href}
                        ref={index === 0 ? firstLinkRef : undefined}
                        href={link.href}
                        aria-current={isActive ? "page" : undefined}
                        className={cn(
                          "flex min-h-11 items-center gap-2.5 rounded-md border-s-2 border-transparent px-3 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring motion-safe:active:scale-[0.97]",
                          isActive && "border-primary bg-muted text-foreground"
                        )}
                      >
                        <Icon className="size-4.5 shrink-0" aria-hidden="true" />
                        {link.label}
                      </Link>
                    );
                  })}
                </div>

                <div className="my-1 border-t border-border" aria-hidden="true" />

                <button
                  type="button"
                  onClick={toggleLanguage}
                  className="flex min-h-11 w-full items-center gap-2.5 rounded-md px-3 text-start text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring motion-safe:active:scale-[0.97]"
                >
                  <Languages className="size-4.5 shrink-0" aria-hidden="true" />
                  {t.adminHeader.switchLanguageTo}
                </button>

                <form action={adminLogout}>
                  <button
                    type="submit"
                    className="flex min-h-11 w-full items-center gap-2.5 rounded-md px-3 text-start text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring motion-safe:active:scale-[0.97]"
                  >
                    <LogOut className="size-4.5 shrink-0" aria-hidden="true" />
                    {t.adminNav.logout}
                  </button>
                </form>
              </div>
            </div>,
            document.body
          )
        : null}
    </>
  );
}
