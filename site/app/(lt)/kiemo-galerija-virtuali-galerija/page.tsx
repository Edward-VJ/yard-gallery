import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { defaultLocale } from "@/i18n/locales";
import { buildMetadata, truncate } from "@/lib/seo";
import { PageShell } from "@/components/PageShell";
import { GalleryPage } from "@/components/GalleryPage";

export async function generateMetadata(): Promise<Metadata> {
  setRequestLocale(defaultLocale);
  const t = await getTranslations("gallery");
  return buildMetadata({
    locale: defaultLocale,
    page: "gallery",
    title: t("title"),
    description: truncate(t("intro")),
  });
}

export default async function LtGalleryPage() {
  setRequestLocale(defaultLocale);
  return (
    <PageShell locale={defaultLocale} page="gallery">
      <GalleryPage locale={defaultLocale} />
    </PageShell>
  );
}
