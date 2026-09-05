import { Check } from "lucide-react";

import type { BookingStatus } from "@/lib/generated/prisma/enums";

/**
 * Vertical status timeline for the Booking Detail page — structurally the
 * same idea as `components/admin/orders/order-status-timeline.tsx` (see
 * that file's header comment), adapted to Bookings' shorter linear path
 * (`PENDING → CONFIRMED → COMPLETED`, from `lib/booking-status.ts`).
 * "Booking Created" is always the first, always-complete step (a `Booking`
 * row only exists once the public Booking flow succeeded).
 *
 * `CANCELLED` has no fixed position in that path (a booking can be
 * cancelled from `PENDING` or `CONFIRMED`, and nothing in the schema
 * records *which* one it was cancelled from — no status-history table
 * exists) — rather than guess, a cancelled booking renders "Booking
 * Created" done and then a single red "Booking Cancelled" step, honestly
 * omitting the middle step instead of fabricating which stage it was
 * cancelled from.
 */

const LINEAR_STATUSES: BookingStatus[] = ["PENDING", "CONFIRMED", "COMPLETED"];

export function BookingStatusTimeline({
  status,
  createdAtLabel,
  statusLabel,
  createdLabel,
  cancelledLabel,
}: {
  status: BookingStatus;
  createdAtLabel: string;
  /** `BookingStatus` -> translated short label (`t.accountActivity.status*`), shared with `BookingStatusForm`. */
  statusLabel: Record<BookingStatus, string>;
  createdLabel: string;
  /** Full-sentence "Booking Cancelled" label — deliberately distinct from `statusLabel.CANCELLED`'s short badge word ("Cancelled"), per this timeline's own copy. */
  cancelledLabel: string;
}) {
  if (status === "CANCELLED") {
    return (
      <ol className="flex flex-col gap-0">
        <TimelineStep state="done" label={createdLabel} sublabel={createdAtLabel} isLast={false} />
        <TimelineStep state="cancelled" label={cancelledLabel} isLast />
      </ol>
    );
  }

  const currentIndex = LINEAR_STATUSES.indexOf(status);

  return (
    <ol className="flex flex-col gap-0">
      <TimelineStep state="done" label={createdLabel} sublabel={createdAtLabel} isLast={false} />
      {LINEAR_STATUSES.map((step, index) => (
        <TimelineStep
          key={step}
          state={index < currentIndex ? "done" : index === currentIndex ? "current" : "upcoming"}
          label={statusLabel[step]}
          isLast={index === LINEAR_STATUSES.length - 1}
        />
      ))}
    </ol>
  );
}

function TimelineStep({
  state,
  label,
  sublabel,
  isLast,
}: {
  state: "done" | "current" | "upcoming" | "cancelled";
  label: string;
  sublabel?: string;
  isLast: boolean;
}) {
  return (
    <li className="flex gap-3">
      <div className="flex flex-col items-center">
        <span
          className={
            state === "done"
              ? "flex size-5 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground"
              : state === "current"
                ? "flex size-5 shrink-0 items-center justify-center rounded-full border-2 border-primary bg-background"
                : state === "cancelled"
                  ? "flex size-5 shrink-0 items-center justify-center rounded-full bg-destructive text-white"
                  : "flex size-5 shrink-0 items-center justify-center rounded-full border-2 border-border bg-background"
          }
        >
          {state === "done" ? <Check className="size-3" aria-hidden="true" /> : null}
          {state === "cancelled" ? <span className="size-1.5 rounded-full bg-white" aria-hidden="true" /> : null}
          {state === "current" ? <span className="size-1.5 rounded-full bg-primary" aria-hidden="true" /> : null}
        </span>
        {!isLast ? <span className={state === "done" ? "w-px flex-1 bg-primary" : "w-px flex-1 bg-border"} aria-hidden="true" /> : null}
      </div>
      <div className={isLast ? "flex flex-col gap-0.5 pb-0" : "flex flex-col gap-0.5 pb-5"}>
        <span
          className={
            state === "current"
              ? "text-sm font-semibold text-foreground"
              : state === "cancelled"
                ? "text-sm font-semibold text-destructive"
                : state === "done"
                  ? "text-sm text-foreground"
                  : "text-sm text-muted-foreground"
          }
        >
          {label}
        </span>
        {sublabel ? <span className="text-xs text-muted-foreground">{sublabel}</span> : null}
      </div>
    </li>
  );
}
