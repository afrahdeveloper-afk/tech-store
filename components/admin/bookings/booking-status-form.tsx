"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import type { BookingStatus } from "@/lib/generated/prisma/enums";
import { BOOKING_TRANSITIONS } from "@/lib/booking-status";
import { updateBookingStatus } from "@/app/admin/(dashboard)/bookings/actions";
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
 * Named, per-transition action buttons for the Admin Booking status editor —
 * structurally the same approach as `components/admin/orders/order-status-
 * form.tsx` (see that file's header comment for why named buttons replace a
 * generic status `<select>`), with one deliberate addition Orders doesn't
 * need: reaching `COMPLETED` gets its own, more deliberate confirmation
 * copy ("Complete Service — are you sure the maintenance/service has been
 * completed?") instead of the generic "change status from X to Y" wording,
 * since marking a booking complete is the admin attesting that real-world
 * work actually happened — never inferred from `preferredDate`/
 * `preferredTime`, which this component never reads.
 *
 * Every button/dialog is still driven by `BOOKING_TRANSITIONS[status]`
 * (`lib/booking-status.ts`, the same single source of truth the Server
 * Action re-validates against) via `ACTION_CONFIG` below — never a
 * hand-maintained parallel list — so the UI structurally cannot offer a
 * transition the server would reject.
 *
 * Terminal states (`COMPLETED`/`CANCELLED`) render a static, non-actionable
 * notice — `BOOKING_TRANSITIONS` returns `[]` for both, so no buttons
 * render, honestly reflecting there being no further legal transition.
 */

type DialogKind = "confirm" | "complete" | "cancel";

const ACTION_CONFIG: Partial<
  Record<BookingStatus, { labelKey: "actionConfirmBooking" | "actionCompleteService" | "actionCancelBooking"; variant: "default" | "destructive"; dialog: DialogKind }>
> = {
  CONFIRMED: { labelKey: "actionConfirmBooking", variant: "default", dialog: "confirm" },
  COMPLETED: { labelKey: "actionCompleteService", variant: "default", dialog: "complete" },
  CANCELLED: { labelKey: "actionCancelBooking", variant: "destructive", dialog: "cancel" },
};

export function BookingStatusForm({ bookingId, status }: { bookingId: string; status: BookingStatus }) {
  const { t } = useLanguage();
  const { toast } = useToast();
  const router = useRouter();

  const [pendingNext, setPendingNext] = React.useState<BookingStatus | null>(null);
  const [submitting, setSubmitting] = React.useState(false);

  const statusLabel: Record<BookingStatus, string> = {
    PENDING: t.accountActivity.statusPending,
    CONFIRMED: t.accountActivity.statusConfirmed,
    COMPLETED: t.accountActivity.statusCompleted,
    CANCELLED: t.accountActivity.statusCancelled,
  };

  const actions = BOOKING_TRANSITIONS[status]
    .map((next) => {
      const config = ACTION_CONFIG[next];
      return config ? { next, label: t.adminBookings[config.labelKey], variant: config.variant, dialog: config.dialog } : null;
    })
    .filter((action): action is { next: BookingStatus; label: string; variant: "default" | "destructive"; dialog: DialogKind } => action !== null);

  async function applyStatus(next: BookingStatus) {
    setSubmitting(true);
    const result = await updateBookingStatus(bookingId, next);
    setSubmitting(false);
    setPendingNext(null);

    if (result.success) {
      toast({ title: t.adminForm.statusUpdateSuccessTitle, variant: "success" });
      router.refresh();
    } else {
      toast({ title: t.adminForm.mutationErrorTitle, description: t.adminForm.errorServer, variant: "error" });
    }
  }

  const pendingDialog = pendingNext ? ACTION_CONFIG[pendingNext]?.dialog ?? "confirm" : "confirm";

  const dialogTitle =
    pendingDialog === "cancel"
      ? t.adminBookings.cancelBookingDialogTitle
      : pendingDialog === "complete"
        ? t.adminBookings.completeServiceDialogTitle
        : t.adminBookings.confirmBookingDialogTitle;

  const dialogDescription =
    pendingDialog === "cancel"
      ? t.adminBookings.cancelBookingDialogDescription
      : pendingDialog === "complete"
        ? t.adminBookings.completeServiceDialogDescription
        : t.adminBookings.updateStatusDialogDescription.replace("{from}", statusLabel[status]).replace("{to}", pendingNext ? statusLabel[pendingNext] : "");

  const confirmActionLabel =
    pendingDialog === "cancel"
      ? t.adminBookings.actionCancelBooking
      : pendingDialog === "complete"
        ? t.adminBookings.completeServiceConfirmAction
        : t.adminBookings.updateStatusConfirmAction;

  // Routine confirm dialog uses the generic "Cancel" (matches the spec's
  // [إلغاء] button for the Confirm Booking dialog); the more consequential
  // Complete/Cancel dialogs use the dedicated "Back" label instead.
  const backLabel = pendingDialog === "confirm" ? t.adminForm.cancel : t.adminBookings.dialogBackLabel;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">{t.adminBookings.currentStatusLabel}:</span>
        <StatusBadge status={status} />
      </div>

      {actions.length === 0 ? (
        <p className="text-sm font-medium text-foreground">
          {status === "COMPLETED" ? t.adminBookings.completedNotice : t.adminBookings.cancelledNotice}
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{t.adminBookings.updateStatusHeading}</p>
          <div className="flex flex-wrap gap-2">
            {actions.map((action) => (
              <Button key={action.next} type="button" variant={action.variant} disabled={submitting} onClick={() => setPendingNext(action.next)}>
                {action.label}
              </Button>
            ))}
          </div>
        </div>
      )}

      <AlertDialog open={pendingNext !== null} onOpenChange={(open) => !open && !submitting && setPendingNext(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{dialogTitle}</AlertDialogTitle>
            <AlertDialogDescription>{dialogDescription}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={submitting}>{backLabel}</AlertDialogCancel>
            <AlertDialogAction
              variant={pendingDialog === "cancel" ? "destructive" : "default"}
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
              ) : (
                confirmActionLabel
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
