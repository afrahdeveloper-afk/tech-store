"use client";

import Link from "next/link";
import { ArrowRight, BadgeCheck } from "lucide-react";

import { useLanguage } from "@/components/providers/language-provider";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Caption, Display, Body } from "@/components/ui/typography";
import { HeroVisual } from "@/components/hero/hero-visual";

/**
 * First-screen hero. Client Component for translated copy (see
 * `language-provider.tsx`); the entrance animation is a plain CSS
 * `animate-in`-style fade+slide on mount (no scroll trigger needed — it's
 * already in view on load) and respects `prefers-reduced-motion` via the
 * `motion-safe:` variant.
 */
export function Hero() {
  const { t } = useLanguage();

  return (
    <section className="relative overflow-hidden">
      <Container className="grid items-center gap-10 py-14 sm:py-18 lg:grid-cols-2 lg:gap-12 lg:py-24">
        <div className="motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-3 flex flex-col items-start gap-6 motion-safe:duration-700">
          <Caption className="text-accent">{t.hero.eyebrow}</Caption>
          <Display className="text-start">
            {t.hero.headline}{" "}
            <span className="text-primary">{t.hero.headlineAccent}</span>
          </Display>
          <Body className="max-w-lg text-muted-foreground">{t.hero.description}</Body>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg" className="h-11 px-5 text-sm">
              <Link href="/products">
                {t.hero.ctaPrimary}
                <ArrowRight className="rtl:rotate-180" data-icon="inline-end" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="h-11 px-5 text-sm">
              <Link href="/booking">{t.hero.ctaSecondary}</Link>
            </Button>
          </div>

          <ul className="flex flex-wrap gap-x-5 gap-y-2 pt-2">
            {t.hero.chips.map((chip) => (
              <li key={chip} className="flex items-center gap-1.5 text-muted-foreground">
                <BadgeCheck className="size-4 text-accent" aria-hidden="true" />
                <span className="text-sm">{chip}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="motion-safe:animate-in motion-safe:fade-in motion-safe:zoom-in-95 relative mx-auto w-full max-w-md motion-safe:duration-700 lg:max-w-none">
          <HeroVisual />
        </div>
      </Container>
    </section>
  );
}
