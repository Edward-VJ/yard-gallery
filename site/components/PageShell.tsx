import type { Locale } from "@/i18n/locales";
import type { PageKey } from "@/lib/routes";
import { Header } from "./Header";
import { Footer } from "./Footer";

// Composed per-page (not in the root layout) because Header/LocaleRedirect
// need to know which page is currently rendering — the (lt) and [locale]
// root layouts are shared across every page in their tree, so they can't
// carry a single hardcoded `page` value.
export function PageShell({
  locale,
  page,
  artworkSlug,
  children,
}: {
  locale: Locale;
  page: PageKey;
  // Set only on an individual artwork page (YG-6) — lets the language
  // switcher/auto-redirect send you to the SAME artwork in another locale
  // instead of just the gallery hub. See lib/routes.ts's equivalentPath.
  artworkSlug?: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <Header locale={locale} page={page} artworkSlug={artworkSlug} />
      {children}
      <Footer />
    </>
  );
}
