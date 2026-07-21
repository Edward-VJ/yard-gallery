"use client";

import { useState } from "react";
import Link from "next/link";
import type { Locale } from "@/i18n/locales";
import { pathFor, type PageKey } from "@/lib/routes";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { ThemeToggle } from "./ThemeToggle";

export function MobileNav({
  locale,
  page,
  artworkSlug,
  navItems,
}: {
  locale: Locale;
  page: PageKey;
  artworkSlug?: string;
  navItems: { key: PageKey; label: string }[];
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative xl:hidden">
      <button
        type="button"
        aria-expanded={open}
        aria-label={open ? "Close menu" : "Open menu"}
        onClick={() => setOpen((o) => !o)}
        className="flex h-9 w-9 flex-col items-center justify-center gap-[5px] rounded border border-[var(--color-border)]"
      >
        <span className="block h-[1.5px] w-5 bg-[var(--color-foreground)]" />
        <span className="block h-[1.5px] w-5 bg-[var(--color-foreground)]" />
        <span className="block h-[1.5px] w-5 bg-[var(--color-foreground)]" />
      </button>

      {open && (
        <div className="absolute right-0 top-full z-40 mt-3 flex w-64 max-w-[80vw] flex-col gap-4 rounded border border-[var(--color-border)] bg-[var(--color-surface)] px-6 py-6 shadow-lg">
          {navItems.map(({ key, label }) => (
            <Link
              key={key}
              href={pathFor(key, locale)}
              onClick={() => setOpen(false)}
              aria-current={page === key ? "page" : undefined}
              className={`label-caps label-caps-header ${
                page === key ? "text-[var(--color-accent)]" : "text-[var(--color-foreground)]"
              }`}
            >
              {label}
            </Link>
          ))}
          <div className="flex items-center gap-3 border-t border-[var(--color-border)] pt-4">
            <ThemeToggle />
            <LanguageSwitcher locale={locale} page={page} artworkSlug={artworkSlug} />
          </div>
        </div>
      )}
    </div>
  );
}
