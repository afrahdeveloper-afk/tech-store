import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

/**
 * Signed, stateless session cookie for the minimal first-party customer
 * login (Customer Account phase — see CLAUDE.md). No session table and no
 * JWT library: the cookie's payload is just `customerId.expiresAt`, HMAC-
 * signed server-side with `SESSION_SECRET` so a client can't forge or edit
 * it (see the Security/Authorization rules for this phase — "never trust
 * ... client-side state"). Importing `next/headers` already makes Next.js
 * refuse to bundle this into client JS (same guard `no-package-needed` idea
 * as `lib/db.ts`'s Prisma import) — no `server-only` package needed.
 */

const COOKIE_NAME = "speedcore_session";
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

// Stage 10 — Secrets/Environment hardening: a minimum length, not just
// presence, is checked below — a short/placeholder value (e.g. a stray
// "test" or "changeme" someone pasted in) would satisfy the old `!secret`
// check while producing a weak, brute-forceable HMAC key. 32 characters is
// comfortably below the real value's actual length (64, per .env.example's
// own "64_CHAR_HEX_STRING" guidance) but still enough entropy to catch an
// obviously-inadequate value without hand-rolling a stricter format check.
const MIN_SECRET_LENGTH = 32;

function getSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error("SESSION_SECRET is not set — see .env.example.");
  }
  if (secret.length < MIN_SECRET_LENGTH) {
    throw new Error(`SESSION_SECRET is too short (must be at least ${MIN_SECRET_LENGTH} characters) — see .env.example.`);
  }
  return secret;
}

function sign(value: string): string {
  const signature = createHmac("sha256", getSecret()).update(value).digest("hex");
  return `${value}.${signature}`;
}

/** Returns the signed cookie's `customerId`, or null if missing/tampered/expired. */
function verify(signed: string): string | null {
  const separatorIndex = signed.lastIndexOf(".");
  if (separatorIndex === -1) return null;

  const value = signed.slice(0, separatorIndex);
  const signature = signed.slice(separatorIndex + 1);
  const expectedSignature = createHmac("sha256", getSecret()).update(value).digest("hex");

  const signatureBuffer = Buffer.from(signature, "hex");
  const expectedBuffer = Buffer.from(expectedSignature, "hex");
  if (signatureBuffer.length !== expectedBuffer.length || !timingSafeEqual(signatureBuffer, expectedBuffer)) {
    return null;
  }

  const [customerId, expiresAtRaw] = value.split(":");
  const expiresAt = Number(expiresAtRaw);
  if (!customerId || !Number.isFinite(expiresAt) || Date.now() > expiresAt) return null;

  return customerId;
}

/** Sets the signed session cookie. Call only from a Server Action or Route Handler. */
export async function createSession(customerId: string): Promise<void> {
  const expiresAt = Date.now() + SESSION_TTL_MS;
  const signedValue = sign(`${customerId}:${expiresAt}`);

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, signedValue, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: new Date(expiresAt),
  });
}

/** Reads and verifies the session cookie. Safe to call from a Server Component. */
export async function getSessionCustomerId(): Promise<string | null> {
  const cookieStore = await cookies();
  const signedValue = cookieStore.get(COOKIE_NAME)?.value;
  if (!signedValue) return null;
  return verify(signedValue);
}

/** Clears the session cookie (logout). Call only from a Server Action or Route Handler. */
export async function clearSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}
