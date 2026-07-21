import type { Metadata } from "next";
import { typewriter } from "@/lib/fonts";
import { ThemeInitScript } from "@/components/ThemeInitScript";
import "../globals.css";

export const metadata: Metadata = {
  title: "Kiemo Galerija",
};

// Root layout for Lithuanian, served unprefixed at the site root.
// See plan/qr-locked-urls.md (yard-gallery-plan repo) for why this can't
// live under a /lt/ prefix like the other locales in app/[locale].
// Header/Footer are composed per-page via <PageShell>, not here — see
// components/PageShell.tsx for why.
export default function LtRootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="lt" className={typewriter.variable} suppressHydrationWarning>
      <head>
        <ThemeInitScript />
      </head>
      <body>{children}</body>
    </html>
  );
}
