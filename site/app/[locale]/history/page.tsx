import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { prefixedLocales, type Locale } from "@/i18n/locales";
import { buildMetadata, truncate } from "@/lib/seo";
import { PageShell } from "@/components/PageShell";
import { HistoryPage } from "@/components/HistoryPage";

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
  const t = await getTranslations("history");
  return buildMetadata({
    locale,
    page: "history",
    title: t("title"),
    description: truncate(t("intro")),
  });
}

export default async function LocaleHistoryPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <PageShell locale={locale} page="history">
      <HistoryPage />
    </PageShell>
  );
}
