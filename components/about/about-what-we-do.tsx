"use client";

import { Camera, Database, LifeBuoy, Package, Wifi, Wrench } from "lucide-react";

import { useLanguage } from "@/components/providers/language-provider";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/shared/section-heading";
import { Reveal } from "@/components/shared/reveal";
import { H3 } from "@/components/ui/typography";

// Indexed to `aboutPage.whatWeDoItems` — same pairing pattern as
// `WhyChooseUs`'s `ICONS` array, since this content is page copy (not
// serializable mock data) and can import icons directly.
const ICONS = [Package, Wrench, LifeBuoy, Wifi, Database, Camera];

export function AboutWhatWeDo() {
  const { t } = useLanguage();

  return (
    <section className="py-14 sm:py-18 lg:py-20">
      <Container className="flex flex-col gap-10">
        <SectionHeading
          eyebrow={t.aboutPage.whatWeDoEyebrow}
          heading={t.aboutPage.whatWeDoHeading}
          description={t.aboutPage.whatWeDoDescription}
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {t.aboutPage.whatWeDoItems.map((item, index) => {
            const Icon = ICONS[index % ICONS.length];
            return (
              <Reveal key={item.title} delayMs={index * 50}>
                <div className="flex h-full flex-col gap-3 rounded-xl border border-border bg-card p-5">
                  <span className="flex size-11 items-center justify-center rounded-lg bg-muted text-primary">
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
