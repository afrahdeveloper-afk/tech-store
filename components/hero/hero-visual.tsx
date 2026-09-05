"use client";

import * as React from "react";
import Image from "next/image";
import { Laptop } from "lucide-react";

import { useLanguage } from "@/components/providers/language-provider";
import { usePrefersReducedMotion } from "@/lib/hooks/use-media-query";
import { Hero3DErrorBoundary } from "@/components/hero/hero-3d-error-boundary";

type Hero3DLaptopComponent = React.ComponentType<{ reducedMotion: boolean }>;

function HeroStaticImage() {
  return (
    <Image src="/images/hero.svg" alt="" width={640} height={560} priority className="h-auto w-full" />
  );
}

/** Neutral "3D content is loading" placeholder — deliberately not the static illustration (see file doc comment). */
function Hero3DSkeleton({ label }: { label: string }) {
  return (
    <div
      role="status"
      aria-label={label}
      className="flex h-full w-full items-center justify-center rounded-2xl border border-border bg-card"
    >
      <Laptop className="size-12 animate-pulse text-muted-foreground" aria-hidden="true" />
    </div>
  );
}

/**
 * The hero's visual slot.
 *
 * Which branch shows is decided by plain CSS (`lg:hidden` / `hidden
 * lg:block`), not a JS `useMediaQuery` check — both branches are in the
 * server-rendered HTML from the start, so the correct one is visible from
 * the very first paint, on every load including a hard reload, with no
 * hydration wait. (An earlier version gated this in JS; that meant every
 * reload showed the static illustration first — matching the server's
 * always-mobile snapshot — before flipping to the desktop branch a moment
 * after hydration. Real desktop visitors would notice their own hero
 * flash the "wrong" content on every reload.)
 *
 * Mobile/tablet gets the static `hero.svg` illustration, full stop — no 3D
 * cost.
 *
 * `lg` and up gets an interactive 3D laptop (`hero-3d-laptop.tsx`, built
 * from primitive geometry in the brand palette), loaded via a manual
 * `import()` inside an effect (not `next/dynamic`) so a loading layer and
 * the eventual 3D layer can coexist and crossfade rather than hard-cutting
 * from one to the other. `three`/`@react-three/fiber` still never reach a
 * mobile/tablet visitor — the `import()` is itself gated on
 * `window.matchMedia`, matching the CSS breakpoint above, matching
 * CLAUDE.md's "minimal JavaScript" / "minimal dependencies" performance
 * rules on the single most LCP-sensitive section of the site.
 *
 * While that chunk loads, and only there, the placeholder is a neutral
 * `Hero3DSkeleton` — not the static illustration a second time. Showing
 * "the old picture" as the loading state was the actual visible symptom
 * being fixed here: it read as "wrong image, then the real one," not an
 * intentional loading state. The static illustration still appears
 * (crossfaded, not swapped) in exactly one desktop case: the load itself
 * fails (`Hero3DErrorBoundary`'s `fallback`) — a real WebGL failure, where
 * showing the flat illustration is the correct honest fallback, not a
 * placeholder to avoid.
 */
export function HeroVisual() {
  const reducedMotion = usePrefersReducedMotion();
  const { t } = useLanguage();
  const [Laptop3D, setLaptop3D] = React.useState<Hero3DLaptopComponent | null>(null);
  const [revealed, setRevealed] = React.useState(false);

  React.useEffect(() => {
    if (!window.matchMedia("(min-width: 1024px)").matches) return;
    let cancelled = false;
    import("@/components/hero/hero-3d-laptop").then((mod) => {
      if (!cancelled) setLaptop3D(() => mod.default);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // A separate effect/tick from the one that sets `Laptop3D`, so the 3D
  // layer's first paint really does commit at opacity-0 before flipping to
  // opacity-100 — flipping both in the same state update would let the
  // browser coalesce them into one paint, skipping the transition entirely.
  React.useEffect(() => {
    if (!Laptop3D) return;
    const raf = requestAnimationFrame(() => setRevealed(true));
    return () => cancelAnimationFrame(raf);
  }, [Laptop3D]);

  return (
    <>
      <div className="lg:hidden">
        <HeroStaticImage />
      </div>

      <div className="relative hidden aspect-[8/7] w-full lg:block">
        <div
          className={`absolute inset-0 motion-safe:transition-opacity motion-safe:duration-700 ${revealed ? "opacity-0" : "opacity-100"}`}
        >
          <Hero3DSkeleton label={t.hero.loading3d} />
        </div>
        {Laptop3D && (
          <div
            className={`absolute inset-0 motion-safe:transition-opacity motion-safe:duration-700 ${revealed ? "opacity-100" : "opacity-0"}`}
          >
            <Hero3DErrorBoundary fallback={<HeroStaticImage />}>
              <Laptop3D reducedMotion={reducedMotion} />
            </Hero3DErrorBoundary>
          </div>
        )}
      </div>
    </>
  );
}
