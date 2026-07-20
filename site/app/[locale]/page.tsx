import { setRequestLocale, getTranslations } from "next-intl/server";
import { prefixedLocales, type Locale } from "@/i18n/locales";

export function generateStaticParams() {
  return prefixedLocales.map((locale) => ({ locale }));
}

export default async function LocaleHomePage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("home");

  return (
    <main>
      <p>{t("title")}</p>
    </main>
  );
}
