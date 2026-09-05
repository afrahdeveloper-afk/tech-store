"use server";

import { prisma } from "@/lib/db";
import {
  isValidEmail,
  isValidPhone,
  exceedsMaxLength,
  phoneNumbersLikelyMatch,
  MAX_NAME_LENGTH,
  MAX_EMAIL_LENGTH,
  MAX_PHONE_LENGTH,
  MAX_PASSWORD_LENGTH,
  MIN_PASSWORD_LENGTH,
} from "@/lib/validation";
import { hashPassword } from "@/lib/auth/password";
import { createSession } from "@/lib/auth/session";

/**
 * Account creation for the minimal first-party customer login (Customer
 * Account phase — see CLAUDE.md). Mirrors `app/checkout/actions.ts`'s
 * Server Action shape (typed result, re-validated server-side).
 *
 * `Customer` rows already exist for guests who checked out/booked without
 * ever registering (see `Customer.email`'s `@unique`, upserted from
 * `app/checkout/actions.ts` / `app/booking/actions.ts`). Registering with
 * that same email "claims" that row — sets its password and refreshes
 * name/phone — rather than erroring or creating a duplicate, so a returning
 * guest's order/booking history is immediately visible once they register.
 *
 * **Security correction (F-01 — account takeover via blind email claim)**:
 * a guest row has no password and, before this fix, `register` would let
 * *anyone* who merely typed a known/guessed email in take it over — setting
 * their own password and instantly gaining a live session with full read
 * access to that guest's entire order/booking history (names, addresses,
 * phone numbers, past purchases). No email-verification link/OTP exists in
 * this project (no email-sending infrastructure — see CLAUDE.md's Known
 * Issues), so the fix doesn't add one. Instead it reuses a fact only the
 * real guest is likely to know: the phone number *already on file* for that
 * email (entered at Checkout/Booking time, required on both forms). Claiming
 * an existing passwordless row now additionally requires the submitted
 * `phone` to match the row's stored `phone` (digits-only, tolerant of
 * formatting/country-code-prefix differences — see `phoneNumbersLikelyMatch`
 * in `lib/validation.ts`) before the claim is allowed. A mismatch returns
 * the *same* `"email-taken"` code a real (already-registered) account
 * already returns — deliberately not a distinct error, so this still
 * reveals nothing new: an attacker who only knows the email can no longer
 * tell "claimable guest" from "already a real account" apart, and gains
 * neither.
 *
 * This closes the direct, single-step attack ("I know the victim's email,
 * let me register with it"). A closely related two-step attack — first
 * place a throwaway guest order/booking under the victim's email with a
 * phone number of the attacker's own choosing, *then* register using that
 * same self-chosen phone — was flagged as a residual gap when this fix
 * shipped and has since been closed too: `lib/guest-customer.ts`'s
 * `resolveGuestCustomer` (Database Security Audit remediation, Sept 2026)
 * is what `app/(site)/checkout/actions.ts` / `app/(site)/booking/actions.ts`
 * now call instead of an unconditional upsert, and it applies this exact
 * same phone-match rule before ever touching a *password-holding* row's
 * `phone` — so step one of that attack (silently planting an attacker
 * phone number on a real, registered customer's row) no longer succeeds
 * either. See that module's doc comment for the full fix.
 */

export interface RegisterInput {
  name: string;
  email: string;
  phone: string;
  password: string;
}

export type RegisterErrorCode =
  | "missing-fields"
  | "invalid-length"
  | "invalid-email"
  | "invalid-phone"
  | "weak-password"
  | "email-taken"
  | "server-error";

export type RegisterResult = { success: true } | { success: false; error: RegisterErrorCode };

export async function register(input: RegisterInput): Promise<RegisterResult> {
  const name = input.name?.trim();
  const email = input.email?.trim().toLowerCase();
  const phone = input.phone?.trim();
  const password = input.password ?? "";

  if (!name || !email || !phone || !password) {
    return { success: false, error: "missing-fields" };
  }
  // Maximum-length validation (Phase 2, Part A) — checked before format
  // validation and, crucially, before `password` ever reaches `hashPassword`
  // (scrypt) below: an unbounded password is a real CPU-cost concern, not
  // just a UX one, so this must run first.
  if (
    exceedsMaxLength(name, MAX_NAME_LENGTH) ||
    exceedsMaxLength(email, MAX_EMAIL_LENGTH) ||
    exceedsMaxLength(phone, MAX_PHONE_LENGTH) ||
    exceedsMaxLength(password, MAX_PASSWORD_LENGTH)
  ) {
    return { success: false, error: "invalid-length" };
  }
  if (!isValidEmail(email)) {
    return { success: false, error: "invalid-email" };
  }
  if (!isValidPhone(phone)) {
    return { success: false, error: "invalid-phone" };
  }
  if (password.length < MIN_PASSWORD_LENGTH) {
    return { success: false, error: "weak-password" };
  }

  try {
    const passwordHash = hashPassword(password);
    const existing = await prisma.customer.findUnique({ where: { email }, select: { id: true, phone: true, passwordHash: true } });

    if (existing?.passwordHash) {
      // A real account already owns this email — don't silently overwrite
      // its password.
      return { success: false, error: "email-taken" };
    }

    if (existing && !phoneNumbersLikelyMatch(phone, existing.phone)) {
      // A guest row exists for this email, but the submitted phone doesn't
      // match the one on file — refuse the claim (F-01). Same error code as
      // the real-account branch above: no distinct signal for "guest,
      // wrong phone" vs "already a real account", so this reveals nothing
      // an attacker who only knows the email didn't already know.
      return { success: false, error: "email-taken" };
    }

    const customer = existing
      ? await prisma.customer.update({
          where: { id: existing.id },
          data: { name, phone, passwordHash },
        })
      : await prisma.customer.create({
          data: { name, email, phone, passwordHash },
        });

    await createSession(customer.id);
    return { success: true };
  } catch (err) {
    console.error("register failed:", err);
    return { success: false, error: "server-error" };
  }
}
