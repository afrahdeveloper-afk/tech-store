import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

/**
 * Password hashing for the minimal first-party customer login (Customer
 * Account phase — see CLAUDE.md). Uses Node's built-in `scrypt` rather than
 * a package like bcrypt/argon2 — CLAUDE.md says not to add unnecessary
 * dependencies, and `node:crypto` already provides a secure, salted KDF.
 *
 * Server-only: imports `node:crypto`, so this must never be imported from a
 * Client Component (matches `lib/db.ts`'s existing server-only discipline).
 */

const KEY_LENGTH = 64;

/** Returns "salt:hash", both hex-encoded — stored in `Customer.passwordHash`. */
export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, KEY_LENGTH).toString("hex");
  return `${salt}:${hash}`;
}

/** Constant-time comparison against a `hashPassword` output. */
export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;

  const storedBuffer = Buffer.from(hash, "hex");
  const suppliedBuffer = scryptSync(password, salt, KEY_LENGTH);
  if (storedBuffer.length !== suppliedBuffer.length) return false;

  return timingSafeEqual(storedBuffer, suppliedBuffer);
}
