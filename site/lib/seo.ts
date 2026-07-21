import type { Metadata } from "next";
import { locales, defaultLocale, type Locale } from "@/i18n/locales";
import { pathFor, type PageKey } from "./routes";

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
