import Link from "next/link";
import { getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n/locales";
import { pathFor } from "@/lib/routes";
import { SITE_CONFIG } from "@/lib/content";
import { ArtImage } from "./ArtImage";
import { AnimatedHero } from "./AnimatedHero";

const HERO_IMAGE = "image_2024-08-31_183725770.png"; // yard.gallery's own homepage banner (Cover block)

// Same photos as the original homepage's tiled gallery block
// (raw/pages/index.html), in the same order — a handful of the referenced
// filenames were never successfully scraped (broken links even on the live
// site) and are skipped rather than substituted.
const MINI_GALLERY = [
  "blue-house-1-2.jpg",
  "black-house-1-2.jpg",
  "black-house-2.jpg",
  "brothers.jpg",
  "cat-2-3.jpg",
  "clown-with-camera-2.jpg",
  "garden-pretty-1.jpg",
  "dream-tailor-shop-3-2.jpg",
  "holly-trinity-1.jpg",
  "kids-1.png",
  "lev.jpg",
  "little-prince-3-2.jpg",
  "mirror-flowers-5-1.jpg",
  "mirror-flowers-6-2.jpg",
  "mirror-flowers-7.jpg",
  "mrs-kazimiera-portrait-2.jpg",
  "petriuko-2.jpg",
  "safe-neighborhood-3-grannies-1.jpg",
  "safe-neighborhood-3-grannies-2.jpg.png",
  "straw-garden-3-2.jpg",
  "saulius-shoes-4.jpg",
  "wedding-clothes-2.jpg",
  "white-house-2-2.jpg",
  "white-house-pretty.jpg",
];

export async function HomePage({ locale }: { locale: Locale }) {
  const t = await getTranslations("home");
  const nav = await getTranslations("nav");
  const footer = await getTranslations("footer");
  const paragraphs = t("intro").split("\n\n");

  return (
    <main>
      {/*
        Hero — scroll-driven "bento grid" reveal ported from the Evasion
        template (source zip the human provided): the banner photo shrinks
        and 4 highlight photos slide in from the sides as you scroll. See
        components/AnimatedHero.tsx.
      */}
      <AnimatedHero title={t("title")} eyebrow="Kaunas, Lietuva" heroImage={HERO_IMAGE} />

      {/*
        Welcome text — pulled up over the tail end of the hero's scroll
        runway (that space is just empty background color, not image
        content), leaving about one line's worth of breathing room before
        the text instead of sitting flush against the photos. The center
        hero photo is vertically centered within its box (not stretched to
        fill it), so the empty space below it scales with viewport height —
        pulling up needs a vh unit, not a fixed px/rem.
      */}
      <section className="relative -mt-[35vh] mx-auto max-w-3xl px-6 py-14 text-center lg:px-12">
        {paragraphs.map((p, i) => (
          <p key={i} className="mb-6 text-lg leading-relaxed text-[var(--color-foreground)] last:mb-0">
            {p}
          </p>
        ))}
      </section>

      {/* Big donate CTA — same placement/style as the original homepage. */}
      <section className="flex justify-center px-6 py-4">
        <a href={SITE_CONFIG.paypalUrl} target="_blank" rel="noreferrer noopener" className="donate-button">
          {footer("donate")} · PayPal
        </a>
      </section>

      <section className="mx-auto flex max-w-3xl flex-wrap items-center justify-center gap-x-3 gap-y-2 px-6 py-8 text-center lg:px-12">
        <Link href={pathFor("gallery", locale)} className="label-caps text-[var(--color-foreground)] hover:text-[var(--color-accent)]">
          {nav("gallery")}
        </Link>
        <span className="text-[var(--color-muted)]">|</span>
        <Link href={pathFor("history", locale)} className="label-caps text-[var(--color-foreground)] hover:text-[var(--color-accent)]">
          {nav("history")}
        </Link>
        <span className="text-[var(--color-muted)]">|</span>
        <Link href={pathFor("visiting", locale)} className="label-caps text-[var(--color-foreground)] hover:text-[var(--color-accent)]">
          {nav("visiting")}
        </Link>
      </section>

      {/*
        Full mini gallery — same photos, same order, as the original
        homepage's tiled gallery block. CSS columns (not a uniform grid) so
        each photo keeps its own aspect ratio and packs into a mosaic, same
        visual character as the original Jetpack tiled-gallery layout.
      */}
      <section className="mb-16 columns-3 gap-1.5 px-1.5 sm:columns-4 sm:gap-2 sm:px-2 lg:columns-6">
        {MINI_GALLERY.map((filename) => (
          <ArtImage key={filename} filename={filename} alt="" sizes="(min-width: 1024px) 16vw, (min-width: 640px) 25vw, 33vw" className="mb-1.5 break-inside-avoid sm:mb-2" />
        ))}
      </section>
    </main>
  );
}
