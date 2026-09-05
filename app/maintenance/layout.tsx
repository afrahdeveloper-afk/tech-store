import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Space_Grotesk, IBM_Plex_Sans_Arabic } from "next/font/google";
import "../globals.css";

import { LanguageProvider } from "@/components/providers/language-provider";

/**
 * `/maintenance`'s own root layout — a third independent root layout
 * alongside `app/(site)/layout.tsx` and `app/admin/layout.tsx` (Next.js's
 * "multiple root layouts" pattern those two already establish; see
 * `app/admin/layout.tsx`'s header comment). Deliberately minimal: no
 * `Navbar`/`Footer`/`CartProvider`, and no `getCurrentCustomer()` session
 * read — a maintenance notice has no navigation, no cart, and no reason to
 * touch a customer session, so it stays a static page with one DB-free
 * render path even while the store itself is having trouble. `LanguageProvider`
 * is kept so the notice is still bilingual (the storefront's `localStorage`
 * language preference carries over, same as `app/admin/layout.tsx`).
 *
 * This route is never linked to and never reached by typing it in directly
 * in normal operation — `proxy.ts` rewrites every other customer-facing
 * page to this one internally (URL bar unchanged) while
 * `StoreSettings.maintenanceMode` is on; see that file for the routing
 * logic and why a rewrite (not a redirect) is used.
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
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#050505",
  colorScheme: "dark",
};

export default function MaintenanceLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      dir="ltr"
      className={`${geistSans.variable} ${geistMono.variable} ${spaceGrotesk.variable} ${plexArabic.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-background text-foreground">
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}
