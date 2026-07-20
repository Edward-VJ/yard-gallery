import { setRequestLocale, getTranslations } from "next-intl/server";
import { defaultLocale } from "@/i18n/locales";

export default async function LtHomePage() {
  setRequestLocale(defaultLocale);
  const t = await getTranslations("home");

  return (
    <main>
      <p>{t("title")}</p>
    </main>
  );
}
