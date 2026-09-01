"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { mockProducts } from "@/lib/mock/products";
import { useLanguage } from "@/components/providers/language-provider";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/shared/section-heading";
import { Reveal } from "@/components/shared/reveal";
import { ProductCard } from "./product-card";

export function FeaturedProducts() {
  const { t, lang } = useLanguage();

  return (
    <section className="bg-muted/40 py-14 sm:py-18 lg:py-20">
      <Container className="flex flex-col gap-10">
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
          <SectionHeading
            eyebrow={t.products.eyebrow}
            heading={t.products.heading}
            description={t.products.description}
          />
          <Link
            href="/products"
            className="flex shrink-0 items-center gap-1.5 text-sm font-medium text-accent hover:underline"
          >
            {t.products.viewAll}
            <ArrowRight className="size-4 rtl:rotate-180" aria-hidden="true" />
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {mockProducts.map((product, index) => (
            <Reveal key={product.id} delayMs={index * 60}>
              <ProductCard product={product} lang={lang} t={t} />
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
