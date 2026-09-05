import { headers } from "next/headers";

/**
 * Brute-force / credential-stuffing protection for `/admin/login` only —
 * Admin Login Security hardening phase. Deliberately narrow: this module is
 * imported by `app/admin/login/actions.ts` and nowhere else. It never
 * touches `Customer` auth (`app/(site)/login/actions.ts`,
 * `lib/auth/session.ts`) and never touches an already-authenticated Admin
 * request (`getCurrentAdmin()`, every `/admin/*` page/Server Action) — it
 * only throttles the login *attempt* itself, per this phase's explicit
 * scope.
 *
 * STORAGE: a plain in-memory `Map`, scoped to this one Node.js process.
 * Deliberately NOT a new Prisma model and NOT an external store (Redis/
 * Upstash/etc.) — the task this shipped under says not to add either
 * without stopping to ask first. See the "PROCESS-LOCAL" note below for
 * exactly what that means in production.
 *
 * ============================================================================
 * PROCESS-LOCAL, NOT DISTRIBUTED — read before relying on this in production
 * ============================================================================
 * This state lives in one process's memory and is lost on every restart/
 * redeploy, and is NOT shared across multiple concurrent server processes
 * (a horizontally-scaled Node deployment, or a serverless/edge platform that
 * runs more than one instance). On a single long-running Node server
 * (the deployment shape this project's Prisma connection pooling already
 * assumes — see `lib/db.ts`'s comment on per-process pool sizing) this is a
 * real, correctly-enforced limiter. If this app is ever deployed across
 * multiple instances, each instance enforces its own independent counters,
 * so the *effective* attempt budget an attacker gets is (limit × instance
 * count), and a restart clears it early. That is a basic, honest mitigation
 * against a single-process scripted brute force — it is NOT a fully
 * distributed production rate limiter. A real distributed limiter needs
 * shared/durable storage (a Prisma model, or an external store like Upstash
 * Redis) — deliberately not added here; see the recommendation reported
 * alongside this change.
 */

// ---------------------------------------------------------------------------
// Tuning
// ---------------------------------------------------------------------------

/** Failures are counted within this rolling window; an idle key resets after it. */
const FAILURE_WINDOW_MS = 15 * 60 * 1000; // 15 minutes

/** Below this many failures in the window, respond immediately (normal UX). */
const DELAY_THRESHOLD = 3;

/** At/above this many failures in the window, block outright instead of just delaying. */
const BLOCK_THRESHOLD = 6;

/** How long a key stays blocked once it crosses BLOCK_THRESHOLD. */
const BLOCK_DURATION_MS = 10 * 60 * 1000; // 10 minutes

/** Cap on the artificial per-request delay applied once DELAY_THRESHOLD is crossed. */
const MAX_DELAY_MS = 4000;

/**
 * Hard cap on how many distinct keys this process will track at once — a
 * defensive bound so an attacker flooding the login endpoint with many
 * distinct fake emails (or spoofed IPs) can't grow this Map without limit
 * and exhaust process memory. `Map` preserves insertion order, so the
 * oldest entries are evicted first when the cap is hit — a crude but safe
 * LRU-ish approximation, adequate for this module's purpose.
 */
const MAX_TRACKED_KEYS = 5000;
const EVICT_BATCH_SIZE = 250;

interface AttemptState {
  failureCount: number;
  windowStartedAt: number;
  blockedUntil: number | null;
}

const emailAttempts = new Map<string, AttemptState>();
const ipAttempts = new Map<string, AttemptState>();

/** Reads a key's live state, deleting (and returning null for) an expired one — lazy cleanup, no timers. */
function getLiveState(store: Map<string, AttemptState>, key: string, now: number): AttemptState | null {
  const state = store.get(key);
  if (!state) return null;

  if (state.blockedUntil !== null) {
    if (state.blockedUntil <= now) {
      store.delete(key);
      return null;
    }
    return state;
  }

  if (now - state.windowStartedAt > FAILURE_WINDOW_MS) {
    store.delete(key);
    return null;
  }

  return state;
}

function evictOldestIfFull(store: Map<string, AttemptState>) {
  if (store.size < MAX_TRACKED_KEYS) return;
  let toEvict = EVICT_BATCH_SIZE;
  for (const key of store.keys()) {
    if (toEvict <= 0) break;
    store.delete(key);
    toEvict -= 1;
  }
}

function decisionFor(state: AttemptState | null, now: number): { blocked: boolean; delayMs: number } {
  if (!state) return { blocked: false, delayMs: 0 };
  if (state.blockedUntil !== null && state.blockedUntil > now) {
    return { blocked: true, delayMs: 0 };
  }
  if (state.failureCount >= DELAY_THRESHOLD) {
    const delayMs = Math.min(MAX_DELAY_MS, (state.failureCount - DELAY_THRESHOLD + 1) * 1000);
    return { blocked: false, delayMs };
  }
  return { blocked: false, delayMs: 0 };
}

function recordFailure(store: Map<string, AttemptState>, key: string, now: number) {
  const existing = getLiveState(store, key, now);

  if (!existing) {
    evictOldestIfFull(store);
    store.set(key, { failureCount: 1, windowStartedAt: now, blockedUntil: null });
    return;
  }

  const failureCount = existing.failureCount + 1;
  const blockedUntil = failureCount >= BLOCK_THRESHOLD ? now + BLOCK_DURATION_MS : null;
  store.set(key, { failureCount, windowStartedAt: existing.windowStartedAt, blockedUntil });
}

export interface AdminLoginRateLimitDecision {
  /** When true, reject the request immediately (skip the DB/password check entirely) — return the generic rate-limited error. */
  blocked: boolean;
  /** When > 0 and not blocked, wait this long before responding — a progressive soft-throttle for attempts 3–6. */
  delayMs: number;
}

/**
 * Read-only check — call once at the top of `adminLogin`, before touching
 * the database. Combines the IP bucket and the (normalized) email bucket;
 * whichever is more restrictive wins, so an attacker can't dodge the block
 * by rotating just one of the two (see the module note on why both are
 * tracked).
 */
export function checkAdminLoginRateLimit(ip: string, normalizedEmail: string): AdminLoginRateLimitDecision {
  const now = Date.now();
  const ipDecision = decisionFor(getLiveState(ipAttempts, ip, now), now);
  const emailDecision = decisionFor(getLiveState(emailAttempts, normalizedEmail, now), now);

  return {
    blocked: ipDecision.blocked || emailDecision.blocked,
    delayMs: Math.max(ipDecision.delayMs, emailDecision.delayMs),
  };
}

/**
 * Call after a failed credential check (unknown email OR wrong password —
 * `adminLogin` doesn't distinguish the two, so neither does this). Increments
 * both buckets so the block is enforced from either angle.
 */
export function recordAdminLoginFailure(ip: string, normalizedEmail: string): void {
  const now = Date.now();
  recordFailure(ipAttempts, ip, now);
  recordFailure(emailAttempts, normalizedEmail, now);
}

/** Call after a successful login — clears both buckets so earlier mistyped attempts never penalize the real admin going forward. */
export function recordAdminLoginSuccess(ip: string, normalizedEmail: string): void {
  ipAttempts.delete(ip);
  emailAttempts.delete(normalizedEmail);
}

/**
 * Best-effort client IP for rate-limiting only — never used for anything
 * else, and never treated as a trusted identity (only as "which bucket to
 * throttle"). Tries `x-real-ip` first, then the first hop of
 * `x-forwarded-for`, falling back to a shared "unknown" bucket if neither is
 * present.
 *
 * TRUST CAVEAT — read before assuming this is spoof-proof: these headers
 * are only meaningful if something in front of this Node process (a
 * reverse proxy, load balancer, or platform edge network) sets them itself
 * from the real TCP connection and strips/overwrites any value the client
 * tried to send. This project has no committed deployment config
 * (`vercel.json`, reverse-proxy config, etc.) confirming such a proxy is in
 * front of it, so this function's result MUST NOT be treated as a hard
 * security boundary on its own — a client with no trusted proxy in front of
 * it can set `x-forwarded-for`/`x-real-ip` to anything. That's exactly why
 * `checkAdminLoginRateLimit` also keys on the normalized email: that value
 * is compared against real `Admin` rows server-side and can't be spoofed
 * the way a header can, so it remains the actual, non-bypassable protection
 * for one targeted account even if the IP bucket is defeated by spoofing or
 * IP rotation. The IP bucket's real value is against credential stuffing —
 * many different emails tried from one source — where spoofing the header
 * gains an attacker nothing (a different IP is applied per email at the
 * same server-side value they'd need to also guess correctly).
 */
export async function resolveClientIp(): Promise<string> {
  const headerList = await headers();

  const realIp = headerList.get("x-real-ip");
  if (realIp?.trim()) return realIp.trim();

  const forwardedFor = headerList.get("x-forwarded-for");
  if (forwardedFor) {
    const first = forwardedFor.split(",")[0]?.trim();
    if (first) return first;
  }

  return "unknown";
}
