import type { BookingStatus } from "@/lib/generated/prisma/enums";

/** Legal `BookingStatus` transitions — see `lib/order-status.ts`'s header comment for why this lives outside `app/admin/(dashboard)/bookings/actions.ts`. COMPLETED/CANCELLED are terminal. */
export const BOOKING_TRANSITIONS: Record<BookingStatus, BookingStatus[]> = {
  PENDING: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["COMPLETED", "CANCELLED"],
  COMPLETED: [],
  CANCELLED: [],
};
