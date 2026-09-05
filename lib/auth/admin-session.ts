import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

/**
 * Signed, stateless session cookie for the Admin auth boundary — see
 * CLAUDE.md's Phase 12 (Admin Dashboard). Structurally identical to
 * `lib/auth/session.ts` (Customer's session cookie) — same HMAC-signed,
 * stateless design, no session table, no JWT library — but deliberately a
 * **separate module, separate cookie name, and separate secret**
 * (`ADMIN_SESSION_SECRET`, not `SESSION_SECRET`). This is a parallel
 * mechanism, not a shared or extended one: `lib/auth/session.ts` itself is
 * never imported here, and this file is never imported by any Customer-facing
 * code — the two identity domains stay structurally unable to leak into each
 * other. Importing `next/headers` already keeps this server-only (see
 * `lib/auth/session.ts`'s own note on this).
 */

const COOKIE_NAME = "speedcore_admin_session";
const SESSION_TTL_MS = 12 * 60 * 60 * 1000; // 12 hours — shorter-lived than the Customer cookie's 30 days, appropriate for a staff/admin session.

// Stage 10 — Secrets/Environment hardening: same minimum-length guard as
// `lib/auth/session.ts`'s `getSecret()` — see that file's comment for why.
const MIN_SECRET_LENGTH = 32;

function getSecret(): string {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) {
    throw new Error("ADMIN_SESSION_SECRET is not set — see .env.example.");
  }
  if (secret.length < MIN_SECRET_LENGTH) {
    throw new Error(`ADMIN_SESSION_SECRET is too short (must be at least ${MIN_SECRET_LENGTH} characters) — see .env.example.`);
  }
  return secret;
}

function sign(value: string): string {
  const signature = createHmac("sha256", getSecret()).update(value).digest("hex");
  return `${value}.${signature}`;
}

/** Returns the signed cookie's `adminId`, or null if missing/tampered/expired. */
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

  const [adminId, expiresAtRaw] = value.split(":");
  const expiresAt = Number(expiresAtRaw);
  if (!adminId || !Number.isFinite(expiresAt) || Date.now() > expiresAt) return null;

  return adminId;
}

/** Sets the signed admin session cookie. Call only from a Server Action or Route Handler. */
export async function createAdminSession(adminId: string): Promise<void> {
  const expiresAt = Date.now() + SESSION_TTL_MS;
  const signedValue = sign(`${adminId}:${expiresAt}`);

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, signedValue, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: new Date(expiresAt),
  });
}

/** Reads and verifies the admin session cookie. Safe to call from a Server Component. */
export async function getSessionAdminId(): Promise<string | null> {
  const cookieStore = await cookies();
  const signedValue = cookieStore.get(COOKIE_NAME)?.value;
  if (!signedValue) return null;
  return verify(signedValue);
}

/** Clears the admin session cookie (logout). Call only from a Server Action or Route Handler. */
export async function clearAdminSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}
