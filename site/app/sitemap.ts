import type { MetadataRoute } from "next";
import { locales } from "@/i18n/locales";
import { pathFor, type PageKey } from "@/lib/routes";
import { SITE_URL } from "@/lib/seo";

// Required under output: 'export' — without it, next build fails collecting
// page data for this route (confirmed empirically).
export const dynamic = "force-static";

// Only pages that actually exist today (YG-5) — gallery/book pages land in
// YG-6/YG-7 and should be added here once those tickets build real routes,
// not before (a sitemap entry for a page that 404s is worse than no entry).
const EXISTING_PAGES: PageKey[] = ["home", "history", "visiting", "support"];

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];

  for (const page of EXISTING_PAGES) {
    const languages: Record<string, string> = {};
    for (const locale of locales) {
      languages[locale] = `${SITE_URL}${pathFor(page, locale)}`;
    }

    for (const locale of locales) {
      entries.push({
        url: `${SITE_URL}${pathFor(page, locale)}`,
        alternates: { languages },
      });
    }
  }

  return entries;
}
