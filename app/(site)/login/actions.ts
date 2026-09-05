"use server";

import { prisma } from "@/lib/db";
import { isValidEmail, exceedsMaxLength, MAX_EMAIL_LENGTH, MAX_PASSWORD_LENGTH } from "@/lib/validation";
import { verifyPassword, DUMMY_PASSWORD_HASH } from "@/lib/auth/password";
import { createSession } from "@/lib/auth/session";
import {
  checkCustomerLoginRateLimit,
  recordCustomerLoginFailure,
  recordCustomerLoginSuccess,
  resolveClientIp,
} from "@/lib/auth/customer-login-rate-limit";

export interface LoginInput {
  email: string;
  password: string;
}

export type LoginErrorCode = "missing-fields" | "invalid-email" | "invalid-credentials" | "rate-limited" | "server-error";

export type LoginResult = { success: true } | { success: false; error: LoginErrorCode };

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Login for the minimal first-party customer account (see
 * `app/register/actions.ts` for how `Customer.passwordHash` gets set).
 * Deliberately returns the same `invalid-credentials` error whether the
 * email doesn't exist, has no password set (guest-only Customer row), or
 * the password is wrong — avoids confirming which emails have accounts.
 *
 * Timing-safety (Stage 6 — Authentication Security audit): `verifyPassword`
 * runs unconditionally, even for an email with no matching row, against
 * `DUMMY_PASSWORD_HASH` — see that constant's doc comment in
 * `lib/auth/password.ts` for why an early return here (skipping the scrypt
 * call) would otherwise leak account existence through response timing
 * alone, independent of the identical error code both branches return.
 *
 * Brute-force protection (security audit F-02): `lib/auth/
 * customer-login-rate-limit.ts` is checked before the database is touched
 * and updated after every outcome — see that module for exactly what's
 * tracked, how blocking/delay escalate, and why it's process-local, not
 * distributed. Mirrors `app/admin/login/actions.ts`'s own proven use of
 * this same pattern; the rate-limit decision never changes *which* error
 * code an invalid email/password combination returns (`invalid-credentials`
 * either way, same as before this fix) — only whether the request is
 * throttled or rejected before it gets that far.
 */
export async function login(input: LoginInput): Promise<LoginResult> {
  const email = input.email?.trim().toLowerCase();
  const password = input.password ?? "";

  if (!email || !password) {
    return { success: false, error: "missing-fields" };
  }
  // Maximum-length guard (Phase 2, Part A) — reuses the two existing error
  // codes rather than adding a new one: an over-long email can never be a
  // real registered address (matches `isValidEmail`'s own framing below),
  // and an over-long password can never match any stored hash, so both fold
  // into the codes this action already returns. Crucially, this runs
  // *before* `verifyPassword` (scrypt) below — an unbounded password is a
  // CPU-cost concern, not just a UX one. Placed before the rate limiter too,
  // so it doesn't consume a tracked attempt for input that could never
  // succeed anyway.
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
  const rateLimit = checkCustomerLoginRateLimit(ip, email);
  if (rateLimit.blocked) {
    // Excessive failures: reject outright, without even querying the
    // database — same generic error shape as every other failure branch, no
    // attempt count or block duration disclosed (no email-enumeration
    // signal: this runs identically whether or not `email` belongs to a
    // real Customer row).
    return { success: false, error: "rate-limited" };
  }
  if (rateLimit.delayMs > 0) {
    // Repeated (but not yet excessive) failures: slow the response down
    // instead of blocking outright — a progressive throttle, not a lockout.
    await sleep(rateLimit.delayMs);
  }

  try {
    const customer = await prisma.customer.findUnique({
      where: { email },
      select: { id: true, passwordHash: true },
    });

    // Always call verifyPassword — against the customer's real hash when one
    // exists, against the fixed dummy hash otherwise — so an unknown email
    // and a wrong password take the same amount of time to reject (see the
    // doc comment above).
    const passwordIsValid = verifyPassword(password, customer?.passwordHash ?? DUMMY_PASSWORD_HASH);
    if (!customer?.passwordHash || !passwordIsValid) {
      recordCustomerLoginFailure(ip, email);
      return { success: false, error: "invalid-credentials" };
    }

    recordCustomerLoginSuccess(ip, email);
    await createSession(customer.id);
    return { success: true };
  } catch (err) {
    console.error("login failed:", err);
    return { success: false, error: "server-error" };
  }
}
