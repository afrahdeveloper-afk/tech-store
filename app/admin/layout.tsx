import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Space_Grotesk, IBM_Plex_Sans_Arabic } from "next/font/google";
import "../globals.css";

import { LanguageProvider } from "@/components/providers/language-provider";
import { ToastProvider } from "@/components/providers/toast-provider";

/**
 * Admin's own root layout (Phase 12 — Admin Dashboard). A second, independent
 * root layout alongside `app/(site)/layout.tsx` — Next.js's supported
 * "multiple root layouts" pattern via route groups (this project already
 * uses a route group for `app/(site)/services/(list)/`). Deliberately does
 * NOT render the public `Navbar`/`Footer`, and does NOT wrap children in
 * `CartProvider` — Admin has nothing to do with the storefront cart. It
 * shares the same `globals.css` design tokens as the public site (one
 * import, one source of truth — not duplicated) so Admin stays visually
 * on-brand (dark surfaces, the one green accent) without being a literal
 * extension of the customer-facing chrome.
 *
 * `LanguageProvider` *is* wired in (reversing this file's original
 * English-only decision, at the user's explicit direction for the full
 * Admin Dashboard build) — it reuses the exact same client-side toggle the
 * storefront uses, `localStorage` key and all, so an admin's language
 * preference is shared with the storefront on the same browser. See
 * `components/providers/language-provider.tsx` for why `<html>` still
 * renders a static `lang="en" dir="ltr"` default below: the toggle syncs
 * `document.documentElement` directly after hydration, exactly like
 * `app/(site)/layout.tsx` does.
 *
 * This layout does NOT itself gate authentication — `/admin/login` must be
 * reachable while signed out, and it lives under this same root layout so it
 * gets the same `<html>/<body>`/fonts/styles. The actual auth guard lives one
 * level down, in `app/admin/(dashboard)/layout.tsx`, which only wraps the
 * authenticated section.
 */

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const plexArabic = IBM_Plex_Sans_Arabic({
  variable: "--font-arabic",
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "Admin — Speed Core",
    template: "%s — Speed Core Admin",
  },
  description: "Speed Core store administration.",
  // Belt-and-suspenders alongside app/robots.ts's "/admin" disallow rule —
  // a private admin backend should never be indexable, even if robots.txt
  // were ever bypassed or ignored.
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#050505",
  colorScheme: "dark",
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      dir="ltr"
      className={`${geistSans.variable} ${geistMono.variable} ${spaceGrotesk.variable} ${plexArabic.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-background text-foreground">
        <LanguageProvider>
          <ToastProvider>
            {/* One `<main>` landmark for the whole admin app (login included) —
                `app/admin/(dashboard)/layout.tsx` adds header chrome above
                `{children}` without introducing a second one. */}
            <main className="flex flex-1 flex-col">{children}</main>
          </ToastProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
