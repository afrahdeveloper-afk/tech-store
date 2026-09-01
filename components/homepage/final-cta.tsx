"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { useLanguage } from "@/components/providers/language-provider";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/shared/reveal";
import { Button } from "@/components/ui/button";
import { Body, H2 } from "@/components/ui/typography";

export function FinalCta() {
  const { t } = useLanguage();

  return (
    <section className="py-14 sm:py-18 lg:py-20">
      <Container>
        <Reveal className="flex flex-col items-center gap-5 rounded-2xl border border-primary/20 bg-secondary px-6 py-14 text-center sm:px-12">
          <H2>{t.finalCta.heading}</H2>
          <Body className="max-w-lg text-muted-foreground">{t.finalCta.description}</Body>
          <div className="mt-2 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg" className="h-11 px-5 text-sm">
              <Link href="/products">
                {t.finalCta.ctaPrimary}
                <ArrowRight className="rtl:rotate-180" data-icon="inline-end" aria-hidden="true" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-11 px-5 text-sm">
              <Link href="/booking">{t.finalCta.ctaSecondary}</Link>
            </Button>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
