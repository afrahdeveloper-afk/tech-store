"use server";

import { prisma } from "@/lib/db";
import { isValidEmail, exceedsMaxLength, MAX_EMAIL_LENGTH, MAX_PASSWORD_LENGTH } from "@/lib/validation";
import { verifyPassword, DUMMY_PASSWORD_HASH } from "@/lib/auth/password";
import { createAdminSession } from "@/lib/auth/admin-session";
import {
  checkAdminLoginRateLimit,
  recordAdminLoginFailure,
  recordAdminLoginSuccess,
  resolveClientIp,
} from "@/lib/auth/admin-login-rate-limit";

/**
 * Admin login — Phase 12's Admin auth boundary. Structurally mirrors
 * `app/(site)/login/actions.ts` (same typed-result shape, same "don't reveal
 * which emails exist" behavior: `invalid-credentials` covers both an unknown
 * email and a wrong password) but is a completely separate Server Action
 * against the separate `Admin` table — never touches `Customer`.
 *
 * Brute-force protection (Admin Login Security phase): `lib/auth/
 * admin-login-rate-limit.ts` is checked before the database is touched and
 * updated after every outcome — see that module for exactly what's tracked,
 * how blocking/delay escalate, and why it's process-local, not distributed.
 * The rate-limit decision never changes *which* error code an invalid
 * email/password combination returns (`invalid-credentials` either way,
 * same as before this phase) — only whether the request is throttled or
 * rejected before it gets that far.
 *
 * Timing-safety (Stage 6 — Authentication Security audit): `verifyPassword`
 * runs unconditionally, even for an email with no matching `Admin` row,
 * against `DUMMY_PASSWORD_HASH` — see that constant's doc comment in
 * `lib/auth/password.ts` for why skipping the scrypt call for an unknown
 * email would otherwise leak account existence through response timing
 * alone, independent of the identical error code both branches return.
 */

export interface AdminLoginInput {
  email: string;
  password: string;
}

export type AdminLoginErrorCode =
  | "missing-fields"
  | "invalid-email"
  | "invalid-credentials"
  | "rate-limited"
  | "server-error";

export type AdminLoginResult = { success: true } | { success: false; error: AdminLoginErrorCode };

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function adminLogin(input: AdminLoginInput): Promise<AdminLoginResult> {
  const email = input.email?.trim().toLowerCase();
  const password = input.password ?? "";

  if (!email || !password) {
    return { success: false, error: "missing-fields" };
  }
  // Maximum-length guard (Phase 2, Part A) — deliberately placed here,
  // alongside the pre-existing missing-fields/invalid-email checks and
  // *before* the rate limiter is ever touched, so it doesn't change the
  // rate limiter's behavior at all (Phase 1 stays frozen — see
  // `lib/auth/admin-login-rate-limit.ts`). Reuses the two existing error
  // codes (no new code, no UI change needed): an over-long email can never
  // be a real registered address, and an over-long password can never match
  // any stored hash. Also means an oversized password never reaches
  // `verifyPassword` (scrypt) below — a genuine CPU-cost concern for this
  // endpoint specifically, independent of the rate limiter.
  if (exceedsMaxLength(email, MAX_EMAIL_LENGTH)) {
    return { success: false, error: "invalid-email" };
  }
  if (exceedsMaxLength(password, MAX_PASSWORD_LENGTH)) {
    return { success: false, error: "invalid-credentials" };
  }
  if (!isValidEmail(email)) {
    return { success: false, error: "invalid-email" };
  }

  const ip = await resolveClientIp();
  const rateLimit = checkAdminLoginRateLimit(ip, email);
  if (rateLimit.blocked) {
    // Excessive failures: reject outright, without even querying the
    // database — same generic error shape as every other failure branch,
    // no attempt count or block duration disclosed (see the module note on
    // why this doesn't create an email-enumeration signal: the same check
    // runs identically whether or not `email` belongs to a real Admin row).
    return { success: false, error: "rate-limited" };
  }
  if (rateLimit.delayMs > 0) {
    // Repeated (but not yet excessive) failures: slow the response down
    // instead of blocking outright — a progressive throttle, not a lockout.
    await sleep(rateLimit.delayMs);
  }

  try {
    const admin = await prisma.admin.findUnique({
      where: { email },
      select: { id: true, passwordHash: true },
    });

    // Always call verifyPassword — against the admin's real hash when one
    // exists, against the fixed dummy hash otherwise — so an unknown email
    // and a wrong password take the same amount of time to reject (see the
    // doc comment above).
    const passwordIsValid = verifyPassword(password, admin?.passwordHash ?? DUMMY_PASSWORD_HASH);
    if (!admin || !passwordIsValid) {
      recordAdminLoginFailure(ip, email);
      return { success: false, error: "invalid-credentials" };
    }

    recordAdminLoginSuccess(ip, email);
    await createAdminSession(admin.id);
    return { success: true };
  } catch (err) {
    console.error("adminLogin failed:", err);
    return { success: false, error: "server-error" };
  }
}
