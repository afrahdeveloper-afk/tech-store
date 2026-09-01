import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Space_Grotesk, IBM_Plex_Sans_Arabic } from "next/font/google";
import "./globals.css";

import { LanguageProvider } from "@/components/providers/language-provider";
import { CartProvider } from "@/components/providers/cart-provider";
import { getCurrentCustomer } from "@/lib/auth/current-customer";
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
  const customer = await getCurrentCustomer();

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
            <Footer />
          </CartProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
