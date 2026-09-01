"use client";

import { Crosshair, Eye, ShieldCheck, TrendingUp } from "lucide-react";

import { useLanguage } from "@/components/providers/language-provider";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/shared/section-heading";
import { Reveal } from "@/components/shared/reveal";
import { H3 } from "@/components/ui/typography";

// Indexed to `aboutPage.valuesItems`. Deliberately borderless/background-free
// (unlike `AboutWhatWeDo`'s cards just above it) so four sections of bordered
// cards in a row don't blur together — see the "keep it concise, avoid a
// large collection of cards" guidance for this section.
const ICONS = [ShieldCheck, Crosshair, Eye, TrendingUp];

export function AboutValues() {
  const { t } = useLanguage();

  return (
    <section className="py-14 sm:py-18 lg:py-20">
      <Container className="flex flex-col gap-10">
        <SectionHeading
          eyebrow={t.aboutPage.valuesEyebrow}
          heading={t.aboutPage.valuesHeading}
          align="center"
          className="mx-auto"
        />

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {t.aboutPage.valuesItems.map((item, index) => {
            const Icon = ICONS[index % ICONS.length];
            return (
              <Reveal key={item.title} delayMs={index * 50}>
                <div className="flex flex-col items-center gap-3 text-center">
                  <span className="flex size-11 items-center justify-center rounded-full bg-accent/10 text-accent">
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  <H3 as="h3" className="text-base font-semibold">
                    {item.title}
                  </H3>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
