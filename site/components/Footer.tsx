import { getTranslations } from "next-intl/server";
import { SITE_CONFIG } from "@/lib/content";

export async function Footer() {
  const t = await getTranslations("footer");

  return (
    <footer className="border-t border-[var(--color-border)] bg-[var(--color-footer)]">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-6 py-10 text-center lg:px-12">
        <p className="font-serif italic text-[var(--color-footer-foreground)]">Kiemo Galerija</p>
        <div className="label-caps flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[var(--color-footer-foreground)]">
          <a href={`mailto:${SITE_CONFIG.contactEmail}`} className="hover:text-[var(--color-accent-secondary)]">
            {SITE_CONFIG.contactEmail}
          </a>
          <a
            href={SITE_CONFIG.paypalUrl}
            target="_blank"
            rel="noreferrer noopener"
            className="hover:text-[var(--color-accent-secondary)]"
          >
            {t("donate")}
          </a>
        </div>
      </div>
    </footer>
  );
}
