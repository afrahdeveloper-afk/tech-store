"use client";

import { Check, X } from "lucide-react";

import type { OrderStatus, BookingStatus } from "@/lib/generated/prisma/enums";
import { useLanguage } from "@/components/providers/language-provider";
import { cn } from "@/lib/utils";
import { H2 } from "@/components/ui/typography";

/**
 * Order/booking detail pages' visual progress indicator — built strictly
 * from the real `OrderStatus`/`BookingStatus` Prisma enums (see CLAUDE.md's
 * Customer Account phase note): no "Processing"/"In Progress" step exists
 * because those values don't exist in the schema. `CANCELLED` is a terminal
 * outcome outside the linear track, not a 5th/4th step, since a cancelled
 * order/booking didn't "pass through" the remaining steps.
 */
const ORDER_STEPS: OrderStatus[] = ["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED"];
const BOOKING_STEPS: BookingStatus[] = ["PENDING", "CONFIRMED", "COMPLETED"];

type Props = { kind: "order"; status: OrderStatus } | { kind: "booking"; status: BookingStatus };

export function StatusTimeline(props: Props) {
  const { t } = useLanguage();
  const steps = props.kind === "order" ? ORDER_STEPS : BOOKING_STEPS;
  const heading = props.kind === "order" ? t.statusTimeline.orderHeading : t.statusTimeline.bookingHeading;
  const isCancelled = props.status === "CANCELLED";
  const currentIndex = isCancelled ? -1 : (steps as string[]).indexOf(props.status);

  const labelByStatus: Record<string, string> = {
    PENDING: t.accountActivity.statusPending,
    CONFIRMED: t.accountActivity.statusConfirmed,
    SHIPPED: t.accountActivity.statusShipped,
    DELIVERED: t.accountActivity.statusDelivered,
    COMPLETED: t.accountActivity.statusCompleted,
  };

  const headingId = `status-timeline-heading-${props.kind}`;

  return (
    <div className="flex flex-col gap-4">
      <H2 as="h2" id={headingId} className="text-lg">
        {heading}
      </H2>

      {isCancelled ? (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <X className="size-4 shrink-0" aria-hidden="true" />
          <span>{t.statusTimeline.cancelledNotice}</span>
        </div>
      ) : (
        <ol aria-labelledby={headingId} className="flex items-start">
          {steps.map((step, index) => {
            const done = index < currentIndex;
            const current = index === currentIndex;
            const leadingConnectorFilled = index <= currentIndex;
            const trailingConnectorFilled = index < currentIndex;
            const stepState = done ? t.statusTimeline.stepStatusDone : current ? t.statusTimeline.stepStatusCurrent : t.statusTimeline.stepStatusUpcoming;

            return (
              <li
                key={step}
                aria-current={current ? "step" : undefined}
                className="flex flex-1 flex-col items-center gap-2 text-center last:flex-none"
              >
                <div className="flex w-full items-center">
                  {index > 0 ? (
                    <span
                      aria-hidden="true"
                      className={cn("h-0.5 flex-1", leadingConnectorFilled ? "bg-primary" : "bg-border")}
                    />
                  ) : null}
                  <span
                    className={cn(
                      "flex size-7 shrink-0 items-center justify-center rounded-full border-2 text-xs font-semibold",
                      done && "border-primary bg-primary text-primary-foreground",
                      current && "border-primary bg-background text-primary",
                      !done && !current && "border-border bg-background text-muted-foreground"
                    )}
                  >
                    {done ? <Check className="size-3.5" aria-hidden="true" /> : index + 1}
                  </span>
                  {index < steps.length - 1 ? (
                    <span
                      aria-hidden="true"
                      className={cn("h-0.5 flex-1", trailingConnectorFilled ? "bg-primary" : "bg-border")}
                    />
                  ) : null}
                </div>
                <span className={cn("text-xs leading-snug", current ? "font-semibold text-foreground" : "text-muted-foreground")}>
                  {labelByStatus[step]}
                  <span className="sr-only"> ({stepState})</span>
                </span>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
