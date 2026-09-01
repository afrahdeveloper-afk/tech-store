"use server";

import { mockServiceItems } from "@/lib/mock/service-items";
import { isValidEmail, isValidPhone } from "@/lib/validation";
import { prisma } from "@/lib/db";

/**
 * Booking creation — the one place Prisma is touched for Booking (same
 * Server Action pattern as `app/checkout/actions.ts`; see the Step 10 note
 * there for why this is safe to import from a Client Component).
 */

export interface BookingInput {
  serviceId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  preferredDate: string; // "YYYY-MM-DD"
  preferredTime: string; // "HH:mm"
  notes?: string;
}

export type BookingErrorCode =
  | "invalid-service"
  | "unavailable"
  | "missing-fields"
  | "invalid-email"
  | "invalid-phone"
  | "invalid-date"
  | "past-date"
  | "invalid-time"
  | "server-error";

export type BookingResult = { success: true; bookingNumber: string } | { success: false; error: BookingErrorCode };

function generateBookingNumber(): string {
  const stamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `BK-${stamp}-${random}`;
}

export async function createBooking(input: BookingInput): Promise<BookingResult> {
  // Re-resolve the service server-side rather than trusting the client —
  // `lib/mock/service-items.ts` is the one source of truth for service data
  // (the same `available` flag `/services/[id]` gates its own CTA on).
  const service = mockServiceItems.find((candidate) => candidate.id === input.serviceId);
  if (!service) {
    return { success: false, error: "invalid-service" };
  }
  if (!service.available) {
    return { success: false, error: "unavailable" };
  }

  const name = input.customerName?.trim();
  const email = input.customerEmail?.trim();
  const phone = input.customerPhone?.trim();
  if (!name || !email || !phone) {
    return { success: false, error: "missing-fields" };
  }
  if (!isValidEmail(email)) {
    return { success: false, error: "invalid-email" };
  }
  if (!isValidPhone(phone)) {
    return { success: false, error: "invalid-phone" };
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.preferredDate ?? "")) {
    return { success: false, error: "invalid-date" };
  }
  const preferredDate = new Date(`${input.preferredDate}T00:00:00`);
  if (Number.isNaN(preferredDate.getTime())) {
    return { success: false, error: "invalid-date" };
  }
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (preferredDate < today) {
    return { success: false, error: "past-date" };
  }

  if (!/^\d{2}:\d{2}$/.test(input.preferredTime ?? "")) {
    return { success: false, error: "invalid-time" };
  }

  try {
    const bookingNumber = generateBookingNumber();

    await prisma.$transaction(async (tx) => {
      const customer = await tx.customer.upsert({
        where: { email },
        update: { name, phone },
        create: { name, email, phone },
      });

      await tx.booking.create({
        data: {
          bookingNumber,
          serviceNameSnapshot: service.name,
          priceSnapshot: service.price,
          status: "PENDING",
          preferredDate,
          preferredTime: input.preferredTime,
          notes: input.notes?.trim() || null,
          customerId: customer.id,
          serviceId: service.id,
        },
      });
    });

    return { success: true, bookingNumber };
  } catch (err) {
    console.error("createBooking failed:", err);
    return { success: false, error: "server-error" };
  }
}
