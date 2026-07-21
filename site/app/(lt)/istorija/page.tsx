import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { defaultLocale } from "@/i18n/locales";
import { buildMetadata, truncate } from "@/lib/seo";
import { PageShell } from "@/components/PageShell";
import { HistoryPage } from "@/components/HistoryPage";

export async function generateMetadata(): Promise<Metadata> {
  setRequestLocale(defaultLocale);
  const t = await getTranslations("history");
  return buildMetadata({
    locale: defaultLocale,
    page: "history",
    title: t("title"),
    description: truncate(t("intro")),
  });
}

export default async function LtHistoryPage() {
  setRequestLocale(defaultLocale);
  return (
    <PageShell locale={defaultLocale} page="history">
      <HistoryPage />
    </PageShell>
  );
}
