export const locales = [
  "lt",
  "en",
  "ru",
  "pl",
  "uk",
  "de",
  "fr",
  "es",
  "pt",
  "it",
  "ja",
  "zh",
  "ko",
] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "lt";

// Served unprefixed via the app/(lt) route group — see plan/qr-locked-urls.md
// for why lt cannot live under a /lt/ prefix. Every other locale is served
// under app/[locale] instead.
export const prefixedLocales = locales.filter(
  (locale) => locale !== defaultLocale
);
