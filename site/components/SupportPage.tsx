import { getTranslations } from "next-intl/server";
import { SITE_CONFIG } from "@/lib/content";

export async function SupportPage() {
  const t = await getTranslations("support");
  const footer = await getTranslations("footer");

  return (
    <main>
      <section className="mx-auto max-w-3xl px-6 pb-6 pt-14 text-center lg:px-12">
        <h1 className="font-serif text-4xl italic tracking-tight text-[var(--color-brand)] md:text-5xl">
          {t("title")}
        </h1>
      </section>

      <section className="mx-auto max-w-3xl px-6 py-6 lg:px-12">
        <p className="text-lg leading-relaxed text-[var(--color-foreground)]">{t("body")}</p>
      </section>

      <section className="flex justify-center px-6 py-10">
        <a href={SITE_CONFIG.paypalUrl} target="_blank" rel="noreferrer noopener" className="donate-button">
          {footer("donate")} · PayPal
        </a>
      </section>
    </main>
  );
}
