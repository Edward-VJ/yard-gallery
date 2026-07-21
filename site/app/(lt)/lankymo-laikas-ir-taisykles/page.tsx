import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { defaultLocale } from "@/i18n/locales";
import { buildMetadata, truncate } from "@/lib/seo";
import { PageShell } from "@/components/PageShell";
import { VisitingPage } from "@/components/VisitingPage";

export async function generateMetadata(): Promise<Metadata> {
  setRequestLocale(defaultLocale);
  const t = await getTranslations("visiting");
  return buildMetadata({
    locale: defaultLocale,
    page: "visiting",
    title: t("title"),
    description: truncate(t("body")),
  });
}

export default async function LtVisitingPage() {
  setRequestLocale(defaultLocale);
  return (
    <PageShell locale={defaultLocale} page="visiting">
      <VisitingPage />
    </PageShell>
  );
}
