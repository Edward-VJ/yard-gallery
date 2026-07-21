import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { defaultLocale } from "@/i18n/locales";
import { buildMetadata, truncate } from "@/lib/seo";
import { PageShell } from "@/components/PageShell";
import { SupportPage } from "@/components/SupportPage";

export async function generateMetadata(): Promise<Metadata> {
  setRequestLocale(defaultLocale);
  const t = await getTranslations("support");
  return buildMetadata({
    locale: defaultLocale,
    page: "support",
    title: t("title"),
    description: truncate(t("body")),
  });
}

export default async function LtSupportPage() {
  setRequestLocale(defaultLocale);
  return (
    <PageShell locale={defaultLocale} page="support">
      <SupportPage />
    </PageShell>
  );
}
