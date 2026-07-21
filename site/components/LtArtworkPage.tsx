import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { defaultLocale } from "@/i18n/locales";
import { getArtwork } from "@/lib/content";
import { buildArtworkMetadata, truncate } from "@/lib/seo";
import { PageShell } from "@/components/PageShell";
import { GalleryPage } from "@/components/GalleryPage";

// Shared implementation for every literal-slug page under app/(lt)/ (one
// folder per artwork — see that directory's README for why these can't be
// a single [artworkSlug] dynamic segment: it collides with [locale] at the
// app root, since route groups don't contribute a URL segment, so
// (lt)/[artworkSlug] and [locale] are both "one dynamic segment at the
// root" and Next.js can't tell them apart). Each page.tsx just calls these
// two functions with its own hardcoded slug.
export async function ltArtworkMetadata(slug: string): Promise<Metadata> {
  setRequestLocale(defaultLocale);
  const artwork = getArtwork(defaultLocale, slug);
  if (!artwork) return {};
  return buildArtworkMetadata({
    locale: defaultLocale,
    slug: artwork.slug,
    title: artwork.title,
    description: truncate(artwork.description),
  });
}

export async function LtArtworkPage({ slug }: { slug: string }) {
  setRequestLocale(defaultLocale);
  const artwork = getArtwork(defaultLocale, slug);
  if (!artwork) notFound();

  return (
    <PageShell locale={defaultLocale} page="gallery" artworkSlug={artwork.slug}>
      <GalleryPage locale={defaultLocale} initialSlug={artwork.slug} />
    </PageShell>
  );
}
