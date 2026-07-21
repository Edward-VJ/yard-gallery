import { getTranslations } from "next-intl/server";
import { getArtworks } from "@/lib/content";
import type { Locale } from "@/i18n/locales";
import { GalleryClient } from "./GalleryClient";

export async function GalleryPage({ locale, initialSlug }: { locale: Locale; initialSlug?: string }) {
  const t = await getTranslations("gallery");
  const artworks = getArtworks(locale);

  return (
    <main>
      <section className="mx-auto max-w-3xl px-6 pb-6 pt-14 text-center lg:px-12">
        <h1 className="font-serif text-4xl italic tracking-tight text-[var(--color-brand)] md:text-5xl">
          {t("title")}
        </h1>
        <p className="mt-6 text-lg leading-relaxed text-[var(--color-foreground)]">{t("intro")}</p>
      </section>

      <GalleryClient artworks={artworks} locale={locale} initialSlug={initialSlug} />
    </main>
  );
}
