"use client";

import type { OrderStatus, BookingStatus } from "@/lib/generated/prisma/enums";
import { useLanguage } from "@/components/providers/language-provider";
import { Badge, type badgeVariants } from "@/components/ui/badge";
import type { VariantProps } from "class-variance-authority";

type Status = OrderStatus | BookingStatus;
type BadgeVariant = VariantProps<typeof badgeVariants>["variant"];

/**
 * Maps the real Prisma `OrderStatus`/`BookingStatus` enum values to a
 * translated label + existing `Badge` variant — no new statuses invented,
 * no new colors (per the Customer Account phase's Status UI rules). Both
 * enums share `PENDING`/`CONFIRMED`/`CANCELLED`; `SHIPPED`/`DELIVERED` are
 * order-only and `COMPLETED` is booking-only, so one shared map covers both.
 */
const VARIANT_BY_STATUS: Record<Status, BadgeVariant> = {
  PENDING: "warning",
  CONFIRMED: "accent",
  SHIPPED: "accent",
  DELIVERED: "success",
  COMPLETED: "success",
  CANCELLED: "error",
};

export function StatusBadge({ status }: { status: Status }) {
  const { t } = useLanguage();

  const labelByStatus: Record<Status, string> = {
    PENDING: t.accountActivity.statusPending,
    CONFIRMED: t.accountActivity.statusConfirmed,
    SHIPPED: t.accountActivity.statusShipped,
    DELIVERED: t.accountActivity.statusDelivered,
    COMPLETED: t.accountActivity.statusCompleted,
    CANCELLED: t.accountActivity.statusCancelled,
  };

  return <Badge variant={VARIANT_BY_STATUS[status]}>{labelByStatus[status]}</Badge>;
}
