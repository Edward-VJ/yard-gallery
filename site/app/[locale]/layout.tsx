import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { prefixedLocales } from "@/i18n/locales";
import { typewriter } from "@/lib/fonts";
import { ThemeInitScript } from "@/components/ThemeInitScript";
import "../globals.css";

export function generateStaticParams() {
  return prefixedLocales.map((locale) => ({ locale }));
}

export const metadata: Metadata = {
  title: "Kiemo Galerija",
};

// Root layout for every locale EXCEPT Lithuanian, served under /xx/...
// Lithuanian is served unprefixed by app/(lt) instead — see
// plan/qr-locked-urls.md (yard-gallery-plan repo) for why.
// Header/Footer are composed per-page via <PageShell>, not here — see
// components/PageShell.tsx for why.
export default async function LocaleRootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  if (!(prefixedLocales as readonly string[]).includes(locale)) {
    notFound();
  }
  setRequestLocale(locale);

  return (
    <html lang={locale} className={typewriter.variable} suppressHydrationWarning>
      <head>
        <ThemeInitScript />
      </head>
      <body>{children}</body>
    </html>
  );
}
