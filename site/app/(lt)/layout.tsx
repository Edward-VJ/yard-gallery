import type { Metadata } from "next";
import "../globals.css";

export const metadata: Metadata = {
  title: "Kiemo Galerija",
};

// Root layout for Lithuanian, served unprefixed at the site root.
// See plan/qr-locked-urls.md (yard-gallery-plan repo) for why this can't
// live under a /lt/ prefix like the other locales in app/[locale].
export default function LtRootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="lt">
      <body>{children}</body>
    </html>
  );
}
