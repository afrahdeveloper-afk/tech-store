"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import type { OrderStatus } from "@/lib/generated/prisma/enums";
import { ORDER_TRANSITIONS } from "@/lib/order-status";
import { updateOrderStatus } from "@/app/admin/(dashboard)/orders/actions";
import { useLanguage } from "@/components/providers/language-provider";
import { useToast } from "@/components/providers/toast-provider";
import { StatusBadge } from "@/components/account/status-badge";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

/**
 * Named, per-transition action buttons for the Admin Order status editor —
 * "Confirm Order" / "Ship Order" / "Confirm Delivery" / "Cancel Order",
 * instead of a generic status `<select>`, so the next allowed step is
 * immediately obvious rather than requiring the admin to already know the
 * workflow to pick the right dropdown option. Every button is derived
 * directly from `ORDER_TRANSITIONS[status]` (`lib/order-status.ts`, the same
 * single source of truth the Server Action re-validates against) via
 * `ACTION_CONFIG` below — never a hand-maintained parallel list that could
 * drift and let the UI imply a transition the server would reject.
 *
 * Terminal states (`DELIVERED`/`CANCELLED`) render a static, non-actionable
 * notice — `ORDER_TRANSITIONS` returns `[]` for both, so no buttons render
 * for either, honestly reflecting there being no further legal transition.
 */

const ACTION_CONFIG: Partial<Record<OrderStatus, { labelKey: "actionConfirmOrder" | "actionShipOrder" | "actionConfirmDelivery" | "actionCancelOrder"; variant: "default" | "destructive" }>> = {
  CONFIRMED: { labelKey: "actionConfirmOrder", variant: "default" },
  SHIPPED: { labelKey: "actionShipOrder", variant: "default" },
  DELIVERED: { labelKey: "actionConfirmDelivery", variant: "default" },
  CANCELLED: { labelKey: "actionCancelOrder", variant: "destructive" },
};

export function OrderStatusForm({ orderId, status }: { orderId: string; status: OrderStatus }) {
  const { t } = useLanguage();
  const { toast } = useToast();
  const router = useRouter();

  const [pendingNext, setPendingNext] = React.useState<OrderStatus | null>(null);
  const [submitting, setSubmitting] = React.useState(false);

  const statusLabel: Record<OrderStatus, string> = {
    PENDING: t.accountActivity.statusPending,
    CONFIRMED: t.accountActivity.statusConfirmed,
    SHIPPED: t.accountActivity.statusShipped,
    DELIVERED: t.accountActivity.statusDelivered,
    CANCELLED: t.accountActivity.statusCancelled,
  };

  const actions = ORDER_TRANSITIONS[status]
    .map((next) => {
      const config = ACTION_CONFIG[next];
      return config ? { next, label: t.adminOrders[config.labelKey], variant: config.variant } : null;
    })
    .filter((action): action is { next: OrderStatus; label: string; variant: "default" | "destructive" } => action !== null);

  async function applyStatus(next: OrderStatus) {
    setSubmitting(true);
    const result = await updateOrderStatus(orderId, next);
    setSubmitting(false);
    setPendingNext(null);

    if (result.success) {
      toast({ title: t.adminForm.statusUpdateSuccessTitle, variant: "success" });
      router.refresh();
    } else {
      toast({ title: t.adminForm.mutationErrorTitle, description: t.adminForm.errorServer, variant: "error" });
    }
  }

  const isCancelling = pendingNext === "CANCELLED";

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">{t.adminOrders.currentStatusLabel}:</span>
        <StatusBadge status={status} />
      </div>

      {actions.length === 0 ? (
        <p className="text-sm font-medium text-foreground">
          {status === "DELIVERED" ? t.adminOrders.deliveredNotice : t.adminOrders.cancelledNotice}
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{t.adminOrders.updateStatusHeading}</p>
          <div className="flex flex-wrap gap-2">
            {actions.map((action) => (
              <Button
                key={action.next}
                type="button"
                variant={action.variant}
                disabled={submitting}
                onClick={() => setPendingNext(action.next)}
              >
                {action.label}
              </Button>
            ))}
          </div>
        </div>
      )}

      <AlertDialog open={pendingNext !== null} onOpenChange={(open) => !open && !submitting && setPendingNext(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{isCancelling ? t.adminOrders.cancelOrderDialogTitle : t.adminOrders.updateStatusHeading}</AlertDialogTitle>
            <AlertDialogDescription>
              {isCancelling
                ? t.adminOrders.cancelOrderDialogDescription
                : t.adminOrders.updateStatusDialogDescription
                    .replace("{from}", statusLabel[status])
                    .replace("{to}", pendingNext ? statusLabel[pendingNext] : "")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={submitting}>{isCancelling ? t.adminOrders.dialogBackLabel : t.adminForm.cancel}</AlertDialogCancel>
            <AlertDialogAction
              variant={isCancelling ? "destructive" : "default"}
              disabled={submitting}
              onClick={(event) => {
                event.preventDefault();
                if (pendingNext) applyStatus(pendingNext);
              }}
            >
              {submitting ? (
                <>
                  <Loader2 data-icon="inline-start" className="animate-spin" aria-hidden="true" />
                  {t.adminForm.saving}
                </>
              ) : isCancelling ? (
                t.adminOrders.actionCancelOrder
              ) : (
                t.adminOrders.updateStatusConfirmAction
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
