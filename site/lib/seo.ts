import type { Metadata } from "next";
import { locales, defaultLocale, type Locale } from "@/i18n/locales";
import { pathFor, pathForArtwork, type PageKey } from "./routes";

export const SITE_URL = "https://yard.gallery";

// Meta descriptions reuse already-translated body copy (trimmed to a
// reasonable length) rather than adding a new "description" message key
// across all 13 locales for text that's otherwise unused.
export function truncate(text: string, maxLength = 155): string {
  const oneLine = text.replace(/\s+/g, " ").trim();
  if (oneLine.length <= maxLength) return oneLine;
  return oneLine.slice(0, maxLength - 1).trimEnd() + "…";
}

export function buildMetadata({
  locale,
  page,
  title,
  description,
}: {
  locale: Locale;
  page: PageKey;
  title: string;
  description: string;
}): Metadata {
  const languages: Record<string, string> = {};
  for (const l of locales) {
    languages[l] = `${SITE_URL}${pathFor(page, l)}`;
  }
  languages["x-default"] = `${SITE_URL}${pathFor(page, defaultLocale)}`;

  const canonical = `${SITE_URL}${pathFor(page, locale)}`;

  return {
    title,
    description,
    alternates: {
      canonical,
      languages,
    },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: "Kiemo Galerija",
      images: [`${SITE_URL}/icon.png`],
      locale,
    },
  };
}

// Same as buildMetadata, but for individual artwork pages (YG-6) — keyed
// by slug rather than PageKey. Artwork slugs are identical across all 13
// locales' content files (only title/description are translated), so the
// same slug works for every hreflang alternate.
export function buildArtworkMetadata({
  locale,
  slug,
  title,
  description,
  image,
}: {
  locale: Locale;
  slug: string;
  title: string;
  description: string;
  image?: string;
}): Metadata {
  const languages: Record<string, string> = {};
  for (const l of locales) {
    languages[l] = `${SITE_URL}${pathForArtwork(slug, l)}`;
  }
  languages["x-default"] = `${SITE_URL}${pathForArtwork(slug, defaultLocale)}`;

  const canonical = `${SITE_URL}${pathForArtwork(slug, locale)}`;

  return {
    title,
    description,
    alternates: {
      canonical,
      languages,
    },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: "Kiemo Galerija",
      images: [image ?? `${SITE_URL}/icon.png`],
      locale,
    },
  };
}
