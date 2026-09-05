import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { getOrCreateStoreSettings } from "@/lib/settings-data";

/**
 * Store-wide maintenance-mode gate + Content-Security-Policy (Stage 9 —
 * Security Headers/CSP hardening) for every page this app serves.
 *
 * Named `proxy.ts`, not `middleware.ts` — Next.js 16 deprecated the
 * `middleware.ts` file convention in favor of `proxy.ts` (confirmed against
 * the installed 16.3.3: `next build` prints a deprecation warning for
 * `middleware.ts` and names the route "Proxy (Middleware)" in its route
 * summary either way).
 *
 * Runs in the **Node.js runtime** — a `proxy.ts` file always does in
 * Next.js 16 (unlike the old `middleware.ts`, which defaulted to Edge); an
 * explicit `runtime` in `config` is actually rejected at build time
 * ("Route segment config is not allowed in Proxy file... Proxy always runs
 * on Node.js runtime"), confirmed against this project's real Prisma setup
 * via an actual `next build` before this was wired up for real. Running in
 * Node.js means this shares the *same process* as the rest of the server,
 * so `getOrCreateStoreSettings()` reuses `lib/db.ts`'s existing pooled
 * Prisma singleton (`PrismaPg`, which needs the `pg` Node.js driver and
 * would not run on Edge) — no second connection pool, no Edge-compatible
 * rewrite of the data layer.
 *
 * ============================================================================
 * CSP + per-request nonce (Stage 9)
 * ============================================================================
 * A real fetch of this app's own rendered HTML shows Next.js App Router
 * emits genuine inline `<script>` blocks for its own RSC-streaming hydration
 * payload (`self.__next_f.push([...])`) on every single page — confirmed
 * empirically, not assumed. A `script-src 'self'` policy with no nonce and
 * no `'unsafe-inline'` would silently block every one of these and leave
 * every page non-interactive (no cart, no language toggle, no forms) while
 * still rendering visually — the worst kind of break, since it wouldn't
 * even 500. `'unsafe-inline'` for `script-src` was rejected as the fix
 * (Stage 9's own rule #10) in favor of Next's own documented, framework-
 * endorsed pattern: a fresh random nonce minted here on every request,
 * threaded through as both an `x-nonce` request header and embedded in the
 * `Content-Security-Policy` response header — Next.js detects the nonce in
 * that response header and automatically stamps it onto every inline/chunk
 * `<script>` tag IT generates for this request, with no further wiring
 * needed in the root layouts. `'strict-dynamic'` is included alongside it
 * (Next's own canonical example does the same): it lets those nonce'd
 * root scripts load same-origin code-split chunks without each chunk
 * needing its own nonce, which is how Turbopack's chunking actually works.
 *
 * This does mean every matched route is dynamically rendered (a nonce must
 * differ per request, so it can't be baked into a statically prerendered
 * page) — but this was already true for all but 4 routes before this change
 * (`/`, `/admin/*`, `/account/*`, etc. all already read the session cookie
 * in their root layouts — see CLAUDE.md's "Known, accepted trade-off").
 * The only routes this newly makes dynamic are `/maintenance` and
 * `/_not-found`, which were the sole remaining static HTML pages — a
 * negligible, one-time cost for a real XSS-mitigation upgrade, not the
 * "make the whole site dynamic just for a nonce" anti-pattern Stage 9's
 * brief explicitly warns against.
 *
 * **Why the matcher now includes `/admin` and `/maintenance`** (both used
 * to be excluded): CSP has to protect the Admin login/dashboard and the
 * maintenance notice too — a private backend and an unauthenticated page
 * are not less deserving of XSS hardening. The *maintenance-mode rewrite
 * logic itself* still explicitly skips both (see `isAdminPath`/
 * `isMaintenancePath` below) — broadening the matcher only changes which
 * paths get a CSP header, not which paths can be put into maintenance mode.
 *
 * **Why a rewrite, not a redirect** (avoids the "avoid redirect loops"
 * failure mode entirely, by construction, not by careful bookkeeping): a
 * redirect to `/maintenance` would change the browser's URL and could loop
 * if `/maintenance` itself were ever matched again; `NextResponse.rewrite()`
 * serves `/maintenance`'s content for the *original* requested URL without
 * changing what the browser shows or issuing a second request, so there is
 * no second pass through this proxy for the same navigation, and nothing to
 * loop.
 *
 * **Scope**: the `matcher` below excludes any path with a file extension
 * (`.*\..*`) — public static assets under `/public` (images, fonts, etc.)
 * aren't under `_next/static`/`_next/image` and were initially still
 * hitting this proxy on every request (visible as a `proxy.ts: ~100ms`
 * timing on plain `/images/*.svg` GETs in the dev server log — a wasted
 * `StoreSettings` read per static asset) until this was added. Non-GET
 * requests (Server Action POSTs, form submissions) are explicitly excluded
 * from the maintenance rewrite below, rather than rewritten — a rewritten
 * Server Action POST would not reach the action it was dispatched for.
 * Instead, the two mutation Server Actions that actually create real
 * records (`createOrder`, `createBooking`) independently re-check
 * `maintenanceMode` themselves — see the comment in
 * `app/(site)/checkout/actions.ts`'s `createOrder`. They still get a nonce/
 * CSP response header like every other request, for consistency — it's
 * harmless on a non-navigation response and keeps this function's logic
 * from needing a method-based early exit.
 *
 * **Fails open**: if the `StoreSettings` read itself throws (a transient DB
 * hiccup — see `lib/db.ts`'s own comment on the Supabase session-pooler
 * connection cap), this lets the request through as if maintenance mode
 * were off rather than taking the whole storefront down on top of whatever
 * the real problem is.
 */
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\..*).*)"],
};

/**
 * The full CSP, built fresh per request around that request's nonce.
 *
 * `img-src`/`font-src`/`connect-src` are all `'self'` only — deliberately
 * NOT the Supabase Storage origin, even though `next.config.ts`'s
 * `images.remotePatterns` allows the *server* to fetch from
 * `**.supabase.co`. A real fetch of this app's own product/service/booking
 * image markup confirms every `<Image>` that isn't a local, just-picked
 * file goes through Next's built-in optimizer, whose `src` the BROWSER
 * receives is always a same-origin `/_next/image?url=...` path — the actual
 * request to Supabase happens server-side, inside Next's image-optimization
 * handler, never from the browser. `blob:` is added to `img-src` for the
 * one real browser-side exception: the Admin Product Image
 * Manager/Add-Product picker and the Booking photo upload widget preview a
 * just-selected local file via `URL.createObjectURL()` before it's ever
 * uploaded (`unoptimized` `<Image>`s reading a `blob:` URL) — confirmed by
 * reading all three call sites. No `data:` is needed (no data-URI images
 * anywhere in the app — icons are inline `<svg>` via `lucide-react`, not
 * data URIs). Not adding the Supabase origin here is a *tighter* policy
 * than "allowlist it defensively," with zero functional cost, and it means
 * a compromised script could never exfiltrate data by opening a connection
 * to Supabase directly from the browser either way.
 *
 * `media-src`/`frame-src` are `'none'` — no `<video>`/`<audio>`/`<iframe>`
 * exists anywhere in this codebase (grepped, not assumed).
 *
 * `style-src` needs `'unsafe-inline'` — `next/font`'s fallback-font
 * size-adjust mechanism injects a small inline `<style>` tag per font
 * (confirmed: Next.js has no nonce-propagation story for its own generated
 * `<style>` tags the way it does for `<script>`), and this app's own
 * `components/hero/hero-3d-laptop.tsx` (the Three.js hero canvas wrapper)
 * and `components/shared/reveal.tsx` (the scroll-reveal fade) both set
 * real inline `style={{...}}` attributes. Style-attribute injection is a
 * materially narrower attack surface than script-src's (it can alter
 * appearance/exfiltrate via CSS tricks in rare cases, but can't run
 * arbitrary JS on its own), which is why Next's own official CSP guide
 * example uses exactly this same `style-src 'self' 'unsafe-inline';` —
 * not a shortcut taken here, the framework's documented baseline.
 */
function buildCsp(nonce: string, isProduction: boolean): string {
  // `'unsafe-eval'` — dev-mode only, added below, never in production.
  // Confirmed live (Stage 9): loading any page under `next dev` without it
  // throws real, unavoidable browser errors — "eval() is not supported in
  // this environment... React requires eval() in development mode for
  // various debugging features like reconstructing callstacks from a
  // different environment. React will never use eval() in production
  // mode." That's React's own console message, not a guess. Since it names
  // its own production behavior explicitly, the fix is to gate this
  // directive by `isProduction` exactly like `upgrade-insecure-requests`
  // below, not to weaken the real, user-facing policy to work around a
  // dev-only tool requirement (Stage 9 rule #8: only with a proven,
  // documented requirement — this is one, scoped to exactly where it
  // applies).
  const scriptSrc = isProduction
    ? `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'`
    : `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' 'unsafe-eval'`;

  const directives = [
    `default-src 'self'`,
    scriptSrc,
    `style-src 'self' 'unsafe-inline'`,
    `img-src 'self' blob:`,
    `font-src 'self'`,
    `connect-src 'self'`,
    `media-src 'none'`,
    `object-src 'none'`,
    `frame-src 'none'`,
    `frame-ancestors 'none'`,
    `worker-src 'self'`,
    `base-uri 'self'`,
    `form-action 'self'`,
  ];
  // Only in production: no deployed domain serves this over plain HTTP, so
  // there's nothing legitimate to "upgrade" away from. In dev, `next dev`
  // itself is plain HTTP on localhost — telling the browser to upgrade
  // every request would break the dev server outright.
  if (isProduction) {
    directives.push("upgrade-insecure-requests");
  }
  return directives.join("; ");
}

export default async function proxy(request: NextRequest) {
  const nonce = randomBytes(16).toString("base64");
  const isProduction = process.env.NODE_ENV === "production";
  const csp = buildCsp(nonce, isProduction);

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  // Next's own documented mechanism for propagating the nonce to its
  // internally-generated scripts reads it off the CSP header it sees
  // *coming in* on the request just as much as the one going out on the
  // response — set on both, matching the framework's canonical example.
  requestHeaders.set("Content-Security-Policy", csp);

  const { pathname } = request.nextUrl;
  const isAdminPath = pathname === "/admin" || pathname.startsWith("/admin/");
  const isMaintenancePath = pathname === "/maintenance";
  const isMaintenanceCheckEligible = (request.method === "GET" || request.method === "HEAD") && !isAdminPath && !isMaintenancePath;

  if (isMaintenanceCheckEligible) {
    try {
      const settings = await getOrCreateStoreSettings();
      if (settings.maintenanceMode) {
        const response = NextResponse.rewrite(new URL("/maintenance", request.url), {
          request: { headers: requestHeaders },
        });
        response.headers.set("Content-Security-Policy", csp);
        return response;
      }
    } catch (err) {
      console.error("proxy: maintenance-mode check failed, failing open:", err);
    }
  }

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set("Content-Security-Policy", csp);
  return response;
}
