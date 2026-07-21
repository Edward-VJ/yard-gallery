import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { prefixedLocales, defaultLocale, type Locale } from "@/i18n/locales";
import { getArtworks, getArtwork } from "@/lib/content";
import { buildArtworkMetadata, truncate } from "@/lib/seo";
import { PageShell } from "@/components/PageShell";
import { GalleryPage } from "@/components/GalleryPage";

export function generateStaticParams() {
  const slugs = getArtworks(defaultLocale).map((a) => a.slug);
  return prefixedLocales.flatMap((locale) => slugs.map((slug) => ({ locale, slug })));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const artwork = getArtwork(locale, slug);
  if (!artwork) return {};
  return buildArtworkMetadata({
    locale,
    slug: artwork.slug,
    title: artwork.title,
    description: truncate(artwork.description),
  });
}

export default async function LocaleArtworkPage({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const artwork = getArtwork(locale, slug);
  if (!artwork) notFound();

  return (
    <PageShell locale={locale} page="gallery" artworkSlug={artwork.slug}>
      <GalleryPage locale={locale} initialSlug={artwork.slug} />
    </PageShell>
  );
}
