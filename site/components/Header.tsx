import Link from "next/link";
import { getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n/locales";
import { pathFor, type PageKey } from "@/lib/routes";
import { SITE_CONFIG } from "@/lib/content";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { LocaleRedirect } from "./LocaleRedirect";
import { MobileNav } from "./MobileNav";
import { ThemeToggle } from "./ThemeToggle";

const NAV_ITEMS: { key: PageKey; messageKey: string }[] = [
  { key: "home", messageKey: "home" },
  { key: "history", messageKey: "history" },
  { key: "gallery", messageKey: "gallery" },
  { key: "book", messageKey: "book" },
  { key: "visiting", messageKey: "visiting" },
];

export async function Header({ locale, page }: { locale: Locale; page: PageKey }) {
  const t = await getTranslations("nav");
  const footer = await getTranslations("footer");
  const resolvedNavItems = NAV_ITEMS.map(({ key, messageKey }) => ({
    key,
    label: t(messageKey),
  }));

  return (
    <>
      <LocaleRedirect locale={locale} page={page} />
      <header className="sticky top-0 z-50 border-b border-[var(--color-border)] bg-[var(--color-surface)]/95 backdrop-blur-sm">
        {/*
          Full-bleed, not centered to a max-width column — logo sits at the
          true left edge, switcher/hamburger at the true right edge.
        */}
        <div className="flex items-center justify-between gap-4 px-6 py-6 sm:px-8 lg:px-12">
          {/*
            Icon + stacked "Kiemo Galerija" / donate lockup — clock mark and
            pink title match the original site's header exactly. The donate
            line used to hardcode "Paaukoti | Donate" (both languages at
            once) back when the home screen couldn't show a locale-specific
            string; now it just shows the current locale's translation.
          */}
          <div className="flex shrink-0 items-center gap-2.5">
            {/* eslint-disable-next-line @next/next/no-img-element -- static export, plain <img> is simpler than next/image for a small fixed icon */}
            <img src="/icon.png" alt="" className="h-9 w-9 sm:h-11 sm:w-11" />
            <div className="flex flex-col leading-tight">
              <Link
                href={pathFor("home", locale)}
                className="font-serif text-[22px] italic tracking-tight text-[var(--color-brand)] sm:text-[25px]"
              >
                Kiemo Galerija
              </Link>
              <a
                href={SITE_CONFIG.paypalUrl}
                target="_blank"
                rel="noreferrer noopener"
                className="label-caps label-caps-header tracking-normal text-[var(--color-accent)] hover:text-[var(--color-accent-secondary)]"
              >
                {footer("donate")}
              </a>
            </div>
          </div>

          {/*
            Each nav item gets a fixed width and is allowed to wrap onto
            two lines (no whitespace-nowrap) — long labels like "Sunkūs
            Paminklai" or "Visiting Hours and Rules" wrap cleanly instead
            of forcing the whole row wider or truncating. That keeps the
            total nav width fixed and predictable across all 13 locales.
          */}
          <nav aria-label="Main navigation" className="hidden items-center gap-x-7 xl:flex">
            {resolvedNavItems.map(({ key, label }) => (
              <Link
                key={key}
                href={pathFor(key, locale)}
                aria-current={page === key ? "page" : undefined}
                className={`label-caps label-caps-header w-36 text-center leading-snug transition-colors duration-300 hover:text-[var(--color-accent)] ${
                  page === key
                    ? "border-b border-[var(--color-accent)] pb-1 text-[var(--color-accent)]"
                    : "text-[var(--color-muted)]"
                }`}
              >
                {label}
              </Link>
            ))}
          </nav>

          <div className="hidden shrink-0 items-center gap-3 xl:flex">
            <ThemeToggle />
            <LanguageSwitcher locale={locale} page={page} />
          </div>

          <MobileNav locale={locale} page={page} navItems={resolvedNavItems} />
        </div>
      </header>
    </>
  );
}
