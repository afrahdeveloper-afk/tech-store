import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
     allowedDevOrigins: ['192.168.68.113'],
  // Pin the workspace root: a stray package.json/package-lock.json exists at
  // C:\Users\HP (an unrelated leftover, not a real project — see the home
  // CLAUDE.md) which Turbopack would otherwise try to infer as the root.
  turbopack: {
    root: path.join(__dirname),
  },
  // Global Image System — `next/image` refuses to optimize a remote host
  // unless it's explicitly allowlisted. Photos are served from Supabase
  // Storage, always `<project-ref>.supabase.co` (see lib/storage.ts) —
  // wildcarded so this keeps working across dev/staging/prod Supabase
  // projects without editing this file again. Two distinct path shapes,
  // both needed (Security Correction, Sept 2026): `.../object/public/...`
  // for the public product bucket, `.../object/sign/...` for signed booking
  // photo URLs — the private bucket's objects are only ever reachable
  // through the latter, never the former.
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.supabase.co", pathname: "/storage/v1/object/public/**" },
      { protocol: "https", hostname: "**.supabase.co", pathname: "/storage/v1/object/sign/**" },
    ],
  },
  // Global Image System — Next's default Server Action request body limit is
  // 1MB, far below `lib/image-limits.ts`'s stated 5MB-per-image cap (already
  // true for the single-file Admin Product Image Manager/Booking Image
  // Upload today — a >~1MB photo would be rejected by Next itself before
  // ever reaching `lib/storage.ts`) and well below what Add Product's new
  // upload-after-create step needs (up to `MAX_PRODUCT_IMAGES` files in one
  // Server Action call). Raised to comfortably cover the worst case:
  // 10 × 5MB (`MAX_PRODUCT_IMAGES` × the per-image cap) plus multipart overhead.
  //
  // Known trade-off (Stage 8 — API & Input Security audit): Next.js applies
  // `bodySizeLimit` globally, to every Server Action in the app — there is
  // no per-route/per-action limit as of this Next.js version. Raising it for
  // image uploads therefore also raises the ceiling for every *other*
  // action (`login`, `register`, `createOrder`, `createBooking`, every admin
  // mutation): a request can pad any single text field up to ~55MB before
  // this project's own `exceedsMaxLength` checks ever get a chance to reject
  // it, since Next has already buffered the whole body by then. This is a
  // real, understood residual risk, not an oversight — narrowing it would
  // need either a smaller shared limit (breaking the legitimate multi-image
  // upload case) or per-route enforcement Next.js doesn't natively support
  // (a `proxy.ts` content-length gate can't reliably distinguish one Server
  // Action from another, since they all post to the same page URL) — both
  // are a deliberate, separate decision for a future session, not a
  // "smallest safe change" fix to make inside this one.
  experimental: {
    serverActions: {
      bodySizeLimit: "55mb",
    },
  },
  // Baseline response headers, applied to every route (F-04, extended in
  // Stage 9 — Security Headers/CSP hardening). `Content-Security-Policy`
  // itself is deliberately NOT set here any more — it moved to `proxy.ts`,
  // which needs to mint a fresh per-request nonce for Next's own inline
  // hydration scripts (see that file's module comment for the full
  // reasoning) and a static `headers()` entry can't generate per-request
  // values. Setting CSP in both places would leave two
  // `Content-Security-Policy` headers on the same response — browsers
  // enforce multiple CSP headers as an intersection of *all* of them, which
  // would work here (this old policy was a subset of the new one) but is
  // needless duplication for no benefit, so it was removed from here
  // instead of merely left redundant.
  async headers() {
    const isProduction = process.env.NODE_ENV === "production";
    return [
      {
        source: "/:path*",
        headers: [
          // Clickjacking protection (the audit's specific concern: /login,
          // /admin/login, /checkout embedded in an attacker's iframe for UI
          // redressing) — `proxy.ts`'s CSP now also sends `frame-ancestors
          // 'none'` on top of this; the two aren't contradictory, they say
          // the same thing through the legacy header and its modern CSP
          // equivalent, which is the standard defense-in-depth pairing
          // (older browsers that don't understand `frame-ancestors` still
          // get real protection from this header).
          { key: "X-Frame-Options", value: "DENY" },
          // Defense-in-depth, no functional risk to this app:
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // Cross-Origin-Opener-Policy (Stage 9): isolates this app's
          // browsing context from any *other*-origin window that tries to
          // hold a reference to it (e.g. one it opened via `window.open`) —
          // real, low-level protection against cross-origin window-reference
          // attacks (Spectre-class info leaks). Safe to add unconditionally:
          // unlike COEP, it doesn't require every cross-origin subresource
          // to opt in with its own headers, and this app has no legitimate
          // need for cross-origin window interaction (no OAuth popups, no
          // payment-provider iframes, no third-party embeds).
          //
          // `Cross-Origin-Embedder-Policy`/`Cross-Origin-Resource-Policy`
          // were evaluated and deliberately NOT added — COEP in particular
          // (`require-corp`) would need every cross-origin subresource this
          // app loads (there are effectively none left after this stage's
          // CSP work — fonts are self-hosted, images proxy same-origin
          // through `/_next/image`) to be individually verified compatible
          // in a real deployed environment first; the marginal benefit over
          // COOP alone doesn't justify that risk for this app's threat
          // model (no `SharedArrayBuffer`/cross-origin-isolation feature is
          // used anywhere in this codebase).
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
          // Only disables browser features this app never uses anywhere
          // (no camera/mic capture, no geolocation, no payment/usb/bluetooth
          // API usage anywhere in the codebase — grepped, not assumed); does
          // not touch fullscreen (product image galleries), WebGL/canvas
          // (the Three.js hero), or anything else the app actually relies on.
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), bluetooth=(), interest-cohort=()",
          },
          // HSTS only in a production build (`next start`), never `next dev`
          // — NODE_ENV is "development" under `next dev`, so this is
          // structurally never sent to a local dev server. Safe even if a
          // production build is ever run locally over plain HTTP: per the
          // HSTS spec (RFC 6797), browsers only ever honor this header when
          // it arrives over an actual HTTPS connection — one delivered over
          // HTTP is simply ignored, so this can't create an HTTP-only-dev
          // problem either way. `includeSubDomains` added (Stage 9) — this
          // app has no subdomains today, so it costs nothing, and it's the
          // standard hardening once HSTS is enabled at all. Still no
          // `preload`: that's a one-way, hard-to-reverse submission to
          // browsers' built-in preload lists, appropriate only once a real,
          // stable production domain exists — none is deployed yet.
          ...(isProduction ? [{ key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" }] : []),
        ],
      },
    ];
  },
};

export default nextConfig;
