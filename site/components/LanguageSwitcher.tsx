"use client";

import { locales, localeLabels, type Locale } from "@/i18n/locales";
import { equivalentPath, type PageKey } from "@/lib/routes";

export const LOCALE_STORAGE_KEY = "kg-locale";

export function LanguageSwitcher({
  locale,
  page,
  artworkSlug,
}: {
  locale: Locale;
  page: PageKey;
  artworkSlug?: string;
}) {
  function handleChange(next: Locale) {
    try {
      window.localStorage.setItem(LOCALE_STORAGE_KEY, next);
    } catch {
      // localStorage unavailable (private browsing etc) — switching still works,
      // it just won't be remembered for the next visit.
    }
    window.location.href = equivalentPath(page, next, artworkSlug);
  }

  return (
    <select
      name="locale"
      aria-label="Language / Kalba"
      value={locale}
      onChange={(e) => handleChange(e.target.value as Locale)}
      className="label-caps label-caps-header w-full min-w-0 max-w-44 cursor-pointer truncate rounded border border-[var(--color-border)] bg-transparent px-2 py-1 text-[var(--color-foreground)] lg:w-40"
    >
      {locales.map((l) => (
        <option key={l} value={l}>
          {localeLabels[l]}
        </option>
      ))}
    </select>
  );
}
