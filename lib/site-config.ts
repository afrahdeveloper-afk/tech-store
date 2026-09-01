/**
 * Site-wide constants for SEO metadata (`app/layout.tsx`, `app/robots.ts`,
 * `app/sitemap.ts`, and the product/service detail routes' `generateMetadata`).
 *
 * No production domain is configured anywhere in this project yet — no
 * `vercel.json`/deployment config, no git remote, no `NEXT_PUBLIC_SITE_URL`
 * (or similar) previously set in `.env`/`.env.example`. Rather than invent a
 * domain, `SITE_URL` reads an explicit env var and falls back to the local
 * dev URL, so metadata/robots/sitemap all resolve to *something* valid today
 * and become correct for production the moment a real domain is set — see
 * `.env.example` for the variable to fill in at deploy time.
 */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.trim() || "http://localhost:3000";

export const SITE_NAME = "Speed Core";
