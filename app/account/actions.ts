"use server";

import { redirect } from "next/navigation";

import { clearSession } from "@/lib/auth/session";

/**
 * Logout — clears the session cookie and returns the customer to the
 * homepage. Bound directly to a `<form action={logout}>` (see
 * `components/account/logout-button.tsx`) rather than a client `onClick`
 * handler, so it degrades to a plain form submission and needs no client JS.
 */
export async function logout(): Promise<void> {
  await clearSession();
  redirect("/");
}
