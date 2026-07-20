import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const nextConfig: NextConfig = {
  output: "export",
  images: {
    unoptimized: true,
  },
  // The physical QR codes (see content/qr-locked-urls.md) encode trailing-slash
  // paths like /nijoles-katinas/ — this makes `next build` emit a real
  // <slug>/index.html directory structure instead of a flat <slug>.html file,
  // so those exact paths resolve on any static host without extra rewrites.
  trailingSlash: true,
};

export default withNextIntl(nextConfig);
