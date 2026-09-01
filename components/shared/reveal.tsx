"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * Fades + slightly lifts its children in once they scroll into view.
 * Subtle, one-shot (never re-triggers), and skipped entirely for visitors
 * who prefer reduced motion — see the Animation rules in CLAUDE.md ("respect
 * prefers-reduced-motion", "avoid heavy scroll effects").
 *
 * A small client component wrapping otherwise-static markup, justified by
 * needing a browser API (IntersectionObserver) per the Architecture Rules.
 */
export function Reveal({
  children,
  className,
  delayMs = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delayMs?: number;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{ transitionDelay: visible ? `${delayMs}ms` : "0ms" }}
      className={cn(
        "transition-all duration-700 ease-out motion-reduce:translate-y-0 motion-reduce:opacity-100 motion-reduce:transition-none",
        visible ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0",
        className
      )}
    >
      {children}
    </div>
  );
}
