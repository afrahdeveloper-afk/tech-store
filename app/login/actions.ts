"use server";

import { prisma } from "@/lib/db";
import { isValidEmail } from "@/lib/validation";
import { verifyPassword } from "@/lib/auth/password";
import { createSession } from "@/lib/auth/session";

export interface LoginInput {
  email: string;
  password: string;
}

export type LoginErrorCode = "missing-fields" | "invalid-email" | "invalid-credentials" | "server-error";

export type LoginResult = { success: true } | { success: false; error: LoginErrorCode };

/**
 * Login for the minimal first-party customer account (see
 * `app/register/actions.ts` for how `Customer.passwordHash` gets set).
 * Deliberately returns the same `invalid-credentials` error whether the
 * email doesn't exist, has no password set (guest-only Customer row), or
 * the password is wrong — avoids confirming which emails have accounts.
 */
export async function login(input: LoginInput): Promise<LoginResult> {
  const email = input.email?.trim().toLowerCase();
  const password = input.password ?? "";

  if (!email || !password) {
    return { success: false, error: "missing-fields" };
  }
  if (!isValidEmail(email)) {
    return { success: false, error: "invalid-email" };
  }

  try {
    const customer = await prisma.customer.findUnique({
      where: { email },
      select: { id: true, passwordHash: true },
    });

    if (!customer?.passwordHash || !verifyPassword(password, customer.passwordHash)) {
      return { success: false, error: "invalid-credentials" };
    }

    await createSession(customer.id);
    return { success: true };
  } catch (err) {
    console.error("login failed:", err);
    return { success: false, error: "server-error" };
  }
}
