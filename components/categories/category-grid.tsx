"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { mockCategories } from "@/lib/mock/categories";
import { useLanguage } from "@/components/providers/language-provider";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/shared/section-heading";
import { Reveal } from "@/components/shared/reveal";
import { CategoryCard } from "./category-card";

export function CategoryGrid() {
  const { t, lang } = useLanguage();

  return (
    <section className="py-14 sm:py-18 lg:py-20">
      <Container className="flex flex-col gap-10">
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
          <SectionHeading
            eyebrow={t.categories.eyebrow}
            heading={t.categories.heading}
            description={t.categories.description}
          />
          <Link
            href="/products"
            className="flex shrink-0 items-center gap-1.5 text-sm font-medium text-accent hover:underline"
          >
            {t.categories.viewAll}
            <ArrowRight className="size-4 rtl:rotate-180" aria-hidden="true" />
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {mockCategories.map((category, index) => (
            <Reveal key={category.id} delayMs={index * 60}>
              <CategoryCard
                category={category}
                name={lang === "ar" ? category.nameAr ?? category.name : category.name}
              />
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
