import { headers } from "next/headers";

/**
 * Brute-force / credential-stuffing protection for `/login` (Customer) only
 * — security audit F-02. Mirrors the proven dual-bucket (IP + email) design
 * in `lib/auth/admin-login-rate-limit.ts` exactly: same thresholds, same
 * progressive-delay-then-block shape, same eviction cap, same reasoning —
 * but as a **fully independent module** with its own in-memory state. A
 * flood of failed customer login attempts never touches the Admin rate
 * limiter's counters, and vice versa; the two auth boundaries stay as
 * structurally separate as `lib/auth/session.ts`/`lib/auth/admin-session.ts`
 * already are.
 *
 * The Admin module is deliberately left untouched by this fix (not imported
 * from, not refactored into a shared core) — F-02's scope is customer login
 * only, and the audit was explicit that the Admin rate limiter must not be
 * weakened or changed. The one piece of literal duplication this creates is
 * `resolveClientIp` (~10 lines, no rate-limiting logic of its own, just
 * request-header parsing) — accepted deliberately in exchange for zero risk
 * to the Admin file, rather than extracting a shared helper that would
 * require editing it.
 *
 * See `lib/auth/admin-login-rate-limit.ts`'s own module comment for the
 * full "why" behind every constant and the PROCESS-LOCAL caveat — restated
 * only briefly in this file's comments, not re-derived.
 */

// ---------------------------------------------------------------------------
// Tuning — identical to lib/auth/admin-login-rate-limit.ts. No stated reason
// for customer login to be throttled more or less aggressively than admin
// login, and reusing already-proven values avoids picking new ones blind.
// ---------------------------------------------------------------------------

const FAILURE_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const DELAY_THRESHOLD = 3;
const BLOCK_THRESHOLD = 6;
const BLOCK_DURATION_MS = 10 * 60 * 1000; // 10 minutes — temporary, never a permanent lockout
const MAX_DELAY_MS = 4000;
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

export interface CustomerLoginRateLimitDecision {
  /** When true, reject the request immediately (skip the DB/password check entirely) — return the generic rate-limited error. */
  blocked: boolean;
  /** When > 0 and not blocked, wait this long before responding — a progressive soft-throttle for attempts 3–6. */
  delayMs: number;
}

/**
 * Read-only check — call once at the top of `login`, before touching the
 * database. Combines the IP bucket and the (normalized) email bucket;
 * whichever is more restrictive wins, so an attacker can't dodge the block
 * by rotating just one of the two.
 */
export function checkCustomerLoginRateLimit(ip: string, normalizedEmail: string): CustomerLoginRateLimitDecision {
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
 * `login` doesn't distinguish the two, so neither does this, matching the
 * existing no-enumeration behavior of the login action). Increments both
 * buckets so the block is enforced from either angle.
 */
export function recordCustomerLoginFailure(ip: string, normalizedEmail: string): void {
  const now = Date.now();
  recordFailure(ipAttempts, ip, now);
  recordFailure(emailAttempts, normalizedEmail, now);
}

/** Call after a successful login — clears both buckets so earlier mistyped attempts never penalize the real customer going forward. */
export function recordCustomerLoginSuccess(ip: string, normalizedEmail: string): void {
  ipAttempts.delete(ip);
  emailAttempts.delete(normalizedEmail);
}

/**
 * Best-effort client IP for rate-limiting only — same implementation and
 * same trust caveat as `lib/auth/admin-login-rate-limit.ts`'s
 * `resolveClientIp` (duplicated here rather than imported — see this file's
 * module comment for why). Never used for anything but "which bucket to
 * throttle"; the normalized email remains the actual, non-spoofable
 * protection for one targeted account.
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
