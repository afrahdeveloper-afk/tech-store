"use client";

import Image from "next/image";

import { useLanguage } from "@/components/providers/language-provider";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/shared/reveal";
import { Caption, H2, Body } from "@/components/ui/typography";

/**
 * "About Speed Core" — the two-column overview section. Reuses
 * `about-workbench.svg`, the same illustration `AboutPreview` shows on the
 * homepage teaser (no dedicated About-page asset exists — see Step 7 of the
 * About page audit; adding a new one wasn't warranted for one section).
 */
export function AboutOverview() {
  const { t } = useLanguage();

  return (
    <section className="py-14 sm:py-18 lg:py-20">
      <Container className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
        <Reveal className="order-2 lg:order-1">
          <Image
            src="/images/about-workbench.svg"
            alt=""
            width={560}
            height={420}
            className="h-auto w-full max-w-md lg:max-w-none"
          />
        </Reveal>

        <Reveal className="order-1 flex flex-col items-start gap-4 lg:order-2">
          <Caption className="text-accent">{t.aboutPage.overviewEyebrow}</Caption>
          <H2>{t.aboutPage.overviewHeading}</H2>
          <Body className="text-muted-foreground">{t.aboutPage.overviewParagraph1}</Body>
          <Body className="text-muted-foreground">{t.aboutPage.overviewParagraph2}</Body>
        </Reveal>
      </Container>
    </section>
  );
}
