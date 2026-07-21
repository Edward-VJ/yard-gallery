import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { defaultLocale } from "@/i18n/locales";
import { buildMetadata, truncate } from "@/lib/seo";
import { PageShell } from "@/components/PageShell";
import { HomePage } from "@/components/HomePage";

export async function generateMetadata(): Promise<Metadata> {
  setRequestLocale(defaultLocale);
  const t = await getTranslations("home");
  return buildMetadata({
    locale: defaultLocale,
    page: "home",
    title: t("title"),
    description: truncate(t("intro")),
  });
}

export default async function LtHomePage() {
  setRequestLocale(defaultLocale);
  return (
    <PageShell locale={defaultLocale} page="home">
      <HomePage locale={defaultLocale} />
    </PageShell>
  );
}
