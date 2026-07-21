import Link from "next/link";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { defaultLocale } from "@/i18n/locales";
import { pathFor } from "@/lib/routes";
import { PageShell } from "@/components/PageShell";

// setRequestLocale is required here (not just implied by the route group) —
// not-found.tsx bypasses page.tsx entirely, so the setRequestLocale call
// every page.tsx normally makes never runs for this render. Without it,
// Header/Footer's own getTranslations() calls have no locale in ambient
// context and fall back to header-based detection, which next.js's static
// export doesn't allow (build fails with a "used headers()" error).
export default async function LtNotFound() {
  setRequestLocale(defaultLocale);
  const t = await getTranslations("notFound");
  return (
    <PageShell locale={defaultLocale} page="home">
      <main className="mx-auto flex max-w-2xl flex-col items-center px-6 py-32 text-center lg:px-12">
        <h1 className="font-serif text-4xl italic tracking-tight text-[var(--color-brand)] md:text-5xl">
          {t("title")}
        </h1>
        <p className="mt-6 text-lg leading-relaxed text-[var(--color-foreground)]">{t("body")}</p>
        <Link href={pathFor("home", defaultLocale)} className="donate-button mt-10">
          {t("cta")}
        </Link>
      </main>
    </PageShell>
  );
}
