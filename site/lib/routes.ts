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
