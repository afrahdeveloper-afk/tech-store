"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Gauge, Languages, Menu, ShoppingCart, User, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { useLanguage } from "@/components/providers/language-provider";
import { useCart } from "@/components/providers/cart-provider";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";

/**
 * Global navbar (Phase 2). Client Component because it needs the language
 * toggle, active-route highlighting, and a mobile menu — see the
 * architecture note in `language-provider.tsx` for why translated chrome
 * can't stay server-rendered.
 */

function useNavLinks() {
  const { t } = useLanguage();
  return [
    { href: "/", label: t.nav.home },
    { href: "/products", label: t.nav.products },
    { href: "/services", label: t.nav.services },
    { href: "/booking", label: t.nav.booking },
    { href: "/about", label: t.nav.about },
  ];
}

export function Navbar({ customer }: { customer: { name: string } | null }) {
  const { t, lang, toggleLanguage } = useLanguage();
  const { count } = useCart();
  const pathname = usePathname();
  const links = useNavLinks();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const menuButtonRef = React.useRef<HTMLButtonElement>(null);
  const firstMobileLinkRef = React.useRef<HTMLAnchorElement>(null);

  // Close the mobile menu on route change. Adjusted during render (React's
  // sanctioned way to reset state in response to a prop/derived value
  // change) rather than in an effect — see the "Adjusting state" pattern in
  // https://react.dev/learn/you-might-not-need-an-effect.
  const [lastPathname, setLastPathname] = React.useState(pathname);
  if (pathname !== lastPathname) {
    setLastPathname(pathname);
    setMobileOpen(false);
  }

  // Move focus into the panel when it opens. Closing via a nav link is left
  // alone (navigation already moves focus/context); closing explicitly
  // (toggle button or Escape, below) returns focus to the toggle instead.
  React.useEffect(() => {
    if (mobileOpen) {
      firstMobileLinkRef.current?.focus();
    }
  }, [mobileOpen]);

  const closeMobileMenu = () => {
    setMobileOpen(false);
    menuButtonRef.current?.focus();
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-backdrop-blur:bg-background/80">
      <Container className="flex h-16 items-center justify-between gap-4">
        <Link
          href="/"
          className="flex items-center gap-2 rounded-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
        >
          <span className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Gauge className="size-4.5" aria-hidden="true" />
          </span>
          <span className="font-display text-lg font-semibold tracking-tight text-foreground">
            Speed Core
          </span>
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-1 lg:flex">
          {links.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                  isActive && "text-foreground"
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={toggleLanguage}
            className="hidden items-center gap-1.5 rounded-md px-2.5 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring sm:flex"
            aria-label={`${lang === "en" ? "التبديل إلى العربية" : "Switch to English"}`}
          >
            <Languages className="size-4" aria-hidden="true" />
            {t.nav.switchLanguageTo}
          </button>

          <Link
            href={customer ? "/account" : "/login"}
            className="flex size-9 items-center justify-center rounded-md text-foreground transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            aria-label={customer ? t.nav.account : t.nav.login}
          >
            <User className="size-4.5" aria-hidden="true" />
          </Link>

          <Link
            href="/cart"
            className="relative flex size-9 items-center justify-center rounded-md text-foreground transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            aria-label={count > 0 ? `${t.nav.cart} (${count})` : t.nav.cart}
          >
            <ShoppingCart className="size-4.5" aria-hidden="true" />
            {count > 0 ? (
              <span
                aria-hidden="true"
                className="absolute -end-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 font-mono text-[0.6875rem] leading-none font-semibold text-primary-foreground"
              >
                {count > 99 ? "99+" : count}
              </span>
            ) : null}
          </Link>

          <Button asChild size="lg" className="hidden lg:inline-flex">
            <Link href="/booking">{t.nav.bookService}</Link>
          </Button>

          <button
            ref={menuButtonRef}
            type="button"
            onClick={() => (mobileOpen ? closeMobileMenu() : setMobileOpen(true))}
            className="flex size-9 items-center justify-center rounded-md text-foreground transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring lg:hidden"
            aria-label={mobileOpen ? t.nav.closeMenu : t.nav.openMenu}
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav"
          >
            {mobileOpen ? (
              <X className="size-5" aria-hidden="true" />
            ) : (
              <Menu className="size-5" aria-hidden="true" />
            )}
          </button>
        </div>
      </Container>

      <div
        id="mobile-nav"
        onKeyDown={(event) => {
          if (event.key === "Escape") closeMobileMenu();
        }}
        className={cn(
          "overflow-hidden border-t border-border bg-background transition-[max-height] duration-300 ease-out lg:hidden",
          mobileOpen ? "max-h-96" : "max-h-0 border-t-0"
        )}
      >
        <Container className="flex flex-col gap-1 py-3">
          {links.map((link, index) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                ref={index === 0 ? firstMobileLinkRef : undefined}
                href={link.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground",
                  isActive && "bg-muted text-foreground"
                )}
              >
                {link.label}
              </Link>
            );
          })}
          <Link
            href={customer ? "/account" : "/login"}
            className="flex items-center gap-1.5 rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            <User className="size-4" aria-hidden="true" />
            {customer ? t.nav.account : t.nav.login}
          </Link>
          <button
            type="button"
            onClick={toggleLanguage}
            className="flex items-center gap-1.5 rounded-md px-3 py-2.5 text-start text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            <Languages className="size-4" aria-hidden="true" />
            {t.nav.switchLanguageTo}
          </button>
          <Button asChild size="lg" className="mt-2">
            <Link href="/booking">{t.nav.bookService}</Link>
          </Button>
        </Container>
      </div>
    </header>
  );
}
