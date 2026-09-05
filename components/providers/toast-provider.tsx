"use client";

import * as React from "react";
import { Toast as ToastPrimitive } from "radix-ui";
import { CheckCircle2, XCircle } from "lucide-react";

import { cn } from "@/lib/utils";
import { createClientId } from "@/lib/client-id";
import { useLanguage } from "@/components/providers/language-provider";

/**
 * Minimal toast system for Admin mutation feedback (create/update/delete
 * success or failure) — wraps `radix-ui`'s `Toast` namespace (already a
 * dependency via the unified `radix-ui` package, same as `alert-dialog.tsx`).
 * No toast library exists in this project yet and none is warranted for
 * this small a surface (a handful of admin forms), so this is hand-written
 * rather than adding `sonner`/similar.
 *
 * Scoped to the Admin shell only (`app/admin/layout.tsx`) — the storefront
 * has no equivalent need today.
 */

interface ToastItem {
  id: string;
  title: string;
  description?: string;
  variant: "success" | "error";
}

interface ToastContextValue {
  toast: (item: Omit<ToastItem, "id">) => void;
}

const ToastContext = React.createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const { dir } = useLanguage();
  const [items, setItems] = React.useState<ToastItem[]>([]);

  const toast = React.useCallback((item: Omit<ToastItem, "id">) => {
    const id = createClientId();
    setItems((prev) => [...prev, { ...item, id }]);
  }, []);

  const remove = React.useCallback((id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const value = React.useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      <ToastPrimitive.Provider swipeDirection={dir === "rtl" ? "left" : "right"} duration={5000}>
        {children}
        {items.map((item) => (
          <ToastPrimitive.Root
            key={item.id}
            onOpenChange={(open) => {
              if (!open) remove(item.id);
            }}
            className={cn(
              "motion-safe:data-[state=open]:animate-in motion-safe:data-[state=closed]:animate-out motion-safe:data-[state=closed]:fade-out-0 motion-safe:data-[state=open]:fade-in-0 motion-safe:data-[state=open]:slide-in-from-bottom-2 motion-safe:data-[state=closed]:slide-out-to-bottom-2 motion-safe:duration-200",
              "flex items-start gap-2.5 rounded-lg border border-border bg-card p-4 shadow-xl"
            )}
          >
            {item.variant === "success" ? (
              <CheckCircle2 className="mt-0.5 size-4.5 shrink-0 text-primary" aria-hidden="true" />
            ) : (
              <XCircle className="mt-0.5 size-4.5 shrink-0 text-destructive" aria-hidden="true" />
            )}
            <div className="flex flex-col gap-0.5">
              <ToastPrimitive.Title className="text-sm font-medium text-foreground">{item.title}</ToastPrimitive.Title>
              {item.description ? (
                <ToastPrimitive.Description className="text-xs text-muted-foreground">
                  {item.description}
                </ToastPrimitive.Description>
              ) : null}
            </div>
          </ToastPrimitive.Root>
        ))}
        <ToastPrimitive.Viewport className="fixed bottom-0 end-0 z-[100] flex w-full max-w-sm flex-col gap-2 p-4 outline-none" />
      </ToastPrimitive.Provider>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = React.useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return ctx;
}
