# yard-gallery

Rebuild of [yard.gallery](https://yard.gallery) (Kiemo Galerija — an open-air street-art gallery in a historic courtyard in Kaunas, Lithuania) as a free, static, multilingual site, replacing the current WordPress install.

## Stack

Next.js 16.2 (App Router, `output: 'export'`, static) · Tailwind CSS 4 (CSS-first `@theme` config) · next-intl 4.13 · Node.js 24. See `CLAUDE.md` for the full rundown of pinned versions and architectural decisions.

## Dev commands

All commands run from `site/`:

```
npm run dev      # local dev server
npm run build    # static export to site/out/
npm run lint     # eslint
```

## Deploy target

Cloudflare Pages, free tier. Framework preset **"Next.js (Static HTML Export)"**, build command `npx next build` (run from `site/`), output directory `site/out`.

## Project tracking

Detailed planning/tickets live in a separate private companion repo, `yard-gallery-plan` — not here. This repo only holds what the build and test suite actually need at runtime:

- [`content/qr-locked-urls.md`](./content/qr-locked-urls.md) — **read before touching any routing.** Physical, laser-cut QR codes in the courtyard encode exact Lithuanian URLs that cannot change. These are already public on the live WordPress site, so there's no reason to keep this file private — the test suite reads it directly.

`references/` holds UI inspiration (not shipped code).

## Status

Scaffold (Next.js + split routing tree + CI) done as of 2026-07-20. Next up: scraping the live site.
