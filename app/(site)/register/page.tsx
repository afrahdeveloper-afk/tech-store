import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { getCurrentCustomer } from "@/lib/auth/current-customer";
import { RegisterView } from "@/components/auth/register-view";

export const metadata: Metadata = {
  title: "Create Account — Speed Core",
  description: "Create a Speed Core account to track your orders and service bookings.",
};

export default async function RegisterPage() {
  const customer = await getCurrentCustomer();
  if (customer) {
    redirect("/account");
  }

  return <RegisterView />;
}
