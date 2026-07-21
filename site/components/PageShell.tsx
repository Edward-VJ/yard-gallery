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
  children,
}: {
  locale: Locale;
  page: PageKey;
  children: React.ReactNode;
}) {
  return (
    <>
      <Header locale={locale} page={page} />
      {children}
      <Footer />
    </>
  );
}
