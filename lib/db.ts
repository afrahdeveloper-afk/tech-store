/**
 * Server-only Prisma Client singleton.
 *
 * Prisma ORM 7 requires an explicit driver adapter for SQL providers (see
 * the prisma-upgrade-v7 skill) — `PrismaPg` wraps `pg` against
 * `DATABASE_URL`. Never import this from a Client Component (see CLAUDE.md
 * "do not access Prisma from Client Components") — only from Server
 * Components, route handlers, or server actions.
 *
 * The `globalThis` cache avoids exhausting the connection pool from
 * duplicate clients created by Next.js dev-mode hot reload.
 *
 * Pool size is phase-aware — build time and runtime have very different
 * concurrency needs and were wrongly sharing one constant:
 *
 * - **Build time** (`next build`'s static-generation workers, detected via
 *   `NEXT_PHASE === PHASE_PRODUCTION_BUILD`): capped at 3. Each of the 7
 *   parallel workers (since Phase 12b wired the catalog into
 *   `generateStaticParams`/`generateMetadata` across every page) is its own
 *   process with its own pool; at `pg`'s default of 10 that exceeded
 *   Supabase's session-pooler cap ("max clients reached in session mode:
 *   pool_size: 15" — `DATABASE_URL` uses the session pooler, port 5432, see
 *   the Database Foundation note in CLAUDE.md). 7 workers × 3 stays
 *   comfortably under 15 with room for `prisma migrate`/Studio alongside.
 * - **Runtime** (`next dev` or a started `next start` — always exactly one
 *   process, never 7 concurrent workers): 10. The same `max: 3` cap was
 *   silently reused here too, and a single admin page routinely needs *more*
 *   than 3 simultaneous connections (the layout's admin lookup, a list
 *   page's now-parallel `count()` + `findMany()`, a filter dropdown's own
 *   query, and the header's own `Promise.all` of 7 dashboard-stat queries,
 *   the last two both now streamed via `<Suspense>` so they genuinely
 *   overlap the page's own fetch instead of waiting behind it). Every burst
 *   beyond 3 either queued for a free connection or opened a brand new one
 *   — and each new connection to a remote Postgres instance pays a real
 *   TCP+TLS+auth handshake (measured ~500-600ms against this project's
 *   Supabase instance, vs. ~75ms for a query on an already-warm one) — which
 *   was the actual, measured cause of "admin pages feel slow", not query
 *   complexity against this project's small dataset. 10 stays well under
 *   the session pooler's 15-connection cap for the one process using it.
 */
import { PrismaClient } from "@/lib/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { PHASE_PRODUCTION_BUILD } from "next/constants";
import fs from "node:fs";
import path from "node:path";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

const isBuildPhase = process.env.NEXT_PHASE === PHASE_PRODUCTION_BUILD;

// Stage 10 — Secrets/Environment hardening: `DATABASE_URL` had no presence
// check at all — an unset value would reach `PrismaPg` as `undefined` and
// only fail lazily, on the first real query, with a less obvious error.
// Matches the same fail-fast-at-module-load pattern `lib/auth/session.ts`/
// `lib/auth/admin-session.ts` already use for their own secrets.
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set — see .env.example.");
}

// TLS upgrade to full certificate verification (Database Role Hardening,
// Sept 2026 — follow-up to the TLS remediation below): Supabase's own CA
// certificate, downloaded from Dashboard -> Database -> SSL Configuration
// -> "Download certificate" and checked in at `certs/prod-ca-2021.crt`.
// Read once at module load (same lifetime as `adapter` below) — a missing/
// unreadable file fails loud at startup rather than silently falling back
// to an unverified connection, which is the correct behavior for a
// security control like this one.
const supabaseCaCert = fs.readFileSync(path.resolve(process.cwd(), "certs/prod-ca-2021.crt"));

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
  max: isBuildPhase ? 3 : 10,
  // Database Security Audit (Sept 2026), TLS remediation — history:
  // `DATABASE_URL` had no `sslmode` param, and without an explicit `ssl`
  // option `pg` doesn't attempt TLS at all against this host — confirmed
  // empirically (a throwaway probe script, deleted after use) via
  // `pg_stat_ssl`, which only reports a completed TLS handshake when one is
  // actually requested. `ssl: true` (full certificate verification, Node's
  // default CA store) was tested first and failed outright — Supabase's
  // pooler endpoint (`*.pooler.supabase.com`) presents a certificate chain
  // issued by Supabase's own CA, which Node's default public trust store
  // doesn't recognize ("self-signed certificate in certificate chain").
  // `rejectUnauthorized: false` was the interim safe middle ground:
  // encrypted, not identity-verified.
  //
  // Now upgraded to full verification (`verify-full` equivalent) by
  // supplying that same CA explicitly via `ca` above — `rejectUnauthorized`
  // is back to `true`, so a certificate NOT signed by Supabase's real CA
  // (e.g. a MITM presenting a different certificate) is rejected outright,
  // not just encrypted-and-trusted-anyway.
  ssl: { ca: supabaseCaCert, rejectUnauthorized: true },
});

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
