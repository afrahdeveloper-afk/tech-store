import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Space_Grotesk, IBM_Plex_Sans_Arabic } from "next/font/google";
import "../globals.css";

import { LanguageProvider } from "@/components/providers/language-provider";
import { CartProvider } from "@/components/providers/cart-provider";
import { getCurrentCustomer } from "@/lib/auth/current-customer";
import { getOrCreateStoreSettings } from "@/lib/settings-data";
import { Navbar } from "@/components/layout/navbar/navbar";
import { Footer } from "@/components/layout/footer/footer";
import { SITE_NAME, SITE_URL } from "@/lib/site-config";

// Body / UI text (Latin). Variable name matches the `--font-sans` theme
// token consumed in app/globals.css.
const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

// Technical/code text — prices, SKUs, spec sheets.
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Display/heading face (Latin only) — see the Design System Reference in
// CLAUDE.md for why this pairing was chosen over the default Geist-everywhere look.
const spaceGrotesk = Space_Grotesk({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

// Arabic-ready display + body face. Used for both headings and body text in
// `[dir="rtl"]` contexts once Arabic content ships — kept as one family so the
// hierarchy doesn't rely on a second Arabic display face that may not exist yet.
const plexArabic = IBM_Plex_Sans_Arabic({
  variable: "--font-arabic",
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700"],
});

const SITE_TITLE = "Speed Core — Premium Tech Store & IT Maintenance";
const SITE_DESCRIPTION =
  "Shop premium technology and book professional IT repair and maintenance services.";

export const metadata: Metadata = {
  // Base URL every relative metadata URL (canonical/OG/Twitter `url`/`images`
  // fields) resolves against — see lib/site-config.ts for why this reads an
  // env var instead of a hardcoded domain (no production domain exists yet).
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_TITLE,
    // Every route in this app already sets its own full, final title (e.g.
    // "{Product Name} — Speed Core") rather than a short segment name, so
    // the template passes it through unchanged instead of appending the
    // brand suffix a second time.
    template: "%s",
  },
  description: SITE_DESCRIPTION,
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
};

// The site has one dark theme (no toggle) — see the rebrand note in
// app/globals.css — so both the browser chrome tint and native form-control
// rendering should follow it rather than the OS's own light/dark guess.
export const viewport: Viewport = {
  themeColor: "#050505",
  colorScheme: "dark",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  // No locale routing exists yet (see Main Routes in CLAUDE.md — none are
  // locale-prefixed). When Arabic routes are added, `lang`/`dir` must be
  // derived from the active locale and always change together.
  const lang = "en";
  const dir = "ltr";

  // Resolved server-side (cookie-derived, never trusted from the client) so
  // the Navbar's account entry point can render correctly on first paint —
  // see the Customer Account phase's Security rules in CLAUDE.md.
  //
  // Stage 14 — Production Readiness: this is a ROOT layout (one of this
  // project's "multiple root layouts" — see CLAUDE.md), so a thrown error
  // here has nothing above it to catch it except `global-error.tsx`, which
  // doesn't exist — an unguarded transient DB hiccup (this project has
  // documented history of the Supabase session-pooler's connection cap
  // producing exactly this kind of transient failure) would take down
  // Next's generic, unbranded fallback error page for the ENTIRE public
  // storefront, not just one page. `proxy.ts`'s own maintenance-mode check
  // already "fails open" on this exact same `getOrCreateStoreSettings()`
  // read for exactly this reason; this applies that same, already-approved
  // pattern here instead of leaving it inconsistently applied. Falling back
  // to `customer: null` is always safe (identical to "not signed in",
  // already a fully handled state everywhere `getCurrentCustomer()` is
  // read); the `storeSettings` fallback mirrors the schema's own defaults
  // (`prisma/schema.prisma`'s `StoreSettings` model) so the footer renders
  // the same contact info it always would on a fresh, unconfigured row.
  let customer: Awaited<ReturnType<typeof getCurrentCustomer>> = null;
  let storeSettings: Awaited<ReturnType<typeof getOrCreateStoreSettings>> = {
    id: "",
    storeName: "Speed Core",
    storeNameAr: null,
    contactEmail: "support@speedcore.example",
    contactPhone: "+966 11 234 5678",
    contactAddress: null,
    contactAddressAr: null,
    currency: "IQD",
    maintenanceMode: false,
    updatedAt: new Date(0),
  };
  try {
    [customer, storeSettings] = await Promise.all([getCurrentCustomer(), getOrCreateStoreSettings()]);
  } catch (err) {
    // Next.js's own `cookies()`/dynamic-rendering bailout mechanism works by
    // throwing a special internal error (`digest: "DYNAMIC_SERVER_USAGE"`,
    // confirmed by reading a real build's output) that Next's OWN rendering
    // pipeline must see in order to correctly mark this route dynamic — a
    // blanket catch here would silently swallow that internal control-flow
    // signal instead of a genuine failure. Re-throw anything carrying a
    // `digest` (Next's convention for these internal signals) and only
    // apply the safe-defaults fallback to a real, unexpected error (e.g.
    // this project's documented transient Supabase pool-exhaustion errors).
    if (err && typeof err === "object" && "digest" in err) {
      throw err;
    }
    console.error("Root layout: failed to resolve customer/store settings, rendering with safe defaults:", err);
  }

  return (
    <html
      lang={lang}
      dir={dir}
      className={`${geistSans.variable} ${geistMono.variable} ${spaceGrotesk.variable} ${plexArabic.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <LanguageProvider>
          <CartProvider>
            <Navbar customer={customer ? { name: customer.name } : null} />
            <main className="flex-1">{children}</main>
            <Footer settings={storeSettings} />
          </CartProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
