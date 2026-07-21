import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { prefixedLocales, type Locale } from "@/i18n/locales";
import { buildMetadata, truncate } from "@/lib/seo";
import { PageShell } from "@/components/PageShell";
import { SupportPage } from "@/components/SupportPage";

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
  const t = await getTranslations("support");
  return buildMetadata({
    locale,
    page: "support",
    title: t("title"),
    description: truncate(t("body")),
  });
}

export default async function LocaleSupportPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <PageShell locale={locale} page="support">
      <SupportPage />
    </PageShell>
  );
}
