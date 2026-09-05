"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/db";
import { getCurrentAdmin } from "@/lib/auth/current-admin";
import { BOOKING_TRANSITIONS } from "@/lib/booking-status";
import type { BookingStatus } from "@/lib/generated/prisma/enums";

/** Bookings — status transitions only, mirroring `app/admin/(dashboard)/orders/actions.ts`'s reasoning: a `Booking` is only ever created by `app/(site)/booking/actions.ts`, and "delete" for a booking means `CANCELLED`, not a hard delete. Valid transitions live in `lib/booking-status.ts`. */

export type BookingStatusMutationErrorCode = "unauthorized" | "not-found" | "invalid-transition" | "server-error";
export type BookingStatusMutationResult = { success: true } | { success: false; error: BookingStatusMutationErrorCode };

export async function updateBookingStatus(id: string, nextStatus: BookingStatus): Promise<BookingStatusMutationResult> {
  const admin = await getCurrentAdmin();
  if (!admin) return { success: false, error: "unauthorized" };

  const booking = await prisma.booking.findUnique({ where: { id }, select: { status: true } });
  if (!booking) return { success: false, error: "not-found" };

  if (!BOOKING_TRANSITIONS[booking.status].includes(nextStatus)) {
    return { success: false, error: "invalid-transition" };
  }

  try {
    await prisma.booking.update({ where: { id }, data: { status: nextStatus } });
    revalidatePath("/admin/bookings");
    revalidatePath(`/admin/bookings/${id}`);
    revalidatePath("/admin");
    return { success: true };
  } catch (err) {
    console.error("updateBookingStatus failed:", err);
    return { success: false, error: "server-error" };
  }
}
