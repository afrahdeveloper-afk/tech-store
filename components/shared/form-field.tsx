"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/typography";

/**
 * Labeled input + inline validation error, shared by the Checkout and
 * Booking forms (identical markup in both — factored out rather than
 * duplicated, per CLAUDE.md's "Avoid duplicate logic").
 */
export function FormField({
  id,
  label,
  value,
  onChange,
  error,
  type = "text",
  placeholder,
  autoComplete,
  dir,
  min,
  maxLength,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  type?: string;
  placeholder?: string;
  autoComplete?: string;
  dir?: "ltr" | "rtl";
  min?: string;
  /** UX-only hint (native `maxLength`) — never the source of truth; the matching Server Action re-validates length itself (see `lib/validation.ts`). */
  maxLength?: number;
}) {
  const errorId = `${id}-error`;
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        dir={dir}
        min={min}
        maxLength={maxLength}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
      />
      {error ? (
        <p id={errorId} role="alert" className="motion-safe:animate-in motion-safe:fade-in motion-safe:duration-150 text-xs text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}
