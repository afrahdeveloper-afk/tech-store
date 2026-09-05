"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, Pencil, Trash2 } from "lucide-react";

import { useLanguage } from "@/components/providers/language-provider";
import { useToast } from "@/components/providers/toast-provider";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const iconButtonClassName =
  "flex size-9 items-center justify-center rounded-md text-muted-foreground transition hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring motion-safe:active:scale-[0.97]";

/**
 * The Edit link + Delete (with an `AlertDialog` confirmation) pair shared by
 * every CRUD module's table row (Products, Service Categories, Subservices,
 * Services) — one implementation instead of four near-identical copies.
 * `onDelete` is the module's own Server Action bound to this row's id; this
 * component only owns the confirm/loading/toast/refresh choreography around
 * it, mirroring how `product-form.tsx` calls `createProduct`/`updateProduct`
 * directly as a Server Action from a Client Component.
 */
export function RowActions({
  editHref,
  editLabel,
  deleteLabel,
  confirmTitle,
  confirmDescription,
  successTitle,
  onDelete,
}: {
  editHref: string;
  editLabel: string;
  deleteLabel: string;
  confirmTitle: string;
  confirmDescription: string;
  successTitle: string;
  onDelete: () => Promise<{ success: boolean; error?: string }>;
}) {
  const { t } = useLanguage();
  const { toast } = useToast();
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);

  async function handleDelete() {
    setDeleting(true);
    const result = await onDelete();
    setDeleting(false);

    if (result.success) {
      setOpen(false);
      toast({ title: successTitle, variant: "success" });
      router.refresh();
    } else {
      toast({ title: t.adminForm.mutationErrorTitle, description: result.error ?? t.adminForm.errorServer, variant: "error" });
    }
  }

  return (
    <div className="flex items-center justify-end gap-1">
      <Link href={editHref} aria-label={editLabel} className={iconButtonClassName}>
        <Pencil className="size-4" aria-hidden="true" />
      </Link>

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogTrigger asChild>
          <button type="button" aria-label={deleteLabel} className={iconButtonClassName}>
            <Trash2 className="size-4" aria-hidden="true" />
          </button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{confirmTitle}</AlertDialogTitle>
            <AlertDialogDescription>{confirmDescription}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t.adminForm.cancel}</AlertDialogCancel>
            <AlertDialogAction
              disabled={deleting}
              onClick={(event) => {
                event.preventDefault();
                handleDelete();
              }}
            >
              {deleting ? (
                <>
                  <Loader2 data-icon="inline-start" className="animate-spin" aria-hidden="true" />
                  {t.adminForm.deleting}
                </>
              ) : (
                t.adminForm.deleteConfirmAction
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
