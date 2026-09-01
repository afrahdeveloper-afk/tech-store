import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * Typography primitives implementing the hierarchy defined in CLAUDE.md
 * (Display / H1 / H2 / H3 / Body / Small / Caption / Label). See the
 * "Design System Reference" section there for the type scale and the
 * Space Grotesk / Geist Sans / IBM Plex Sans Arabic pairing rationale.
 *
 * Visual size is decoupled from the semantic tag: pass `as` to render a
 * different element than the default without changing the look (e.g. a
 * `Display` used as a page's actual `h1`, or an `H2` rendered as a `div`).
 */

type HeadingTag = "h1" | "h2" | "h3" | "h4";
type TextTag = "p" | "span" | "div";

interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  as?: HeadingTag;
  ref?: React.Ref<HTMLHeadingElement>;
}

interface TextProps extends React.HTMLAttributes<HTMLElement> {
  as?: TextTag;
}

export function Display({ as: Tag = "h1", className, ref, ...props }: HeadingProps) {
  return (
    <Tag
      ref={ref}
      className={cn(
        "font-display text-4xl font-semibold leading-[1.05] tracking-tight text-foreground sm:text-5xl lg:text-6xl",
        className
      )}
      {...props}
    />
  );
}

export function H1({ as: Tag = "h1", className, ref, ...props }: HeadingProps) {
  return (
    <Tag
      ref={ref}
      className={cn(
        "font-display text-3xl font-semibold leading-[1.1] tracking-tight text-foreground sm:text-4xl",
        className
      )}
      {...props}
    />
  );
}

export function H2({ as: Tag = "h2", className, ref, ...props }: HeadingProps) {
  return (
    <Tag
      ref={ref}
      className={cn(
        "font-display text-2xl font-semibold leading-[1.2] tracking-tight text-foreground sm:text-3xl",
        className
      )}
      {...props}
    />
  );
}

export function H3({ as: Tag = "h3", className, ref, ...props }: HeadingProps) {
  return (
    <Tag
      ref={ref}
      className={cn(
        "font-display text-xl font-semibold leading-[1.3] tracking-tight text-foreground sm:text-2xl",
        className
      )}
      {...props}
    />
  );
}

export function Body({ as: Tag = "p", className, ...props }: TextProps) {
  return (
    <Tag
      className={cn("font-sans text-base leading-relaxed text-foreground", className)}
      {...props}
    />
  );
}

export function Small({ as: Tag = "p", className, ...props }: TextProps) {
  return (
    <Tag
      className={cn("font-sans text-sm leading-normal text-foreground", className)}
      {...props}
    />
  );
}

export function Caption({ as: Tag = "span", className, ...props }: TextProps) {
  return (
    <Tag
      className={cn(
        "font-sans text-xs leading-snug tracking-wide text-muted-foreground uppercase",
        className
      )}
      {...props}
    />
  );
}

export function Label({
  className,
  ...props
}: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn(
        "font-sans text-[0.8125rem] leading-tight font-medium tracking-wide text-foreground",
        className
      )}
      {...props}
    />
  );
}
