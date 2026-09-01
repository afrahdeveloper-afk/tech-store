"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { useLanguage } from "@/components/providers/language-provider";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/shared/reveal";
import { Button } from "@/components/ui/button";
import { Body, Caption, H2 } from "@/components/ui/typography";

export function AboutPreview() {
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
          <Caption className="text-accent">{t.about.eyebrow}</Caption>
          <H2>{t.about.heading}</H2>
          <Body className="text-muted-foreground">{t.about.description}</Body>
          <Button asChild variant="outline" size="lg" className="mt-2 h-10 px-4">
            <Link href="/about">
              {t.about.cta}
              <ArrowRight className="rtl:rotate-180" data-icon="inline-end" aria-hidden="true" />
            </Link>
          </Button>
        </Reveal>
      </Container>
    </section>
  );
}
