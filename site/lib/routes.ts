import { defaultLocale, type Locale } from "@/i18n/locales";

// lt paths are exact and QR-locked (content/qr-locked-urls.md, repo root) —
// never change these without re-checking that file first.
const LT_PATHS = {
  home: "/",
  history: "/istorija/",
  visiting: "/lankymo-laikas-ir-taisykles/",
  gallery: "/kiemo-galerija-virtuali-galerija/",
  book: "/sunkus-paminklai/",
  support: "/support/", // not QR-locked — shape is free, see YG-5
} as const;

export type PageKey = keyof typeof LT_PATHS;

// Other locales are prefixed with an unconstrained shape — no QR code
// encodes them, so any consistent slug is fine.
const OTHER_SLUGS: Record<PageKey, string> = {
  home: "",
  history: "history",
  visiting: "visiting",
  gallery: "gallery",
  book: "book",
  support: "support",
};

export function pathFor(page: PageKey, locale: Locale): string {
  if (locale === defaultLocale) return LT_PATHS[page];
  const slug = OTHER_SLUGS[page];
  return slug ? `/${locale}/${slug}/` : `/${locale}/`;
}

// Individual artwork pages (YG-6): lt is a bare top-level slug matching the
// exact QR-locked path (content/qr-locked-urls.md) — e.g. /nijoles-katinas/,
// NOT /kiemo-galerija-virtuali-galerija/nijoles-katinas/. Other locales
// nest under their own gallery path since there's no QR constraint there.
export function pathForArtwork(slug: string, locale: Locale): string {
  if (locale === defaultLocale) return `/${slug}/`;
  return `/${locale}/gallery/${slug}/`;
}

// The language switcher and the browser-language auto-redirect both need
// "what's the equivalent page in a different locale" — for a specific
// artwork, that's pathForArtwork, not the generic gallery hub. Without
// this, switching language (or the very first auto-redirect a visitor with
// a non-lt browser gets) drops a QR-scanning visitor from the specific
// artwork they landed on straight to the gallery hub instead.
export function equivalentPath(page: PageKey, locale: Locale, artworkSlug?: string): string {
  if (artworkSlug) return pathForArtwork(artworkSlug, locale);
  return pathFor(page, locale);
}
