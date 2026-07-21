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

// Each language written in its own tongue, per YG-4 step 7's language
// switcher spec — used by the header dropdown, not translated further.
export const localeLabels: Record<Locale, string> = {
  lt: "Lietuvių",
  en: "English",
  ru: "Русский",
  pl: "Polski",
  uk: "Українська",
  de: "Deutsch",
  fr: "Français",
  es: "Español",
  pt: "Português",
  it: "Italiano",
  ja: "日本語",
  zh: "中文",
  ko: "한국어",
};
