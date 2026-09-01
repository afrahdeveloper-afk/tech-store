"use server";

import { prisma } from "@/lib/db";
import { isValidEmail, isValidPhone } from "@/lib/validation";
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
 */

export interface RegisterInput {
  name: string;
  email: string;
  phone: string;
  password: string;
}

export type RegisterErrorCode =
  | "missing-fields"
  | "invalid-email"
  | "invalid-phone"
  | "weak-password"
  | "email-taken"
  | "server-error";

export type RegisterResult = { success: true } | { success: false; error: RegisterErrorCode };

const MIN_PASSWORD_LENGTH = 8;

export async function register(input: RegisterInput): Promise<RegisterResult> {
  const name = input.name?.trim();
  const email = input.email?.trim().toLowerCase();
  const phone = input.phone?.trim();
  const password = input.password ?? "";

  if (!name || !email || !phone || !password) {
    return { success: false, error: "missing-fields" };
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
    const existing = await prisma.customer.findUnique({ where: { email }, select: { id: true, passwordHash: true } });

    if (existing?.passwordHash) {
      // A real account already owns this email — don't silently overwrite
      // its password.
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
