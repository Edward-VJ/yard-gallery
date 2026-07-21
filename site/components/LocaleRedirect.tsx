"use client";

import { useEffect } from "react";
import { locales, defaultLocale, type Locale } from "@/i18n/locales";
import { equivalentPath, type PageKey } from "@/lib/routes";
import { LOCALE_STORAGE_KEY } from "./LanguageSwitcher";

// Applies YG-4's "default = browser Accept-Language, fallback lt" rule.
// Runs once per page load, client-side only (no server exists under static
// export). Two cases:
//  1. A stored preference exists and differs from the current locale ->
//     the visitor chose a language before (maybe on a different QR-scanned
//     page) and landed somewhere else since; follow them to their choice.
//  2. No stored preference AND we're on the (lt) tree (the only place a
//     fresh visitor lands unprefixed) -> try the browser's language list
//     once, fall back to staying on lt if nothing matches.
// Never redirects away from an explicit choice already reflected by the
// current locale, and never loops (setting localStorage happens before nav).
export function LocaleRedirect({
  locale,
  page,
  artworkSlug,
}: {
  locale: Locale;
  page: PageKey;
  artworkSlug?: string;
}) {
  useEffect(() => {
    if (typeof window === "undefined") return;
    let stored: string | null = null;
    try {
      stored = window.localStorage.getItem(LOCALE_STORAGE_KEY);
    } catch {
      return;
    }

    if (stored && (locales as readonly string[]).includes(stored) && stored !== locale) {
      window.location.href = equivalentPath(page, stored as Locale, artworkSlug);
      return;
    }

    if (!stored && locale === defaultLocale) {
      const browserLocales = navigator.languages?.length
        ? navigator.languages
        : [navigator.language];
      const match = browserLocales
        .map((l) => l.split("-")[0].toLowerCase())
        .find((l) => (locales as readonly string[]).includes(l) && l !== defaultLocale);
      if (match) {
        try {
          window.localStorage.setItem(LOCALE_STORAGE_KEY, match);
        } catch {
          // Can't persist -> would re-detect every visit, which is fine,
          // just proceed with the one-time redirect below.
        }
        window.location.href = equivalentPath(page, match as Locale, artworkSlug);
      }
    }
  }, [locale, page, artworkSlug]);

  return null;
}
