import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { getCurrentAdmin } from "@/lib/auth/current-admin";
import { AdminLoginView } from "@/components/admin/admin-login-view";

export const metadata: Metadata = {
  title: "Admin Login",
};

/**
 * `/admin/login` — the only unauthenticated route under `/admin` (see
 * CLAUDE.md's Phase 12: no public admin self-registration exists or is
 * planned). Already-signed-in admins are redirected straight to `/admin`,
 * mirroring `app/(site)/login/page.tsx`'s same pattern for customers.
 */
export default async function AdminLoginPage() {
  const admin = await getCurrentAdmin();
  if (admin) {
    redirect("/admin");
  }

  return <AdminLoginView />;
}
