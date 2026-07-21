import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { prefixedLocales, type Locale } from "@/i18n/locales";
import { buildMetadata, truncate } from "@/lib/seo";
import { PageShell } from "@/components/PageShell";
import { VisitingPage } from "@/components/VisitingPage";

export function generateStaticParams() {
  return prefixedLocales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("visiting");
  return buildMetadata({
    locale,
    page: "visiting",
    title: t("title"),
    description: truncate(t("body")),
  });
}

export default async function LocaleVisitingPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <PageShell locale={locale} page="visiting">
      <VisitingPage />
    </PageShell>
  );
}
