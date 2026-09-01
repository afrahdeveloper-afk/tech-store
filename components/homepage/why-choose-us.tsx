"use client";

import { BadgeCheck, Clock, ShieldCheck, Wrench } from "lucide-react";

import { useLanguage } from "@/components/providers/language-provider";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/shared/section-heading";
import { Reveal } from "@/components/shared/reveal";
import { H3 } from "@/components/ui/typography";

const ICONS = [ShieldCheck, BadgeCheck, Wrench, Clock];

export function WhyChooseUs() {
  const { t } = useLanguage();

  return (
    <section className="py-14 sm:py-18 lg:py-20">
      <Container className="flex flex-col gap-10">
        <SectionHeading
          eyebrow={t.whyChooseUs.eyebrow}
          heading={t.whyChooseUs.heading}
          description={t.whyChooseUs.description}
          align="center"
          className="mx-auto"
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {t.whyChooseUs.items.map((item, index) => {
            const Icon = ICONS[index % ICONS.length];
            return (
              <Reveal key={item.title} delayMs={index * 60}>
                <div className="flex h-full flex-col items-center gap-3 rounded-xl border border-border bg-card p-6 text-center">
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
