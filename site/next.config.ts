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
  experimental: {
    // Needed to get our own branded content into out/404.html — with two
    // root layouts ((lt) and [locale], see YG-1), Next has no single root
    // layout to compose a default 404 from, so per-segment not-found.tsx
    // files never reach the static 404.html a host like Cloudflare Pages
    // actually serves for a dead link (confirmed: without this, out/404.html
    // contained Next's generic "This page could not be found" instead of
    // our own text). This is Next's own documented fix for exactly this
    // "multiple root layouts" case.
    globalNotFound: true,
  },
};

export default withNextIntl(nextConfig);
