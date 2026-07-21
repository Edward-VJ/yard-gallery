import Link from "next/link";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { pathFor } from "@/lib/routes";
import { PageShell } from "@/components/PageShell";

// Rendered when a valid /xx/ locale segment matches but nothing beneath it
// does — shared across all 12 prefixed locales. not-found.tsx doesn't
// receive the route's params (per Next.js's own file convention), so there
// is no way to know which of the 12 it actually was without reading
// headers(), which static export doesn't allow. English is the fallback:
// not perfectly localized, but a defensible universal default over
// showing nothing or breaking the build. setRequestLocale is required here
// for the same reason as the (lt) tree's not-found.tsx — this file
// bypasses page.tsx, so nothing else establishes locale context for
// Header/Footer's own translation calls, and without it they fall back to
// header-based detection, which static export doesn't allow either.
const FALLBACK_LOCALE = "en";

export default async function LocaleNotFound() {
  setRequestLocale(FALLBACK_LOCALE);
  const t = await getTranslations("notFound");
  return (
    <PageShell locale={FALLBACK_LOCALE} page="home">
      <main className="mx-auto flex max-w-2xl flex-col items-center px-6 py-32 text-center lg:px-12">
        <h1 className="font-serif text-4xl italic tracking-tight text-[var(--color-brand)] md:text-5xl">
          {t("title")}
        </h1>
        <p className="mt-6 text-lg leading-relaxed text-[var(--color-foreground)]">{t("body")}</p>
        <Link href={pathFor("home", FALLBACK_LOCALE)} className="donate-button mt-10">
          {t("cta")}
        </Link>
      </main>
    </PageShell>
  );
}
