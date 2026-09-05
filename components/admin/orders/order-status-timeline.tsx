import { Check } from "lucide-react";

import type { OrderStatus } from "@/lib/generated/prisma/enums";

/**
 * Vertical status timeline for the Order Detail page — "Order Created" is
 * always the first, always-complete step (an `Order` row only exists once
 * Checkout succeeded), followed by the four `OrderStatus` steps in their
 * fixed linear order. A step is complete/current/upcoming purely by
 * comparing its position to the current status's position in that fixed
 * order — since `PENDING→CONFIRMED→SHIPPED→DELIVERED` is the only forward
 * path (`lib/order-status.ts`), reaching e.g. `SHIPPED` necessarily means
 * `PENDING`/`CONFIRMED` were already passed through, so this is safe to
 * infer without a separate status-history table.
 *
 * `CANCELLED` has no fixed position in that path (an order can be
 * cancelled from `PENDING` or `CONFIRMED`, and nothing in the schema
 * records *which* one it was cancelled from — no status-history table
 * exists) — rather than guess, a cancelled order renders "Order Created"
 * done and then a single red "Cancelled" step, honestly omitting the
 * middle steps instead of fabricating which ones it passed through.
 */

const LINEAR_STATUSES: OrderStatus[] = ["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED"];

export function OrderStatusTimeline({
  status,
  createdAtLabel,
  statusLabel,
  createdLabel,
}: {
  status: OrderStatus;
  createdAtLabel: string;
  /** `OrderStatus` -> translated label (`t.accountActivity.status*`), shared with `OrderStatusForm`. */
  statusLabel: Record<OrderStatus, string>;
  createdLabel: string;
}) {
  if (status === "CANCELLED") {
    return (
      <ol className="flex flex-col gap-0">
        <TimelineStep state="done" label={createdLabel} sublabel={createdAtLabel} isLast={false} />
        <TimelineStep state="cancelled" label={statusLabel.CANCELLED} isLast />
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
