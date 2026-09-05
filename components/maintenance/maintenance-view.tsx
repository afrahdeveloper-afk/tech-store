"use client";

import { Gauge, Wrench } from "lucide-react";

import { useLanguage } from "@/components/providers/language-provider";
import { Container } from "@/components/ui/container";
import { H1, Body, Small } from "@/components/ui/typography";

/**
 * The maintenance notice itself — centered, no navigation (there is nothing
 * for it to link to right now: every other customer-facing route is being
 * rewritten to this same page). Reuses the exact Gauge-in-a-tile wordmark
 * lockup `Navbar`/`Footer` already inline (no shared `Logo` component exists
 * yet — see CLAUDE.md's Design System Reference "Logo" note) so the notice
 * still reads as Speed Core, not a generic error screen.
 */
export function MaintenanceView() {
  const { t } = useLanguage();

  return (
    <main className="flex flex-1 items-center justify-center py-16">
      <Container className="flex flex-col items-center gap-6 text-center">
        <span className="flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Gauge className="size-4.5" aria-hidden="true" />
          </span>
          <span className="font-display text-lg font-semibold tracking-tight text-foreground">Speed Core</span>
        </span>

        <span className="flex size-14 items-center justify-center rounded-xl bg-card border border-border text-primary">
          <Wrench className="size-6" aria-hidden="true" />
        </span>

        <div className="flex flex-col gap-2">
          <H1 as="h1" className="text-2xl sm:text-3xl">
            {t.maintenancePage.heading}
          </H1>
          <Body className="max-w-md text-muted-foreground">{t.maintenancePage.description}</Body>
        </div>

        <Small className="text-muted-foreground">{t.maintenancePage.checkBackNote}</Small>
      </Container>
    </main>
  );
}
